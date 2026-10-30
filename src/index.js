const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
});
const b64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const randomToken = () => b64url(crypto.getRandomValues(new Uint8Array(32)));
async function sha256(value) { return b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))); }
async function passwordHash(password, salt) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(salt),iterations:310000,hash:"SHA-256"},material,256);
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
async function api(request,env) {
  const url=new URL(request.url), parts=url.pathname.split("/").filter(Boolean), resource=parts[1];
  // Cookie-authenticated writes must originate from this application's own origin.
  // Reject absent Origin as well, rather than trusting cross-site form submissions.
  if(!["GET","HEAD","OPTIONS"].includes(request.method)){
    const origin=request.headers.get("Origin");
    if(origin!==url.origin)return json({error:"Güvenlik kontrolü başarısız: geçersiz istek kaynağı."},403);
    const type=request.headers.get("Content-Type")||"";
    if(!/^application\/json(?:\s*;|$)/i.test(type))return json({error:"JSON içerik türü gerekli."},415);
  }
  if(request.method==="POST" && resource==="register") {
    let body; try{body=await request.json()}catch{return json({error:"Bilgiler okunamadı."},400)}
    const email=String(body.email||"").trim().toLowerCase(), password=String(body.password||"");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({error:"Geçerli bir e-posta adresi girin."},400);
    if(password.length<12) return json({error:"Parola en az 12 karakter olmalı."},400);
    const salt=randomToken(), hash=await passwordHash(password,salt);
    try {
      // İlk hesap kurulum hesabıdır. Tek SQL ifadesi eşzamanlı kayıt denemelerinde
      // ikinci hesabın açılmasını da engeller.
      const created = await env.DB.prepare(
        "INSERT INTO users(id,email,password_hash) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM users)"
      ).bind(crypto.randomUUID(),email,salt+":"+hash).run();
      if (!created.meta?.changes) return json({error:"İlk hesap zaten oluşturulmuş. Yeni hesap kaydı kapalıdır."},403);
      const token=randomToken(), expires=Math.floor(Date.now()/1000)+60*60*24*14;
      await env.DB.prepare("INSERT INTO sessions(token_hash,email,expires_at) VALUES(?,?,?)").bind(await sha256(token),email,expires).run();
      return json({email},201,{"set-cookie":cookie(token,60*60*24*14)});
    } catch(e) { return json({error:"Bu e-posta zaten kayıtlı olabilir."},409); }
  }
  if(request.method==="POST" && resource==="login") {
    let body; try{body=await request.json()}catch{return json({error:"Bilgiler okunamadı."},400)}
    const email=String(body.email||"").trim().toLowerCase(), password=String(body.password||"");
    const user=await env.DB.prepare("SELECT password_hash FROM users WHERE email=?").bind(email).first();
    if(!user) return json({error:"E-posta veya parola hatalı."},401);
    const [salt,stored]=user.password_hash.split(":");
    if(await passwordHash(password,salt)!==stored) return json({error:"E-posta veya parola hatalı."},401);
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
  // Read-only backup verification: inspect a backup before any future import.
  // This endpoint never writes to the database.
  if(url.pathname==="/api/backup/validate" && request.method==="POST"){
    let backup;
    try{backup=await request.json()}catch{return json({error:"Yedek JSON biçiminde okunamadı."},400)}
    if(!backup||backup.version!==1||!backup.data||typeof backup.data!=="object"||Array.isArray(backup.data))
      return json({error:"RSM-EMLAK sürüm 1 yedeği gerekli."},400);
    const counts={},errors=[];
    for(const table of Object.keys(TABLES)){
      const rows=backup.data[table];
      if(!Array.isArray(rows)){errors.push(table+" listesi eksik.");continue}
      if(rows.length>100000){errors.push(table+" listesi çok büyük.");continue}
      counts[table]=rows.length;
      const seen=new Set();
      for(let i=0;i<rows.length;i++){
        const row=rows[i];
        if(!row||typeof row!=="object"||Array.isArray(row)){errors.push(table+" satır "+(i+1)+" geçersiz.");continue}
        if(typeof row.id!=="string"||!row.id){errors.push(table+" satır "+(i+1)+" kimlik eksik.");continue}
        if(seen.has(row.id))errors.push(table+" içinde tekrarlanan kimlik.");
        seen.add(row.id);
        if(row.owner_email!==owner)errors.push(table+" satır "+(i+1)+" farklı hesaba ait.");
        for(const field of required[table])if(!String(row[field]??"").trim())errors.push(table+" satır "+(i+1)+" zorunlu alan eksik: "+field);
        if(errors.length>=30)break;
      }
    }
    // Verify references within the backup itself, before allowing future restore.
    const peopleIds=new Set((Array.isArray(backup.data.people)?backup.data.people:[]).map(r=>r?.id));
    const propertyIds=new Set((Array.isArray(backup.data.properties)?backup.data.properties:[]).map(r=>r?.id));
    for(const [table,refs] of [
      ["properties",{owner_person_id:peopleIds}],
      ["contracts",{property_id:propertyIds,lessor_person_id:peopleIds,tenant_person_id:peopleIds,guarantor_person_id:peopleIds}]
    ]){
      for(const [index,row] of (Array.isArray(backup.data[table])?backup.data[table]:[]).entries()){
        if(!row||typeof row!=="object")continue;
        for(const [field,ids] of Object.entries(refs)){
          if(row[field]&&!ids.has(row[field]))errors.push(table+" satır "+(index+1)+" bağlantısı yedekte bulunamadı: "+field);
          if(errors.length>=30)break;
        }
        if(errors.length>=30)break;
      }
    }
    return json({valid:errors.length===0,counts,errors:errors.slice(0,30),imported:false});
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
    if(resource==="contracts"){
      const dateFields=["signing_date","rent_start_date","end_date","eviction_undertaking_date","key_delivery_date"];
      for(const field of dateFields){
        const value=body[field];
        if(value===null||value===undefined||value==="")continue;
        if(typeof value!=="string"||!/^\\d{4}-\\d{2}-\\d{2}$/.test(value))
          return json({error:field+" için YYYY-AA-GG biçiminde tarih girin."},400);
        const date=new Date(value+"T00:00:00Z");
        if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value)
          return json({error:field+" geçerli bir takvim tarihi değil."},400);
      }
      if(body.rent_start_date&&body.end_date&&body.end_date<body.rent_start_date)
        return json({error:"Kira bitiş tarihi başlangıç tarihinden önce olamaz."},400);
      if(body.signing_date&&body.rent_start_date&&body.signing_date>body.rent_start_date)
        return json({error:"İmza tarihi kira başlangıcından sonra olamaz."},400);
      for(const field of ["monthly_rent","deposit_amount","advance_amount"]){
        const value=body[field];
        if(value===null||value===undefined||value==="")continue;
        if(typeof value!=="number"||!Number.isFinite(value)||value<0)
          return json({error:field+" için negatif olmayan sayısal tutar girin."},400);
      }
    }
    // Prevent cross-account or dangling references even if SQLite FK enforcement is disabled.
    const references = resource==="properties"
      ? {owner_person_id:"people"}
      : resource==="contracts"
        ? {property_id:"properties",lessor_person_id:"people",tenant_person_id:"people",guarantor_person_id:"people"}
        : {};
    for(const [field,table] of Object.entries(references)){
      const id=body[field];
      if(id===null||id===undefined||id==="")continue;
      if(typeof id!=="string")return json({error:field+" geçersiz."},400);
      const linked=await env.DB.prepare(`SELECT id FROM ${table} WHERE id=? AND owner_email=?`).bind(id,owner).first();
      if(!linked)return json({error:field+" için geçerli bir kayıt seçin."},400);
    }
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
  if(url.pathname.startsWith("/api/"))return api(request,env);
  return env.ASSETS.fetch(request);
}};
