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
 "Madde 19 – Bildirim: Adres değişikliği yazılı bildirilmedikçe sözleşmedeki adres esas alınır. Kanuni tebligat usulleri saklıdır.",
 "Madde 20 – Deliller: Hukuka uygun belge, kayıt ve yazışmalar genel ispat kuralları çerçevesinde değerlendirilir.",
 "Madde 21 – Mücbir Sebep: Mücbir sebep hâllerinde tarafların hak ve yükümlülükleri ilgili mevzuata tabidir.",
 "Madde 22 – Tahliye Taahhüdü: Kiralananın tesliminden sonra usulüne uygun verilen yazılı tahliye taahhüdüne TBK m. 352/1 uygulanır.",
 "Madde 23 – Anahtar ve Hasar Tespiti: Anahtar teslimi, sayaç endeksleri, demirbaşlar ve varsa hasarlar taraflarca imzalanan teslim tutanağıyla belirlenir (TBK m. 334–335).",
 "Madde 24 – Sözleşmenin Bütünlüğü: Herhangi bir hükmün geçersizliği diğer hükümleri etkilemez. Değişiklikler yazılı olarak yapılır.",
 "Madde 25 – Yetki: Uyuşmazlıklarda kanunen görevli ve yetkili mahkeme ve icra dairelerine başvurulur.",
 "Madde 26 – Yürürlük ve Nüshalar: Sözleşme taraflarca imzalanarak yürürlüğe girer; kiraya veren, kiracı ve kefil için üç nüsha düzenlenir."
];

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
 d={...d,iban:String(d.iban||'').replace(/\s+/g,'').toUpperCase()};
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
 const payment = d.payment.trim() || "Her ayın 15'inde";
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
 function field(x,y,width,height,value,size=10,white=false,weight='normal') {
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
 function leaseBlock(value,width,size=12) {
  const lineHeight=size*1.18;
  measuring.font='bold '+size+'px Arial';
  const lines=[''];
  for(const word of String(value).trim().split(/\s+/)){
   const last=lines.length-1, next=[lines[last],word].filter(Boolean).join(' ');
   if(measuring.measureText(word).width>width-2)throw new Error('Bu bilgi ayrılan alana sığmıyor: '+word);
   if(lines[last] && measuring.measureText(next).width>width-2)lines.push(word);
   else lines[last]=next;
  }
  return {lines,width,size,height:lines.length*lineHeight};
 }
 function put(block,x,y){
  const el=document.createElement('span');
  el.style.cssText='position:absolute;left:'+x+'pt;top:'+y+'pt;width:'+block.width+'pt;height:'+block.height+'pt;font:bold '+block.size+'pt/1.18 Arial,sans-serif;color:#151515;text-align:left;white-space:pre;';
  el.textContent=block.lines.join('\n');page.append(el);
 }
 function rule(x,y,width){
  const el=document.createElement('div');
  el.style.cssText='position:absolute;left:'+x+'pt;top:'+y+'pt;width:'+width+'pt;height:0.6pt;background:#a5a5a5;';
  page.append(el);
 }
 function layoutLease(){
  const left=32,width=531;
  const depositReceipt=deposit>0?money(deposit)+' depozito alınmıştır.':'Depozito alınmamıştır (0,00 TL).';
  const table=[
   ['İmzalanma tarihi',packDate(d.contractDate)],['Kiralananın cinsi','Mesken'],
   ['Kiraya veren · Ad soyad / T.C. / Tel.',identity(l)],['Kiraya verenin ikametgâhı',l.address],
   ['Kiracı · Ad soyad / T.C. / Tel.',identity(t)],['Kiralananın açık adresi',address],
   ['Bir aylık kira karşılığı',textWords(rent)],['Kiranın ödenme şekli',payment+' '+(d.iban||'')+' IBAN hesabına yatırılacaktır.'],
   ['Kira artış oranı','TÜFE 12 aylık ortalamalara göre değişim oranı (TBK m. 344)'],['Kira süresi',packDate(d.contractDate)+' – '+packDate(yearEnd(d.contractDate))+' (1 yıl)'],
   ['Kira başlangıcı',packDate(d.contractDate)+' tarihinden itibaren kira başlamıştır.'],['DASK poliçe numarası',d.contractDask||p.dask||''],
   ['Teslim edilen demirbaşlar','Demirbaş ve sayaç bilgileri EK-1 Teslim Tutanağında belirtilmiştir.'],['Depozito',depositReceipt]
  ];
  sheet(1);
  put(leaseBlock('KONUT (MESKEN) KİRA SÖZLEŞMESİ',width,16),left,25);
  let top=55;
  for(const [label,value] of table){
   const key=leaseBlock(label,202),val=leaseBlock(value||' ',320);
   rule(left,top,width);put(key,left+3,top+3);put(val,left+209,top+3);
   top+=Math.max(key.height,val.height)+6;
  }
  rule(left,top,width);
  const parties=[...gs.map(g=>['Müteselsil kefil',g]),['Kiracı',t],['Kiraya veren',l]];
  const col=width/parties.length;
  const signatures=parties.map(([role,who])=>[role,who.name,'T.C. '+(who.tc||''),'İmza __________'].map(v=>leaseBlock(v,col-5)));
  const footer=801-Math.max(...signatures.map(items=>items.reduce((n,b)=>n+b.height+1,0)));
  const writing=[];
  const kurus=annualKurus%100;
  const written=words(Math.floor(annual))+' Türk Lirası'+(kurus?' '+words(kurus)+' Kuruş':'');
  for(const g of gs){
   writing.push(leaseBlock('Müteselsil kefil · '+g.name+' · Azami sorumluluk tutarı: '+money(annual)+' ('+written+').',width));
   writing.push(leaseBlock('El yazısıyla · Azami tutar: _____________________   Kefalet tarihi: __________',width));
   writing.push(leaseBlock('Müteselsil kefil olmayı kabul ediyorum: ________________________________',width));
  }
  const writingHeight=writing.reduce((n,b)=>n+b.height+5,0);
  const clauses=HOUSING_CLAUSES.map((s,i)=>{
   if(i===10)s='Madde 11 – Kira ve Ödeme: Aylık kira bedeli '+money(rent)+' olup '+payment.replace(/^Her /,'her ')+' sözleşmede belirtilen IBAN hesabına ödenir.';
   if(i===12)s='Madde 13 – Bono: Taraflarca 12 aylık kira tutarı esas alınarak '+money(annual)+' bedelli tek bono düzenlenmesi öngörülmüştür. Aynı borç için mükerrer tahsilat yapılamaz; TBK m. 342 saklıdır.';
   return leaseBlock(s,width);
  });
  const headings=new Map([[0,leaseBlock('GENEL ŞARTLAR',width,14)],[10,leaseBlock('ÖZEL ŞARTLAR',width,14)]]);
  function items(start,end){return clauses.slice(start,end).flatMap((b,i)=>headings.has(start+i)?[headings.get(start+i),b]:[b]);}
  const starts=[top+10,31,31],ends=[footer-63,footer-10,footer-12-writingHeight];
  let best;
  for(let a=0;a<=3;a++)for(let b=a+1;b<26;b++){
   const ranges=[items(0,a),items(a,b),items(b,26)];
   const gaps=ranges.map((blocks,i)=>(ends[i]-starts[i]-blocks.reduce((n,k)=>n+k.height,0))/Math.max(1,blocks.length-1));
   if(Math.min(...gaps)<2)continue;
   const score=(3-a)*1000+Math.abs(gaps[1]-gaps[2]);
   if(!best||score<best.score)best={score,ranges,gaps};
  }
  if(!best)throw new Error('Girilen bilgiler 12 punto ile üç sayfaya sığmıyor. Uzun alanları kontrol edin.');
  for(let i=0;i<3;i++){
   if(i)sheet(i+1);
   let y=starts[i];
   for(const block of best.ranges[i]){put(block,left,y);y+=block.height+Math.min(4,best.gaps[i]);}
   if(i===2){y=footer-writingHeight-5;for(const block of writing){put(block,left,y);y+=block.height+5;}}
   rule(left,footer-3,width);
   signatures.forEach((parts,j)=>{let y=footer;for(const part of parts){put(part,left+j*col,y);y+=part.height+1;}});
   put(leaseBlock('Sayfa '+(i+1)+' / 3',83),479,812);
  }
 }
 try {
  layoutLease();
  sheet(4);
  [[84,address],[112,l.name],[140,t.name],[168,packDate(d.contractDate)]].forEach(([y,v])=>field(174,y-2,365,20,v));
  housingFixtureRows(d.fixtures ?? p.fixtures).forEach((value,index)=>{
   if(!value)return;
   const y=261+index*27;
   field(83,y,234,22,value);
   field(327,y,73,22,d['fixtureQty'+(index+1)],11);
   field(410,y,137,22,d['fixtureState'+(index+1)],11);
  });
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
  sheet(5);
  [[76,t.name],[95,t.tc],[135,l.name],[154,l.tc],[193,address]].forEach(([y,v])=>field(240,y,315,15,v,10));
  field(307,480,240,16,t.name);
  if(sp){field(136,602,300,15,sp.name,10,true);field(125,636,300,15,sp.tc,10,true);}
  sheet(6);
  const kurus = annualKurus % 100;
  const writtenAmount = words(Math.floor(annual))+' Türk Lirasını'+(kurus?' ve '+words(kurus)+' Kuruşu':'');
  const paragraphs = [
   'İşbu emre muharrer senedim kira bedeli mukabilinde .... / .... / 20.... tarihinde Sayın '+l.name+' veya emrühavalesine yukarıda yazılı yalnız '+writtenAmount+' ödeyeceğim. Bedeli nakden ahzolunmuştur.',
   'İşbu bono vadesinde ödenmediği takdirde, müteakip bonoların da muacceliyet kesbedeceğini, ihtilaf vukuunda Konya mahkeme ve icra dairelerinin yetkili olacağını kabul ederim.'
  ];
  const amount = '—'+money(annual)+'—';
  field(307,96,342,16,amount,12,true);
  measuring.font='12px Arial';
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
  field(557,321,94,16,packDate(d.contractDate),12,true);
  [[347,t.name],[371,t.address],[395,t.phone],[419,t.tc]].forEach(([y,v])=>field(149,y-1,278,22,v,12));
  field(54,440,93,21,'Kefil:',13,true,'bold');
  field(54,465,94,20,'T.C. / V.D. No:',12,true,'bold');
  field(149,440,278,23,aval?.name,14,false,'bold');
  field(149,465,278,21,aval?.tc,14,false,'bold');
 } catch(error) {
  output.replaceChildren();output.classList.add('hidden');alert(error.message);return;
 }
 output.scrollIntoView({behavior:'smooth',block:'start'});
}
