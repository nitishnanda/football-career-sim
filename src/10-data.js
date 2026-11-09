const VER=16;
const NTOP=5,CO=['England','Spain','Germany','Italy','France'];
const CUPN={England:'FA Cup',Spain:'Copa del Rey',Germany:'DFB-Pokal',Italy:'Coppa Italia',France:'Coupe de France'};
// REAL (data/world.json, built from Wikipedia) is injected by the build: divisions, clubs, managers, grounds, players
const DVS=REAL.divisions.slice().sort((a,b)=>a.tier-b.tier||CO.indexOf(a.country)-CO.indexOf(b.country)||a.short.localeCompare(b.short));
const DIVI={};DVS.forEach((d,i)=>DIVI[d.short]=i);
const LGN=DVS.map(d=>({n:d.name,s:d.short,nat:d.country,country:d.country,tier:d.tier,cup:CUPN[d.country],md:0}));
REAL.clubs.forEach(c=>{LGN[DIVI[c.div]].md++});LGN.forEach(l=>l.md=2*(l.md-1));
// real scoring baselines per division (home / away goals per game), fitted from results
DVS.forEach((d,i)=>{if(d.mu!=null){LGN[i].gh=Math.exp(d.mu+d.hfa);LGN[i].ga=Math.exp(d.mu)}});
const POOLS={
eng:[['Jack','Harry','Tom','Jude','Phil','Mason','Kyle','Ben','Ollie','Reece','Declan','Luke'],['Walker','Foster','Hughes','Clarke','Palmer','Rice','Bennett','Carter','Mills','Grant','Watkins','Dawson']],
esp:[['Pablo','Álvaro','Iker','Dani','Sergio','Marc','Unai','Rafa','Diego','Hugo','Lucas','Mateo'],['García','Ruiz','Navarro','Torres','Molina','Ortega','Vidal','Castro','Rey','Soler','Ramos','Gil']],
por:[['Rui','João','Tiago','Bruno','Gabriel','Matheus','Vitor','Thiago','Rafael','Lucas','Diogo','Caio'],['Silva','Santos','Costa','Pereira','Almeida','Rocha','Lima','Duarte','Ferreira','Moura','Cardoso','Teixeira']],
fra:[['Léo','Hugo','Théo','Maxime','Kylian','Adrien','Yanis','Mathis','Nolan','Rayan','Enzo','Lucas'],['Dubois','Moreau','Laurent','Girard','Fontaine','Lambert','Mercier','Rousseau','Blanc','Garnier','Perrin','Colin']],
ger:[['Jonas','Lukas','Felix','Leon','Niklas','Jan','Finn','Tim','Moritz','Paul','Noah','Max'],['Müller','Schneider','Fischer','Weber','Becker','Hoffmann','Koch','Richter','Wolf','Keller','Brandt','Vogel']],
ita:[['Marco','Luca','Matteo','Federico','Nicolò','Andrea','Davide','Gianluca','Lorenzo','Simone','Alessio','Riccardo'],['Rossi','Bianchi','Romano','Conti','Greco','Bruno','Ferrari','Marino','Esposito','Gallo','Costa','Fabbri']],
afr:[['Moussa','Ibrahim','Samuel','Kofi','Amadou','Victor','Youssef','Ismaila','Chidi','Sadio','Hakim','Bilal'],['Diallo','Traoré','Mensah','Okafor','Sow','Ndiaye','Camara','Kamara','Boateng','Hassan','Toure','Bakary']],
asa:[['Takumi','Kenji','Hiro','Min-jun','Daichi','Sota','Jun','Ryo','Kaito','Haruto','Seung','Yuto'],['Tanaka','Sato','Kim','Park','Suzuki','Ito','Watanabe','Nakamura','Lee','Kobayashi','Choi','Yamada']]};
const NATS=[['England','eng'],['Scotland','eng'],['Spain','esp'],['France','fra'],['Germany','ger'],['Italy','ita'],['Portugal','por'],['Brazil','por'],['Argentina','esp'],['Netherlands','ger'],['Belgium','ger'],['Croatia','ger'],['Uruguay','esp'],['Colombia','esp'],['Morocco','afr'],['Senegal','afr'],['Nigeria','afr'],['Ghana','afr'],['USA','eng'],['Mexico','esp'],['Japan','asa'],['South Korea','asa'],['Denmark','ger'],['Switzerland','ger'],['Norway','ger'],['Turkey','ger']];
const POSN={GK:'Goalkeeper',CB:'Centre-back',FB:'Full-back',DM:'Defensive midfielder',CM:'Central midfielder',AM:'Attacking midfielder',W:'Winger',ST:'Striker'};
const OUTK=['pac','sho','pas','dri','def','phy'],GKK=['div','han','kic','ref','pos','phy'];
const KL={pac:'Pace',sho:'Shooting',pas:'Passing',dri:'Dribbling',def:'Defending',phy:'Physical',div:'Diving',han:'Handling',kic:'Kicking',ref:'Reflexes',pos:'Positioning'};
// realistic ceilings per attribute (no gold-card 99s) -- pace is the only one that gets near 99,
// everything else tops out the way it does on a real top-end base card
const ACAP={pac:97,sho:94,pas:93,dri:96,def:92,phy:94,div:94,han:93,kic:92,ref:95,pos:93};
// attribute offsets from the player's overall, per position
const PROF={
ST:{pac:0,sho:6,pas:-10,dri:-4,def:-35,phy:0},W:{pac:6,sho:-4,pas:-6,dri:6,def:-35,phy:-8},AM:{pac:-2,sho:-2,pas:6,dri:5,def:-30,phy:-10},
CM:{pac:-6,sho:-8,pas:6,dri:-2,def:-8,phy:0},DM:{pac:-8,sho:-18,pas:2,dri:-8,def:8,phy:6},FB:{pac:4,sho:-22,pas:-6,dri:-6,def:6,phy:-2},
CB:{pac:-6,sho:-35,pas:-14,dri:-25,def:12,phy:8},GK:{div:0,han:0,kic:0,ref:0,pos:0,phy:0}};
// how each attribute weighs into overall, in OUTK / GKK order
const OVW={ST:[.18,.34,.10,.17,.02,.19],W:[.26,.17,.16,.30,.03,.08],AM:[.10,.20,.32,.28,.03,.07],CM:[.09,.10,.30,.17,.17,.17],DM:[.07,.05,.25,.10,.33,.20],FB:[.24,.04,.16,.14,.26,.16],CB:[.12,.01,.08,.04,.46,.29],GK:[.24,.2,.1,.24,.16,.06]};
// starting potential: mean and spread of peak overall
const TIERS=[{n:'Grassroots talent',m:74,s:3},{n:'Promising',m:80,s:3},{n:'Wonderkid',m:87,s:2.5},{n:'Generational',m:91,s:2}];
// real breakthrough-age data (debut / regular-rotation / established-starter ages, mean+sd, and % of the cohort
// that ever nails down a starting role) by position and talent tier, from a multi-league sample of pro debuts
const BRKAGE={
GK:{'Grassroots talent':[19.9,2.22,22.0,2.98,23.2,3.17,36],Promising:[19.3,1.78,21.0,2.28,22.4,2.84,72],Wonderkid:[18.8,1.69,20.2,1.9,21.2,2.37,91],Generational:[18.1,1.45,19.1,1.78,20.1,2.05,100]},
CB:{'Grassroots talent':[19.4,1.93,20.9,2.32,22.6,2.78,51],Promising:[18.5,1.58,19.8,1.64,21.7,2.45,80],Wonderkid:[18.0,1.29,19.0,1.3,20.4,1.9,95],Generational:[17.8,1.17,18.5,1.3,20.1,1.8,100]},
FB:{'Grassroots talent':[19.2,1.87,20.6,2.18,22.2,2.59,46],Promising:[18.5,1.58,19.6,1.63,21.4,2.37,75],Wonderkid:[18.0,1.34,19.0,1.39,20.5,2.31,92],Generational:[17.7,1.24,18.5,1.33,19.5,1.47,95]},
DM:{'Grassroots talent':[19.1,1.84,20.7,2.24,22.6,2.76,48],Promising:[18.3,1.54,19.6,1.64,21.5,2.39,75],Wonderkid:[17.9,1.34,18.9,1.32,20.4,2.1,93],Generational:[17.9,1.25,18.9,1.28,20.4,1.55,93]},
CM:{'Grassroots talent':[19.0,1.93,20.5,2.22,22.5,2.76,45],Promising:[18.1,1.6,19.3,1.59,21.5,2.35,75],Wonderkid:[17.5,1.22,18.6,1.27,20.3,2.04,86],Generational:[17.3,1.38,18.3,1.28,19.6,2.43,95]},
AM:{'Grassroots talent':[19.0,1.92,20.7,2.34,22.8,2.9,39],Promising:[18.0,1.52,19.2,1.67,21.8,2.54,73],Wonderkid:[17.6,1.29,18.4,1.12,19.8,1.56,96],Generational:[17.3,1.52,18.2,1.52,19.5,2.36,92]},
W:{'Grassroots talent':[19.0,1.88,20.5,2.16,22.8,2.78,38],Promising:[18.2,1.6,19.3,1.61,21.7,2.44,67],Wonderkid:[17.6,1.3,18.6,1.42,20.6,1.89,94],Generational:[17.2,1.11,17.9,1.33,19.8,1.65,95]},
ST:{'Grassroots talent':[19.1,2.06,20.7,2.32,23.4,2.89,38],Promising:[18.1,1.64,19.3,1.7,22.3,2.51,70],Wonderkid:[17.6,1.58,18.8,1.64,21.0,2.1,94],Generational:[17.2,1.06,18.3,1.28,20.2,1.62,100]}};
// share of peak ability reached at each age, 7..40
const F=[.30,.34,.38,.42,.46,.50,.55,.60,.66,.72,.78,.83,.88,.92,.95,.97,.985,1,1,1,1,1,1,.99,.97,.95,.92,.89,.85,.81,.77,.72,.68,.64,.59,.54,.49];
