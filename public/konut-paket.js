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

function fixtureStatements(selected,extras){
 const actions={sound:'sağlam durumda teslim edildi',repair:'onarılarak teslim edilecektir',replace:'yenilenerek teslim edilecektir',install:'montajı yapılarak teslim edilecektir'};
 const groups=new Map();
 for(const item of selected){
  const date=item.date?.split('-').reverse().join('.');
  const ending=(item.status!=='sound'&&date?date+' tarihine kadar ':'')+actions[item.status];
  if(!groups.has(ending))groups.set(ending,[]);
  groups.get(ending).push(item.name);
 }
 const statements=Array.from(groups,([ending,names])=>names.join(', ')+' '+ending+'.');
 if(extras?.trim())statements.push(extras.trim().replace(/[.,;\s]+$/,'')+' sağlam durumda teslim edildi.');
 return statements;
}

function housingFixtureRows(value) {
 const rows = String(value ?? '').split(/\r?\n/).map(row=>row.trim());
 if(rows.length<=9)return rows;
 return [...rows.slice(0,8),rows.slice(8).filter(Boolean).join(', ')];
}

// Coordinates use the uploaded six-page form's original PDF points.
function renderHousingPacket({d,p,l,t,gs,sp,rent,deposit,packDate,yearEnd,textWords,money,words,person}) {
 const formatPerson = who => who && ({...who,name:String(who.name||'').trim().replace(/\p{L}+/gu,
  word=>word[0].toLocaleUpperCase('tr-TR')+word.slice(1).toLocaleLowerCase('tr-TR'))});
 l=formatPerson(l);t=formatPerson(t);gs=gs.map(formatPerson);sp=formatPerson(sp);
 const aval=formatPerson(person(d.aval));
 d={...d,iban:normalizeRentIban(d.iban)};
 const warnings=[];
 for(const who of new Set([l,t,...gs,sp,aval].filter(Boolean))){
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
 const day=String(d.paymentDay||'').trim();
 const payment=/^([1-9]|[12]\d|3[01])$/.test(day)?'Her ayın '+day+'. günü':day||d.payment?.trim()||"Her ayın 15'inde";
 const paymentSentence='Aylık '+money(rent)+' kira bedeli '+payment.replace(/^Her /,'her ')+
  ' kiraya verenin '+(d.iban?d.iban+' IBAN numaralı ':'')+'hesabına yatırılacaktır.';
 const identity = who => [who.name,who.tc,who.phone].filter(Boolean).join(' / ');
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
  const lines=[''];
  for(const word of String(value).trim().split(/\s+/)){
   const last=lines.length-1, next=[lines[last],word].filter(Boolean).join(' ');
   if(measuring.measureText(word).width>width-2)throw new Error('Bu bilgi ayrılan alana sığmıyor: '+word);
   if(lines[last] && measuring.measureText(next).width>width-2)lines.push(word);
   else lines[last]=next;
  }
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
  sheet(1);
  put(leaseBlock('KONUT (MESKEN) KİRA SÖZLEŞMESİ',width,16),left,25);
  const rows=table.map(([label,value],i)=>({
   key:leaseBlock(label,181),val:leaseBlock(value||' ',width-193),address:i===2||i===4
  }));
  const parties=[...gs.map(g=>['Müteselsil kefil',g]),['Kiracı',t],['Kiraya veren',l]];
  const col=width/parties.length;
  const signatures=parties.map(([role,who])=>[role,who.name,'T.C. '+(who.tc||''),'İmza __________'].map(v=>leaseBlock(v,col-5)));
  const footer=801-Math.max(...signatures.map(items=>items.reduce((n,b)=>n+b.height+1,0)));
  const kurus=annualKurus%100;
  const written=words(Math.floor(annual))+' Türk Lirası'+(kurus?' '+words(kurus)+' Kuruş':'');
  const clauses=HOUSING_CLAUSES.map((s,i)=>{
   if(i===10)s='Madde 11 – Kira ve Ödeme: '+paymentSentence;
   if(i===12)s='Madde 13 – Bono: Taraflarca 12 aylık kira tutarı esas alınarak '+money(annual)+' bedelli tek bono düzenlenmesi öngörülmüştür. Aynı borç için mükerrer tahsilat yapılamaz; TBK m. 342 saklıdır.';
   return leaseBlock(s,width,12,1.12);
  });
  const leasePages=[page];
  let y=52;
  const bottom=footer-8;
  function nextPage(){
   sheet(2);leasePages.push(page);y=23;
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
  if(y+tableHeight+2*unit*rows.length>bottom)throw new Error('Sözleşme tablosu ilk sayfaya sığmıyor. Uzun adres ve kişi bilgilerini kontrol edin.');
  for(const [i,row] of rows.entries()){
   const height=heights[i]+2*unit;
   rule(left,y,width);put(row.key,left+3,y+unit);put(row.val,left+190,y+unit);
   y+=height;
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
   const notes=group.map(g=>leaseBlock('Müteselsil kefil · '+g.name+' · Azami sorumluluk tutarı: '+money(annual)+' ('+written+').',cell));
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
   page=leasePage;rule(left,footer-3,width);
   signatures.forEach((parts,j)=>{let fy=footer;for(const part of parts){put(part,left+j*col,fy);fy+=part.height+1;}});
   put(leaseBlock('Sayfa '+(i+1)+' / '+leasePages.length,90),479,812);
  });
 }
 try {
  layoutLease();
  const statements=fixtureStatements(JSON.parse(d.fixtureSelection||'[]'),d.extraSoundFixtures);
  const fixturePages=[[]];
  if(statements.length){
   const previous=housingFixtureRows(d.fixtures??p.fixtures).flatMap((name,i)=>name?
    [[name,d['fixtureQty'+(i+1)]&&d['fixtureQty'+(i+1)]+' adet',d['fixtureState'+(i+1)]].filter(Boolean).join(' · ')]:[]);
   let used=0;
   for(const line of [...previous,...statements]){
    const wrapped=leaseBlock(line,500);
    for(let offset=0;offset<wrapped.lines.length;){
     const capacity=Math.floor((268-used)/14.16);
     if(capacity<1){fixturePages.push([]);used=0;continue;}
     const lines=wrapped.lines.slice(offset,offset+capacity);
     const block={...wrapped,lines,height:lines.length*14.16};
     fixturePages.at(-1).push(block);used+=block.height+5;offset+=lines.length;
    }
   }
  }
  for(const blocks of fixturePages){
  sheet(4);
  clearArea(40,67,516,132);
  const addressHeight=Math.min(54,Math.max(30,leaseBlock(address,357).height+2));
  let headerY=71;
  for(const [label,value,height] of [['Kiralananın adresi',address,addressHeight],['Kiraya veren',l.name,24],['Kiracı',t.name,24],['Teslim tarihi',packDate(d.contractDate),22]]){
   field(43,headerY,145,height,label);field(193,headerY,359,height,value);
   headerY+=height;
  }
  if(!statements.length)housingFixtureRows(d.fixtures ?? p.fixtures).forEach((value,index)=>{
   if(!value)return;
   const y=261+index*27;
   field(83,y,234,22,value);
   field(327,y,73,22,d['fixtureQty'+(index+1)],11);
   field(410,y,137,22,d['fixtureState'+(index+1)],11);
  });
  if(statements.length){
   const panel=document.createElement('div');
   panel.style.cssText='position:absolute;left:40pt;top:223pt;width:516pt;height:285pt;background:white;';
   page.append(panel);
   let y=230;
   for(const block of blocks){put(block,47,y);y+=block.height+5;}
  }
  [[545,d.electricMeter],[572,d.waterMeter],[599,d.gasMeter]].forEach(([y,v])=>field(194,y-2,338,19,v));
  const ekSigners=[['Kiraya veren',l],['Kiracı',t],...(gs.length?gs:[null]).map(g=>['Kefil',g])];
  const colWidth=511/ekSigners.length;
  const footer=document.createElement('div');
  footer.style.cssText='position:absolute;left:40pt;top:704pt;width:514pt;height:104pt;background:white;';
  page.append(footer);
  ekSigners.forEach(([role,who],i)=>{
   const x=43+i*colWidth;
   field(x,711,colWidth-5,19,role,12);
   field(x,731,colWidth-5,32,who?.name,12);
   field(x,764,colWidth-5,19,'T.C.: '+(who?.tc||''),12);
   field(x,789,colWidth-5,17,'İmza: _________',12);
  });
  }
  sheet(5);
  [[76,t.name],[95,t.tc],[135,l.name],[154,l.tc]].forEach(([y,v])=>field(240,y-1,318,17,v,12,true));
  clearArea(35,171,525,63);
  field(37,173,520,16,'TAHLİYE EDİLECEK KONUT');
  field(37,190,90,16,'AÇIK ADRES');
  field(133,187,425,32,address);
  field(37,220,188,16,'TAHLİYE TARİHİ');field(235,220,280,16,': ..... / ..... / 20....');
  field(307,480,240,16,t.name);
  if(sp){field(136,602,300,15,sp.name,12,true);field(125,636,300,15,sp.tc,12,true);}
  sheet(6);
  const kurus = annualKurus % 100;
  const writtenAmount = words(Math.floor(annual))+' Türk Lirasını'+(kurus?' ve '+words(kurus)+' Kuruşu':'');
  const paragraphs = [
   'İşbu emre muharrer senedim kira bedeli mukabilinde .... / .... / 20.... tarihinde Sayın '+l.name+' veya emrühavalesine yukarıda yazılı yalnız '+writtenAmount+' ödeyeceğim. Bedeli nakden ahzolunmuştur.',
   'İşbu bono vadesinde ödenmediği takdirde, müteakip bonoların da muacceliyet kesbedeceğini, ihtilaf vukuunda Konya mahkeme ve icra dairelerinin yetkili olacağını kabul ederim.'
  ];
  const amount = '—'+money(annual)+'—';
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
  field(557,321,98,18,packDate(d.contractDate),13,true);
  clearArea(50,339,389,201);
  let debtorY=344;
  for(const [label,value] of [['İsim / Unvan',t.name],['Adres',t.address],['Tel',t.phone],['V.D. No / T.C. No',t.tc],['Kefil',aval?.name],['T.C. / V.D. No',aval?.tc]]){
   const height=Math.min(60,Math.max(19,leaseBlock(value||' ',250,13).height+2));
   field(55,debtorY,126,height,label,13);field(184,debtorY,250,height,value,13);
   debtorY+=height+4;
  }
 } catch(error) {
  output.replaceChildren();output.classList.add('hidden');alert(error.message);return;
 }
 output.scrollIntoView({behavior:'smooth',block:'start'});
}
