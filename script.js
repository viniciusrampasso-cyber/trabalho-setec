const $=id=>document.getElementById(id),cv=$('c'),ctx=cv.getContext('2d'),TW=150,K={u:0,d:0,l:0,r:0,s:0,t:0};
let W,H,DPR,state='menu',prev='',cars=[],P=[],MK=[],raceTime=0,cd=0,goT=0,sc=.8,cam={x:0,y:0},curCd='',shake=0,colT=0,touchOK=matchMedia('(pointer:coarse)').matches;
let mode=0,trk=0,ctype=0,round=0,pts={},T=[],N=0,B,TH,TP,SC=[],OB=[],PU=[],RAIL=[],bt={},diff=1;
try{bt=JSON.parse(localStorage.getItem('turborace_bt')||'{}')}catch(e){}
const sv=()=>{try{localStorage.setItem('turborace_bt',JSON.stringify(bt))}catch(e){}};
const nang=a=>Math.atan2(Math.sin(a),Math.cos(a)),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=t=>{const m=Math.floor(t/60),s=Math.floor(t%60),ms=Math.floor(t*1000%1000);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(ms).padStart(3,'0')};

/* ---------- Dados ---------- */
const TR=[
{n:'CIRCUITO URBANO',d:'Cidade, retas largas e curvas de 90°.',deco:0,g:['#454b55','#4c525c'],as:'#2b2c33',k:'#1f7bff',dust:'130,130,140',cp:[[0,0],[1200,0],[2200,-100],[2900,300],[2900,1000],[2400,1500],[1700,1300],[1200,1700],[400,2000],[-500,1900],[-1000,1300],[-900,600],[-500,200]]},
{n:'CIRCUITO FLORESTAL',d:'Muitas curvas e um grampo fechado.',deco:1,g:['#1f6a2a','#1c6026'],as:'#34363b',k:'#1f7bff',dust:'90,140,60',cp:[[0,0],[1000,-60],[1900,-400],[2700,-200],[3100,400],[2600,900],[1900,700],[1500,1200],[2000,1800],[1400,2300],[500,2100],[-200,2400],[-1000,2000],[-900,1200],[-1400,700],[-1000,100]]},
{n:'CIRCUITO DESERTO',d:'Alta velocidade e curvas longas.',deco:2,g:['#dbb673','#d2ab68'],as:'#3a3835',k:'#e8742a',dust:'205,170,105',cp:[[0,0],[1500,0],[3000,-100],[3800,400],[3700,1100],[3000,1400],[2900,2000],[2100,2300],[1500,1900],[1000,2300],[200,2100],[-600,2300],[-1200,1700],[-1000,900],[-600,500],[-1100,100]]}];
const PT=[{n:'EQUILIBRADO',d:'Bom em tudo.',mx:430,ac:380,tr:3,brk:680,gr:1,b:[.7,.7,.7]},{n:'RÁPIDO',d:'Maior velocidade final, curva menos.',mx:460,ac:320,tr:2.7,brk:620,gr:.95,b:[1,.5,.55]},{n:'ACELERAÇÃO',d:'Sai das curvas rápido.',mx:415,ac:480,tr:3,brk:700,gr:1,b:[.6,1,.65]},{n:'CONTROLE',d:'Faz curvas e drifts com facilidade.',mx:425,ac:370,tr:3.45,brk:720,gr:1.08,b:[.65,.65,1]}];
const MODES=[{n:'CORRIDA RÁPIDA',d:'3 voltas contra 7 rivais.'},{n:'CAMPEONATO',d:'3 pistas, pontos pela posição final.'},{n:'CONTRARRELÓGIO',d:'Sozinho contra o cronômetro.'}];
const DIFFS=[{n:'FÁCIL',d:'Rivais erram mais e reagem devagar.',err:1.6,prec:.72,aggr:.55,react:.6},{n:'MÉDIO',d:'Disputa equilibrada.',err:1,prec:.88,aggr:.8,react:.85},{n:'DIFÍCIL',d:'Melhor trajetória, frenagem e pressão.',err:.55,prec:.96,aggr:1,react:1},{n:'EXTREMO',d:'Poucos erros, sem trapaça física.',err:.3,prec:1,aggr:1.1,react:1.15}];
const PER={aggr:{ov:.9,def:.5,err:1.3,lane:.9},tech:{ov:.55,def:.6,err:.6,lane:.5},strat:{ov:.7,def:.9,err:.7,lane:.6},speed:{ov:.65,def:.5,err:.9,lane:.7},chaos:{ov:.8,def:.7,err:1.1,lane:1}};
const AIS=[
 {n:'ROSSO',col:'#d90429',mx:432,ac:372,tr:2.95,brk:660,gr:.98,sty:4,per:'aggr',d:'Agressivo · pressiona, busca ultrapassagem, arrisca.'},
 {n:'VORTEX',col:'#ff7a1a',mx:418,ac:385,tr:3.15,brk:700,gr:1.04,sty:5,per:'tech',d:'Técnico · frenagem precisa e trajetória limpa.'},
 {n:'AURUM',col:'#ffc21a',mx:422,ac:368,tr:3.1,brk:710,gr:1.03,sty:6,per:'strat',d:'Estrategista · ataca no trecho bom, defende posição.'},
 {n:'TORO',col:'#22c55e',mx:428,ac:378,tr:2.9,brk:640,gr:.97,sty:7,per:'speed',d:'Velocista · forte em retas, sofre no grampo.'},
 {n:'ROYALE',col:'#1f7bff',mx:435,ac:360,tr:2.9,brk:650,gr:1,sty:8,per:'speed',d:'Hipercarro · final alta, frenagem longa.'},
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
  B={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};
  T.forEach(p=>{B.x0=Math.min(B.x0,p.x);B.y0=Math.min(B.y0,p.y);B.x1=Math.max(B.x1,p.x);B.y1=Math.max(B.y1,p.y)});
  TP=new Path2D();T.forEach((p,k)=>k?TP.lineTo(p.x,p.y):TP.moveTo(p.x,p.y));TP.closePath();
  let sd=i*977+13;const R=()=>(sd=sd*16807%2147483647)/2147483647;
  const far=(x,y,m)=>{for(let k=0;k<N;k+=3)if(Math.hypot(x-T[k].x,y-T[k].y)<m)return false;return true};
  const at=(k,sg,d)=>{const p=T[k%N];return[p.x-Math.sin(p.a)*sg*d,p.y+Math.cos(p.a)*sg*d,p.a]};
  SC=[];RAIL=[new Path2D(),new Path2D()];
  for(let s=0;s<2;s++){const sg=s?1:-1;let on=false;
    for(let k=0;k<N;k++){
      const p=T[k];
      if(sg*p.c>.22){on=false;continue}
      const q=at(k,sg,TW/2+34);RAIL[s][on?'lineTo':'moveTo'](q[0],q[1]);on=true;
      if(Math.abs(p.c)>.3&&k%3===0){const t=at(k,sg,TW/2+48);SC.push({t:7,x:t[0],y:t[1],s:10})}
    }}
  for(let k=0;k<N;k+=5)for(let sg=-1;sg<=1;sg+=2){
    if(R()<.35)continue;
    const d=TW/2+110+R()*300,q=at(k,sg,d),dc=TH.deco,s=dc===1?30+R()*35:dc===0?50+R()*70:12+R()*24;
    if(!far(q[0],q[1],TW/2+40+s*(dc===0?1.6:1)))continue;
    if(dc===0)SC.push({t:1,x:q[0],y:q[1],s,h:40+R()*80,col:['#5d6678','#6b5f73','#4f6a73','#7a6a5a'][k%4]});
    else if(dc===1)SC.push({t:0,x:q[0],y:q[1],s});
    else SC.push({t:2,x:q[0],y:q[1],s,k:R()<.55});
  }
  for(let k=0;k<N;k+=12)for(let sg=-1;sg<=1;sg+=2){const q=at(k,sg,TW/2+54);SC.push({t:3,x:q[0],y:q[1]})}
  for(let k=20;k<N;k+=34){const q=at(k,(k/34|0)%2?1:-1,TW/2+62);SC.push({t:4,x:q[0],y:q[1],a:q[2],col:['#e10600','#1f7bff','#ffc21a','#22c55e'][k%4]})}
  [N-26,N-10,12].forEach(k=>[-1,1].forEach(sg=>{const q=at(k,sg,TW/2+104);SC.push({t:5,x:q[0],y:q[1],a:q[2]})}));
  [-1,1].forEach(sg=>{const q=at(0,sg,TW/2+46);SC.push({t:6,x:q[0],y:q[1],col:sg>0?'#1f7bff':'#fff'})});
  OB=[];
  for(let k=45;k<N-45;k+=Math.ceil(40+R()*40)){
    const r=R(),off=(R()-.5)*(TW-70),p=T[k];
    if(r<.35)for(let j=0;j<3;j++){const q=at(k+j*2,1,off);OB.push({t:0,x:q[0],y:q[1],r:9,on:1})}
    else if(r<.55){const q=at(k,1,off);OB.push({t:1,x:q[0],y:q[1],r:14,on:1})}
    else if(r<.8){const q=at(k,1,off*.6);OB.push({t:2,x:q[0],y:q[1],r:30,on:1})}
    else{const q=at(k,1,(k&1?1:-1)*(TW/2-32));OB.push({t:3,x:q[0],y:q[1],r:22,a:p.a,on:1})}
  }
  PU=[];const g=Math.floor(N/10);
  for(let j=0;j<10;j++){const q=at(j*g+25,1,(j%2?1:-1)*25);PU.push({x:q[0],y:q[1],t:Math.floor(R()*4),on:1,rt:0})}
}

/* ---------- Carros ---------- */
function mk(nm,col,mx,ac,tr,sty,slot,player,ex){
  ex=ex||{};
  const row=slot>>1,side=slot&1?1:-1,k=(N-3-row*4+N)%N,p=T[k];
  return{nm,col,mx:player?mx:mx*(.985+Math.random()*.02),ac,tr,brk:ex.brk||680,gr:ex.gr||1,per:ex.per||'tech',sty,player,human:player,x:p.x-Math.sin(p.a)*side*32,y:p.y+Math.cos(p.a)*side*32,a:p.a,d:p.a,v:0,idx:k,lap:-1,pr:-N,fin:0,ft:0,off:false,thr:0,lane:(Math.random()-.5)*70,tb:player?25:0,dr:0,boost:0,shield:0,slow:0,oil:0,drf:0,tu:0,pm:null,sT:0,stS:0,errT:2+Math.random()*4,errV:0,ovT:0,ovLane:0,defT:0};
}
function grid(pl){
  const S=[0,1,2,3,4,6,7];
  if(pl&&mode===2){const p=PT[ctype];cars=[mk('VOCÊ','#e10600',p.mx,p.ac,p.tr,ctype,0,1,{brk:p.brk,gr:p.gr})];return}
  cars=AIS.map((a,i)=>mk(a.n,a.col,a.mx,a.ac,a.tr,a.sty,S[i],0,{brk:a.brk,gr:a.gr,per:a.per}));
  if(pl){const p=PT[ctype];cars.push(mk('VOCÊ','#e10600',p.mx,p.ac,p.tr,ctype,5,1,{brk:p.brk,gr:p.gr}))}
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
function show(id){document.querySelectorAll('.scr').forEach(e=>e.classList.remove('on'));if(id)$(id).classList.add('on')}
function ui(){
  const racing=state==='count'||state==='race'||state==='paused';
  $('hud').classList.toggle('on',racing||state==='fin');
  $('touch').classList.toggle('on',touchOK&&(state==='count'||state==='race'));
  $('bm').textContent='MELHOR TEMPO · '+TR[trk].n.replace('CIRCUITO ','')+': '+(bt[trk]?fmt(bt[trk]):'--');
  $('bmode').textContent='Modo: '+MODES[mode].n;$('bdiff').textContent='Dificuldade: '+DIFFS[diff].n;$('bcar').textContent='Carro: '+PT[ctype].n;
  $('btrk').textContent=mode===1?'Pista: campeonato (3)':'Pista: '+TR[trk].n.replace('CIRCUITO ','');$('btrk').disabled=mode===1;
}
function setCd(t,col){
  const e=$('cd');
  if(t===null){e.style.display='none';curCd='';return}
  if(t!==curCd){curCd=t;e.textContent=t;e.style.color=col||'#fff';e.style.display='block';e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');snd(t==='GO!'?'go':'b3')}
}
function demo(){loadTrack(mode===1?0:trk);grid(0);state='menu';setCd(null);show('menu');ui()}
function startRace(){
  aud();loadTrack(mode===1?round:trk);grid(1);P=[];MK=[];raceTime=0;cd=3.99;goT=0;curCd='';shake=0;
  const p=cars.find(c=>c.player);cam.x=p.x;cam.y=p.y;state='count';show(null);ui();
}
function pause(){if(state==='race'||state==='count'){prev=state;state='paused';K.u=K.d=K.l=K.r=K.s=K.t=0;if(egn)egn.gain.value=0;show('pause');ui()}}
function resume(){if(state==='paused'){state=prev;show(null);ui()}}
function finish(c){
  state='fin';c.human=false;c.mx=330;c.tu=0;
  const order=[...cars].sort((a,b)=>score(b)-score(a)),pos=order.indexOf(c)+1,t=c.ft,rec=!bt[trk]||t<bt[trk];
  if(rec){bt[trk]=t;sv()}
  let tab='';
  if(mode===1){
    order.forEach((o,i)=>{pts[o.nm]=(pts[o.nm]||0)+(PTS[i]||0)});
    tab='<span>CAMPEONATO · PISTA '+(round+1)+'/3</span><span></span>'+Object.entries(pts).sort((a,b)=>b[1]-a[1]).map(([n,v],i)=>'<span style="color:'+(n==='VOCÊ'?'#ff6a60':'')+'">'+(i+1)+'. '+n+'</span><em>'+v+' pts</em>').join('');
  }
  $('rt').textContent=fmt(t);$('rp').textContent=mode===2?'—':pos+'º / '+cars.length;$('rb').textContent=fmt(bt[trk]);
  $('rec').textContent=rec?'★ NOVO RECORDE ★':'';
  $('rtab').innerHTML=tab;$('rtab').style.display=tab?'grid':'none';
  $('bagain').textContent=mode===1?(round<2?'Próxima pista':'Novo campeonato'):'Jogar novamente';
  if(egn)egn.gain.value=0;setCd(null);show('result');ui();
}
function openSel(k){
  const L=k==='car'?PT:k==='trk'?TR:k==='diff'?DIFFS:MODES,cur=k==='car'?ctype:k==='trk'?trk:k==='diff'?diff:mode;
  $('selt').textContent=k==='car'?'SELECIONAR CARRO':k==='trk'?'SELECIONAR PISTA':k==='diff'?'DIFICULDADE DOS RIVAIS':'MODOS DE JOGO';
  $('cards').innerHTML=L.map((o,i)=>'<div class="cd'+(i===cur?' on':'')+'" data-i="'+i+'" data-k="'+k+'"><b>'+o.n+'</b><p>'+o.d+'</p>'+(o.b?['VELOCIDADE','ACELERAÇÃO','CONTROLE'].map((l,j)=>'<small>'+l+'</small><div class="bar"><i style="width:'+o.b[j]*100+'%"></i></div>').join(''):'')+'</div>').join('')+(k==='car'?'<div class="box" style="max-width:min(92vw,720px)"><b style="color:#fff">RIVAIS ('+AIS.length+')</b><br>'+AIS.map(a=>'<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+a.col+';margin-right:6px"></span><b style="min-width:0;color:#fff">'+a.n+'</b> <span style="color:var(--mut)">'+a.d+' Vmax '+a.mx+' · Ace '+a.ac+' · Freio '+a.brk+'</span>').join('<br>')+'</div>':'');
  $('cards').onclick=e=>{const c=e.target.closest('.cd');if(!c)return;const i=+c.dataset.i,kk=c.dataset.k||k;if(kk==='car')ctype=i;else if(kk==='trk')trk=i;else if(kk==='diff')diff=i;else mode=i;demo()};
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
function wheel3D(x,y,steer,spin,big,cal){
  const wL=big?16:14,wW=big?8:7;
  ctx.save();ctx.translate(x,y);ctx.rotate(steer||0);
  ctx.fillStyle='rgba(0,0,0,.5)';rr(-wL/2,-wW/2+1.5,wL,wW,2.5);
  ctx.fillStyle='#0a0a0c';rr(-wL/2,-wW/2,wL,wW,2.5);
  ctx.fillStyle='#1c1c22';rr(-wL/2+1.5,-wW/2+1,wL-3,wW-2,2);
  ctx.fillStyle='#8a8d96';ctx.beginPath();ctx.arc(0,0,big?3:2.6,0,6.3);ctx.fill();
  ctx.fillStyle=cal||'#e10600';ctx.fillRect(-1,-(big?3:2.6),2.4,2);
  ctx.strokeStyle='#c9ccd4';ctx.lineWidth=1.1;ctx.beginPath();
  for(let i=0;i<5;i++){const a=spin+i*1.2567;ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*(big?3.4:3),Math.sin(a)*(big?3.4:3))}
  ctx.stroke();
  ctx.fillStyle='#55575f';ctx.beginPath();ctx.arc(0,0,1.1,0,6.3);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.3)';ctx.fillRect(-wL/2+1,-wW/2+1,wL-2,1);
  ctx.restore();
}
function drawCar(c){
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.a);
  const sp=SPEC[c.sty]||SPEC[0],L=sp.L,hw=sp.hw;
  const steer=cl(nang(c.a-c.d)*2.2+(c.stS||0)*.15,-.5,.5),spin=(raceTime*(c.v*.06)||0)%6;
  const roll=cl((c.stS||0)*cl(Math.abs(c.v)/380,0,1),-.45,.45),bdy=roll*3.2;
  ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(1,3+bdy*.4,L+14,hw+7,0,0,6.3);ctx.fill();
  if(c.tu||c.boost>0){const g=ctx.createRadialGradient(-L-8,0,2,-L-8,0,30);g.addColorStop(0,c.tu?'rgba(90,200,255,.75)':'rgba(255,210,60,.75)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(-L-10,0,26,13,0,0,6.3);ctx.fill()}
  const wy=hw+(sp.big?.8:1);
  wheel3D(sp.rx,-wy,0,spin,sp.big,sp.cal);wheel3D(sp.rx,wy,0,spin,sp.big,sp.cal);
  wheel3D(sp.fx,-wy,steer,spin,sp.big,sp.cal);wheel3D(sp.fx,wy,steer,spin,sp.big,sp.cal);
  ctx.save();ctx.translate(0,bdy);
  const base=c.col,dark=shade(base,.55),darker=shade(base,.34),lite=shade(base,1.28);
  const grd=ctx.createLinearGradient(0,-hw-4,0,hw+4);
  grd.addColorStop(0,lite);grd.addColorStop(.35,base);grd.addColorStop(.8,dark);grd.addColorStop(1,darker);
  ctx.fillStyle=grd;ctx.beginPath();
  const s=c.sty,nx=sp.nose,tx=-L-4;
  if(s===5){ctx.moveTo(tx,-hw+2);ctx.lineTo(2,-hw-1);ctx.lineTo(nx,0);ctx.lineTo(2,hw+1);ctx.lineTo(tx,hw-2);ctx.quadraticCurveTo(tx-5,0,tx,-hw+2)}
  else if(s===7){ctx.moveTo(tx,-hw+2);ctx.lineTo(10,-hw-1);ctx.lineTo(nx,-4);ctx.lineTo(nx,4);ctx.lineTo(10,hw+1);ctx.lineTo(tx,hw-2);ctx.quadraticCurveTo(tx-5,0,tx,-hw+2)}
  else if(s===8){ctx.moveTo(tx,-hw+2);ctx.lineTo(8,-hw);ctx.lineTo(nx-2,-hw+2);ctx.lineTo(nx,-5);ctx.lineTo(nx,5);ctx.lineTo(nx-2,hw-2);ctx.lineTo(8,hw);ctx.lineTo(tx,hw-2);ctx.quadraticCurveTo(tx-5,0,tx,-hw+2)}
  else if(s===6||s===2){ctx.moveTo(tx,-hw+2);ctx.lineTo(6,-hw);ctx.quadraticCurveTo(nx,-hw+3,nx-2,-3);ctx.lineTo(nx-2,3);ctx.quadraticCurveTo(nx,hw-3,6,hw);ctx.lineTo(tx,hw-2);ctx.quadraticCurveTo(tx-5,0,tx,-hw+2)}
  else{ctx.moveTo(tx,-hw+2);ctx.lineTo(8,-hw-1);ctx.lineTo(nx-6,-hw+4);ctx.lineTo(nx,-3.5);ctx.lineTo(nx,3.5);ctx.lineTo(nx-6,hw-4);ctx.lineTo(8,hw+1);ctx.lineTo(tx,hw-2);ctx.quadraticCurveTo(tx-5,0,tx,-hw+2)}
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.26)';ctx.beginPath();ctx.moveTo(tx+6,-hw+3);ctx.lineTo(8,-hw);ctx.lineTo(nx-8,-hw+3);ctx.lineTo(6,-hw+4.5);ctx.lineTo(tx+6,-hw+5);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.14)';ctx.beginPath();ctx.moveTo(nx-10,-2);ctx.lineTo(nx-2,-5.5);ctx.lineTo(nx-2,5.5);ctx.lineTo(nx-10,2);ctx.closePath();ctx.fill();
  if(sp.inD===2){ctx.fillStyle='rgba(0,0,0,.45)';rr(2,-hw-1,12,3,1.5);rr(2,hw-2,12,3,1.5);ctx.fillStyle='rgba(0,0,0,.5)';rr(nx-12,-hw+1,7,4,1.5);rr(nx-12,hw-5,7,4,1.5)}
  else{ctx.fillStyle='rgba(0,0,0,.35)';rr(4,-hw,9,2.4,1.2);rr(4,hw-2.4,9,2.4,1.2)}
  ctx.fillStyle='rgba(0,0,0,.3)';rr(tx-2,-hw+1,7,hw*2-2,2);
  ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-2,-hw+1);ctx.lineTo(-2,hw-1);ctx.moveTo(8,-hw+2);ctx.lineTo(8,hw-2);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.92)';
  if(sp.decal===0)ctx.fillRect(tx+5,-1.8,L+16,3.6);
  else if(sp.decal===1){ctx.fillRect(tx+5,-hw+3,L+18,2.4);ctx.fillRect(tx+5,hw-5.4,L+18,2.4)}
  else if(sp.decal===2){ctx.beginPath();ctx.arc(2,0,6.8,0,6.3);ctx.fill();ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(tx+5,-2,9,4)}
  else if(sp.decal===3){ctx.fillRect(6,-hw+1,L-4,2.2);ctx.fillRect(6,hw-3.2,L-4,2.2)}
  else if(sp.decal===4){ctx.fillRect(tx+9,-2.4,L+10,4.8)}
  else{ctx.beginPath();ctx.moveTo(2,-hw+2);ctx.lineTo(14,-2);ctx.lineTo(14,2);ctx.lineTo(2,hw-2);ctx.lineTo(2,hw-4);ctx.lineTo(11,0);ctx.lineTo(2,-hw+4);ctx.closePath();ctx.fill()}
  if(s===8){ctx.strokeStyle='rgba(20,20,28,.65)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(-2,0,11,.9,2.2);ctx.arc(-2,0,11,4.1,5.4);ctx.stroke()}
  const ccx=s===4?0:s===8?-1:-3;
  ctx.fillStyle='#0e0e14';rr(ccx-9,-6.5,15,13,5);
  const wg=ctx.createLinearGradient(0,-5,0,5);wg.addColorStop(0,'rgba(175,220,255,.95)');wg.addColorStop(.5,'rgba(70,110,160,.9)');wg.addColorStop(1,'rgba(18,28,48,.95)');
  ctx.fillStyle=wg;rr(ccx-1,-5.2,6,10.4,2.5);
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(ccx+.5,-4,1.6,8);
  ctx.fillStyle='#0c0c12';rr(ccx-8,-5.5,5,11,2);
  ctx.fillStyle='#08080c';ctx.fillRect(-3,-hw-1,3,2.5);ctx.fillRect(-3,hw-1,3,2.5);
  ctx.fillStyle='#fff3b0';
  if(sp.light===0){ctx.save();ctx.translate(nx-5,-hw+3.4);ctx.rotate(-.22);ctx.fillRect(0,-1.3,6.5,2.6);ctx.restore();ctx.save();ctx.translate(nx-5,hw-3.4);ctx.rotate(.22);ctx.fillRect(0,-1.3,6.5,2.6);ctx.restore()}
  else if(sp.light===1){ctx.beginPath();ctx.moveTo(nx-9,-hw+2);ctx.lineTo(nx-2,-hw+4.5);ctx.lineTo(nx-2,-3);ctx.lineTo(nx-5,-3);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(nx-9,hw-2);ctx.lineTo(nx-2,hw-4.5);ctx.lineTo(nx-2,3);ctx.lineTo(nx-5,3);ctx.closePath();ctx.fill()}
  else if(sp.light===2){[[-1.6],[1.6]].forEach(()=>{});ctx.beginPath();ctx.ellipse(nx-4,-hw+3,2.2,1.5,0,0,6.3);ctx.fill();ctx.beginPath();ctx.ellipse(nx-4,-hw+5.6,2.2,1.5,0,0,6.3);ctx.fill();ctx.beginPath();ctx.ellipse(nx-4,hw-3,2.2,1.5,0,0,6.3);ctx.fill();ctx.beginPath();ctx.ellipse(nx-4,hw-5.6,2.2,1.5,0,0,6.3);ctx.fill()}
  else if(sp.light===3){ctx.fillRect(nx-7,-hw+2.4,7,1.8);ctx.fillRect(nx-7,hw-4.2,7,1.8)}
  else if(sp.light===4){ctx.fillRect(nx-6,-4.5,4,9);ctx.fillRect(nx-11,-hw+3,4,2);ctx.fillRect(nx-11,hw-5,4,2)}
  else if(sp.light===5){ctx.fillRect(nx-6,-hw+3.2,5,2.2);ctx.fillRect(nx-6,hw-5.4,5,2.2)}
  else{ctx.beginPath();ctx.arc(nx-4.5,-hw+3.8,1.8,0,6.3);ctx.fill();ctx.beginPath();ctx.arc(nx-4.5,-hw+6.4,1.4,0,6.3);ctx.fill();ctx.beginPath();ctx.arc(nx-4.5,hw-3.8,1.8,0,6.3);ctx.fill();ctx.beginPath();ctx.arc(nx-4.5,hw-6.4,1.4,0,6.3);ctx.fill()}
  const braking=!c.thr&&c.v>20;
  if(s===8){ctx.fillStyle=braking?'#ff2a2a':'#7a1010';ctx.fillRect(tx+1,-hw+3,2.6,hw*2-6)}
  else if(s===6||s===2){ctx.fillStyle=braking?'#ff2a2a':'#7a1010';ctx.beginPath();ctx.arc(tx+3,-hw+4.5,2.4,0,6.3);ctx.fill();ctx.beginPath();ctx.arc(tx+3,hw-4.5,2.4,0,6.3);ctx.fill()}
  else{ctx.fillStyle=braking?'#ff2222':'#8a1111';ctx.fillRect(tx+1.5,-hw+2,2.6,4);ctx.fillRect(tx+1.5,hw-6,2.6,4)}
  if(braking){ctx.fillStyle='rgba(255,60,50,.5)';ctx.beginPath();ctx.ellipse(tx-2,0,7,9,0,0,6.3);ctx.fill()}
  ctx.fillStyle='#141419';rr(tx-1,-hw+2,6,4,1.5);rr(tx-1,hw-6,6,4,1.5);
  for(let i=0;i<3;i++){ctx.fillStyle=i===1?'rgba(0,0,0,.55)':'rgba(0,0,0,.4)';ctx.fillRect(tx+1+i*2.2,-3.5,1.4,7)}
  ctx.fillStyle='#c9ccd4';
  if(sp.ex===4){[[-2.6],[2.6]].forEach(e=>{const ey=e[0]*2;ctx.beginPath();ctx.arc(tx-1,ey-1.4,1.9,0,6.3);ctx.fill();ctx.beginPath();ctx.arc(tx-1,ey+1.4,1.9,0,6.3);ctx.fill()})}
  else{[[-3],[3]].forEach(e=>{ctx.beginPath();ctx.arc(tx-1,e[0],2,0,6.3);ctx.fill()})}
  ctx.fillStyle='#5a5d66';
  if(sp.ex===4){[[-5.2],[5.2]].forEach(e=>{ctx.beginPath();ctx.arc(tx-1,e[0]-1.4,1,0,6.3);ctx.fill();ctx.beginPath();ctx.arc(tx-1,e[0]+1.4,1,0,6.3);ctx.fill()})}
  else{[[-3],[3]].forEach(e=>{ctx.beginPath();ctx.arc(tx-1,e[0],1,0,6.3);ctx.fill()})}
  if(c.thr&&c.v>40){ctx.fillStyle='rgba(255,180,80,.5)';ctx.beginPath();ctx.arc(tx-2,0,2.4,0,6.3);ctx.fill()}
  ctx.fillStyle='#0b0b0e';
  if(sp.wing===2){ctx.fillRect(tx+2,-hw-2,2.5,hw*2+4);rr(tx-4,-hw-4,7,hw*2+8,1.5)}
  else if(sp.wing===4){ctx.fillRect(tx+1,-hw-1,3,hw*2+2);rr(tx-6,-hw-3,9,hw*2+6,2)}
  else if(sp.wing===3){rr(tx-5,-hw+1,7,3,1.5);rr(tx-5,hw-4,7,3,1.5)}
  else{rr(tx-6,-hw-1,9,3,1.5);rr(tx-6,hw-2,9,3,1.5)}
  if(sp.wing===4){ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(tx-6,-hw-3,9,1.6)}
  if(c.tu){const fl=20+Math.random()*12,fg=ctx.createLinearGradient(tx,0,tx-fl,0);fg.addColorStop(0,'rgba(255,255,255,.95)');fg.addColorStop(.4,'rgba(110,205,255,.9)');fg.addColorStop(1,'rgba(30,120,255,0)');ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(tx,-4.5);ctx.lineTo(tx-fl,0);ctx.lineTo(tx,4.5);ctx.closePath();ctx.fill()}
  else if(c.boost>0){const fl=14+Math.random()*8,fg=ctx.createLinearGradient(tx,0,tx-fl,0);fg.addColorStop(0,'rgba(255,255,255,.9)');fg.addColorStop(.5,'rgba(255,200,60,.85)');fg.addColorStop(1,'rgba(255,120,0,0)');ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(tx,-4);ctx.lineTo(tx-fl,0);ctx.lineTo(tx,4);ctx.closePath();ctx.fill()}
  if(c.shield>0){const a=.55+.3*Math.sin(raceTime*10);ctx.strokeStyle='rgba(90,255,160,'+a.toFixed(2)+')';ctx.lineWidth=2.6;ctx.beginPath();ctx.ellipse(1,0,35,21,0,0,6.3);ctx.stroke();ctx.fillStyle='rgba(90,255,160,.1)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,'+(a*.6).toFixed(2)+')';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(1,0,30,17,0,-.6,.9);ctx.stroke()}
  ctx.restore();
  if(c.oil>0){ctx.fillStyle='#111';ctx.font='900 11px Arial';ctx.textAlign='center';ctx.fillText('●',0,-hw-7)}
  if(c.slow>0){ctx.fillStyle='rgba(150,200,255,.9)';ctx.font='900 11px Arial';ctx.textAlign='center';ctx.fillText('❄',0,-hw-7)}
  ctx.restore();
}
function hsh(x,y){const v=Math.sin(x*12.9898+y*78.233)*43758.5453;return v-Math.floor(v)}
function drawSC(o){
  const x=o.x,y=o.y,s=o.s,h=hsh(x,y),h2=hsh(y,x+7);
  switch(o.t){
  case 0:{
    const pine=h<.38,r=s*(pine?.95:.9);
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x+s*.25,y+s*.35,r*1.05,r*.5,0,0,6.3);ctx.fill();
    ctx.fillStyle='#4a3220';ctx.fillRect(x-3,y-2,6,s*.5);
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(x+1,y-2,2,s*.5);
    if(pine){
      const g=TH.deco===2?['#2f6b3a','#3a8547','#4da45c']:['#144a22','#1b6a2e','#24913d'];
      for(let i=0;i<3;i++){const w=r*(1-i*.24),yy=y-s*.7+i*s*.5;ctx.fillStyle=g[i];ctx.beginPath();ctx.moveTo(x,yy-w*.9);ctx.lineTo(x-w,yy+w*.5);ctx.lineTo(x+w,yy+w*.5);ctx.closePath();ctx.fill()}
      ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.moveTo(x,y-s*.7-r*.85);ctx.lineTo(x-r*.3,y-s*.15);ctx.lineTo(x-r*.1,y-s*.15);ctx.closePath();ctx.fill();
    }else{
      ctx.fillStyle='#0e3d17';circ(x,y+2,r,'#0e3d17');
      circ(x-r*.25,y-r*.25,r*.85,'#1a6a28');circ(x-r*.3,y-r*.35,r*.55,'#2a9a3d');
      ctx.fillStyle='rgba(180,255,180,.22)';ctx.beginPath();ctx.ellipse(x-r*.3,y-r*.4,r*.32,r*.2,-.5,0,6.3);ctx.fill();
      if(h2<.5){circ(x+r*.5,y+r*.3,r*.22,'#1d7a2c');circ(x-r*.55,y+r*.25,r*.18,'#23913a')}
    }
    ctx.strokeStyle=TH.deco===2?'rgba(120,90,40,.7)':'rgba(40,100,45,.8)';ctx.lineWidth=1.6;ctx.beginPath();
    for(let i=0;i<4;i++){const gx=x-r-6+hsh(x+i,y)* (r*2+12);ctx.moveTo(gx,y+r*.7);ctx.lineTo(gx+2,y+r*.25)}ctx.stroke();
    break}
  case 1:{
    const w=s,H=o.h,rx=x-w,ry=y-H;
    ctx.fillStyle='rgba(0,0,0,.32)';ctx.fillRect(rx+9,ry+12,w*2,H*2);
    let bg=ctx.createLinearGradient(rx,0,rx+w*2,0);bg.addColorStop(0,shade(o.col,.7));bg.addColorStop(.25,o.col);bg.addColorStop(1,shade(o.col,.55));
    ctx.fillStyle=bg;ctx.fillRect(rx,ry,w*2,H*2);
    ctx.fillStyle='rgba(255,255,255,.16)';ctx.fillRect(rx+4,ry+5,5,H*2-10);
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(rx,ry,w*2,7);ctx.fillStyle=shade(o.col,1.3);ctx.fillRect(rx,ry,w*2,2.5);
    const cols=Math.max(2,Math.floor(w*2/22)),rows=Math.max(2,Math.floor(H*2/26));
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
      const wx=rx+8+i*((w*2-14)/Math.max(1,cols-1||1)),wy=ry+16+j*((H*2-26)/Math.max(1,rows-1||1));
      const lit=hsh(wx,wy)>.55;
      ctx.fillStyle=lit?'rgba(255,225,140,.92)':'rgba(18,24,38,.9)';ctx.fillRect(wx-4,wy-3,8,7);
      ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(wx-4,wy-3,8,1.5);
      ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1;ctx.strokeRect(wx-4,wy-3,8,7);
    }
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x-7,ry+H*2-14,14,14);ctx.fillStyle='rgba(255,220,150,.25)';ctx.fillRect(x-7,ry+H*2-14,14,3);
    if(h<.4){ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(x+w*.3,ry-9,14,9);ctx.fillStyle='#9aa0ad';ctx.fillRect(x+w*.3,ry-9,14,3)}
    else if(h<.7){ctx.fillStyle='#3a3d46';ctx.fillRect(x-w*.5,ry-7,10,7);ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(x-w*.5,ry-7,10,2)}
    break}
  case 2:
    if(o.k){
      ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x+4,y+5,s+3,(s+3)*.55,0,0,6.3);ctx.fill();
      circ(x,y,s,'#8a6f4d');circ(x-s*.25,y-s*.25,s*.68,'#b8946a');circ(x-s*.3,y-s*.35,s*.34,'#d8bc8a');
      ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.ellipse(x-s*.28,y-s*.38,s*.18,s*.1,-.5,0,6.3);ctx.fill();
      ctx.fillStyle='rgba(0,0,0,.2)';circ(x+s*.55,y+s*.4,s*.28,'rgba(0,0,0,.2)');circ(x-s*.6,y+s*.5,s*.2,'#a0845c');
    }else{
      ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x+3,y+s*.7,12,5,0,0,6.3);ctx.fill();
      if(h<.5){
        ctx.fillStyle='#2f7a3a';rr(x-3,y-s,7,s*1.7,3.5);
        ctx.fillStyle='#3da34f';rr(x-9,y-s*.4,6,s*.9,3);rr(x+2,y-s*.5,6,s,3);
        ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(x-1,y-s+2,2,s);
        ctx.fillStyle='#7a5a35';for(let i=0;i<3;i++)circ(x-6+hsh(x,i)*12,y+s*.6,1.8,'#7a5a35');
      }else{
        ctx.strokeStyle='#6b5a35';ctx.lineWidth=2.5;ctx.beginPath();
        for(let i=0;i<5;i++){const a=-.6+i*.3;ctx.moveTo(x,y+4);ctx.lineTo(x+Math.cos(a)*14,y+4-Math.abs(Math.sin(a))*14-4)}ctx.stroke();
        ctx.strokeStyle='rgba(140,120,70,.8)';ctx.lineWidth=1.2;ctx.beginPath();
        for(let i=0;i<5;i++){const a=-.5+i*.28;ctx.moveTo(x,y+4);ctx.lineTo(x+Math.cos(a)*9,y+4-Math.abs(Math.sin(a))*9-2)}ctx.stroke();
      }
      ctx.fillStyle='#9c8a68';circ(x-s*.9,y+s*.3,2.2,'#9c8a68');circ(x+s*.8,y+s*.5,1.7,'#9c8a68');
    }
    break;
  case 3:{
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x+3,y+3,10,4,0,0,6.3);ctx.fill();
    if(TH.deco===0){
      ctx.fillStyle='#2a2d36';ctx.fillRect(x-2.5,y-34,5,36);
      ctx.fillStyle='#3d414e';ctx.fillRect(x-2.5,y-34,2,36);
      ctx.fillStyle='#2a2d36';ctx.fillRect(x-2.5,y-34,20,4);
      ctx.fillStyle='#ffe9a0';rr(x+10,y-32,10,6,2);
      const gl=ctx.createRadialGradient(x+15,y-20,2,x+15,y-20,34);gl.addColorStop(0,'rgba(255,230,150,.4)');gl.addColorStop(1,'rgba(255,230,150,0)');ctx.fillStyle=gl;circ(x+15,y-14,32,'rgba(255,230,150,.12)');
      circ(x+15,y-29,2.5,'#fff7d0');
    }else{
      ctx.fillStyle='#5a4028';ctx.fillRect(x-2,y-22,4.5,24);
      ctx.fillStyle='#7a5a38';ctx.fillRect(x-2,y-22,2,24);
      ctx.fillStyle='#2c2c34';rr(x-5,y-30,11,9,2);
      circ(x+.5,y-25.5,3,'#ffe9a0');circ(x+.5,y-25.5,7,'rgba(255,230,150,.18)');
    }
    break}
  case 4:{
    ctx.save();ctx.translate(x,y);ctx.rotate(o.a);
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-37,-1,74,14);
    ctx.fillStyle='#22242c';ctx.fillRect(-4,-12,8,22);ctx.fillRect(28,-12,8,22);
    let pg=ctx.createLinearGradient(0,-8,0,8);pg.addColorStop(0,shade(o.col,1.2));pg.addColorStop(.5,o.col);pg.addColorStop(1,shade(o.col,.6));
    ctx.fillStyle=pg;ctx.fillRect(-37,-8,37*2,16);
    ctx.fillStyle='#fff';for(let i=0;i<4;i++)ctx.fillRect(-37+i*19,-8,9.5,16);
    ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1.5;ctx.strokeRect(-37,-8,74,16);
    ctx.fillStyle='rgba(255,255,255,.3)';ctx.fillRect(-37,-8,74,3);
    ctx.fillStyle='rgba(0,0,0,.55)';ctx.font='900 9px Arial';ctx.textAlign='center';ctx.fillText('TURBO',0,4);
    ctx.restore();break}
  case 5:{
    ctx.save();ctx.translate(x,y);ctx.rotate(o.a);
    ctx.fillStyle='rgba(0,0,0,.32)';ctx.fillRect(-86,-26,184,72);
    ctx.fillStyle='#33363f';ctx.fillRect(-92,-32,184,68);
    ctx.fillStyle='#22242b';for(let j=0;j<3;j++)ctx.fillRect(-88,-24+j*20,176,14);
    const pal=['#e10600','#fff','#ffc21a','#1f7bff','#22c55e','#ff4fa3','#22d3c5'];
    for(let i=0;i<20;i++)for(let j=0;j<3;j++){if(hsh(x+i*3.1,y+j*7.7)>.3)circ(-84+i*8.6,-17+j*20,3.2,pal[(i*7+j*3+((x|0)%5))%pal.length])}
    ctx.fillStyle='#454a56';ctx.fillRect(-92,-32,184,6);
    ctx.fillStyle='rgba(31,123,255,.9)';ctx.fillRect(-92,-38,184,8);
    ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(-92,-38,184,2);
    ctx.fillStyle='#fff';ctx.font='900 8px Arial';ctx.textAlign='center';ctx.fillText('★ TURBO RACE ★',0,-40);
    ctx.fillStyle='#17181e';ctx.fillRect(-6,-24,12,60);
    ctx.restore();break}
  case 6:{
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x+2,y+4,8,3.5,0,0,6.3);ctx.fill();
    ctx.fillStyle='#3a3d46';ctx.fillRect(x-2,y-44,4,48);
    ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(x-2,y-44,1.5,48);
    circ(x,y+2,5,'#222');
    const wv=Math.sin(raceTime*6+x)*3;
    for(let i=0;i<3;i++)for(let j=0;j<2;j++){ctx.fillStyle=(i+j)&1?'#111':'#f2f2f2';ctx.fillRect(x+2+i*9,y-44+j*8+ (i?wv*.4:0),9,8)}
    ctx.fillStyle=o.col;ctx.fillRect(x+2,y-32+wv*.3,27,3);
    circ(x-2,y-44,2.5,'#ffd23f');
    break}
  case 7:{
    ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(x+2,y+4,s+4,(s+4)*.5,0,0,6.3);ctx.fill();
    for(let i=0;i<2;i++){const yy=y-i*7;
      circ(x,yy,s,'#151517');circ(x,yy,s*.72,'#33333a');circ(x,yy,s*.4,'#0c0c0e');
      ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,yy,s*.85,-2.4,-1.2);ctx.stroke()}
    ctx.fillStyle='#e8e8ea';ctx.fillRect(x-s,y-14,2,8);ctx.fillRect(x+s-2,y-14,2,8);
    break}
  }
}
function draw(){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,TH.g[0]);sky.addColorStop(1,shade(TH.g[0].length===7?TH.g[0]:'#222222',.7));ctx.fillStyle=TH.g[0];ctx.fillRect(0,0,W,H);
  const cx=cam.x+(Math.random()-.5)*shake*28,cy=cam.y+(Math.random()-.5)*shake*28;
  ctx.setTransform(DPR*sc,0,0,DPR*sc,DPR*(W/2-cx*sc),DPR*(H/2-cy*sc));
  const hw=W/2/sc+140,hh=H/2/sc+140,vis=(x,y,m)=>Math.abs(x-cam.x)<hw+m&&Math.abs(y-cam.y)<hh+m,g=180;
  ctx.fillStyle=TH.g[1];
  const gx0=Math.floor((cam.x-hw)/g),gx1=Math.floor((cam.x+hw)/g),gy0=Math.floor((cam.y-hh)/g),gy1=Math.floor((cam.y+hh)/g);
  for(let gx=gx0;gx<=gx1;gx++)for(let gy=gy0;gy<=gy1;gy++)if((gx+gy)&1)ctx.fillRect(gx*g,gy*g,g,g);
  ctx.fillStyle='rgba(0,0,0,.06)';
  for(let gx=gx0;gx<=gx1;gx++)for(let gy=gy0;gy<=gy1;gy++){
    const hh2=hsh(gx*3.7,gy*9.1);if(hh2>.6)ctx.fillRect(gx*g+hh2*120,gy*g+hsh(gy,gx)*120,26,14);
  }
  if(TH.deco===0){
    ctx.strokeStyle='rgba(0,0,0,.12)';ctx.lineWidth=2;ctx.beginPath();
    for(let gx=gx0;gx<=gx1;gx++){ctx.moveTo(gx*g,gy0*g);ctx.lineTo(gx*g,gy1*g+g)}for(let gy=gy0;gy<=gy1;gy++){ctx.moveTo(gx0*g,gy*g);ctx.lineTo(gx1*g+g,gy*g)}ctx.stroke();
    ctx.fillStyle='rgba(0,0,0,.16)';
    for(let gx=gx0;gx<=gx1;gx+=2)for(let gy=gy0;gy<=gy1;gy+=2){if(hsh(gx,gy)>.82&&vis(gx*g,gy*g,100)){ctx.beginPath();ctx.ellipse(gx*g+90,gy*g+90,9,6,0,0,6.3);ctx.fill();ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(gx*g+82,gy*g+86,16,2);ctx.fillStyle='rgba(0,0,0,.16)'}}
  }else if(TH.deco===1){
    for(let gx=gx0;gx<=gx1;gx++)for(let gy=gy0;gy<=gy1;gy++){
      const a=hsh(gx*1.3,gy*2.7);if(a>.72){const px=gx*g+a*150,py=gy*g+hsh(gy,gx)*150;if(!vis(px,py,50))continue;
        ctx.fillStyle=a>.9?'rgba(255,220,120,.5)':'rgba(30,110,40,.5)';for(let i=0;i<3;i++)ctx.fillRect(px+i*3,py,2,2.5);
        ctx.strokeStyle='rgba(25,90,35,.6)';ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<4;i++){const txp=px-8+hsh(gx+i,gy)*16;ctx.moveTo(txp,py+6);ctx.lineTo(txp+1,py)}ctx.stroke()}
    }
  }else{
    ctx.strokeStyle='rgba(160,120,70,.28)';ctx.lineWidth=2;ctx.beginPath();
    for(let gx=gx0;gx<=gx1;gx++)for(let gy=gy0;gy<=gy1;gy++){if(((gx*7+gy*13)%3)===0){const yy=gy*g+((gx*53+gy*29)%150);ctx.moveTo(gx*g+10,yy);ctx.quadraticCurveTo(gx*g+90,yy+8,gx*g+170,yy)}}
    ctx.stroke();
    ctx.fillStyle='rgba(120,90,55,.4)';
    for(let gx=gx0;gx<=gx1;gx++)for(let gy=gy0;gy<=gy1;gy++){const a=hsh(gx*2.1,gy*4.3);if(a>.8)circ(gx*g+a*140,gy*g+hsh(gy*1.7,gx)*140,1.5+a*2,'rgba(120,90,55,.4)')}
  }
  ctx.lineJoin='round';ctx.lineCap='round';ctx.setLineDash([]);
  const curbBase=TH.deco===2?'#e8dcc8':'#eef0f2';
  ctx.lineWidth=TW+46;ctx.strokeStyle='rgba(0,0,0,.32)';ctx.stroke(TP);
  ctx.lineWidth=TW+34;ctx.strokeStyle=curbBase;ctx.stroke(TP);
  ctx.setLineDash([30,30]);ctx.lineWidth=TW+34;ctx.strokeStyle=TH.k;ctx.stroke(TP);ctx.setLineDash([]);
  ctx.lineWidth=TW;ctx.strokeStyle='rgba(0,0,0,.55)';ctx.stroke(TP);
  ctx.lineWidth=TW-2;ctx.strokeStyle=TH.as;ctx.stroke(TP);
  ctx.lineWidth=TW-10;ctx.strokeStyle='rgba(0,0,0,.16)';ctx.stroke(TP);
  ctx.lineWidth=TW-14;ctx.strokeStyle=TH.as;ctx.stroke(TP);
  ctx.lineWidth=TW-8;ctx.strokeStyle='rgba(255,255,255,.5)';ctx.stroke(TP);
  ctx.lineWidth=TW-13;ctx.strokeStyle=TH.as;ctx.stroke(TP);
  ctx.setLineDash([10,26]);ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.22)';ctx.stroke(TP);ctx.setLineDash([]);
  ctx.setLineDash([28,32]);ctx.lineWidth=4;ctx.strokeStyle='rgba(255,255,255,.4)';ctx.stroke(TP);ctx.setLineDash([]);
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
  PU.forEach(p=>{if(!p.on||!vis(p.x,p.y,60))return;const k=Math.sin(raceTime*5+p.x)*3;ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(p.x,p.y+13,14,5,0,0,6.3);ctx.fill();circ(p.x,p.y,24+k,'rgba('+PC[p.t]+',.2)');let pg=ctx.createRadialGradient(p.x-4,p.y-5,2,p.x,p.y,15);pg.addColorStop(0,'rgba(255,255,255,.9)');pg.addColorStop(.35,'rgb('+PC[p.t]+')');pg.addColorStop(1,'rgba(0,0,0,.35)');circ(p.x,p.y,15,'rgb('+PC[p.t]+')');ctx.fillStyle=pg;circ(p.x,p.y,13,pg);ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(p.x,p.y,15,0,6.3);ctx.stroke();ctx.strokeStyle='rgba('+PC[p.t]+',.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,19+k*.4,raceTime*2,raceTime*2+4.5);ctx.stroke();ctx.fillStyle='#111';ctx.font='900 16px Arial';ctx.textAlign='center';ctx.fillText(PL[p.t],p.x,p.y+6)});
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
    ctx.fillStyle='rgba(8,8,16,.72)';rr(ox-10,oy-10,(B.x1-B.x0)*ms+20,(B.y1-B.y0)*ms+20,8);
    ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1.5;rr(ox-10,oy-10,(B.x1-B.x0)*ms+20,(B.y1-B.y0)*ms+20,8);ctx.stroke();
    ctx.setTransform(DPR*ms,0,0,DPR*ms,DPR*(ox-B.x0*ms),DPR*(oy-B.y0*ms));
    ctx.setLineDash([]);ctx.lineWidth=7/ms;ctx.strokeStyle='rgba(0,0,0,.5)';ctx.stroke(TP);
    ctx.lineWidth=5/ms;ctx.strokeStyle='#9a9aa8';ctx.stroke(TP);
    cars.forEach(c=>{circ(c.x,c.y,(c.player?6:4.5)/ms,c.col);if(c.player){ctx.strokeStyle='#fff';ctx.lineWidth=2/ms;ctx.beginPath();ctx.arc(c.x,c.y,6/ms,0,6.3);ctx.stroke()}});
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.fillStyle='rgba(255,255,255,.65)';ctx.font='700 9px Arial';ctx.textAlign='left';ctx.fillText(TH.n,ox-6,oy-14);
  }
}

/* ---------- Loop e entrada ---------- */
let last=0;
function loop(t){const dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(loop)}
function rs(){DPR=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR}
addEventListener('resize',rs);rs();
const KM={KeyW:'u',ArrowUp:'u',KeyS:'d',ArrowDown:'d',KeyA:'l',ArrowLeft:'l',KeyD:'r',ArrowRight:'r',Space:'s',ShiftLeft:'t',ShiftRight:'t'};
addEventListener('keydown',e=>{
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
$('selb').onclick=()=>show('menu');
$('btm').onclick=()=>{$('tl').innerHTML=TR.map((t,i)=>'<span>'+t.n+'</span><em>'+(bt[i]?fmt(bt[i]):'--')+'</em>').join('');show('times')};
$('tback').onclick=()=>show('menu');
$('bhow').onclick=()=>show('how');$('bback').onclick=()=>show('menu');
$('pb').onclick=pause;$('bres').onclick=resume;$('brst').onclick=startRace;
$('bagain').onclick=()=>{if(mode===1){if(round<2)round++;else{round=0;pts={}}}startRace()};
$('bmenu1').onclick=$('bmenu2').onclick=()=>{if(mode===1&&state!=='fin'){round=0;pts={}}demo()};
demo();requestAnimationFrame(loop);
