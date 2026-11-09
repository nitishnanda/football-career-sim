// Writes squads.md: every club's squad exactly as the game loads it, plus data sanity checks.
const fs=require('fs'),path=require('path');
const REAL=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/world.json'),'utf8'));
const code=fs.readdirSync(path.join(__dirname,'../src')).filter(f=>/^[0-4]\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync(path.join(__dirname,'../src',f),'utf8')).join('\n');
const E=new Function('REAL',code+'\nreturn{newCareer,getST:()=>ST,LGN,byPos}')(REAL);
E.newCareer({seed:'report',name:'T',pos:'ST',arch:'Poacher',tier:1});const ST=E.getST();
const ORDER=['GK','CB','FB','DM','CM','AM','W','ST'],out=['# Squads: 2026–27, end of summer window\n'];
const issues={noGK:[],oneGK:[],tiny:[],young:[],dupes:[]};const seen={};
E.LGN.forEach((l,li)=>{
  out.push(`\n## ${l.country} · ${l.n}\n`);
  ST.W.clubs.filter(c=>c.lg===li).sort((a,b)=>b.base-a.base).forEach(c=>{
    const ps=c.sq.map(id=>ST.W.pl[id]);
    out.push(`\n### ${c.name}  (strength ${c.base.toFixed(1)}, ${ps.length} players)\nManager: ${c.mgr||'n/a'} · Ground: ${c.gd||'n/a'}\n`);
    for(const pos of ORDER){const a=ps.filter(p=>p.pos===pos).sort((x,y)=>y.ovr-x.ovr);if(a.length)out.push(`- **${pos}**: `+a.map(p=>`${p.n} (${p.age}, ${p.ovr})`).join(', '));}
    const g=ps.filter(p=>p.pos==='GK').length;if(g===0)issues.noGK.push(c.name);else if(g===1)issues.oneGK.push(c.name);
    if(ps.length<22)issues.tiny.push(c.name+' '+ps.length);
    for(const p of ps){if(p.age<16)issues.young.push(p.n+' '+p.age);const k=p.n+'|'+p.age;(seen[k]=seen[k]||[]).push(c.name)}
  });
});
for(const k in seen)if(seen[k].length>1)issues.dupes.push(k+': '+seen[k].join(' / '));
fs.writeFileSync(path.join(__dirname,'../squads.md'),out.join('\n'));
const all=ST.W.pl.filter(p=>p.cl>=0);
console.log('clubs',ST.W.clubs.length,'players',all.length,'| age min/avg/max',Math.min(...all.map(p=>p.age)),(all.reduce((s,p)=>s+p.age,0)/all.length).toFixed(1),Math.max(...all.map(p=>p.age)));
console.log('by division (players/avg per club):',E.LGN.map((l,i)=>{const cs=ST.W.clubs.filter(c=>c.lg===i);return l.s+' '+cs.reduce((s,c)=>s+c.sq.length,0)+'/'+(cs.reduce((s,c)=>s+c.sq.length,0)/cs.length).toFixed(0)}).join('  '));
console.log('no GK:',issues.noGK.length,'one GK:',issues.oneGK.length,issues.oneGK.slice(0,8).join(', '),'| <22 players:',issues.tiny.length,'| under 16:',issues.young.length,'| same name+age at 2 clubs:',issues.dupes.length,issues.dupes.slice(0,6));
const show=n=>{const c=ST.W.clubs.find(x=>x.name===n);if(!c)return;const ps=c.sq.map(id=>ST.W.pl[id]);console.log('\n'+c.name,'|',c.mgr,'|',c.gd,'| strength',c.base.toFixed(1),'|',ps.length,'players');for(const pos of ORDER){const a=ps.filter(p=>p.pos===pos).sort((x,y)=>y.ovr-x.ovr);console.log(' ',pos.padEnd(2),a.slice(0,6).map(p=>`${p.n} ${p.age}/${p.ovr}`).join(', ')+(a.length>6?' +'+(a.length-6):''))}};
['Arsenal','Wrexham','Extremadura 1924'].forEach(show);
