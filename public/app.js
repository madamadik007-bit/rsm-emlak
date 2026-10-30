const $=id=>document.getElementById(id);
let tab="people", rows=[];
const labels={people:"Kişiler",properties:"Taşınmazlar",contracts:"Sözleşmeler"};
const fields={
 people:[["full_name","Ad soyad","text",true],["national_id","T.C. kimlik no","text"],["phone","Telefon","tel"],["email","E-posta","email"],["address","Adres","textarea"],["notes","Notlar","textarea"]],
 properties:[["title","Taşınmaz başlığı","text",true],["property_type","Tür","text"],["province","İl","text"],["district","İlçe","text"],["address","Açık adres","textarea"],["block_no","Ada","text"],["parcel_no","Parsel","text"],["independent_section","Bağımsız bölüm","text"],["notes","Notlar","textarea"]],
 contracts:[["title","Sözleşme başlığı","text",true],["contract_type","Sözleşme türü","text",true],["signing_date","İmza / yürürlük tarihi","date"],["rent_start_date","Kira başlangıç tarihi","date"],["end_date","Bitiş tarihi","date"],["eviction_undertaking_date","Tahliye taahhüdü tarihi","date"],["monthly_rent","Aylık kira (TL)","number"],["deposit_amount","Depozito (TL)","number"],["advance_amount","Peşin ödeme (TL)","number"],["key_delivery_date","Anahtar teslim tarihi","date"],["notes","Notlar","textarea"]]
};
async function api(path,options={}){const res=await fetch("/api/"+path,{...options,headers:{"content-type":"application/json",...(options.headers||{})}});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||"İşlem başarısız.");return data}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function addDays(iso,n){if(!iso)return "";const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function addYearMinusDay(iso){if(!iso)return "";const d=new Date(iso+"T12:00:00");d.setFullYear(d.getFullYear()+1);d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)}
function renderForm(){
 $("sectionTitle").textContent=labels[tab];
 $("fields").innerHTML=fields[tab].map(([name,label,type,required])=>'<label class="'+(type==="textarea"?"full":"")+'">'+label+(type==="textarea"?'<textarea name="'+name+'" '+(required?"required":"")+'></textarea>':'<input name="'+name+'" type="'+type+'" '+(required?"required":"")+'></label>').join("");
 if(tab==="contracts"){
  const form=$("recordForm");
  form.elements.rent_start_date?.addEventListener("change",e=>{if(!form.elements.end_date.value)form.elements.end_date.value=addYearMinusDay(e.target.value);form.elements.eviction_undertaking_date.value=addDays(e.target.value,5)});
  form.elements.signing_date?.addEventListener("change",e=>{if(!form.elements.key_delivery_date.value)form.elements.key_delivery_date.value=e.target.value});
 }
}
async function load(){try{rows=await api(tab);renderRows();$("connection").textContent="Bağlantı aktif";}catch(e){$("records").textContent=e.message}}
function renderRows(){const q=$("search").value.toLocaleLowerCase("tr");const filtered=rows.filter(r=>Object.values(r).some(v=>String(v??"").toLocaleLowerCase("tr").includes(q)));$("records").innerHTML=filtered.map(r=>{const primary=r.full_name||r.title||r.contract_type;const secondary=tab==="people"?(r.phone||r.email||""):(r.address||r.rent_start_date||"");return '<article class="record"><div><strong>'+escapeHtml(primary)+'</strong><small>'+escapeHtml(secondary)+'</small></div><small>'+new Date(r.created_at).toLocaleDateString("tr-TR")+'</small></article>'}).join("")||'<p class="hint">Henüz kayıt yok.</p>'}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{tab=b.dataset.tab;document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x===b));renderForm();load()});
$("recordForm").onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget).entries());for(const k of ["monthly_rent","deposit_amount","advance_amount"])if(data[k]==="")data[k]=null;try{await api(tab,{method:"POST",body:JSON.stringify(data)});$("saveMessage").textContent="Kayıt kaydedildi.";e.currentTarget.reset();await load()}catch(err){$("saveMessage").textContent=err.message}};
$("search").oninput=renderRows;
$("backup").onclick=async()=>{try{const data=await api("export");const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="rsm-emlak-yedek-"+new Date().toISOString().slice(0,10)+".json";a.click();URL.revokeObjectURL(a.href)}catch(e){alert(e.message)}};
$("logout").onclick=()=>{location.href="/cdn-cgi/access/logout"};
(async()=>{try{const me=await api("me");$("who").textContent=me.email;$("workspace").classList.remove("hidden");$("connection").textContent="Güvenli bağlantı";renderForm();await load()}catch(e){$("accessMessage").textContent=e.message;$("accessError").classList.remove("hidden");$("connection").textContent="Giriş bekleniyor"}})();
