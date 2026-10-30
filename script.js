const $=id=>document.getElementById(id),cv=$('c'),ctx=cv.getContext('2d'),TW=150,K={u:0,d:0,l:0,r:0,s:0,t:0};
let W,H,DPR,state='menu',prev='',cars=[],P=[],MK=[],raceTime=0,cd=0,goT=0,sc=.8,cam={x:0,y:0},curCd='',shake=0,colT=0,touchOK=matchMedia('(pointer:coarse)').matches;
let mode=0,trk=0,ctype=0,round=0,pts={},T=[],N=0,B,TH,TP,SC=[],OB=[],PU=[],RAIL=[],CURB=[],bt={},diff=1;
let curScr='menu',TT=null,TRACKFX=[],RLP=[],INSC=[],tutPage=0,tutSeen=false;
const SCHOOL='COLÉGIO BARBOSA FERRAZ';
const schoolLogo=new Image();schoolLogo.src='assets/logo-colegio.png';
try{bt=JSON.parse(localStorage.getItem('turborace_bt')||'{}')}catch(e){}
try{tutSeen=localStorage.getItem('turborace_tut_seen_v1')==='1'}catch(e){}
const sv=()=>{try{localStorage.setItem('turborace_bt',JSON.stringify(bt))}catch(e){}};
const nang=a=>Math.atan2(Math.sin(a),Math.cos(a)),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=t=>{const m=Math.floor(t/60),s=Math.floor(t%60),ms=Math.floor(t*1000%1000);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(ms).padStart(3,'0')};

/* ---------- Dados ---------- */
const TR=[
{n:'CIRCUITO URBANO',d:'Cidade, retas largas e curvas de 90°.',deco:0,g:['#454b55','#4c525c'],as:'#2b2c33',k:'#1f7bff',dust:'130,130,140',cp:[[0,0],[1200,0],[2200,-100],[2900,300],[2900,1000],[2400,1500],[1700,1300],[1200,1700],[400,2000],[-500,1900],[-1000,1300],[-900,600],[-500,200]]},
{n:'CIRCUITO FLORESTAL',d:'Muitas curvas e um grampo fechado.',deco:1,g:['#1f6a2a','#1c6026'],as:'#34363b',k:'#1f7bff',dust:'90,140,60',cp:[[0,0],[1000,-60],[1900,-400],[2700,-200],[3100,400],[2600,900],[1900,700],[1500,1200],[2000,1800],[1400,2300],[500,2100],[-200,2400],[-1000,2000],[-900,1200],[-1400,700],[-1000,100]]},
{n:'CIRCUITO DESERTO',d:'Alta velocidade e curvas longas.',deco:2,g:['#dbb673','#d2ab68'],as:'#3a3835',k:'#e8742a',dust:'205,170,105',cp:[[0,0],[1500,0],[3000,-100],[3800,400],[3700,1100],[3000,1400],[2900,2000],[2100,2300],[1500,1900],[1000,2300],[200,2100],[-600,2300],[-1200,1700],[-1000,900],[-600,500],[-1100,100]]}];
const PT=[{n:'EQUILIBRADO',d:'Bom em tudo.',col:'#e10600',mx:430,ac:380,tr:3,brk:680,gr:1,b:[.7,.7,.7]},{n:'RÁPIDO',d:'Maior velocidade final, curva menos.',col:'#2f8cff',mx:460,ac:320,tr:2.7,brk:620,gr:.95,b:[1,.5,.55]},{n:'ACELERAÇÃO',d:'Sai das curvas rápido.',col:'#ff8a1a',mx:415,ac:480,tr:3,brk:700,gr:1,b:[.6,1,.65]},{n:'CONTROLE',d:'Faz curvas e drifts com facilidade.',col:'#22d3c5',mx:425,ac:370,tr:3.45,brk:720,gr:1.08,b:[.65,.65,1]}];
const MODES=[{n:'CORRIDA RÁPIDA',d:'3 voltas contra 7 rivais.'},{n:'CAMPEONATO',d:'3 pistas, pontos pela posição final.'},{n:'CONTRARRELÓGIO',d:'Sozinho contra o cronômetro.'}];
const DIFFS=[{n:'FÁCIL',d:'Rivais erram mais e reagem devagar.',err:1.6,prec:.72,aggr:.55,react:.6},{n:'MÉDIO',d:'Disputa equilibrada.',err:1,prec:.88,aggr:.8,react:.85},{n:'DIFÍCIL',d:'Melhor trajetória, frenagem e pressão.',err:.55,prec:.96,aggr:1,react:1},{n:'EXTREMO',d:'Poucos erros, sem trapaça física.',err:.3,prec:1,aggr:1.1,react:1.15}];
const PER={aggr:{ov:.9,def:.5,err:1.3,lane:.9},tech:{ov:.55,def:.6,err:.6,lane:.5},strat:{ov:.7,def:.9,err:.7,lane:.6},speed:{ov:.65,def:.5,err:.9,lane:.7},chaos:{ov:.8,def:.7,err:1.1,lane:1}};
const AIS=[
 {n:'ROSSO',col:'#d90429',mx:432,ac:372,tr:2.95,brk:660,gr:.98,sty:4,per:'aggr',d:'Agressivo · pressiona, busca ultrapassagem, arrisca.'},
 {n:'VORTEX',col:'#ff7a1a',mx:418,ac:385,tr:3.15,brk:700,gr:1.04,sty:5,per:'tech',d:'Técnico · frenagem precisa e trajetória limpa.'},
 {n:'AURUM',col:'#ffc21a',mx:422,ac:368,tr:3.1,brk:710,gr:1.03,sty:6,per:'strat',d:'Estrategista · ataca no trecho bom, defende posição.'},
 {n:'TORO',col:'#22c55e',mx:428,ac:378,tr:2.9,brk:640,gr:.97,sty:7,per:'speed',d:'Velocista · forte em retas, sofre no grampo.'},
 {n:'ROYALE',col:'#7c5cff',mx:435,ac:360,tr:2.9,brk:650,gr:1,sty:8,per:'speed',d:'Hipercarro · final alta, frenagem longa.'},
 {n:'COMET',col:'#22d3c5',mx:415,ac:390,tr:3.2,brk:705,gr:1.05,sty:9,per:'tech',d:'Técnico · ágil em curvas encadeadas.'},
 {n:'ECHO',col:'#ff4fa3',mx:420,ac:375,tr:3.05,brk:670,gr:1,sty:10,per:'chaos',d:'Imprevisível · alterna ataque e defesa.'}];
const PTS=[10,8,6,5,4,3,2,1],PC=['40,190,255','80,255,150','255,210,60','200,100,255'],PL=['T','E','B','L'];

/* ---------- Pista ---------- */
function loadTrack(i){
  trk=i;TH=TR[i];T=[];const cp=TH.cp,n=cp.length;
  for(let j=0;j<n;j++){
    const p0=cp[(j+n-1)%n],p1=cp[j],p2=cp[(j+1)%n],p3=cp[(j+2)%n],m=Math.max(14,Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/14));
    for(let s=0;s<m;s++){const t=s/m,t2=t*t,t3=t2*t,f=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);T.push({x:f(p0[0],p1[0],p2[0],p3[0]),y:f(p0[1],p1[1],p2[1],p3[1])})}
  }
  N=T.length;
  T.forEach((a,k)=>{const b=T[(k+1)%N];a.a=Math.atan2(b.y-a.y,b.x-a.x);a.l=Math.hypot(b.x-a.x,b.y-a.y)||1});
  T.forEach((a,k)=>a.c=nang(T[(k+4)%N].a-T[(k-4+N)%N].a));
  TH.gc=shade(TH.g[1],.984);TH.gd=shade(TH.g[1],.94);TH.gl=shade(TH.g[1],1.025);
  TH.sh=['#8f97a4','#376634','#c9a566'][i]||'#8f97a4';
  TT=null;
  const searchEnd=Math.min(N-24,Math.max(44,Math.floor(N*.6)));
  let bestScore=1e18,bestK=24;
  for(let k=24;k<searchEnd;k++){
    let sc=0;
    for(let j=-20;j<=20;j+=2)sc+=Math.abs(T[(k+j+N)%N].c);
    if(sc<bestScore){bestScore=sc;bestK=k}
  }
  const tmk=T[bestK];TT={k:bestK,x:tmk.x,y:tmk.y,a:tmk.a,score:bestScore};
  B={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};
  T.forEach(p=>{B.x0=Math.min(B.x0,p.x);B.y0=Math.min(B.y0,p.y);B.x1=Math.max(B.x1,p.x);B.y1=Math.max(B.y1,p.y)});
  TP=new Path2D();T.forEach((p,k)=>k?TP.lineTo(p.x,p.y):TP.moveTo(p.x,p.y));TP.closePath();
  let sd=i*977+13;const R=()=>(sd=sd*16807%2147483647)/2147483647;
  const far=(x,y,m)=>{for(let k=0;k<N;k+=3)if(Math.hypot(x-T[k].x,y-T[k].y)<m)return false;return true};
  const at=(k,sg,d)=>{const p=T[((k%N)+N)%N];return[p.x-Math.sin(p.a)*sg*d,p.y+Math.cos(p.a)*sg*d,p.a]};
  SC=[];RAIL=[new Path2D(),new Path2D()];
  RLP=[new Path2D(),new Path2D()];
  for(let s=0;s<2;s++){const off=(s?1:-1)*TW*.17;let on=false;
    for(let k=0;k<N;k++){const q=at(k,1,off);RLP[s][on?'lineTo':'moveTo'](q[0],q[1]);on=true}
    RLP[s].closePath();
  }
  CURB=[new Path2D(),new Path2D()];
  for(let s=0;s<2;s++){const sg=s?1:-1;let on=false;
    for(let k=0;k<N;k++){const q=at(k,sg,TW/2+8);CURB[s][on?'lineTo':'moveTo'](q[0],q[1]);on=true}
  }
  for(let s=0;s<2;s++){const sg=s?1:-1;let on=false;
    for(let k=0;k<N;k++){
      const p=T[k];
      if(sg*p.c>.22){on=false;continue}
      const q=at(k,sg,TW/2+34);RAIL[s][on?'lineTo':'moveTo'](q[0],q[1]);on=true;
      if(Math.abs(p.c)>.3&&k%3===0){const t=at(k,sg,TW/2+48);SC.push({t:7,x:t[0],y:t[1],s:10})}
    }}
  const buildingFree=(x,y,s)=>{
    for(let j=0;j<SC.length;j++){
      const o=SC[j];
      if(o.t===1&&Math.hypot(x-o.x,y-o.y)<(s+o.s)*1.07)return false;
    }
    return true;
  };
  for(let k=0;k<N;k+=5)for(let sg=-1;sg<=1;sg+=2){
    if(R()<.35)continue;
    const d=TW/2+110+R()*300,q=at(k,sg,d),dc=TH.deco;
    const s=dc===1?30+R()*35:dc===0?42+R()*64:12+R()*24;
    if(!far(q[0],q[1],TW/2+40+s*(dc===0?1.6:1)))continue;
    if(dc===0){
      if(!buildingFree(q[0],q[1],s))continue;
      SC.push({t:1,x:q[0],y:q[1],s,h:34+R()*72,col:['#5d6678','#6b5f73','#4f6a73','#7a6a5a','#5c707e','#86735f'][k%6]});
    }
    else if(dc===1)SC.push({t:0,x:q[0],y:q[1],s});
    else SC.push({t:2,x:q[0],y:q[1],s,k:R()<.55});
  }
  for(let k=0;k<N;k+=12)for(let sg=-1;sg<=1;sg+=2){const q=at(k,sg,TW/2+54);SC.push({t:3,x:q[0],y:q[1]})}
  for(let k=20;k<N;k+=34){const q=at(k,(k/34|0)%2?1:-1,TW/2+62);SC.push({t:4,x:q[0],y:q[1],a:q[2],col:['#e10600','#1f7bff','#ffc21a','#22c55e'][k%4]})}
  [N-18,12].forEach(k=>[-1,1].forEach(sg=>{const q=at(k,sg,TW/2+104);SC.push({t:5,x:q[0],y:q[1],a:q[2]})}));
  [-1,1].forEach(sg=>{const q=at(0,sg,TW/2+46);SC.push({t:6,x:q[0],y:q[1],col:sg>0?'#1f7bff':'#fff'})});
  const clearSpot=(x,y,m)=>{
    for(let j=0;j<SC.length;j++){
      const o=SC[j];
      if(o.t===1){if(Math.hypot(x-o.x,y-o.y)<m+o.s)return false}
      else if(o.t===13){if(Math.hypot(x-o.x,y-o.y)<m+o.s*1.35)return false}
      else if(o.t===5||o.t===4||o.t===9){if(Math.hypot(x-o.x,y-o.y)<m+72)return false}
    }
    return true;
  };
  for(let k=0;k<N;k+=9)for(let sg=-1;sg<=1;sg+=2){
    if(R()<.46)continue;
    const d=TW/2+82+R()*175,q=at(k,sg,d);
    if(!far(q[0],q[1],TW/2+50)||!clearSpot(q[0],q[1],26))continue;
    const v=R();
    if(TH.deco===0){
      if(v<.4)SC.push({t:0,x:q[0],y:q[1],s:14+R()*16});
      else if(v<.72)SC.push({t:8,x:q[0],y:q[1],s:8+R()*10});
      else SC.push({t:12,x:q[0],y:q[1],s:9+R()*7});
    }else if(TH.deco===1){
      if(v<.5)SC.push({t:8,x:q[0],y:q[1],s:9+R()*12});
      else if(v<.78)SC.push({t:12,x:q[0],y:q[1],s:10+R()*8});
      else SC.push({t:0,x:q[0],y:q[1],s:16+R()*22});
    }else{
      if(v<.45)SC.push({t:10,x:q[0],y:q[1],s:9+R()*13});
      else if(v<.75)SC.push({t:8,x:q[0],y:q[1],s:7+R()*9});
      else SC.push({t:11,x:q[0],y:q[1],s:18+R()*26});
    }
  }
  [TT.k+30,TT.k-36].forEach((k,j)=>{
    const q=at(k,j?1:-1,TW/2+146);
    if(far(q[0],q[1],TW/2+80)&&clearSpot(q[0],q[1],72))SC.push({t:9,x:q[0],y:q[1],a:q[2],flip:j});
  });
  for(let k=0;k<N;k+=17)for(let sg=-1;sg<=1;sg+=2){
    if(R()<.3)continue;
    const q=at(k,sg,TW/2+74+R()*60),v=R();
    if(!far(q[0],q[1],TW/2+45)||!clearSpot(q[0],q[1],18))continue;
    if(TH.deco===0){
      if(v<.34)SC.push({t:0,x:q[0],y:q[1],s:13+R()*11});
      else if(v<.68)SC.push({t:8,x:q[0],y:q[1],s:7+R()*8});
      else SC.push({t:12,x:q[0],y:q[1],s:6+R()*5});
    }else if(TH.deco===1){
      if(v<.42)SC.push({t:8,x:q[0],y:q[1],s:8+R()*10});
      else if(v<.66)SC.push({t:12,x:q[0],y:q[1],s:8+R()*7});
      else SC.push({t:0,x:q[0],y:q[1],s:17+R()*30});
    }else{
      if(v<.55)SC.push({t:8,x:q[0],y:q[1],s:6+R()*6});
      else if(v<.82)SC.push({t:10,x:q[0],y:q[1],s:7+R()*8});
      else SC.push({t:11,x:q[0],y:q[1],s:12+R()*12});
    }
  }
  if(TH.deco===1||TH.deco===2){
    const num=TH.deco===1?4:3;
    const ruralClear=(x,y,s)=>{
      for(let j=0;j<SC.length;j++){
        const o=SC[j],dd=Math.hypot(x-o.x,y-o.y);
        if(o.t===1&&dd<s+o.s)return false;
        if((o.t===5||o.t===9)&&dd<150+s)return false;
        if(o.t===13&&dd<(s+o.s)*1.5)return false;
      }
      return true;
    };
    const seeds=[TT.k+24,TT.k-40];
    for(let n=0;n<7;n++)seeds.push(Math.floor(N*(.07+n*.14))%N);
    let made=0;
    for(let n=0;n<seeds.length&&made<num;n++){
      for(let side=0;side<2&&made<num;side++){
        const s=36+R()*16;
        const sg=(n+side)%2?1:-1,d=TW/2+188+(n%3)*32,k=((seeds[n]%N)+N)%N,q=at(k,sg,d);
        if(!far(q[0],q[1],TW/2+120)||!ruralClear(q[0],q[1],s))continue;
        SC.push({t:13,x:q[0],y:q[1],s,dec:TH.deco});made++;
      }
    }
  }
  TRACKFX=[];const fxStep=Math.max(6,Math.floor(N/92));
  for(let k=5;k<N;k+=fxStep){
    const off=(R()-.5)*(TW-46),q=at(k,1,off),r=R();
    if(r<.5)TRACKFX.push({t:0,x:q[0],y:q[1],a:q[2]+(R()-.5)*.9,l:7+R()*20,w:.7+R()*1.2});
    else if(r<.79)TRACKFX.push({t:1,x:q[0],y:q[1],a:q[2],l:10+R()*22,w:4+R()*10});
    else TRACKFX.push({t:2,x:q[0],y:q[1],a:q[2]+1.57,l:6+R()*14,w:1+R()*2});
  }
  OB=[];
  for(let k=45;k<N-45;k+=Math.ceil(40+R()*40)){
    const dTT=Math.min((k-TT.k+N)%N,(TT.k-k+N)%N);if(dTT<16)continue;
    const r=R(),off=(R()-.5)*(TW-70),p=T[k];
    if(r<.35)for(let j=0;j<3;j++){const q=at(k+j*2,1,off);OB.push({t:0,x:q[0],y:q[1],r:9,on:1})}
    else if(r<.55){const q=at(k,1,off);OB.push({t:1,x:q[0],y:q[1],r:14,on:1})}
    else if(r<.8){const q=at(k,1,off*.6);OB.push({t:2,x:q[0],y:q[1],r:30,on:1})}
    else{const q=at(k,1,(k&1?1:-1)*(TW/2-32));OB.push({t:3,x:q[0],y:q[1],r:22,a:p.a,on:1})}
  }
  PU=[];const g=Math.floor(N/10);
  for(let j=0;j<10;j++){
    let kk=j*g+25;
    if(Math.min((kk-TT.k+N)%N,(TT.k-kk+N)%N)<16)kk=(kk+22)%N;
    const q=at(kk,1,(j%2?1:-1)*25);PU.push({x:q[0],y:q[1],t:Math.floor(R()*4),on:1,rt:0});
  }

  /* inscrições oficiais repetidas nos trechos mais retos da pista */
  INSC=[];
  const wantInsc=N>850?5:4;
  const inscBusy=k=>{
    const t=T[k];
    for(let j=0;j<PU.length;j++){const p=PU[j];if(p.on&&Math.hypot(p.x-t.x,p.y-t.y)<108)return true}
    for(let j=0;j<OB.length;j++){const o=OB[j];if(o.on&&Math.hypot(o.x-t.x,o.y-t.y)<96)return true}
    return false;
  };
  const straight=[];
  for(let k=20;k<N-20;k++){
    if(inscBusy(k))continue;
    let cur=0;
    for(let j=-12;j<=12;j+=2)cur+=Math.abs(T[(k+j+N)%N].c);
    straight.push({k,cur});
  }
  straight.sort((a,b)=>a.cur-b.cur);
  const picked=[{k:TT.k}],sep=Math.max(58,Math.floor(N*.105));
  for(let n=0;n<straight.length&&picked.length<wantInsc;n++){
    const k=straight[n].k;
    let ok=Math.min(k,N-k)>=28;
    for(let j=0;j<picked.length&&ok;j++){
      const dk=picked[j].k;
      if(Math.min((k-dk+N)%N,(dk-k+N)%N)<sep)ok=false;
    }
    if(ok)picked.push({k});
  }
  picked.forEach(o=>{const t=T[o.k];INSC.push({k:o.k,x:t.x,y:t.y,a:t.a})});
}

/* ---------- Carros ---------- */
function mk(nm,col,mx,ac,tr,sty,slot,player,ex){
  ex=ex||{};
  const row=slot>>1,side=slot&1?1:-1,k=(N-3-row*4+N)%N,p=T[k];
  const o={nm,col,mx:player?mx:mx*(.985+Math.random()*.02),ac,tr,brk:ex.brk||680,gr:ex.gr||1,per:ex.per||'tech',sty,num:sty+1,player,human:player,x:p.x-Math.sin(p.a)*side*32,y:p.y+Math.cos(p.a)*side*32,a:p.a,d:p.a,v:0,idx:k,lap:-1,pr:-N,fin:0,ft:0,off:false,thr:0,lane:(Math.random()-.5)*70,tb:player?25:0,dr:0,boost:0,shield:0,slow:0,oil:0,drf:0,tu:0,pm:null,sT:0,stS:0,errT:2+Math.random()*4,errV:0,ovT:0,ovLane:0,defT:0};
  o.colLite=shade(col,1.32);o.colDark=shade(col,.56);o.colDarker=shade(col,.33);
  return o;
}
function grid(pl,allAI){
  const S=[0,1,2,3,4,6,7];
  if(pl&&mode===2&&!allAI){const p=PT[ctype];cars=[mk('VOCÊ',p.col,p.mx,p.ac,p.tr,ctype,0,1,{brk:p.brk,gr:p.gr})];return}
  cars=AIS.map((a,i)=>mk(a.n,a.col,a.mx,a.ac,a.tr,a.sty,S[i],0,{brk:a.brk,gr:a.gr,per:a.per}));
  if(pl){const p=PT[ctype];cars.push(mk('VOCÊ',p.col,p.mx,p.ac,p.tr,ctype,5,1,{brk:p.brk,gr:p.gr}))}
}
function near(c){
  let b=c.idx,bd=1e12;
  for(let d=-25;d<=25;d++){const i=(c.idx+d+N)%N,dx=c.x-T[i].x,dy=c.y-T[i].y,q=dx*dx+dy*dy;if(q<bd){bd=q;b=i}}
  if(c.idx>N*.75&&b<N*.25)c.lap++;else if(c.idx<N*.25&&b>N*.75)c.lap--;
  c.idx=b;c.dist=Math.sqrt(bd);c.off=c.dist>TW/2+10;
  const p=T[b];c.pr=c.lap*N+b+cl(((c.x-p.x)*Math.cos(p.a)+(c.y-p.y)*Math.sin(p.a))/p.l,0,1);
}
function step(c,dt,thr,brk,st,dr,tu){
  ['boost','shield','slow','oil'].forEach(k=>{if(c[k]>0)c[k]-=dt});
  const tup=c.tu;c.tu=0;
  if(c.human&&tu&&c.tb>0&&c.v>40){c.tu=1;c.tb=Math.max(0,c.tb-30*dt);if(!tup)snd('turbo')}
  let mx=c.mx*(c.slow>0?.8:1)*(c.tu?1.28:1)*(c.boost>0?1.22:1);
  if(c.off)mx=Math.min(mx,150);
  const ac=c.ac*(c.tu?1.9:1)*(c.boost>0?1.8:1);
  c.thr=thr;
  if(thr)c.v+=ac*Math.max(0,1-c.v/(mx*1.05))*dt;else if(c.v>0)c.v=Math.max(0,c.v-110*dt);
  if(brk){c.v-=(c.v>0?c.brk:260)*dt;if(c.human&&c.v>200&&(c.sT-=dt)<=0){snd('brake');c.sT=.3}}
  c.v*=1-.12*dt;if(c.v>mx)c.v-=(c.v-mx)*4*dt;c.v=Math.max(-90,c.v);
  const sp=Math.min(1,Math.abs(c.v)/140),dir=c.v>=0?1:-1;
  const dro=c.human&&dr&&Math.abs(st)>.3&&c.v>200&&!c.off&&c.oil<=0;
  if(dro){c.dr+=dt;c.tb=Math.min(100,c.tb+16*dt);c.v*=1-.06*dt}
  else{if(c.dr>.9&&c.human){c.boost=Math.max(c.boost,Math.min(1.6,.5+c.dr*.35));snd('boost')}c.dr=0}
  if(c.human&&!c.off&&c.v>300&&!dro&&!c.tu)c.tb=Math.min(100,c.tb+3*dt);
  c.drf=dro;
  const grip=c.gr||1,oilF=c.oil>0?.35*Math.min(1.1,grip):1;
  c.a+=st*oilF*c.tr*grip*sp*dir*(1-.3*Math.min(1,Math.abs(c.v)/460))*(dro?1.25:1)*dt;
  c.d+=nang(c.a-c.d)*Math.min(1,(c.oil>0?1.3:dro?4.5:14)*dt);
  c.x+=Math.cos(c.d)*c.v*dt;c.y+=Math.sin(c.d)*c.v*dt;
}
function ai(c,dt){
  const D=DIFFS[diff]||DIFFS[1],Pf=PER[c.per]||PER.tech;
  const v=Math.max(0,c.v),react=D.react||1;
  const L1=8+Math.floor(v/55),L2=L1+16,L3=L1+34;
  const i0=((c.idx%N)+N)%N;
  const t1=T[(i0+L1)%N],t2=T[(i0+L2)%N],t3=T[(i0+L3)%N],tc=T[i0];
  if(!t1||!t2||!t3||!tc){step(c,dt,1,0,0,0,0);return}
  const c1=Math.abs(nang(t2.a-tc.a)),c2=Math.abs(nang(t3.a-t2.a));
  const cur=Math.max(c1,c2*.8),bend=nang(t2.a-tc.a);
  c.errT-=dt;
  if(c.errT<=0){const m=(D.err||1)*(Pf.err||1);c.errV=(Math.random()-.5)*2*Math.min(1.2,m);c.errT=2.5+Math.random()*5/Math.max(.4,m)}
  let raceLane=cl(-bend*90,-62,62)*(.55+.2*(Pf.lane||.6));
  if(c.off)raceLane=0;
  let defLane=0;
  for(let i=0;i<cars.length;i++){
    const o=cars[i];if(o===c)continue;
    const dx=o.x-c.x,dy=o.y-c.y;
    if(dx>160||dx<-160||dy>160||dy<-160)continue;
    const dd=Math.sqrt(dx*dx+dy*dy);
    if(dd>160||dd<1)continue;
    const fx=Math.cos(c.a),fy=Math.sin(c.a),ahead=dx*fx+dy*fy,side=-dx*fy+dy*fx;
    if(Math.abs(side)<48){
      if(ahead<-20&&ahead>-150){
        const threat=o.v>v+10?1:.6;
        defLane=cl(side*.8,-50,50)*(Pf.def||.6)*threat;c.defT=1.2;
      }else if(ahead>10&&ahead<150&&(v-o.v)>-20){
        if(c.ovT<=0&&Math.random()<((Pf.ov||.6)*(D.aggr||.8))*dt*2.2)c.ovLane=(side>=0?-1:1)*(46+Math.random()*20),c.ovT=1.4;
      }
    }
    if(dd<70){
      const ah2=dx*fx+dy*fy,sd2=-dx*fy+dy*fx;
      if(ah2>0&&ah2<75&&Math.abs(sd2)<34)raceLane+=(sd2>=0?-1:1)*30;
    }
  }
  if(c.ovT>0)c.ovT-=dt;else c.ovLane*=Math.max(0,1-2*dt);
  if(c.defT>0)c.defT-=dt;else defLane=0;
  let obLane=0;
  for(let i=0;i<OB.length;i++){
    const o=OB[i];if(!o.on)continue;
    const dx=o.x-c.x,dy=o.y-c.y;
    if(dx>170||dx<-170||dy>170||dy<-170)continue;
    const dd=Math.sqrt(dx*dx+dy*dy);if(dd>155)continue;
    const fx=Math.cos(c.a),fy=Math.sin(c.a),ah=dx*fx+dy*fy,sd=-dx*fy+dy*fx;
    if(ah>0&&ah<140&&Math.abs(sd)<o.r+26){obLane=(sd>=0?-1:1)*(34+o.r*.4);break}
  }
  const laneT=cl(raceLane+c.ovLane*(Pf.ov||.7)+defLane*.7+obLane,-70,70);
  c.lane+=(laneT-c.lane)*Math.min(1,2.2*react*dt);
  const px=t1.x-Math.sin(t1.a)*c.lane,py=t1.y+Math.cos(t1.a)*c.lane;
  let st=cl(nang(Math.atan2(py-c.y,px-c.x)-c.a+(c.errV||0)*.12)*2.4,-1,1);
  c.stS+=(st-c.stS)*Math.min(1,7*react*dt);
  st=cl(c.stS+(c.errV||0)*.05,-1,1);
  const gripF=.92+.08*(c.gr||1);
  let tv=c.mx*(1-Math.min(.55,cur*.62/gripF))*(D.prec>=1?1:.97+.03*D.prec);
  if(c.off)tv=Math.min(tv,145);
  if(c.ovT>0&&cur<.35)tv=Math.min(c.mx,tv*1.03);
  step(c,dt,c.v<tv,c.v>tv+42-(c.brk-620)*.02,st,0,0);
}
const score=c=>c.fin?1e9-c.ft:c.pr;
function rank(c){let r=1;const s=score(c);cars.forEach(o=>{if(o!==c&&score(o)>s)r++});return r}

/* ---------- Efeitos ---------- */
function emit(x,y,vx,vy,l,s,col){if(P.length<650)P.push({x,y,vx,vy,l,m:l,s,col})}
function burst(x,y,col,n,pw){for(let i=0;i<n;i++){const a=Math.random()*6.3,s=(pw||60)+Math.random()*130;emit(x,y,Math.cos(a)*s,Math.sin(a)*s,.45+Math.random()*.35,3+Math.random()*3.5,col)}}
function fx(c){
  const sp=Math.abs(c.v),ca=Math.cos(c.a),sa=Math.sin(c.a),bx=c.x-ca*15,by=c.y-sa*15,r=()=>Math.random()-.5;
  if(c.off&&sp>60){for(let i=0;i<2;i++)emit(bx+r()*18,by+r()*18,r()*70,r()*70,.7+Math.random()*.4,5+Math.random()*4,TH.dust)}
  else if(c.thr&&sp>40&&!c.tu)emit(c.x-ca*26,c.y-sa*26,-ca*60+r()*40,-sa*60+r()*40,.26,2.4,'255,160,50');
  if(c.tu||c.boost>0){for(let i=0;i<3;i++)emit(c.x-ca*26+r()*9,c.y-sa*26+r()*9,-ca*(170+sp*.25)+r()*70,-sa*(170+sp*.25)+r()*70,.32+Math.random()*.2,3.2+Math.random()*2.5,c.tu?'70,195,255':'255,210,60');if(Math.random()<.4)emit(c.x-ca*30,c.y-sa*30,-ca*90,-sa*90,.25,2,'255,255,255')}
  if(c.shield>0&&Math.random()<.25)emit(c.x+r()*30,c.y+r()*30,r()*20,r()*20,.5,2.5,'80,255,150');
  if(c.oil>0){emit(bx,by,r()*40,r()*40,.5,5,'20,20,25');if(Math.random()<.3)emit(bx,by-6,r()*30,-40-Math.random()*30,.6,3,'30,30,36')}
  if(c.drf){
    for(let i=0;i<2;i++)emit(bx+r()*10,by+r()*10,r()*60,r()*60,.65+Math.random()*.35,6+Math.random()*5,c.off?TH.dust:'232,232,238');
    if(Math.random()<.3)emit(bx,by,r()*30,r()*30,.5,3,'60,60,66');
    const w=[-1,1].map(s=>[bx-sa*s*9,by+ca*s*9]);
    if(c.pm){w.forEach((q,i)=>MK.push([c.pm[i][0],c.pm[i][1],q[0],q[1]]));if(MK.length>1100)MK.splice(0,80)}
    c.pm=w;
    if(c.human&&(c.sT-=.016)<=0){snd('drift');c.sT=.2}
  }else c.pm=null;
}
/* ---------- Som ---------- */
let AC,eng,egn;
function aud(){
  if(AC){if(AC.state==='suspended')AC.resume();return}
  try{AC=new(window.AudioContext||window.webkitAudioContext)();eng=AC.createOscillator();egn=AC.createGain();eng.type='sawtooth';egn.gain.value=0;eng.connect(egn);egn.connect(AC.destination);eng.start()}catch(e){AC=null}
}
function tone(f,d,ty,v,f2){const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=ty;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(t+d)}
function noise(d,v,f){const b=AC.createBuffer(1,AC.sampleRate*d,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;const s=AC.createBufferSource(),g=AC.createGain(),fl=AC.createBiquadFilter(),t=AC.currentTime;s.buffer=b;fl.type='bandpass';fl.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl);fl.connect(g);g.connect(AC.destination);s.start()}
function snd(k){
  if(!AC)return;
  if(k==='b3')tone(440,.2,'square',.07);else if(k==='go')tone(880,.5,'square',.08);
  else if(k==='col')noise(.25,.25,500);else if(k==='pick'){tone(600,.12,'triangle',.1,1200);setTimeout(()=>tone(900,.15,'triangle',.1,1500),80)}
  else if(k==='turbo')tone(200,.5,'sawtooth',.07,900);else if(k==='boost')tone(300,.3,'sawtooth',.06,700);
  else if(k==='drift')noise(.2,.08,3000);else if(k==='brake')noise(.25,.07,2000);else if(k==='oil')noise(.5,.1,800);
}

/* ---------- UI / estados ---------- */
function show(id){document.querySelectorAll('.scr').forEach(e=>e.classList.remove('on'));if(id)$(id).classList.add('on');curScr=id||''}
const TUTN=5;
function refreshTut(){
  const b=$('bhow');if(!b)return;
  b.classList.toggle('new',!tutSeen);
  b.classList.toggle('seen',tutSeen);
}
function optLine(l,v,extra){return '<small>'+l+'</small><b>'+v+'</b>'+(extra||'')}
function ui(){
  const racing=state==='count'||state==='race'||state==='paused';
  $('hud').classList.toggle('on',racing);
  $('touch').classList.toggle('on',touchOK&&(state==='count'||state==='race'));
  const tKey=mode===1?round:trk;
  $('bm').innerHTML='<i class="dot"></i>MELHOR TEMPO · '+TR[tKey].n.replace('CIRCUITO ','')+': '+(bt[tKey]?fmt(bt[tKey]):'--');
  if($('bplayn'))$('bplayn').textContent=MODES[mode].n;
  $('bmode').innerHTML=optLine('MODO',MODES[mode].n);
  $('bdiff').innerHTML=optLine('DIFICULDADE',DIFFS[diff].n,'<span class="pips">'+[0,1,2,3].map(i=>'<i class="'+(i<=diff?'on':'')+'"></i>').join('')+'</span>');
  $('bcar').innerHTML=optLine('CARRO',PT[ctype].n,'<i class="swatch" style="background:'+PT[ctype].col+';color:'+PT[ctype].col+'"></i>');
  $('btrk').innerHTML=mode===1?optLine('CAMPEONATO','3 PISTAS'):optLine('PISTA',TR[trk].n.replace('CIRCUITO ',''));
  $('btrk').disabled=mode===1;
  refreshTut();
}
function markTutSeen(){
  if(tutSeen)return;
  tutSeen=true;
  try{localStorage.setItem('turborace_tut_seen_v1','1')}catch(e){}
  refreshTut();
}
function renderTut(){
  const pgs=document.querySelectorAll('#how .tutpg');
  pgs.forEach((p,i)=>p.classList.toggle('on',i===tutPage));
  $('tprev').disabled=tutPage===0;
  $('tnext').textContent=tutPage===TUTN-1?'Concluir':'Próximo';
  $('tcount').textContent=(tutPage+1)+' / '+TUTN;
  $('tdots').innerHTML=Array.from({length:TUTN},(_,i)=>'<i class="'+(i===tutPage?'on':'')+'"></i>').join('');
  if(tutPage===TUTN-1)markTutSeen();
}
function openTut(){tutPage=0;show('how');renderTut()}
function closeTut(){show('menu');ui()}
function tutGo(d){
  const n=cl(tutPage+d,0,TUTN-1);
  if(n===tutPage)return;
  tutPage=n;renderTut();
}
function setCd(t,col){
  const e=$('cd');
  if(t===null){e.style.display='none';curCd='';return}
  if(t!==curCd){curCd=t;e.textContent=t;e.style.color=col||'#fff';e.style.display='block';e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');snd(t==='GO!'?'go':'b3')}
}
function demo(){
  loadTrack(mode===1?0:trk);grid(1,true);
  cars.forEach(c=>{c.player=0;c.human=0;c.demo=1});
  state='menu';setCd(null);show('menu');ui();
}
function startRace(){
  aud();loadTrack(mode===1?round:trk);grid(1);P=[];MK=[];raceTime=0;cd=3.99;goT=0;curCd='';shake=0;
  const p=cars.find(c=>c.player);cam.x=p.x;cam.y=p.y;state='count';show(null);ui();
}
function pause(){if(state==='race'||state==='count'){prev=state;state='paused';K.u=K.d=K.l=K.r=K.s=K.t=0;if(egn)egn.gain.value=0;setCd(null);show('pause');ui()}}
function resume(){if(state==='paused'){state=prev;show(null);ui()}}
function finish(c){
  state='fin';if(!c.fin)c.fin=1;if(!(c.ft>0))c.ft=raceTime;c.human=false;c.mx=330;c.tu=0;
  const tKey=mode===1?round:trk;
  const order=[...cars].sort((a,b)=>score(b)-score(a)),pos=order.indexOf(c)+1,t=c.ft,rec=!bt[tKey]||t<bt[tKey];
  if(rec){bt[tKey]=t;sv()}
  let tab='';
  if(mode===1){
    order.forEach((o,i)=>{pts[o.nm]=(pts[o.nm]||0)+(PTS[i]||0)});
    tab='<span>CAMPEONATO · PISTA '+(round+1)+'/3</span><span></span>'+Object.entries(pts).sort((a,b)=>b[1]-a[1]).map(([n,v],i)=>'<span style="color:'+(n==='VOCÊ'?'var(--neon)':'')+'">'+(i+1)+'. '+n+'</span><em>'+v+' pts</em>').join('');
  }
  $('rt').textContent=fmt(t);$('rp').textContent=mode===2?'—':pos+'º / '+cars.length;$('rb').textContent=fmt(bt[tKey]);
  $('rec').textContent=rec?'★ NOVO RECORDE ★':'';
  $('rtab').innerHTML=tab;$('rtab').style.display=tab?'grid':'none';
  $('bagain').textContent=mode===1?(round<2?'Próxima pista':'Novo campeonato'):'Jogar novamente';
  if(egn)egn.gain.value=0;setCd(null);show('result');ui();
}
function mapSVG(i){
  const cp=TR[i].cp;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  cp.forEach(p=>{x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])});
  const w=Math.max(1,x1-x0),h=Math.max(1,y1-y0),pad=7;
  const pt=p=>[(pad+(p[0]-x0)/w*(100-pad*2)).toFixed(1),(pad+(p[1]-y0)/h*(62-pad*2)).toFixed(1)];
  const pts=cp.map(p=>pt(p).join(',')).join(' '),s=pt(cp[0]);
  return '<span class="map"><svg viewBox="0 0 100 62" aria-hidden="true"><polygon points="'+pts+'"/><circle cx="'+s[0]+'" cy="'+s[1]+'" r="2.7"/></svg></span>';
}
function openSel(k){
  const L=k==='car'?PT:k==='trk'?TR:k==='diff'?DIFFS:MODES,cur=k==='car'?ctype:k==='trk'?trk:k==='diff'?diff:mode;
  $('selk').textContent=k==='car'?'GARAGEM':k==='trk'?'CIRCUITOS':k==='diff'?'RIVAIS':'MODO DE JOGO';
  $('selt').textContent=k==='car'?'SELECIONAR CARRO':k==='trk'?'SELECIONAR PISTA':k==='diff'?'DIFICULDADE DOS RIVAIS':'MODOS DE JOGO';
  let html=L.map((o,i)=>{
    let extra='';
    if(k==='car')extra=' style="--cc:'+o.col+'"';
    let head='';
    if(k==='trk')head=mapSVG(i);
    else if(k==='car')head='<i class="swatch" style="background:'+o.col+';color:'+o.col+'"></i>';
    else head='<span class="num">0'+(i+1)+'</span>';
    let body='<b>'+o.n+'</b><p>'+o.d+'</p>';
    if(o.b)body+=['VELOCIDADE','ACELERAÇÃO','CONTROLE'].map((l,j)=>'<small>'+l+'</small><div class="bar"><i style="width:'+o.b[j]*100+'%"></i></div>').join('');
    if(k==='diff')body+='<span class="pips">'+[0,1,2,3].map(j=>'<i class="'+(j<=i?'on':'')+'"></i>').join('')+'</span>';
    return '<div class="cd'+(i===cur?' on':'')+'" data-i="'+i+'" data-k="'+k+'" tabindex="0" role="button" aria-label="'+o.n+'"'+extra+'>'+head+body+'</div>';
  }).join('');
  if(k==='car'){
    html+='<div class="rivals"><div class="rtitle">RIVAIS · '+AIS.length+' CARROS</div>'+AIS.map((a,i)=>'<div class="rival" style="--rc:'+a.col+'"><i></i><div><b>'+a.n+'</b><small>'+a.d+'</small><span class="rspec">Vmax '+a.mx+' · Acel. '+a.ac+' · Freio '+a.brk+'</span></div><span class="rnum">0'+(i+1)+'</span></div>').join('')+'</div>';
  }
  $('cards').innerHTML=html;
  $('cards').onclick=e=>{const c=e.target.closest('.cd');if(!c)return;const i=+c.dataset.i,kk=c.dataset.k||k;if(kk==='car')ctype=i;else if(kk==='trk')trk=i;else if(kk==='diff')diff=i;else mode=i;demo()};
  $('cards').onkeydown=e=>{const c=e.target.closest('.cd');if(!c||e.target!==c)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();c.click()}};
  show('sel');
}

/* ---------- Atualização ---------- */
const hud={};
function setT(id,h){const e=hud[id]||(hud[id]=$(id));if(e._h!==h){e.innerHTML=h;e._h=h}}
function touch(c){
  OB.forEach(o=>{
    if(!o.on)return;const d=Math.hypot(c.x-o.x,c.y-o.y);if(d>o.r+14)return;
    if(o.t===0){o.on=0;burst(o.x,o.y,'255,120,30',6);if(c.shield<=0)c.v*=.9;snd('col')}
    else if(o.t===2){if(c.shield<=0&&c.oil<=0){c.oil=1.4;snd('oil')}}
    else if(c.shield>0){o.on=0;burst(o.x,o.y,'80,255,150',12);snd('col')}
    else{c.v*=.55;const nx=(c.x-o.x)/(d||1),ny=(c.y-o.y)/(d||1);c.x+=nx*(o.r+14-d);c.y+=ny*(o.r+14-d);shake=.4;burst(o.x,o.y,'200,200,200',6);snd('col')}
  });
  PU.forEach(p=>{
    if(!p.on||Math.hypot(c.x-p.x,c.y-p.y)>28)return;
    p.on=0;p.rt=12;burst(p.x,p.y,PC[p.t],16);snd('pick');
    if(p.t===0)c.tb=100;else if(p.t===1)c.shield=6;else if(p.t===2)c.boost=Math.max(c.boost,2.2);else cars.forEach(o=>{if(!o.player)o.slow=4});
  });
}
function update(dt){
  if(state==='paused')return;
  if(state==='count'){cd-=dt;if(cd<=0){state='race';goT=.9;setCd('GO!','#3dff7a')}else setCd(''+Math.ceil(cd))}
  if(state==='race'||state==='fin')raceTime+=dt;
  if(state==='race'&&goT>0){goT-=dt;if(goT<=0)setCd(null)}
  colT-=dt;
  const pl=cars.find(c=>c.player);
  if(state!=='count'){
    cars.forEach(c=>{
      if(c.human&&state==='race')step(c,dt,K.u,K.d,K.r-K.l,K.s,K.t);else ai(c,dt);
      near(c);fx(c);if(c.human)touch(c);
      if((state==='race'||state==='fin')&&c.lap>=3&&!c.fin){c.fin=1;c.ft=raceTime;if(c.player&&state==='race')finish(c)}
    });
    for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++){
      const a=cars[i],b=cars[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
      if(d<36&&d>.01){
        const o=(36-d)/2,nx=dx/d,ny=dy/d;a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;
        if(!(a.shield>0||b.shield>0)){a.v*=.985;b.v*=.985}
        if((a.player||b.player)&&Math.abs(a.v-b.v)>40){shake=Math.max(shake,.25);if(colT<=0){snd('col');colT=.4}}
      }
    }
  }
  if(AC&&egn){const on=pl&&(state==='race'||state==='count');egn.gain.setTargetAtTime(on?.02+.03*(pl.thr?1:0):0,AC.currentTime,.1);if(on){const eb=[50,56,47,53][pl.sty]||50;eng.frequency.setTargetAtTime(eb+Math.max(0,pl.v)*.32+(pl.tu?30:0),AC.currentTime,.06)}}
  PU.forEach(p=>{if(!p.on&&(p.rt-=dt)<=0)p.on=1});
  for(let i=P.length-1;i>=0;i--){const p=P[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;if(p.l<=0)P.splice(i,1)}
  shake=Math.max(0,shake-dt*2.5);
  const f=pl||cars[0],tx=f.x+Math.cos(f.d)*f.v*.3,ty=f.y+Math.sin(f.d)*f.v*.3,k=Math.min(1,6*dt);
  cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k;
  const z=cl(Math.min(W,H)/760,.55,1.05)*(1-.1*cl(f.v/430,0,1));sc+=(z-sc)*Math.min(1,3*dt);
  if(pl&&(state==='count'||state==='race'||state==='fin')){
    setT('hl','<small>VOLTA</small>'+cl(pl.lap+1,1,3)+'/3');
    setT('ht','<small>TEMPO</small>'+fmt(Math.max(0,raceTime)));
    setT('hp','<small>POSIÇÃO</small>'+(mode===2?'—':rank(pl)+'/'+cars.length));
    setT('hs',Math.round(Math.max(0,pl.v)*.55)+'<small>KM/H</small>');
    $('tbf').style.width=pl.tb+'%';$('tbf').classList.toggle('on',!!pl.tu);
    const it=(pl.shield>0?'◈ ESCUDO '+Math.ceil(pl.shield)+'s<br>':'')+(pl.boost>0?'» BOOST<br>':'')+(pl.oil>0?'~ ÓLEO':'');
    setT('hi',it);$('hi').style.display=it?'block':'none';
  }
}

/* ---------- Desenho ---------- */
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.fill()}
function circ(x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,6.3);ctx.fill()}
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=(n>>16)&255,g=(n>>8)&255,b=n&255;r=Math.max(0,Math.min(255,Math.round(r*f)));g=Math.max(0,Math.min(255,Math.round(g*f)));b=Math.max(0,Math.min(255,Math.round(b*f)));return 'rgb('+r+','+g+','+b+')'}
const SPEC=[
 {L:22,hw:9.5,fx:11,rx:-18,nose:27,tail:8,wing:1,light:0,inD:1,ex:2,decal:0,big:0,cal:'#e10600'},
 {L:25,hw:9,fx:12,rx:-19,nose:29,tail:7,wing:2,light:1,inD:2,ex:2,decal:1,big:0,cal:'#ffc21a'},
 {L:22,hw:10,fx:11,rx:-18,nose:26,tail:9,wing:3,light:2,inD:1,ex:2,decal:2,big:0,cal:'#22d3c5'},
 {L:23,hw:11,fx:11,rx:-18,nose:26,tail:9,wing:1,light:5,inD:1,ex:2,decal:3,big:0,cal:'#1f7bff'},
 {L:26,hw:9.5,fx:13,rx:-20,nose:30,tail:7,wing:1,light:0,inD:2,ex:2,decal:4,big:0,cal:'#ffd23f'},
 {L:27,hw:9,fx:14,rx:-20,nose:31,tail:6,wing:2,light:1,inD:2,ex:2,decal:1,big:0,cal:'#ff7a1a'},
 {L:23,hw:10,fx:11,rx:-18,nose:26,tail:10,wing:3,light:2,inD:1,ex:2,decal:2,big:0,cal:'#111111'},
 {L:25,hw:10.5,fx:12,rx:-19,nose:29,tail:8,wing:2,light:3,inD:2,ex:4,decal:5,big:1,cal:'#22c55e'},
 {L:24,hw:11,fx:12,rx:-19,nose:28,tail:10,wing:4,light:4,inD:2,ex:4,decal:4,big:0,cal:'#9be7ff'},
 {L:24,hw:9.5,fx:12,rx:-19,nose:28,tail:8,wing:1,light:5,inD:1,ex:2,decal:0,big:0,cal:'#22d3c5'},
 {L:23,hw:10,fx:11,rx:-18,nose:26,tail:9,wing:1,light:6,inD:1,ex:2,decal:3,big:0,cal:'#ff4fa3'}];
function shad(x,y,rx,ry,a){ctx.fillStyle='rgba(0,0,0,'+(a==null?.3:a)+')';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,6.3);ctx.fill()}
function wheel3D(x,y,steer,spin,big,cal){
  const wL=big?17:15,wW=big?8.4:7.4,r=wW/2;
  ctx.save();ctx.translate(x,y);ctx.rotate(steer||0);
  ctx.fillStyle='rgba(0,0,0,.5)';rr(-wL/2+1,-r+2.1,wL,wW,3);
  ctx.fillStyle='#0a0a0c';rr(-wL/2,-r,wL,wW,2.8);
  ctx.fillStyle='#191a20';rr(-wL/2+1.2,-r+1,wL-2.4,wW-2,2.2);
  ctx.fillStyle='#08090b';rr(-wL/2+2.6,-r+1.9,wL-5.2,wW-3.8,1.7);
  ctx.fillStyle='rgba(255,255,255,.16)';rr(-wL/2+2,-r+1,wL-4,1,1);
  ctx.fillStyle='rgba(0,0,0,.55)';rr(-wL/2+2,r-2.2,wL-4,1.2,1);
  ctx.strokeStyle='rgba(100,104,116,.55)';ctx.lineWidth=.75;ctx.beginPath();
  const span=wL-5.2;
  for(let i=0;i<5;i++){
    const px=-wL/2+2.6+(((i*2.55+spin*1.7)%span)+span)%span;
    ctx.moveTo(px,-r+1.8);ctx.lineTo(px-1,r-1.8);
  }
  ctx.stroke();
  const rimR=big?3.5:3.1;
  ctx.fillStyle='#11131a';ctx.beginPath();ctx.arc(0,0,rimR+1.1,0,6.3);ctx.fill();
  ctx.strokeStyle=cal||'#e10600';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,rimR+.55,.55,1.95);ctx.stroke();
  ctx.strokeStyle='#9aa4b5';ctx.lineWidth=.9;ctx.beginPath();
  for(let i=0;i<5;i++){const a=spin+i*1.2566;ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*(rimR-.1),Math.sin(a)*(rimR-.1))}
  ctx.stroke();
  ctx.fillStyle='#d9dfe9';ctx.beginPath();ctx.arc(0,0,.95,0,6.3);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.22)';ctx.fillRect(-2.2,-.35,1.1,.7);
  ctx.restore();
}
function drawCar(c){
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.a);
  const sp=SPEC[c.sty]||SPEC[0],L=sp.L,hw=sp.hw,s=c.sty;
  const steer=cl(nang(c.a-c.d)*2.2+(c.stS||0)*.15,-.5,.5);
  const spin=raceTime*(c.v||0)*.14;
  const roll=cl((c.stS||0)*cl(Math.abs(c.v)/380,0,1),-.45,.45),bdy=roll*3.0;
  const base=c.col,lite=c.colLite||shade(base,1.3),dark=c.colDark||shade(base,.56),darker=c.colDarker||shade(base,.33);
  const braking=!c.thr&&Math.abs(c.v)>20;
  const tx=-L-4,nx=sp.nose;

  /* sombra e reflexo no asfalto */
  ctx.save();ctx.translate(2.4,4.2);
  ctx.fillStyle='rgba(0,0,0,.15)';ctx.beginPath();ctx.ellipse(0,bdy*.2,L+17,hw+9.5,0,0,6.3);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.26)';ctx.beginPath();ctx.ellipse(0,bdy*.2,L+8,hw+5,0,0,6.3);ctx.fill();
  ctx.fillStyle=base;ctx.globalAlpha=.05;ctx.beginPath();ctx.ellipse(-1,1.5,L+3,hw+3,0,0,6.3);ctx.fill();ctx.globalAlpha=1;
  ctx.restore();
  [[sp.fx,-1],[sp.fx,1],[sp.rx,-1],[sp.rx,1]].forEach(w=>{
    shad(w[0]+1,w[1]*(hw+1)+2.3,8.5,3.4,.34);
  });

  /* halo do turbo */
  if(c.tu||c.boost>0){
    const g=ctx.createRadialGradient(-L-11,0,2,-L-11,0,31);
    g.addColorStop(0,c.tu?'rgba(90,205,255,.72)':'rgba(255,205,70,.7)');
    g.addColorStop(.55,c.tu?'rgba(50,140,255,.22)':'rgba(255,130,30,.18)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(-L-12,0,30,14,0,0,6.3);ctx.fill();
  }

  /* rodas */
  const wy=hw+(sp.big?1.2:1);
  wheel3D(sp.rx,-wy,0,spin,sp.big,sp.cal);wheel3D(sp.rx,wy,0,spin,sp.big,sp.cal);
  wheel3D(sp.fx,-wy,steer,spin,sp.big,sp.cal);wheel3D(sp.fx,wy,steer,spin,sp.big,sp.cal);

  ctx.save();ctx.translate(0,bdy);

  /* carroceria */
  const grd=ctx.createLinearGradient(0,-hw-3,0,hw+3);
  grd.addColorStop(0,lite);grd.addColorStop(.27,base);grd.addColorStop(.73,dark);grd.addColorStop(1,darker);
  ctx.fillStyle=grd;ctx.beginPath();
  if(s===5){
    ctx.moveTo(tx,-hw+2);ctx.quadraticCurveTo(-L*.35,-hw-1.4,6,-hw-1.1);
    ctx.lineTo(nx-11,-hw+2.8);ctx.quadraticCurveTo(nx-2,-2.4,nx,0);
    ctx.quadraticCurveTo(nx-2,2.4,nx-11,hw-2.8);ctx.lineTo(6,hw+1.1);
    ctx.quadraticCurveTo(-L*.35,hw+1.4,tx,hw-2);ctx.quadraticCurveTo(tx-5,0,tx,-hw+2);
  }else if(s===7){
    ctx.moveTo(tx,-hw+2);ctx.lineTo(-8,-hw-1.5);ctx.lineTo(nx-15,-hw+2.2);
    ctx.lineTo(nx-3,-4.2);ctx.lineTo(nx,0);ctx.lineTo(nx-3,4.2);
    ctx.lineTo(nx-15,hw-2.2);ctx.lineTo(-8,hw+1.5);ctx.lineTo(tx,hw-2);ctx.quadraticCurveTo(tx-5,0,tx,-hw+2);
  }else if(s===8){
    ctx.moveTo(tx,-hw+2);ctx.quadraticCurveTo(-L*.45,-hw-2,-2,-hw-1);
    ctx.lineTo(nx-10,-hw+3.1);ctx.lineTo(nx-2,-4.1);ctx.lineTo(nx,0);ctx.lineTo(nx-2,4.1);
    ctx.lineTo(nx-10,hw-3.1);ctx.lineTo(-2,hw+1);ctx.quadraticCurveTo(-L*.45,hw+2,tx,hw-2);
    ctx.quadraticCurveTo(tx-6,0,tx,-hw+2);
  }else if(s===6||s===2){
    ctx.moveTo(tx,-hw+2);ctx.lineTo(4,-hw-1.1);
    ctx.quadraticCurveTo(nx-2,-hw+2,nx-3,-3.4);ctx.lineTo(nx-3,3.4);
    ctx.quadraticCurveTo(nx-2,hw-2,4,hw+1.1);ctx.lineTo(tx,hw-2);ctx.quadraticCurveTo(tx-5,0,tx,-hw+2);
  }else if(s===4||s===3){
    ctx.moveTo(tx,-hw+2);ctx.lineTo(-L*.5,-hw-1.1);ctx.lineTo(9,-hw);
    ctx.quadraticCurveTo(nx-1,-hw+3,nx-2,-3.4);ctx.lineTo(nx-2,3.4);
    ctx.quadraticCurveTo(nx-1,hw-3,9,hw);ctx.lineTo(-L*.5,hw+1.1);ctx.lineTo(tx,hw-2);ctx.quadraticCurveTo(tx-5,0,tx,-hw+2);
  }else{
    ctx.moveTo(tx,-hw+2);ctx.lineTo(8,-hw-1);ctx.lineTo(nx-7,-hw+4.2);
    ctx.lineTo(nx,-3.4);ctx.lineTo(nx,3.4);ctx.lineTo(nx-7,hw-4.2);ctx.lineTo(8,hw+1);
    ctx.lineTo(tx,hw-2);ctx.quadraticCurveTo(tx-5,0,tx,-hw+2);
  }
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=1.4;ctx.stroke();

  /* verniz e reflexos */
  ctx.fillStyle='rgba(255,255,255,.2)';
  ctx.beginPath();ctx.moveTo(tx+6,-hw+3);ctx.lineTo(7,-hw-.3);ctx.lineTo(nx-10,-hw+3.2);
  ctx.lineTo(5,-hw+4.8);ctx.lineTo(tx+6,-hw+5.2);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(160,220,255,.11)';
  ctx.beginPath();ctx.moveTo(nx-16,-2.2);ctx.lineTo(4,-4);ctx.lineTo(14,1.6);ctx.lineTo(nx-10,2.8);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;ctx.beginPath();
  ctx.moveTo(nx-19,-1.7);ctx.quadraticCurveTo(4,-3.4,-2,-2.3);ctx.stroke();
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(-L*.5,hw*.55,L*.52,hw*.55,0,0,6.3);ctx.fill();

  /* linhas de painel */
  ctx.strokeStyle='rgba(0,0,0,.34)';ctx.lineWidth=.9;
  ctx.beginPath();ctx.moveTo(8,-hw+1.7);ctx.lineTo(8,hw-1.7);ctx.moveTo(-4,-hw+1.5);ctx.lineTo(-4,hw-1.5);ctx.stroke();
  ctx.strokeStyle='rgba(0,0,0,.22)';ctx.beginPath();
  ctx.moveTo(nx-15,-hw+4);ctx.quadraticCurveTo(nx-10,0,nx-15,hw-4);ctx.stroke();

  /* entradas de ar laterais */
  if(sp.inD===2){
    ctx.fillStyle='rgba(0,0,0,.52)';rr(-1,-hw+1.2,11,3.2,1.5);rr(-1,hw-4.4,11,3.2,1.5);
    ctx.fillStyle='rgba(255,255,255,.1)';ctx.fillRect(0,-hw+1.6,8,.8);ctx.fillRect(0,hw-4,8,.8);
  }else{
    ctx.fillStyle='rgba(0,0,0,.4)';rr(2,-hw+1.5,8,2.5,1.2);rr(2,hw-4,8,2.5,1.2);
  }

  /* faixas e decalques */
  ctx.save();
  if(sp.decal===0){ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(tx+5,-1.9,L+15,3.8)}
  else if(sp.decal===1){ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(nx-18,-hw+3.4,L+12,2.2);ctx.fillRect(nx-18,hw-5.6,L+12,2.2)}
  else if(sp.decal===2){ctx.fillStyle='rgba(255,255,255,.88)';ctx.beginPath();ctx.arc(-5,0,5.6,0,6.3);ctx.fill()}
  else if(sp.decal===3){ctx.fillStyle='rgba(255,255,255,.82)';ctx.fillRect(8,-hw+1.6,L-4,2.1);ctx.fillRect(8,hw-3.7,L-4,2.1)}
  else if(sp.decal===4){ctx.fillStyle='rgba(120,205,255,.72)';ctx.fillRect(tx+7,-2.8,L+10,1.8);ctx.fillRect(tx+7,1,L+10,1.8)}
  else{ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.moveTo(-2,-hw+2.3);ctx.lineTo(12,-1.6);ctx.lineTo(12,1.6);ctx.lineTo(-2,hw-2.3);ctx.lineTo(-2,hw-4.6);ctx.lineTo(8,0);ctx.lineTo(-2,-hw+4.6);ctx.closePath();ctx.fill()}
  ctx.restore();

  /* número no capô */
  const rx0=nx-14.5,ry0=-hw*.4;
  ctx.fillStyle='rgba(247,251,255,.95)';ctx.beginPath();ctx.arc(rx0,ry0,4.5,0,6.3);ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(rx0,ry0,4.5,0,6.3);ctx.stroke();
  ctx.save();ctx.fillStyle='#08111f';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 '+(c.num>9?4.5:5.4)+'px Arial';ctx.fillText(''+c.num,rx0,ry0+.35);ctx.restore();

  /* cockpit */
  const ccx=s===4?1:s===8?-1:s===5?2:-2;
  ctx.fillStyle='#070a10';rr(ccx-10,-hw+2,19,hw*2-4,6);
  const wg=ctx.createLinearGradient(0,-6,0,6);
  wg.addColorStop(0,'rgba(175,225,255,.94)');wg.addColorStop(.42,'rgba(66,112,160,.92)');wg.addColorStop(1,'rgba(11,22,40,.96)');
  ctx.fillStyle=wg;
  ctx.beginPath();ctx.moveTo(ccx+2,-hw+3.2);ctx.lineTo(ccx+9,-hw+4.7);ctx.lineTo(ccx+9,hw-4.7);ctx.lineTo(ccx+2,hw-3.2);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(90,150,205,.55)';rr(ccx-3,-hw+3,6,2.1,1);rr(ccx-3,hw-5.1,6,2.1,1);
  ctx.fillStyle='rgba(28,55,88,.9)';
  ctx.beginPath();ctx.moveTo(ccx-4,-hw+3.3);ctx.lineTo(ccx+1,-hw+3.3);ctx.lineTo(ccx+1,hw-3.3);ctx.lineTo(ccx-4,hw-3.3);ctx.lineTo(ccx-8,-hw+4.3);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(190,230,255,.5)';ctx.beginPath();ctx.moveTo(ccx+3.2,-hw+3.8);ctx.lineTo(ccx+5,-hw+4.2);ctx.lineTo(ccx+5,hw-4.2);ctx.lineTo(ccx+3.2,hw-3.8);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.7)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(ccx+2,-hw+3.2);ctx.lineTo(ccx+2,hw-3.2);ctx.moveTo(ccx-4,-hw+3.3);ctx.lineTo(ccx-4,hw-3.3);ctx.stroke();
  /* capacete do piloto */
  ctx.fillStyle='#dfe9f5';ctx.beginPath();ctx.arc(ccx-1.2,0,2.7,0,6.3);ctx.fill();
  ctx.fillStyle='#14243a';ctx.beginPath();ctx.arc(ccx-1.2,0,2.7,-.85,.85);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(ccx-2.2,-1,1,0,6.3);ctx.fill();

  /* retrovisores */
  ctx.fillStyle='#0a0e15';ctx.fillRect(ccx+6,-hw-2.1,3.4,1.2);ctx.fillRect(ccx+6,hw+.9,3.4,1.2);
  ctx.fillStyle=lite;ctx.beginPath();ctx.ellipse(ccx+9.2,-hw-2.5,2.4,1.35,0,0,6.3);ctx.fill();
  ctx.beginPath();ctx.ellipse(ccx+9.2,hw+2.5,2.4,1.35,0,0,6.3);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.ellipse(ccx+9.4,hw+2.6,1.3,.65,0,0,6.3);ctx.fill();

  /* grade, splitter e faróis */
  ctx.fillStyle='#05080d';rr(nx-2.8,-hw+4.2,3,hw*2-8.4,1.2);
  ctx.fillStyle='#070a0f';rr(nx-10,-4.4,7.5,8.8,2.2);
  ctx.strokeStyle='rgba(255,255,255,.13)';ctx.lineWidth=.7;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(nx-9.4,-3+i*3);ctx.lineTo(nx-3,-3+i*3);ctx.stroke()}
  ctx.fillStyle='rgba(190,235,255,.14)';
  ctx.beginPath();ctx.ellipse(nx-4,-hw+3.6,8,3.2,0,0,6.3);ctx.fill();
  ctx.beginPath();ctx.ellipse(nx-4,hw-3.6,8,3.2,0,0,6.3);ctx.fill();
  ctx.fillStyle='#eaf8ff';
  if(sp.light===0){
    ctx.save();ctx.translate(nx-5,-hw+3.5);ctx.rotate(-.24);ctx.fillRect(0,-1.4,6.8,2.8);ctx.restore();
    ctx.save();ctx.translate(nx-5,hw-3.5);ctx.rotate(.24);ctx.fillRect(0,-1.4,6.8,2.8);ctx.restore();
    ctx.fillStyle='rgba(80,190,255,.8)';ctx.fillRect(nx-11,-hw+5.2,5,.9);ctx.fillRect(nx-11,hw-6.1,5,.9);
  }else if(sp.light===1){
    ctx.beginPath();ctx.moveTo(nx-9,-hw+2);ctx.lineTo(nx-2,-hw+4.6);ctx.lineTo(nx-2,-3);ctx.lineTo(nx-5.5,-3);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(nx-9,hw-2);ctx.lineTo(nx-2,hw-4.6);ctx.lineTo(nx-2,3);ctx.lineTo(nx-5.5,3);ctx.closePath();ctx.fill();
  }else if(sp.light===2){
    [-1,1].forEach(sg=>{ctx.beginPath();ctx.ellipse(nx-4,sg*(hw-3.3),2.3,1.5,0,0,6.3);ctx.fill();ctx.beginPath();ctx.ellipse(nx-4,sg*(hw-6),2.3,1.5,0,0,6.3);ctx.fill()});
  }else if(sp.light===3){
    ctx.fillRect(nx-7,-hw+2.4,7,1.8);ctx.fillRect(nx-7,hw-4.2,7,1.8);
  }else if(sp.light===4){
    ctx.fillRect(nx-6,-4.6,4,9.2);ctx.fillRect(nx-11,-hw+3,4,2.1);ctx.fillRect(nx-11,hw-5.1,4,2.1);
  }else if(sp.light===5){
    ctx.fillRect(nx-6,-hw+3.2,5,2.2);ctx.fillRect(nx-6,hw-5.4,5,2.2);
  }else{
    [-1,1].forEach(sg=>{
      ctx.beginPath();ctx.arc(nx-4.5,sg*(hw-4),1.8,0,6.3);ctx.fill();
      ctx.beginPath();ctx.arc(nx-4.5,sg*(hw-6.4),1.3,0,6.3);ctx.fill();
    });
  }

  /* lanternas traseiras e difusor */
  const tailGlow=braking?.5:.16;
  ctx.fillStyle='rgba(255,50,45,'+tailGlow+')';ctx.beginPath();ctx.ellipse(tx-1,-hw+4.2,5,4,0,0,6.3);ctx.fill();
  ctx.beginPath();ctx.ellipse(tx-1,hw-4.2,5,4,0,0,6.3);ctx.fill();
  ctx.fillStyle=braking?'#ff3b32':'#8a1717';
  if(s===8||sp.wing===4){ctx.fillRect(tx+1,-hw+3,2.8,hw*2-6)}
  else{ctx.fillRect(tx+1.5,-hw+2.2,2.7,3.7);ctx.fillRect(tx+1.5,hw-5.9,2.7,3.7)}
  ctx.fillStyle='#05080c';rr(tx-1,-hw+2,6.5,hw*2-4,1.5);
  ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=.8;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(tx+1,-3+i*3);ctx.lineTo(tx+5,-3+i*3);ctx.stroke()}
  ctx.fillStyle='#a9afb9';ctx.beginPath();ctx.arc(tx-1.4,-3,1.5,0,6.3);ctx.fill();ctx.beginPath();ctx.arc(tx-1.4,3,1.5,0,6.3);ctx.fill();
  ctx.fillStyle='#0b0c10';ctx.beginPath();ctx.arc(tx-1.4,-3,.75,0,6.3);ctx.fill();ctx.beginPath();ctx.arc(tx-1.4,3,.75,0,6.3);ctx.fill();
  if(c.thr&&c.v>35){ctx.fillStyle='rgba(255,160,60,.45)';ctx.beginPath();ctx.ellipse(tx-2.2,0,2.2,1.2,0,0,6.3);ctx.fill()}

  /* aerofólio */
  if(sp.wing>=2){
    const ww=sp.wing===4?9:sp.wing===3?7:6;
    ctx.fillStyle='rgba(0,0,0,.35)';rr(tx-6,-hw-2.4,ww+5,hw*2+4.8,2);
    ctx.fillStyle='#080b11';rr(tx-7,-hw-2.1,4.2,hw*2+4.2,1.5);
    ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(tx-7,-hw-2.1,4.2,1);
    ctx.fillStyle='#11151d';ctx.fillRect(tx-2.7,-hw+1,3.4,2);ctx.fillRect(tx-2.7,hw-3,3.4,2);
    ctx.fillStyle='#05070b';ctx.fillRect(tx-8.2,-hw-3.1,8.4,1.9);ctx.fillRect(tx-8.2,hw+1.2,8.4,1.9);
  }else{
    ctx.fillStyle='#080b11';rr(tx-4,-hw-1.4,7,2.8,1.2);rr(tx-4,hw-1.4,7,2.8,1.2);
  }
  if(s===8){ctx.fillStyle='rgba(8,11,17,.8)';ctx.fillRect(tx-2,-1,11,2);ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(tx-2,-1,11,.6)}

  /* chama do turbo / boost */
  if(c.tu){
    const fl=20+Math.random()*14,fg=ctx.createLinearGradient(tx,0,tx-fl,0);
    fg.addColorStop(0,'rgba(255,255,255,.96)');fg.addColorStop(.38,'rgba(110,208,255,.9)');fg.addColorStop(1,'rgba(25,110,255,0)');
    ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(tx,-4.6);ctx.lineTo(tx-fl,0);ctx.lineTo(tx,4.6);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.moveTo(tx,-1.8);ctx.lineTo(tx-fl*.55,0);ctx.lineTo(tx,1.8);ctx.closePath();ctx.fill();
  }else if(c.boost>0){
    const fl=14+Math.random()*9,fg=ctx.createLinearGradient(tx,0,tx-fl,0);
    fg.addColorStop(0,'rgba(255,255,255,.92)');fg.addColorStop(.45,'rgba(255,205,70,.88)');fg.addColorStop(1,'rgba(255,110,0,0)');
    ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(tx,-4);ctx.lineTo(tx-fl,0);ctx.lineTo(tx,4);ctx.closePath();ctx.fill();
  }

  /* escudo */
  if(c.shield>0){
    const a=.55+.3*Math.sin(raceTime*10);
    ctx.strokeStyle='rgba(90,255,160,'+a.toFixed(2)+')';ctx.lineWidth=2.6;ctx.beginPath();ctx.ellipse(1,0,35,21,0,0,6.3);ctx.stroke();
    ctx.fillStyle='rgba(90,255,160,.09)';ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,'+(a*.6).toFixed(2)+')';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(1,0,30,17,0,-.6,.9);ctx.stroke();
  }
  ctx.restore();

  /* status acima do carro */
  if(c.oil>0){ctx.fillStyle='#dfe9f5';ctx.font='900 11px Arial';ctx.textAlign='center';ctx.fillText('●',0,-hw-8)}
  if(c.slow>0){ctx.fillStyle='rgba(150,205,255,.95)';ctx.font='900 11px Arial';ctx.textAlign='center';ctx.fillText('❄',0,-hw-8)}
  ctx.restore();
}

function hsh(x,y){const v=Math.sin(x*12.9898+y*78.233)*43758.5453;return v-Math.floor(v)}
function worldAt(k,sg,d){const p=T[((k%N)+N)%N];return[p.x-Math.sin(p.a)*sg*d,p.y+Math.cos(p.a)*sg*d,p.a]}

function drawSC(o){
  const x=o.x,y=o.y,s=o.s||1,h=hsh(x,y),h2=hsh(y,x+7),dec=TH.deco;
  switch(o.t){
  case 0:{
    const pine=h<.4,r=s*.9;
    shad(x+s*.18,y+s*.32,r*1.2,r*.55,.28);
    if(dec===0){
      ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(x-s*.48,y+s*.26,s*.96,s*.2);
      ctx.fillStyle='#6a707a';ctx.fillRect(x-s*.48,y+s*.2,s*.96,s*.11);
      ctx.fillStyle='#2a2e37';ctx.fillRect(x-s*.4,y+s*.22,s*.8,s*.06);
    }
    const th=s*(pine?.5:.58);
    ctx.fillStyle='#4a3220';ctx.beginPath();ctx.moveTo(x-3.4,y+3);ctx.lineTo(x-2.2,y-th);ctx.lineTo(x+2.2,y-th);ctx.lineTo(x+3.4,y+3);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x+.7,y-th,1.9,th+2);
    ctx.strokeStyle='#3a2818';ctx.lineWidth=1.2;ctx.beginPath();
    ctx.moveTo(x-2,y+2);ctx.lineTo(x-7,y+5);ctx.moveTo(x+2,y+2);ctx.lineTo(x+7,y+5);ctx.stroke();
    if(pine){
      const g=dec===2?['#2f6b3a','#3a8547','#4da45c']:dec===1?['#144a22','#1b6a2e','#24913d']:['#205a32','#2a7a3e','#35984b'];
      for(let i=0;i<4;i++){
        const w=r*(1-i*.19),yy=y-s*.64+i*s*.33;
        ctx.fillStyle=g[i%3];ctx.beginPath();
        ctx.moveTo(x+(hsh(x+i,y)-.5)*4,yy-w*.97);ctx.lineTo(x-w,yy+w*.48);ctx.lineTo(x+w,yy+w*.48);ctx.closePath();ctx.fill();
        ctx.fillStyle='rgba(0,0,0,.14)';ctx.beginPath();ctx.moveTo(x,yy-w*.85);ctx.lineTo(x+w,yy+w*.46);ctx.lineTo(x,yy+w*.46);ctx.closePath();ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.13)';ctx.beginPath();ctx.moveTo(x-(hsh(y,i)-.5)*3,yy-w*.7);ctx.lineTo(x-w*.55,yy+w*.3);ctx.lineTo(x-w*.15,yy+w*.3);ctx.closePath();ctx.fill();
      }
      ctx.fillStyle='#2f8a42';ctx.beginPath();ctx.moveTo(x,y-s*1.24);ctx.lineTo(x-r*.16,y-s*.92);ctx.lineTo(x+r*.16,y-s*.92);ctx.closePath();ctx.fill();
    }else{
      circ(x-r*.18,y-r*.18,r*.82,'#0e3d17');
      circ(x-r*.23,y-r*.24,r*.7,'#1a6a28');
      circ(x-r*.29,y-r*.3,r*.48,'#2a9a3d');
      circ(x+r*.43,y+r*.1,r*.42,'#176024');
      circ(x+r*.4,y+r*.05,r*.3,'#238c36');
      circ(x-r*.5,y+r*.25,r*.25,'#1d7a2c');
      ctx.fillStyle='rgba(190,255,190,.2)';ctx.beginPath();ctx.ellipse(x-r*.34,y-r*.4,r*.3,r*.18,-.5,0,6.3);ctx.fill();
      if(h2>.55){ctx.fillStyle='#49b45a';circ(x+r*.1,y-r*.55,r*.09,'#49b45a');circ(x-r*.5,y-r*.05,r*.07,'#49b45a');circ(x+r*.58,y+r*.36,r*.08,'#49b45a')}
      if(dec===1&&h2>.72){ctx.strokeStyle='rgba(70,120,60,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+r*.25,y+r*.35);ctx.quadraticCurveTo(x+r*.1,y+r*.6,x+r*.3,y+r*.8);ctx.stroke()}
    }
    ctx.strokeStyle=dec===2?'rgba(120,90,40,.7)':'rgba(50,115,55,.7)';ctx.lineWidth=1.5;ctx.beginPath();
    for(let i=0;i<5;i++){const gx=x-r-7+hsh(x+i,y)*(r*2+14);ctx.moveTo(gx,y+r*.65);ctx.lineTo(gx+2,y+r*.2)}
    ctx.stroke();
    break}
  case 1:{
    const w=s,bh=o.h,rx=x-w,ry=y-bh,W=w*2,BH=bh*2;
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(rx+11,ry+13,W,BH);
    ctx.fillStyle='rgba(170,180,195,.15)';ctx.fillRect(rx-6,ry+BH+1,W+12,8);
    let bg=ctx.createLinearGradient(rx,ry,rx+W,ry+BH);
    bg.addColorStop(0,shade(o.col,1.18));bg.addColorStop(.52,o.col);bg.addColorStop(1,shade(o.col,.58));
    ctx.fillStyle=bg;ctx.fillRect(rx,ry,W,BH);
    ctx.fillStyle='rgba(255,255,255,.035)';
    for(let i=0;i<9;i++)ctx.fillRect(rx+6+hsh(rx+i,ry)* (W-14),ry+6+hsh(ry+i,rx)*(BH-14),3+hsh(i,ry)*7,2+hsh(rx,i)*4);
    ctx.strokeStyle=shade(o.col,.5);ctx.lineWidth=5;ctx.strokeRect(rx+3,ry+3,W-6,BH-6);
    ctx.strokeStyle=shade(o.col,1.34);ctx.lineWidth=1.4;ctx.strokeRect(rx+5.5,ry+5.5,W-11,BH-11);
    if(h>.56){
      const px=rx+W*.52,py=ry+BH*.16;
      for(let i=0;i<2;i++)for(let j=0;j<2;j++){
        const wx=px+i*(W*.19),wy=py+j*(BH*.2),ww=W*.155,hh=BH*.145;
        ctx.fillStyle='rgba(10,30,58,.92)';ctx.fillRect(wx,wy,ww,hh);
        ctx.strokeStyle='rgba(90,180,255,.42)';ctx.lineWidth=.8;ctx.strokeRect(wx,wy,ww,hh);
        ctx.beginPath();ctx.moveTo(wx+ww/2,wy);ctx.lineTo(wx+ww/2,wy+hh);ctx.moveTo(wx,wy+hh/2);ctx.lineTo(wx+ww,wy+hh/2);ctx.stroke();
        ctx.fillStyle='rgba(120,200,255,.12)';ctx.fillRect(wx+1,wy+1,ww-2,2);
      }
    }
    const units=2+Math.floor(h*4);
    for(let i=0;i<units;i++){
      const ux=rx+10+hsh(rx+i,ry)*(W-54),uy=ry+10+hsh(ry+i,rx)*(BH-44),uw=10+hsh(i,ry)*13,uh=6+hsh(rx,i)*7;
      ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(ux+2,uy+2,uw,uh);
      ctx.fillStyle='#424955';rr(ux,uy,uw,uh,1.5);
      ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(ux+1,uy+1,uw-2,1);
      ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(ux+uw/2,uy+uh/2,Math.min(uw,uh)*.28,0,6.3);ctx.stroke();
    }
    if(h>.3){
      const wx=rx+16+hsh(rx,ry)*12,wy=ry+14+hsh(ry,rx)*10;
      shad(wx+2,wy+3,8,3,.35);
      circ(wx,wy,7,'#8b929e');circ(wx,wy,5.5,'#bec4cc');circ(wx,wy,3.8,'#6c737e');circ(wx-1,wy-1,1.4,'#eef3f8');
    }
    if(h>.58){
      const ax=rx+W*.2+hsh(ry,rx)*W*.5,ay=ry+BH*.18;
      ctx.strokeStyle='#555c68';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax,ay-BH*.22);ctx.stroke();
      ctx.fillStyle='#4fc3ff';ctx.beginPath();ctx.arc(ax,ay-BH*.22,1.5,0,6.3);ctx.fill();
    }
    const fh=Math.min(27,BH*.3),fy=ry+BH-fh;
    ctx.fillStyle=shade(o.col,.52);ctx.fillRect(rx,fy,W,fh);
    ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(rx,fy,W,2);
    const nw=Math.max(2,Math.floor(W/24));
    for(let i=0;i<nw;i++){
      const wx=rx+9+i*((W-18)/Math.max(1,nw-1)),lit=hsh(wx,ry)>.48;
      ctx.fillStyle=lit?'rgba(255,218,140,.92)':'rgba(10,22,40,.92)';ctx.fillRect(wx-5,fy+7,10,7);
      ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=.7;ctx.strokeRect(wx-5,fy+7,10,7);
      ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(wx-5,fy+7,10,1);
    }
    if(h<.5){
      ctx.fillStyle='rgba(8,20,38,.9)';ctx.fillRect(x-8,fy+fh-13,16,fh-4);
      ctx.fillStyle='rgba(79,195,255,.5)';ctx.fillRect(x-8,fy+fh-13,16,1.5);
      ctx.fillStyle='#1a3350';ctx.fillRect(x-12,fy+2,24,4);
      ctx.fillStyle='rgba(255,255,255,.36)';
      for(let i=0;i<4;i++)ctx.fillRect(x-12+i*6,fy+2,3,4);
    }
    if(h>.68){ctx.fillStyle='rgba(79,195,255,.38)';ctx.fillRect(rx+6,ry+BH*.12,W-12,1.6)}
    ctx.fillStyle='#2b323d';ctx.fillRect(rx+W*.14,ry+BH*.22,15,11);
    ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(rx+W*.14,ry+BH*.22,15,1.5);
    break}
  case 2:
    if(o.k){
      shad(x+s*.22,y+s*.33,s*1.2,s*.55,.26);
      ctx.fillStyle='#8a6f4d';ctx.beginPath();
      ctx.moveTo(x-s*.85,y+s*.35);ctx.lineTo(x-s*.55,y-s*.55);ctx.lineTo(x+s*.05,y-s*.8);ctx.lineTo(x+s*.65,y-s*.35);ctx.lineTo(x+s*.8,y+s*.3);ctx.lineTo(x+s*.1,y+s*.55);ctx.closePath();ctx.fill();
      ctx.fillStyle='#a98a60';ctx.beginPath();
      ctx.moveTo(x-s*.55,y-s*.55);ctx.lineTo(x+s*.05,y-s*.8);ctx.lineTo(x+s*.35,y-s*.2);ctx.lineTo(x-s*.35,y+s*.05);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,240,210,.25)';ctx.beginPath();
      ctx.moveTo(x+s*.05,y-s*.78);ctx.lineTo(x+s*.6,y-s*.35);ctx.lineTo(x+s*.3,y-s*.2);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(70,50,28,.3)';ctx.beginPath();
      ctx.moveTo(x-s*.35,y+s*.05);ctx.lineTo(x+s*.35,y-s*.2);ctx.lineTo(x+s*.2,y+s*.4);ctx.closePath();ctx.fill();
      ctx.fillStyle='#b89a70';circ(x+s*.7,y+s*.42,s*.25,'#b89a70');circ(x-s*.76,y+s*.4,s*.18,'#9c815a');
      ctx.strokeStyle='rgba(80,55,30,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-s*.2,y-s*.4);ctx.lineTo(x+s*.05,y-s*.1);ctx.lineTo(x+s*.3,y-s*.25);ctx.stroke();
    }else{
      shad(x+2,y+s*.6,13,5,.22);
      if(h<.52){
        ctx.strokeStyle='#6b5a35';ctx.lineWidth=2;ctx.beginPath();
        for(let i=0;i<7;i++){const a=-1.2+i*.34,l=s*.7+hsh(x+i,y)*s*.4;ctx.moveTo(x,y+3);ctx.quadraticCurveTo(x+Math.cos(a)*l*.55,y+1,x+Math.cos(a)*l,y-Math.abs(Math.sin(a))*l*.9)}
        ctx.stroke();
        ctx.strokeStyle='rgba(160,135,80,.75)';ctx.lineWidth=1;ctx.beginPath();
        for(let i=0;i<5;i++){const a=-.9+i*.4,l=s*.45;ctx.moveTo(x,y+2);ctx.lineTo(x+Math.cos(a)*l,y-.3-Math.abs(Math.sin(a))*l*.7)}ctx.stroke();
        ctx.fillStyle='#7a5a35';for(let i=0;i<3;i++)circ(x-7+hsh(x,i)*14,y+s*.55,1.5,'#7a5a35');
      }else{
        ctx.fillStyle='#2f7a3a';rr(x-3,y-s,7,s*1.7,3.5);
        ctx.fillStyle='#3da34f';rr(x-9,y-s*.4,6,s*.9,3);rr(x+2,y-s*.5,6,s,3);
        ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(x-1,y-s+2,2,s);
        ctx.fillStyle='#7a5a35';for(let i=0;i<3;i++)circ(x-6+hsh(x,i)*12,y+s*.6,1.8,'#7a5a35');
        if(h2>.6){ctx.fillStyle='#b7a15e';circ(x+3,y-s*.85,1.6,'#b7a15e')}
      }
      ctx.fillStyle='#9c8a68';circ(x-s*.95,y+s*.28,2,'#9c8a68');circ(x+s*.82,y+s*.5,1.5,'#9c8a68');
    }
    break;
  case 3:{
    shad(x+3,y+3,11,4.5,.3);
    if(dec===0){
      ctx.fillStyle='#252a33';rr(x-4,y-3,8,6,2);
      let pg=ctx.createLinearGradient(x-3,0,x+3,0);pg.addColorStop(0,'#596170');pg.addColorStop(.5,'#343b47');pg.addColorStop(1,'#1e232c');
      ctx.fillStyle=pg;ctx.fillRect(x-2.5,y-40,5,39);
      ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(x-2.5,y-40,1.4,39);
      ctx.strokeStyle='#454d5b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-39);ctx.quadraticCurveTo(x+10,y-42,x+13,y-33);ctx.stroke();
      let gl=ctx.createRadialGradient(x+14,y-31,2,x+14,y-31,38);
      gl.addColorStop(0,'rgba(255,238,180,.38)');gl.addColorStop(.45,'rgba(255,235,170,.12)');gl.addColorStop(1,'rgba(255,235,170,0)');
      ctx.fillStyle=gl;ctx.beginPath();ctx.arc(x+14,y-31,38,0,6.3);ctx.fill();
      ctx.fillStyle='rgba(255,238,180,.16)';ctx.beginPath();ctx.ellipse(x+15,y+6,22,8,0,0,6.3);ctx.fill();
      ctx.fillStyle='#2b323d';rr(x+10,y-35,10,5,2);
      ctx.fillStyle='#ffe9a0';ctx.fillRect(x+11.5,y-33.5,7,1.6);
      ctx.fillStyle='rgba(79,195,255,.75)';ctx.fillRect(x-2,y-27,4,10);
      ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(x-2,y-27,4,1);
    }else{
      ctx.fillStyle='#5a4028';ctx.fillRect(x-2,y-23,4.5,24);
      ctx.fillStyle='#7a5a38';ctx.fillRect(x-2,y-23,1.8,24);
      ctx.fillStyle='rgba(255,255,255,.16)';ctx.fillRect(x-2,y-23,.8,24);
      ctx.fillStyle='#222832';rr(x-5,y-31,11,9,2);
      let gl=ctx.createRadialGradient(x+.5,y-26,1,x+.5,y-26,24);
      gl.addColorStop(0,'rgba(255,225,145,.38)');gl.addColorStop(1,'rgba(255,225,145,0)');
      ctx.fillStyle=gl;ctx.beginPath();ctx.arc(x+.5,y-26,24,0,6.3);ctx.fill();
      ctx.fillStyle='#ffe9a0';circ(x+.5,y-26,2.8,'#ffe9a0');
      if(dec===2){ctx.fillStyle='#2b323d';ctx.fillRect(x-5,y-33,11,2);ctx.fillStyle='rgba(90,180,255,.45)';ctx.fillRect(x-4,y-33,9,1)}
    }
    break}
  case 4:{
    ctx.save();ctx.translate(x,y);ctx.rotate(o.a);
    ctx.fillStyle='rgba(0,0,0,.32)';ctx.fillRect(-37,-2,76,16);
    ctx.fillStyle='#1c2028';ctx.fillRect(-40,-13,5,24);ctx.fillRect(35,-13,5,24);
    let pg=ctx.createLinearGradient(0,-8,0,8);pg.addColorStop(0,shade(o.col,1.22));pg.addColorStop(.5,o.col);pg.addColorStop(1,shade(o.col,.58));
    ctx.fillStyle=pg;ctx.fillRect(-37,-8,74,16);
    ctx.fillStyle='#f2f7ff';for(let i=0;i<4;i++)ctx.fillRect(-37+i*19,-8,9.5,16);
    ctx.fillStyle='rgba(0,0,0,.3)';for(let i=0;i<4;i++)ctx.fillRect(-37+i*19,-8,9.5,1.5);
    ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1.4;ctx.strokeRect(-37,-8,74,16);
    ctx.fillStyle='rgba(255,255,255,.22)';ctx.fillRect(-37,-8,74,2.5);
    ctx.fillStyle='#06101f';ctx.font='900 8px Arial';ctx.textAlign='center';ctx.fillText('TURBO RACE',0,2.8);
    ctx.fillStyle='rgba(155,231,255,.7)';ctx.font='700 4.5px Arial';ctx.fillText('COLÉGIO B. FERRAZ',0,7.2);
    ctx.fillStyle='rgba(255,255,255,.45)';ctx.fillRect(-34,-6.5,1.2,10);
    ctx.restore();break}
  case 5:{
    ctx.save();ctx.translate(x,y);ctx.rotate(o.a);
    ctx.fillStyle='rgba(0,0,0,.34)';ctx.fillRect(-94,-33,188,72);
    ctx.fillStyle='#1a2130';rr(-94,-36,188,72,4);
    ctx.fillStyle='#252e3f';ctx.fillRect(-91,-32,182,62);
    const tier=[[-27,'#2d3950'],[-9,'#34445f'],[9,'#3b4d6b']];
    for(let j=0;j<3;j++){
      const ty=tier[j][0];
      ctx.fillStyle=tier[j][1];ctx.fillRect(-91,ty,182,15);
      ctx.fillStyle='rgba(255,255,255,.07)';ctx.fillRect(-91,ty,182,1.4);
      for(let i=0;i<23;i++){
        const cx=-86+i*8,cy=ty+7+hsh(i+j*7,x)*1.5;
        if(hsh(cx,cy)>.32)circ(cx,cy,1.9,['#e7eef7','#7cc4ff','#ffd23f','#ff8a5c','#22d3c5'][(i+j)%5]);
        ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(cx-2.7,ty+11,5.4,1.2);
      }
    }
    ctx.fillStyle='rgba(8,18,34,.72)';ctx.fillRect(-94,9,188,23);
    for(let i=0;i<7;i++){ctx.fillStyle='rgba(79,195,255,.16)';ctx.fillRect(-92+i*27,10,24,1.2)}
    ctx.strokeStyle='rgba(79,195,255,.42)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-92,9);ctx.lineTo(92,9);ctx.stroke();
    ctx.strokeStyle='#111927';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-92,32);ctx.lineTo(92,32);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-92,31);ctx.lineTo(92,31);ctx.stroke();
    ctx.fillStyle='#0d1522';ctx.fillRect(-92,-33,184,9);
    ctx.fillStyle='#1f7bff';ctx.fillRect(-92,-33,184,2.5);
    ctx.fillStyle='#dff2ff';ctx.font='900 7.2px Arial';ctx.textAlign='center';ctx.fillText('COLÉGIO BARBOSA FERRAZ',0,-27);
    ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(-92,-23,184,1);
    ctx.fillStyle='rgba(235,250,255,.9)';ctx.font='900 9px Arial';ctx.fillText('TURBO RACE',0,24.5);
    ctx.fillStyle='#232b38';for(let i=0;i<5;i++)ctx.fillRect(-82+i*41,30,5,6);
    ctx.fillStyle='rgba(79,195,255,.65)';ctx.fillRect(-94,-37,4,10);ctx.fillRect(90,-37,4,10);
    ctx.fillStyle='#eaf6ff';ctx.fillRect(-93,-37,2,5);ctx.fillRect(91,-37,2,5);
    ctx.restore();break}
  case 6:{
    shad(x+3,y+4,8,3.5,.26);
    ctx.fillStyle='#6b707b';rr(x-3,y+1,6,4,1.5);
    ctx.fillStyle='#343a45';ctx.fillRect(x-2,y-45,4,47);
    ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(x-2,y-45,1.4,47);
    const wv=Math.sin(raceTime*5+x)*3;
    ctx.fillStyle='#1f7bff';ctx.beginPath();
    ctx.moveTo(x+2,y-45);ctx.quadraticCurveTo(x+18,y-43+wv*.3,x+30,y-44+wv);ctx.lineTo(x+30,y-30+wv*.6);ctx.quadraticCurveTo(x+17,y-28-wv*.2,x+2,y-31);ctx.closePath();ctx.fill();
    ctx.fillStyle='#f3f8ff';for(let i=0;i<3;i++)for(let j=0;j<2;j++){if((i+j)&1)continue;ctx.fillRect(x+4+i*8,y-43+j*6+(i?wv*.2:0),7,6)}
    ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.moveTo(x+2,y-45);ctx.quadraticCurveTo(x+18,y-43+wv*.3,x+30,y-44+wv);ctx.lineTo(x+30,y-40+wv);ctx.quadraticCurveTo(x+17,y-38+wv*.2,x+2,y-40);ctx.closePath();ctx.fill();
    ctx.fillStyle='#ffd23f';circ(x-2,y-45,2.4,'#ffd23f');
    break}
  case 7:{
    shad(x+3,y+4,s+5,(s+5)*.48,.3);
    for(let i=0;i<3;i++){
      const yy=y-i*6;
      circ(x,yy,s,'#111216');circ(x,yy,s*.76,'#2e3038');circ(x,yy,s*.44,'#0a0b0e');
      ctx.strokeStyle='rgba(255,255,255,.17)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,yy,s*.82,-2.5,-1.15);ctx.stroke();
      ctx.strokeStyle='rgba(79,195,255,.35)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,yy,s*.62,1.1,1.9);ctx.stroke();
    }
    ctx.fillStyle='#e8edf5';ctx.fillRect(x-s,y-20,2,8);ctx.fillRect(x+s-2,y-20,2,8);
    break}
  case 8:{
    const r=s*.8;
    shad(x+s*.15,y+s*.35,r*1.3,r*.55,.22);
    circ(x-r*.28,y+r*.05,r*.72,'#144a24');
    circ(x+r*.03,y-r*.05,r*.68,'#1d6b31');
    circ(x-r*.5,y+r*.1,r*.42,'#1a602b');
    circ(x+r*.42,y+r*.2,r*.38,'#2a8540');
    circ(x-r*.3,y-r*.22,r*.38,'#2e9446');
    ctx.fillStyle='rgba(190,255,190,.18)';ctx.beginPath();ctx.ellipse(x-r*.35,y-r*.35,r*.24,r*.14,-.5,0,6.3);ctx.fill();
    if(h2>.55){for(let i=0;i<3;i++){ctx.fillStyle=['#f5f0c8','#9be7ff','#ffb3d9'][i];circ(x-5+hsh(x,i)*10,y-4+hsh(y,i)*8,1.4,['#f5f0c8','#9be7ff','#ffb3d9'][i])}}
    ctx.strokeStyle=dec===2?'rgba(140,110,60,.5)':'rgba(60,120,65,.6)';ctx.lineWidth=1.2;ctx.beginPath();
    for(let i=0;i<4;i++){const gx=x-r*1.2+hsh(x+i,y)*r*2.4;ctx.moveTo(gx,y+r*.8);ctx.lineTo(gx+1.5,y+r*.4)}ctx.stroke();
    break}
  case 9:{
    ctx.save();ctx.translate(x,y);
    ctx.fillStyle='rgba(0,0,0,.32)';ctx.fillRect(-65,19,138,12);
    ctx.fillStyle='#2a303b';ctx.fillRect(-58,8,5,26);ctx.fillRect(53,8,5,26);
    ctx.strokeStyle='#3b424f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-56,28);ctx.lineTo(-42,8);ctx.moveTo(56,28);ctx.lineTo(42,8);ctx.stroke();
    let pg=ctx.createLinearGradient(0,-24,0,20);pg.addColorStop(0,'#123b6d');pg.addColorStop(.55,'#081c38');pg.addColorStop(1,'#050d1b');
    ctx.fillStyle=pg;ctx.fillRect(-70,-23,140,44);
    ctx.strokeStyle='rgba(79,195,255,.7)';ctx.lineWidth=1.8;ctx.strokeRect(-70,-23,140,44);
    ctx.strokeStyle='rgba(155,231,255,.22)';ctx.lineWidth=1;ctx.strokeRect(-66,-19,132,36);
    ctx.fillStyle='rgba(79,195,255,.85)';ctx.fillRect(-70,-23,140,2);
    ctx.fillStyle='rgba(255,255,255,.08)';ctx.beginPath();ctx.moveTo(-66,-17);ctx.lineTo(20,-19);ctx.lineTo(-20,17);ctx.lineTo(-66,17);ctx.closePath();ctx.fill();
    ctx.fillStyle='#eef8ff';ctx.textAlign='center';ctx.font='900 11px Arial';ctx.fillText('COLÉGIO',0,-5,124);
    ctx.fillStyle='#9be7ff';ctx.font='900 9px Arial';ctx.fillText('BARBOSA FERRAZ',0,6,124);
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='700 4.5px Arial';ctx.fillText('IVAIPORÃ · PARANÁ',0,14,110);
    ctx.fillStyle='rgba(79,195,255,.5)';circ(-60,-18,1.5,'rgba(79,195,255,.5)');circ(60,-18,1.5,'rgba(79,195,255,.5)');
    ctx.restore();break}
  case 10:{
    const ht=s;
    shad(x+3,y+4,s*.55,4.5,.24);
    ctx.fillStyle='#2d6f3a';rr(x-5,y-ht,10,ht+5,5);
    ctx.fillStyle='#3c8c49';rr(x-3.4,y-ht+2,4.3,ht-1,2);
    ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x-1.3,y-ht+3,1.2,ht-4);
    ctx.strokeStyle='rgba(20,70,32,.55)';ctx.lineWidth=.8;ctx.beginPath();
    for(let i=-1;i<=1;i++){ctx.moveTo(x+i*2.4,y-ht+4);ctx.lineTo(x+i*2.4,y+1)}ctx.stroke();
    ctx.fillStyle='#2d6f3a';rr(x-13,y-ht*.6,9,4.5,2.2);rr(x-13,y-ht*.72,4.5,11,2.2);
    rr(x+5,y-ht*.42,8,4.5,2.2);rr(x+9,y-ht*.55,4.5,10,2.2);
    ctx.fillStyle='rgba(255,255,255,.13)';ctx.fillRect(x-12,y-ht*.56,7,.8);ctx.fillRect(x+6,y-ht*.38,6,.8);
    if(h2>.55){ctx.fillStyle=['#ff8fb3','#ffd23f','#f5f0c8'][((x|0)%3+3)%3];circ(x,y-ht-2,2.2,['#ff8fb3','#ffd23f','#f5f0c8'][((x|0)%3+3)%3]);circ(x,y-ht-2,.8,'#fff6d0')}
    ctx.fillStyle='#9c8a68';circ(x-9,y+3,1.6,'#9c8a68');circ(x+10,y+2,2,'#9c8a68');
    break}
  case 11:{
    const r=s*1.5;
    ctx.fillStyle='rgba(120,90,45,.1)';ctx.beginPath();ctx.ellipse(x+4,y+s*.14,r,s*.55,0,0,6.3);ctx.fill();
    ctx.fillStyle='rgba(255,232,180,.2)';ctx.beginPath();ctx.ellipse(x,y,r,s*.62,0,0,6.3);ctx.fill();
    ctx.fillStyle='rgba(255,246,212,.18)';ctx.beginPath();ctx.ellipse(x-s*.18,y-s*.13,r*.72,s*.36,0,0,6.3);ctx.fill();
    ctx.strokeStyle='rgba(150,115,60,.2)';ctx.lineWidth=1.2;ctx.beginPath();
    for(let i=0;i<3;i++){const yy=y-s*.3+i*s*.3;ctx.moveTo(x-r*.55,yy);ctx.quadraticCurveTo(x,yy-5,x+r*.55,yy)}ctx.stroke();
    ctx.strokeStyle='rgba(110,90,50,.5)';ctx.lineWidth=1.2;ctx.beginPath();
    for(let i=0;i<4;i++){const gx=x-r*.5+hsh(x+i,y)*r;ctx.moveTo(gx,y+s*.4);ctx.lineTo(gx+1,y+s*.15)}ctx.stroke();
    break}
  case 13:{
    const w=s,d=s*.7,wh=s*.34;
    ctx.fillStyle='rgba(80,60,32,.16)';ctx.beginPath();ctx.ellipse(x+w*.22,y+d*.9,w*1.35,d*.86,0,0,6.3);ctx.fill();
    shad(x+w*.2,y+d*.62,w*1.24,d*.72,.3);
    if(dec===2){
      ctx.fillStyle='rgba(120,88,45,.3)';ctx.beginPath();ctx.ellipse(x-w*.8,y+d*.55,w*.7,d*.45,.3,0,6.3);ctx.fill();
      ctx.fillStyle='#b48653';ctx.fillRect(x-w,y-d,w*2,d*2-wh);
      ctx.fillStyle='#caa06d';ctx.fillRect(x-w,y-d,w*2,d*.42);
      ctx.fillStyle='#9a6c40';ctx.fillRect(x-w,y-d,w*2,2.5);
      ctx.fillStyle='#a97a49';ctx.fillRect(x-w,y-d,w*2,d*2-wh);
      ctx.strokeStyle='rgba(85,52,26,.55)';ctx.lineWidth=1.2;ctx.strokeRect(x-w,y-d,w*2,d*2-wh);
      ctx.strokeStyle='rgba(255,228,180,.16)';ctx.lineWidth=1;ctx.strokeRect(x-w+4,y-d+4,w*2-8,d*2-wh-8);
      ctx.fillStyle='#85582f';ctx.fillRect(x-w,y+d-wh,w*2,wh);
      ctx.fillStyle='#6f4826';ctx.fillRect(x-w,y+d-wh,w*2,2);
      ctx.fillStyle='#4a2d18';ctx.fillRect(x-w*.22,y+d-wh*.9,w*.42,wh*.9);
      ctx.fillStyle='#cf8f4d';ctx.fillRect(x-w*.12,y+d-wh*.72,w*.1,wh*.42);
      ctx.fillStyle='#3a2c1e';ctx.fillRect(x+w*.28,y+d-wh*.68,w*.22,wh*.46);
      ctx.fillStyle='rgba(255,215,145,.3)';ctx.fillRect(x+w*.3,y+d-wh*.64,w*.18,wh*.28);
      ctx.strokeStyle='#6a4527';ctx.lineWidth=1.4;ctx.beginPath();for(let i=0;i<4;i++){const yy=y+d-wh*.55-i*2.2;ctx.moveTo(x+w*.1,yy);ctx.lineTo(x+w*.66,yy)}ctx.stroke();
      ctx.strokeStyle='rgba(80,50,25,.5)';ctx.lineWidth=1;ctx.beginPath();
      for(let i=0;i<3;i++){ctx.moveTo(x-w*.72,y-d*.58+i*d*.28);ctx.lineTo(x-w*.45,y-d*.54+i*d*.28)}
      ctx.stroke();
      ctx.fillStyle='#9b6d3e';ctx.fillRect(x+w*.46,y-d*.66,w*.16,d*.5);
      ctx.fillStyle='#6f4826';ctx.fillRect(x+w*.46,y-d*.66,w*.16,2);
      ctx.strokeStyle='#5c3a20';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x+w*.5,y-d*.62);ctx.lineTo(x+w*.5,y-d*.22);ctx.moveTo(x+w*.58,y-d*.62);ctx.lineTo(x+w*.58,y-d*.22);ctx.stroke();
      ctx.fillStyle='#958160';circ(x-w*.55,y-d*.18,w*.17,'#958160');ctx.fillStyle='#b9a681';circ(x-w*.55,y-d*.2,w*.12,'#b9a681');
      ctx.fillStyle='rgba(100,70,38,.5)';for(let i=0;i<5;i++)circ(x-w*.9+hsh(x,i)*w*1.8,y+d*.3+hsh(y,i)*d*.5,1.2+hsh(i,y)*1.4,'rgba(100,70,38,.5)');
    }else{
      for(let i=0;i<3;i++){const yy=y-d+i*d*.31;ctx.fillStyle=i===1?'#7a4e2b':'#654023';ctx.fillRect(x-w,yy,w*2,d*.36)}
      ctx.fillStyle='rgba(255,220,160,.12)';ctx.fillRect(x-w,y-d,w*2,d*.3);
      ctx.strokeStyle='rgba(38,23,12,.5)';ctx.lineWidth=1;ctx.beginPath();
      for(let i=0;i<5;i++){const yy=y-d+5+i*d*.38;ctx.moveTo(x-w+3,yy);ctx.lineTo(x+w-3,yy)}ctx.stroke();
      ctx.strokeStyle='rgba(45,28,14,.5)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x-w,y-d*.46);ctx.lineTo(x+w,y-d*.46);ctx.stroke();
      ctx.fillStyle='#6c6257';ctx.fillRect(x+w*.34,y-d*.75,w*.24,d*.3);
      ctx.fillStyle='#3e3831';ctx.fillRect(x+w*.37,y-d*.74,w*.18,d*.23);
      ctx.fillStyle='#7d7062';ctx.fillRect(x+w*.36,y-d*.77,w*.2,2);
      ctx.fillStyle='#5a3a21';ctx.fillRect(x-w,y+d-wh,w*2,wh);
      ctx.fillStyle='#7b512e';ctx.fillRect(x-w,y+d-wh,w*2,2.4);
      ctx.strokeStyle='rgba(40,24,12,.55)';ctx.lineWidth=1;ctx.beginPath();
      for(let i=0;i<3;i++){const yy=y+d-wh+5+i*4;ctx.moveTo(x-w+2,yy);ctx.lineTo(x+w-2,yy)}ctx.stroke();
      ctx.fillStyle='#3f2816';ctx.fillRect(x-w*.18,y+d-wh*.92,w*.34,wh*.92);
      ctx.fillStyle='#d7b47a';ctx.fillRect(x-w*.1,y+d-wh*.7,w*.18,wh*.38);
      ctx.fillStyle='rgba(255,215,145,.34)';ctx.fillRect(x+w*.26,y+d-wh*.72,w*.24,wh*.4);
      ctx.fillStyle='#2b1b0e';ctx.fillRect(x+w*.26,y+d-wh*.7,w*.24,1.6);
      ctx.strokeStyle='#5f4428';ctx.lineWidth=1.1;ctx.beginPath();for(let i=0;i<3;i++){const xx=x-w*.26-i*3;ctx.moveTo(xx,y+d-wh*.6);ctx.lineTo(xx,y+d-wh*.3)}ctx.stroke();
      ctx.fillStyle='rgba(45,30,16,.55)';ctx.fillRect(x-w*.95,y+d-wh-5,w*1.9,7);
      ctx.fillStyle='#6f4a29';ctx.fillRect(x-w*.9,y+d-wh-1,w*.1,5);ctx.fillRect(x+w*.8,y+d-wh-1,w*.1,5);
      ctx.fillStyle='#5c3a20';for(let i=0;i<4;i++){circ(x-w*.92+i*3,y+d-wh*.18,1.5,'#5c3a20');circ(x+w*.92-i*3,y+d-wh*.18,1.5,'#5c3a20')}
      ctx.fillStyle='#4a2f18';ctx.fillRect(x-w*.82,y+d-wh*.72,w*.18,wh*.55);
      ctx.fillStyle='#8f6a3d';ctx.fillRect(x+w*.54,y+d-wh*.7,w*.18,wh*.5);
      ctx.strokeStyle='#6d4a29';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+w*.6,y+d-wh*.64);ctx.lineTo(x+w*.66,y+d-wh*.64);ctx.moveTo(x+w*.6,y+d-wh*.5);ctx.lineTo(x+w*.66,y+d-wh*.5);ctx.stroke();
      ctx.fillStyle='rgba(80,55,30,.35)';ctx.beginPath();ctx.ellipse(x-w*1.15,y+d*.6,w*.5,d*.28,.2,0,6.3);ctx.fill();
    }
    break}
  case 12:{
    if(dec===0){
      const v=hsh(x+3,y-2);
      if(v<.4){
        shad(x+2,y+3,6,2.5,.25);
        ctx.fillStyle='#2f6f9f';rr(x-3,y-9,6,11,2.5);
        ctx.fillStyle='#4f9bc8';rr(x-2,y-9,2.2,11,1.2);
        ctx.fillStyle='#d7e6f2';ctx.fillRect(x-5,y-7,10,2);ctx.fillRect(x-5.5,y-3,11,2);
        ctx.fillStyle='#1d4f72';circ(x,y-10,2,'#1d4f72');
      }else if(v<.72){
        shad(x+2,y+3,6,2.4,.25);
        ctx.fillStyle='#2b313c';rr(x-4.5,y-7,9,10,2);
        ctx.fillStyle='#3f4755';rr(x-5,y-8,10,3,1.5);
        ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x-2.5,y-6.5,5,1.2);
        ctx.fillStyle='#151a21';circ(x-3,y+3,1,'#151a21');circ(x+3,y+3,1,'#151a21');
      }else{
        shad(x+2,y+3,9,2.4,.22);
        ctx.fillStyle='#6b4a2c';ctx.fillRect(x-9,y-4,18,2.5);ctx.fillRect(x-9,y,18,2.5);ctx.fillRect(x-9,y-8,18,2.5);
        ctx.fillStyle='#333a44';ctx.fillRect(x-7,y-6,2,10);ctx.fillRect(x+5,y-6,2,10);
      }
    }else if(dec===1){
      const cols=['#f5f0c8','#9be7ff','#ffb3d9','#ffd23f'];
      for(let i=0;i<6;i++){
        const fx=x-7+hsh(x+i,y)*14,fy=y-2+hsh(y+i,x)*10;
        ctx.strokeStyle='rgba(70,140,70,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(fx,y+4);ctx.lineTo(fx,fy);ctx.stroke();
        ctx.fillStyle=cols[i%4];circ(fx,fy,1.5,cols[i%4]);
      }
      ctx.strokeStyle='rgba(80,160,80,.55)';ctx.lineWidth=1;ctx.beginPath();
      for(let i=0;i<4;i++){const gx=x-7+i*4;ctx.moveTo(gx,y+5);ctx.lineTo(gx+1,y)}ctx.stroke();
    }else{
      ctx.fillStyle='rgba(110,90,50,.55)';
      for(let i=0;i<4;i++)circ(x-6+hsh(x,i)*12,y+2+hsh(y,i)*5,1.2+hsh(i,y)*1.3,'rgba(110,90,50,.55)');
      ctx.strokeStyle='rgba(150,130,75,.6)';ctx.lineWidth=1;ctx.beginPath();
      for(let i=0;i<4;i++){const gx=x-6+i*4;ctx.moveTo(gx,y+5);ctx.lineTo(gx+1,y-1)}ctx.stroke();
    }
    break}
  }
}

function draw(){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,TH.g[0]);sky.addColorStop(1,shade(TH.g[0].length===7?TH.g[0]:'#222222',.7));ctx.fillStyle=TH.g[0];ctx.fillRect(0,0,W,H);
  const cx=cam.x+(Math.random()-.5)*shake*28,cy=cam.y+(Math.random()-.5)*shake*28;
  ctx.setTransform(DPR*sc,0,0,DPR*sc,DPR*(W/2-cx*sc),DPR*(H/2-cy*sc));
  const hw=W/2/sc+140,hh=H/2/sc+140,vis=(x,y,m)=>Math.abs(x-cam.x)<hw+m&&Math.abs(y-cam.y)<hh+m,g=180;
  ctx.fillStyle=TH.g[1];ctx.fillRect(cam.x-hw,cam.y-hh,hw*2,hh*2);
  const gx0=Math.floor((cam.x-hw)/g),gx1=Math.floor((cam.x+hw)/g),gy0=Math.floor((cam.y-hh)/g),gy1=Math.floor((cam.y+hh)/g);
  for(let gx=gx0;gx<=gx1;gx++)for(let gy=gy0;gy<=gy1;gy++){
    const px=gx*g+90,py=gy*g+90;
    if(!vis(px,py,120))continue;
    const a=hsh(gx*2.7,gy*4.1);
    if(TH.deco===0){
      ctx.strokeStyle='rgba(255,255,255,.026)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(gx*g,gy*g);ctx.lineTo(gx*g+g,gy*g);ctx.lineTo(gx*g+g,gy*g+g);ctx.stroke();
      if(a>.62){ctx.fillStyle='rgba(0,0,0,.075)';ctx.beginPath();ctx.ellipse(px+20,py-12,66,30,a*2.7,0,6.3);ctx.fill()}
      if(a>.84){ctx.strokeStyle='rgba(255,255,255,.055)';ctx.lineWidth=1.5;ctx.beginPath();for(let i=0;i<3;i++){ctx.moveTo(px-48+i*28,py-18);ctx.lineTo(px-48+i*28,py+24)}ctx.stroke()}
      if(a<.12){ctx.fillStyle='rgba(0,0,0,.16)';circ(px,py,7,'rgba(0,0,0,.16)');ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(px,py,5,0,6.3);ctx.stroke()}
      if(a>.45&&a<.5){ctx.fillStyle='rgba(60,120,70,.11)';ctx.beginPath();ctx.ellipse(px-40,py+30,34,16,0,0,6.3);ctx.fill()}
    }else if(TH.deco===1){
      if(a>.18){ctx.fillStyle=a>.58?'rgba(48,112,46,.21)':'rgba(12,58,24,.18)';ctx.beginPath();ctx.ellipse(px+hsh(gx,gy)*44-22,py+hsh(gy,gx)*34-17,42+a*62,18+a*25,a*2.5,0,6.3);ctx.fill()}
      if(a>.58){ctx.strokeStyle='rgba(92,165,82,.42)';ctx.lineWidth=1.1;ctx.beginPath();for(let i=0;i<5;i++){const tx=px-16+hsh(gx+i,gy)*32,ty=py+6+hsh(gy+i,gx)*12;ctx.moveTo(tx,ty);ctx.lineTo(tx+1,ty-5-hsh(i,gx)*7)}ctx.stroke();
        if(a>.9){const cols=['#f5f0c8','#9be7ff','#ffb3d9'],col=cols[((gx|0)%3+3)%3];circ(px+8,py-8,1.8,col);circ(px-14,py+2,1.4,col)}}
      if(a<.18){ctx.fillStyle='rgba(96,74,43,.2)';ctx.beginPath();ctx.ellipse(px,py,24+a*30,8+a*11,.5,0,6.3);ctx.fill();ctx.fillStyle='rgba(130,103,63,.22)';circ(px+9,py+2,1.5,'rgba(130,103,63,.22)');circ(px-7,py-3,1.1,'rgba(130,103,63,.22)')}
      if(a>.72){ctx.fillStyle='rgba(134,94,46,.32)';for(let i=0;i<5;i++)circ(px-24+hsh(gx+i,gy)*48,py-20+hsh(gy+i,gx)*40,1+hsh(i,px)*1.7,'rgba(134,94,46,.32)')}
      if(a>.34&&a<.4){ctx.strokeStyle='rgba(95,68,38,.34)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px-12,py+8);ctx.lineTo(px+4,py-5);ctx.lineTo(px+15,py-3);ctx.stroke()}
    }else{
      ctx.fillStyle=a>.55?'rgba(255,238,196,.12)':'rgba(110,82,40,.08)';ctx.beginPath();ctx.ellipse(px+hsh(gx,gy)*56-28,py+hsh(gy,gx)*34-17,68+a*50,23+a*18,a*2,0,6.3);ctx.fill();
      if(a>.34){ctx.strokeStyle='rgba(150,115,60,.2)';ctx.lineWidth=1.4;ctx.beginPath();for(let i=0;i<3;i++){const yy=py-18+i*16;ctx.moveTo(px-55,yy);ctx.quadraticCurveTo(px,yy-6,px+55,yy)}ctx.stroke()}
      if(a>.86){ctx.fillStyle='rgba(110,88,55,.38)';circ(px+18,py+8,2.2,'rgba(110,88,55,.38)');circ(px-10,py-4,1.4,'rgba(110,88,55,.3)')}
    }
  }

  /* ombro e calçada */
  ctx.lineJoin='round';ctx.lineCap='round';ctx.setLineDash([]);
  ctx.lineWidth=TW+72;ctx.strokeStyle='rgba(0,0,0,.24)';ctx.stroke(TP);
  ctx.lineWidth=TW+66;ctx.strokeStyle=TH.sh;ctx.stroke(TP);
  if(TH.deco===0){
    ctx.strokeStyle='rgba(55,62,74,.38)';ctx.lineWidth=1.4;ctx.beginPath();
    for(let k=0;k<N;k+=9){
      const p=T[k],sx=-Math.sin(p.a),sy=Math.cos(p.a);
      for(let sg=-1;sg<=1;sg+=2){
        const d1=TW/2+17,d2=TW/2+32;
        const x1=p.x+sx*sg*d1,y1=p.y+sy*sg*d1,x2=p.x+sx*sg*d2,y2=p.y+sy*sg*d2;
        if(!vis(x1,y1,24))continue;
        ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
      }
    }
    ctx.stroke();
  }else if(TH.deco===1){
    for(let k=0;k<N;k+=13){for(let sg=-1;sg<=1;sg+=2){const q=worldAt(k,sg,TW/2+25);if(!vis(q[0],q[1],30))continue;ctx.fillStyle='rgba(90,65,35,.22)';ctx.beginPath();ctx.ellipse(q[0],q[1],5,2,q[2],0,6.3);ctx.fill()}}
  }else{
    for(let k=0;k<N;k+=11){for(let sg=-1;sg<=1;sg+=2){const q=worldAt(k,sg,TW/2+23);if(!vis(q[0],q[1],30))continue;ctx.fillStyle='rgba(255,235,190,.22)';ctx.beginPath();ctx.ellipse(q[0],q[1],7,2.6,q[2],0,6.3);ctx.fill()}}
  }

  /* meio-fio e asfalto */
  const curbBase=TH.deco===2?'#efe4cf':'#eef0f2';
  ctx.lineCap='butt';ctx.setLineDash([]);
  ctx.lineWidth=24;ctx.strokeStyle='rgba(0,0,0,.38)';ctx.stroke(CURB[0]);ctx.stroke(CURB[1]);
  ctx.lineWidth=20;ctx.strokeStyle=curbBase;ctx.stroke(CURB[0]);ctx.stroke(CURB[1]);
  ctx.setLineDash([21,21]);ctx.lineWidth=20;ctx.strokeStyle=TH.k;ctx.stroke(CURB[0]);ctx.stroke(CURB[1]);ctx.setLineDash([]);
  ctx.lineWidth=TW;ctx.strokeStyle='rgba(0,0,0,.58)';ctx.stroke(TP);
  ctx.lineWidth=TW-2;ctx.strokeStyle=TH.as;ctx.stroke(TP);
  ctx.lineWidth=26;ctx.strokeStyle='rgba(0,0,0,.05)';ctx.stroke(RLP[0]);ctx.stroke(RLP[1]);
  ctx.lineWidth=TW*.44;ctx.strokeStyle='rgba(255,255,255,.014)';ctx.stroke(TP);
  ctx.lineWidth=TW-10;ctx.strokeStyle='rgba(245,250,255,.42)';ctx.stroke(TP);
  ctx.lineWidth=TW-14;ctx.strokeStyle=TH.as;ctx.stroke(TP);
  ctx.setLineDash([28,32]);ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,255,.27)';ctx.stroke(TP);ctx.setLineDash([]);

  /* marcas de desgaste e remendos */
  for(let i=0;i<TRACKFX.length;i++){
    const f=TRACKFX[i];
    if(!vis(f.x,f.y,56))continue;
    ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.a);
    if(f.t===0){ctx.strokeStyle='rgba(0,0,0,.28)';ctx.lineWidth=f.w;ctx.beginPath();ctx.moveTo(-f.l/2,0);ctx.lineTo(-f.l*.08,1.6);ctx.lineTo(f.l/2,-1.3);ctx.stroke()}
    else if(f.t===1){ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.ellipse(0,0,f.l/2,f.w/2,0,0,6.3);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.03)';ctx.lineWidth=1;ctx.stroke()}
    else{ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=f.w;ctx.beginPath();ctx.moveTo(-f.l/2,0);ctx.lineTo(f.l/2,0);ctx.stroke()}
    ctx.restore();
  }

  /* inscrições oficiais do colégio, pintadas no asfalto */
  if(INSC.length){
    const mw=TW-16;
    ctx.textAlign='center';ctx.textBaseline='middle';
    const paint=(txt,yy,fnt)=>{
      ctx.font=fnt;
      ctx.lineWidth=3;ctx.strokeStyle='rgba(4,9,16,.5)';ctx.strokeText(txt,0,yy,mw);
      ctx.fillStyle='rgba(246,250,255,.96)';ctx.fillText(txt,0,yy,mw);
    };
    for(let i=0;i<INSC.length;i++){
      const s=INSC[i];if(!vis(s.x,s.y,175))continue;
      ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.a);ctx.globalAlpha=.9;
      paint('COLÉGIO',-14,'900 24px "Arial Narrow",Arial,sans-serif');
      paint('BARBOSA FERRAZ',9,'900 18px "Arial Narrow",Arial,sans-serif');
      ctx.fillStyle='rgba(79,195,255,.6)';ctx.fillRect(-mw/2,21,mw,1.8);
      ctx.fillStyle='rgba(79,195,255,.22)';ctx.fillRect(-mw/2,-27,mw,1.2);
      ctx.restore();
    }
    ctx.globalAlpha=1;
  }
  if(MK.length){
    ctx.lineCap='round';
    const half=MK.length>>1;
    ctx.strokeStyle='rgba(10,10,12,.18)';ctx.lineWidth=5;ctx.beginPath();
    for(let i=0;i<half;i++){const m=MK[i];if(vis(m[0],m[1],0)){ctx.moveTo(m[0],m[1]);ctx.lineTo(m[2],m[3])}}ctx.stroke();
    ctx.strokeStyle='rgba(10,10,12,.34)';ctx.lineWidth=4;ctx.beginPath();
    for(let i=half;i<MK.length;i++){const m=MK[i];if(vis(m[0],m[1],0)){ctx.moveTo(m[0],m[1]);ctx.lineTo(m[2],m[3])}}ctx.stroke();
  }
  const s=T[0];ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.a);
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-12,-TW/2+4,TW+4,22);
  for(let r=0;r<2;r++)for(let i=0;i<TW/15;i++){ctx.fillStyle=(r+i)&1?'#f5f5f5':'#111';ctx.fillRect(-10+r*10,-TW/2+i*15,10,15)}
  ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.5;ctx.strokeRect(-10,-TW/2,TW,TW/15* Math.floor(TW/15));
  ctx.restore();
  OB.forEach(o=>{if(o.on&&o.t===2&&vis(o.x,o.y,60)){ctx.fillStyle='rgba(8,8,14,.85)';ctx.beginPath();ctx.ellipse(o.x,o.y,32,22,.4,0,6.3);ctx.fill();ctx.fillStyle='rgba(120,140,255,.16)';ctx.beginPath();ctx.ellipse(o.x-6,o.y-5,15,8,.4,0,6.3);ctx.fill();ctx.fillStyle='rgba(180,120,255,.12)';ctx.beginPath();ctx.ellipse(o.x+8,o.y+6,10,6,.4,0,6.3);ctx.fill()}});
  SC.forEach(o=>{if(vis(o.x,o.y,220))drawSC(o)});
  ctx.lineCap='butt';
  ctx.save();ctx.translate(5,6);ctx.lineWidth=9;ctx.strokeStyle='rgba(0,0,0,.3)';ctx.stroke(RAIL[0]);ctx.stroke(RAIL[1]);ctx.restore();
  ctx.lineWidth=7.5;ctx.strokeStyle='#c9ccd4';ctx.stroke(RAIL[0]);ctx.stroke(RAIL[1]);
  ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,255,.7)';ctx.stroke(RAIL[0]);ctx.stroke(RAIL[1]);
  ctx.setLineDash([26,26]);ctx.lineWidth=7.5;ctx.strokeStyle='rgba(31,123,255,.9)';ctx.stroke(RAIL[0]);ctx.stroke(RAIL[1]);ctx.setLineDash([]);
  ctx.fillStyle='#3a3d46';
  for(let k=0;k<N;k+=8){const p=T[k];for(let sg=-1;sg<=1;sg+=2){const px=p.x-Math.sin(p.a)*sg*(TW/2+34),py=p.y+Math.cos(p.a)*sg*(TW/2+34);if(!vis(px,py,30))continue;ctx.fillRect(px-2,py-6,4,12)}}
  PU.forEach(p=>{
    if(!p.on||!vis(p.x,p.y,70))return;
    const k=Math.sin(raceTime*5+p.x)*3;
    ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(p.x,p.y+15,16,5.5,0,0,6.3);ctx.fill();
    circ(p.x,p.y,28+k,'rgba('+PC[p.t]+',.2)');
    let pg=ctx.createRadialGradient(p.x-5,p.y-6,2,p.x,p.y,18);
    pg.addColorStop(0,'rgba(255,255,255,.92)');pg.addColorStop(.34,'rgb('+PC[p.t]+')');pg.addColorStop(1,'rgba(0,0,0,.38)');
    circ(p.x,p.y,18,'rgb('+PC[p.t]+')');ctx.fillStyle=pg;circ(p.x,p.y,16,pg);
    ctx.fillStyle='rgba(247,251,255,.96)';ctx.beginPath();ctx.arc(p.x,p.y,14,0,6.3);ctx.fill();
    if(schoolLogo.complete&&schoolLogo.naturalWidth>0)ctx.drawImage(schoolLogo,78,12,301,301,p.x-12,p.y-12,24,24);
    else{ctx.fillStyle='rgb('+PC[p.t]+')';ctx.font='900 15px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(PL[p.t],p.x,p.y+1)}
    ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(p.x,p.y,18,0,6.3);ctx.stroke();
    ctx.strokeStyle='rgba('+PC[p.t]+',.85)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(p.x,p.y,22+k*.4,raceTime*2,raceTime*2+4.5);ctx.stroke();
    const bx=p.x+13,by=p.y+13;
    ctx.fillStyle='rgba(4,11,22,.94)';ctx.beginPath();ctx.arc(bx,by,7.6,0,6.3);ctx.fill();
    ctx.strokeStyle='rgba('+PC[p.t]+',.95)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(bx,by,7.6,0,6.3);ctx.stroke();
    ctx.fillStyle='rgb('+PC[p.t]+')';ctx.font='900 9px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(PL[p.t],bx,by+.5);
  });
  OB.forEach(o=>{
    if(!o.on||o.t===2||!vis(o.x,o.y,60))return;
    if(o.t===0){ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(o.x+2,o.y+4,10,5,0,0,6.3);ctx.fill();let og=ctx.createRadialGradient(o.x-3,o.y-3,1,o.x,o.y,9);og.addColorStop(0,'#fff');og.addColorStop(.4,'#ff8a2a');og.addColorStop(1,'#b53a00');circ(o.x,o.y,9,'#ff6a1a');ctx.fillStyle=og;circ(o.x,o.y,8,og);circ(o.x,o.y,3,'#fff');ctx.fillStyle='rgba(255,255,255,.7)';circ(o.x-2.5,o.y-2.5,1.5,'rgba(255,255,255,.7)')}
    else if(o.t===1){ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(o.x+3,o.y+5,15,6,0,0,6.3);ctx.fill();circ(o.x,o.y,14,'#131316');circ(o.x,o.y,11,'#2e2e36');ctx.strokeStyle='#55555f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(o.x,o.y,8,0,6.3);ctx.stroke();circ(o.x,o.y,4,'#0c0c0e');ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.ellipse(o.x-4,o.y-5,5,3,-.6,0,6.3);ctx.fill()}
    else{ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.a);ctx.fillStyle='rgba(0,0,0,.32)';ctx.fillRect(-24,-3,52,16);ctx.fillStyle='#c9ccd4';ctx.fillRect(-27,-9,54,18);for(let i=0;i<4;i++){ctx.fillStyle=i&1?'#f2f2f2':'#d62a1e';ctx.fillRect(-27+i*13.5,-9,13.5,18)}ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(-27,-9,54,3);ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1.5;ctx.strokeRect(-27,-9,54,18);ctx.restore()}
  });
  P.forEach(p=>{const a=p.l/p.m;ctx.fillStyle='rgba('+p.col+','+(a*.75).toFixed(2)+')';ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.5,p.s*(1.9-a*1.2)),0,6.3);ctx.fill();if(a>.6){ctx.fillStyle='rgba(255,255,255,'+(a*.25).toFixed(2)+')';ctx.beginPath();ctx.arc(p.x,p.y,p.s*.5,0,6.3);ctx.fill()}});
  cars.filter(c=>!c.player).forEach(drawCar);cars.filter(c=>c.player).forEach(drawCar);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const pl=cars.find(c=>c.player);
  if(pl&&(pl.v>300||pl.tu)&&(state==='race'||state==='fin')){
    const n=Math.floor(Math.max(0,pl.v-300)/130*14)+(pl.tu?14:0);ctx.strokeStyle=pl.tu?'rgba(120,210,255,.3)':'rgba(255,255,255,.13)';ctx.lineWidth=2.5;ctx.beginPath();
    for(let i=0;i<n;i++){const a=Math.random()*6.283,r0=Math.min(W,H)*(.36+Math.random()*.22),r1=r0+50+Math.random()*90;ctx.moveTo(W/2+Math.cos(a)*r0,H/2+Math.sin(a)*r0);ctx.lineTo(W/2+Math.cos(a)*r1,H/2+Math.sin(a)*r1)}
    ctx.stroke();
    if(pl.tu){let vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.min(W,H)*.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(60,180,255,.14)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H)}
  }
  if(state==='count'||state==='race'||state==='paused'){
    const ms=130/Math.max(B.x1-B.x0,B.y1-B.y0),ox=W-158,oy=100+(touchOK?44:0);
    ctx.fillStyle='rgba(4,14,28,.8)';rr(ox-10,oy-10,(B.x1-B.x0)*ms+20,(B.y1-B.y0)*ms+20,8);
    ctx.strokeStyle='rgba(79,195,255,.32)';ctx.lineWidth=1.5;rr(ox-10,oy-10,(B.x1-B.x0)*ms+20,(B.y1-B.y0)*ms+20,8);ctx.stroke();
    ctx.setTransform(DPR*ms,0,0,DPR*ms,DPR*(ox-B.x0*ms),DPR*(oy-B.y0*ms));
    ctx.setLineDash([]);ctx.lineWidth=7/ms;ctx.strokeStyle='rgba(0,0,0,.55)';ctx.stroke(TP);
    ctx.lineWidth=5/ms;ctx.strokeStyle='#7da6d8';ctx.stroke(TP);
    ctx.lineWidth=1.4/ms;ctx.strokeStyle='rgba(79,195,255,.35)';ctx.stroke(TP);
    cars.forEach(c=>{circ(c.x,c.y,(c.player?6:4.5)/ms,c.col);if(c.player){ctx.strokeStyle='#fff';ctx.lineWidth=2/ms;ctx.beginPath();ctx.arc(c.x,c.y,6/ms,0,6.3);ctx.stroke()}});
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.fillStyle='rgba(190,225,255,.72)';ctx.font='700 9px Arial';ctx.textAlign='left';ctx.fillText(TH.n,ox-6,oy-14);
  }
}

/* ---------- Loop e entrada ---------- */
let last=0;
function loop(t){const dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(loop)}
function rs(){DPR=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR}
addEventListener('resize',rs);rs();
const KM={KeyW:'u',ArrowUp:'u',KeyS:'d',ArrowDown:'d',KeyA:'l',ArrowLeft:'l',KeyD:'r',ArrowRight:'r',Space:'s',ShiftLeft:'t',ShiftRight:'t'};
addEventListener('keydown',e=>{
  if(curScr==='how'){
    if(e.code==='ArrowRight'){e.preventDefault();tutGo(1);return}
    if(e.code==='ArrowLeft'){e.preventDefault();tutGo(-1);return}
    if(e.code==='Escape'){e.preventDefault();closeTut();return}
    return;
  }
  if(curScr==='sel'||curScr==='times'){
    if(e.code==='Escape'){e.preventDefault();show('menu');ui();return}
  }
  if(KM[e.code]){K[KM[e.code]]=1;e.preventDefault()}
  if(e.code==='Escape'){if(state==='race'||state==='count')pause();else if(state==='paused')resume()}
});
addEventListener('keyup',e=>{if(KM[e.code])K[KM[e.code]]=0});
addEventListener('blur',()=>{K.u=K.d=K.l=K.r=K.s=K.t=0;pause()});
addEventListener('touchstart',()=>{if(!touchOK){touchOK=true;document.body.classList.add('tch');ui()}},{passive:true});
if(touchOK)document.body.classList.add('tch');
document.querySelectorAll('[data-k]').forEach(b=>{
  const k=b.dataset.k,on=e=>{e.preventDefault();K[k]=1;b.classList.add('d')},off=e=>{e.preventDefault();K[k]=0;b.classList.remove('d')};
  b.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,off));
});
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('click',e=>{aud();if(e.target.blur)e.target.blur()});
$('bplay').onclick=()=>{if(mode===1){round=0;pts={}}startRace()};
$('bmode').onclick=()=>openSel('mode');$('bdiff').onclick=()=>openSel('diff');$('bcar').onclick=()=>openSel('car');$('btrk').onclick=()=>openSel('trk');
$('selb').onclick=()=>{show('menu');ui()};
$('btm').onclick=()=>{$('tl').innerHTML=TR.map((t,i)=>'<span>'+t.n+'</span><em>'+(bt[i]?fmt(bt[i]):'--')+'</em>').join('');show('times')};
$('tback').onclick=()=>{show('menu');ui()};
$('bhow').onclick=openTut;
$('tprev').onclick=()=>tutGo(-1);
$('tnext').onclick=()=>{if(tutPage<TUTN-1)tutGo(1);else{markTutSeen();closeTut()}};
$('tutback').onclick=closeTut;$('tclose').onclick=closeTut;
$('pb').onclick=pause;$('bres').onclick=resume;$('brst').onclick=startRace;
$('bagain').onclick=()=>{if(mode===1){if(round<2)round++;else{round=0;pts={}}}startRace()};
$('bmenu1').onclick=$('bmenu2').onclick=()=>{if(mode===1&&state!=='fin'){round=0;pts={}}demo()};
demo();requestAnimationFrame(loop);
