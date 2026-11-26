const HOUSING_CLAUSES = [
 "Madde 1 - Kullanım Amacı: Kiracı, kiralananı yalnızca mesken amacıyla kullanır; kiraya verenin yazılı izni olmadan kullanım amacını değiştiremez.",
 "Madde 2 - Özenle Kullanım ve Komşuluk Hukuku: Kiracı, kiralananı ve ortak alanları özenle kullanır, komşulara saygı gösterir ve kusuruyla doğan zararlardan TBK m. 316 uyarınca sorumludur.",
 "Madde 3 – Devir ve Alt Kiralama: Kiraya verenin yazılı izni olmadan kiralanan devredilemez, alt kiraya verilemez veya üçüncü kişilere kullandırılamaz (TBK m. 322–323).",
 "Madde 4 – Tadilat: Kiraya verenin yazılı izni olmadan esaslı tadilat yapılamaz. İzinsiz değişikliklerden doğan zarar kiracıya aittir (TBK m. 321).",
 "Madde 5 – Aidat ve Yan Giderler: Elektrik, su, doğalgaz, internet ve kullanıma bağlı olağan aidat ve işletme giderleri kiracıya aittir. Kanunen kiraya verene ait giderler saklıdır.",
 "Madde 6 – Bakım ve Arıza Bildirimi: Kiracı olağan temizlik ve küçük bakım işlerini yapar; önemli arıza ve ayıpları gecikmeden kiraya verene bildirir (TBK m. 317–318).",
 "Madde 7 – Teslim ve İade: Kiracı, kiralananı olağan kullanım kaynaklı yıpranma dışında teslim aldığı durumda iade eder; demirbaş eksikleri ve sorumlu olduğu zararları karşılar (TBK m. 334).",
 "Madde 8 – Gösterim: Kiracı, satış veya yeniden kiralama için makul süre önceden haber verilmesi ve uygun saatlerde olması şartıyla gösterime izin verir (TBK m. 319).",
 "Madde 9 – Ortak Alanlar: Kiracı ortak alanları yönetim planına uygun kullanır; komşuların kullanım haklarını ihlal etmez.",
 "Madde 10 – Uygulanacak Hukuk: Bu sözleşmede düzenlenmeyen hususlarda 6098 sayılı TBK ve ilgili mevzuat uygulanır.",
 "",
 "Madde 12 – Kira Artışı: Yenilenen kira dönemlerinde artış, TBK m. 344 ve yürürlükteki emredici sınırlara göre yapılır.",
 "",
 "Madde 14 – Müteselsil Kefalet: Kefil, kanuni şekil şartları yerine getirilmek kaydıyla, aşağıda kendi el yazısıyla belirttiği azami tutara kadar müteselsil kefil olur (TBK m. 583–584).",
 "Madde 15 – Erken Tahliye: Kiracı erken tahliyede, TBK m. 325 uyarınca yeniden kiralama için gereken makul süreye ilişkin kira borçlarından en fazla üç aylık kira bedeliyle sorumludur. Kanuni indirim ve mahsuplar saklıdır.",
 "Madde 16 – Abonelik ve Zararlar: Kiracı, kullanım dönemine ait abonelik ve tüketim borçlarından, kusuruyla verdiği zararlardan sorumludur.",
 "Madde 17 – Temerrüt: Kira veya yan giderlerin ödenmemesinde TBK m. 315 uyarınca en az 30 gün süreli yazılı ihtar verilir. Kiraya verenin kanuni hakları saklıdır.",
 "Madde 18 – Kişisel Veriler: Tarafların kişisel verileri yalnızca sözleşmenin kurulması ve yürütülmesi amacıyla mevzuata uygun işlenir.",
 "Madde 19 – Bildirim ve Tebligat Adresleri: Kiracının tebligat adresi kiralanan taşınmazın adresidir. Kefillerin tebligat adresleri sözleşmenin birinci sayfasında belirtilmiştir. Adres değişiklikleri kiraya verene yazılı olarak bildirilir. Resmî tebligatlarda 7201 sayılı Tebligat Kanunu hükümleri saklıdır.",
 "Madde 20 – Deliller: Hukuka uygun belge, kayıt ve yazışmalar genel ispat kuralları çerçevesinde değerlendirilir.",
 "Madde 21 – Mücbir Sebep: Mücbir sebep hâllerinde tarafların hak ve yükümlülükleri ilgili mevzuata tabidir.",
 "Madde 22 – Tahliye Taahhüdü: Kiralananın tesliminden sonra usulüne uygun verilen yazılı tahliye taahhüdüne TBK m. 352/1 uygulanır.",
 "Madde 23 – Anahtar ve Hasar Tespiti: Anahtar teslimi, sayaç endeksleri, demirbaşlar ve varsa hasarlar taraflarca imzalanan teslim tutanağıyla belirlenir (TBK m. 334–335).",
 "Madde 24 – Sözleşmenin Bütünlüğü: Herhangi bir hükmün geçersizliği diğer hükümleri etkilemez. Değişiklikler yazılı olarak yapılır.",
 "Madde 25 – Yetki: Uyuşmazlıklarda kanunen görevli ve yetkili mahkeme ve icra dairelerine başvurulur.",
 "Madde 26 – Yürürlük ve Nüshalar: Sözleşme taraflarca imzalanarak yürürlüğe girer; kiraya veren, kiracı ve kefil için üç nüsha düzenlenir."
];

function normalizeRentIban(value){
 const iban=String(value||'').replace(/\s+/g,'').toUpperCase();
 if(iban==='TR')return '';
 return /^\d/.test(iban)?'TR'+iban:iban;
}

function housingFixtureLines(value){
 return String(value??'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
}

function housingFixtureStatements(value){
 const names=[],notes=[];
 const soundEnding=/(?:^|[\s·,:;\-–—]+)sağlam(?:\s+(?:olarak|durumda))?\s+teslim\s+edildi[.!]*$/u;
 const specialCondition=/(?:^|[^\p{L}])(?:arızal|bozuk|çalışmıyor|çizik|çatlak|değil|eksik|hasarl|kırık|onar|sızdır|sökük|takılacak|tamir|teslim edil|yapılacak|yenilen|yok|değiştir)/u;
 const quantity=/^\d+(?:[.,]\d+)?(?:\s+(?:adet|takım|set|çift))?\)?$/u;
 for(const line of housingFixtureLines(value)){
  const sound=line.toLocaleLowerCase('tr-TR').match(soundEnding);
  const item=(sound?line.slice(0,sound.index):line).replace(/[\s.,;]+$/u,'');
  if(!item)continue;
  const normalized=item.toLocaleLowerCase('tr-TR');
  const details=normalized.split(/\s*·\s*|\s+[-–—]\s*|:\s+|\s*\(/u).slice(1);
  if(specialCondition.test(normalized)||(!sound&&details.some(detail=>detail&&!quantity.test(detail.trim()))))notes.push(line);
  else names.push(item);
 }
 if(names.length)notes.unshift(names.join(', ')+' sağlam olarak teslim edildi.');
 return notes;
}

function archivedHousingFixtures(fields,propertyFixtures){
 if(typeof fields.housingFixtureList==='string')return fields.housingFixtureList;
 const actions={sound:'sağlam durumda teslim edildi',repair:'onarılarak teslim edilecektir',replace:'yenilenerek teslim edilecektir',install:'montajı yapılarak teslim edilecektir'};
 const lines=String(fields.fixtures??propertyFixtures??'').split(/\r?\n/).flatMap((value,i)=>{
  const name=value.trim();
  const quantity=fields['fixtureQty'+(i+1)];
  return name?[[name,quantity&&quantity+' adet',fields['fixtureState'+(i+1)]].filter(Boolean).join(' · ')]:[];
 });
 let selected;
 try{selected=JSON.parse(fields.fixtureSelection||'[]');}catch{selected=[];}
 if(Array.isArray(selected))for(const item of selected){
  if(!item?.name)continue;
  const date=item.status!=='sound'&&item.date?String(item.date).split('-').reverse().join('.')+' tarihine kadar ':'';
  lines.push([item.name,actions[item.status]&&date+actions[item.status]].filter(Boolean).join(' · '));
 }
 for(const line of housingFixtureLines(fields.extraSoundFixtures)){
  lines.push(line.replace(/[.,;]+$/,'')+' · '+actions.sound);
 }
 return lines.join('\n');
}

function housingGuarantorWarnings(guarantors){
 return guarantors.flatMap(who=>{
  const missing=[];
  if(!/^\d{11}$/.test(String(who.tc??'').trim()))missing.push('T.C. kimlik numarası (11 rakam)');
  if(!String(who.phone??'').trim())missing.push('telefon');
  if(!String(who.address??'').trim())missing.push('tebligat adresi');
  return missing.length?[who.name+' için kontrol edin: '+missing.join(', ')+'.']:[];
 });
}

let housingPdfFont;
async function prepareLeasePdfText(pdf){
 housingPdfFont??=Promise.all([
  new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src='/pdf/fontkit-1.1.1.min.js';
   script.onload=()=>resolve(window.fontkit);
   script.onerror=()=>{script.remove();reject(new Error('PDF yazı bileşeni yüklenemedi.'));};
   document.head.append(script);
  }),
  fetch('/pdf/DejaVuSans.ttf').then(response=>{
   if(!response.ok)throw new Error('PDF yazı tipi yüklenemedi.');
   return response.arrayBuffer();
  })
 ]).catch(error=>{housingPdfFont=null;throw error;});
 const [fontkit,fontBytes]=await housingPdfFont;
 pdf.registerFontkit(fontkit);
 const font=await pdf.embedFont(fontBytes,{subset:true});
 return (pdfPage,sheet,width,height)=>{
  const sheetBox=sheet.getBoundingClientRect();
  const scaleX=width/sheetBox.width,scaleY=height/sheetBox.height;
  if(sheet.classList.contains('business-sheet')){
   const walker=document.createTreeWalker(sheet,NodeFilter.SHOW_TEXT);
   const range=document.createRange();
   for(let node=walker.nextNode();node;node=walker.nextNode()){
    const size=parseFloat(getComputedStyle(node.parentElement).fontSize)*scaleY;
    let line='',left=0,top=0;
    const draw=()=>{
     if(line)pdfPage.drawText(line.normalize('NFC'),{x:(left-sheetBox.left)*scaleX,y:height-(top-sheetBox.top)*scaleY-size,size,font,opacity:0});
    };
    for(const word of node.textContent.matchAll(/\S+/gu)){
     range.setStart(node,word.index);range.setEnd(node,word.index+word[0].length);
     const rect=range.getClientRects()[0];
     if(!rect)continue;
     if(line&&Math.abs(rect.top-top)>1){draw();line='';}
     if(!line){left=rect.left;top=rect.top;}
     line+=(line?' ':'')+word[0];
    }
    draw();
   }
   return;
  }
  // Keep the approved forms as the visible layer and add the selectable contract text.
  for(const span of sheet.querySelectorAll(':scope > span')){
   const style=getComputedStyle(span),box=span.getBoundingClientRect();
   const size=parseFloat(style.fontSize)*scaleY,leading=parseFloat(style.lineHeight)*scaleY;
   const x=(box.left-sheetBox.left)*scaleX,top=(box.top-sheetBox.top)*scaleY;
   for(const [i,line] of span.textContent.normalize('NFC').split('\n').entries()){
    if(line.trim())pdfPage.drawText(line,{x,y:height-top-size-i*leading,size,font,opacity:0});
   }
  }
 };
}

// Coordinates use the uploaded six-page form's original PDF points.
function createLeaseSheets(output){
 const measuring = document.createElement('canvas').getContext('2d');
 let page;
 function sheet(number) {
  page = document.createElement('article');
  page.className = 'packet-page housing-sheet' + (number === 6 ? ' housing-note' : '');
  if(number>3){
  const background = new Image();
  background.src = number===6 ? '/konut-v1/bono-orta-metin.png' : '/konut-v1/'+number+'.png';
  background.alt = ['Konut kira sözleşmesi','Genel şartlar','Kefalet ve imzalar','Demirbaş ve sayaç teslim tutanağı','Tahliye taahhütnamesi','Bono'][number-1];
  page.append(background);
  }
  output.append(page);
  return page;
 }
 function field(x,y,width,height,value,size=12,white=false,weight='bold') {
  if (!value) return;
  const el = document.createElement('span');
  const content = String(value).trim();
  // Wrap and fit the actual Turkish text before freezing it in the archive.
  let lines;
  for (;size>=5;size-=0.25) {
   measuring.font = weight+' '+size+'px Arial';
   lines = [''];
   for (const word of content.split(/\s+/)) {
    const last = lines.length-1;
    const joined = [lines[last],word].filter(Boolean).join(' ');
    if (lines[last] && measuring.measureText(joined).width > width-1) lines.push(word);
    else lines[last] = joined;
   }
   if (lines.length*size*1.12<=height && lines.every(line=>measuring.measureText(line).width<=width-1)) break;
  }
  if(size<5) throw new Error('Bu alandaki bilgi sözleşmeye sığmıyor: '+content.slice(0,50));
  el.style.cssText = 'position:absolute;left:'+x+'pt;top:'+y+'pt;width:'+width+'pt;height:'+height+'pt;font:'+weight+' '+size+'pt/1.12 Arial,sans-serif;color:black;text-align:left;white-space:pre;'+(white?'background:white;':'');
  el.textContent = lines.join('\n');
  page.append(el);
 }
 function leaseBlock(value,width,size=12,leading=1.18) {
  const lineHeight=size*leading;
  measuring.font='bold '+size+'px Arial';
  const lines=[];
  let line='';
  for(const word of String(value).trim().split(/\s+/)){
   const next=line?line+' '+word:word;
   if(measuring.measureText(next).width<=width-2){line=next;continue;}
   if(line)lines.push(line);
   if(measuring.measureText(word).width<=width-2){line=word;continue;}
   line='';
   for(const letter of word){
    if(line&&measuring.measureText(line+letter).width>width-2){lines.push(line);line='';}
    line+=letter;
   }
  }
  lines.push(line);
  return {lines,width,size,leading,height:lines.length*lineHeight};
 }
 function put(block,x,y){
  const el=document.createElement('span');
  el.style.cssText='position:absolute;left:'+x+'pt;top:'+y+'pt;width:'+block.width+'pt;height:'+block.height+'pt;font:bold '+block.size+'pt/'+block.leading+' Arial,sans-serif;color:#151515;text-align:left;white-space:pre;';
  el.textContent=block.lines.join('\n');page.append(el);
 }
 function rule(x,y,width){
  const el=document.createElement('div');
  el.style.cssText='position:absolute;left:'+x+'pt;top:'+y+'pt;width:'+width+'pt;height:0.6pt;background:#a5a5a5;';
  page.append(el);
 }
 function clearArea(x,y,width,height){
  const panel=document.createElement('div');
  panel.style.cssText='position:absolute;left:'+x+'pt;top:'+y+'pt;width:'+width+'pt;height:'+height+'pt;background:white;';
  page.append(panel);
 }
 return {sheet,selectPage:next=>{page=next;},field,leaseBlock,put,rule,clearArea,measuring};
}

const leasePaymentDayPattern=/^([1-9]|[12]\d|3[01])$/;
function leasePaymentText(d){
 const day=String(d.paymentDay||'').trim();
 return leasePaymentDayPattern.test(day)?'Her ayın '+day+'. günü':day||d.payment?.trim()||"Her ayın 15'inde";
}

function renderHousingPacket({d,p,l,t,gs,sp,rent,deposit,guarantorMax,packDate,yearEnd,textWords,money,words,person}) {
 const formatPerson = who => who && ({...who,name:String(who.name||'').trim().replace(/\p{L}+/gu,
  word=>word[0].toLocaleUpperCase('tr-TR')+word.slice(1).toLocaleLowerCase('tr-TR'))});
 l=formatPerson(l);t=formatPerson(t);gs=gs.map(formatPerson);sp=formatPerson(sp);
 const aval=formatPerson(person(d.aval));
 d={...d,iban:normalizeRentIban(d.iban)};
 const warnings=housingGuarantorWarnings(gs);
 for(const who of new Set([l,t,sp,aval].filter(Boolean))){
  if(!/^\d{11}$/.test(String(who.tc||'')))warnings.push(who.name+' için T.C. kimlik numarasını kontrol edin (11 rakam).');
 }
 if(d.iban && !/^TR\d{7}[A-Z0-9]{17}$/.test(d.iban))warnings.push('Türkiye IBAN bilgisini kontrol edin (TR ile başlayan 26 karakter).');
 document.getElementById('housingDataWarnings').textContent=[...new Set(warnings)].join(' ');
 const output = document.getElementById('docOutput');
 output.replaceChildren();
 output.classList.remove('hidden');
 output.classList.add('packet-output');
 const annualKurus = Math.round(rent * 100) * 12;
 const annual = annualKurus / 100;
 const address = [p.city,p.district,p.address].filter(Boolean).join(' / ');
 const payment=leasePaymentText(d);
 const paymentSentence='Aylık '+money(rent)+' kira bedeli '+payment.replace(/^Her /,'her ')+
  ' kiraya verenin '+(d.iban?d.iban+' IBAN numaralı ':'')+'hesabına yatırılacaktır.';
 const identity = who => [who.name,who.tc,who.phone].filter(Boolean).join(' / ');
 const drawing=createLeaseSheets(output);
 const {sheet,leaseBlock,put,rule}=drawing;
 function layoutLease(){
  const left=25,width=545;
  const depositReceipt=deposit>0?money(deposit)+' depozito alınmıştır.':'Depozito alınmamıştır (0,00 TL).';
  const table=[
   ['İmzalanma tarihi / Cinsi',packDate(d.contractDate)+' / Mesken'],
   ['Kiraya veren · T.C. / Tel.',identity(l)],['Kiraya verenin ikametgâhı',l.address],
   ['Kiracı · Ad soyad / T.C. / Tel.',identity(t)],['Kiralananın açık adresi',address],
   ...gs.flatMap((g,i)=>[
    ['Kefil '+(i+1)+' · '+g.name,'T.C.: '+(g.tc||'—')+' · Tel.: '+(g.phone||'—')],
    ['Tebligat adresi',String(g.address??'').trim()||'—']
   ]),
   ['Bir aylık kira karşılığı',textWords(rent)],['Kiranın ödenme şekli',paymentSentence],
   ['Kira artış oranı','TÜFE 12 aylık ortalamalara göre değişim oranı (TBK m. 344)'],['Kira süresi',packDate(d.contractDate)+' – '+packDate(yearEnd(d.contractDate))+' (1 yıl)'],
   ['Kira başlangıcı',packDate(d.contractDate)+' tarihinden itibaren kira başlamıştır.'],['DASK poliçe numarası',d.contractDask||p.dask||''],
   ['Teslim edilen demirbaşlar','EK-1 Demirbaş ve Sayaç Teslim Tutanağı'],['Depozito',depositReceipt]
  ];
  const firstPage=sheet(1);
  put(leaseBlock('KONUT (MESKEN) KİRA SÖZLEŞMESİ',width,16),left,25);
  const rows=table.map(([label,value],i)=>({
   key:leaseBlock(label,181),val:leaseBlock(value||' ',width-193),address:i===2||i===4
  }));
  const parties=[...gs.map(g=>['Müteselsil kefil',g]),['Kiracı',t],['Kiraya veren',l]];
  const col=width/parties.length;
  const signatures=parties.map(([role,who])=>[role,who.name,'T.C. '+(who.tc||''),'İmza __________'].map(v=>leaseBlock(v,col-5)));
  const footer=801-Math.max(...signatures.map(items=>items.reduce((n,b)=>n+b.height+1,0)));
  const clauses=HOUSING_CLAUSES.map((s,i)=>{
   if(i===10)s='Madde 11 – Kira ve Ödeme: '+paymentSentence;
   if(i===12)s='Madde 13 – Bono: Taraflarca 12 aylık kira tutarı esas alınarak '+money(annual)+' bedelli tek bono düzenlenmesi öngörülmüştür. Aynı borç için mükerrer tahsilat yapılamaz; TBK m. 342 saklıdır.';
   return leaseBlock(s,width);
  });
  const leasePages=[firstPage];
  let y=52;
  const bottom=footer-8;
  function nextPage(){
   leasePages.push(sheet(2));y=23;
  }
  function place(block){
   if(y+block.height>bottom)nextPage();
   put(block,left,y);y+=block.height+2;
  }
  const heading=leaseBlock('GENEL ŞARTLAR',width,14);
  const general=clauses.slice(0,10);
  const heights=rows.map(row=>Math.max(row.key.height,row.val.height,row.address?2*14.16:0));
  const tableHeight=heights.reduce((sum,h)=>sum+h,0);
  const textHeight=tableHeight+heading.height+general.reduce((sum,b)=>sum+b.height,0);
  // Share spare space between table padding and paragraph gaps after measuring the actual entries.
  const spare=bottom-y-textHeight-14;
  const unit=Math.max(1,Math.min(3,spare/(rows.length*2+general.length*1.5)));
  const lineHeight=12*1.18;
  const capacity=()=>Math.floor((bottom-y-2*unit-1)/lineHeight);
  const fullPageCapacity=Math.floor((bottom-23-2*unit-1)/lineHeight);
  if(fullPageCapacity<1)throw new Error('İmza alanları sayfaya sığmıyor. Kefil adlarını ve sayısını kontrol edin.');
  for(const [i,row] of rows.entries()){
   const rowLines=Math.round(heights[i]/lineHeight);
   if(rowLines<=fullPageCapacity&&rowLines>capacity()){rule(left,y,width);nextPage();}
   for(let offset=0;offset<rowLines;){
    if(capacity()<1){rule(left,y,width);nextPage();}
    const count=Math.min(capacity(),rowLines-offset);
    rule(left,y,width);
    for(const [block,x] of [[row.key,left+3],[row.val,left+190]]){
     const lines=block.lines.slice(offset,offset+count);
     if(lines.length)put({...block,lines,height:lines.length*lineHeight},x,y+unit);
    }
    y+=count*lineHeight+2*unit;
    offset+=count;
   }
  }
  rule(left,y,width);y+=9;
  if(y+heading.height+5+general[0].height>bottom)nextPage();
  put(heading,left,y);y+=heading.height+5;
  for(const block of general){
   if(y+block.height>bottom)nextPage();
   put(block,left,y);y+=block.height+1.5*unit;
  }
  if(leasePages.length===1)nextPage();
  place(leaseBlock('ÖZEL ŞARTLAR',width,14));
  clauses.slice(10).forEach(place);

  // Two guarantors can handwrite independently in adjacent columns.
  for(let i=0;i<gs.length;i+=2){
   const group=gs.slice(i,i+2);
   const gap=14,cell=(width-gap*(group.length-1))/group.length;
   const limit=guarantorMax>0?textWords(guarantorMax):'________________ TL';
   const end=d.guarantorEnd?' Kefalet bitiş tarihi: '+packDate(d.guarantorEnd)+'.':'';
   const notes=group.map(g=>leaseBlock('Müteselsil kefil · '+g.name+' · Azami sorumluluk tutarı: '+limit+'.'+end,cell));
   const prompt=leaseBlock('El yazısıyla: Azami tutar, kefalet tarihi ve “Müteselsil kefil olmayı kabul ediyorum.”',cell);
   const headerHeight=Math.max(...notes.map(n=>n.height))+prompt.height+4;
   const penHeight=60;
   if(y+headerHeight+penHeight+5>bottom)nextPage();
   const start=y+3;
   notes.forEach((note,j)=>{
    const x=left+j*(cell+gap);
    put(note,x,start);put(prompt,x,start+headerHeight-prompt.height);
    for(let k=1;k<=3;k++)rule(x,start+headerHeight+k*penHeight/3,cell-2);
   });
   y=start+headerHeight+penHeight+2;
  }
  leasePages.forEach((leasePage,i)=>{
   drawing.selectPage(leasePage);rule(left,footer-3,width);
   signatures.forEach((parts,j)=>{let fy=footer;for(const part of parts){put(part,left+j*col,fy);fy+=part.height+1;}});
   put(leaseBlock('Sayfa '+(i+1)+' / '+leasePages.length,90),479,812);
  });
 }
 try {
  layoutLease();
  appendLeaseAttachments({
   drawing,address,landlord:l,tenant:t,guarantors:gs,spouse:sp,
   fixtureList:d.housingFixtureList,deliveryDate:packDate(d.contractDate),meters:[d.electricMeter,d.waterMeter,d.gasMeter],
   note:{amount:annual,date:packDate(d.contractDate)},aval,money,words
  });
 } catch(error) {
  output.replaceChildren();output.classList.add('hidden');alert(error.message);return;
 }
 output.scrollIntoView({behavior:'smooth',block:'start'});
}

function appendLeaseAttachments({drawing,address,landlord:l,tenant:t,guarantors:gs=[],spouse:sp,
 fixtureList,deliveryDate,meters,note,aval,money,words,evictionText,company=false}){
 const {sheet,field,leaseBlock,put,rule,clearArea,measuring}=drawing;
 const business=Boolean(evictionText);
  const statements=housingFixtureStatements(fixtureList);
  const fixturePages=[[]];
  const fixtureGap=2;
  if(statements.length){
   let used=0;
   for(const line of statements){
    const wrapped=leaseBlock(line,500);
    for(let offset=0;offset<wrapped.lines.length;){
     const capacity=Math.floor((268-used)/14.16);
     if(capacity<1){fixturePages.push([]);used=0;continue;}
     const lines=wrapped.lines.slice(offset,offset+capacity);
     const block={...wrapped,lines,height:lines.length*14.16};
     fixturePages.at(-1).push(block);used+=block.height+fixtureGap;offset+=lines.length;
    }
   }
  }
  for(const blocks of fixturePages){
  const page=sheet(4);
  clearArea(40,67,516,132);
  const addressHeight=Math.min(54,Math.max(30,leaseBlock(address,357).height+2));
  let headerY=71;
  for(const [label,value,height] of [['Kiralananın adresi',address,addressHeight],['Kiraya veren',l.name,24],['Kiracı',t.name,24],['Teslim tarihi',deliveryDate,22]]){
   field(43,headerY,145,height,label);field(193,headerY,359,height,value);
   headerY+=height;
  }
  if(statements.length){
   const panel=document.createElement('div');
   panel.style.cssText='position:absolute;left:40pt;top:223pt;width:516pt;height:285pt;background:white;';
   page.append(panel);
   let y=230;
   for(const block of blocks){put(block,47,y);y+=block.height+fixtureGap;}
  }
  meters.forEach((value,i)=>field(194,543+i*27,338,19,value));
  const ekSigners=[['Kiraya veren',l],['Kiracı',t],...(business?[]:(gs.length?gs:[null]).map(g=>['Kefil',g]))];
  const colWidth=511/ekSigners.length;
  const footer=document.createElement('div');
  footer.style.cssText='position:absolute;left:40pt;top:704pt;width:514pt;height:104pt;background:white;';
  page.append(footer);
  ekSigners.forEach(([role,who],i)=>{
   const x=43+i*colWidth;
   field(x,711,colWidth-5,19,role,12);
   field(x,731,colWidth-5,32,who?.name,12);
   const companySigner=company&&who===t;
   field(x,764,colWidth-5,19,companySigner?'Yetkili: ______________':'T.C.: '+(who?.tc||''),12);
   field(x,789,colWidth-5,17,companySigner?'Yetkili imzası / şirket kaşesi':'İmza: _________',12);
  });
  }
  sheet(5);
  const evictionParties=[...(company?[]:[[76,t.name],[95,t.tc]]),[135,l.name],[154,l.tc]];
  evictionParties.forEach(([y,v])=>field(240,y-1,318,17,v,12,true));
  clearArea(35,171,525,63);
  field(37,173,520,16,business?'TAHLİYE EDİLECEK İŞ YERİ':'TAHLİYE EDİLECEK KONUT');
  field(37,190,90,16,'AÇIK ADRES');
  field(133,187,425,32,address);
  field(37,220,188,16,'TAHLİYE TARİHİ');field(235,220,280,16,': ..... / ..... / 20....');
  if(business){
   clearArea(35,234,525,220);
   let y=242;
   for(const paragraph of evictionText){
    const block=leaseBlock(paragraph,520);
    put(block,37,y);
    y+=block.height+8;
   }
   clearArea(35,529,525,153);
  }
  if(company){
   clearArea(35,58,525,54);
   field(37,58,525,16,'TAAHHÜT EDEN (KİRACI ŞİRKET)');
   field(37,79,146,26,'ŞİRKET UNVANI');
   field(189,79,369,29,t.name);
   clearArea(303,461,257,130);
   field(307,464,250,18,'ŞİRKET ADINA YETKİLİ');
   field(307,487,250,19,'Ad soyad: ____________________');
   field(307,517,250,19,'Yetkili imzası / şirket kaşesi');
  }else field(307,480,240,16,t.name);
  if(sp){field(136,602,300,15,sp.name,12,true);field(125,636,300,15,sp.tc,12,true);}
  if(!note)return;
  sheet(6);
  const kurus = Math.round(note.amount * 100) % 100;
  const writtenAmount = words(Math.floor(note.amount))+' Türk Lirasını'+(kurus?' ve '+words(kurus)+' Kuruşu':'');
  const paragraphs = business?[
   'İşbu bono karşılığında '+l.name+' veya emrine yalnız '+writtenAmount+' kayıtsız ve şartsız ödeyeceğim.'
  ]:[
   'İşbu emre muharrer senedim kira bedeli mukabilinde .... / .... / 20.... tarihinde Sayın '+l.name+' veya emrühavalesine yukarıda yazılı yalnız '+writtenAmount+' ödeyeceğim. Bedeli nakden ahzolunmuştur.',
   'İşbu bono vadesinde ödenmediği takdirde, müteakip bonoların da muacceliyet kesbedeceğini, ihtilaf vukuunda Konya mahkeme ve icra dairelerinin yetkili olacağını kabul ederim.'
  ];
  const amount = '—'+money(note.amount)+'—';
  field(307,96,342,18,amount,13,true);
  measuring.font='bold 13px Arial';
  const amountEnd=308+measuring.measureText(amount).width;
  if(amountEnd<650)rule(amountEnd,104,650-amountEnd);
  let noteTop=136;
  for(const paragraph of paragraphs){
   const block=leaseBlock(paragraph,726,13);
   if(noteTop+block.height>300)throw new Error('Senet metni ayrılan alana sığmıyor.');
   put(block,55,noteTop);
   block.lines.forEach((line,index)=>{
    const end=57+measuring.measureText(line).width;
    if(end<781)rule(end,noteTop+(index+0.52)*block.size*1.18,781-end);
   });
   noteTop+=block.height+5;
  }
  for(let y=noteTop+3;y<305;y+=9)rule(55,y,726);
  field(557,321,98,18,note.date,13,true);
  clearArea(50,339,389,201);
  let debtorY=344;
  const debtor=company?[['Şirket unvanı',t.name]]:[['İsim / Unvan',t.name],['Adres',t.address],['Tel',t.phone],['V.D. No / T.C. No',t.tc]];
  if(!business||aval)debtor.push(['Kefil',aval?.name],['T.C. / V.D. No',aval?.tc]);
  for(const [label,value] of debtor){
   const height=Math.min(60,Math.max(19,leaseBlock(value||' ',250,13).height+2));
   field(55,debtorY,126,height,label,13);field(184,debtorY,250,height,value,13);
   debtorY+=height+4;
  }
  if(business){
   field(55,505,726,43,'Düzenleme ve ödeme yeri: '+(note.place||'____________________'),12);
   if(company){
    clearArea(466,367,141,106);
    field(471,372,132,35,'YETKİLİ İMZASI / ŞİRKET KAŞESİ',12);
   }
   if(aval){
    clearArea(629,367,144,40);
    field(634,372,134,39,'DÜZENLEYEN LEHİNE AVAL İÇİNDİR',12);
   }else clearArea(624,354,158,134);
  }
}
