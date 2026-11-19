// Coordinates use the uploaded six-page form's original PDF points.
function renderHousingPacket({d,p,l,t,gs,sp,rent,packDate,textWords,money,words,person}) {
 const output = document.getElementById('docOutput');
 output.replaceChildren();
 output.classList.remove('hidden');
 output.classList.add('packet-output');
 const annual = rent * 12;
 const address = [p.city,p.district,p.address].filter(Boolean).join(' / ');
 const payment = d.payment.trim() || "Her ayın 15'inde";
 const identity = who => [who.name,who.tc,who.phone].filter(Boolean).join(' / ');
 const signature = who => [who.name, who.tc && 'T.C.: '+who.tc].filter(Boolean).join(' · ');
 const measuring = document.createElement('canvas').getContext('2d');
 let page;
 function sheet(number) {
  page = document.createElement('article');
  page.className = 'packet-page housing-sheet' + (number === 6 ? ' housing-note' : '');
  const background = new Image();
  background.src = '/konut-v1/'+number+'.png';
  background.alt = ['Konut kira sözleşmesi','Genel şartlar','Kefalet ve imzalar','Demirbaş ve sayaç teslim tutanağı','Tahliye taahhütnamesi','Bono'][number-1];
  page.append(background);
  output.append(page);
 }
 function field(x,y,width,height,value,size=10,white=false) {
  if (!value) return;
  const el = document.createElement('span');
  const content = String(value).trim();
  // Wrap and fit the actual Turkish text before freezing it in the archive.
  let lines;
  for (;size>=5;size-=0.25) {
   measuring.font = size+'px Arial';
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
  el.style.cssText = 'position:absolute;left:'+x+'pt;top:'+y+'pt;width:'+width+'pt;height:'+height+'pt;font:normal '+size+'pt/1.12 Arial,sans-serif;color:black;text-align:left;white-space:pre;'+(white?'background:white;':'');
  el.textContent = lines.join('\n');
  page.append(el);
 }
 function signers(first) {
  if (gs.length<=1 && first) {
   [[gs[0],43,757],[t,218,746],[l,393,746]].forEach(([who,x,y])=>{
    if(!who)return;
    field(x,y,165,12,who.name,9);field(x,y+12,165,12,'T.C.: '+(who.tc||''),9);
   });
   return;
  }
  const parties = [...(gs.length?gs:[{}]).map(g=>['MÜTESELSİL KEFİL',g]),['KİRACI',t],['KİRAYA VEREN',l]];
  const y = first?735:750;
  const blank = document.createElement('div');
  blank.style.cssText='position:absolute;background:white;left:40pt;top:'+y+'pt;width:515pt;height:'+(first?59:45)+'pt';
  page.append(blank);
  const width=514/parties.length;
  parties.forEach(([role,who],i)=>{
   const x=42+i*width;
   field(x,y,width-3,11,role,8.5);field(x,y+11,width-3,11,who.name,8.5);
   field(x,y+22,width-3,11,'T.C.: '+(who.tc||''),8.5);field(x,y+33,width-3,11,'İmza: __________',8);
  });
 }
 try {
  sheet(1);
  for(const [y,h,value] of [[72,20,packDate(d.contractDate)],[130,32,identity(l)],[170,22,l.address],[199,32,identity(t)],[239,33,address],[277,22,textWords(rent)],[306,33,payment+' '+(d.iban||'')+' IBAN hesabına yatırılacaktır.'],[415,22,packDate(d.start)],[444,22,d.contractDask||p.dask]]) field(293,y,251,h,value);
  signers(true);
  sheet(2);
  field(42,374,512,33,'Madde 11 – Kira ve Ödeme: Aylık kira bedeli '+money(rent)+' olup '+payment.replace(/^Her /,'her ')+' sözleşmede belirtilen IBAN hesabına ödenir.',11);
  field(42,453,512,34,'Madde 13 – Bono: Taraflarca 12 aylık kira tutarı esas alınarak '+money(annual)+' bedelli tek bono düzenlenmesi öngörülmüştür. Aynı borç için mükerrer tahsilat yapılamaz; TBK m. 342 saklıdır.',11);
  signers(false);
  sheet(3);signers(false);
  sheet(4);
  [[84,address],[112,l.name],[140,t.name]].forEach(([y,v])=>field(174,y-2,365,20,v));
  const fixtures=(d.fixtures||p.fixtures||'').split(/\n/).map(s=>s.trim()).filter(Boolean);
  fixtures.slice(0,9).forEach((v,i)=>field(83,261+i*27,250,22,i===8?fixtures.slice(8).join(', '):v));
  [[545,d.electricMeter],[572,d.waterMeter],[599,d.gasMeter]].forEach(([y,v])=>field(194,y-2,338,19,v));
  [[43,l],[230,t]].forEach(([x,who])=>field(x,741,164,13,signature(who),9));
  field(410,740,144,15,gs.map(signature).join(' / '),8);
  sheet(5);
  [[76,t.name],[95,t.tc],[135,l.name],[154,l.tc],[193,address]].forEach(([y,v])=>field(240,y,315,15,v,10));
  field(307,480,240,16,t.name);
  if(sp){field(136,602,300,15,sp.name,10,true);field(125,636,300,15,sp.tc,10,true);}
  sheet(6);
  const due=d.noteDue && packDate(d.noteDue);
  field(56,96,92,15,due,11,true);field(412,135,80,14,due,10,true);
  field(307,96,174,16,money(annual),12,true);field(89,163,248,15,l.name,11,true);
  field(174,191,279,16,words(annual),11,true);
  field(557,321,94,16,packDate(d.noteDate||d.contractDate),10,true);
  if(d.notePlace) field(462,343,290,18,'Düzenleme yeri: '+d.notePlace,10);
  const aval=person(d.aval);
  [[347,t.name],[371,t.address],[395,t.phone],[419,t.tc],[443,aval?.name],[467,aval?.tc]].forEach(([y,v])=>field(149,y-1,263,21,v,10));
 } catch(error) {
  output.replaceChildren();output.classList.add('hidden');alert(error.message);return;
 }
 output.scrollIntoView({behavior:'smooth',block:'start'});
}
