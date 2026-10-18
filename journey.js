/* Battle Journey: tiny, offline-friendly adventure built on earned Battle Points. */
'use strict';
window.createBattleJourney = function(ctx) {
  const $=id=>document.getElementById(id);
  const esc=ctx.esc;
  const gems=['quartz','ruby','sapphire','emerald'];
  const labels={quartz:'◇ Quartz',ruby:'◆ Ruby',sapphire:'◆ Sapphire',emerald:'◆ Emerald'};
  const enemies=[
    {name:'Pufflet',color:'#f4adc0',dark:'#b96e91',eyes:'#40324d'},
    {name:'Mossling',color:'#a5e4a8',dark:'#5a9b76',eyes:'#244939'},
    {name:'Bubblekin',color:'#9dd4f5',dark:'#5d9dcc',eyes:'#253958'},
    {name:'Starpetal',color:'#e9bbfc',dark:'#a277c6',eyes:'#514079'}
  ];
  const rewards=[
    {id:'tokyoshift',name:'Tokyo SHIFT car coupon',description:'Choose one Tokyo SHIFT car coupon',cost:5,emoji:'🏎️'},
    {id:'tech',name:'10 extra minutes of tech',description:'10 minutes of bonus technology time',cost:15,emoji:'🎮'}
  ];
  const equipment={
    sword:[
      {id:'starter',name:'Wooden Sword',cost:0,bonus:0,color:'#b78a55',edge:'#ebc78c',level:1},
      {id:'iron',name:'Iron Sword',cost:4,bonus:2,color:'#94afc8',edge:'#f1f8ff',level:2},
      {id:'crystal',name:'Crystal Saber',cost:8,bonus:4,color:'#65cfe6',edge:'#d6fdff',level:3},
      {id:'star',name:'Starblade',cost:12,bonus:6,color:'#ecc46e',edge:'#fff2c2',level:5}
    ],
    pickaxe:[
      {id:'starter',name:'Wooden Pick',cost:0,bonus:0,color:'#bc8b5c',edge:'#e9bd7b',level:1},
      {id:'iron',name:'Iron Pick',cost:4,bonus:2,color:'#819cb2',edge:'#edf5f8',level:2},
      {id:'crystal',name:'Crystal Pick',cost:8,bonus:4,color:'#55bbd2',edge:'#bbf1fc',level:3},
      {id:'star',name:'Star Drill',cost:12,bonus:6,color:'#deb85d',edge:'#fff0af',level:5}
    ],
    armour:[
      {id:'cloth',name:'Explorer Jacket',cost:0,bonus:0,color:'#327bd4',edge:'#90c8ee',level:1},
      {id:'copper',name:'Copper Mail',cost:4,bonus:2,color:'#b7795e',edge:'#ebc4a1',level:2},
      {id:'steel',name:'Steel Plate',cost:8,bonus:4,color:'#6e91ba',edge:'#d3e6ff',level:3},
      {id:'gem',name:'Gem Guardian',cost:12,bonus:6,color:'#8464b8',edge:'#cce1ff',level:5}
    ]
  };
  const skinShop=[
    {id:'blue',name:'Explorer Blue',cost:0,top:'#327bd4',light:'#3b8de6',sleeve:'#244e9b',pants:'#3d527c'},
    {id:'forest',name:'Forest Scout',cost:2,top:'#377e64',light:'#4bba85',sleeve:'#28674b',pants:'#365e52'},
    {id:'sunset',name:'Sunset Runner',cost:3,top:'#c07453',light:'#e99f66',sleeve:'#a95b42',pants:'#795a64'},
    {id:'violet',name:'Violet Ranger',cost:4,top:'#7d65ba',light:'#a890de',sleeve:'#5d4b90',pants:'#544b80'},
    {id:'frost',name:'Frost Explorer',cost:5,top:'#7cb8c9',light:'#c2edf3',sleeve:'#578eab',pants:'#6e9ca9'}
  ];
  function gear(category){const j=state();return equipment[category].find(i=>i.id===j.equippedGear[category])||equipment[category][0];}
  function playerStats(){
    const j=state(),lv=level();
    return {
      attack:2+j.sword+gear('sword').bonus+Math.floor(lv/2),
      defence:1+j.armour+gear('armour').bonus,
      mining:2+j.pickaxe+gear('pickaxe').bonus+Math.floor(lv/3)
    };
  }
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const pct=p=>Math.round(p*100);
  function foeFor(mode){
    const j=state();
    const count=j.encounters.filter(e=>e.mode===mode).length;
    const lv=1+Math.floor(count/3);
    if(mode==='battle'){
      const enemy=enemies[(lv-1)%enemies.length];
      return {...enemy,level:lv,hp:4+2*lv,attack:1+lv};
    }
    const names=['Pebble Rock','Mossy Stone','Crystal Boulder','Star Ore'];
    return {name:names[(lv-1)%names.length],level:lv,hardness:3+lv};
  }
  function probability(mode,foe){
    const p=playerStats();
    return mode==='battle'
      ?clamp(.78+.06*(p.attack-(foe.hp-3))+.025*(p.defence-foe.attack),.20,.95)
      :clamp(.72+.085*(p.mining-foe.hardness),.20,.95);
  }
  function portraitSvg(mode){
    const j=state(),sk=skinShop.find(x=>x.id===j.skin)||skinShop[0];
    const src=document.querySelector('.hero-card .avatar');
    let original=src?src.outerHTML:'<svg class="avatar" viewBox="0 0 240 230" shape-rendering="crispEdges"><rect x="88" y="60" width="70" height="92" fill="#327bd4"/></svg>';
    for(const [a,b] of [['#327bd4',sk.top],['#3b8de6',sk.light],['#244e9b',sk.sleeve],['#3d527c',sk.pants]])
      original=original.replaceAll('fill="'+a+'"','fill="'+b+'"');
    const armor=gear('armour'),tool=gear(mode==='battle'?'sword':'pickaxe');
    const plate='<g class="custom-armor" shape-rendering="crispEdges">'+
      '<path d="M90 121h18v-7h31v7h16v38H90z" fill="'+armor.color+'"/>'+
      '<path d="M98 125h48v7H98zm9 14h31v7h-31z" fill="'+armor.edge+'"/>'+
      '<path d="M93 150h59v7H93z" fill="'+armor.color+'"/>'+
      (armor.id==='gem'?'<path d="M94 45h55v8H94zm7 9h42v5h-42z" fill="'+armor.edge+'"/>':'')+
      '</g>';
    const shiny=tool.id==='star'||tool.id==='crystal';
    const weapon=mode==='battle'
      ?'<g class="custom-tool" shape-rendering="crispEdges"><path d="M181 59h12v84h-12z" fill="'+tool.color+'"/>'+
       '<path d="M185 48h4v13h-4z" fill="'+tool.edge+'"/>'+
       '<path d="M183 66h4v62h-4z" fill="'+tool.edge+'"/>'+
       '<path d="M171 138h31v9h-31z" fill="'+tool.edge+'"/>'+
       '<path d="M182 146h10v21h-10z" fill="#6d513f"/>'+
       '<path d="M179 165h17v7h-17z" fill="'+tool.color+'"/>'+
       (shiny?'<path d="M162 66h8v8h-8zm32-27h6v6h-6z" fill="#fff0ae"/>':'')+'</g>'
      :'<g class="custom-tool" shape-rendering="crispEdges"><path d="M182 83h10v86h-10z" fill="#78593e"/>'+
       '<path d="M166 77h43v12h-43z" fill="'+tool.color+'"/>'+
       '<path d="M158 87h19v11h-19z" fill="'+tool.edge+'"/>'+
       '<path d="M200 87h17v11h-17z" fill="'+tool.edge+'"/>'+
       '<path d="M186 87h6v60h-6z" fill="'+tool.edge+'"/>'+
       (shiny?'<path d="M160 64h8v8h-8zm43 3h8v8h-8z" fill="#fff2a9"/>':'')+'</g>';
    return original.replace('</svg>',plate+weapon+'</svg>').replace('class="avatar"','class="avatar journey-avatar"');
  }
  function kitCard(mode){
    const item=gear(mode==='battle'?'sword':'pickaxe'),armour=gear('armour'),p=playerStats();
    return '<div class="journey-kit-card"><div class="journey-kit-art">'+portraitSvg(mode)+'</div>'+
      '<strong>'+(mode==='battle'?'⚔ BATTLE KIT':'⛏ MINING KIT')+'</strong>'+
      '<small>'+esc(item.name)+' · '+esc(armour.name)+'</small>'+
      '<span>'+esc(state().skin.toUpperCase())+' SKIN · '+(mode==='battle'?'ATK '+p.attack+' / DEF '+p.defence:'MINE '+p.mining+' / DEF '+p.defence)+'</span></div>';
  }
  function state() {
    const data=ctx.getData();
    if(!data.journey || typeof data.journey!=='object')data.journey={};
    const j=data.journey;
    if(!Array.isArray(j.spending))j.spending=[];
    if(!Array.isArray(j.encounters))j.encounters=[];
    if(!j.gems || typeof j.gems!=='object')j.gems={};
    for(const g of gems)j.gems[g]=Math.max(0,Number(j.gems[g])||0);
    if(!Array.isArray(j.skins))j.skins=['blue'];
    if(!j.skins.includes('blue'))j.skins.unshift('blue');
    if(!j.skin)j.skin='blue';
    if(!j.ownedGear||typeof j.ownedGear!=='object')j.ownedGear={};
    if(!j.equippedGear||typeof j.equippedGear!=='object')j.equippedGear={};
    for(const cat of ['sword','pickaxe','armour']){
      if(!Array.isArray(j.ownedGear[cat]))j.ownedGear[cat]=[cat==='armour'?'cloth':'starter'];
      if(!j.equippedGear[cat])j.equippedGear[cat]=cat==='armour'?'cloth':'starter';
    }
    for(const k of ['xp','sword','pickaxe','armour'])j[k]=Math.max(0,Number(j[k])||0);
    return j;
  }
  function level() {return 1+Math.floor(state().xp/12);}
  function spent() {return state().spending.reduce((n,s)=>n+(Number(s.cost)||0),0);}
  function wallet() {return Math.max(0,ctx.totalBP()-spent());}
  function stoneCount(){return gems.reduce((n,g)=>n+state().gems[g],0);}
  function pending() {
    return Object.keys(ctx.getData().days).sort().filter(key=>{
      const d=ctx.getData().days[key];
      // A new morning must be closed before its encounter can be played; older saves stay eligible.
      const now=new Date();
      const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
      const isToday=key===today;
      return ctx.regularBP(d)===3&&!d.encounterUsed&&(ctx.isDev&&ctx.isDev()?!!d.endedAt:(!isToday||!!d.endedAt));
    });
  }
  function canSpend(cost){if(wallet()<cost){ctx.toast('Not enough BP yet. Keep questing!');return false;}return true;}
  function buy(cost,kind,label) {
    if(!canSpend(cost))return false;
    state().spending.push({id:'s'+Date.now()+'-'+Math.random().toString(36).slice(2,7),kind,label,cost,at:new Date().toISOString()});
    return true;
  }
  function takeStones(n){
    if(stoneCount()<n){ctx.toast('Mine more stones to upgrade!');return false;}
    let remain=n;
    for(const g of gems){const used=Math.min(remain,state().gems[g]);state().gems[g]-=used;remain-=used;if(!remain)break;}
    return true;
  }
  function enemyArt(enemy) {
    return '<svg class="enemy-svg" viewBox="0 0 112 104" role="img" aria-label="Friendly '+esc(enemy.name)+' creature" shape-rendering="crispEdges">'+
      '<ellipse cx="56" cy="95" rx="42" ry="6" fill="#081324" opacity=".35"/>'+
      '<path d="M32 24h12V13h24v11h12v12h12v12h8v28H88v10H24V76H12V48h8V36h12z" fill="'+enemy.dark+'"/>'+
      '<path d="M32 31h48v12h12v31H80v9H32v-9H20V46h12z" fill="'+enemy.color+'"/>'+
      '<rect x="36" y="50" width="10" height="15" fill="'+enemy.eyes+'"/><rect x="67" y="50" width="10" height="15" fill="'+enemy.eyes+'"/>'+
      '<rect x="38" y="51" width="4" height="5" fill="white"/><rect x="69" y="51" width="4" height="5" fill="white"/>'+
      '<rect x="51" y="69" width="11" height="5" fill="'+enemy.eyes+'"/><rect x="28" y="66" width="7" height="4" fill="#ffebea" opacity=".7"/><rect x="80" y="66" width="7" height="4" fill="#ffebea" opacity=".7"/>'+
      '</svg>';
  }
  let activeEncounter=null;
  const encounterDialog=$('encounterDialog');
  function miningArt(broken){
    return '<svg class="mining-svg" viewBox="0 0 152 132" role="img" aria-label="'+(broken?'A sparkling gemstone':'A little rock with crystals')+'" shape-rendering="crispEdges">'+
      '<ellipse cx="77" cy="119" rx="56" ry="9" fill="#0a1830" opacity=".4"/>'+
      (broken?'<path d="M55 65h46v12h12v24H43V77h12z" fill="#e4b8f8"/><path d="M64 49h27v17H64z" fill="#fff0f7"/><path d="M68 76h21v24H68z" fill="#b27fd2"/><path d="M57 76h10v9H57z" fill="#fff6fc"/><path d="M91 81h13v11H91z" fill="#f4e2fc"/><path d="M27 46h8v8h-8zm99 19h7v7h-7zM84 17h7v7h-7z" fill="#ffe4a1"/>':
      '<path d="M39 86V59h11V43h20V30h31v14h15v17h12v37h-11v15H37V98H24V86z" fill="#57677c"/>'+
      '<path d="M42 61h16V46h31v-8h11v12h15v16h9v27h-17v13H45V93H34V72h8z" fill="#8899a7"/>'+
      '<path d="M51 72h22v15H51z" fill="#65738b"/><path d="M84 54h15v14H84z" fill="#a8bfd0"/>'+
      '<path d="M63 37h13v12H63z" fill="#9fdde7"/><path d="M72 27h17v13H72z" fill="#c9f7f2"/>'+
      '<path d="M96 75h13v17H96z" fill="#d5bded"/><path d="M90 88h17v10H90z" fill="#a886c8"/>')+
      '</svg>';
  }

  function modalScene(e,resolved,success){
    const mode=e.mode,foe=e.foe;
    const rockArt=mode==='mine'?miningArt(Boolean(resolved&&success)):'';
    return '<div class="encounter-arena encounter-arena-'+mode+' '+(resolved?(success?'encounter-arena-win':'encounter-arena-miss'):'encounter-arena-ready')+'">'+
      '<div class="encounter-fighter encounter-hero"><div class="encounter-fighter-art">'+portraitSvg(mode)+'</div><span>YOUR HERO</span></div>'+
      '<span class="encounter-versus">'+(mode==='battle'?'VS':'⛏')+'</span>'+
      '<div class="encounter-fighter encounter-target"><div class="encounter-fighter-art">'+(mode==='battle'?enemyArt(foe):rockArt)+'</div><span>'+esc(foe.name)+'</span></div>'+
      (resolved?'<div class="encounter-action-flash" aria-hidden="true">'+(success?'✦':'·')+'</div>':'')+'</div>';
  }
  function panelStats(e){
    const foe=e.foe,p=playerStats(),chance=pct(e.chance);
    return '<div class="encounter-stat-grid">'+
      '<div><strong>'+esc(e.mode==='battle'?'YOUR HERO':'YOUR PICKAXE')+'</strong>'+
      (e.mode==='battle'?'<span>ATK '+p.attack+' · DEF '+p.defence+'</span>':'<span>MINING POWER '+p.mining+'</span>')+'</div>'+
      '<div><strong>'+esc(e.foe.name)+' · LV '+foe.level+'</strong>'+
      (e.mode==='battle'?'<span>HP '+foe.hp+' · ATK '+foe.attack+'</span>':'<span>HARDNESS '+foe.hardness+'</span>')+'</div></div>'+
      '<div class="encounter-chance"><span>'+esc(e.mode==='battle'?'CHANCE TO WIN':'CHANCE TO FIND A GEM')+'</span><strong>'+chance+'%</strong><div class="chance-track"><span style="width:'+chance+'%"></span></div>'+
      '<small>An estimate. You might not succeed — no BP is lost.</small></div>';
  }
  function setCurrentEncounter(){
    const e=activeEncounter;if(!e)return;
    // Each preview locks in the shown stats and chance for the next action.
    e.date=e.dates[e.index];e.foe=foeFor(e.mode);e.chance=probability(e.mode,e.foe);e.done=false;
  }
  function showEncounterStart(){
    const e=activeEncounter;if(!e)return;
    $('encounterBody').innerHTML='<div class="encounter-intro"><h2 id="encounterTitle">'+(e.mode==='battle'?'A Friendly Battle!':'The Crystal Mine')+'</h2>'+
      '<p>'+(e.mode==='battle'?'A little '+esc(e.foe.name)+' appears. Attack or flee?':'A mysterious rock is waiting. Try digging, or leave it for later?')+'</p></div>'+
      modalScene(e,false,false)+panelStats(e)+
      '<p class="encounter-attempt">Encounter '+(e.index+1)+' of '+e.dates.length+' · '+pending().length+' banked</p>'+
      '<div class="encounter-action-pair"><button type="button" class="encounter-action" data-encounter-step="act">'+(e.mode==='battle'?'⚔ ATTACK':'⛏ DIG')+'</button>'+
      '<button type="button" class="encounter-flee" data-encounter-step="flee">'+(e.mode==='battle'?'↩ FLEE':'↩ LEAVE')+'</button></div>';
  }
  function openEncounter(mode,batch){
    if(encounterDialog.open)return;
    const queue=pending();
    if(!queue.length){ctx.toast('No encounters banked yet. A closed 3/3 morning earns one.');return;}
    if(!state().starter){ctx.toast('Get the sword + pickaxe starter kit first (3 BP).');return;}
    activeEncounter={mode,dates:queue.slice(0,batch?queue.length:1),index:0,done:false};
    setCurrentEncounter();showEncounterStart();encounterDialog.showModal();
  }
  function resolveEncounter(){
    const e=activeEncounter;if(!e||e.done)return;
    const day=ctx.getData().days[e.date];
    if(!day||day.encounterUsed||ctx.regularBP(day)!==3){encounterDialog.close();ctx.toast('That encounter is no longer available.');return;}
    e.done=true;
    const success=Math.random()<e.chance, j=state(),foe=e.foe;
    const entry={date:e.date,at:new Date().toISOString(),mode:e.mode,level:foe.level,chance:pct(e.chance),success};
    let xp,headline,story;
    if(e.mode==='battle'){
      xp=success?4:1;
      entry.win=success;entry.enemy=foe.name;entry.attack=playerStats().attack;entry.enemyHealth=foe.hp;
      headline=success?'Battle won!':'The creature escaped!';
      story=success?'⚔ '+foe.name+' was impressed. +4 XP.':'⚔ '+foe.name+' hopped away. +1 XP for trying.';
    }else{
      xp=success?2:1;
      const roll=Math.random();
      const gem=roll<.58?'quartz':roll<.79?'ruby':roll<.93?'sapphire':'emerald';
      const qty=success&&gear('pickaxe').bonus>=4&&Math.random()<.3?2:1;
      entry.gem=success?gem:null;entry.qty=success?qty:0;entry.hardness=foe.hardness;
      if(success)j.gems[gem]+=qty;
      headline=success?'A crystal!':'Just ordinary stone';
      story=success?'⛏ Found '+qty+' '+labels[gem].split(' ').slice(1).join(' ')+'! +2 XP.':'⛏ No gemstone this time. +1 XP for practice.';
    }
    j.xp+=xp;
    entry.story=story;
    day.encounterUsed=e.mode;day.encounterUsedAt=entry.at;
    j.encounters.push(entry);
    ctx.save();ctx.refresh();
    $('encounterBody').innerHTML='<div class="encounter-intro"><h2 id="encounterTitle">'+headline+'</h2>'+
      '<p>'+(success?(e.mode==='battle'?'Your sword flashes! The little creature applauds.':'Your pickaxe strikes the stone and something glitters!'):(e.mode==='battle'?'You gave it a try — the creature scoots away safely.':'The rock cracks, but no gem appears today.'))+'</p></div>'+
      modalScene(e,true,success)+
      '<div class="encounter-loot"><strong>'+esc(story)+'</strong><p>+'+xp+' XP · '+(e.mode==='mine'&&success?'Gem stored in your collection.':'Your hero is learning!')+'</p>'+
      '<small>LEVEL '+level()+' · '+pending().length+' ENCOUNTERS REMAINING · NO BP SPENT</small></div>'+
      '<button class="encounter-action encounter-next" type="button" data-encounter-step="next">'+(e.index+1<e.dates.length?'NEXT ENCOUNTER →':'NEXT → JOURNEY')+'</button>';
  }
  $('encounterBody').addEventListener('click',event=>{
    const btn=event.target.closest('[data-encounter-step]');if(!btn)return;
    const step=btn.dataset.encounterStep;
    if(step==='act')resolveEncounter();
    else if(step==='flee'){encounterDialog.close();ctx.toast('You left safely. The encounter is still banked.');}
    else if(step==='next'){
      if(activeEncounter&&activeEncounter.done&&activeEncounter.index+1<activeEncounter.dates.length){
        activeEncounter.index++;
        setCurrentEncounter();showEncounterStart();
      }else encounterDialog.close();
    }
  });
  $('encounterClose').addEventListener('click',()=>encounterDialog.close());
  encounterDialog.addEventListener('close',()=>{activeEncounter=null;});
  function render(){
    const j=state(),available=pending().length,bal=wallet(),lv=level(),stones=stoneCount();
    const xpIn=j.xp%12;
    $('journeySummary').innerHTML='<div class="journey-stat"><span>YOUR BP</span><strong>'+bal+'</strong><small>'+spent()+' spent · '+ctx.totalBP()+' earned</small></div>'+
      '<div class="journey-stat"><span>HERO LEVEL</span><strong>'+lv+'</strong><small>'+xpIn+' / 12 XP to next</small></div>'+
      '<div class="journey-stat"><span>ENCOUNTERS</span><strong>'+available+'</strong><small>3/3 BP day = +1</small></div>';
    $('rewardShop').innerHTML=rewards.map(r=>'<div class="shop-row"><div class="shop-emoji">'+r.emoji+'</div><div class="shop-detail"><strong>'+r.name+'</strong><small>'+r.description+'</small></div><button type="button" data-action="reward" data-id="'+r.id+'" '+(bal<r.cost?'disabled':'')+'>'+r.cost+' BP</button></div>').join('')+
      '<p class="mini-muted">An adult confirms each real-world redemption. Redeemed points are deducted; daily achievements and history remain.</p>';
    const hasKit=!!j.starter;
    $('journeyControls').innerHTML=
      '<div class="pixel-party"><span aria-hidden="true">🛡️</span><div><strong>Explorer · Level '+lv+'</strong><small>⚔ ATK '+playerStats().attack+' · 🛡 DEF '+playerStats().defence+' · ⛏ MINING '+playerStats().mining+'</small></div><span class="skin-chip">'+esc(j.skin.toUpperCase())+'</span></div>'+
      '<div class="journey-kit-grid">'+kitCard('battle')+kitCard('mine')+'</div>'+
      (!hasKit?'<button class="wide-gold" type="button" data-action="starter" '+(bal<3?'disabled':'')+'>⚔ Get sword + pickaxe · 3 BP</button><p class="mini-muted">A one-time starter kit. Your saved encounters stay available while you earn it.</p>':
      '<div class="encounter-choices"><button data-action="battle" '+(!available?'disabled':'')+' type="button">⚔ BATTLE</button><button data-action="mine" '+(!available?'disabled':'')+' type="button">⛏ MINE</button></div>'+
      (available>1?'<div class="batch-choices"><button data-action="battle-all" type="button">Battle several ('+available+')</button><button data-action="mine-all" type="button">Mine several ('+available+')</button></div>':'')+
      '<p class="mini-muted">Each encounter is banked. Attack or Dig uses one encounter, but never costs BP. Flee/Leave keeps it for later.</p>')+
      (!available?'<p class="encounter-help">✦ No encounters banked. Finish a 3/3 BP morning to earn the next one.</p>':'<p class="encounter-help">✦ '+available+' encounter'+(available===1?'':'s')+' saved. Play them now or on another day!</p>');
    $('gearArea').innerHTML=
      '<div class="stone-bar"><strong>💎 STONES</strong><span>'+gems.map(g=>labels[g]+': '+j.gems[g]).join('  ·  ')+'</span></div>'+
      '<div class="upgrade-list">'+[
        ['sword','⚔ Sword technique','Increases Attack'],
        ['pickaxe','⛏ Mining technique','Improves mining odds'],
        ['armour','🛡 Defence technique','Increases Defence']
      ].map(([key,label,description])=>'<div class="upgrade-row"><div><strong>'+label+' · '+j[key]+'</strong><small>'+description+' · Next at hero level '+(j[key]+1)+'</small></div><button type="button" data-action="upgrade" data-id="'+key+'" '+(!hasKit||stones<(key==='armour'?2:1)||j[key]>=5||lv<j[key]+1?'disabled':'')+'>'+(key==='armour'?'2':'1')+' 💎</button></div>').join('')+'</div>'+
      '<div class="journey-shop-title">⚒ GEAR SHOP · EQUIP YOUR HERO</div>'+
      ['sword','pickaxe','armour'].map(cat=>
        '<div class="journey-store-group"><strong>'+esc(cat==='sword'?'⚔ SWORDS':cat==='pickaxe'?'⛏ PICKAXES':'🛡 ARMOUR')+'</strong>'+
        equipment[cat].filter(item=>item.cost>0).map(item=>{
          const owned=j.ownedGear[cat].includes(item.id),equipped=j.equippedGear[cat]===item.id;
          return '<div class="upgrade-row"><div><strong><span class="gear-swatch" style="background:'+item.color+'"></span> '+esc(item.name)+'</strong>'+
            '<small>+'+item.bonus+' '+(cat==='sword'?'ATK':cat==='pickaxe'?'Mining':'DEF')+' · Level '+item.level+' required</small></div>'+
            '<button type="button" data-action="item" data-kind="'+cat+'" data-id="'+item.id+'" '+(equipped||!owned&&(bal<item.cost||lv<item.level||!hasKit)?'disabled':'')+'>'+
            (equipped?'EQUIPPED':owned?'EQUIP':item.cost+' BP')+'</button></div>';
        }).join('')+'</div>').join('')+
      '<div class="journey-shop-title">🎨 HERO SKINS</div>'+
      '<div class="skin-options"><div>'+skinShop.map(item=>{
        const owned=j.skins.includes(item.id),selected=j.skin===item.id;
        return '<button type="button" data-action="skin" data-id="'+item.id+'" '+(selected||!owned&&wallet()<item.cost?'disabled':'')+'>'+
          '<span class="gear-swatch" style="background:'+item.top+'"></span> '+esc(item.name)+(selected?' ✓':owned?' · EQUIP':' · '+item.cost+' BP')+'</button>';
      }).join('')+'</div></div>';
    const recent=j.encounters.slice(-5).reverse();
    $('journeyLog').innerHTML=recent.length?recent.map(e=>'<div class="history-day"><div class="history-date"><strong>'+esc(e.mode==='battle'?'⚔ Battle':'⛏ Mining')+' · '+esc(e.date)+'</strong><small>'+esc(e.story)+'</small></div></div>').join(''):'<p class="empty-state">Your first friendly encounter will appear here.</p>';
  }
  $('journeyView').addEventListener('click',(event)=>{
    const button=event.target.closest('[data-action]');if(!button)return;
    const action=button.dataset.action, id=button.dataset.id;
    if(action==='starter') {
      if(state().starter)return;
      if(buy(3,'gear','Starter sword and pickaxe')){state().starter=true;state().sword=1;state().pickaxe=1;ctx.save();ctx.refresh();ctx.toast('Starter gear equipped! ⚔ ⛏');}
    }else if(action==='reward'){
      const reward=rewards.find(r=>r.id===id);if(!reward||!canSpend(reward.cost))return;
      if(!confirm('An adult must approve: redeem '+reward.cost+' BP for '+reward.name+'? This will spend the points.'))return;
      if(buy(reward.cost,'reward',reward.name)){
        state().spending[state().spending.length-1].status='awaiting-fulfilment';
        ctx.save();ctx.refresh();ctx.toast('Reward redeemed! Ask an adult to deliver it. 🎁');
      }
    }else if(action==='battle'||action==='mine'||action==='battle-all'||action==='mine-all'){
      openEncounter(action.startsWith('battle')?'battle':'mine',action.endsWith('-all'));
    }else if(action==='upgrade'){
      if(!state().starter||!['sword','pickaxe','armour'].includes(id)||state()[id]>=5)return;
      if(level()<state()[id]+1){ctx.toast('Level up to unlock the next upgrade!');return;}
      if(takeStones(id==='armour'?2:1)){state()[id]++;ctx.save();ctx.refresh();ctx.toast('Equipment upgraded! ✨');}
    }else if(action==='item'){
      const kind=button.dataset.kind;
      if(!['sword','pickaxe','armour'].includes(kind))return;
      const item=equipment[kind].find(x=>x.id===id);if(!item||!state().starter)return;
      const j=state(),owned=j.ownedGear[kind].includes(id);
      if(!owned){
        if(level()<item.level){ctx.toast('Level '+item.level+' needed first.');return;}
        if(!canSpend(item.cost))return;
        if(!confirm('Buy '+item.name+' for '+item.cost+' BP and equip it?'))return;
        if(!buy(item.cost,'equipment',item.name))return;
        j.ownedGear[kind].push(id);
      }
      j.equippedGear[kind]=id;ctx.save();ctx.refresh();ctx.toast(item.name+' equipped!');
    }else if(action==='skin'){
      const item=skinShop.find(x=>x.id===id);if(!item)return;
      const j=state();
      if(!j.skins.includes(id)){
        if(!canSpend(item.cost))return;
        if(!confirm('Buy the '+item.name+' skin for '+item.cost+' BP?'))return;
        if(!buy(item.cost,'skin',item.name))return;
        j.skins.push(id);
      }
      j.skin=id;ctx.save();ctx.refresh();ctx.toast('New skin equipped!');

    }
  });
  return {render,level,wallet,pending,spent};
};