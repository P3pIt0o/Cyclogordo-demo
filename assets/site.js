(function(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
// En-tête : fond plein dès qu'on défile (sur l'accueil)
const hdr=$('#hdr'); if(hdr&&!hdr.classList.contains('solid')){const t=()=>hdr.classList.toggle('solid',scrollY>40);addEventListener('scroll',t,{passive:true});t()}
// Menu mobile
const dr=$('#drawer'), mb=$('#menuBtn');
if(dr&&mb){const set=o=>{dr.hidden=!o;mb.setAttribute('aria-expanded',String(o));document.body.style.overflow=o?'hidden':''};
  mb.addEventListener('click',()=>set(true));$('#menuClose').addEventListener('click',()=>{set(false);mb.focus()});
  dr.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});dr.addEventListener('keydown',e=>{if(e.key==='Escape'){set(false);mb.focus()}})}

// Fiches vélos : zoom dans la photo (x,y,s) ou gros plan dédié (img)
const BIKES={
  kona:{
    trans:{x:21,y:87,s:3,note:"Dérailleur arrière et cassette, réglés à l'atelier."},
    pedal:{x:46,y:83,s:3,note:"Triple plateau : de quoi monter au Salève sans forcer."},
    frein:{x:80,y:82,s:3,note:"Freins à disque avant et arrière : un freinage régulier, même sous la pluie."},
    pneu:{x:70,y:69,s:2.6,note:"Pneus Maxxis à crampons, pour les chemins comme pour la ville."},
    cockpit:{x:72,y:47,s:2.8,note:"Cintre plat, manettes et leviers de frein à portée de main."},
    selle:{x:36,y:51,s:3,note:"La selle porte des marques d'usure. On préfère vous le montrer."}
  },
  look:{
    trans:{img:"img/look-cassette.webp",note:"Cassette et chaîne contrôlées, vitesses réglées à l'atelier."},
    susp:{img:"img/look-shock.webp",note:"Amortisseur arrière RockShox, réglé à votre poids au moment de l'essai."},
    frein:{img:"img/look-brake.webp",note:"Freins à disque hydrauliques, disques et plaquettes contrôlés."},
    selle:{img:"img/look-saddle.webp",note:"Selle WTB Gobi sur tige de selle télescopique."}
  }
};
const HINT='Touchez un point jaune pour voir une pièce de près.';
$$('[data-bike]').forEach(root=>{
  const Z=BIKES[root.dataset.bike]; if(!Z) return;
  const img=root.querySelector('.v-img'), base={src:img.getAttribute('src'),alt:img.alt};
  const note=root.querySelector('.note'), back=root.querySelector('.back');
  const pins=[...root.querySelectorAll('.pin')], zb=[...root.querySelectorAll('.zones button')];
  function setSrc(src,alt){if(img.getAttribute('src')===src) return;img.style.opacity=0;setTimeout(()=>{img.src=src;img.alt=alt;img.style.opacity=1},180)}
  function show(k){
    const d=k&&Z[k];
    if(d&&d.img){img.style.transform='scale(1)';setSrc(d.img,note.textContent)}
    else{setSrc(base.src,base.alt);if(d){img.style.transformOrigin=d.x+'% '+d.y+'%';img.style.transform='scale('+d.s+')'}else img.style.transform='scale(1)'}
    note.textContent=d?d.note:HINT; back.hidden=!d;
    pins.forEach(p=>{p.hidden=!!d}); zb.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.z===k)));
  }
  pins.forEach(b=>b.addEventListener('click',()=>show(b.dataset.z)));
  zb.forEach(b=>b.addEventListener('click',()=>show(b.getAttribute('aria-pressed')==='true'?null:b.dataset.z)));
  back.addEventListener('click',()=>show(null));
});
// Annonces : la carte se déplie sur place et se replie quand on la quitte
function collapse(card){
  if(!card.classList.contains('open')) return;
  const r=card.getBoundingClientRect(), h0=r.height, above=r.bottom<=0;
  const back=card.querySelector('.back'); if(back&&!back.hidden) back.click();
  card.classList.remove('open'); card.querySelector('.demo').hidden=true;
  const btn=card.querySelector('.more'); btn.setAttribute('aria-expanded','false'); btn.textContent='Plus de détails';
  if(above) window.scrollBy({top:card.getBoundingClientRect().height-h0,behavior:'instant'});
  io.unobserve(card); card._seen=false;
}
function expand(card){
  $$('.bike.open').forEach(c=>{if(c!==card) collapse(c)});
  card.classList.add('open'); card.querySelector('.demo').hidden=false;
  const btn=card.querySelector('.more'); btn.setAttribute('aria-expanded','true'); btn.textContent='Masquer les détails';
  card._seen=false; io.observe(card);
  requestAnimationFrame(()=>card.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'}));
}
const io=new IntersectionObserver(es=>es.forEach(e=>{const c=e.target;if(e.isIntersecting){c._seen=true;return}if(c._seen)collapse(c)}),{threshold:0});
$$('.bike[data-card]').forEach(card=>{
  card.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();card.classList.contains('open')?collapse(card):expand(card)}));
  const x=card.querySelector('.close'); if(x) x.addEventListener('click',()=>{collapse(card);card.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'})});
});

// Filtres du catalogue
const cat=$('#catalog');
if(cat){
  const F={}; const items=[...cat.children];
  const apply=()=>{
    let n=0;
    items.forEach(el=>{
      const d=el.dataset; let ok=true;
      if(F.etat&&F.etat.size&&!F.etat.has(d.etat)) ok=false;
      if(F.cat&&F.cat.size&&!F.cat.has(d.cat)) ok=false;
      if(F.assist&&F.assist.size&&!F.assist.has(d.assist)) ok=false;
      if(F.taille&&F.taille.size&&!(d.tailles||'').split(' ').some(t=>F.taille.has(t))) ok=false;
      el.hidden=!ok; if(ok) n++;
    });
    const s=$('#sort'); if(s&&s.value){const sorted=[...items].sort((a,b)=>(s.value==='asc'?1:-1)*(+a.dataset.prix-+b.dataset.prix));sorted.forEach(el=>cat.appendChild(el))}
    else items.forEach(el=>cat.appendChild(el));
    const c=$('#count'); if(c) c.textContent=n+(n>1?' résultats':' résultat');
  };
  $$('#filters [data-f]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.f;F[k]=F[k]||new Set();const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));on?F[k].add(b.dataset.v):F[k].delete(b.dataset.v);apply()}));
  const s=$('#sort'); if(s) s.addEventListener('change',apply);
  const r=$('#reset'); if(r) r.addEventListener('click',()=>{Object.keys(F).forEach(k=>F[k].clear());$$('#filters [data-f]').forEach(b=>b.setAttribute('aria-pressed','false'));if(s)s.value='';apply()});
  apply();
}

// Boutons « Réserver » : présélectionne le service dans le formulaire de la page
$$('[data-svc]').forEach(a=>a.addEventListener('click',()=>{const s=$('#f-svc');if(s&&a.getAttribute('href')&&a.getAttribute('href').startsWith('#')){s.value=a.dataset.svc;setTimeout(()=>{const n=$('#f-name');if(n)n.focus({preventScroll:true})},600)}}));

// Places restantes (exemple) sur la page RDV
const rd=$('#r-date'), sl=$('#slots');
if(rd&&sl){rd.addEventListener('change',()=>{if(!rd.value){sl.textContent='Choisissez une date';return}const d=new Date(rd.value+'T12:00:00'),w=d.getDay();
  if(w===0){sl.textContent='Fermé le dimanche';return}const seed=(d.getDate()*7+w)%5;sl.textContent=(w===1||w===6?Math.max(1,seed-1):seed+1)+' place(s) restante(s)'})}

// Formulaires (maquette : rien n'est envoyé)
[['#req','Merci {n} ! Dans la version en ligne, cette demande arrive directement dans l\'agenda de l\'atelier.'],['#rdvForm','Merci {n} ! Votre demande de rendez-vous est envoyée. Vous recevrez une confirmation par e-mail.'],['#contactForm','Merci {n} ! Votre message est envoyé, nous vous répondons rapidement.']].forEach(([sel,msg])=>{
  const f=$(sel); if(!f) return;
  f.addEventListener('submit',e=>{e.preventDefault();const ok=f.querySelector('.ok'),name=f.querySelector('#f-name');ok.hidden=false;
    const bad=[...f.querySelectorAll('[required]')].find(i=>i.type==='checkbox'?!i.checked:!i.value.trim());
    if(bad){ok.textContent=bad.type==='checkbox'?'Cochez la case pour envoyer le message.':'Complétez le champ « '+(bad.closest('label')?bad.closest('label').firstChild.textContent.trim():'obligatoire')+' ».';bad.focus();return}
    ok.textContent=msg.replace('{n}',name.value.trim())});
});
})();
