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
  if(url.pathname.startsWith("/api/"))return api(request,env);
  return env.ASSETS.fetch(request);
}};
