(function(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Démo : si une annonce est publiée dans l'admin (autre onglet ou retour arrière), la page se met à jour
addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
addEventListener('storage',e=>{if(e.key==='cg_demo_v1')location.reload()});
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

// Démo : annonces publiées depuis l'espace magasin (même navigateur, même adresse)
(function(){
  let D=[];try{D=JSON.parse(localStorage.getItem('cg_demo_v1')||'[]')}catch(e){}
  if(!Array.isArray(D)||!D.length) return;
  const grids=[$('#stockGrid'),$('#catalog')].filter(Boolean); if(!grids.length) return;
  const norm=t=>String(t||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const DEF={1:'LOOK 920',2:'KONA Lisa HT',3:'Vélo de Ville',4:'Focus Mares Cyclo cross'};
  Object.entries(DEF).forEach(([id,n])=>{if(!D.some(b=>String(b.id)===id))$$('.bike').forEach(c=>{const h=c.querySelector('h4');if(h&&norm(h.textContent)===norm(n))c.hidden=true})});
  D.filter(b=>b.status==='sold').forEach(b=>$$('.bike').forEach(c=>{const h=c.querySelector('h4');if(h&&norm(h.textContent)===norm(b.name))c.hidden=true}));
  const CAT={'Ville':'Vélo de ville','Électrique':'Vélo de ville','Gravel / cyclo-cross':'Gravel'};
  const el=(t,cl,txt)=>{const e=document.createElement(t);if(cl)e.className=cl;if(txt!=null)e.textContent=txt;return e};
  const chf=n=>'CHF '+Number(n||0).toLocaleString('fr-CH').replace(/[\s  ’]/g,"'");
  const book=$('#f-svc')?'#contact':'rdv.html';
  D.filter(b=>b.id>4&&b.status!=='sold').sort((a,c)=>(a.featured?1:0)-(c.featured?1:0)).forEach(b=>grids.forEach(g=>{
    const key='new'+b.id, card=el('article','bike');
    card.dataset.etat=b.etat||'Occasion';card.dataset.cat=CAT[b.type]||b.type;card.dataset.assist=b.type==='Électrique'?'Électrique':'Classique';card.dataset.prix=b.price||0;card.dataset.tailles='';
    const meta=el('div','meta');if(b.promo)meta.append(el('span','promo-t','Promo'));if(!b.featured)meta.append(el('span','new-t','Nouveau'));if(b.status==='res')meta.append(el('span','','Réservé'));meta.append(el('span','',b.etat||'Occasion'));if(b.size)meta.append(el('span','','Taille '+b.size));if(b.type)meta.append(el('span','',b.type));
    const pr=el('span','pr',chf(b.price));if(b.promo&&b.oldPrice>b.price){const o=el('s','',chf(b.oldPrice));o.setAttribute('aria-label','Ancien prix '+chf(b.oldPrice));pr.append(' ',o)}
    const bd=el('div','bd');bd.append(el('h4','',b.name),meta,pr);
    if(b.img){
      const ph=el('a','ph has');ph.href='#';ph.tabIndex=-1;ph.setAttribute('aria-hidden','true');const im=document.createElement('img');im.src=b.img;im.alt=b.name;ph.append(im);if(b.featured)ph.append(el('span','flag','★ '+(b.badge||'Coup de cœur')));card.append(ph);
    }else{const ph=el('div','ph soon','Photos à venir');if(b.featured){ph.style.position='relative';ph.append(el('span','flag','★ '+(b.badge||'Coup de cœur')))}card.append(ph)}
    card.append(bd);
    if(b.img&&b.points&&b.points.length){
      card.dataset.card='fiche-'+key;card.querySelector('.ph').dataset.open='fiche-'+key;
      const more=el('button','more','Plus de détails');more.type='button';more.dataset.open='fiche-'+key;more.setAttribute('aria-expanded','false');bd.append(more);
      const demo=el('div','demo sq');demo.id='fiche-'+key;demo.dataset.bike=key;demo.hidden=true;
      const v=el('div','viewer sq');const vi=document.createElement('img');vi.className='v-img';vi.src=b.img;vi.alt=b.name;v.append(vi,el('span','tag','Annonce publiée depuis l\'espace magasin'));
      const back=el('button','btn ghost back','Vue d\'ensemble');back.type='button';back.hidden=true;v.append(back);
      BIKES[key]={};
      b.points.forEach(p=>{const pin=el('button','pin');pin.type='button';pin.dataset.z=p.z;pin.style.left=p.x+'%';pin.style.top=p.y+'%';pin.setAttribute('aria-label','Voir : '+p.z);pin.setAttribute('aria-pressed','false');v.append(pin);BIKES[key][p.z]={x:p.x,y:p.y,s:2.8,note:p.z+' : vue rapprochée.'}});
      const sh=el('div','sheet');const top=el('div','sheet-top');top.append(el('p','eyebrow','Occasion · nouveau'));const x=el('button','close','×');x.type='button';x.setAttribute('aria-label','Fermer la fiche');top.append(x);
      const dl=document.createElement('dl');[['Type',b.type],['Taille',b.size||'—'],['Prix',chf(b.price)]].forEach(([k,val])=>{dl.append(el('dt','',k));const dd=el('dd',k==='Prix'?'pr-big':'',val);dl.append(dd)});
      const zones=el('div','zones');zones.setAttribute('role','group');zones.setAttribute('aria-label','Zones à inspecter');b.points.forEach(p=>{const zb=el('button','',p.z);zb.type='button';zb.dataset.z=p.z;zb.setAttribute('aria-pressed','false');zones.append(zb)});
      const cta=el('a','btn','Réserver un essai');cta.href=book;cta.dataset.svc="Essai d'un vélo d'occasion";
      sh.append(top,el('h3','',b.name),dl);if(b.desc)sh.append(el('p','',b.desc));sh.append(zones,el('p','note','Touchez un point jaune pour voir une pièce de près.'),cta);
      demo.append(v,sh);card.append(demo);
    }
    g.prepend(card);
  }));
})();
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
    note.textContent=d?d.note+' Touchez la photo pour revenir au vélo entier.':HINT; back.hidden=!d; img.closest('.viewer').classList.toggle('zoomed',!!d);
    pins.forEach(p=>{p.hidden=!!d}); zb.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.z===k)));
  }
  pins.forEach(b=>b.addEventListener('click',()=>show(b.dataset.z)));
  zb.forEach(b=>b.addEventListener('click',()=>show(b.getAttribute('aria-pressed')==='true'?null:b.dataset.z)));
  back.addEventListener('click',()=>show(null));
  img.addEventListener('click',()=>{if(!back.hidden)show(null)});
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
