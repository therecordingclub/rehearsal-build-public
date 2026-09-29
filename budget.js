(function () {
  'use strict';
  const D=window.RoomBudget, key='trc-rehearsal-budget-v1.6', $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  if(!D){$('#grand-total').textContent='Budget unavailable';return;}
  const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n), whole=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rows=new Map(D.lines.map(r=>[r.id,r]));
  const label={observed:'Advertised price','budget-estimate':'Budget estimate','custom-allowance':'Custom allowance',retained:'Retained',included:'Included elsewhere'};
  let state={schema:'trc-budget/v1',version:D.version,rows:{},reserves:{...D.assumptions}};
  function validated(raw){
    if(!raw||raw.schema!=='trc-budget/v1'||raw.version!==D.version||typeof raw.rows!=='object'||raw.rows===null)throw Error('Choose a v1.6 room-budget backup.');
    const next={schema:'trc-budget/v1',version:D.version,rows:{},reserves:{...D.assumptions}};
    for(const [id,v]of Object.entries(raw.rows)){
      if(!rows.has(id)||!v||typeof v!=='object')continue;
      const n={};for(const f of ['quantity','unitPrice'])if(v[f]!==undefined){if(!Number.isFinite(v[f])||v[f]<0||v[f]>1000000)throw Error('Invalid quantity or price in '+id);n[f]=v[f];}
      if(typeof v.includeInTotal==='boolean'&&!['included','retained'].includes(rows.get(id).priceType))n.includeInTotal=v.includeInTotal;
      if(Object.keys(n).length)next.rows[id]=n;
    }
    for(const f of Object.keys(next.reserves))if(raw.reserves?.[f]!==undefined){const n=raw.reserves[f];if(!Number.isFinite(n)||n<0||n>100)throw Error('Invalid budget reserve.');next.reserves[f]=n;}
    return next;
  }
  try{const raw=localStorage.getItem(key);if(raw)state=validated(JSON.parse(raw));}catch(e){$('#save-status').textContent='Saved edits could not load. The baseline budget is shown.';}
  const current=r=>({...r,...(state.rows[r.id]||{})});
  function isEdited(r){return Object.entries(state.rows[r.id]||{}).some(([k,v])=>v!==r[k]);}
  function save(){try{localStorage.setItem(key,JSON.stringify(state));$('#save-status').textContent='Saved in this browser.';}catch(e){$('#save-status').textContent='Browser storage unavailable. Export a backup to keep these changes.';}}
  function total(list=D.lines){
    const out={materials:0,labor:0,services:0,subtotal:0};
    list.map(current).filter(r=>r.includeInTotal).forEach(r=>{const cost=Math.round(r.quantity*r.unitPrice*100)/100;out.subtotal+=cost;out[r.category]=(out[r.category]||0)+cost;});
    const cents=n=>Math.round((n+Number.EPSILON)*100)/100;
    out.recap=D.recapAllowance;out.tax=cents(out.materials*state.reserves.taxReservePercent/100);out.delivery=cents(out.materials*state.reserves.deliveryReservePercent/100);out.contingency=cents((out.subtotal+out.recap+out.tax+out.delivery)*state.reserves.contingencyPercent/100);out.grand=cents(out.subtotal+out.recap+out.tax+out.delivery+out.contingency);out.headroom=cents(D.hardCap-out.grand);return out;
  }
  function baselineRange(field){
    let base=0,mat=0;D.lines.filter(r=>r.includeInTotal).forEach(r=>{const v=r[field];base+=v;if(r.category==='materials')mat+=v;});
    return(base+D.recapAllowance+mat*(D.assumptions.taxReservePercent+D.assumptions.deliveryReservePercent)/100)*(1+D.assumptions.contingencyPercent/100);
  }
  function summary(){
    const t=total();$('#grand-total').textContent=money(t.grand);$('#budget-range').textContent=`Estimate range ${whole(baselineRange('extendedLow'))}–${whole(baselineRange('extendedHigh'))}. The upper range is a cost risk, not permission to exceed $25,000.`;
    $('#cap-status').textContent=t.headroom>=0?`${money(t.headroom)} remains below the $25,000 ceiling.`:`${money(-t.headroom)} over the $25,000 ceiling. Stop orders and revise the scope.`;
    $('#cap-status').classList.toggle('over',t.headroom<0);$('.budget-summary').classList.toggle('over-cap',t.headroom<0);
    const changed=D.lines.some(isEdited)||Object.keys(D.assumptions).some(k=>state.reserves[k]!==D.assumptions[k]);
    $('#total-label').textContent=changed?'🟡 YOUR WORKING BUDGET WITH RESERVES':'🟡 PLANNING BUDGET WITH RESERVES';
    $('#totals').innerHTML=[['Materials + furniture',t.materials],['Installation labor',t.labor],['Preparation + services',t.services],['Project evidence capture',t.recap],['Tax reserve',t.tax],['Delivery reserve',t.delivery],['Contingency',t.contingency]].map(([n,v])=>`<div><dt>${n}</dt><dd>${money(v)}</dd></div>`).join('');
    $$('.scope').forEach(el=>{const scopeRows=D.lines.filter(r=>r.scope===el.dataset.scope);el.querySelector('.scope-sum').textContent=money(total(scopeRows).subtotal);});
    $$('.price-line').forEach(el=>{const r=rows.get(el.dataset.line),c=current(r);el.classList.toggle('excluded-line',!c.includeInTotal);el.querySelector('.line-extended').innerHTML=`${money(c.includeInTotal?Math.round(c.quantity*c.unitPrice*100)/100:0)}<small>${c.includeInTotal?'line total':'excluded from total'}</small>`;el.querySelector('.price-badge').textContent=isEdited(r)?'Your edit':label[r.priceType];el.querySelector('.price-badge').className='badge price-badge '+(isEdited(r)?'edited':r.priceType);});
  }
  function lineHTML(r){
    const c=current(r),fixed=['retained','included'].includes(r.priceType);
    return `<article class="price-line ${c.includeInTotal?'':'excluded-line'}" data-line="${r.id}"><div class="line-main"><input type="checkbox" aria-label="Include ${esc(r.name)} in budget" data-field="includeInTotal" ${c.includeInTotal?'checked':''} ${fixed?'disabled':''}><div class="line-heading"><span class="line-id">${esc(r.id)} · ${esc(r.model||r.trade)}</span><div class="line-title">${esc(r.name)}</div><span class="badge price-badge ${r.priceType}">${label[r.priceType]}</span>${r.optional?' <span class="badge">Alternative</span>':''}</div><div class="number-field qty"><label for="qty-${r.id}">Qty · ${esc(r.unit)}</label><input id="qty-${r.id}" aria-label="Quantity for ${esc(r.name)}" data-field="quantity" type="number" min="0" max="1000000" step="0.01" value="${c.quantity}" ${fixed?'readonly':''}></div><div class="number-field"><label for="price-${r.id}">Unit price · USD</label><input id="price-${r.id}" aria-label="Unit price for ${esc(r.name)}" data-field="unitPrice" type="number" min="0" max="1000000" step="0.01" value="${c.unitPrice}" ${fixed?'readonly':''}></div><div class="line-extended"></div></div><details class="line-details"><summary>Source, specification, quantity and release notes ↓</summary><dl><dt>Product / finish</dt><dd>${esc([r.brand,r.model,r.finish].filter(Boolean).join(' · '))}</dd><dt>Supplier / basis</dt><dd><a href="${esc(r.sourceUrl)}" target="_blank" rel="noopener">${esc(r.title||r.name)} ↗</a></dd><dt>Price evidence</dt><dd>${esc(r.priceBasis)} Checked ${esc(r.checkedAt)}. ${esc(r.availability)}</dd><dt>Quantity basis</dt><dd>${esc(r.quantityBasis)}</dd><dt>Unit range</dt><dd>${money(r.priceLow)}–${money(r.priceHigh)} · ${esc(label[r.priceType])}</dd><dt>Before ordering</dt><dd>${esc(r.releaseNote)}</dd></dl></details></article>`;
  }
  function render(){
    $('#scopes').innerHTML=D.scopes.map(s=>{const list=D.lines.filter(r=>r.scope===s.id);return `<details class="scope" id="${s.id}" data-scope="${s.id}"><summary><span class="scope-id">${esc(s.id)}</span><div><h3>${esc(s.name)}</h3><div class="scope-meta">${esc(s.group)} · ${esc(s.trade)} · ${list.length} lines</div></div><span class="scope-sum"></span></summary><div class="scope-note"><span>${esc(s.gate)}</span><a href="index.html#install/${s.id}">Material kit + installation ↗</a></div>${list.map(lineHTML).join('')}</details>`;}).join('');
    summary();filter();
  }
  function matches(r){
    const text=$('#search').value.trim().toLowerCase(),group=$('#group-filter').value,type=$('#type-filter').value,c=current(r);
    if(group!=='all'&&r.group!==group)return false;
    if(type==='observed'&&r.priceType!=='observed')return false;
    if(type==='estimate'&&!['budget-estimate','custom-allowance'].includes(r.priceType))return false;
    if(type==='retained'&&!['retained','included'].includes(r.priceType))return false;
    if(type==='excluded'&&c.includeInTotal)return false;
    if(type==='edited'&&!isEdited(r))return false;
    return !text||[r.id,r.scope,r.scopeName,r.name,r.model,r.brand,r.finish,r.quantityBasis,r.releaseNote].join(' ').toLowerCase().includes(text);
  }
  function filter(){
    let count=0,scopes=0;
    $$('.scope').forEach(el=>{let shown=0;el.querySelectorAll('.price-line').forEach(node=>{const visible=matches(rows.get(node.dataset.line));node.hidden=!visible;if(visible){shown++;count++;}});el.hidden=!shown;if(shown)scopes++;if($('#search').value.trim()&&shown)el.open=true;});
    $('#result-count').textContent=`${count} of ${D.lines.length} lines · ${scopes} of ${D.scopes.length} scopes`;$('#empty').hidden=count>0;
    const u=new URL(location.href);for(const [k,id]of [['q','search'],['area','group-filter'],['basis','type-filter']]){const v=$('#'+id).value;if(v&&v!=='all')u.searchParams.set(k,v);else u.searchParams.delete(k);}history.replaceState(null,'',u);
  }
  function clear(){ $('#search').value='';$('#group-filter').value='all';$('#type-filter').value='all';filter();}
  function jump(scope){clear();const el=document.getElementById(scope);if(el){el.open=true;location.hash=scope;el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}}
  const spots=[['MIR-02','Ceiling mirror',39,15],['MIR-01','Five mirrors',34,35],['FIN-02','Wall finish',73,24],['DESK-01','Desk + rack',80,58],['TV-01','TV + mount',84,33],['BAR-01','Bar + counter',9,66],['BAR-04','Bottle shelves',8,26],['SEAT-01','Sofa',40,56],['SEAT-02','Swivel chairs',61,70],['SEAT-03','Table + rug',46,70],['LGT-07','All lighting',57,18],['FIN-01','Floor + platforms',53,91]];
  const concepts={budget:['assets/room-budget-v1.6.png','Balanced package · AI concept illustration · retained ceiling and warm wood floor, stock mirrors and simpler furniture. Field verification remains required.'],target:['assets/room-photo-v1.4.png','Fuller original design target · AI visualization · includes the decorative ceiling and other elements deferred from the balanced budget.'],current:['assets/current-room.jpeg','Actual existing room photograph · gray acoustic walls, warm wood floor and black ceiling. The rebuild has not happened.']};
  $$('[data-concept]').forEach(b=>b.addEventListener('click',()=>{const [src,label]=concepts[b.dataset.concept];$('#budget-concept-image').src=src;$('#budget-concept-image').alt=label;$('#budget-concept-caption').textContent=label;$('#concept-download').href=src;$$('[data-concept]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
  $('#hotspots').innerHTML=spots.map(([id,name,x,y],i)=>`<button class="hotspot" style="left:${x}%;top:${y}%" data-jump="${id}" aria-label="${esc(name)} costs">${i+1}</button>`).join('');
  $('#room-links').innerHTML=spots.map(([id,name],i)=>`<button data-jump="${id}">${String(i+1).padStart(2,'0')} · ${esc(name)}</button>`).join('');
  $('#group-filter').innerHTML+=[...new Set(D.scopes.map(s=>s.group))].map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('');
  const query=new URL(location.href).searchParams;for(const[k,id]of [['q','search'],['area','group-filter'],['basis','type-filter']]){const el=$('#'+id),v=query.get(k);if(v&&(el.tagName==='INPUT'||[...el.options].some(o=>o.value===v)))el.value=v;}
  $('#scope-count').textContent=D.counts.scopes;$('#line-count').textContent=D.counts.lines;$('#material-count').textContent=`${D.counts.mappedKitMaterials}/${D.counts.kitMaterials}`;$('#observed-count').textContent=D.counts.observedLines;
  const reserveFields={'tax-rate':'taxReservePercent','delivery-rate':'deliveryReservePercent','contingency-rate':'contingencyPercent'};
  function reserveInputs(){for(const[id,field]of Object.entries(reserveFields))$('#'+id).value=state.reserves[field];}
  reserveInputs();render();
  $('#scopes').addEventListener('change',e=>{const field=e.target.dataset.field,el=e.target.closest('[data-line]');if(!field||!el)return;const r=rows.get(el.dataset.line);let value=field==='includeInTotal'?e.target.checked:Number(e.target.value);if(field!=='includeInTotal'&&(!e.target.value.trim()||!Number.isFinite(value)||value<0||value>1000000)){e.target.value=current(r)[field];$('#save-status').textContent='Enter a nonnegative number up to 1,000,000.';return;}state.rows[r.id]={...(state.rows[r.id]||{}),[field]:value};save();summary();filter();});
  for(const[id,field]of Object.entries(reserveFields))$('#'+id).addEventListener('change',e=>{const n=Number(e.target.value),max=Number(e.target.max);if(!e.target.value||!Number.isFinite(n)||n<0||n>max){e.target.value=state.reserves[field];return;}state.reserves[field]=n;save();summary();});
  $('#search').addEventListener('input',filter);$('#group-filter').addEventListener('change',filter);$('#type-filter').addEventListener('change',filter);$('#clear-filters').addEventListener('click',clear);
  $('#expand-all').addEventListener('click',()=>$$('.scope:not([hidden])').forEach(e=>e.open=true));$('#collapse-all').addEventListener('click',()=>$$('.scope').forEach(e=>e.open=false));
  document.addEventListener('click',e=>{const el=e.target.closest('[data-jump]');if(el)jump(el.dataset.jump);});
  function download(name,body,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([body],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('#export-json').addEventListener('click',()=>download(`rehearsal-room-budget-edits-v${D.priceRevision||D.version}.json`,JSON.stringify({...state,sourcePriceRevision:D.priceRevision||D.version,exportedAt:new Date().toISOString()},null,2),'application/json'));
  const csvCell=v=>'"'+String(v??'').replace(/^([=+@-])/,"'$1").replace(/"/g,'""')+'"';
  $('#export-csv').addEventListener('click',()=>{const fields=['id','scope','name','model','quantity','unit','unitPrice','extended','priceType','includeInTotal','sourceUrl','quantityBasis','releaseNote'];const records=D.lines.map(r=>{const c=current(r);return {...c,extended:Math.round(c.quantity*c.unitPrice*100)/100,priceType:isEdited(r)?'user-edit':r.priceType};});let content=[fields,...records.map(r=>fields.map(f=>r[f]))].map(row=>row.map(csvCell).join(',')).join('\r\n');const t=total();content+='\r\n\r\n'+[['Room subtotal',t.subtotal],['Evidence capture allowance',t.recap],['Tax reserve',t.tax],['Delivery reserve',t.delivery],['Contingency',t.contingency],['Working total',t.grand],['Hard cap',D.hardCap],['Unallocated headroom',t.headroom]].map(row=>row.map(csvCell).join(',')).join('\r\n');download(`rehearsal-room-working-budget-v${D.priceRevision||D.version}.csv`,content,'text/csv;charset=utf-8');});
  $('#import-json').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2000000)throw Error('Budget backup is too large.');const next=validated(JSON.parse(await file.text()));state=next;save();reserveInputs();render();$('#save-status').textContent='Budget edits restored and saved.';}catch(err){$('#save-status').textContent=err.message;}e.target.value='';});
  $('#reset-budget').addEventListener('click',()=>{if(!confirm('Reset only this budget’s quantity, quote and reserve edits? Room layouts and measurement notes stay as they are.'))return;state={schema:'trc-budget/v1',version:D.version,rows:{},reserves:{...D.assumptions}};save();reserveInputs();render();});
  let printState;
  window.addEventListener('beforeprint',()=>{printState=$$('details,.price-line').map(el=>({el,open:el.open,hidden:el.hidden}));$$('details').forEach(el=>{el.open=true;el.hidden=false;});$$('.price-line').forEach(el=>el.hidden=false);});
  window.addEventListener('afterprint',()=>{(printState||[]).forEach(({el,open,hidden})=>{if(el.tagName==='DETAILS')el.open=open;el.hidden=hidden;});printState=null;});
  $('#print-budget').addEventListener('click',()=>window.print());
  if(location.hash&&rows.size){const scope=decodeURIComponent(location.hash.slice(1));if(D.scopes.some(s=>s.id===scope))jump(scope);}
  window.BudgetTools={total,validated,baselineRange,csvCell,counts:D.counts};
})();
