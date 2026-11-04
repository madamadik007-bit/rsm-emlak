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
const empty = { people: [], properties: [], requests: [], documents: [], contracts: [] };
async function GET(request, env) {
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Oturum a\xE7man\u0131z gerekiyor." }, 401);
  if (!env.DB) return json({ error: "Veritaban\u0131 ba\u011Flant\u0131s\u0131 haz\u0131r de\u011Fil." }, 503);
  const row = await env.DB.prepare("SELECT revision,payload FROM account_state WHERE owner=?").bind(user).first();
  return json(row ? { revision: row.revision, data: JSON.parse(row.payload) } : { revision: 0, data: empty });
}
async function PUT(request, env) {
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Oturum a\xE7man\u0131z gerekiyor." }, 401);
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return json({ error: "Ge\xE7ersiz istek kayna\u011F\u0131." }, 403);
  if (!env.DB) return json({ error: "Veritaban\u0131 ba\u011Flant\u0131s\u0131 haz\u0131r de\u011Fil." }, 503);
  const text = await request.text();
  if (text.length > 4e6) return json({ error: "Kay\u0131t boyutu s\u0131n\u0131r\u0131 a\u015F\u0131ld\u0131." }, 413);
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: "Ge\xE7ersiz kay\u0131t." }, 400);
  }
  if (!Number.isSafeInteger(body.revision) || body.revision < 0 || !body.data || typeof body.data !== "object") return json({ error: "Ge\xE7ersiz kay\u0131t s\xFCr\xFCm\xFC." }, 400);
  for (const key of Object.keys(empty)) {
    const rows = body.data[key];
    if (!Array.isArray(rows)) return json({ error: "Eksik kay\u0131t listesi: " + key }, 400);
    const ids = /* @__PURE__ */ new Set();
    for (const row of rows) {
      if (!row || typeof row.id !== "string" || !row.id || ids.has(row.id)) return json({ error: "Ge\xE7ersiz kay\u0131t kimli\u011Fi." }, 400);
      ids.add(row.id);
    }
  }
  const people = new Set(body.data.people.map((x) => x.id)), properties = new Set(body.data.properties.map((x) => x.id));
  for (const row of body.data.properties) if (row.owner && !people.has(row.owner)) return json({ error: "Ta\u015F\u0131nmaz\u0131n mal sahibi kayd\u0131 bulunamad\u0131." }, 400);
  for (const row of body.data.requests) if (row.personId && !people.has(row.personId)) return json({ error: "Talep sahibinin kayd\u0131 bulunamad\u0131." }, 400);
  for (const row of body.data.documents) if (row.person && !people.has(row.person) || row.property && !properties.has(row.property)) return json({ error: "Belgenin ba\u011Fl\u0131 oldu\u011Fu kay\u0131t bulunamad\u0131." }, 400);
  const payload = JSON.stringify(body.data), now = (/* @__PURE__ */ new Date()).toISOString(), owner = user;
  const result = await env.DB.batch([
    env.DB.prepare("INSERT OR IGNORE INTO account_state(owner,revision,payload,updated_at) VALUES(?,0,?,?)").bind(owner, JSON.stringify(empty), now),
    env.DB.prepare("INSERT OR IGNORE INTO account_history(owner,revision,payload,created_at) SELECT owner,revision,payload,? FROM account_state WHERE owner=? AND revision=?").bind(now, owner, body.revision),
    env.DB.prepare("UPDATE account_state SET payload=?,revision=revision+1,updated_at=? WHERE owner=? AND revision=?").bind(payload, now, owner, body.revision)
  ]);
  if (result[2].meta.changes !== 1) return json({ error: "Kay\u0131tlar ba\u015Fka bir sekmede de\u011Fi\u015Fti. Bu formu kopyalay\u0131p sayfay\u0131 yenileyin; eski verinin \xFCzerine yaz\u0131lmad\u0131." }, 409);
  return json({ revision: body.revision + 1 });
}

async function ensureStateTables(env){
 await env.DB.batch([
  env.DB.prepare('CREATE TABLE IF NOT EXISTS account_state(owner TEXT PRIMARY KEY NOT NULL,revision INTEGER NOT NULL DEFAULT 0,payload TEXT NOT NULL,updated_at TEXT NOT NULL)'),
  env.DB.prepare('CREATE TABLE IF NOT EXISTS account_history(owner TEXT NOT NULL,revision INTEGER NOT NULL,payload TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(owner,revision))')
 ]);
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 try {
  if(url.pathname==='/api/state'){
   if(!await currentUser(request,env))return json({error:'Oturum açmanız gerekiyor.'},401);
   await ensureStateTables(env);
   if(request.method==='GET')return await GET(request,env);
   if(request.method==='PUT')return await PUT(request,env);
   return json({error:'Desteklenmeyen işlem.'},405);
  }
  if(url.pathname==='/api/backup' && request.method==='GET'){
   const owner=await currentUser(request,env);if(!owner)return json({error:'Giriş yapın.'},401);
   await ensureStateTables(env);
   const row=await env.DB.prepare('SELECT payload FROM account_state WHERE owner=?').bind(owner).first();
   if(!row)return json({error:'Kayıt bulunamadı; boş yedek oluşturulmadı.'},409);
   const date=new Date().toISOString();
   return new Response(JSON.stringify({format:'RSM-EMLAK',version:1,date,data:JSON.parse(row.payload)},null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="RSM-EMLAK-Kayit-Yedegi-'+date.slice(0,10)+'.json"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }
  if(url.pathname.startsWith('/api/'))return await api(request,env);
  if(url.pathname==='/signout-with-chatgpt'){
   const response=await api(new Request(new URL('/api/logout',request.url),{method:'POST',headers:request.headers}),env);
   return new Response(null,{status:303,headers:{Location:'/', 'Set-Cookie':response.headers.get('set-cookie'),'Cache-Control':'no-store'}});
  }
  if(url.pathname==='/' || url.pathname==='/index.html' || url.pathname==='/login'){
   const user=await currentUser(request,env);
   const assetUrl=new URL(user?'/index.html':'/auth.html',request.url);
   const response=await env.ASSETS.fetch(new Request(assetUrl,{method:'GET'}));
   const headers=new Headers(response.headers);headers.set('Cache-Control','no-store');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','same-origin');
   return new Response(response.body,{status:response.status,headers});
  }
  return env.ASSETS.fetch(request);
 } catch {return json({error:'Sunucu işlemi tamamlayamadı. Kayıtlarınızı yeniden girmeden sayfayı yenileyin.'},503);}
}};
