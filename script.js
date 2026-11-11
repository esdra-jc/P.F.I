const K='planilha-fin-v1';
let S=null,pend=0;
try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
if(!S||!S.sheets)S={sheets:[{id:1,name:'Planilha 1',rows:[{d:'',q:1,v:0}]}],goals:[],tab:'rel',n:2};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
const $=s=>document.querySelector(s);
const R=n=>(+n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tot=sh=>sh.rows.reduce((a,r)=>a+(+r.q||0)*(+r.v||0),0);
const cur=()=>S.sheets.find(s=>String(s.id)===String(S.tab));

function render(){
  if(S.tab!=='rel'&&S.tab!=='meta'&&!cur())S.tab='rel';
  save();
  const t=String(S.tab);
  $('#tabs').innerHTML=
    `<button class="${t==='rel'?'on':''}" data-t="rel">📊 Relatório</button>`+
    S.sheets.map(s=>`<button class="${String(s.id)===t?'on':''}" data-t="${s.id}">${E(s.name)}</button>`).join('')+
    `<button class="${t==='meta'?'on':''}" data-t="meta">🎯 Metas</button>`+
    `<button class="add" id="new">+ Nova planilha</button>`;
  $('#app').innerHTML=t==='rel'?vRel():t==='meta'?vMeta():vSheet(cur());
}

function vRel(){
  const total=S.sheets.reduce((a,s)=>a+tot(s),0);
  const guardado=S.goals.reduce((a,g)=>a+(+g.saved||0),0);
  return `<div class="grid">
    <div class="card"><div class="k">Total geral (todas as planilhas)</div><div class="big">${R(total)}</div></div>
    <div class="card"><div class="k">Planilhas</div><div class="big">${S.sheets.length}</div></div>
    <div class="card"><div class="k">Guardado em metas</div><div class="big">${R(guardado)}</div></div>
  </div>
  <div class="card"><div class="row"><b>Resumo por planilha</b><button class="btn g noprint" data-a="print">🖨️ Imprimir relatório</button></div>
  <div class="wrap mt"><table><thead><tr><th>Planilha</th><th class="n">Itens</th><th class="n">Total</th><th style="width:30%">Participação</th></tr></thead><tbody>
  ${S.sheets.map(s=>{const v=tot(s),p=total?v/total*100:0;return `<tr><td>${E(s.name)}</td><td class="n">${s.rows.length}</td><td class="n">${R(v)}</td><td><div class="pb" style="margin:0"><i style="width:${p}%"></i></div><span class="k">${p.toFixed(1).replace('.',',')}%</span></td></tr>`}).join('')}
  </tbody><tfoot><tr><td>Total geral</td><td></td><td class="n">${R(total)}</td><td></td></tr></tfoot></table></div></div>`;
}

function vSheet(s){
  return `<div class="card">
  <div class="bar"><input id="nm" value="${E(s.name)}" aria-label="Nome da planilha">
  <button class="btn d" data-a="dsh">${pend?'Clique de novo para confirmar':'Excluir planilha'}</button></div>
  <div class="wrap"><table><thead><tr><th>Descrição</th><th style="width:90px">Qtd</th><th style="width:130px">Valor unit.</th><th class="n" style="width:130px">Total</th><th style="width:40px"></th></tr></thead><tbody>
  ${s.rows.map((r,i)=>`<tr><td><input data-f="d" data-i="${i}" value="${E(r.d)}" placeholder="Ex.: Aluguel"></td><td><input type="number" step="any" min="0" data-f="q" data-i="${i}" value="${r.q}"></td><td><input type="number" step="any" data-f="v" data-i="${i}" value="${r.v}"></td><td class="n" id="rt${i}">${R((+r.q||0)*(+r.v||0))}</td><td><button class="x" data-x="${i}" aria-label="Remover linha">✕</button></td></tr>`).join('')}
  </tbody><tfoot><tr><td colspan="3">Total da planilha</td><td class="n" id="st">${R(tot(s))}</td><td></td></tr></tfoot></table></div>
  <button class="btn mt" data-a="ar">+ Adicionar linha</button></div>`;
}

function vMeta(){
  const form=`<div class="card"><b>Nova meta</b><div class="f">
    <input id="gn" placeholder="Nome (ex.: Viagem)"><input id="gt" type="number" min="0" step="any" placeholder="Valor da meta (R$)">
    <input id="gs" type="number" min="0" step="any" placeholder="Já guardado (R$)"><input id="gd" type="date" aria-label="Prazo"></div>
    <button class="btn" data-a="ag">Criar meta</button></div>`;
  if(!S.goals.length)return form+`<div class="empty">Nenhuma meta ainda. Crie a primeira acima.</div>`;
  return form+S.goals.map((g,i)=>{
    const p=Math.min(100,g.target?g.saved/g.target*100:0),falta=Math.max(0,g.target-g.saved);
    let m='';
    if(g.date&&falta>0){const mo=Math.max(1,Math.ceil((new Date(g.date)-new Date())/2629800000));m=`<div class="k">Para chegar lá, guarde ${R(falta/mo)} por mês até ${new Date(g.date+'T12:00').toLocaleDateString('pt-BR')}.</div>`}
    return `<div class="card"><div class="row"><b>${E(g.name)}</b><button class="x" data-gd="${i}" aria-label="Excluir meta">✕</button></div>
    <div class="pb"><i style="width:${p}%"></i></div>
    <div class="row"><span>${R(g.saved)} de ${R(g.target)}</span><b>${p.toFixed(0)}%</b></div>
    <div class="k">${falta>0?'Faltam '+R(falta):'🎉 Meta alcançada!'}</div>${m}
    <div class="row mt noprint"><input type="number" min="0" step="any" placeholder="Valor (R$)">
    <span><button class="btn" data-dep="${i}">Depositar</button> <button class="btn g" data-ret="${i}">Retirar</button></span></div></div>`}).join('');
}

document.addEventListener('input',e=>{
  const f=e.target.dataset.f;if(!f)return;
  const s=cur(),i=+e.target.dataset.i,r=s.rows[i];
  r[f]=f==='d'?e.target.value:(parseFloat(e.target.value)||0);
  const c=$('#rt'+i);if(c)c.textContent=R((+r.q||0)*(+r.v||0));
  $('#st').textContent=R(tot(s));
  save();
});
document.addEventListener('change',e=>{
  if(e.target.id==='nm'){cur().name=e.target.value.trim()||'Planilha';render()}
});
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  const d=b.dataset,s=cur();
  if(d.t){S.tab=d.t;pend=0}
  else if(b.id==='new'){const id=S.n++;S.sheets.push({id,name:'Planilha '+(S.sheets.length+1),rows:[{d:'',q:1,v:0}]});S.tab=String(id);pend=0}
  else if(d.a==='ar'){s.rows.push({d:'',q:1,v:0})}
  else if(d.x!==undefined){s.rows.splice(+d.x,1)}
  else if(d.a==='dsh'){
    if(!pend){pend=1}
    else{S.sheets=S.sheets.filter(x=>x!==s);S.tab='rel';pend=0;if(!S.sheets.length)S.sheets.push({id:S.n++,name:'Planilha 1',rows:[{d:'',q:1,v:0}]})}
  }
  else if(d.a==='print'){window.print();return}
  else if(d.a==='ag'){
    const n=$('#gn').value.trim(),t=parseFloat($('#gt').value)||0;
    if(!n||t<=0){$('#gn').focus();return}
    S.goals.push({name:n,target:t,saved:parseFloat($('#gs').value)||0,date:$('#gd').value})
  }
  else if(d.gd!==undefined){S.goals.splice(+d.gd,1)}
  else if(d.dep!==undefined||d.ret!==undefined){
    const v=parseFloat(b.closest('.card').querySelector('input').value)||0;
    if(v<=0)return;
    const g=S.goals[+(d.dep!==undefined?d.dep:d.ret)];
    g.saved=Math.max(0,g.saved+(d.dep!==undefined?v:-v));
  }
  else return;
  render();
});
render();
