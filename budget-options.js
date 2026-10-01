(() => {
  'use strict';
  const D=window.RoomBudget,O=window.RoomBudgetOptions,$=s=>document.querySelector(s);
  if(!D||!O)return;
  const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const descriptions={
    'balanced-baseline':['The pictured room','Bar, three stools, slats, coffee table and rug.','Best visual coverage after field quotes.'],
    'ceiling-first':['Spend on the ceiling','Restore the lighted ceiling panel; defer bar, stools, slats, rug and decor.','Overhead layout, support and fire review required.'],
    'functional-reserve':['Keep more money available','Keep seating, bar, TV and rug; defer slats, coffee table and decor.','Recommended until measurements and bids return.']
  };
  const names={'balanced-baseline':'Balanced room','ceiling-first':'Ceiling first','functional-reserve':'More cost protection'};
  let selected=O.options[0];
  $('#allocation-cards').innerHTML='<div class="allocation-grid">'+O.options.map((o,i)=>{const a=o.categoryAllocations;return `<article class="allocation-card" data-option="${o.id}"><div class="eyebrow">OPTION ${i+1} · ${i===0?'PICTURED':i===2?'RECOMMENDED BEFORE QUOTES':'ALTERNATIVE'}</div><h3>${names[o.id]}</h3><div class="option-total">${money(a.allIn)}</div><div class="option-headroom">${money(a.unallocatedHeadroom)} unallocated</div><ul>${descriptions[o.id].map(s=>`<li>${esc(s)}</li>`).join('')}</ul><button type="button" data-allocation="${o.id}" aria-pressed="false">View allocation</button></article>`;}).join('')+'</div>';
  function render(o){
    selected=o;const a=o.categoryAllocations;
    document.querySelectorAll('[data-allocation]').forEach(b=>{const active=b.dataset.allocation===o.id;b.setAttribute('aria-pressed',String(active));b.closest('.allocation-card').classList.toggle('selected',active);});
    const facts=o.id==='balanced-baseline'?[`Same ${D.lines.length}-line baseline as the working ledger below.`,'Decorative ceiling, fridge and major replacements remain deferred.']:o.deferredElements;
    $('#allocation-detail').innerHTML=`<div class="allocation-breakdown"><div><h3>${names[o.id]}: where it goes</h3><dl>${[['Materials + furniture',a.materials],['Paid installation labor',a.labor],['Preparation + services',a.services],['Evidence capture',a.film],['Tax reserve',a.taxReserve],['Delivery reserve',a.freightReserve],['Contingency',a.contingency],['Planned total',a.allIn],['Headroom to ceiling; target $10,000-15,000',a.unallocatedHeadroom]].map(([k,v])=>`<div><dt>${k}</dt><dd>${money(v)}</dd></div>`).join('')}</dl><div class="allocation-decision">${money(a.contingency+a.unallocatedHeadroom)} held as contingency plus unallocated funds.</div><button id="download-option" type="button">Download this complete option · CSV ↓</button><small>This comparison uses earlier baseline prices; the current cost-reduction target is $10,000-15,000. Selecting an option preserves your working-ledger edits below.</small></div><div><h3>${o.id==='balanced-baseline'?'Scope notes':'What moves to a later phase'}</h3><ul>${facts.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>${o.addedElements.length?`<h3>What the money adds</h3><ul>${o.addedElements.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:''}<div class="allocation-decision">${esc(o.decisionRule)}</div>${o.id!=='balanced-baseline'?'<small>Without the slat package, the bay returns retain their existing fabric/color until measured and refinished. Extra re-skinning is not included. The balanced illustration above does not change with this cost comparison.</small>':''}${o.id==='ceiling-first'?'<small>The proposed 8 × 8-ft insert cannot cover the existing ceiling openings or block access. If a measured clear location does not exist, resize and reprice it or use the balanced package. Mirror-look ACM will differ from the veined glass in the original image.</small>':''}</div></div>`;
    $('#download-option').addEventListener('click',()=>download(o));
  }
  function download(o){
    const changes=new Map(o.rowOverrides.map(r=>[r.id,r]));
    const rows=D.lines.map(r=>({...r,...changes.get(r.id)})).concat(o.additionalRows.map(r=>({...r,sourceUrl:r.sourceRowId?D.lines.find(x=>x.id===r.sourceRowId).sourceUrl:'index.html#install/BAR-04'})));
    const cell=v=>'"'+String(v??'').replace(/^([=+@-])/,"'$1").replace(/"/g,'""')+'"';
    const fields=['id','scope','name','quantity','unit','unitPrice','countedCost','includeInTotal','sourceUrl','priceBasis','releaseNote'];
    const records=rows.map(r=>fields.map(f=>f==='countedCost'?(r.includeInTotal?Math.round(r.quantity*r.unitPrice*100)/100:0):r[f]));
    const lines=[fields,...records,[],...Object.entries(o.categoryAllocations)].map(r=>r.map(cell).join(',')).join('\r\n');
    const link=document.createElement('a'),url=URL.createObjectURL(new Blob([lines],{type:'text/csv;charset=utf-8'}));link.href=url;link.download=`rehearsal-room-${o.id}-v${D.priceRevision||D.version}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.querySelectorAll('[data-allocation]').forEach(b=>b.addEventListener('click',()=>render(O.options.find(o=>o.id===b.dataset.allocation))));
  render(selected);
})();
