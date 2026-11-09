// Drives the UI handlers against a stub DOM and checks every screen renders without errors, 'undefined' or 'NaN'.
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'../src');
const code=fs.readdirSync(dir).filter(f=>/^\d\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n');
const app={innerHTML:''},handlers={},store={};
const document={hidden:false,getElementById:()=>app,addEventListener:(t,f)=>{handlers[t]=f}};
const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]}};
const window={scrollTo(){},addEventListener(){}};
const REAL=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/world.json'),'utf8'));
if(fs.existsSync(path.join(__dirname,'../data/rating.json')))REAL.rating=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/rating.json'),'utf8'));
if(fs.existsSync(path.join(__dirname,'../data/wages.json')))REAL.wages=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/wages.json'),'utf8'));
const api=new Function('REAL','document','localStorage','window','confirm',code+'\nreturn{save:()=>save(),setTab:t=>{TAB=t},setLg:i=>{LGV=i},getST:()=>ST}')(REAL,document,localStorage,window,()=>true);
const click=(a,v)=>handlers.click({target:{closest:()=>({dataset:{a,v}})}});
const bad=[];
const check=(where)=>{const h=app.innerHTML;if(!h.length)bad.push(where+': empty');if(/undefined|NaN|\[object/.test(h))bad.push(where+': '+(h.match(/.{30}(undefined|NaN|\[object).{30}/)||[''])[0])};
check('create');
click('create');check('youth');
for(let i=0;i<5;i++){click('yr');check('youth'+i)}
click('yr');check('academy');click('acad',0);click('sign');
for(let i=0;i<3;i++){click('yr');check('youth2')}
check('train');click('cont');
const tabs=['home','club','league','career'];
function views(w){
  for(const l of [100,101])for(const v of ['lp','ko']){click('lg',l);click('euv',v);api.setTab('league');click('tab','league');check(w+':eu'+l+v)}
  click('lg',0);click('lt','cup');click('brk');api.setTab('league');click('tab','league');check(w+':cup');click('brk');click('lg',5);click('lt','cup');check(w+':cup5');click('lg',0);click('ct','fix');click('tab','club');check(w+':fix');
  for(const k of ['bdo','gb','yp']){click('awk',k);click('lt','aw');api.setTab('league');api.setLg(0);click('tab','league');check(w+':aw'+k)}
  for(const k of ['all','box','out','head']){click('smf',k);api.setTab('home');check(w+':sm'+k)}
  click('sort','roleN');click('tab','club');check(w+':roles');click('sload','nope');
  click('dt','inbox');api.setTab('home');check(w+':inbox');click('dt','games');check(w+':games');
  for(const k of ['squad','stats','fix']){click('ct',k);api.setTab('club');check(w+':club-'+k)}
  for(const k of ['over','lu','st','me']){click('mt',k);api.setTab('home');check(w+':mt-'+k)}
  click('msel',1);check(w+':msel');click('msel',0);
  for(const k of ['table','res','lead','cup']){click('lt',k);api.setTab('league');for(const l of [0,3,7,15]){api.setLg(l);click('tab','league');check(w+':lt-'+k+l)}}
  click('rmd',3);click('rmd',999);click('sort','ovr');click('sort','n');click('pf','GK');click('pf','all');
  const S=api.getST();click('pcard',S.W.clubs[S.me.cl].sq[0]);check(w+':pcard');click('ccard',S.me.cl);check(w+':ccard');click('ccard',5);check(w+':ccard5');click('srch');check(w+':search');click('closem');
  for(const t of tabs){api.setTab(t);for(let l=0;l<(t==='league'?5:1);l++){api.setLg(l);click('tab',t);check(w+':'+t+l)}}api.setTab('home')}
let seasons=0,guard=0;
while(api.getST().phase==='play'&&guard++<4000){
  const ST=api.getST();
  if(ST.pend){
    check('modal:'+ST.pend.t);
    if(ST.pend.t==='season'){seasons++;click('rev');views('s'+seasons);click('cons');click('ctr',0);click('inf','offer');click('inf','all');click('log');click('lg',5);click('lg',0);click('compact');click('brk');click('gear');check('gear');click('closem');const o=ST.pend.opts;o.forEach((x,i)=>{if(x.k==='transfer'){click('push',i);click('ask',i)}});let ai=o.findIndex(x=>!x.rej&&x.k==='transfer'&&x.role==='starter'&&x.sell==='ok');if(ai<0)ai=o.findIndex(x=>!x.rej&&x.k!=='transfer'&&x.k!=='retire');if(ai<0)ai=o.findIndex(x=>x.k==='retire'||x.k==='keep'||x.k==='stay'||x.k==='return');click('acc',Math.max(0,ai))}
    else click(ST.pend.t==='train'?'focus':'cont',ST.pend.t==='train'?'sho':undefined),ST.pend&&ST.pend.t==='train'&&click('cont');
    continue;
  }
  click(guard%3===0?'blk':guard%3===1?'next':'ssn');check('play');
  if(guard%40===0)views('mid');
}
check('end');try{api.save()}catch(e){bad.push('save: '+e.message)}
console.log('phase',api.getST().phase,'seasons',seasons,'saveBytes',Object.keys(store).filter(k=>k.startsWith('fcs_s_')).map(k=>store[k].length+(store[k].startsWith('Z1:')?' packed':' plain')).join(','));
console.log(bad.length?'PROBLEMS:\n'+bad.slice(0,10).join('\n'):'UI smoke OK');
