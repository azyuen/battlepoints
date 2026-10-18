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
      return ctx.regularBP(d)===3&&!d.encounterUsed;
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
  function runEncounter(mode,batch) {
    const queue=pending();
    if(!queue.length){ctx.toast('Earn all 3 daily BP to unlock an encounter.');return;}
    if(!state().starter){ctx.toast('Get the starter sword + pickaxe first (3 BP).');return;}
    const count=batch?queue.length:1;
    const messages=[];
    for(const date of queue.slice(0,count)) {
      const day=ctx.getData().days[date];
      if(ctx.regularBP(day)!==3||day.encounterUsed)continue;
      const j=state(),when=new Date().toISOString();
      const enemyLv=1+Math.floor(j.encounters.filter(e=>e.mode==='battle'&&e.win).length/3);
      const encounter={date,at:when,mode,level:enemyLv};
      if(mode==='mine'){
        const roll=Math.random();
        const gem=roll<.64?'quartz':roll<.82?'ruby':roll<.94?'sapphire':'emerald';
        const qty=(j.pickaxe>=3&&Math.random()<.3)?2:1;
        j.gems[gem]+=qty;j.xp+=2;
        encounter.gem=gem;encounter.qty=qty;
        encounter.story='⛏ Found '+qty+' '+labels[gem].split(' ').slice(1).join(' ')+' stone'+(qty>1?'s':'')+'!';
        messages.push(encounter.story);
      }else{
        const attack=3+j.sword+Math.floor(level()/2);
        const enemyHealth=3+enemyLv*2;
        const enemyName=enemies[(enemyLv-1)%enemies.length].name;
        const win=Math.random()<Math.min(.98,Math.max(.55,.88+(attack-enemyHealth)*.04));
        j.xp+=win?4:2;
        encounter.win=win;encounter.enemy=enemyName;encounter.attack=attack;encounter.enemyHealth=enemyHealth;
        encounter.story=win?'⚔ '+enemyName+' befriended! +4 XP':'⚔ '+enemyName+' scampered away! +2 XP';
        messages.push(encounter.story);
      }
      day.encounterUsed=mode;day.encounterUsedAt=when;
      j.encounters.push(encounter);
    }
    ctx.save();ctx.refresh();
    const last=state().encounters[state().encounters.length-1];
    const creature=enemies[(Math.max(1,last?.level||1)-1)%enemies.length];
    $('encounterStage').innerHTML='<div class="encounter-result '+(mode==='battle'?'battle-anim':'mine-anim')+'">'+
      '<div class="encounter-scene">'+(mode==='battle'?enemyArt(creature):'<div class="gem-art" aria-label="Sparkling mineral stone">💎</div>')+'</div>'+
      '<strong>'+(batch?''+count+' encounters completed!':mode==='mine'?'Treasure discovered!':(last.win?'Battle won!':'Friendly battle finished!'))+'</strong>'+
      '<p>'+esc(batch?(messages.slice(0,3).join(' · ')+(messages.length>3?' · +'+(messages.length-3)+' more':'')):messages[0])+'</p>'+
      '<small>LEVEL '+level()+' · '+state().xp+' XP · '+pending().length+' ENCOUNTERS LEFT</small></div>';
    ctx.toast(batch?count+' encounters completed!':'Encounter completed! ✨');
  }
  function render(){
    const j=state(),available=pending().length,bal=wallet(),lv=level(),stones=stoneCount();
    const xpIn=j.xp%12;
    $('journeySummary').innerHTML='<div class="journey-stat"><span>YOUR BP</span><strong>'+bal+'</strong><small>'+spent()+' spent · '+ctx.totalBP()+' earned</small></div>'+
      '<div class="journey-stat"><span>HERO LEVEL</span><strong>'+lv+'</strong><small>'+xpIn+' / 12 XP to next</small></div>'+
      '<div class="journey-stat"><span>ENCOUNTERS</span><strong>'+available+'</strong><small>3/3 BP day = +1</small></div>';
    $('rewardShop').innerHTML=rewards.map(r=>'<div class="shop-row"><div class="shop-emoji">'+r.emoji+'</div><div class="shop-detail"><strong>'+r.name+'</strong><small>'+r.description+'</small></div><button type="button" data-action="reward" data-id="'+r.id+'" '+(bal<r.cost?'disabled':'')+'>'+r.cost+' BP</button></div>').join('')+
      '<p class="mini-muted">An adult confirms each real-world redemption. Redeemed points are deducted; daily achievements and history remain.</p>';
    const gear=j.starter;
    const sprite=document.querySelector('.hero-card .avatar');
    const heroArt=sprite?sprite.outerHTML:'🧑🏻‍🚀';
    $('journeyControls').innerHTML=
      '<div class="pixel-party"><div class="journey-character-avatar avatar-scene skin-'+esc(j.skin)+'" data-gear="'+(gear?(j.armour>0?3:2):0)+'">'+heroArt+'</div><div><strong>Explorer · Level '+lv+'</strong><small>⚔ Sword '+(gear?j.sword:0)+' · ⛏ Pickaxe '+(gear?j.pickaxe:0)+' · 🛡 Armour '+j.armour+'</small></div><span class="skin-chip">'+esc(j.skin.toUpperCase())+'</span></div>'+
      (!gear?'<button class="wide-gold" type="button" data-action="starter" '+(bal<3?'disabled':'')+'>⚔ Get sword + pickaxe · 3 BP</button><p class="mini-muted">A one-time starter kit: both tools for 3 BP. Your encounters wait safely until you have equipment.</p>':
      '<div class="encounter-choices"><button data-action="battle" '+(!available?'disabled':'')+' type="button">⚔ QUICK BATTLE</button><button data-action="mine" '+(!available?'disabled':'')+' type="button">⛏ QUICK MINE</button></div>'+
      (available>1?'<div class="batch-choices"><button data-action="battle-all" type="button">Battle all ('+available+')</button><button data-action="mine-all" type="button">Mine all ('+available+')</button></div>':'')+
      '<p class="mini-muted">One tap = one encounter (a few seconds). You can save them and use many together.</p>')+
      (!available?'<p class="encounter-help">✦ All done for now. Earn all 3 regular Battle Points on a morning to receive another encounter.</p>':'<p class="encounter-help">✦ '+available+' encounter'+(available===1?'':'s')+' ready. Pick a friendly battle or dig for gems!</p>');
    $('gearArea').innerHTML=
      '<div class="stone-bar"><strong>💎 STONES</strong><span>'+gems.map(g=>labels[g]+': '+j.gems[g]).join('  ·  ')+'</span></div>'+
      '<div class="upgrade-list">'+[
        ['sword','⚔ Sword','Increase attack strength'],
        ['pickaxe','⛏ Pickaxe','Higher chance of extra stones'],
        ['armour','🛡 Armour','Upgrade your hero’s equipment']
      ].map(([key,label,description])=>'<div class="upgrade-row"><div><strong>'+label+' · '+(key==='armour'?j.armour:gear?j[key]:0)+'</strong><small>'+description+' · Next at hero level '+(j[key]+1)+'</small></div><button type="button" data-action="upgrade" data-id="'+key+'" '+(!gear||stones<(key==='armour'?2:1)||j[key]>=5||lv<j[key]+1?'disabled':'')+'>'+(key==='armour'?'2':'1')+' 💎</button></div>').join('')+'</div>'+
      '<div class="skin-options"><strong>🎨 SKINS</strong><div>'+[
        ['blue','Blue','🔵'],['forest','Forest','🟢'],['sunset','Sunset','🟠']
      ].map(([key,label,icon])=>'<button type="button" data-action="skin" data-id="'+key+'" '+(j.skin===key?'disabled':(!j.skins.includes(key)&&stones<2?'disabled':''))+'>'+icon+' '+label+' '+(j.skin===key?' ✓':j.skins.includes(key)?' · Equip':' · 2 💎')+'</button>').join('')+'</div></div>';
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
      runEncounter(action.startsWith('battle')?'battle':'mine',action.endsWith('-all'));
    }else if(action==='upgrade'){
      if(!state().starter||!['sword','pickaxe','armour'].includes(id)||state()[id]>=5)return;
      if(level()<state()[id]+1){ctx.toast('Level up to unlock the next upgrade!');return;}
      if(takeStones(id==='armour'?2:1)){state()[id]++;ctx.save();ctx.refresh();ctx.toast('Equipment upgraded! ✨');}
    }else if(action==='skin'){
      if(!['blue','forest','sunset'].includes(id))return;
      if(!state().skins.includes(id)){if(!takeStones(2))return;state().skins.push(id);}
      state().skin=id;ctx.save();ctx.refresh();ctx.toast('New look equipped! ✨');
    }
  });
  return {render,level,wallet,pending,spent};
};