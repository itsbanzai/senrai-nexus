(function(){
'use strict';
const root=document.getElementById('senraiPixelFacility');
if(!root||root.dataset.worldV3)return;root.dataset.worldV3='1';
const host=root.querySelector('.pf-map');if(!host)return;
const c=document.createElement('canvas');c.id='senraiWorldCanvas';c.width=1200;c.height=800;c.setAttribute('aria-label','Animated top-down pixel-art SENRAI Nexus facility with plasma core, eight rooms, gardens, water and crew');host.appendChild(c);
const g=c.getContext('2d',{alpha:false});g.imageSmoothingEnabled=false;
const C={void:'#080a16',deep:'#10152a',water:'#102d4d',water2:'#17608a',cyan:'#5fe8ff',ice:'#b4f7ff',purple:'#9a5bff',violet:'#d0a2ff',hot:'#f4dcff',green:'#5bbf83',leaf:'#347c5a',leaf2:'#91db83',pink:'#ef75d0',gold:'#ffc879',wall:'#242840',wall2:'#42445f',floor:'#343951',floor2:'#292e44',ink:'#111426',steel:'#71728c'};
let frame=0,raf=0,selected=0,last=0;
const rooms=[
 {name:'SENRAI CORE',short:'CORE',x:478,y:288,w:244,h:222,color:C.purple,desc:'Central plasma reactor and mission routing.',agent:'SENRAI / COORDINATOR',fn:'Power and orchestration',view:'agents'},
 {name:'RESEARCH LAB',short:'LAB',x:352,y:78,w:205,h:142,color:C.cyan,desc:'Specimen analysis, research benches and synthesis tanks.',agent:'MIRA / RESEARCH',fn:'Discovery and synthesis',view:'agents'},
 {name:'OBSERVATION DECK',short:'OBSERVATION',x:775,y:90,w:250,h:150,color:C.cyan,desc:'A glass canopy above the ocean and distant stars.',agent:'RIN / SCOUT',fn:'Exploration and sensing',view:'agents'},
 {name:'CREATIVE STUDIO',short:'STUDIO',x:120,y:220,w:220,h:150,color:C.pink,desc:'A sound-treated creative bay for media and ideas.',agent:'ASTRA / CREATIVE',fn:'Creation and expression',view:'agents'},
 {name:'FITNESS BAY',short:'FITNESS',x:125,y:440,w:205,h:145,color:C.green,desc:'Training equipment, recovery space and performance logs.',agent:'KAI / FITNESS',fn:'Strength and recovery',view:'agents'},
 {name:'COMMAND CENTER',short:'COMMAND',x:815,y:345,w:245,h:165,color:C.cyan,desc:'Live facility telemetry and mission coordination.',agent:'SENRAI / COMMAND',fn:'Planning and execution',view:'agents'},
 {name:'LIVING QUARTERS',short:'LIVING',x:260,y:615,w:230,h:120,color:C.gold,desc:'A quiet living space wrapped in lush bioluminescent gardens.',agent:'MIRA / RESIDENT',fn:'Rest and reset',view:'agents'},
 {name:'FABRICATION',short:'FABRICATION',x:710,y:605,w:265,h:130,color:C.gold,desc:'Robotic assembly benches, tool walls and prototype printers.',agent:'FORGE / BUILDER',fn:'Build and repair',view:'agents'},
 {name:'DOCK',short:'DOCK',x:500,y:674,w:205,h:86,color:C.cyan,desc:'A landing platform with autonomous shuttles and water access.',agent:'RIN / PILOT',fn:'Arrival and departure',view:'agents'}
];
function rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function line(x1,y1,x2,y2,col,width=1){g.strokeStyle=col;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}
function poly(points,col){g.fillStyle=col;g.beginPath();g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.closePath();g.fill()}
function glow(x,y,r,color,a){g.save();g.globalAlpha=a;g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.restore()}
function seed(n){let x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function plant(x,y,s=1,pink=false){const cc=pink?C.pink:C.leaf2;rect(x-3*s,y,6*s,9*s,'#4d6347');rect(x-9*s,y-6*s,7*s,6*s,C.leaf);rect(x+2*s,y-9*s,8*s,8*s,cc);rect(x-2*s,y-13*s,6*s,7*s,pink?'#ffb2e9':C.leaf2);rect(x-12*s,y-2*s,6*s,5*s,'#286449');rect(x+6*s,y-1*s,7*s,5*s,C.green);rect(x-3*s,y+6*s,6*s,4*s,'#8a6d52');if(pink){rect(x-1*s,y-11*s,2*s,2*s,'#fff0ff');glow(x,y-5*s,9*s,C.pink,.08)}}
function tree(x,y,s=1,pink=false){rect(x-3*s,y-2*s,7*s,22*s,'#6d564b');rect(x-7*s,y+8*s,5*s,7*s,'#6d564b');rect(x+2*s,y+5*s,5*s,7*s,'#6d564b');const a=pink?C.pink:'#267552',b=pink?'#a64cba':'#46a66d';rect(x-16*s,y-15*s,14*s,15*s,a);rect(x-8*s,y-25*s,16*s,16*s,b);rect(x+2*s,y-16*s,14*s,15*s,a);rect(x-4*s,y-31*s,9*s,10*s,pink?'#ffb0e9':'#8ce18d');rect(x-12*s,y-12*s,5*s,4*s,pink?'#ffdcf5':'#a7f8a0');glow(x,y-8*s,22*s,pink?C.pink:C.green,.08)}
function water(x,y,w,h){rect(x,y,w,h,'#0d3150');rect(x+3,y+2,w-6,h-4,'#145780');for(let i=0;i<18;i++){let xx=x+5+((i*29+frame*(.2+i%3*.07))%(w-12)),yy=y+5+((i*17+frame*.18)%(h-10));rect(xx,yy,5+(i%4)*3,2,i%3?C.cyan:C.ice);if(i%4===0)rect(xx+2,yy-2,2,6,'#3989b2')}rect(x,y,3,h,'#53c8ef');rect(x+w-3,y,3,h,'#53c8ef')}
function tile(x,y,w,h){rect(x,y,w,h,'#161b2c');rect(x+4,y+4,w-8,h-8,C.floor);for(let xx=x+8;xx<x+w-8;xx+=20){line(xx,y+5,xx,y+h-5,'#252c41');for(let yy=y+8;yy<y+h-8;yy+=20){rect(xx+3,yy,2,2,'#50536b')}}}
function path(points,width=20){g.lineCap='square';g.lineJoin='miter';g.strokeStyle='#10182b';g.lineWidth=width+8;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.strokeStyle='#65617c';g.lineWidth=width;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.strokeStyle='#a49aba';g.lineWidth=2;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();for(let i=0;i<points.length-1;i++){let a=points[i],b=points[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=10;t<len;t+=25){let u=t/len;rect(a[0]+(b[0]-a[0])*u-1,a[1]+(b[1]-a[1])*u-1,2,2,'#d1c9e4')}}}
function consoleDesk(x,y,w,accent){rect(x,y,w,10,'#101626');rect(x+2,y+2,w-4,5,'#a38c79');rect(x+4,y+10,4,12,'#64627a');rect(x+w-8,y+10,4,12,'#64627a');rect(x+w*.35,y-18,w*.32,17,'#090f20');rect(x+w*.35+3,y-15,w*.32-6,11,'#21455b');for(let i=0;i<3;i++)rect(x+w*.35+6,y-13+i*3,w*.18,1,accent);rect(x+w*.72,y-14,7,5,accent)}
function tank(x,y,accent){rect(x-8,y-3,25,54,'#171b31');rect(x-5,y,19,48,'#47516b');rect(x-2,y+5,13,38,accent);rect(x+1,y+9,5,28,'#d7f7ff');rect(x-8,y+4,25,3,'#aab1c9');rect(x-8,y+40,25,3,'#aab1c9');glow(x+4,y+20,24,accent,.13)}
function machine(x,y,w,h,accent){rect(x,y,w,h,'#101525');rect(x+4,y+4,w-8,h-8,'#31364e');for(let i=0;i<5;i++)rect(x+7,y+8+i*8,w-14,2,'#161d31');rect(x+7,y+h-14,5,4,accent);rect(x+16,y+h-14,5,4,C.cyan);rect(x+w-16,y+h-14,5,4,C.green);rect(x+2,y+2,w-4,2,'#6d718d')}
function room(r,i){let x=r.x,y=r.y,w=r.w,h=r.h,a=r.color;
 // broad shadow, foundation slab, corner armor and illuminated wall band
 poly([[x-13,y+13],[x+w-2,y-10],[x+w+13,y+5],[x+w+8,y+h+5],[x+8,y+h+15],[x-13,y+h-1]],'#080b18');
 poly([[x-7,y+8],[x+w-1,y-5],[x+w+7,y+5],[x+w+4,y+h],[x+4,y+h+7],[x-7,y+h-2]],'#55516c');
 rect(x,y,w,h,'#191e31');rect(x+5,y+5,w-10,h-10,'#30364b');
 for(let xx=x+8;xx<x+w-8;xx+=24)for(let yy=y+8;yy<y+h-8;yy+=24){rect(xx,yy,22,22,((xx+yy)/24)%2?'#353a50':'#2e3449');rect(xx+2,yy+2,18,1,'#444a61');rect(xx+2,yy+19,18,1,'#252b3f');rect(xx+2,yy+2,1,18,'#41465e')}
 rect(x+6,y+6,w-12,5,'#111526');rect(x+10,y+11,w-20,13,'#1c1930');rect(x+12,y+13,w-24,9,a);rect(x+15,y+15,w-30,5,'#19182a');rect(x+7,y+26,w-14,3,'#151a2a');for(let k=0;k<Math.floor((w-24)/26);k++){rect(x+13+k*26,y+28,17,3,'#111629');rect(x+15+k*26,y+29,3,1,k%2?C.cyan:a)}
 // bevelled pillars, rivets, light bars
 for(const p of [[x+5,y+32],[x+w-11,y+32],[x+5,y+h-20],[x+w-11,y+h-20]]){rect(p[0],p[1],6,14,'#171b2b');rect(p[0]+1,p[1]+2,4,3,a);rect(p[0]+1,p[1]+8,4,3,C.steel)}
 rect(x+12,y+35,w-24,3,'#1b2032');rect(x+14,y+36,w-28,1,'#66617f');rect(x+12,y+h-17,w-24,4,'#151a2b');rect(x+14,y+h-16,w-28,1,a);
 // Interior furnishings specific to each room
 if(i===0){ // containment chamber
  rect(x+22,y+42,w-44,h-62,'#22263d');rect(x+28,y+48,w-56,h-74,'#171d31');
  for(let k=0;k<4;k++){let px=x+35+k*(w-82)/3;machine(px,y+54,17,46,a)}
  consoleDesk(x+22,y+h-43,54,a);consoleDesk(x+w-76,y+h-43,54,C.cyan);
  for(let k=0;k<3;k++){rect(x+25+k*15,y+h-25,10,5,'#11192a');rect(x+27+k*15,y+h-23,6,2,k%2?C.cyan:a)}
 } else if(i===1){tank(x+37,y+47,C.cyan);tank(x+w-50,y+47,C.pink);consoleDesk(x+w/2-35,y+85,70,C.cyan);for(let k=0;k<4;k++)rect(x+70+k*22,y+h-25,12,8,k%2?'#54526d':'#1b2237');}
 else if(i===2){rect(x+12,y+40,w-24,35,'#0b2038');rect(x+16,y+44,w-32,27,'#1b4b71');for(let k=0;k<7;k++){rect(x+23+k*27,y+48+(k%3)*4,13,2,C.cyan);rect(x+25+k*27,y+57,4,3,C.ice)}rect(x+20,y+82,w-40,4,'#6e6a87');for(let k=0;k<3;k++){rect(x+25+k*72,y+95,58,23,'#11182b');rect(x+29+k*72,y+99,50,15,'#255c80');rect(x+34+k*72,y+103,35,2,C.cyan)}}
 else if(i===3){for(let k=0;k<4;k++){rect(x+16+k*21,y+44,15,38,'#171c2d');rect(x+19+k*21,y+48,9,29,[C.cyan,C.pink,C.purple,C.gold][k]);rect(x+19+k*21,y+51,9,2,'#fff0ff')}consoleDesk(x+w-94,y+80,73,C.pink);rect(x+w-82,y+64,48,9,'#101326');rect(x+w-78,y+67,40,3,C.pink);plant(x+w-22,y+h-26,.7,true)}
 else if(i===4){rect(x+20,y+45,50,43,'#101626');rect(x+24,y+49,42,35,'#26344a');for(let k=0;k<3;k++){rect(x+30+k*11,y+56,6,20,'#71819b');rect(x+31+k*11,y+58,4,3,C.cyan)}rect(x+w-75,y+47,53,39,'#111629');for(let k=0;k<3;k++)rect(x+w-68+k*13,y+55,7,23,k%2?C.cyan:C.green);consoleDesk(x+w/2-30,y+94,60,C.green)}
 else if(i===5){for(let k=0;k<3;k++){rect(x+17+k*72,y+43,61,34,'#0d1528');rect(x+21+k*72,y+47,53,26,'#24516d');for(let j=0;j<4;j++)rect(x+25+k*72,y+51+j*5,24+(j%2)*12,2,[C.cyan,C.purple,C.green][k])}consoleDesk(x+w/2-42,y+96,84,C.cyan)}
 else if(i===6){rect(x+20,y+42,63,37,'#1b2034');rect(x+24,y+46,55,29,'#51516c');rect(x+28,y+50,47,21,'#c9b4c4');rect(x+30,y+51,42,9,'#a4bdd0');rect(x+20,y+82,63,5,'#b8a1a4');rect(x+w-62,y+44,35,38,'#1b2030');rect(x+w-58,y+48,27,30,'#323c4a');rect(x+w-53,y+54,17,3,C.gold);plant(x+w-25,y+h-23,.7,true)}
 else if(i===7){machine(x+18,y+43,39,54,C.gold);machine(x+w-57,y+43,39,54,C.cyan);rect(x+w/2-46,y+83,92,26,'#171c2d');rect(x+w/2-41,y+87,82,18,'#5a536c');for(let k=0;k<5;k++)rect(x+w/2-34+k*15,y+91,9,10,k%2?C.gold:C.cyan);rect(x+w/2-23,y+60,46,21,'#11182a');rect(x+w/2-18,y+64,36,13,'#6d5688');}
 else {rect(x+16,y+36,w-32,h-48,'#10172b');rect(x+20,y+40,w-40,h-56,'#2c3651');for(let k=0;k<6;k++){rect(x+24+k*24,y+44,12,18,k%2?C.cyan:C.purple);rect(x+26+k*24,y+47,8,2,C.ice)}}
 // door lip, safety stripes and selected-room frame
 rect(x+w/2-26,y+h-5,52,8,'#111426');rect(x+w/2-22,y+h-2,44,3,a);for(let k=0;k<5;k++)rect(x+w/2-18+k*9,y+h+1,4,2,'#e5d9ff');
 if(i===selected){rect(x-3,y-3,w+6,2,C.violet);rect(x-3,y+h+1,w+6,2,C.violet);rect(x-3,y-3,2,h+6,C.violet);rect(x+w+1,y-3,2,h+6,C.violet);glow(x+w/2,y+h/2,75,a,.045)}
}
function bridge(x1,y1,x2,y2){line(x1,y1,x2,y2,'#0b1120',18);line(x1,y1,x2,y2,'#6b6682',12);line(x1,y1,x2,y2,'#b3a5ce',2);let n=Math.ceil(Math.hypot(x2-x1,y2-y1)/18);for(let i=0;i<=n;i++){let t=i/n;rect(x1+(x2-x1)*t-2,y1+(y2-y1)*t-2,4,4,i%2?C.cyan:C.gold)}}
function core(){const x=600,y=398;glow(x,y,220,C.purple,.12);glow(x,y,165,C.purple,.20);glow(x,y,112,C.violet,.27);glow(x,y,72,C.hot,.14);
 // concentric containment plinths with segmented mechanical armor
 g.save();g.translate(x,y);g.rotate(frame*.002);g.strokeStyle='#393652';g.lineWidth=18;g.beginPath();g.ellipse(0,0,126,82,0,0,Math.PI*2);g.stroke();g.strokeStyle='#8b66c4';g.lineWidth=4;g.setLineDash([18,9,5,8]);g.beginPath();g.ellipse(0,0,126,82,0,0,Math.PI*2);g.stroke();g.setLineDash([]);g.strokeStyle='#d0a2ff';g.lineWidth=2;g.beginPath();g.ellipse(0,0,102,66,0,-.5,Math.PI*1.2);g.stroke();g.restore();
 g.save();g.translate(x,y);g.rotate(-frame*.004);g.strokeStyle='#585576';g.lineWidth=12;g.beginPath();g.ellipse(0,0,85,121,-.3,0,Math.PI*2);g.stroke();g.strokeStyle=C.cyan;g.lineWidth=2;g.beginPath();g.ellipse(0,0,85,121,-.3,.3,1.8);g.stroke();g.restore();
 for(let i=0;i<12;i++){let a=i*Math.PI/6+frame*.002,xx=x+Math.cos(a)*125,yy=y+Math.sin(a)*82;rect(xx-8,yy-7,16,14,'#25243e');rect(xx-5,yy-4,10,8,i%3?C.purple:C.cyan);rect(xx-2,yy-2,4,4,C.hot)}
 // plasma core: pixel-noise facets, lightning branches and bright heart
 g.save();g.beginPath();g.arc(x,y,72,0,Math.PI*2);g.clip();g.fillStyle='#32175c';g.fillRect(x-76,y-76,152,152);for(let i=0;i<120;i++){let a=seed(i+frame*.03)*Math.PI*2,r=Math.sqrt(seed(i*3+frame*.018))*69,xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r;rect(xx,yy,2+(i%4),2+(i%3),['#5e2bc2','#8b4aff','#bd8cff','#e5c8ff','#3e8cf7'][i%5])}
 for(let i=0;i<7;i++){let a=i*2.4+frame*.012,xx=x+Math.cos(a)*56,yy=y+Math.sin(a)*56;g.strokeStyle=i%2?C.hot:C.cyan;g.lineWidth=i%3===0?3:2;g.beginPath();g.moveTo(x,y);let px=x,py=y;for(let j=0;j<5;j++){px+=(xx-px)*(.25+seed(i*11+j)*.25);py+=(yy-py)*(.25+seed(i*19+j)*.25);g.lineTo(Math.round(px/3)*3,Math.round(py/3)*3)}g.lineTo(xx,yy);g.stroke()}
 const pulse=.8+.2*Math.sin(frame*.09);glow(x,y,43,C.violet,.72*pulse);glow(x,y,25,C.hot,.92);glow(x,y,11,'#ffffff',.75);rect(x-8,y-8,16,16,'#fff8ff');rect(x-3,y-11,6,22,'#e5d5ff');rect(x-11,y-3,22,6,'#e5d5ff');g.restore();
 // containment pylons and conduit energy
 for(let i=0;i<4;i++){let a=i*Math.PI/2+Math.PI/4,xx=x+Math.cos(a)*104,yy=y+Math.sin(a)*72;rect(xx-10,yy-17,20,34,'#11172b');rect(xx-7,yy-13,14,26,'#44405f');rect(xx-4,yy-9,8,18,C.purple);rect(xx-2,yy-5,4,10,C.hot);glow(xx,yy,22,C.purple,.2)}
 for(let i=0;i<58;i++){let a=seed(i+5)*Math.PI*2,r=76+seed(i+30)*82+Math.sin(frame*.04+i)*6,xx=x+Math.cos(a+frame*.001)*r,yy=y+Math.sin(a+frame*.001)*r;rect(xx,yy,2+(i%3),2,i%3?C.violet:C.cyan);if(i%5===0){rect(xx-3,yy+3,2,2,C.hot);line(xx,yy,xx+Math.cos(a)*8,yy+Math.sin(a)*8,'#9362ff',1)}}
}
const crew=[{name:'MIRA',color:C.pink,path:[[395,175],[425,196],[505,265],[465,310],[408,260]],speed:.14,off:0},{name:'RIN',color:C.cyan,path:[[850,200],[890,260],[790,300],[770,260]],speed:.12,off:75},{name:'ASTRA',color:C.gold,path:[[230,300],[280,330],[310,400],[245,420]],speed:.13,off:155},{name:'KAI',color:C.green,path:[[220,510],[275,530],[310,580],[265,600]],speed:.16,off:220},{name:'FORGE',color:C.gold,path:[[825,665],[875,660],[920,690],[855,715]],speed:.11,off:320},{name:'NEX',color:C.violet,path:[[570,690],[600,650],[660,675],[650,725]],speed:.15,off:410}];
function person(p){let q=(frame*p.speed+p.off)%1000/1000,idx=Math.floor(q*(p.path.length-1)),u=q*(p.path.length-1)-idx,A=p.path[idx],B=p.path[Math.min(idx+1,p.path.length-1)],x=A[0]+(B[0]-A[0])*u,y=A[1]+(B[1]-A[1])*u,b=Math.sin(frame*.12+p.off)*2;rect(x-7,y+10,15,4,'#070b17');rect(x-5,y+1+b,4,9,'#25243e');rect(x+1,y+1+b,4,9,'#25243e');rect(x-8,y-10+b,16,12,p.color);rect(x-5,y-17+b,11,9,'#d7b49e');rect(x-7,y-19+b,14,5,'#29223f');rect(x-5,y-12+b,3,2,'#111426');rect(x+2,y-12+b,3,2,'#111426');rect(x-10,y-8+b,3,8,p.color);rect(x+7,y-8+b,3,8,p.color);rect(x-4,y-1+b,8,5,'#f2e6ff');if(Math.floor((frame+p.off)/95)%3===0){rect(x-13,y-33,27,10,'#111426');rect(x-13,y-33,27,1,p.color);g.fillStyle='#f3edff';g.font='bold 8px monospace';g.fillText(p.name,Math.round(x-11),Math.round(y-26))}}
function backdrop(){rect(0,0,1200,800,C.void);
 // starfield, distant moon and floating land silhouettes
 for(let i=0;i<150;i++){let x=seed(i)*1200,y=seed(i+900)*800;rect(x,y,i%11===0?3:1,i%11===0?3:1,i%3===0?'#a18fd3':'#41415f')}
 glow(1070,100,110,'#4a2e7d',.13);rect(1050,64,3,3,C.hot);rect(1112,122,2,2,C.cyan);
 // ocean terraces around the facility
 poly([[90,115],[210,52],[430,45],[520,95],[680,80],[840,48],[1040,92],[1135,210],[1162,390],[1120,585],[1010,742],[790,775],[620,750],[430,775],[220,735],[86,615],[55,400]],'#0b1329');
 poly([[108,122],[225,66],[422,60],[514,109],[683,95],[838,65],[1026,108],[1117,222],[1144,390],[1103,576],[997,724],[789,753],[621,731],[435,752],[238,716],[104,600],[73,401]],'#10203b');
 for(let i=0;i<34;i++){let x=95+seed(i+33)*1010,y=100+seed(i+88)*610;rect(x,y,6+(i%4)*5,2,i%3? '#1a4261':'#28607d');if(i%4===0)rect(x+3,y-3,2,7,C.cyan)}
 // waterfalls spilling off the floating terraces
 for(const f of [[115,520,23,175],[1064,510,25,175],[230,700,32,70],[927,715,36,52],[560,720,30,58]]){water(f[0],f[1],f[2],f[3]);for(let k=0;k<4;k++)rect(f[0]+3+k*5,f[1]+((frame*1.6+k*17)%f[3]),2,14,C.ice)}
 // island landmass in several hard-edged pixel tiers
 poly([[95,165],[180,100],[365,80],[490,112],[605,83],[750,94],[900,74],[1050,130],[1110,250],[1130,425],[1065,585],[970,680],[840,730],[690,748],[570,724],[435,744],[280,700],[160,635],[100,500],[72,330]],'#111b2b');
 poly([[116,174],[193,115],[367,97],[486,128],[607,102],[747,111],[891,93],[1034,147],[1090,260],[1110,424],[1047,574],[955,660],[832,708],[692,724],[570,704],[438,720],[294,679],[179,617],[119,495],[91,331]],'#29304a');
 poly([[134,185],[208,131],[370,115],[481,145],[609,120],[741,130],[881,112],[1016,163],[1070,273],[1090,421],[1028,562],[940,642],[822,688],[694,701],[572,684],[442,698],[309,659],[199,599],[139,489],[111,334]],'#3a3d58');
 // coastline pixels, rocks and exposed cliffs
 for(let i=0;i<90;i++){let x=105+seed(i+1200)*1000,y=130+seed(i+1400)*590; if(x<150||x>1040||y<155||y>670){rect(x,y,4+(i%4)*3,3+(i%3)*2,i%2?'#52516b':'#191f34')}}
 // garden islands, deep pools and moss terraces
 water(374,520,128,111);water(700,520,114,105);water(500,650,200,56);
 poly([[350,500],[380,480],[490,489],[516,524],[500,630],[470,645],[370,625]],'#273b43');
 poly([[686,503],[718,481],[820,496],[831,532],[805,627],[772,642],[700,615]],'#273b43');
 for(let i=0;i<45;i++){let x=125+seed(i+211)*930,y=120+seed(i+411)*570;let central=Math.hypot(x-600,y-400);if(central>155&&((i%3===0)||x<250||x>950)){plant(x,y,.55+(i%4)*.15,i%7===0)}}
 for(let i=0;i<23;i++){let x=130+seed(i+515)*950,y=130+seed(i+715)*580;if(Math.hypot(x-600,y-400)>190)tree(x,y,.55+(i%3)*.13,i%8===0)}
}
function ambientArchitecture(){
 const braces=[[[345,260],[420,286],[468,325]],[[755,285],[790,260],[835,245]],[[330,390],[390,398],[466,406]],[[730,415],[775,425],[814,433]],[[430,570],[466,544],[493,510]],[[714,515],[746,554],[772,590]]];
 braces.forEach((p,j)=>{path(p,7);for(let k=0;k<p.length;k++){let [x,y]=p[k];rect(x-5,y-5,10,10,'#171b30');rect(x-2,y-2,4,4,j%2?C.cyan:C.purple)}});
 const beds=[[360,260,48,18],[785,257,56,19],[355,395,42,17],[758,470,42,19],[430,580,46,17],[735,585,48,17],[205,390,42,17],[970,290,38,17]];
 beds.forEach((b,i)=>{rect(b[0]-3,b[1]-3,b[2]+6,b[3]+6,'#171a2c');rect(b[0],b[1],b[2],b[3],'#344050');rect(b[0]+3,b[1]+3,b[2]-6,b[3]-6,'#1c443a');for(let n=0;n<5;n++)plant(b[0]+6+n*(b[2]-12)/4,b[1]+b[3]/2,.42+(n%2)*.12,i%4===0)});
 for(let i=0;i<16;i++){let x=245+(i*47)%700,y=180+(i*71)%460;if(Math.hypot(x-600,y-398)>150){rect(x,y,12,8,'#11172a');rect(x+2,y+2,8,4,'#41435e');rect(x+4,y+3,4,2,i%2?C.cyan:C.gold)}}
}

function draw(){if(!c.isConnected)return;frame++;backdrop();
 // elevated bridges and lit walkways weave between actual rooms
 path([[430,210],[465,260],[520,285]],15);path([[760,235],[730,276],[680,298]],15);path([[338,295],[400,310],[470,342]],15);path([[328,475],[395,460],[475,445]],15);path([[720,430],[770,425],[820,425]],16);path([[405,615],[445,570],[500,520]],15);path([[790,600],[755,555],[700,520]],15);path([[590,510],[590,580],[600,650]],15);path([[600,670],[600,655]],15);
 rooms.forEach(room);ambientArchitecture();core();
 // vegetation intentionally overlaps building edges like a living installation
 for(let i=0;i<32;i++){let x=120+seed(i+811)*960,y=130+seed(i+911)*570;if(Math.hypot(x-600,y-400)>170&&(x<350||x>830||y>550)){if(i%4===0)tree(x,y,.55+(i%3)*.12,i%7===0);else plant(x,y,.65+(i%4)*.12,i%6===0)}}
 // bridge rail lamps, flower pixels, and moving fireflies
 for(let i=0;i<55;i++){let x=(i*83+frame*.35)%1180,y=(i*53+Math.sin(frame*.025+i)*9)%770;rect(x,y,2,2,i%4===0?C.cyan:C.violet)}
 crew.forEach(person);
 // pixel HUD engraved into the world, not a generic overlay
 rect(27,27,196,32,'#0a0d1b');rect(30,30,190,26,'#1a1930');rect(34,34,5,18,C.violet);g.fillStyle='#f1e8ff';g.font='bold 12px monospace';g.fillText('NEXUS / SECTOR 01',46,47);
 rect(967,27,203,32,'#0a0d1b');rect(970,30,197,26,'#1a1930');rect(979,38,5,10,C.green);g.fillStyle='#c8ffad';g.font='bold 10px monospace';g.fillText('AUTONOMOUS CREW  /  06',991,47);
 // atmospheric pixel scanline treatment
 g.globalAlpha=.045;for(let y=0;y<800;y+=4)rect(0,y,1200,1,'#e4dcff');g.globalAlpha=1;
 if(!document.hidden)raf=requestAnimationFrame(draw);else raf=0}
function select(i){selected=i;const b=root.querySelector('#pfRooms button[data-room="'+i+'"]');if(b)b.click();else{const r=rooms[i];root.querySelector('#pfNum').textContent=String(i+1).padStart(2,'0');root.querySelector('#pfTitle').textContent=r.name;root.querySelector('#pfDesc').textContent=r.desc;root.querySelector('#pfAgent').textContent=r.agent;root.querySelector('#pfFunction').textContent=r.fn;}}
c.addEventListener('click',e=>{const box=c.getBoundingClientRect(),x=(e.clientX-box.left)/box.width*1200,y=(e.clientY-box.top)/box.height*800;let i=-1,best=Infinity;rooms.forEach((r,j)=>{const cx=r.x+r.w/2,cy=r.y+r.h/2,d=Math.hypot((x-cx)*.8,y-cy);if(x>=r.x-10&&x<=r.x+r.w+10&&y>=r.y-10&&y<=r.y+r.h+10&&d<best){best=d;i=j}});if(i>=0)select(i)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!raf){last=performance.now();draw()}});
draw();
})();