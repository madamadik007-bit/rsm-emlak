const BUSINESS_LEASE_ARTICLES = [
 "Kullanım Amacı: Kiracı, kiralananı yalnızca yukarıda belirtilen faaliyet için kullanır; kiraya verenin yazılı izni olmadan faaliyet konusunu veya kullanım amacını değiştiremez.",
 "Özenle Kullanım ve Komşuluk Hukuku: Kiracı, kiralananı ve ortak alanları özenle kullanır; diğer kullanıcılara ve komşulara saygı gösterir, gürültü, koku, atık ve benzeri etkilerden doğan zararlardan TBK m. 316 uyarınca sorumludur.",
 "Devir ve Alt Kiralama: Kiraya verenin yazılı izni olmadan kiralanan devredilemez, alt kiraya verilemez veya üçüncü kişilere kullandırılamaz (TBK m. 322-323).",
 "Tadilat: Kiraya verenin yazılı izni olmadan esaslı tadilat yapılamaz. Kiracı, izinli tadilatta mevzuata uygun proje ve ruhsatları kendi gideriyle alır. İzinsiz değişikliklerden doğan zarar kiracıya aittir (TBK m. 321).",
 "Aidat ve Yan Giderler: Elektrik, su, doğalgaz, internet, güvenlik, temizlik ve kullanıma bağlı olağan aidat ve işletme giderleri kiracıya aittir. Kanunen kiraya verene ait giderler (emlak vergisi, DASK, bina yapısal giderleri vb.) saklıdır.",
 "Bakım ve Arıza Bildirimi: Kiracı olağan temizlik ve küçük bakım işlerini yapar; önemli arıza ve ayıpları gecikmeden kiraya verene bildirir (TBK m. 317-318).",
 "Teslim ve İade: Kiracı, kiralananı olağan kullanım kaynaklı yıpranma dışında teslim aldığı durumda iade eder; demirbaş eksiklerini ve sorumlu olduğu zararları karşılar (TBK m. 334).",
 "Gösterim: Kiracı, satış veya yeniden kiralama için makul süre önceden haber verilmesi ve iş saatleri içinde olması şartıyla gösterime izin verir (TBK m. 319).",
 "Ortak Alanlar: Kiracı ortak alanları yönetim planına uygun kullanır; diğer kullanıcıların haklarını ihlal etmez.",
 "Uygulanacak Hukuk: Bu sözleşmede düzenlenmeyen hususlarda 6098 sayılı TBK ve ilgili mevzuat uygulanır.",
 "Kira ve Ödeme: Aylık kira bedeli yukarıda belirtilen tutardır ve her ayın belirlenen gününde kiraya verenin IBAN numaralı hesabına yatırılır. Ödeme dekontu açıklamasına iş yeri adresi yazılır.",
 "KDV ve Stopaj: Kira bedeline ait KDV ve stopaj yükümlülükleri yukarıdaki seçime göre uygulanır. Stopaj kesintisi yapılacaksa kiracı, kesintiyi mevzuata uygun beyan ve ödeyerek makbuz/belge sunar; yasal kesinti sonrası kalan tutar kira borcunu ödenmiş kılar.",
 "Kira Artışı: Yenilenen kira dönemlerinde artış, TBK m. 344 ve yürürlükteki emredici sınırlara göre yapılır.",
 "Depozito: Kiracı, yukarıda belirtilen depozitoyu kira başlangıcında öder. Depozito, banka hesabına yatırılır ve TBK m. 342 gereği üç aylık kira bedelini aşamaz. Kira sonunda zarar ve borç yoksa faiziyle iade edilir.",
 "Bono: Taraflarca teminat olarak bono düzenlenecekse bono tutarı, depozito ile birlikte TBK m. 342 sınırını (üç aylık kira) aşamaz. Aynı borç için mükerrer tahsilat yapılamaz. Bono, kira sözleşmesine bağlı teminat niteliğindedir.",
 "Müteselsil Kefalet: Kefil, kanuni şekil şartları yerine getirilmek kaydıyla, kefil kısmında kendi el yazısıyla belirttiği azami tutara kadar müteselsil kefil olur (TBK m. 583-586). Kefilin evli olması halinde eşinin yazılı rızası alınır (TBK m. 584).",
 "Erken Tahliye: Kiracı erken tahliyede, TBK m. 325 uyarınca yeniden kiralama için gereken makul süreye ilişkin kira borçlarından en fazla üç aylık kira bedeliyle sorumludur. Kanuni indirim ve mahsuplar saklıdır.",
 "Abonelik ve Zararlar: Kiracı, kullanım dönemine ait abonelik ve tüketim borçlarından, kusuruyla verdiği zararlardan sorumludur. Kiracı, teslimde abonelikleri kendi adına alır ve tahliyede kapatır.",
 "Ruhsat ve Faaliyet İzinleri: İşyeri açma ve çalışma ruhsatı, vergi kaydı ve faaliyetle ilgili tüm izin ve belgeleri almak kiracının sorumluluğundadır. Faaliyetin yasaya aykırılığından veya ruhsat eksikliğinden doğan idari yaptırım ve zararlar kiracıya aittir. Kiraya veren, yapı kullanma izni bakımından gerekli belgeleri talep halinde verir.",
 "Tabela ve Cephe: Tabela, reklam ve cephe uygulamaları yönetim planı, belediye mevzuatı ve kiraya verenin yazılı iznine tabidir. Tahliyede kiracı bunları söker ve cepheyi eski haline getirir.",
 "Sigorta: Kiracı, işletmesine ait mal, stok ve sorumluluk risklerini kendi gideriyle sigortalatmayı kabul eder. Kiraya veren, DASK ve bina sigortasından sorumludur.",
 "Temerrüt: Kira veya yan giderlerin ödenmemesinde TBK m. 315 uyarınca en az 30 gün süreli yazılı ihtar verilir. Kiraya verenin kanuni hakları saklıdır.",
 "Uzama ve Fesih: Kira süresi sonunda taraflar sözleşmeyi feshetmezse sözleşme aynı koşullarla bir yıl uzar. Kiraya verenin uzama süresine ilişkin fesih ve ihtiyaç hakları TBK m. 347 ve m. 350 hükümlerine tabidir.",
 "Kişisel Veriler: Tarafların kişisel verileri yalnızca sözleşmenin kurulması ve yürütülmesi amacıyla mevzuata uygun işlenir.",
 "Bildirim: Adres değişikliği yazılı bildirilmedikçe sözleşmedeki adres esas alınır. Kanuni tebligat usulleri saklıdır.",
 "Deliller: Hukuka uygun belge, kayıt ve yazışmalar genel ispat kuralları çerçevesinde değerlendirilir.",
 "Mücbir Sebep: Mücbir sebep hâllerinde tarafların hak ve yükümlülükleri ilgili mevzuata tabidir.",
 "Tahliye Taahhüdü: Kiralananın tesliminden sonra usulüne uygun verilen yazılı tahliye taahhüdüne TBK m. 352/1 uygulanır. Taahhüt, teslimden önce imzalanamaz.",
 "Anahtar ve Hasar Tespiti: Anahtar teslimi, sayaç endeksleri, demirbaşlar ve varsa hasarlar taraflarca imzalanan teslim tutanağıyla belirlenir (TBK m. 334-335).",
 "Sözleşmenin Bütünlüğü: Herhangi bir hükmün geçersizliği diğer hükümleri etkilemez. Değişiklikler yazılı olarak yapılır.",
 "Yetki: Uyuşmazlıklarda kanunen görevli ve yetkili mahkeme ve icra dairelerine başvurulur.",
 "Yürürlük ve Nüshalar: Sözleşme taraflarca imzalanarak yürürlüğe girer; kiraya veren, kiracı ve kefil için üç nüsha düzenlenir."
];

function renderBusinessLease({output,d,property,landlord,tenant,representative,guarantors,note,aval,rent,deposit,tax,packDate,textWords,money,escape}){
 const company=d.businessTenantType==='company';
 const variant=company?'Şirket':'Şahıs';
 const address=[property.city,property.district,property.address].filter(Boolean).join(' / ');
 const blank='____________________';
 const fields=(...values)=>values.map(value=>value||blank).join(' / ');
 const rowText=value=>escape(value||blank);
 const signature=(role,name,detail,stamp=false)=>'<div class="business-signature"><strong>'+escape(role)+'</strong><div>'+rowText(name)+'</div>'+
  (detail?'<div>'+escape(detail)+'</div>':'')+'<div>'+(stamp?'İmza / kaşe':'İmza')+' '+blank+'</div></div>';
 const tenantSignature=signature(company?'Şirket adına yetkili':'Kiracı',company?representative.name:tenant.name,
  company?'T.C. '+representative.tc:'T.C. '+(tenant.tc||blank),company);
 const landlordSignature=signature('Kiraya veren',landlord.name,'T.C. '+(landlord.tc||blank));
 const leaseSignatures='<div class="business-signatures">'+guarantors.map(g=>signature('Müteselsil kefil',g.name,'T.C. '+(g.tc||blank))).join('')+
  tenantSignature+landlordSignature+'</div>';

 output.replaceChildren();
 output.classList.remove('hidden');
 output.classList.add('packet-output');
 let body;
 const pages=[];
 function nextPage(section,signatures=''){
  const page=document.createElement('article');
  page.className='packet-page business-sheet';
  page.innerHTML='<div class="packet-body"></div>'+signatures+'<footer class="business-page-number"></footer>';
  page.dataset.section=section;
  output.append(page);
  pages.push(page);
  body=page.firstElementChild;
 }
 function append(section,blocks,signatures=''){
  nextPage(section,signatures);
  for(const html of blocks){
   const block=document.createElement('div');
   block.innerHTML=html;
   body.append(block);
   if(body.scrollHeight>body.clientHeight+2&&body.childElementCount>1){
    nextPage(section,signatures);
    body.append(block);
   }
   if(body.scrollHeight>body.clientHeight+2)throw new Error('Bir '+section+' bölümü sayfaya sığmıyor. Çok uzun bir alanı kontrol edin.');
  }
 }
 const heading=(text)=>'<h2>'+escape(text)+'</h2>';
 const paragraph=(text)=>'<p>'+escape(text)+'</p>';
 const tableRow=(label,value)=>'<div class="business-field"><strong>'+escape(label)+'</strong><span>'+rowText(value)+'</span></div>';

 const tenantRows=company?[
  ['Kiracı · Şirket unvanı',tenant.name],['Vergi dairesi / Vergi no / MERSİS no',fields(d.companyTaxOffice,tenant.taxNo,d.companyMersis)],
  ['Ticaret sicil no / Telefon',fields(d.companyRegistry,tenant.phone)],['Şirketin merkez ve tebligat adresi',tenant.address],
  ['Yetkili temsilci · Ad soyad / T.C. / Görev',fields(representative.name,representative.tc,d.companyRepresentativeRole)]
 ]:[
  ['Kiracı · Ad soyad / T.C. / Telefon',fields(tenant.name,tenant.tc,tenant.phone)],
  ['Kiracının ikametgâh ve tebligat adresi',tenant.address],['Kiracının vergi dairesi / Vergi no',fields(d.tenantTaxOffice,d.tenantTaxNo)]
 ];
 const duration=Number(d.businessYears||1);
 const end=new Date(d.start+'T00:00:00Z');
 end.setUTCFullYear(end.getUTCFullYear()+duration);
 end.setUTCDate(end.getUTCDate()-1);
 const vat=d.businessVat==='included'?'Dahil':d.businessVat==='excluded'?'Hariç':'Belirtilmedi';
 const vatRate=d.businessVatRate&&d.businessVat!=='unspecified'?' (%'+d.businessVatRate+')':'';
 const stopaj=d.ownerTax==='enterprise'?'Hesaplanmaz (işletme aktifindeki taşınmaz)':
  d.tenantStopaj==='yes'?'Kiracı keser, mevzuat gerektiriyorsa':d.tenantStopaj==='no'?'Yok (beyan)':'Teyit edilmedi';
 const rentType=d.rentBasis==='net'?' · Net':d.rentBasis==='gross'?' · Brüt':'';
 const rows=[
  ['İmzalanma tarihi / Cinsi',packDate(d.contractDate)+' / Çatılı iş yeri'],
  ['Kiraya veren · Ad soyad / T.C. / Telefon',fields(landlord.name,landlord.tc,landlord.phone)],
  ['Kiraya verenin tebligat adresi',landlord.address],...tenantRows,
  ['Kiralananın açık adresi',address],['Kullanım amacı ve faaliyet konusu',d.activity],
  ...(d.permitNote?[['Ruhsat / faaliyet açıklaması',d.permitNote]]:[]),
  ['Aylık kira bedeli',textWords(rent)+rentType],['KDV / Stopaj','KDV: '+vat+vatRate+' · Stopaj: '+stopaj],
  ['Ödeme şekli',(d.payment||blank)+' · IBAN: '+(d.iban||blank)],
  ['Kira artış oranı','TÜFE 12 aylık ortalamalara göre değişim oranı (TBK m. 344)'],
  ['Kira süresi',packDate(d.start)+' – '+packDate(end.toISOString().slice(0,10))+' ('+duration+' yıl)'],
  ['Depozito',deposit?textWords(deposit):'Depozito kararlaştırılmamıştır.'],
  ['DASK poliçe no / İş yeri sigortası',fields(d.contractDask||property.dask,d.businessInsurance==='yes'?'Var':d.businessInsurance==='no'?'Yok':'Belirtilmedi')],
  ['Teslim edilen demirbaşlar','EK-1 Demirbaş ve Sayaç Teslim Tutanağı']
 ];

 const articles=BUSINESS_LEASE_ARTICLES.slice();
 articles[2]+=' İş yeri kiralarında kiraya veren, haklı sebep olmadıkça kira ilişkisinin devrine rıza vermekten kaçınamaz (TBK m. 323).';
 articles[11]+=' '+tax.clause;
 articles[13]='Depozito: Kararlaştırılmışsa kiracı depozitoyu kira başlangıcında, kiraya verenin onayı olmaksızın çekilemeyecek şekilde bankada vadeli tasarruf hesabına yatırır. Toplam güvence üç aylık kira bedelini aşamaz. Güvencenin iadesinde TBK m. 342 hükümleri uygulanır.';
 articles[14]+=note?' Bu sözleşme kapsamında '+money(note.amount)+' bedelli bir bono öngörülmüştür. Kıymetli evrak TBK m. 342 uyarınca bankaya depo edilir.':' Bu paket kapsamında bono düzenlenmemiştir.';
 articles[15]='Müteselsil Kefalet: Seçilen kefil, kanuni şekil şartları yerine getirildiğinde kendi el yazısıyla yazdığı azami tutara kadar müteselsil kefil olur. Kefalet tarihi ve müteselsil kefalet beyanı da kefilin el yazısıyla yazılır. Kanunen gerektiğinde eşin yazılı rızası alınır (TBK m. 583–586).'+
  (company?' Şirket adına temsil imzası kişisel kefalet oluşturmaz. Şahsen kefil olmayı kabul eden ortak veya yetkili, kefalet bölümünü kendi adına ayrıca imzalar.':'');
 articles[22]='Uzama ve Fesih: Kiracı, belirli sürenin bitiminden en az 15 gün önce yazılı bildirimde bulunmadıkça sözleşme aynı koşullarla bir yıl uzar. Kiraya veren, yalnız sözleşme süresinin bitimine dayanarak sözleşmeyi sona erdiremez. TBK m. 347, 348 ve 350 hükümleri saklıdır.';
 articles[31]='Yürürlük ve Nüshalar: Sözleşme taraflarca imzalanarak yürürlüğe girer. Kiraya veren, kiracı ve varsa her kefil için birer nüsha düzenlenir.';
 if(company)articles.splice(16,0,'Temsil ve Yetki: Şirket adına imza atan kişi temsil yetkisini beyan eder. Kiracı, geçerli imza sirkülerini veya yetkiyi gösteren belgeyi kiraya verene sunar. Yetkisiz temsil hâlinde TBK m. 46 ve 47 uygulanır.');
 const numbered=articles.map((article,i)=>paragraph('Madde '+(i+1)+' - '+article));
 const surety=guarantors.map(g=>[
  heading('KEFALET BEYANI · '+g.name),
  paragraph('T.C.: '+(g.tc||blank)+' · Telefon: '+(g.phone||blank)+' · Tebligat adresi: '+(g.address||blank)),
  ...(Number(d.guaranteeAmount)>0?[paragraph('El yazısında esas alınacak azami tutar: '+textWords(Number(d.guaranteeAmount)))]:[]),
  paragraph('Azami sorumluluk tutarını, fiilen imzaladığınız kefalet tarihini ve “Müteselsil kefil olmayı kabul ediyorum.” beyanını kendi el yazınızla yazınız.'),
  '<div class="business-handwriting" aria-hidden="true"></div>',
  paragraph('Kefalet imza tarihi (el yazısıyla): ____ / ____ / 20____'),
  paragraph('Kefilin imzası: '+blank),
  paragraph('Kanunen gerektiğinde eş rızası: Eşimin bu sözleşmeye şahsen kefil olmasına rıza gösteriyorum.'),
  paragraph('Ad soyad: '+blank+' · T.C.: '+blank+' · Tarih: ____ / ____ / 20____ · İmza: '+blank)
 ].join(''));
 append('Sözleşme',[
  '<h1>İŞ YERİ (ÇATILI İŞ YERİ) KİRA SÖZLEŞMESİ</h1>'+paragraph('Kiracı türü: '+variant),
  ...rows.map(([label,value])=>tableRow(label,value)),
  heading('GENEL ŞARTLAR')+numbered[0],...numbered.slice(1,10),
  heading('ÖZEL ŞARTLAR')+numbered[10],...numbered.slice(11),...surety
 ],leaseSignatures);

 const meter=(name,no,index)=>tableRow(name+' sayaç no / endeks',fields(no,index));
 const fixtures=housingFixtureStatements(d.fixtures);
 append('EK-1',[
  '<h1>EK-1 DEMİRBAŞ VE SAYAÇ TESLİM TUTANAĞI</h1>',
  tableRow('Kiralananın açık adresi',address),tableRow('Kiraya veren',landlord.name),tableRow('Kiracı',tenant.name),
  tableRow('Fiilî teslim tarihi',d.businessDeliveryDate?packDate(d.businessDeliveryDate):'____ / ____ / 20____'),
  heading('TESLİM EDİLEN DEMİRBAŞLAR'),
  ...(fixtures.length?fixtures:[blank]).map(paragraph),
  heading('SAYAÇ BİLGİLERİ')+meter('Elektrik',d.businessElectricNo,d.electricMeter),
  meter('Su',d.businessWaterNo,d.waterMeter),meter('Doğalgaz',d.businessGasNo,d.gasMeter),
  paragraph('Yukarıda belirtilen demirbaş ve sayaç bilgileri taraflarca kontrol edilerek teslim edilmiştir.')
 ],'<div class="business-signatures">'+landlordSignature+tenantSignature+'</div>');

 append('Tahliye Taahhütnamesi',[
  '<h1>TAHLİYE TAAHHÜTNAMESİ</h1>',
  tableRow('Taahhüt eden kiracı',tenant.name),
  tableRow(company?'Vergi no / MERSİS':'T.C. / Vergi no',company?fields(tenant.taxNo,d.companyMersis):fields(tenant.tc,d.tenantTaxNo)),
  ...(company?[tableRow('Şirket adına yetkili temsilci',representative.name)]:[]),
  tableRow('Kiraya veren · T.C.',fields(landlord.name,landlord.tc)),tableRow('Tahliye edilecek iş yerinin açık adresi',address),
  tableRow('Tahliye tarihi','____ / ____ / 20____'),
  paragraph((company?'Yukarıda belirtilen şirket adına yetkili temsilci sıfatıyla, şirketin kiracı olarak kullandığı':'Kiracı sıfatıyla kullandığım')+
   ' ve yukarıda açık adresi belirtilen iş yerini, fiilî teslimden sonra verilen bu taahhütte belirtilen tarihte boşaltarak, olağan yıpranma saklı kalmak üzere sözleşmeye uygun durumda ve anahtarlarıyla birlikte teslim etmeyi taahhüt ederim.'),
  paragraph('İş yeri belirtilen tarihte boşaltılmazsa, kiraya veren TBK m. 352/1 koşullarında icraya başvurabilir veya tahliye davası açabilir. Kanunen yüklenen takip ve yargılama giderleri ile hükmedilen karşı vekâlet ücreti saklıdır.'),
  paragraph('Taahhüt fiilî teslimden sonra ayrı olarak imzalanır. Taahhüt tarihi gerçek imza gününde doldurulur.'),
  tableRow('Taahhüt tarihi (gerçek imza günü)','____ / ____ / 20____')
 ],'<div class="business-signatures">'+tenantSignature+'</div>');

 if(note){
  append('Bono',[
   '<h1>EMRE MUHARRER SENET (BONO)</h1>',
   tableRow('Ödeme yeri',note.paymentPlace),tableRow('Vade tarihi','____ / ____ / 20____'),tableRow('Bono no',blank),
   tableRow('Türk lirası',textWords(note.amount)),
   paragraph('İşbu bono karşılığında '+landlord.name+' veya emrine '+textWords(note.amount)+' tutarını kayıtsız ve şartsız ödeyeceğim.'),
   tableRow('Düzenleme tarihi (gerçek imza günü)',packDate(note.date)),tableRow('Düzenleme yeri',note.place),
   tableRow(company?'Düzenleyen şirket / Vergi no':'Düzenleyen / T.C.',fields(tenant.name,company?tenant.taxNo:tenant.tc)),
   tableRow('Düzenleyenin adresi / Telefon',fields(tenant.address,tenant.phone)),
   ...(company?[tableRow('Şirket adına yetkili temsilci',representative.name)]:[]),
   ...(aval?[heading('DÜZENLEYEN LEHİNE AVAL İÇİNDİR')+tableRow('Aval veren · T.C. / Adres',fields(aval.name,aval.tc,aval.address))]:[])
  ],'<div class="business-signatures">'+tenantSignature+(aval?signature('Aval veren',aval.name,'T.C. '+(aval.tc||blank)):'')+'</div>');
 }

 for(const [i,page] of pages.entries()){
  page.querySelector('.business-page-number').textContent=page.dataset.section+' · Kiracı: '+variant+' · Sayfa '+(i+1)+' / '+pages.length;
 }
 output.scrollIntoView({behavior:'smooth',block:'start'});
}
