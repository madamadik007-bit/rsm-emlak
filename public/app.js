const $=id=>document.getElementById(id);
let tab="people", rows=[], editingId=null, peopleCache=[], propertiesCache=[];
const labels={people:"Kişiler",properties:"Taşınmazlar",contracts:"Sözleşmeler"};
const fields={
 people:[["full_name","Ad soyad","text",true],["national_id","T.C. kimlik no","text"],["phone","Telefon","tel"],["email","E-posta","email"],["address","Adres","textarea"],["notes","Notlar","textarea"]],
 properties:[["title","Taşınmaz başlığı","text",true],["property_type","Tür","text"],["province","İl","text"],["district","İlçe","text"],["address","Açık adres","textarea"],["block_no","Ada","text"],["parcel_no","Parsel","text"],["independent_section","Bağımsız bölüm","text"],["owner_person_id","Mal sahibi","select","people"],["notes","Notlar","textarea"]],
 contracts:[["title","Sözleşme başlığı","text",true],["contract_type","Sözleşme türü","text",true],["property_id","Taşınmaz","select","properties"],["lessor_person_id","Kiraya veren","select","people"],["tenant_person_id","Kiracı","select","people"],["guarantor_person_id","Kefil","select","people"],["signing_date","İmza / yürürlük tarihi","date"],["rent_start_date","Kira başlangıç tarihi","date"],["end_date","Bitiş tarihi","date"],["eviction_undertaking_date","Tahliye taahhüdü fiilî imza tarihi (imzalanmadıysa boş bırakın)","date"],["monthly_rent","Aylık kira (TL)","number"],["deposit_amount","Depozito (TL)","number"],["advance_amount","Peşin ödeme (TL)","number"],["key_delivery_date","Anahtar teslim tarihi","date"],["notes","Notlar","textarea"]]
};
async function api(path,options={}){const res=await fetch("/api/"+path,{...options,credentials:"same-origin",headers:{"content-type":"application/json",...(options.headers||{})}});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||"İşlem başarısız.");return data}
async function authenticate(mode){const form=$("authForm"),data=Object.fromEntries(new FormData(form).entries());try{const result=await api(mode,{method:"POST",body:JSON.stringify(data)});$("authMessage").textContent="Giriş başarılı.";$("authPanel").classList.add("hidden");$("workspace").classList.remove("hidden");$("who").textContent=result.email;$("connection").textContent="Güvenli bağlantı";await renderForm();await load()}catch(e){$("authMessage").textContent=e.message}}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function dateParts(iso){
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||"");
 if(!m)return null;
 const y=Number(m[1]),mo=Number(m[2]),day=Number(m[3]);
 const d=new Date(Date.UTC(y,mo-1,day));
 return d.getUTCFullYear()===y&&d.getUTCMonth()===mo-1&&d.getUTCDate()===day?{y,mo,day}:null;
}
function dateISO(d){return d.toISOString().slice(0,10)}
function addDays(iso,n){
 const p=dateParts(iso);if(!p)return "";
 return dateISO(new Date(Date.UTC(p.y,p.mo-1,p.day+n)));
}
function addYearMinusDay(iso){
 const p=dateParts(iso);if(!p)return "";
 // Use the calendar anniversary; Feb 29 rolls to Mar 1 in a non-leap year.
 return dateISO(new Date(Date.UTC(p.y+1,p.mo-1,p.day-1)));
}
async function loadReferences(){
 if(tab==="properties"||tab==="contracts")peopleCache=await api("people");
 if(tab==="contracts")propertiesCache=await api("properties");
}
function referenceOptions(source,selected){
 const list=source==="people"?peopleCache:propertiesCache;
 return '<option value="">Seçiniz (isteğe bağlı)</option>'+list.map(r=>'<option value="'+escapeHtml(r.id)+'" '+(r.id===selected?"selected":"")+'>'+escapeHtml(r.full_name||r.title)+'</option>').join("");
}
async function renderForm(record={}){
 $("sectionTitle").textContent=labels[tab]+(editingId?" — düzenleme":"");
 await loadReferences();
 $("fields").innerHTML=fields[tab].map(([name,label,type,required])=>{
  const value=record[name]??"";
  if(type==="textarea")return '<label class="full">'+label+'<textarea name="'+name+'">'+escapeHtml(value)+'</textarea></label>';
  if(type==="select")return '<label>'+label+'<select name="'+name+'">'+referenceOptions(required,value)+'</select></label>';
  return '<label>'+label+'<input name="'+name+'" type="'+type+'" value="'+escapeHtml(value)+'" '+(required===true?"required":"")+'></label>';
 }).join("");
 $("saveMessage").textContent="";
 $("cancelEdit").classList.toggle("hidden",!editingId);
 if(tab==="contracts"){
  const form=$("recordForm");
  form.elements.rent_start_date?.addEventListener("change",e=>{form.elements.end_date.value=addYearMinusDay(e.target.value);const suggested=addDays(e.target.value,5);$("saveMessage").textContent=suggested?"Tahliye taahhüdü için planlanan tarih: "+suggested+". Bu tarih otomatik olarak imza tarihi kaydedilmez.":""});
  form.elements.signing_date?.addEventListener("change",e=>{form.elements.key_delivery_date.value=e.target.value});
 }
}
async function load(){try{rows=await api(tab);renderRows();$("connection").textContent="Bağlantı aktif";}catch(e){$("records").textContent=e.message}}
function renderRows(){
 const q=$("search").value.toLocaleLowerCase("tr");
 const filtered=rows.filter(r=>Object.values(r).some(v=>String(v??"").toLocaleLowerCase("tr").includes(q)));
 $("records").innerHTML=filtered.map(r=>{
  const primary=r.full_name||r.title||r.contract_type;
  const secondary=tab==="people"?(r.phone||r.email||""):(r.address||r.rent_start_date||"");
  return '<article class="record"><div><strong>'+escapeHtml(primary)+'</strong><small>'+escapeHtml(secondary)+'</small></div><div class="record-actions"><small>'+new Date(r.created_at).toLocaleDateString("tr-TR")+'</small><button type="button" class="secondary edit-record" data-id="'+escapeHtml(r.id)+'">Düzenle</button> '+(tab==="contracts"?'<button type="button" class="secondary print-record" data-id="'+escapeHtml(r.id)+'">Yazdır / PDF</button>':"")+'</div></article>';
 }).join("")||'<p class="hint">Henüz kayıt yok.</p>';
}
document.querySelectorAll("nav button").forEach(b=>b.onclick=async()=>{tab=b.dataset.tab;editingId=null;document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x===b));$("recordForm").reset();await renderForm();await load()});
$("records").addEventListener("click",async e=>{
 const button=e.target.closest(".edit-record");if(!button)return;
 const record=rows.find(r=>r.id===button.dataset.id);if(!record)return;
 editingId=record.id;await renderForm(record);window.scrollTo({top:0,behavior:"smooth"});
});
$("records").addEventListener("click",e=>{
 const button=e.target.closest(".print-record");if(!button||tab!=="contracts")return;
 const record=rows.find(r=>r.id===button.dataset.id);if(!record)return;
 const lookup=(items,id)=>items.find(x=>x.id===id)?.full_name||items.find(x=>x.id===id)?.title||"—";
 const pairs=[
  ["Sözleşme başlığı",record.title],["Sözleşme türü",record.contract_type],
  ["Taşınmaz",lookup(propertiesCache,record.property_id)],
  ["Kiraya veren",lookup(peopleCache,record.lessor_person_id)],
  ["Kiracı",lookup(peopleCache,record.tenant_person_id)],
  ["Kefil",lookup(peopleCache,record.guarantor_person_id)],
  ["İmza / yürürlük tarihi",record.signing_date],["Kira başlangıcı",record.rent_start_date],
  ["Kira bitişi",record.end_date],["Anahtar teslim tarihi",record.key_delivery_date],
  ["Tahliye taahhüdünün fiilî imza tarihi",record.eviction_undertaking_date],
  ["Aylık kira (TL)",record.monthly_rent],["Depozito (TL)",record.deposit_amount],
  ["Peşin ödeme (TL)",record.advance_amount],["Notlar",record.notes]
 ];
 const printable=pairs.map(([name,value])=>'<tr><th>'+escapeHtml(name)+'</th><td>'+escapeHtml(value??"—")+'</td></tr>').join("");
 const win=window.open("","_blank");
 if(!win){alert("Yazdırma penceresi engellendi. Tarayıcı izinlerini kontrol edin.");return}
 win.document.write('<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>RSM Emlak - Sözleşme kayıt özeti</title><style>body{font:14px Arial,sans-serif;max-width:850px;margin:35px auto;color:#222}table{border-collapse:collapse;width:100%}th,td{border:1px solid #aaa;padding:9px;text-align:left;vertical-align:top}th{width:38%;background:#f3f3f3}p{line-height:1.5}</style></head><body><h1>RSM Emlak — Sözleşme Kayıt Özeti</h1><p>Bu belge yalnızca kayıt bilgilerini gösterir. İmzaya hazır hukuki kira sözleşmesi veya tahliye taahhütnamesi değildir.</p><table>'+printable+'</table></body></html>');
 win.document.close();
 win.focus();
 win.print();
});
$("cancelEdit").onclick=async()=>{editingId=null;$("recordForm").reset();await renderForm()};
$("recordForm").onsubmit=async e=>{
 e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget).entries());
 for(const k of ["monthly_rent","deposit_amount","advance_amount"])if(data[k]==="")data[k]=null;
 try{await api(tab+(editingId?"/"+encodeURIComponent(editingId):""),{method:editingId?"PUT":"POST",body:JSON.stringify(data)});$("saveMessage").textContent=editingId?"Kayıt güncellendi.":"Kayıt kaydedildi.";editingId=null;e.currentTarget.reset();await renderForm();await load()}
 catch(err){$("saveMessage").textContent=err.message}
};
$("search").oninput=renderRows;
$("backup").onclick=async()=>{try{const data=await api("export");const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="rsm-emlak-yedek-"+new Date().toISOString().slice(0,10)+".json";a.click();URL.revokeObjectURL(a.href)}catch(e){alert(e.message)}};
$("checkBackup").onclick=()=>$("backupFile").click();
$("backupFile").onchange=async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  if(file.size>15*1024*1024)throw new Error("Yedek dosyası 15 MB sınırını aşıyor.");
  // Server preview is intentionally capped to keep database requests bounded.
  // Large backups should be split using a dedicated, reviewed import workflow.
  const backup=JSON.parse(await file.text());
  const result=await api("backup/validate",{method:"POST",body:JSON.stringify(backup)});
  const counts=Object.entries(result.counts||{}).map(([k,v])=>k+": "+v).join(", ");
  if(!result.valid){alert("Yedek doğrulanamadı:\\n"+(result.errors||[]).join("\\n"));return}
  const preview=await api("backup/preview",{method:"POST",body:JSON.stringify(backup)});
  const details=Object.entries(preview.summary).map(([name,v])=>name+": "+v.in_backup+" yedek, "+v.already_exists+" mevcut, "+v.missing+" eksik").join("\\n");
  alert("Yedek doğrulandı. "+counts+"\\n\\n"+details+"\\n\\nBu yalnızca önizlemedir. Kayıtlar değiştirilmedi.");
 }catch(err){alert("Yedek kontrolü başarısız: "+err.message)}
 finally{e.target.value=""}
};
$("logout").onclick=async()=>{try{await api("logout",{method:"POST",body:"{}"})}finally{location.reload()}}; 
$("authForm").onsubmit=e=>{e.preventDefault();authenticate("login")};
$("registerButton").onclick=()=>authenticate("register");
(async()=>{try{const me=await api("me");$("authPanel").classList.add("hidden");$("workspace").classList.remove("hidden");$("who").textContent=me.email;$("connection").textContent="Güvenli bağlantı";await renderForm();await load()}catch(e){$("authPanel").classList.remove("hidden");$("connection").textContent="Giriş gerekli"}})();
