/* Trophy vector registry. Each trophy is a standalone SVG "component": TrophyXxx({size=64,className}) -> SVG string.
   size is the rendered height in px (width follows the artwork's aspect ratio). Every gradient / clip / filter id is
   prefixed per trophy ("ucl-", "wc-", ...) so many trophies can sit in one cabinet without clashing. */
const _lg=(id,stops,o)=>{o=o||{};const x1=o.x1!=null?o.x1:0,y1=o.y1||0,x2=o.x2!=null?o.x2:1,y2=o.y2||0;
  return`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${o.u?' gradientUnits="userSpaceOnUse"':''}>${stops.map(s=>`<stop offset="${s[0]}" stop-color="${s[1]}"${s[2]!=null?` stop-opacity="${s[2]}"`:''}/>`).join('')}</linearGradient>`};
const _rg=(id,stops,o)=>{o=o||{};return`<radialGradient id="${id}" cx="${o.cx||.5}" cy="${o.cy||.5}" r="${o.r||.5}"${o.fx!=null?` fx="${o.fx}" fy="${o.fy}"`:''}>${stops.map(s=>`<stop offset="${s[0]}" stop-color="${s[1]}"${s[2]!=null?` stop-opacity="${s[2]}"`:''}/>`).join('')}</radialGradient>`};
const _svg=(vb,size,cls,label,defs,body)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb[0]} ${vb[1]}" width="${Math.round(size*vb[0]/vb[1])}" height="${size}" class="${cls||''}" style="overflow:visible" role="img" aria-label="${label}"><defs>${defs}</defs>${body}</svg>`;
const _shadow=(id,cx,cy,rx)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx*.1}" fill="#000" opacity=".5"/>`;
const _CHROME=[[0,'#454a50'],[.1,'#9aa0a6'],[.24,'#f4f6f8'],[.31,'#ffffff'],[.38,'#cfd4d9'],[.52,'#7f858c'],[.68,'#dfe3e6'],[.8,'#fdfdfd'],[.9,'#9298a0'],[1,'#383c42']];
const _GOLD=[[0,'#5a3b06'],[.12,'#b8841f'],[.26,'#f7d46b'],[.34,'#fff4be'],[.44,'#e0a93a'],[.6,'#a8741a'],[.76,'#f2c95a'],[.88,'#fff0a8'],[1,'#5f3f08']];
const _BG=(x,y,w,h,id,o)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"${o||''}/>`;

/* 1. UEFA Champions League: slender stem into a wide flared bowl, massive loop handles rising above the rim with inward hooks */
const TrophyUCL=({size=64,className}={})=>{
  const body='M28,46 C30,76 50,92 53,112 L52.5,126 C49,131 41,134 39,143 L81,143 C79,134 71,131 67.5,126 L67,112 C70,92 90,76 92,46 Z';
  const hand='M35,64 C10,58 6,22 18,13 C24,9 31,10 35,17 L37,24';
  const defs=_lg('ucl-chrome',_CHROME)+_lg('ucl-handle',_CHROME,{x1:0,y1:0,x2:1,y2:1})+_lg('ucl-spec',[[0,'#fff',0],[.5,'#fff',.95],[1,'#fff',0]],{x1:0,y1:0,x2:1,y2:0})
    +_lg('ucl-fade',[[0,'#fff',.9],[1,'#fff',0]],{x1:0,y1:0,x2:0,y2:1})+_rg('ucl-in',[[0,'#1b1e22'],[.7,'#4b5057'],[1,'#a4aab0']],{cx:.5,cy:.4,r:.6})
    +_lg('ucl-base',_CHROME)+`<clipPath id="ucl-clip"><path d="${body}"/></clipPath>`;
  const hh=m=>`<g${m?' transform="translate(120,0) scale(-1,1)"':''}><path d="${hand}" fill="none" stroke="#15171a" stroke-width="7" stroke-linecap="round" opacity=".55" transform="translate(1.5,1.5)"/><path d="${hand}" fill="none" stroke="url(#ucl-handle)" stroke-width="5.4" stroke-linecap="round"/><path d="${hand}" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".85" transform="translate(-1,-1)"/></g>`;
  return _svg([120,160],size,className,'UEFA Champions League trophy',defs,`${_shadow('',60,152,38)}
  <ellipse cx="60" cy="150" rx="35" ry="5" fill="url(#ucl-base)"/><path d="M26,146 L94,146 L94,150 C94,153 26,153 26,150Z" fill="url(#ucl-base)"/>
  <ellipse cx="60" cy="146" rx="34" ry="4.6" fill="url(#ucl-base)"/><path d="M36,141 L84,141 L84,146 L36,146Z" fill="url(#ucl-base)"/><ellipse cx="60" cy="141" rx="24" ry="3.4" fill="url(#ucl-base)"/>
  ${hh(0)}${hh(1)}
  <path d="${body}" fill="url(#ucl-chrome)"/><g clip-path="url(#ucl-clip)"><rect x="47" y="44" width="5.5" height="100" fill="url(#ucl-spec)"/><rect x="40" y="44" width="40" height="34" fill="url(#ucl-fade)" opacity=".28"/>
  <rect x="64" y="52" width="2.2" height="62" fill="url(#ucl-spec)" opacity=".55"/></g>
  <ellipse cx="60" cy="46" rx="32" ry="5.8" fill="url(#ucl-chrome)"/><ellipse cx="60" cy="46.5" rx="29.4" ry="4.2" fill="url(#ucl-in)"/>
  <ellipse cx="60" cy="125" rx="9" ry="2.2" fill="url(#ucl-chrome)"/><ellipse cx="60" cy="112" rx="8" ry="2" fill="url(#ucl-chrome)"/>`);
};

/* 2. FIFA World Cup: tapered, widening to the top; two figures lift a textured globe; two malachite bands in a cylindrical base */
const TrophyWorldCup=({size=64,className}={})=>{
  const defs=_lg('wc-gold',_GOLD)+_lg('wc-gold-d',[[0,'#3f2703'],[.5,'#8a5b0d'],[1,'#3f2703']])+_rg('wc-globe',[[0,'#fff6c2'],[.35,'#f0c451'],[.75,'#b07a17'],[1,'#5e3d07']],{cx:.36,cy:.3,r:.8})
    +_lg('wc-mal',[[0,'#032416'],[.3,'#17935a'],[.5,'#0b5c38'],[.75,'#1fa86a'],[1,'#032416']])+`<clipPath id="wc-gclip"><circle cx="40" cy="42" r="27"/></clipPath>
    <pattern id="wc-tex" width="3.2" height="3.2" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#7a4e08" opacity=".35"/><circle cx="2.4" cy="2.4" r=".5" fill="#fff3b8" opacity=".35"/></pattern>`;
  const fig=(m)=>`<g${m?' transform="translate(80,0) scale(-1,1)"':''}><path d="M30,134 C27,114 33,106 27,92 C21,80 11,70 10,54 C9,44 13,34 19,30 C21,42 23,50 28,58 C34,70 40,80 40,94 C40,108 35,118 34,134Z" fill="url(#wc-gold)" stroke="#7a4e08" stroke-width="1"/><path d="M34,134 C36,118 40,108 40,94 C40,80 34,70 28,58 C32,72 34,90 32,106 C31,118 31,126 30,134Z" fill="#4a2f04" opacity=".5"/>
  <path d="M22,36 C18,46 17,58 24,72 C30,84 33,92 31,104" fill="none" stroke="#7a4e08" stroke-width="1.4" opacity=".55"/><path d="M27,40 C25,52 30,64 33,74" fill="none" stroke="#fff6c2" stroke-width="1.2" opacity=".7"/></g>`;
  return _svg([80,160],size,className,'FIFA World Cup trophy',defs,`${_shadow('',40,153,26)}
  <path d="M15,134 L65,134 L67,152 L13,152Z" fill="url(#wc-gold)"/><rect x="14.2" y="139" width="51.6" height="5.4" fill="url(#wc-mal)"/><rect x="13.4" y="146.6" width="53.2" height="4.4" fill="url(#wc-mal)"/>
  <rect x="13" y="152" width="54" height="3" rx="1.2" fill="url(#wc-gold-d)"/>
  <path d="M28,134 C27,118 31,108 22,94 C12,80 6,66 6,50 L74,50 C74,66 68,80 58,94 C49,108 53,118 52,134Z" fill="url(#wc-gold)"/>
  <path d="M30,132 C40,118 36,106 28,94 C22,82 22,70 30,58 M50,132 C40,118 44,106 52,94 C58,82 58,70 50,58" fill="none" stroke="#7a4e08" stroke-width="1.5" opacity=".5"/>
  ${fig(0)}${fig(1)}
  <circle cx="40" cy="42" r="27" fill="url(#wc-globe)"/><g clip-path="url(#wc-gclip)"><path d="M20,28 C26,20 36,22 38,30 C40,38 30,40 28,48 C26,54 20,50 18,42Z M44,24 C52,20 62,26 60,36 C58,46 50,44 50,54 C48,64 40,60 42,50 C44,42 40,30 44,24Z M24,58 C30,56 36,60 34,66 C30,70 24,66 24,58Z" fill="#6b4408" opacity=".5"/>
  <circle cx="40" cy="42" r="27" fill="url(#wc-tex)"/><ellipse cx="40" cy="42" rx="12" ry="27" fill="none" stroke="#7a4e08" stroke-width=".7" opacity=".45"/><path d="M13,42 H67 M16,30 H64 M16,54 H64" stroke="#7a4e08" stroke-width=".7" opacity=".4" fill="none"/></g>
  <ellipse cx="29" cy="30" rx="8" ry="5" fill="#fff" opacity=".5" transform="rotate(-35 29 30)"/>
  <path d="M30,40 C33,34 36,32 40,34 C44,36 44,42 40,46 C37,48 33,50 30,46Z" fill="url(#wc-gold)" opacity=".0"/>`);
};

/* 3. UEFA European Championship (Henri Delaunay Cup): tall lidless amphora, slender rope handles tucked to the body, plinth engraved UEFA */
const TrophyEuro=({size=64,className}={})=>{
  const body='M33,24 L57,24 C57,38 60,44 64,50 C78,58 82,84 72,106 C66,120 54,130 52,140 L38,140 C36,130 24,120 18,106 C8,84 12,58 26,50 C30,44 33,38 33,24Z';
  const hd='M33,32 C16,28 10,44 19,62';
  const defs=_lg('euro-silver',[[0,'#555a60'],[.1,'#a9aeb4'],[.22,'#eef0f2'],[.3,'#fff'],[.4,'#b9bec3'],[.55,'#7d838a'],[.7,'#d3d7db'],[.84,'#f4f5f6'],[1,'#41464c']])
    +_lg('euro-brush',[[0,'#777c83'],[.5,'#e6e8ea'],[1,'#777c83']],{x1:0,y1:0,x2:0,y2:1})+_lg('euro-rope',[[0,'#e8eaec'],[.5,'#fff'],[1,'#8a9097']],{x1:0,y1:0,x2:1,y2:1})+`<clipPath id="euro-clip"><path d="${body}"/></clipPath>`
    +_lg('euro-spec',[[0,'#fff',0],[.5,'#fff',.85],[1,'#fff',0]]);
  const rope=m=>`<g${m?' transform="translate(90,0) scale(-1,1)"':''}><path d="${hd}" fill="none" stroke="#1a1c1f" stroke-width="6" stroke-linecap="round" opacity=".5" transform="translate(1,1.4)"/><path d="${hd}" fill="none" stroke="url(#euro-rope)" stroke-width="4.4" stroke-linecap="round"/><path d="${hd}" fill="none" stroke="#6e747b" stroke-width="4.4" stroke-linecap="round" stroke-dasharray="1.4 2.2"/></g>`;
  return _svg([90,170],size,className,'UEFA European Championship trophy',defs,`${_shadow('',45,167,38)}
  <path d="M12,160 L78,160 L80,166 C80,169 10,169 10,166Z" fill="url(#euro-silver)"/><ellipse cx="45" cy="160" rx="34" ry="4" fill="url(#euro-silver)"/><text x="45" y="165.6" font-family="serif" font-size="5.2" font-weight="700" text-anchor="middle" fill="#3a3e43" letter-spacing=".9">UEFA</text>
  <path d="M24,152 L66,152 L68,158 L22,158Z" fill="url(#euro-silver)"/><path d="M30,146 C30,150 36,150 38,144 L52,144 C54,150 60,150 60,146 L60,152 L30,152Z" fill="url(#euro-silver)"/>
  <path d="M38,140 L52,140 L53,146 L37,146Z" fill="url(#euro-silver)"/>
  ${rope(0)}${rope(1)}
  <path d="${body}" fill="url(#euro-silver)"/><g clip-path="url(#euro-clip)"><rect x="24" y="52" width="6" height="64" fill="url(#euro-spec)" transform="rotate(-8 27 84)"/><rect x="62" y="56" width="3" height="52" fill="url(#euro-spec)" opacity=".5"/><circle cx="45" cy="80" r="9" fill="none" stroke="#4d5359" stroke-width=".7" opacity=".7"/></g>
  <path d="M26,50 C36,56 54,56 64,50" fill="none" stroke="#585e65" stroke-width=".9" opacity=".7"/>
  <ellipse cx="45" cy="24" rx="12" ry="2.4" fill="url(#euro-brush)"/>
  <path d="M15,14 L75,14 L72,24 L18,24Z" fill="url(#euro-silver)"/><ellipse cx="45" cy="14" rx="30" ry="5" fill="url(#euro-brush)"/><ellipse cx="45" cy="14" rx="26" ry="3.6" fill="#8a9097"/>
  <path d="M19,22 L71,22" stroke="#4d5359" stroke-width="1.2" stroke-dasharray="1.2 1.1" opacity=".75"/>`);
};

/* 4. Premier League: silver chalice with angular side handles, two lions on the handles, a crowned lid, green malachite stepped pedestal */
const TrophyPremierLeague=({size=64,className}={})=>{
  const body='M40,72 L90,72 C92,100 82,122 72,132 L58,132 C48,122 38,100 40,72Z';
  const defs=_lg('pl-silver',_CHROME)+_lg('pl-gold',_GOLD)+_lg('pl-mal',[[0,'#02170e'],[.18,'#0c6a41'],[.34,'#04301d'],[.5,'#18935a'],[.66,'#06402a'],[.82,'#13804f'],[1,'#02170e']])
    +`<clipPath id="pl-clip"><path d="${body}"/></clipPath>`+_lg('pl-spec',[[0,'#fff',0],[.5,'#fff',.9],[1,'#fff',0]])+_rg('pl-gem',[[0,'#ff9aa8'],[.5,'#c0143a'],[1,'#5a0618']],{cx:.4,cy:.35,r:.7});
  const hd='M41,74 L22,74 L22,86 L34,104 L50,118';
  const handle=m=>`<g${m?' transform="translate(130,0) scale(-1,1)"':''}><path d="${hd}" fill="none" stroke="#111" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" opacity=".5" transform="translate(1.4,1.4)"/><path d="${hd}" fill="none" stroke="url(#pl-silver)" stroke-width="5.4" stroke-linejoin="round" stroke-linecap="round"/><path d="${hd}" fill="none" stroke="#fff" stroke-width="1.2" stroke-linejoin="round" opacity=".8" transform="translate(-1,-1)"/>
  <g fill="url(#pl-gold)" stroke="#6b4508" stroke-width=".5"><path d="M13,68 L16,62 C17,58 21,57 24,59 L29,60 C32,60 34,63 33,66 L32,70 L28,70 L27,67 L20,67 L19,70 L14,70Z"/><circle cx="19" cy="55.5" r="4.6"/><path d="M15,52 C13,56 14,60 17,61 L19,58Z"/><path d="M33,64 C37,63 39,60 38,56" fill="none" stroke="#c9961f" stroke-width="1.6"/><circle cx="17.6" cy="55" r=".7" fill="#4a2c02" stroke="none"/></g></g>`;
  return _svg([130,170],size,className,'Premier League trophy',defs,`${_shadow('',65,167,40)}
  <path d="M26,166 L104,166 L104,160 L26,160Z" fill="url(#pl-mal)"/><path d="M32,160 L98,160 L98,152 L32,152Z" fill="url(#pl-mal)"/><path d="M38,152 L92,152 L92,146 L38,146Z" fill="url(#pl-mal)"/>
  <path d="M26,160 L104,160 M32,152 L98,152 M38,146 L92,146" stroke="#5fe0a0" stroke-width=".6" opacity=".4"/><ellipse cx="65" cy="146" rx="27" ry="3" fill="url(#pl-silver)"/>
  <path d="M52,144 L78,144 L72,136 L58,136Z" fill="url(#pl-silver)"/><path d="M56,132 L74,132 L73,136 L57,136Z" fill="url(#pl-silver)"/>
  ${handle(0)}${handle(1)}
  <path d="${body}" fill="url(#pl-silver)"/><g clip-path="url(#pl-clip)"><rect x="49" y="72" width="6" height="62" fill="url(#pl-spec)"/><rect x="74" y="80" width="2.6" height="42" fill="url(#pl-spec)" opacity=".5"/></g>
  <path d="M42,88 C56,93 74,93 88,88" fill="none" stroke="#5f656c" stroke-width=".8" opacity=".6"/>
  <ellipse cx="65" cy="72" rx="25" ry="4.2" fill="url(#pl-silver)"/>
  <path d="M42,72 C44,56 54,48 65,48 C76,48 86,56 88,72Z" fill="url(#pl-silver)"/><path d="M46,68 C48,57 56,52 62,51" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/>
  <path d="M55,50 L75,50 L74,44 L56,44Z" fill="url(#pl-gold)"/><ellipse cx="65" cy="44" rx="10" ry="1.8" fill="url(#pl-gold)"/>
  <path d="M52,43 C51,38 52,34 54,32 L58,36 L61,24 L65,34 L69,24 L72,36 L76,32 C78,34 79,38 78,43 C72,46 58,46 52,43Z" fill="url(#pl-gold)" stroke="#6b4508" stroke-width=".5"/>
  <path d="M55,32 L58,36 M75,32 L72,36" stroke="#6b4508" stroke-width=".5"/><g fill="url(#pl-gold)"><circle cx="54" cy="31" r="2.2"/><circle cx="61" cy="22" r="2.2"/><circle cx="69" cy="22" r="2.2"/><circle cx="76" cy="31" r="2.2"/><circle cx="65" cy="31" r="2.4"/></g>
  <circle cx="58" cy="42" r="1.8" fill="url(#pl-gem)"/><circle cx="65" cy="43" r="1.8" fill="url(#pl-gem)"/><circle cx="72" cy="42" r="1.8" fill="url(#pl-gem)"/><path d="M58,30 C60,27 62,27 63,30" fill="none" stroke="#fff6c2" stroke-width=".8" opacity=".8"/>`);
};

/* 5. La Liga: minimalist flared vase, two sleek angular ribbon handles sweeping out and down, central emblem ribbon, stepped base with a dark tier */
const TrophyLaLiga=({size=64,className}={})=>{
  const body='M42,36 L98,36 C98,64 86,96 78,116 L62,116 C54,96 42,64 42,36Z';
  const defs=_lg('liga-silver',[[0,'#4b5056'],[.12,'#a3a9af'],[.28,'#f2f4f6'],[.36,'#ffffff'],[.46,'#bfc4c9'],[.6,'#7d838a'],[.76,'#dfe3e6'],[.88,'#f9fafb'],[1,'#41464c']])
    +_lg('liga-rib',[[0,'#8d939a'],[.4,'#fafbfc'],[.7,'#aeb4ba'],[1,'#585e65']],{x1:0,y1:0,x2:1,y2:1})+_lg('liga-dark',[[0,'#050506'],[.4,'#2b2d31'],[.6,'#17181b'],[1,'#050506']])
    +`<clipPath id="liga-clip"><path d="${body}"/></clipPath><pattern id="liga-hex" width="9" height="7.8" patternUnits="userSpaceOnUse"><path d="M4.5,0 L9,2.2 V5.6 L4.5,7.8 L0,5.6 V2.2Z" fill="none" stroke="#69707a" stroke-width=".5" opacity=".6"/></pattern>`+_lg('liga-spec',[[0,'#fff',0],[.5,'#fff',.9],[1,'#fff',0]]);
  const rb=m=>`<g${m?' transform="translate(140,0) scale(-1,1)"':''}><path d="M46,40 L9,26 L4,36 C6,76 26,100 54,108 L55,98 C34,92 20,70 18,44 L47,52Z" fill="#15171a" opacity=".5" transform="translate(1.6,1.6)"/><path d="M46,40 L9,26 L4,36 C6,76 26,100 54,108 L55,98 C34,92 20,70 18,44 L47,52Z" fill="url(#liga-rib)"/><path d="M9,26 L46,40" stroke="#fff" stroke-width="1.2" opacity=".9"/><path d="M18,46 C20,70 34,92 55,98" fill="none" stroke="#5c626a" stroke-width=".8" opacity=".7"/></g>`;
  return _svg([140,170],size,className,'La Liga trophy',defs,`${_shadow('',70,166,36)}
  <rect x="34" y="144" width="72" height="22" rx="2.5" fill="url(#liga-dark)"/><path d="M34,146 L106,146" stroke="#6a6e75" stroke-width=".8" opacity=".6"/>
  <path d="M40,144 C40,138 100,138 100,144Z" fill="url(#liga-silver)"/><ellipse cx="70" cy="138.4" rx="26" ry="3.4" fill="url(#liga-silver)"/>
  <path d="M60,138 L80,138 L76,124 L64,124Z" fill="url(#liga-silver)"/><ellipse cx="70" cy="122" rx="11" ry="2.6" fill="url(#liga-silver)"/>
  ${rb(0)}${rb(1)}
  <path d="${body}" fill="url(#liga-silver)"/><g clip-path="url(#liga-clip)"><rect x="40" y="36" width="64" height="84" fill="url(#liga-hex)"/><rect x="52" y="36" width="6" height="82" fill="url(#liga-spec)"/><rect x="82" y="44" width="2.6" height="52" fill="url(#liga-spec)" opacity=".5"/></g>
  <ellipse cx="70" cy="36" rx="28" ry="4.6" fill="url(#liga-silver)"/><ellipse cx="70" cy="36.4" rx="25.5" ry="3.4" fill="#22252a"/>
  <path d="M63,66 L77,66 L75,100 L70,94 L65,100Z" fill="#c8102e" opacity=".92"/><path d="M63,66 L70,66 L65,100Z" fill="#12418f" opacity=".92"/><path d="M63,66 L77,66" stroke="#fff" stroke-width=".8" opacity=".7"/>
  <path d="M70,53 L77,57 L77,64 L70,68 L63,64 L63,57Z" fill="url(#liga-silver)" stroke="#555b62" stroke-width=".8"/><circle cx="70" cy="60.5" r="2.4" fill="#9aa0a6" stroke="#555b62" stroke-width=".5"/>`);
};

/* 6. Serie A (Coppa Campioni d'Italia): handle-less funnel from a narrow waist, matte-blue inner bowl, mirror-gold hammered exterior, tricolore band on a weighted pedestal */
const TrophySerieA=({size=64,className}={})=>{
  const body='M8,20 C20,36 40,56 46,82 C47,90 47,96 46,104 L64,104 C63,96 63,90 64,82 C70,56 90,36 102,20Z';
  const defs=_lg('sa-gold',_GOLD)+_lg('sa-gold-v',[[0,'#fff3b3'],[.3,'#e2ab3b'],[.7,'#9a6a14'],[1,'#e8bd54']],{x1:0,y1:0,x2:0,y2:1})+_rg('sa-blue',[[0,'#3a6cf0'],[.55,'#1c3f9e'],[1,'#0b1c55']],{cx:.5,cy:.35,r:.7})
    +_lg('sa-dark',[[0,'#080808'],[.5,'#2a2a2c'],[1,'#080808']])+`<clipPath id="sa-clip"><path d="${body}"/></clipPath><pattern id="sa-ham" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="#fff" opacity=".18"/><circle cx="5" cy="5" r="2" fill="#6a430a" opacity=".3"/></pattern>`
    +_lg('sa-spec',[[0,'#fff',0],[.5,'#fff',.85],[1,'#fff',0]]);
  const rib=(c,d)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="5.2" stroke-linecap="round"/>`;
  return _svg([110,170],size,className,"Serie A Coppa Campioni d'Italia",defs,`${_shadow('',55,166,40)}
  <path d="M20,166 L90,166 L90,128 L20,128Z" fill="url(#sa-gold)"/><ellipse cx="55" cy="128" rx="35" ry="5" fill="url(#sa-gold)"/><rect x="20" y="150" width="70" height="10" fill="url(#sa-dark)"/><ellipse cx="55" cy="166" rx="35" ry="4" fill="url(#sa-gold)" opacity=".0"/>
  <circle cx="41" cy="142" r="5.4" fill="#fff" stroke="#9a6a14"/><path d="M38.6,142 h4.8 M41,139.6 v4.8" stroke="#1b7a3e" stroke-width="1.2"/><circle cx="69" cy="142" r="5.4" fill="#fff" stroke="#9a6a14"/><path d="M66.6,142 h4.8 M69,139.6 v4.8" stroke="#c8302e" stroke-width="1.2"/>
  <rect x="49" y="112" width="12" height="18" fill="url(#sa-gold)"/><ellipse cx="55" cy="123" rx="9" ry="2.6" fill="url(#sa-gold)"/>
  <path d="M38,86 C38,106 72,106 72,86 L72,100 C72,112 38,112 38,100Z" fill="url(#sa-gold)"/><path d="M38,84 L72,84 L70,104 L40,104Z" fill="url(#sa-gold-v)" stroke="#6a430a" stroke-width=".7"/><path d="M40,94 C46,88 50,98 55,90 C60,98 64,88 70,94" fill="none" stroke="#6a430a" stroke-width="1.3" opacity=".8"/>
  <path d="${body}" fill="url(#sa-gold)"/><g clip-path="url(#sa-clip)"><rect x="0" y="0" width="110" height="110" fill="url(#sa-ham)"/><rect x="26" y="26" width="6" height="74" fill="url(#sa-spec)" transform="rotate(-24 29 60)"/><rect x="50" y="52" width="3.4" height="52" fill="url(#sa-spec)" opacity=".8"/></g>
  <ellipse cx="55" cy="20" rx="47" ry="9.4" fill="url(#sa-gold)"/><ellipse cx="55" cy="20.8" rx="43.6" ry="7.2" fill="url(#sa-blue)"/><ellipse cx="46" cy="18" rx="22" ry="3" fill="#fff" opacity=".16"/>
  ${rib('#1b8a45','M42,88 C26,98 20,118 10,150')}${rib('#f4f4ef','M46,90 C34,104 30,128 24,158')}${rib('#d2312f','M64,90 C74,104 80,128 88,158')}${rib('#1b8a45','M68,88 C82,98 90,118 100,150')}
  <path d="M46,90 C34,104 30,128 24,158" fill="none" stroke="#b9bdb0" stroke-width=".8" opacity=".6"/>`);
};

/* 7. Bundesliga Meisterschale: flat ceremonial silver salver with concentric engraved rings, green tourmaline cabochons round the rim, on an angled stand */
const TrophyMeisterschale=({size=64,className}={})=>{
  const big=[0,1,2,3,4].map(i=>{const a=(-90+i*72)*Math.PI/180;return[65+53*Math.cos(a),66+53*Math.sin(a)]});
  const sm=[0,1,2,3,4,5,6,7,8,9,10].map(i=>{const a=(-62+i*360/11)*Math.PI/180;return[65+47*Math.cos(a),66+47*Math.sin(a)]});
  const st=[0,1,2,3,4,5,6].map(i=>{const a=(-90+i*360/7)*Math.PI/180;return[65+22*Math.cos(a),66+22*Math.sin(a)]});
  const defs=_lg('bl-silver',[[0,'#5b6067'],[.2,'#c6cbd0'],[.42,'#fdfdfe'],[.6,'#a3a9af'],[.8,'#e5e8eb'],[1,'#4c5157']],{x1:0,y1:0,x2:1,y2:1})+_rg('bl-face',[[0,'#f9fafb'],[.55,'#c4c9ce'],[1,'#7b8188']],{cx:.38,cy:.32,r:.85})
    +_rg('bl-green',[[0,'#8cf0b8'],[.4,'#17a05a'],[1,'#04361d']],{cx:.35,cy:.3,r:.75})+_rg('bl-crys',[[0,'#fff'],[.5,'#cfe6ef'],[1,'#7fa8bb']],{cx:.4,cy:.35,r:.7})+_lg('bl-stand',[[0,'#0f0f10'],[.5,'#3a3b3f'],[1,'#0b0b0c']])
    +_lg('bl-edge',[[0,'#7a8087'],[1,'#2b2f34']],{x1:0,y1:0,x2:1,y2:1});
  return _svg([130,150],size,className,'Bundesliga Meisterschale',defs,`${_shadow('',65,146,46)}
  <path d="M44,146 L86,146 L80,132 L50,132Z" fill="url(#bl-stand)"/><path d="M34,122 L96,122 L96,132 L34,132Z" fill="url(#bl-stand)"/><path d="M20,104 L40,128 L34,130 L16,106Z" fill="url(#bl-stand)" opacity=".0"/>
  <circle cx="68" cy="69" r="60" fill="url(#bl-edge)"/><circle cx="65" cy="66" r="60" fill="url(#bl-silver)"/><circle cx="65" cy="66" r="55.6" fill="url(#bl-face)"/>
  <g fill="none" stroke="#3a3f45" opacity=".75"><circle cx="65" cy="66" r="59" stroke-width=".6"/><circle cx="65" cy="66" r="43" stroke-width="2.8" stroke-dasharray="1.2 .9"/><circle cx="65" cy="66" r="35" stroke-width="2.4" stroke-dasharray="1 .9"/><circle cx="65" cy="66" r="29" stroke-width="1.8" stroke-dasharray=".9 .8"/><circle cx="65" cy="66" r="39" stroke-width=".7"/><circle cx="65" cy="66" r="31.6" stroke-width=".7"/></g>
  ${big.map(p=>`<ellipse cx="${p[0]}" cy="${p[1]}" rx="5.8" ry="5" fill="url(#bl-green)" stroke="#d7d9dc" stroke-width="1.4"/><ellipse cx="${p[0]-1.6}" cy="${p[1]-1.6}" rx="1.8" ry="1.1" fill="#fff" opacity=".7"/>`).join('')}
  ${sm.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="2.8" fill="url(#bl-green)" stroke="#d7d9dc" stroke-width=".8"/>`).join('')}
  <g stroke="#e9f4f8" stroke-width="1.4" opacity=".9">${st.map(p=>`<path d="M65,66 L${p[0]},${p[1]}"/>`).join('')}</g><circle cx="65" cy="66" r="9.4" fill="url(#bl-crys)" stroke="#aab1b8" stroke-width="1"/><ellipse cx="62" cy="62.6" rx="3.2" ry="2" fill="#fff" opacity=".9"/>
  <path d="M24,34 C34,18 50,10 66,10" fill="none" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>`);
};

/* 8. Ligue 1 "Hexagoal": a bold open hexagonal frame around a hexagonal cut-out, matte brushed satin gold, on an architectural stepped base */
const TrophyHexagoal=({size=64,className}={})=>{
  const hx=(cx,cy,r,rot)=>Array.from({length:6},(_,i)=>{const a=(rot+i*60)*Math.PI/180;return[cx+r*Math.cos(a),cy+r*Math.sin(a)]});
  const P=a=>a.map(p=>p.join(',')).join(' '),o=hx(60,66,56,0),i1=hx(60,66,32,0),i2=hx(60,66,38,0);
  const defs=_lg('hex-gold',[[0,'#8a6420'],[.3,'#d4aa55'],[.5,'#e7c677'],[.7,'#c89b44'],[1,'#7d581a']],{x1:0,y1:0,x2:1,y2:1})+_lg('hex-gold-d',[[0,'#5d4012'],[1,'#a67b2c']],{x1:0,y1:0,x2:1,y2:1})
    +_lg('hex-brush',[[0,'#fff',.0],[.5,'#fff',.12],[1,'#fff',0]])+_lg('hex-base',[[0,'#6e4d14'],[.45,'#cfa24b'],[.6,'#b88a33'],[1,'#5f4210']])
    +`<pattern id="hex-lines" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><rect width="2.2" height="1" fill="#fff" opacity=".07"/></pattern>`;
  return _svg([120,160],size,className,'Ligue 1 Hexagoal trophy',defs,`${_shadow('',60,157,44)}
  <path d="M26,156 L94,156 L98,148 L22,148Z" fill="url(#hex-base)"/><path d="M32,148 L88,148 L92,140 L28,140Z" fill="url(#hex-gold-d)"/><path d="M42,140 L78,140 L82,132 L38,132Z" fill="url(#hex-base)"/>
  <path d="M26,156 L94,156 M32,148 L88,148" stroke="#f3dc9a" stroke-width=".7" opacity=".6"/>
  <polygon points="${P(o.map(p=>[p[0]+4,p[1]+4]))}" fill="#3b2808" opacity=".55"/>
  <path fill-rule="evenodd" d="M${P(o).replace(/ /g,' L')}Z M${P(i1).replace(/ /g,' L')}Z" fill="url(#hex-gold)"/>
  <path fill-rule="evenodd" d="M${P(o).replace(/ /g,' L')}Z M${P(i1).replace(/ /g,' L')}Z" fill="url(#hex-lines)"/>
  <path fill-rule="evenodd" d="M${P(i2).replace(/ /g,' L')}Z M${P(i1).replace(/ /g,' L')}Z" fill="url(#hex-gold-d)"/>
  <polygon points="${P(o)}" fill="none" stroke="#f6e3a4" stroke-width="1" opacity=".7"/><polygon points="${P(i2)}" fill="none" stroke="#f6e3a4" stroke-width=".6" opacity=".5"/>
  `);
};

/* Ligue 1 (current, 2024+): a gold sphere lifted by four sharp angular prisms on a hexagonal tiered plinth */
const TrophyLigue1=({size=64,className}={})=>{
  const defs=_rg('l1-ball',[[0,'#fff3b8'],[.4,'#e5b348'],[.8,'#a8741a'],[1,'#5a3a06']],{cx:.36,cy:.3,r:.8})+_lg('l1-lit',[[0,'#fff1b0'],[.5,'#e9bd4d'],[1,'#c18a22']],{x1:0,y1:0,x2:1,y2:1})
    +_lg('l1-mid',[[0,'#d1a038'],[1,'#8f5f10']],{x1:0,y1:0,x2:1,y2:0})+_lg('l1-dark',[[0,'#8a5a0c'],[1,'#3f2703']],{x1:0,y1:0,x2:1,y2:1})+_lg('l1-base',[[0,'#7a5b22'],[.4,'#e8cf8a'],[.6,'#c9ad66'],[1,'#6a4d18']]);
  return _svg([100,170],size,className,'Ligue 1 trophy',defs,`${_shadow('',50,167,42)}
  <path d="M8,168 L92,168 L96,158 L4,158Z" fill="url(#l1-base)"/><path d="M14,158 L86,158 L90,148 L10,148Z" fill="url(#l1-base)"/><path d="M22,148 L78,148 L82,138 L18,138Z" fill="url(#l1-base)"/>
  <rect x="36" y="154" width="28" height="9" rx="1" fill="#f3e2a8" opacity=".75"/><path d="M4,158 L96,158 M10,148 L90,148" stroke="#fff3c4" stroke-width=".6" opacity=".6"/>
  <polygon points="8,60 24,54 52,126 38,130" fill="url(#l1-lit)"/><polygon points="8,60 22,64 38,130 36,130" fill="url(#l1-dark)" opacity=".7"/>
  <polygon points="58,74 70,68 66,128 54,130" fill="url(#l1-dark)"/><polygon points="62,70 74,64 68,128 66,128" fill="url(#l1-mid)" opacity=".7"/>
  <polygon points="92,58 78,52 52,126 66,130" fill="url(#l1-mid)"/><polygon points="92,58 82,66 66,130 62,128" fill="url(#l1-dark)" opacity=".6"/>
  <polygon points="34,42 56,36 50,138 32,138" fill="url(#l1-lit)"/><polygon points="34,42 40,44 38,138 32,138" fill="#fff6c8" opacity=".6"/><polygon points="56,36 52,138 50,138 54,40" fill="url(#l1-dark)" opacity=".6"/>
  <polygon points="24,54 40,46 44,52 28,60" fill="#fff1b0" opacity=".85"/><polygon points="78,52 92,58 78,62 66,56" fill="#fff1b0" opacity=".7"/>
  <circle cx="50" cy="42" r="30" fill="url(#l1-ball)"/><ellipse cx="40" cy="30" rx="11" ry="7" fill="#fff" opacity=".55" transform="rotate(-30 40 30)"/><path d="M26,56 C36,66 62,66 74,52" fill="none" stroke="#3f2703" stroke-width="2" opacity=".3"/>`);
};

/* 9. Ballon d'Or: a deep mirror-gold football with curved stitched seams, resting on a rough pyrite rock */
const TrophyBallonDor=({size=64,className}={})=>{
  const defs=_rg('bdo-ball',[[0,'#fff7cf'],[.18,'#f4cf62'],[.5,'#c48a1c'],[.82,'#6e4608'],[1,'#2c1a02']],{cx:.34,cy:.28,r:.86})+`<clipPath id="bdo-clip"><circle cx="45" cy="46" r="38"/></clipPath>`
    +_lg('bdo-r1',[[0,'#e9c86a'],[1,'#7a5a14']],{x1:0,y1:0,x2:1,y2:1})+_lg('bdo-r2',[[0,'#2c2d30'],[1,'#0e0e10']],{x1:0,y1:0,x2:1,y2:1})+_lg('bdo-r3',[[0,'#f7e39a'],[1,'#b78a28']],{x1:1,y1:0,x2:0,y2:1})
    +_rg('bdo-gl',[[0,'#fff',.95],[1,'#fff',0]],{cx:.5,cy:.5,r:.5});
  const pent='M48,34 L62,40 L60,56 L45,60 L36,48Z';
  return _svg([90,140],size,className,"Ballon d'Or",defs,`${_shadow('',45,137,34)}
  <polygon points="6,128 14,108 30,100 40,106 58,98 74,104 84,124 80,134 50,138 20,136" fill="url(#bdo-r2)"/>
  <polygon points="14,108 30,100 26,114 18,122" fill="url(#bdo-r1)"/><polygon points="30,100 40,106 34,118 26,114" fill="url(#bdo-r3)"/><polygon points="40,106 58,98 52,112 34,118" fill="#9c7a22"/>
  <polygon points="58,98 74,104 70,116 52,112" fill="url(#bdo-r1)"/><polygon points="74,104 84,124 72,128 70,116" fill="#d7b24a"/><polygon points="18,122 26,114 34,118 28,132 12,130" fill="#4a3a14"/>
  <polygon points="34,118 52,112 56,128 42,136 28,132" fill="url(#bdo-r3)"/><polygon points="52,112 70,116 72,128 56,128" fill="#7d5d16"/><polygon points="56,128 72,128 66,134 50,138 42,136" fill="#2d2417"/>
  <g stroke="#fff3b0" stroke-width=".6" opacity=".7" fill="none"><path d="M30,100 L34,118 M58,98 L52,112 M40,106 L52,112"/></g>
  <circle cx="45" cy="46" r="38" fill="url(#bdo-ball)"/>
  <g clip-path="url(#bdo-clip)" fill="none" stroke="#fff1a8" stroke-width="1.3" stroke-linecap="round" opacity=".85"><path d="${pent}" fill="#8a5a0c" fill-opacity=".28"/><path d="M48,34 L52,18 M62,40 L78,34 M60,56 L72,70 M45,60 L40,78 M36,48 L18,46"/><path d="M52,18 C60,10 70,12 78,18 M78,34 C84,38 88,48 86,58 M72,70 C66,80 56,86 48,86 M40,78 C30,78 22,72 18,62 M18,46 C16,36 22,24 30,18"/><path d="M52,18 L40,14 M78,34 L82,22" stroke-width=".9"/></g>
  <g clip-path="url(#bdo-clip)" fill="none" stroke="#3b2503" stroke-width=".7" opacity=".45"><path d="${pent}"/><path d="M48,34 L52,18 M62,40 L78,34 M60,56 L72,70 M45,60 L40,78 M36,48 L18,46"/></g>
  <text x="60" y="38" font-family="sans-serif" font-size="4.2" font-weight="700" fill="#fff6c8" opacity=".85" transform="rotate(14 60 38)" text-anchor="middle">BALLON D'OR</text>
  <ellipse cx="32" cy="26" rx="14" ry="9" fill="url(#bdo-gl)" transform="rotate(-32 32 26)"/><ellipse cx="68" cy="68" rx="9" ry="4" fill="#ffe9a0" opacity=".35" transform="rotate(-30 68 68)"/>`);
};

/* 10. Kopa Trophy: a sculptural golden family tree, limbs twisting up to a polished football at the crown, on a dark square plinth with a gold nameplate */
const TrophyKopa=({size=64,className}={})=>{
  const defs=_lg('kopa-gold',[[0,'#7a520a'],[.25,'#e8b73f'],[.4,'#fff1b0'],[.6,'#c8932a'],[1,'#6a4506']],{x1:20,y1:0,x2:80,y2:0,u:1})+_rg('kopa-ball',[[0,'#fff7cf'],[.4,'#f0c24d'],[.8,'#a8741a'],[1,'#4b2f05']],{cx:.34,cy:.3,r:.8})
    +_lg('kopa-top',[[0,'#3b3d42'],[1,'#17181b']],{x1:0,y1:0,x2:1,y2:1})+_lg('kopa-front',[[0,'#15161a'],[.5,'#272a2f'],[1,'#0c0d0f']])+_lg('kopa-side',[[0,'#08090a'],[1,'#1b1d21']])+_lg('kopa-plate',[[0,'#8b6314'],[.5,'#f4d680'],[1,'#8b6314']]);
  const lim=(d,w)=>`<path d="${d}" fill="none" stroke="#2a1a02" stroke-width="${w+1.6}" stroke-linecap="round" opacity=".45" transform="translate(1.2,1.2)"/><path d="${d}" fill="none" stroke="url(#kopa-gold)" stroke-width="${w}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff6c8" stroke-width="${Math.max(.6,w*.2)}" stroke-linecap="round" opacity=".7" transform="translate(-${w*.2},-${w*.2})"/>`;
  return _svg([100,150],size,className,'Kopa Trophy',defs,`${_shadow('',50,147,40)}
  <polygon points="12,120 88,120 96,126 20,126" fill="url(#kopa-top)"/><polygon points="20,126 96,126 96,146 20,146" fill="url(#kopa-side)"/><polygon points="4,126 20,126 20,146 4,146" fill="url(#kopa-front)"/>
  <polygon points="4,126 20,126 12,120 0,120" fill="url(#kopa-top)" opacity="0"/><rect x="26" y="132" width="64" height="10" rx="1.2" fill="url(#kopa-plate)"/><text x="58" y="139.2" font-family="serif" font-size="4.2" font-weight="700" text-anchor="middle" fill="#3b2704" letter-spacing=".5">KOPA TROPHY</text>
  <path d="M12,120 L88,120" stroke="#6b6f76" stroke-width=".6" opacity=".7"/>
  ${lim('M50,121 C50,108 46,100 42,90 C38,80 40,70 44,60',6)}${lim('M46,100 C38,96 30,96 24,86 C20,78 22,70 28,62',4.2)}${lim('M48,102 C58,98 66,92 70,82 C74,72 70,64 64,56',4.2)}
  ${lim('M42,88 C46,76 52,70 52,58 C52,50 50,44 50,38',4.6)}${lim('M28,66 C24,56 28,48 36,42',3)}${lim('M64,60 C70,52 66,44 60,40',3)}${lim('M44,64 C36,58 34,50 36,44',2.6)}${lim('M54,62 C60,56 62,50 62,44',2.6)}
  ${lim('M24,92 C14,88 10,78 14,70',2.8)}${lim('M70,86 C80,82 86,72 82,64',2.8)}
  <circle cx="50" cy="26" r="15" fill="url(#kopa-ball)"/><g fill="none" stroke="#5a3a05" stroke-width=".7" opacity=".5"><path d="M50,20 L56,24 L54,31 L46,31 L44,24Z"/><path d="M50,20 L50,12 M56,24 L63,22 M54,31 L58,37 M46,31 L42,37 M44,24 L37,22"/></g>
  <ellipse cx="44" cy="19.4" rx="6" ry="3.6" fill="#fff" opacity=".6" transform="rotate(-32 44 19.4)"/>`);
};

const TROPHY_ASSETS={ucl:{c:TrophyUCL,h:128},wc:{c:TrophyWorldCup,h:132},euro:{c:TrophyEuro,h:128},pl:{c:TrophyPremierLeague,h:140},laliga:{c:TrophyLaLiga,h:130},seriea:{c:TrophySerieA,h:128},bl:{c:TrophyMeisterschale,h:118},hexagoal:{c:TrophyHexagoal,h:118},l1:{c:TrophyLigue1,h:128},bdo:{c:TrophyBallonDor,h:96},kopa:{c:TrophyKopa,h:106}};
