const $=id=>document.getElementById(id);
let tab="people", rows=[], editingId=null, peopleCache=[], propertiesCache=[];
const labels={people:"Kişiler",properties:"Taşınmazlar",contracts:"Sözleşmeler"};
const fields={
 people:[["full_name","Ad soyad","text",true],["national_id","T.C. kimlik no","text"],["phone","Telefon","tel"],["email","E-posta","email"],["address","Adres","textarea"],["notes","Notlar","textarea"]],
 properties:[["title","Taşınmaz başlığı","text",true],["property_type","Tür","text"],["province","İl","text"],["district","İlçe","text"],["address","Açık adres","textarea"],["block_no","Ada","text"],["parcel_no","Parsel","text"],["independent_section","Bağımsız bölüm","text"],["owner_person_id","Mal sahibi","select","people"],["notes","Notlar","textarea"]],
 contracts:[["title","Sözleşme başlığı","text",true],["contract_type","Sözleşme türü","text",true],["property_id","Taşınmaz","select","properties"],["lessor_person_id","Kiraya veren","select","people"],["tenant_person_id","Kiracı","select","people"],["guarantor_person_id","Kefil","select","people"],["signing_date","İmza / yürürlük tarihi","date"],["rent_start_date","Kira başlangıç tarihi","date"],["end_date","Bitiş tarihi","date"],["eviction_undertaking_date","Tahliye taahhüdü tarihi","date"],["monthly_rent","Aylık kira (TL)","number"],["deposit_amount","Depozito (TL)","number"],["advance_amount","Peşin ödeme (TL)","number"],["key_delivery_date","Anahtar teslim tarihi","date"],["notes","Notlar","textarea"]]
};
async function api(path,options={}){const res=await fetch("/api/"+path,{...options,credentials:"same-origin",headers:{"content-type":"application/json",...(options.headers||{})}});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||"İşlem başarısız.");return data}
async function authenticate(mode){const form=$("authForm"),data=Object.fromEntries(new FormData(form).entries());try{const result=await api(mode,{method:"POST",body:JSON.stringify(data)});$("authMessage").textContent="Giriş başarılı.";$("authPanel").classList.add("hidden");$("workspace").classList.remove("hidden");$("who").textContent=result.email;$("connection").textContent="Güvenli bağlantı";await renderForm();await load()}catch(e){$("authMessage").textContent=e.message}}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function addDays(iso,n){if(!iso)return "";const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function addYearMinusDay(iso){if(!iso)return "";const d=new Date(iso+"T12:00:00");d.setFullYear(d.getFullYear()+1);d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)}
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
  form.elements.rent_start_date?.addEventListener("change",e=>{form.elements.end_date.value=addYearMinusDay(e.target.value);form.elements.eviction_undertaking_date.value=addDays(e.target.value,5)});
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
  return '<article class="record"><div><strong>'+escapeHtml(primary)+'</strong><small>'+escapeHtml(secondary)+'</small></div><div class="record-actions"><small>'+new Date(r.created_at).toLocaleDateString("tr-TR")+'</small><button type="button" class="secondary edit-record" data-id="'+escapeHtml(r.id)+'">Düzenle</button></div></article>';
 }).join("")||'<p class="hint">Henüz kayıt yok.</p>';
}
document.querySelectorAll("nav button").forEach(b=>b.onclick=async()=>{tab=b.dataset.tab;editingId=null;document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x===b));$("recordForm").reset();await renderForm();await load()});
$("records").addEventListener("click",async e=>{
 const button=e.target.closest(".edit-record");if(!button)return;
 const record=rows.find(r=>r.id===button.dataset.id);if(!record)return;
 editingId=record.id;await renderForm(record);window.scrollTo({top:0,behavior:"smooth"});
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
$("logout").onclick=async()=>{try{await api("logout",{method:"POST",body:"{}"})}finally{location.reload()}}; 
$("authForm").onsubmit=e=>{e.preventDefault();authenticate("login")};
$("registerButton").onclick=()=>authenticate("register");
(async()=>{try{const me=await api("me");$("authPanel").classList.add("hidden");$("workspace").classList.remove("hidden");$("who").textContent=me.email;$("connection").textContent="Güvenli bağlantı";await renderForm();await load()}catch(e){$("authPanel").classList.remove("hidden");$("connection").textContent="Giriş gerekli"}})();

$("importBackup").onclick=()=>$("importFile").click();
$("importFile").onchange=async e=>{
 const file=e.target.files[0];if(!file)return;
 const status=$("importStatus"),button=$("importBackup");
 try{
  if(file.size>4*1024*1024)throw Error('Yedek 4 MB sınırını aşıyor.');
  const raw=JSON.parse(await file.text()),data=raw?.data??raw;
  if(!Array.isArray(data?.people)||!Array.isArray(data?.properties))throw Error('Geçerli RSM Emlak yedeği seçin.');
  const count=k=>Array.isArray(data[k])?data[k].length:0;
  const message=`${count('people')} kişi, ${count('properties')} taşınmaz, ${count('contracts')} sözleşme incelenecek. Aynı kimlikteki mevcut kayıtlar korunur.\n\nBu eski sürümde bulunmayan alanlar ve ${count('requests')} talep / ${count('documents')} belge, dosyanın tamamıyla arşivlenir; bu sürümün formlarında kullanılamaz. Orijinal dosyayı “Yüklenen yedekleri indir” ile geri alabilirsiniz.\n\nYüklensin mi?`;
  if(!confirm(message))return;
  button.disabled=true;status.textContent='Yedek yükleniyor…';
  const result=await api('import',{method:'POST',body:JSON.stringify(raw)});
  status.textContent=`${result.added.people} kişi, ${result.added.properties} taşınmaz, ${result.added.contracts} sözleşme eklendi. ${Object.values(result.skipped).reduce((a,b)=>a+b,0)} mevcut kayıt korundu. Dosyanın tamamı arşivlendi. Talepler, belgeler ve bu sürümde olmayan alanlar yalnızca arşivde saklanır.`;
  await load();
 }catch(error){status.textContent='Yedek yüklenemedi: '+error.message}
 finally{button.disabled=false;e.target.value='';}
};
$("importArchives").onclick=async()=>{
 try{
  const result=await api('import-archives');
  if(!result.archives.length){$('importStatus').textContent='Henüz yüklenen yedek yok.';return;}
  // Each entry retains the original import file, without flattening unsupported fields.
  const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));
  a.href=url;a.download='RSM-EMLAK-Orijinal-Yedek-Arsivi.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }catch(error){$('importStatus').textContent=error.message}
};
