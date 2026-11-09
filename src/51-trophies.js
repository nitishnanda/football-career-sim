/* Trophy room: hand-drawn illustrations of each real trophy's shape and materials (no official logos), shown on
   the shelves of a lit glass display cabinet. Every win is its own trophy on the shelf. */
const S_='url(#tgS)',G_='url(#tgG)',M_='url(#tgM)',K_='url(#tgK)',B_='url(#tgB)',R_='url(#tgR)';
const TRODEFS=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="tgS" x1="0" x2="1"><stop offset="0" stop-color="#5a5f65"/><stop offset=".2" stop-color="#c3c8cd"/><stop offset=".38" stop-color="#fbfcfd"/><stop offset=".55" stop-color="#9ea3a9"/><stop offset=".78" stop-color="#e2e5e8"/><stop offset="1" stop-color="#62676d"/></linearGradient>
<linearGradient id="tgG" x1="0" x2="1"><stop offset="0" stop-color="#6b470a"/><stop offset=".2" stop-color="#d4a136"/><stop offset=".38" stop-color="#fff0b0"/><stop offset=".56" stop-color="#c38e1e"/><stop offset=".78" stop-color="#f1cc66"/><stop offset="1" stop-color="#76500f"/></linearGradient>
<linearGradient id="tgM" x1="0" x2="1"><stop offset="0" stop-color="#05301e"/><stop offset=".3" stop-color="#138650"/><stop offset=".5" stop-color="#0a5636"/><stop offset=".72" stop-color="#1c9c62"/><stop offset="1" stop-color="#042a1a"/></linearGradient>
<linearGradient id="tgK" x1="0" x2="1"><stop offset="0" stop-color="#0d0d0e"/><stop offset=".4" stop-color="#3b3e44"/><stop offset=".62" stop-color="#232529"/><stop offset="1" stop-color="#0a0a0b"/></linearGradient>
<linearGradient id="tgB" x1="0" x2="1"><stop offset="0" stop-color="#4a3a20"/><stop offset=".4" stop-color="#a48c5c"/><stop offset=".62" stop-color="#857048"/><stop offset="1" stop-color="#3f311b"/></linearGradient>
<linearGradient id="tgR" x1="0" x2="1"><stop offset="0" stop-color="#7c7668"/><stop offset=".4" stop-color="#e6e1d4"/><stop offset=".62" stop-color="#cbc4b2"/><stop offset="1" stop-color="#6f6a5d"/></linearGradient>
<radialGradient id="tgSr" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#c7ccd1"/><stop offset="1" stop-color="#5d6268"/></radialGradient>
<radialGradient id="tgGr" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#d9a73b"/><stop offset="1" stop-color="#6b470a"/></radialGradient>
<radialGradient id="tgC" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#cfe3ef"/><stop offset="1" stop-color="#7ea3b8"/></radialGradient>
</defs></svg>`;
// a mirrored copy of a left-hand handle/ear, for a trophy whose viewBox is w wide
const mir=(el,w)=>`<g transform="translate(${w},0) scale(-1,1)">${el}</g>`;
// a handle drawn as a light silver band with a darker edge
const hndl=(d,w,col)=>`<path d="${d}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="${w+1.6}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col||'#dfe3e7'}" stroke-width="${w}" stroke-linecap="round"/>`;
const ring=(cx,cy,r,a0,n)=>Array.from({length:n},(_,i)=>{const a=(a0+i*360/n)*Math.PI/180;return[cx+r*Math.cos(a),cy+r*Math.sin(a)]});
const ballSeams=(cx,cy,r,col)=>{const p=ring(cx,cy,r*.3,-90,5),q=ring(cx,cy,r*.92,-90,5);return`<g fill="none" stroke="${col}" stroke-width="1.2"><polygon points="${p.map(x=>x.join(',')).join(' ')}"/>${p.map((v,i)=>`<path d="M${v[0]},${v[1]}L${q[i][0]},${q[i][1]}"/>`).join('')}</g>`};

const TRO={
// UEFA Champions League: tall silver urn, huge "big ear" handles from the rim to the lower body, stepped round base
ucl:{vb:'0 0 150 200',h:122,d:()=>{const ear=`<path fill="${S_}" d="M48,22 C20,16 3,42 7,72 C10,100 34,118 65,121 L66,111 C40,108 19,94 17,72 C15,49 28,31 49,32Z"/>`;
  return`<rect x="33" y="182" width="84" height="14" rx="3" fill="${S_}"/><rect x="42" y="172" width="66" height="10" fill="${S_}"/>
  <path fill="${S_}" d="M64,150 L86,150 C96,156 104,162 106,172 L44,172 C46,162 54,156 64,150Z"/><path fill="${S_}" d="M66,126 L84,126 L86,150 L64,150Z"/>
  ${ear}${mir(ear,150)}<path fill="${S_}" d="M47,20 C47,70 60,104 66,128 L84,128 C90,104 103,70 103,20Z"/>
  <ellipse cx="75" cy="20" rx="28" ry="4.5" fill="url(#tgSr)"/><path fill="none" stroke="rgba(0,0,0,.25)" d="M49,40 C62,43 88,43 101,40"/>`}},
// UEFA Europa League: handle-less octagonal silver cup flaring upward, on a solid marble base carrying member nations' flags
uel:{vb:'0 0 110 200',h:112,d:()=>{const tx=[16,35.5,55,74.5,94],bx=[42,48.5,55,61.5,68],sh=['rgba(0,0,0,.2)','rgba(255,255,255,.14)','rgba(0,0,0,.05)','rgba(0,0,0,.24)'];
  const fl=['#c8102e','#003399','#ffcc00','#009246','#f4f4f4','#111','#d52b1e','#0055a4'];
  return`<rect x="20" y="158" width="70" height="38" rx="3" fill="${R_}"/>${fl.map((c,i)=>`<rect x="${24.5+i*8}" y="176" width="6" height="4" fill="${c}" opacity=".85"/>`).join('')}
  <rect x="18" y="154" width="74" height="5" rx="1.5" fill="${S_}"/><path fill="${S_}" d="M40,154 L70,154 L66,144 L44,144Z"/>
  <path fill="${S_}" d="M16,14 L94,14 C88,60 74,110 68,144 L42,144 C36,110 22,60 16,14Z"/>
  ${sh.map((c,i)=>`<polygon points="${tx[i]},14 ${tx[i+1]},14 ${bx[i+1]},144 ${bx[i]},144" fill="${c}" stroke="none"/>`).join('')}
  <path fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1.2" d="M22,48 Q30,42 38,48 T54,48 T70,48 T88,48"/>
  <path fill="${S_}" d="M13,10 L97,10 L94,17 L16,17Z"/>`}},
// UEFA Conference League: 32 hexagonal silver spines twisting up from a brushed-brass base to a brass top ring
uecl:{vb:'0 0 110 200',h:108,d:()=>{let back='',front='';
  for(let i=0;i<16;i++){const t=i/15,b=33+44*t,u=20+70*t;
    back+=`<path d="M${b},180 C${55+(b-55)*.35+10},130 ${55+(u-55)*.8-12},70 ${u},26" stroke="#7d8389" stroke-width="2"/>`;
    front+=`<path d="M${b},180 C${55+(b-55)*.35-10},130 ${55+(u-55)*.8+12},70 ${u},26" stroke="${i%2?'#c3c8cd':'#f1f3f5'}" stroke-width="2.4"/>`}
  return`<ellipse cx="55" cy="26" rx="36" ry="6" fill="none" stroke="#5a4a2c" stroke-width="5"/><g fill="none" stroke-linecap="round">${back}${front}</g>
  <path fill="none" stroke="${B_}" stroke-width="5" d="M19,26 A36,6 0 0 0 91,26"/>
  <rect x="25" y="180" width="60" height="15" rx="3" fill="${B_}"/><ellipse cx="55" cy="180" rx="30" ry="4" fill="${B_}"/>`}},
// FIFA World Cup: gold, two figures spiralling up to hold the globe, two green malachite bands in the base
wc:{vb:'0 16 80 184',h:92,d:()=>`<path fill="${G_}" d="M18,160 h44 l2,36 h-48z"/><path fill="${M_}" d="M17.4,167 h45.2 l.4,6 h-46z"/><path fill="${M_}" d="M16.6,182 h46.8 l.4,6 h-47.6z"/>
  <path fill="${G_}" d="M23,161 C25,140 33,132 33,118 C33,104 20,92 18,72 L62,72 C60,92 47,104 47,118 C47,132 55,140 57,161Z"/>
  <g fill="none" stroke="rgba(80,52,6,.55)" stroke-width="1.6"><path d="M26,157 C40,141 49,128 37,112 C26,98 29,84 47,73"/><path d="M54,157 C40,142 31,128 43,112 C54,98 51,84 33,73"/></g>
  <circle cx="40" cy="45" r="25" fill="url(#tgGr)"/>
  <g fill="rgba(110,72,10,.45)" stroke="none"><path d="M28,32 c6,-4 12,-2 13,3 c1,5 -6,6 -8,10 c-2,4 -7,2 -7,-3 c0,-4 -1,-7 2,-10z"/><path d="M46,30 c5,-1 10,2 10,7 c0,4 -5,4 -6,8 c-1,4 3,7 0,10 c-3,2 -7,-2 -7,-7 c0,-6 -2,-15 3,-18z"/><path d="M30,54 c4,0 7,3 6,7 c-1,3 -5,3 -7,1 c-2,-2 -2,-7 1,-8z"/></g>
  <g fill="none" stroke="rgba(110,72,10,.3)" stroke-width=".8"><ellipse cx="40" cy="45" rx="11" ry="25"/><path d="M15,45 h50"/></g>`},
// UEFA European Championship (Henri Delaunay Cup): tall slender silver vase, thin handles at the top, broad two-tier base
euro:{vb:'0 0 90 200',h:111,d:()=>{const h=hndl('M22,24 C6,26 6,60 30,66',3.4);
  return`<rect x="12" y="178" width="66" height="18" rx="3" fill="${S_}"/><rect x="18" y="168" width="54" height="10" rx="2" fill="${S_}"/>
  <path fill="${S_}" d="M37,168 L53,168 L49,118 L41,118Z"/>${h}${mir(h,90)}
  <path fill="${S_}" d="M20,20 C20,70 37,100 41,120 L49,120 C53,100 70,70 70,20Z"/><ellipse cx="45" cy="20" rx="25" ry="4" fill="url(#tgSr)"/>`}},
// Premier League: sterling-silver lidded cup, a lion over each handle, gilded crown on top, green malachite plinth
pl:{vb:'0 0 130 200',h:136,d:()=>{const h=hndl('M34,72 C14,70 12,102 39,106',5);
  const lion=`<ellipse cx="24" cy="66" rx="8" ry="4.2" fill="${G_}"/><circle cx="16" cy="60" r="5.2" fill="${G_}"/><circle cx="14.6" cy="59.5" r="1" fill="rgba(0,0,0,.4)" stroke="none"/><rect x="18" y="68" width="2.2" height="4" fill="${G_}"/><rect x="28" y="68" width="2.2" height="4" fill="${G_}"/><path d="M32,64 q5,-4 3,-8" fill="none" stroke="#c9971f" stroke-width="1.4"/>`;
  return`<rect x="28" y="164" width="74" height="32" rx="3" fill="${M_}"/><rect x="26" y="160" width="78" height="5" rx="1.5" fill="${S_}"/>
  <path fill="${S_}" d="M48,160 L82,160 L75,146 L55,146Z"/><rect x="59" y="130" width="12" height="16" fill="${S_}"/><ellipse cx="65" cy="138" rx="9" ry="4" fill="${S_}"/>
  ${h}${mir(h,130)}<path fill="${S_}" d="M33,64 L97,64 C97,102 83,126 71,132 L59,132 C47,126 33,102 33,64Z"/>
  <path fill="none" stroke="rgba(0,0,0,.25)" d="M35,78 C52,82 78,82 95,78"/>
  <path fill="${S_}" d="M37,64 C39,48 51,42 65,42 C79,42 91,48 93,64Z"/><ellipse cx="65" cy="64" rx="33" ry="4" fill="url(#tgSr)"/>
  <rect x="51" y="31" width="28" height="11" rx="1" fill="${G_}"/><polygon points="51,31 54,16 60,26 65,11 70,26 76,16 79,31" fill="${G_}"/><circle cx="65" cy="9" r="3" fill="${G_}"/>
  <g stroke="none" fill="#b3122e"><circle cx="57" cy="36.5" r="1.6"/><circle cx="65" cy="36.5" r="1.6"/><circle cx="73" cy="36.5" r="1.6"/></g>
  ${lion}${mir(lion,130)}`}},
// FA Cup: classic silver loving cup, big curved handles, lid with a small figure finial, black plinth
facup:{vb:'0 0 110 200',h:112,d:()=>{const h=hndl('M25,64 C5,62 3,100 33,112',5);
  return`<rect x="30" y="176" width="50" height="20" rx="2" fill="${K_}"/>
  <path fill="${S_}" d="M37,176 L73,176 C71,166 62,162 60,152 L50,152 C48,162 39,166 37,176Z"/><rect x="51" y="134" width="8" height="18" fill="${S_}"/><ellipse cx="55" cy="143" rx="7" ry="3.5" fill="${S_}"/>
  ${h}${mir(h,110)}<path fill="${S_}" d="M24,60 L86,60 C86,104 70,128 58,134 L52,134 C40,128 24,104 24,60Z"/>
  <rect x="21" y="55" width="68" height="6" rx="2" fill="${S_}"/><path fill="${S_}" d="M29,55 C31,41 44,35 55,35 C66,35 79,41 81,55Z"/>
  <rect x="53" y="26" width="4" height="9" fill="${S_}"/><circle cx="55" cy="17" r="3.2" fill="${S_}"/><path fill="${S_}" d="M51.5,27 L58.5,27 L55,20Z"/>`}},
// LaLiga: solid silver cup with wide, flat, wing-like handles on a dark base
laliga:{vb:'0 0 140 200',h:120,d:()=>{const w=`<path fill="${S_}" d="M45,46 C30,42 14,34 5,40 C9,57 26,72 47,86 L48,75 C34,67 22,59 17,49 C27,51 36,53 45,55Z"/>`;
  return`<rect x="44" y="172" width="52" height="24" rx="2" fill="${K_}"/><rect x="58" y="179" width="24" height="9" rx="1" fill="${S_}"/>
  <path fill="${S_}" d="M50,172 L90,172 L82,156 L58,156Z"/><rect x="64" y="130" width="12" height="26" fill="${S_}"/><ellipse cx="70" cy="140" rx="9" ry="4" fill="${S_}"/>
  ${w}${mir(w,140)}<path fill="${S_}" d="M44,40 L96,40 C96,92 84,122 75,130 L65,130 C56,122 44,92 44,40Z"/><ellipse cx="70" cy="40" rx="26" ry="4" fill="url(#tgSr)"/>`}},
// Copa del Rey: all-silver cup with angular Art Deco handles, stepped foot, black marble base
copa:{vb:'0 0 120 200',h:118,d:()=>{const h=`<path fill="${S_}" d="M31,42 L10,42 L10,94 L43,94 L43,86 L18,86 L18,50 L31,50Z"/>`;
  return`<rect x="32" y="174" width="56" height="22" rx="2" fill="${K_}"/><path fill="none" stroke="rgba(255,255,255,.18)" d="M36,180 q10,6 18,0 t20,4 t12,-2"/>
  <rect x="40" y="166" width="40" height="8" fill="${S_}"/><rect x="46" y="158" width="28" height="8" fill="${S_}"/><rect x="54" y="128" width="12" height="30" fill="${S_}"/>
  ${h}${mir(h,120)}<path fill="${S_}" d="M30,36 L90,36 L81,108 L67,128 L53,128 L39,108Z"/><path fill="none" stroke="rgba(0,0,0,.22)" d="M39,108 L81,108"/>
  <rect x="27" y="31" width="66" height="6" rx="1" fill="${S_}"/>`}},
// Bundesliga Meisterschale: large round silver plate, engraved rings of champions, tourmalines, rock-crystal centre with a seven-pointed star
bl:{vb:'0 52 130 148',h:112,d:()=>{const big=ring(65,118,46,-90,5),sm=ring(65,118,34,-75,11),st=ring(65,118,24,-90,7);
  return`<path fill="${K_}" d="M56,150 L74,150 L84,194 L46,194Z"/><rect x="36" y="186" width="58" height="10" rx="2" fill="${K_}"/>
  <circle cx="65" cy="118" r="58" fill="${S_}"/><circle cx="65" cy="118" r="49" fill="url(#tgSr)"/>
  <g fill="none" stroke="rgba(0,0,0,.33)"><circle cx="65" cy="118" r="54" stroke-width="3" stroke-dasharray="2 1.5"/><circle cx="65" cy="118" r="41" stroke-width="2.4" stroke-dasharray="1.6 1.4"/><circle cx="65" cy="118" r="29" stroke-width="2" stroke-dasharray="1.4 1.2"/></g>
  ${big.map(([x,y],i)=>`<ellipse cx="${x}" cy="${y}" rx="4.2" ry="3.2" fill="${i%2?'#c1477a':'#2e8b57'}" stroke="#e8c76a" stroke-width="1"/>`).join('')}
  ${sm.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="1.9" fill="${i%2?'#c1477a':'#2e8b57'}" stroke="none"/>`).join('')}
  <g stroke="rgba(255,255,255,.7)" stroke-width="1.2">${st.map(([x,y])=>`<path d="M65,118 L${x},${y}"/>`).join('')}</g><circle cx="65" cy="118" r="12" fill="url(#tgC)"/>`}},
// DFB-Pokal: gold-plated silver goblet set with gems round the rim and a large green nephrite in the middle
dfb:{vb:'0 0 90 200',h:104,d:()=>`<path fill="${G_}" d="M20,196 L70,196 C68,184 57,180 52,170 L38,170 C33,180 22,184 20,196Z"/>
  <rect x="40" y="140" width="10" height="30" fill="${G_}"/><ellipse cx="45" cy="154" rx="9" ry="5" fill="${G_}"/>
  <path fill="${G_}" d="M15,30 L75,30 C75,96 62,132 52,140 L38,140 C28,132 15,96 15,30Z"/><rect x="13" y="25" width="64" height="8" rx="2" fill="${G_}"/>
  <g stroke="none">${Array.from({length:10},(_,i)=>`<circle cx="${18+i*6}" cy="29" r="1.8" fill="${i%2?'#e8f1f4':'#1f8a5a'}"/>`).join('')}<circle cx="33" cy="118" r="2" fill="#1f8a5a"/><circle cx="45" cy="121" r="2" fill="#e8f1f4"/><circle cx="57" cy="118" r="2" fill="#1f8a5a"/></g>
  <ellipse cx="45" cy="78" rx="12" ry="15" fill="${M_}" stroke="#f1cc66" stroke-width="2"/>`},
// Serie A (Coppa Campioni d'Italia): tall gold funnel flaring from a slim stem on a round base
seriea:{vb:'0 0 110 200',h:112,d:()=>`<rect x="26" y="182" width="58" height="14" rx="4" fill="${G_}"/><ellipse cx="55" cy="182" rx="29" ry="4" fill="${G_}"/>
  <path fill="${G_}" d="M48,182 L62,182 C62,132 74,72 100,26 L10,26 C36,72 48,132 48,182Z"/>
  <path fill="none" stroke="rgba(255,255,255,.35)" d="M55,180 C55,130 55,70 55,30"/><path fill="none" stroke="rgba(0,0,0,.2)" d="M51,180 C49,130 38,72 22,32 M59,180 C61,130 72,72 88,32"/>
  <path fill="#2350b8" opacity=".85" stroke="none" d="M16,37 C40,41 70,41 94,37 L92,43 C70,47 40,47 18,43Z"/>
  <ellipse cx="55" cy="26" rx="45" ry="7" fill="#7a5310"/><ellipse cx="55" cy="26" rx="45" ry="7" fill="none" stroke="#fff0b0" stroke-width="1"/>`},
// Coppa Italia: chunky gold goblet studded in the colours of the Italian flag, tricolour shield on the front
coppa:{vb:'0 0 100 200',h:108,d:()=>{const tc=['#1f8a4c','#f4f4ef','#c8302e'];
  return`<path fill="${G_}" d="M18,196 L82,196 C80,182 65,176 60,166 L40,166 C35,176 20,182 18,196Z"/><rect x="44" y="140" width="12" height="26" fill="${G_}"/><ellipse cx="50" cy="152" rx="10" ry="5" fill="${G_}"/>
  <path fill="${G_}" d="M13,40 L87,40 C87,104 71,134 57,140 L43,140 C29,134 13,104 13,40Z"/><rect x="11" y="34" width="78" height="8" rx="2" fill="${G_}"/>
  <g stroke="none">${Array.from({length:11},(_,i)=>`<circle cx="${17+i*6.6}" cy="52" r="2.2" fill="${tc[i%3]}"/>`).join('')}</g>
  <rect x="41" y="76" width="6" height="20" fill="${tc[0]}" stroke="none"/><rect x="47" y="76" width="6" height="20" fill="${tc[1]}" stroke="none"/><rect x="53" y="76" width="6" height="20" fill="${tc[2]}" stroke="none"/><rect x="41" y="76" width="18" height="20" fill="none" stroke="#f1cc66" stroke-width="1.5"/>`}},
// Ligue 1 (2024 onward): gold ball held up by columns shaped like the number 1, on a hexagonal base
l1:{vb:'0 34 100 166',h:110,d:()=>`<polygon points="10,180 22,186 78,186 90,180 90,190 78,196 22,196 10,190" fill="${G_}"/><polygon points="22,174 78,174 90,180 78,186 22,186 10,180" fill="url(#tgGr)"/>
  ${[30,43,57,70].map(x=>`<rect x="${x-2.5}" y="88" width="5" height="88" fill="${G_}"/><path fill="${G_}" d="M${x-2.5},92 l-5,5 l0,-4 l5,-5Z"/>`).join('')}
  <ellipse cx="50" cy="88" rx="24" ry="4" fill="${G_}"/><circle cx="50" cy="62" r="24" fill="url(#tgGr)"/>`},
// Ligue 1 "L'Hexagoal" (2007-2024): a smooth silver ball inside a six-sided frame
hexagoal:{vb:'0 52 120 148',h:104,d:()=>{const hx=ring(60,116,56,0,6).map(p=>p.join(',')).join(' ');
  return`<rect x="34" y="176" width="52" height="20" rx="3" fill="${S_}"/><rect x="50" y="162" width="20" height="14" fill="${S_}"/>
  <polygon points="${hx}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="13" stroke-linejoin="round"/><polygon points="${hx}" fill="none" stroke="${S_}" stroke-width="10.5" stroke-linejoin="round"/>
  <circle cx="60" cy="116" r="30" fill="url(#tgSr)"/>`}},
// Coupe de France: twin-handled silver vase with a small cherub on top
cdf:{vb:'0 0 110 200',h:110,d:()=>{const h=hndl('M40,54 C24,50 16,70 28,82 C34,88 32,96 30,98',4);
  return`<rect x="32" y="178" width="46" height="18" rx="2" fill="${K_}"/><path fill="${S_}" d="M38,178 L72,178 C68,168 62,164 60,154 L50,154 C48,164 42,168 38,178Z"/>
  ${h}${mir(h,110)}<path fill="${S_}" d="M31,64 C21,94 30,128 50,146 L50,154 L60,154 L60,146 C80,128 89,94 79,64Z"/><path fill="${S_}" d="M38,64 L72,64 L69,50 L41,50Z"/>
  <ellipse cx="55" cy="50" rx="17" ry="3.5" fill="url(#tgSr)"/><path fill="${S_}" d="M41,50 C43,42 50,40 55,40 C60,40 67,42 69,50Z"/>
  <ellipse cx="48.5" cy="28" rx="5" ry="2.6" fill="${S_}" transform="rotate(-20 48.5 28)"/><ellipse cx="61.5" cy="28" rx="5" ry="2.6" fill="${S_}" transform="rotate(20 61.5 28)"/>
  <ellipse cx="55" cy="33" rx="4" ry="6.5" fill="${S_}"/><circle cx="55" cy="22" r="4" fill="${S_}"/>`}},
// any other league title (second tier and below): lidded silver cup on a black plinth
league2:{vb:'0 30 100 170',h:96,d:()=>{const h=hndl('M23,70 C8,70 8,98 30,104',4);
  return`<rect x="28" y="176" width="44" height="20" rx="2" fill="${K_}"/><path fill="${S_}" d="M34,176 L66,176 L60,162 L40,162Z"/><rect x="46" y="136" width="8" height="26" fill="${S_}"/>
  ${h}${mir(h,100)}<path fill="${S_}" d="M22,64 L78,64 C78,104 64,130 54,136 L46,136 C36,130 22,104 22,64Z"/>
  <path fill="${S_}" d="M26,64 C28,50 40,44 50,44 C60,44 72,50 74,64Z"/><rect x="48" y="40" width="4" height="5" fill="${S_}"/><circle cx="50" cy="37" r="5" fill="url(#tgSr)"/>`}},
// Ballon d'Or: a golden football on a gold base
bdo:{vb:'0 76 80 124',h:90,d:()=>`<path fill="${G_}" d="M16,196 L64,196 L56,150 L24,150Z"/><rect x="21" y="146" width="38" height="5" rx="1" fill="${G_}"/><rect x="34" y="136" width="12" height="11" fill="${G_}"/>
  <circle cx="40" cy="110" r="30" fill="url(#tgGr)"/>${ballSeams(40,110,30,'rgba(100,66,8,.55)')}`},
// the remaining individual awards: original designs (their real-world trophies aren't well documented)
kopa:{vb:'0 82 70 118',h:80,d:()=>`<rect x="15" y="184" width="40" height="12" rx="3" fill="${S_}"/><path fill="${S_}" d="M30,184 L40,184 L38,128 L32,128Z"/><path fill="${S_}" d="M23,126 C25,134 45,134 47,126Z"/>
  <circle cx="35" cy="106" r="20" fill="url(#tgGr)"/>${ballSeams(35,106,20,'rgba(100,66,8,.55)')}`},
gboy:{vb:'0 74 80 126',h:84,d:()=>`<path fill="${K_}" d="M22,196 L58,196 L52,180 L28,180Z"/><rect x="37" y="140" width="6" height="40" fill="${K_}"/>
  <circle cx="40" cy="112" r="34" fill="url(#tgGr)"/><circle cx="40" cy="112" r="27" fill="none" stroke="rgba(110,72,10,.5)" stroke-width="1.5"/>
  <circle cx="40" cy="112" r="12" fill="${G_}"/>${ballSeams(40,112,12,'rgba(100,66,8,.6)')}`},
yashin:{vb:'0 56 80 144',h:88,d:()=>`<rect x="16" y="180" width="48" height="16" rx="2" fill="${K_}"/><rect x="28" y="156" width="24" height="24" rx="3" fill="${G_}"/><rect x="28" y="164" width="24" height="4" fill="rgba(0,0,0,.25)" stroke="none"/>
  <path fill="${G_}" d="M26,158 L54,158 C58,140 60,124 58,110 L22,110 C20,124 22,140 26,158Z"/>
  <rect x="22" y="78" width="8" height="40" rx="4" fill="${G_}"/><rect x="31" y="66" width="8" height="50" rx="4" fill="${G_}"/><rect x="40" y="64" width="8" height="52" rx="4" fill="${G_}"/><rect x="49" y="72" width="8" height="44" rx="4" fill="${G_}"/>
  <rect x="8" y="108" width="8" height="30" rx="4" fill="${G_}" transform="rotate(-35 12 123)"/>`},
// Golden Boot: a gold football boot on a plinth
gboot:{vb:'0 120 100 80',h:62,d:()=>`<rect x="16" y="178" width="68" height="18" rx="2" fill="${K_}"/><rect x="36" y="183" width="28" height="7" fill="${B_}"/>
  <path fill="${G_}" d="M22,176 L22,140 C22,132 28,128 34,128 L44,128 L48,142 C56,150 70,154 80,158 C86,160 88,166 86,172 L84,176Z"/>
  <g fill="none" stroke="rgba(90,60,8,.6)" stroke-width="1.4"><path d="M34,136 l10,8 M38,132 l10,8 M42,130 l9,8"/><path d="M22,170 L85,170"/></g>`},
potsn:{vb:'0 52 80 148',h:86,d:()=>{const s=ring(40,124,8,-90,10).map(([x,y],i)=>{const r=i%2?.45:1;return[40+(x-40)*r,124+(y-124)*r].join(',')}).join(' ');
  return`<path fill="${K_}" d="M20,196 L60,196 L56,186 L24,186Z"/><rect x="38" y="60" width="4" height="126" fill="${K_}"/><rect x="22" y="58" width="36" height="4" fill="${K_}"/>
  <path fill="#5b2a86" d="M30,62 L50,62 L46,100 L40,108 L34,100Z"/><circle cx="40" cy="124" r="20" fill="url(#tgGr)"/>
  <circle cx="40" cy="124" r="14" fill="none" stroke="rgba(110,72,10,.5)"/><polygon points="${s}" fill="rgba(110,72,10,.45)" stroke="none"/>`}}
};
const TROSHORT={ucl:'UCL',uel:'UEL',uecl:'UECL',wc:'World Cup',euro:'EURO',pl:'Prem',laliga:'LaLiga',bl:'Bundesliga',seriea:'Serie A',l1:'Ligue 1',hexagoal:'Ligue 1',facup:'FA Cup',copa:'Copa',dfb:'DFB-Pokal',coppa:'Coppa',cdf:'CdF',bdo:"Ballon d'Or",kopa:'Kopa',gboy:'Golden Boy',yashin:'Yashin',gboot:'Golden Boot',potsn:'POTS'};
const TROORD=['ucl','wc','euro','pl','laliga','bl','seriea','l1','hexagoal','uel','uecl','facup','copa','dfb','coppa','cdf','league2','bdo','kopa','gboy','yashin','gboot','potsn'];
function trophyKey(t,s){
  const fixed={'Champions League':'ucl','Europa League':'uel','Conference League':'uecl','World Cup':'wc','European Championship':'euro'};
  if(fixed[t])return fixed[t];
  const L=LGN.find(l=>l.n===t);
  if(L)return L.tier===1?({England:'pl',Spain:'laliga',Germany:'bl',Italy:'seriea',France:parseInt(s)>=2024?'l1':'hexagoal'}[L.country]||'league2'):'league2';
  const C=Object.keys(CUPN).find(k=>CUPN[k]===t);
  return C?{England:'facup',Spain:'copa',Germany:'dfb',Italy:'coppa',France:'cdf'}[C]:'league2';
}
function awardKey(t){
  if(t==="Ballon d'Or")return'bdo';if(t==='Kopa Trophy')return'kopa';if(t==='Golden Boy')return'gboy';if(t==='Yashin Trophy')return'yashin';
  if(/Golden Boot/.test(t))return'gboot';if(/Player of the Season/.test(t))return'potsn';return'league2';
}
function trophySVG(k,f){f=f||1;const A=typeof TROPHY_ASSETS!=='undefined'&&TROPHY_ASSETS[k];if(A)return A.c({size:Math.round(A.h*f),className:'tc-art'});
  const T=TRO[k]||TRO.league2,[,,vw,vh]=T.vb.split(' ').map(Number);
  return`<svg viewBox="${T.vb}" style="height:${Math.round(T.h*f)}px;width:${Math.round(T.h*f*vw/vh)}px"><g stroke="rgba(0,0,0,.3)" stroke-width=".8" stroke-linejoin="round">${T.d()}</g></svg>`;
}
const cobweb=cls=>`<svg class="cobweb ${cls}" viewBox="0 0 80 80"><g fill="none" stroke="currentColor" stroke-width="1"><path d="M80 0 0 80M80 18 18 80M80 36 36 80M80 54 54 80M80 0Q46 14 28 46 16 64 0 80M80 0Q60 36 50 56 32 70 0 80"/></g></svg>`;
// TrophyCabinet(items): a display cabinet with a wooden frame, three real shelves with a spotlight over each, and a glass front.
// items: [{k,t,s,c}] (k = drawing key); trophies are dealt onto the shelves and stand directly on the boards.
function cabinet(items,stale,empty){
  const sorted=items.slice().sort((a,b)=>TROORD.indexOf(a.k)-TROORD.indexOf(b.k)||a.t.localeCompare(b.t)||a.s.localeCompare(b.s));
  const per=Math.max(3,Math.ceil(sorted.length/3)),f=per<=3?1:per<=4?.9:per<=5?.75:per<=7?.6:.46;
  const shelf=i=>sorted.slice(i*per,(i+1)*per).map(x=>{const lab=TROSHORT[x.k]||((LGN.find(l=>l.n===x.t)||{}).s)||x.t;
    return`<div class="tc-item" title="${esc(x.t+' · '+x.s+(x.c?' · '+x.c:''))}">${trophySVG(x.k,f)}<i class="tc-plq">${esc(lab)} ${esc(String(x.s).slice(2))}</i></div>`}).join('');
  return`<div class="tc${stale?' stale':''}">${TRODEFS}<div class="tc-cornice"></div><div class="tc-frame"><div class="tc-back">
  ${[0,1,2].map(i=>`<div class="tc-shelf"><div class="tc-spot"></div><div class="tc-row">${shelf(i)}</div><div class="tc-board"></div></div>`).join('')}
  ${items.length?'':`<div class="tc-empty">${empty}</div>`}${stale?cobweb('l')+cobweb('r'):''}<div class="tc-glass"></div></div></div><span class="tc-knob"></span><div class="tc-base"></div></div>`;
}
function vCabinet(){
  const me=ST.me,hon=me.hon,years=hon.map(h=>parseInt(h.s)),lastYr=years.length?Math.max(...years):null;
  const since=lastYr!=null?ST.season-lastYr:null,seniorSsn=me.rows.filter(r=>!r.youth).length;
  const stale=(since!=null&&since>=3)||(lastYr==null&&seniorSsn>=3);
  return G('pad s6',`<h2>Trophy cabinet ${hon.length?kk(hon.length+' trophies'):''}</h2>${cabinet(hon.map(h=>({k:trophyKey(h.t,h.s),t:h.t,s:h.s,c:h.c})),stale,'Empty shelves. Win something and it goes in here.')}`);
}
function vAwardCabinet(){
  const me=ST.me,won=me.aw.filter(a=>!/: #/.test(a.t)),near=me.aw.filter(a=>/: #/.test(a.t)),bd=won.filter(a=>a.t==="Ballon d'Or").length;
  return G('pad s6',`<h2>Awards ${bd?kk(bd+" Ballon d'Or"):''}</h2>${cabinet(won.map(a=>({k:awardKey(a.t),t:a.t,s:a.s})),false,'No individual awards yet.')}
  ${near.length?`<div class="m sm mt">Also came close: ${near.slice().reverse().map(a=>esc(a.t)+' ('+esc(a.s)+')').join(' · ')}</div>`:''}`);
}
