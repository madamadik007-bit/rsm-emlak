const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
});
const b64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const randomToken = () => b64url(crypto.getRandomValues(new Uint8Array(32)));
async function sha256(value) { return b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))); }
async function passwordHash(password, salt, iterations = 100000) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(salt),iterations,hash:"SHA-256"},material,256);
  return b64url(bits);
}
const cookie = (token, maxAge) => `rsm_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
function readCookie(request) {
  const raw=request.headers.get("Cookie")||"";
  const match=raw.match(/(?:^|;\s*)rsm_session=([^;]+)/);
  return match ? match[1] : null;
}
async function currentUser(request, env) {
  const token=readCookie(request); if(!token) return null;
  const hash=await sha256(token);
  const row=await env.DB.prepare("SELECT email FROM sessions WHERE token_hash=? AND expires_at>?").bind(hash,Math.floor(Date.now()/1000)).first();
  return row?.email || null;
}
const TABLES = {
  people:["full_name","national_id","phone","email","address","notes"],
  properties:["title","property_type","province","district","address","block_no","parcel_no","independent_section","owner_person_id","notes"],
  contracts:["title","contract_type","property_id","lessor_person_id","tenant_person_id","guarantor_person_id","signing_date","rent_start_date","end_date","eviction_undertaking_date","monthly_rent","deposit_amount","advance_amount","key_delivery_date","notes"]
};
const required={people:["full_name"],properties:["title"],contracts:["title","contract_type"]};

// Imports only add rows. Original JSON is retained for fields absent in this older UI.
const ARCHIVE_SQL = `CREATE TABLE IF NOT EXISTS import_backups (
 owner_email TEXT NOT NULL, digest TEXT NOT NULL, payload TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(owner_email,digest))`;
async function importBackup(request,env,owner) {
 if(request.headers.get('origin')!==new URL(request.url).origin) return json({error:'Yedek yalnızca uygulamanın kendi ekranından yüklenebilir.'},403);
 const text=await request.text();
 if(new TextEncoder().encode(text).length>4*1024*1024)return json({error:'Yedek 4 MB sınırını aşıyor.'},413);
 let raw;try{raw=JSON.parse(text)}catch{return json({error:'Dosya geçerli JSON değil.'},400)}
 const data=raw?.data??raw;
 if(!data||!Array.isArray(data.people)||!Array.isArray(data.properties)||
 (raw.format!==undefined&&raw.format!=='RSM-EMLAK'))return json({error:'Geçerli bir RSM Emlak yedeği seçin.'},400);
 const kinds=['people','properties','contracts','requests','documents'];
 const incoming={};
 for(const key of kinds){
  const list=data[key]??[];
  if(!Array.isArray(list)||list.length>2000)return json({error:'Geçersiz veya çok büyük kayıt listesi: '+key},400);
  const ids=new Set();
  for(const item of list){if(!item||typeof item!=='object'||typeof item.id!=='string'||!item.id.trim()||item.id.length>200||ids.has(item.id))return json({error:'Eksik veya tekrarlanan kayıt kimliği: '+key},400);ids.add(item.id)}
  incoming[key]=list;
 }
 const existing={},available={};
 for(const key of Object.keys(TABLES)){
  existing[key]=new Set((await env.DB.prepare(`SELECT id FROM ${key} WHERE owner_email=?`).bind(owner).all()).results.map(r=>r.id));
  available[key]=new Set([...existing[key],...incoming[key].map(r=>r.id)]);
 }
 const statements=[],counts={people:0,properties:0,contracts:0},skipped={people:0,properties:0,contracts:0};
 const alias={people:{full_name:'name',national_id:'tc'},properties:{property_type:'type',province:'city',block_no:'block',parcel_no:'parcel',independent_section:'unit',owner_person_id:'owner'},contracts:{contract_type:'type',property_id:'property',lessor_person_id:'landlord',tenant_person_id:'tenant',rent_start_date:'start',monthly_rent:'rent',deposit_amount:'deposit'}};
 const refs={properties:{owner_person_id:'people'},contracts:{property_id:'properties',lessor_person_id:'people',tenant_person_id:'people',guarantor_person_id:'people'}};
 for(const key of Object.keys(TABLES))for(const item of incoming[key]){
  if(existing[key].has(item.id)){skipped[key]++;continue;}
  const row={};for(const field of TABLES[key]){
   let value=item[field]??item[alias[key][field]]??null;
   if(value==='')value=null;
   if(value!==null&&!['string','number'].includes(typeof value))return json({error:'Geçersiz alan: '+field},400);
   row[field]=value;
  }
  if(key==='contracts'){
   row.title=row.title||((row.contract_type||'Sözleşme')+' — '+item.id);
   if(!row.guarantor_person_id&&Array.isArray(item.guarantors))row.guarantor_person_id=item.guarantors[0]||null;
  }
  for(const field of required[key])if(!String(row[field]??'').trim())return json({error:'Yedekte zorunlu alan eksik: '+field},400);
  for(const [field,target] of Object.entries(refs[key]||{}))if(row[field]&&!available[target].has(row[field]))return json({error:'İlişkili kişi veya taşınmaz bulunamadı; hiçbir kayıt yüklenmedi.'},400);
  for(const field of ['monthly_rent','deposit_amount','advance_amount'])if(row[field]!=null){if(!Number.isFinite(Number(row[field]))||Number(row[field])<0)return json({error:'Geçersiz tutar: '+field},400);row[field]=Number(row[field]);}
  const columns=['id','owner_email',...TABLES[key]];
  statements.push(env.DB.prepare(`INSERT INTO ${key}(${columns.join(',')}) VALUES(${columns.map(()=>'?').join(',')}) ON CONFLICT(id) DO NOTHING`).bind(item.id,owner,...TABLES[key].map(f=>row[f])));
  // A global ID already owned by another account must never silently become a link.
  const collision=await env.DB.prepare(`SELECT owner_email FROM ${key} WHERE id=?`).bind(item.id).first();
  if(collision&&collision.owner_email!==owner)return json({error:'Kayıt kimliği çakışması; hiçbir kayıt yüklenmedi.'},409);
  counts[key]++;
 }
 await env.DB.prepare(ARCHIVE_SQL).run();
 const payload=JSON.stringify(raw),digest=await sha256(payload);
 statements.push(env.DB.prepare('INSERT INTO import_backups(owner_email,digest,payload) VALUES(?,?,?) ON CONFLICT(owner_email,digest) DO NOTHING').bind(owner,digest,payload));
 try{
  const results=await env.DB.batch(statements);
  // Report actual insertions, including a concurrent repeat of this same backup.
  let offset=0;for(const key of Object.keys(TABLES)){const n=counts[key];counts[key]=results.slice(offset,offset+n).reduce((sum,r)=>sum+(r.meta?.changes||0),0);skipped[key]+=n-counts[key];offset+=n;}
  return json({added:counts,skipped,archived:{requests:incoming.requests.length,documents:incoming.documents.length},message:'Kişiler, taşınmazlar ve sözleşmeler eklendi. Mevcut kayıtlar değiştirilmedi. Dosyanın tamamı ayrıca arşivlendi.'});
 }catch{return json({error:'Yükleme tamamlanamadı; işlem geri alındı. Kayıt bağlantılarını kontrol edin.'},400)}
}

async function api(request,env) {
  const url=new URL(request.url), parts=url.pathname.split("/").filter(Boolean), resource=parts[1];
  if(request.method==="POST" && resource==="register") {
    let body; try{body=await request.json()}catch{return json({error:"Bilgiler okunamadı."},400)}
    const email=String(body.email||"").trim().toLowerCase(), password=String(body.password||"");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({error:"Geçerli bir e-posta adresi girin."},400);
    if(password.length<12) return json({error:"Parola en az 12 karakter olmalı."},400);
    try {
      const salt=randomToken(), hash=await passwordHash(password,salt);
      // İlk hesap kurulum hesabıdır. Tek SQL ifadesi eşzamanlı kayıt denemelerinde
      // ikinci hesabın açılmasını da engeller.
      const created = await env.DB.prepare(
        "INSERT INTO users(id,email,password_hash) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM users)"
      ).bind(crypto.randomUUID(),email,"pbkdf2-sha256:100000:"+salt+":"+hash).run();
      if (!created.meta?.changes) return json({error:"İlk hesap zaten oluşturulmuş. Yeni hesap kaydı kapalıdır."},403);
      const token=randomToken(), expires=Math.floor(Date.now()/1000)+60*60*24*14;
      await env.DB.prepare("INSERT INTO sessions(token_hash,email,expires_at) VALUES(?,?,?)").bind(await sha256(token),email,expires).run();
      return json({email},201,{"set-cookie":cookie(token,60*60*24*14)});
    } catch(e) { return json({error:"Hesap oluşturma tamamlanamadı. Hesap oluşmuş olabilir; önce Giriş yap düğmesini deneyin."},503); }
  }
  if(request.method==="POST" && resource==="login") {
    let body; try{body=await request.json()}catch{return json({error:"Bilgiler okunamadı."},400)}
    const email=String(body.email||"").trim().toLowerCase(), password=String(body.password||"");
    const user=await env.DB.prepare("SELECT password_hash FROM users WHERE email=?").bind(email).first();
    if(!user) return json({error:"E-posta veya parola hatalı."},401);
    const hashParts=user.password_hash.split(":");
    const legacy=hashParts.length===2;
    const [salt,stored]=legacy?hashParts:hashParts.slice(2);
    const iterations=legacy?310000:Number(hashParts[1]);
    if(!legacy&&(hashParts.length!==4||hashParts[0]!=="pbkdf2-sha256"||iterations!==100000))
      return json({error:"Hesap şifre biçimi desteklenmiyor."},503);
    const actual=await passwordHash(password,salt,iterations);
    let difference=actual.length^stored.length;
    for(let i=0;i<actual.length;i++)difference|=actual.charCodeAt(i)^(stored.charCodeAt(i)||0);
    if(difference!==0) return json({error:"E-posta veya parola hatalı."},401);
    const token=randomToken(), expires=Math.floor(Date.now()/1000)+60*60*24*14;
    await env.DB.prepare("INSERT INTO sessions(token_hash,email,expires_at) VALUES(?,?,?)").bind(await sha256(token),email,expires).run();
    return json({email},200,{"set-cookie":cookie(token,60*60*24*14)});
  }
  if(request.method==="POST" && resource==="logout") {
    const token=readCookie(request);
    if(token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha256(token)).run();
    return json({ok:true},200,{"set-cookie":cookie("",0)});
  }
  const owner=await currentUser(request,env);
  if(url.pathname==="/api/me" && request.method==="GET") return owner?json({email:owner}):json({error:"Giriş yapın."},401);
  if(!owner) return json({error:"Oturum bulunamadı. Lütfen giriş yapın."},401);
  if(url.pathname==="/api/import" && request.method==="POST") return importBackup(request,env,owner);
  if(url.pathname==="/api/import-archives" && request.method==="GET") {
    await env.DB.prepare(ARCHIVE_SQL).run();
    const {results}=await env.DB.prepare("SELECT payload,created_at FROM import_backups WHERE owner_email=? ORDER BY created_at DESC").bind(owner).all();
    return json({archives:results.map(r=>({date:r.created_at,backup:JSON.parse(r.payload)}))});
  }
  if(url.pathname==="/api/export" && request.method==="GET") {
    const result={};
    for(const table of Object.keys(TABLES)){const {results}=await env.DB.prepare(`SELECT * FROM ${table} WHERE owner_email=? ORDER BY created_at DESC`).bind(owner).all();result[table]=results;}
    return json({version:1,exported_at:new Date().toISOString(),data:result});
  }
  if(!TABLES[resource]) return json({error:"Adres bulunamadı."},404);
  if(request.method==="GET" && parts.length===2) {
    const {results}=await env.DB.prepare(`SELECT * FROM ${resource} WHERE owner_email=? ORDER BY created_at DESC`).bind(owner).all();return json(results);
  }
  if((request.method==="POST"&&parts.length===2)||(request.method==="PUT"&&parts.length===3)) {
    let body;try{body=await request.json()}catch{return json({error:"Gönderilen veri okunamadı."},400)}
    for(const field of required[resource])if(!String(body[field]??"").trim())return json({error:field+" alanı zorunludur."},400);
    const fields=TABLES[resource],values=fields.map(f=>body[f]===""||body[f]===undefined?null:body[f]);
    try{
      if(request.method==="POST"){const id=crypto.randomUUID(),columns=["id","owner_email",...fields];await env.DB.prepare(`INSERT INTO ${resource}(${columns.join(",")}) VALUES(${columns.map(()=>"?").join(",")})`).bind(id,owner,...values).run();return json({id,saved:true},201);}
      const id=parts[2],assignments=fields.map(f=>f+"=?").join(",");
      const result=await env.DB.prepare(`UPDATE ${resource} SET ${assignments},updated_at=CURRENT_TIMESTAMP WHERE id=? AND owner_email=?`).bind(...values,id,owner).run();
      if(!result.meta?.changes)return json({error:"Kayıt bulunamadı."},404);return json({id,saved:true,updated:true});
    }catch(e){return json({error:"Kayıt kaydedilemedi. İlişkili kişi/taşınmaz seçimini kontrol edin."},400);}
  }
  return json({error:"Bu işlem desteklenmiyor. Kayıt silme kapalıdır."},405);
}
export default {async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname.startsWith("/api/")){
    try { return await api(request,env); }
    catch { return json({error:"Sunucu işlemi tamamlayamadı. Lütfen daha sonra tekrar deneyin."},503); }
  }
  return env.ASSETS.fetch(request);
}};
