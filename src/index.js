const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});
const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), c => c.charCodeAt(0));
const decodePart = (s) => JSON.parse(new TextDecoder().decode(b64url(s)));

async function accessIdentity(request, env) {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) throw new Error("Giriş koruması yapılandırılmamış.");
  const [h, p, sig] = token.split(".");
  if (!h || !p || !sig) throw new Error("Geçersiz oturum.");
  const header = decodePart(h), claims = decodePart(p);
  const issuer = `https://${env.ACCESS_TEAM_DOMAIN}`;
  if (claims.iss !== issuer || !Array.isArray(claims.aud) || !claims.aud.includes(env.ACCESS_AUD)) throw new Error("Oturum bu uygulama için geçerli değil.");
  if (!claims.exp || claims.exp <= Math.floor(Date.now() / 1000)) throw new Error("Oturum süresi dolmuş.");
  const certResponse = await fetch(`${issuer}/cdn-cgi/access/certs`);
  if (!certResponse.ok) throw new Error("Giriş doğrulaması yapılamadı.");
  const certs = await certResponse.json();
  const jwk = certs.keys.find(k => k.kid === header.kid);
  if (!jwk || header.alg !== "RS256") throw new Error("Oturum imzası doğrulanamadı.");
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64url(sig), new TextEncoder().encode(`${h}.${p}`));
  if (!valid || !claims.email) throw new Error("Kullanıcı kimliği doğrulanamadı.");
  return String(claims.email).toLowerCase();
}

const TABLES = {
  people: ["full_name", "national_id", "phone", "email", "address", "notes"],
  properties: ["title", "property_type", "province", "district", "address", "block_no", "parcel_no", "independent_section", "owner_person_id", "notes"],
  contracts: ["title", "contract_type", "property_id", "lessor_person_id", "tenant_person_id", "guarantor_person_id", "signing_date", "rent_start_date", "end_date", "eviction_undertaking_date", "monthly_rent", "deposit_amount", "advance_amount", "key_delivery_date", "notes"]
};
const required = { people: ["full_name"], properties: ["title"], contracts: ["title", "contract_type"] };

async function api(request, env) {
  let owner;
  try { owner = await accessIdentity(request, env); }
  catch (e) { return json({ error: e.message }, 401); }

  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const resource = parts[1];
  if (url.pathname === "/api/me" && request.method === "GET") return json({ email: owner });
  if (url.pathname === "/api/export" && request.method === "GET") {
    const result = {};
    for (const table of Object.keys(TABLES)) {
      const { results } = await env.DB.prepare(`SELECT * FROM ${table} WHERE owner_email = ? ORDER BY created_at DESC`).bind(owner).all();
      result[table] = results;
    }
    return json({ version: 1, exported_at: new Date().toISOString(), data: result });
  }
  if (!TABLES[resource]) return json({ error: "Adres bulunamadı." }, 404);
  if (request.method === "GET" && parts.length === 2) {
    const { results } = await env.DB.prepare(`SELECT * FROM ${resource} WHERE owner_email = ? ORDER BY created_at DESC`).bind(owner).all();
    return json(results);
  }
  if (request.method === "POST" && parts.length === 2) {
    let body;
    try { body = await request.json(); } catch { return json({ error: "Gönderilen veri okunamadı." }, 400); }
    for (const field of required[resource]) if (!String(body[field] ?? "").trim()) return json({ error: field + " alanı zorunludur." }, 400);
    const id = crypto.randomUUID();
    const fields = TABLES[resource];
    const values = fields.map(f => body[f] === "" || body[f] === undefined ? null : body[f]);
    const columns = ["id", "owner_email", ...fields];
    const placeholders = columns.map(() => "?").join(", ");
    try {
      await env.DB.prepare(`INSERT INTO ${resource} (${columns.join(",")}) VALUES (${placeholders})`).bind(id, owner, ...values).run();
      return json({ id, saved: true }, 201);
    } catch (e) { return json({ error: "Kayıt kaydedilemedi. İlişkili kişi/taşınmaz seçimini kontrol edin." }, 400); }
  }
  return json({ error: "Bu işlem desteklenmiyor. Kayıt silme kapalıdır." }, 405);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return api(request, env);
    return env.ASSETS.fetch(request);
  }
};
