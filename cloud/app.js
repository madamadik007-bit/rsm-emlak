import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const $=id=>document.getElementById(id);
let supabase=null, user=null, tab="people", rows=[];
const configKey="rsm_emlak_public_config";
const config=JSON.parse(localStorage.getItem(configKey)||"null");
function show(id,on=true){$(id).classList.toggle("hidden",!on)}
function status(s){$("connection").textContent=s}
function setConfig(url,key){localStorage.setItem(configKey,JSON.stringify({url,key}));location.reload()}
if(!config?.url||!config?.key){show("setup");$("saveConfig").onclick=()=>{const url=$("projectUrl").value.trim(),key=$("publicKey").value.trim();if(!url.startsWith("https://")||!key){alert("Proje URL ve public anon/publishable key gerekli.");return}setConfig(url,key)}}
else{try{supabase=createClient(config.url,config.key);status("Sunucu ayarlı");show("auth");supabase.auth.getSession().then(({data})=>{if(data.session)enter(data.session.user)});supabase.auth.onAuthStateChange((_event,session)=>{if(session)enter(session.user);else{user=null;show("workspace",false);show("auth")}})}catch(e){status("Bağlantı ayarı hatalı");show("setup")}}
$("login").onclick=async()=>{const {error}=await supabase.auth.signInWithPassword({email:$("email").value,password:$("password").value});$("authMessage").textContent=error?.message||"Giriş yapılıyor…"};
$("signup").onclick=async()=>{const {data,error}=await supabase.auth.signUp({email:$("email").value,password:$("password").value});$("authMessage").textContent=error?.message||(data.session?"Hesap oluşturuldu.":"E-posta doğrulama bağlantısını kontrol edin.")};
$("logout").onclick=()=>supabase.auth.signOut();
async function enter(u){user=u;show("auth",false);show("workspace");$("who").textContent=u.email||"Hesap";await load()}
const fields={
 people:[["full_name","Ad soyad","text",true],["national_id","T.C. kimlik no","text"],["phone","Telefon","tel"],["email","E-posta","email"],["address","Adres","textarea"],["notes","Notlar","textarea"]],
 properties:[["title","Taşınmaz başlığı","text",true],["property_type","Tür","text"],["province","İl","text"],["district","İlçe","text"],["address","Açık adres","textarea"],["block_no","Ada","text"],["parcel_no","Parsel","text"],["independent_section","Bağımsız bölüm","text"],["notes","Notlar","textarea"]],
 contracts:[["title","Sözleşme başlığı","text",true],["contract_type","Sözleşme türü","text",true],["signing_date","İmza / yürürlük tarihi","date"],["rent_start_date","Kira başlangıç tarihi","date"],["end_date","Bitiş tarihi","date"],["eviction_undertaking_date","Tahliye taahhüdü tarihi","date"],["monthly_rent","Aylık kira (TL)","number"],["deposit_amount","Depozito (TL)","number"],["notes","Notlar","textarea"]]
};
const labels={people:"Kişiler",properties:"Taşınmazlar",contracts:"Sözleşmeler"};
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{tab=b.dataset.tab;document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x===b));renderForm();load()});
function renderForm(){$("sectionTitle").textContent=labels[tab];$("fields").innerHTML=fields[tab].map(([name,label,type,required])=>'<label class="'+(type==="textarea"?"full":"")+'">'+label+(type==="textarea"?'<textarea name="'+name+'" '+(required?"required":"")+'></textarea>':'<input name="'+name+'" type="'+type+'" '+(required?"required":"")+'></label>').join("")}
$("recordForm").onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget).entries());for(const k of ["monthly_rent","deposit_amount"])if(data[k]==="")data[k]=null;const {error}=await supabase.from(tab).insert(data);$("saveMessage").textContent=error?error.message:"Kayıt eklendi.";if(!error){e.currentTarget.reset();await load()}};
async function load(){const {data,error}=await supabase.from(tab).select("*").order("created_at",{ascending:false});if(error){$("records").textContent=error.message;return}rows=data||[];renderRows()}
function renderRows(){const q=$("search").value.toLocaleLowerCase("tr");const filtered=rows.filter(r=>Object.values(r).some(v=>String(v??"").toLocaleLowerCase("tr").includes(q)));$("records").innerHTML=filtered.map(r=>{const primary=r.full_name||r.title||r.contract_type;const secondary=tab==="people"?(r.phone||r.email||""):(r.address||r.rent_start_date||"");return '<article class="record"><div><strong>'+escapeHtml(primary)+'</strong><small>'+escapeHtml(secondary)+'</small></div><small>'+new Date(r.created_at).toLocaleDateString("tr-TR")+'</small></article>'}).join("")||'<p class="hint">Henüz kayıt yok.</p>'}
$("search").oninput=renderRows;
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
renderForm();
