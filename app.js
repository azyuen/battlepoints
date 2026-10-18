/* BattlePoints: no accounts, trackers, or external runtime dependencies. */
'use strict';
(function () {
  const KEY = 'battlepoints-morning-v1';
  const DEV_KEY = 'battlepoints-dev-sandbox-v1';
  const DEV_UNLOCK_KEY = 'battlepoints-dev-device-unlocked-v1';
  const DEV_ACTIVE_KEY = 'battlepoints-dev-active-v1';
  const DEV_DATE_KEY = 'battlepoints-dev-current-date-v1';
  const quests = [
    {id:'morning', icon:'🛏️', title:'Morning Routine', subtitle:'Bedroom and getting dressed', tasks:[
      ['bed','Make my bed'], ['purifier','Turn off the purifier'],
      ['face','Wash my face'], ['sunscreen','Put on sunscreen'],
      ['uniform','Get dressed in uniform'], ['clothes','Put away bed clothes']
    ]},
    {id:'kitchen', icon:'🍳', title:'Kitchen & Bathroom', subtitle:'Breakfast and getting clean', tasks:[
      ['egg','Make my egg'], ['milk','Make my milk'], ['kitchen_done','Kitchen complete'],
      ['teeth_nose','Brush teeth and clean nose'], ['toilet_hands','Toilet and wash hands'],
      ['bathroom_done','Bathroom complete']
    ]},
    {id:'school', icon:'🎒', title:'Ready for School', subtitle:'Pack everything and head out', tasks:[
      ['lunchbox','Put lunchbox in bag'], ['water','Fill water bottle'],
      ['zip','Zip school bag'], ['bag_check','Check bag checklist']
    ]}
  ];
  const taskCount = quests.reduce((n,q) => n + q.tasks.length,0);
  const $ = (id) => document.getElementById(id);
  function todayKey(d = new Date()) {return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
  function emptyData() {return {version:1, settings:{}, days:{}};}
  function loadData(key=KEY) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || 'null');
      if (data && data.version === 1 && data.days && typeof data.days === 'object' && data.settings && typeof data.settings === 'object') return data;
    } catch (e) {console.warn('Saved progress could not be loaded',e);}
    return emptyData();
  }
  let liveData = loadData(KEY);
  let devData = loadData(DEV_KEY);
  let devUnlocked = localStorage.getItem(DEV_UNLOCK_KEY)==='1';
  let devActive = devUnlocked && localStorage.getItem(DEV_ACTIVE_KEY)==='1';
  devData.settings = liveData.settings;
  let data = devActive ? devData : liveData;
  const savedDevDate = localStorage.getItem(DEV_DATE_KEY);
  let currentDate = devActive && /^\d{4}-\d{2}-\d{2}$/.test(savedDevDate||'') ? savedDevDate : todayKey();
  let expandedQuest = 'morning';
  let activeTab = 'quests';
  let adultUnlocked = false;
  let pendingParentAction = 'dashboard';
  let journey = null;
  let toastTimer = null;
  let timerMinutes = 5, remainingSeconds = 300, timerRunning = false, timerDeadline = 0;
  function renderDevControls() {
    $('devQuickToggle').hidden=!devUnlocked;
    $('devQuickToggle').textContent=devActive?'🧪 EXIT DEV · LIVE PROFILE':'🧪 ENTER DEV PROFILE';
    $('devQuickToggle').classList.toggle('active',devActive);
    $('devPanel').hidden=!devActive;
    document.body.classList.toggle('dev-active',devActive);
    if(!devActive)return;
    $('devDateLabel').textContent=currentDate;
    $('devWallet').textContent=(journey?journey.wallet():totalBP())+' BP READY';
  }
  function setDevActive(enabled) {
    if(enabled&&!devUnlocked)return;
    // The live and dev save files never copy task history, rewards or Journey progress.
    devActive=!!enabled;
    localStorage.setItem(DEV_ACTIVE_KEY,devActive?'1':'0');
    data=devActive?devData:liveData;
    if(devActive) {
      devData.settings=liveData.settings;
      const remembered=localStorage.getItem(DEV_DATE_KEY);
      currentDate=remembered&&/^\d{4}-\d{2}-\d{2}$/.test(remembered)?remembered:todayKey();
      adultUnlocked=true;
    }else{
      currentDate=todayKey();
      adultUnlocked=false;
    }
    expandedQuest='morning';
    save();
    switchTab('quests');
    render();
  }
  function changeDevDate(amount) {
    if(!devActive)return;
    const d=new Date(currentDate+'T12:00:00');
    if(Number.isNaN(d.getTime()))return;
    d.setDate(d.getDate()+amount);
    currentDate=todayKey(d);
    localStorage.setItem(DEV_DATE_KEY,currentDate);
    expandedQuest='morning';
    dayFor(currentDate);save();render();
  }
  function finishDevMorning() {
    if(!devActive)return;
    const day=currentDay();
    if(day.endedAt){showToast('Test morning already ended. Choose another day.');return;}
    for(const quest of quests)for(const [id] of quest.tasks)day.tasks[id]={done:true,at:new Date().toISOString()};
    day.risks={};
    day.startedAt=day.startedAt||new Date().toISOString();
    day.finishedAt=new Date().toISOString();
    day.finalRegularBP=3;
    day.finalBonusBP=claimedBP(day);
    day.endedAt=new Date().toISOString();
    save();render();
    showToast('Test morning completed · +3 BP and encounter');
  }
  function completeDevTasks() {
    if(!devActive)return;
    const day=currentDay();
    if(day.endedAt){showToast('This test morning is closed.');return;}
    for(const quest of quests)for(const [id] of quest.tasks)day.tasks[id]={done:true,at:new Date().toISOString()};
    day.risks={};
    day.startedAt=day.startedAt||new Date().toISOString();
    day.finishedAt=new Date().toISOString();
    save();render();
    showToast('All steps checked in TEST profile');
  }
  function grantDevPoints(n) {
    if(!devActive)return;
    const day=currentDay();
    day.devBP=Math.max(0,Number(day.devBP)||0)+n;
    save();render();
    showToast('+'+n+' TEST BP · not a regular quest point');
  }
  $('devQuickToggle').addEventListener('click',()=>setDevActive(!devActive));
  $('devPrev').addEventListener('click',()=>changeDevDate(-1));
  $('devNext').addEventListener('click',()=>changeDevDate(1));
  $('devComplete').addEventListener('click',completeDevTasks);
  $('devFinish').addEventListener('click',finishDevMorning);
  $('devAddOne').addEventListener('click',()=>grantDevPoints(1));
  $('devAddFive').addEventListener('click',()=>grantDevPoints(5));
  $('devAddXP').addEventListener('click',()=>{
    if(!devActive)return;
    if(!data.journey)data.journey={};
    data.journey.xp=(Math.max(0,Number(data.journey.xp)||0))+12;
    save();render();showToast('+12 TEST XP — one hero level');
  });
  $('devAddGems').addEventListener('click',()=>{
    if(!devActive)return;
    if(!data.journey)data.journey={};
    if(!data.journey.gems)data.journey.gems={};
    for(const [gem,n] of [['quartz',3],['ruby',1],['sapphire',1]]){
      data.journey.gems[gem]=(Math.max(0,Number(data.journey.gems[gem])||0))+n;
    }
    save();render();showToast('+5 TEST gems added');
  });
  $('devResetDay').addEventListener('click',()=>{
    if(!devActive||!confirm('Reset this TEST date? LIVE data stays safe. Encounters used on this date remain spent.'))return;
    const old=currentDay();
    data.days[currentDate]={tasks:{},bonuses:[],startedAt:null,encounterUsed:old.encounterUsed||null,encounterUsedAt:old.encounterUsedAt||null};
    save();render();showToast('Test date reset');
  });
  $('devResetAll').addEventListener('click',()=>{
    if(!devActive||!confirm('Delete ALL TEST BP, dates, encounters and equipment on this device? LIVE history will not change.'))return;
    devData=emptyData();
    devData.settings=liveData.settings;
    data=devData;
    currentDate=todayKey();
    localStorage.setItem(DEV_DATE_KEY,currentDate);
    dayFor(currentDate);
    save();render();showToast('Test profile reset');
  });
  function dayFor(key) {
    if (!data.days[key]) data.days[key] = {tasks:{},bonuses:[],startedAt:null};
    const day = data.days[key];
    if (!day.tasks || typeof day.tasks !== 'object') day.tasks = {};
    if (!Array.isArray(day.bonuses)) day.bonuses = [];
    return day;
  }
  function save() {
    try {localStorage.setItem(devActive?DEV_KEY:KEY,JSON.stringify(data));}
    catch(e){showToast('Device storage is full or unavailable');}
  }
  function currentDay() {return dayFor(currentDate);}
  function ensureDate() {
    if(devActive)return;
    const key = todayKey();
    if (key !== currentDate) {currentDate = key; expandedQuest = 'morning';dayFor(key);save();render();}
  }
  function taskDone(day,id) {return Boolean(day.tasks[id] && day.tasks[id].done);}
  function completedSteps(day) {return quests.reduce((n,q)=>n+q.tasks.filter(t=>taskDone(day,t[0])).length,0);}
  function questDone(day,q) {return q.tasks.every(t=>taskDone(day,t[0]));}
  function regularBP(day) {if(day.endedAt&&Number.isInteger(day.finalRegularBP))return day.finalRegularBP;return quests.filter(q=>questDone(day,q)&&!(day.risks&&day.risks[q.id]&&day.risks[q.id].forfeited)).length;}
  function claimedBP(day) {if(day.endedAt&&Number.isInteger(day.finalBonusBP))return day.finalBonusBP;return day.bonuses.reduce((n,b)=>n+(b.claimedAt ? Number(b.amount)||0 : 0),0);}
  function allBP(day) {return regularBP(day)+claimedBP(day)+(devActive?Math.max(0,Number(day.devBP)||0):0);}
  function totalBP() {return Object.values(data.days).reduce((n,d)=>n+allBP(d),0);}
  function level() {return journey ? journey.level() : 1;}
  function esc(str) {return String(str).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function friendlyDate(key) {const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'});}
  function showToast(message) {
    const node=$('toast');node.textContent=message;node.classList.add('show');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),2600);
  }
  function cheer(label) {
    const avatar=$('avatarScene'),float=$('floatingPoints');
    float.textContent=label;float.classList.remove('animate');avatar.classList.remove('celebrate');
    void avatar.offsetWidth;
    float.classList.add('animate');avatar.classList.add('celebrate');
    setTimeout(()=>avatar.classList.remove('celebrate'),750);
  }
  function markTask(id,checked) {
    const day=currentDay();if(day.endedAt)return;const oldBP=regularBP(day);
    if (!day.startedAt) day.startedAt=new Date().toISOString();
    day.tasks[id]={done:checked,at:new Date().toISOString()};
    if (regularBP(day)===3) day.finishedAt=new Date().toISOString();
    else day.finishedAt=null;
    save();render();
    if(regularBP(day)>oldBP) {cheer('+1 BP');showToast('Quest complete! +1 Battle Point ✨');}
  }
  function renderQuests() {
    const day=currentDay(),locked=Boolean(day.endedAt);
    $('questList').innerHTML=quests.map(q=>{
      const complete=questDone(day,q);
      const count=q.tasks.filter(t=>taskDone(day,t[0])).length;
      const open=expandedQuest===q.id;
      const risk=(day.risks&&day.risks[q.id])||{};
      const rows=q.tasks.map(([id,label])=>'<label class="task-row"><input type="checkbox" data-task="'+id+'" '+(locked?'disabled ':'')+(taskDone(day,id)?'checked':'')+'><span class="tickbox" aria-hidden="true">✓</span><span class="task-label">'+esc(label)+'</span></label>').join('');
      const riskTools=locked?(risk.forfeited||risk.armed?'<div class="risk-closed">'+(risk.forfeited?'⚠ BP forfeited':'⚠ Risk noted')+'</div>':''):'<div class="risk-row '+(risk.forfeited?'risk-forfeited':risk.armed?'risk-armed':'')+'"><div><strong>⚠ Risk BP</strong><small>'+(risk.forfeited?'BP forfeited for this quest.':risk.armed?'This point is at risk. An adult can forfeit it below.':'Adult can put this point at risk; no PIN required.')+'</small></div><button type="button" data-risk="'+(risk.armed?'clear':'arm')+'" data-id="'+q.id+'">'+(risk.armed?'CLEAR RISK':'⚠ RISK BP')+'</button></div>'+(risk.armed&&!risk.forfeited?'<button class="risk-forfeit-btn" type="button" data-risk="forfeit" data-id="'+q.id+'">Forfeit this quest’s 1 BP</button>':'');
      return '<article class="quest-card '+(complete?'finished':'')+'"><button class="quest-toggle" type="button" data-quest="'+q.id+'" '+(locked?'disabled ':'')+'aria-expanded="'+open+'" aria-controls="panel-'+q.id+'"><span class="quest-emoji" aria-hidden="true">'+q.icon+'</span><span><span class="quest-title">'+q.title+'</span><span class="quest-sub">'+count+' / '+q.tasks.length+' steps done'+(risk.armed?' · ⚠ AT RISK':'')+'</span></span><span class="quest-side"><span class="bp-label">'+(risk.forfeited?'0 BP':complete?'✓ 1 BP':'+1 BP')+'</span><span class="quest-arrow" aria-hidden="true">'+(open?'⌃':'⌄')+'</span></span></button>'+(open?'<div class="quest-body" id="panel-'+q.id+'">'+rows+riskTools+(complete?'<p class="quest-win">'+(risk.forfeited?'⚠ LIST COMPLETE · BP FORFEITED':'★ QUEST COMPLETE · +1 BP ★')+'</p>':'')+'</div>':'')+'</article>';
    }).join('');
    $('completeCount').textContent=regularBP(day)+' / 3';
    $('dailyPoints').textContent=regularBP(day);
    $('dailyMeter').setAttribute('aria-valuenow',String(regularBP(day)));
    $('meterFill').style.width=(regularBP(day)/3*100)+'%';
    $('taskSummary').textContent=completedSteps(day)+' / '+taskCount+' steps done';
    $('heroLevel').textContent='LEVEL '+level()+' EXPLORER · '+(journey?journey.wallet():totalBP())+' BP AVAILABLE';
    $('avatarScene').dataset.gear=String(regularBP(day));
  }
  function renderBonuses() {
    const day=currentDay(),locked=Boolean(day.endedAt),pending=day.bonuses.filter(b=>!b.claimedAt),claimed=day.bonuses.filter(b=>b.claimedAt);
    const pianoAlready=day.bonuses.some(b=>b.type==='piano');
    $('bonusBadge').textContent=locked?'DAY CLOSED':pending.length+' READY';
    const rows='<div class="bonus-shortcuts"><div class="bonus-shortcut"><span class="bonus-big-icon">🎹</span><div><strong>Piano +1 BP</strong><small>Adult approves practice</small></div><button type="button" data-bonus="piano" '+(pianoAlready||locked?'disabled':'')+'>'+(pianoAlready?'OFFERED':'🔒 APPROVE')+'</button></div><div class="bonus-shortcut"><span class="bonus-big-icon">🌟</span><div><strong>Extra bonus point</strong><small>Adult adds a reason</small></div><button type="button" data-bonus="other" '+(locked?'disabled':'')+'>🔒 ADD</button></div></div>';
    const renderBonus=b=>'<div class="bonus-item"><div><strong>'+esc(b.type==='piano'?'🎹 Piano bonus':'🌟 Special bonus')+' · +'+Number(b.amount)+' BP</strong><p>'+esc(b.reason)+'</p></div>'+(b.claimedAt?'<span class="claimed-mark">✓ CLAIMED</span>':locked?'<span class="claimed-mark">NOT CLAIMED</span>':'<button class="claim-button" type="button" data-claim="'+esc(b.id)+'">CLAIM +'+Number(b.amount)+'</button>')+'</div>';
    $('bonusList').innerHTML=rows+pending.map(renderBonus).join('')+claimed.map(renderBonus).join('');
  }
  function renderHealth() {const day=currentDay(),health=day.health||{};$('healthVitamin').checked=!!(health.vitamins&&health.vitamins.done);$('healthMedication').checked=!!(health.medication&&health.medication.done);$('healthVitamin').disabled=!!day.endedAt;$('healthMedication').disabled=!!day.endedAt;}
  function render() {const day=currentDay(),closed=Boolean(day.endedAt);$('questView').classList.toggle('morning-ended',closed);$('endMorning').disabled=closed;$('endMorning').textContent=closed?'MORNING ENDED · '+(regularBP(day)+claimedBP(day))+' BP LOCKED':'END THE MORNING';$('endMorningHint').textContent=closed?'The day is finished. Come back tomorrow for a fresh checklist.':'Finish for today. The checklist and Battle Points will be locked until tomorrow.';renderQuests();renderBonuses();renderHealth();if(activeTab==='journey'&&journey)journey.render();if(adultUnlocked&&$('statsHighlights'))renderStats();renderDevControls();}
  $('healthReminders').addEventListener('change',(e)=>{const id=e.target.dataset.health;if(id!=='vitamins'&&id!=='medication')return;const day=currentDay();if(day.endedAt)return;if(!day.health)day.health={};day.health[id]={done:e.target.checked,at:new Date().toISOString()};save();});
  $('questList').addEventListener('click',(e)=>{
    if(currentDay().endedAt)return;
    const button=e.target.closest('[data-quest]');
    if (button) {expandedQuest=expandedQuest===button.dataset.quest?null:button.dataset.quest;renderQuests();return;}
    const risk=e.target.closest('[data-risk]');if(!risk)return;
    const qid=risk.dataset.id,action=risk.dataset.risk,day=currentDay();if(!quests.some(q=>q.id===qid))return;
    if(!day.risks)day.risks={};const old=day.risks[qid]||{};
    if(action==='arm'){day.risks[qid]={armed:true,forfeited:false,at:new Date().toISOString()};}
    else if(action==='clear'){day.risks[qid]={armed:false,forfeited:false,at:new Date().toISOString()};}
    else if(action==='forfeit'){if(!old.armed||!confirm('Forfeit this quest’s 1 BP? This may also remove the day’s encounter eligibility.'))return;day.risks[qid]={...old,forfeited:true,forfeitedAt:new Date().toISOString()};}
    save();render();showToast(action==='forfeit'?'1 BP forfeited':action==='arm'?'BP at risk':'Risk cleared');
  });
  $('questList').addEventListener('change',(e)=>{
    if(e.target.matches('[data-task]')) markTask(e.target.dataset.task,e.target.checked);
  });
  $('bonusList').addEventListener('click',(e)=>{
    if(currentDay().endedAt)return;
    const quick=e.target.closest('[data-bonus]');if(quick&&!quick.disabled){openParentGate(quick.dataset.bonus);return;}
    const btn=e.target.closest('[data-claim]');if(!btn)return;
    const item=currentDay().bonuses.find(b=>b.id===btn.dataset.claim&&!b.claimedAt);
    if(!item)return;
    item.claimedAt=new Date().toISOString();save();render();cheer('+'+item.amount+' BONUS');showToast('Bonus claimed! '+item.amount+' Battle Point'+(item.amount===1?'':'s')+' ✨');
  });
  function clockTick() {
    const now=new Date();
    // The sticky countdown replaces the time-of-day clock.
    const key=todayKey(now);if(key!==currentDate)ensureDate();
  }
  function clampMinutes(value) {const n=Number(value);return Number.isFinite(n)?Math.max(1,Math.min(120,Math.round(n))):5;}
  function readMinutes() {timerMinutes=clampMinutes($('timerMinutes').value);$('timerMinutes').value=timerMinutes;return timerMinutes;}
  function renderTimer() {
    const value=Math.max(0,Math.ceil(remainingSeconds));
    $('timerDisplay').textContent=String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');
    $('timerStatus').textContent=value===0?"DONE!":timerRunning?'RUNNING':'MINUTES';
    $('timerToggle').textContent=timerRunning?'❚❚':'▶';
    $('timerToggle').setAttribute('aria-label',timerRunning?'Pause countdown':'Start countdown');
    $('timerMinutes').disabled=timerRunning;
    $('minutePlus').disabled=timerRunning;
    $('minuteMinus').disabled=timerRunning;
  }
  function timerTick() {
    if(timerRunning) {
      remainingSeconds=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));
      if(remainingSeconds<=0){timerRunning=false;showToast("Timer finished! Nice work ⏱");}
      renderTimer();
    }
  }
  $('minuteMinus').addEventListener('click',()=>{if(timerRunning)return;timerMinutes=clampMinutes(readMinutes()-1);$('timerMinutes').value=timerMinutes;remainingSeconds=timerMinutes*60;renderTimer();});
  $('minutePlus').addEventListener('click',()=>{if(timerRunning)return;timerMinutes=clampMinutes(readMinutes()+1);$('timerMinutes').value=timerMinutes;remainingSeconds=timerMinutes*60;renderTimer();});
  $('timerMinutes').addEventListener('change',()=>{if(timerRunning)return;remainingSeconds=readMinutes()*60;renderTimer();});
  $('timerToggle').addEventListener('click',()=>{
    if(timerRunning){timerTick();timerRunning=false;}
    else{if(remainingSeconds<=0)remainingSeconds=readMinutes()*60;timerDeadline=Date.now()+remainingSeconds*1000;timerRunning=true;}
    renderTimer();
  });
  $('timerReset').addEventListener('click',()=>{timerRunning=false;remainingSeconds=readMinutes()*60;renderTimer();});
  function switchTab(which) {
    const previous=activeTab;
    activeTab=which;
    $('questView').hidden=which!=='quests';
    $('journeyView').hidden=which!=='journey';
    $('navQuests').classList.toggle('active',which==='quests');
    $('navJourney').classList.toggle('active',which==='journey');
    $('navQuests').setAttribute('aria-current',which==='quests'?'page':'false');
    $('navJourney').setAttribute('aria-current',which==='journey'?'page':'false');
    if(previous==='journey'&&which!=='journey'&&!devActive)adultUnlocked=false;
    if(which==='journey'&&journey)journey.render();
    window.scrollTo({top:0,behavior:'instant'});
  }
  $('navQuests').addEventListener('click',()=>switchTab('quests'));
  $('endMorning').addEventListener('click',()=>{
    const day=currentDay();if(day.endedAt)return;
    day.finalRegularBP=regularBP(day);day.finalBonusBP=claimedBP(day);
    day.endedAt=new Date().toISOString();save();render();
  });
  $('navJourney').addEventListener('click',()=>openParentGate('journey'));
  function lastDays(n) {
    const out=[];const date=devActive?new Date(currentDate+'T12:00:00'):new Date();date.setHours(12,0,0,0);
    for(let i=n-1;i>=0;i--){const d=new Date(date);d.setDate(date.getDate()-i);out.push(todayKey(d));}
    return out;
  }
  function renderStats() {
    const keys=lastDays(7);
    const today=currentDay();
    const finished=Object.values(data.days).filter(d=>regularBP(d)===3).length;
    const bp=totalBP();
    const week=keys.reduce((n,k)=>n+(data.days[k]?allBP(data.days[k]):0),0);
    $('statsHighlights').innerHTML=[[''+bp,'EARNED BP'],[''+finished,'3/3 DAYS'],[''+week,'7-DAY BP']].map(([v,label])=>'<div class="stat-block"><strong>'+v+'</strong><small>'+label+'</small></div>').join('');
    $('weekChart').innerHTML=keys.map(k=>{
      const day=data.days[k];const value=day?regularBP(day):0;
      const label=new Date(Number(k.slice(0,4)),Number(k.slice(5,7))-1,Number(k.slice(8))).toLocaleDateString('en-AU',{weekday:'short'});
      return '<div class="chart-col '+(k===currentDate?'today':'')+'"><strong>'+value+'</strong><div class="chart-bar-track"><div class="chart-fill" style="height:'+(value/3*100)+'%"></div></div><small>'+label+'</small></div>';
    }).join('');
    const entries=Object.entries(data.days).filter(([k,d])=>d.startedAt||completedSteps(d)||d.bonuses.length).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,30);
    $('historyList').innerHTML=entries.length?entries.map(([k,d])=>{
      const time=d.endedAt?'Morning ended '+new Date(d.endedAt).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true}):d.finishedAt?'Quests done '+new Date(d.finishedAt).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true}):'Not all quests finished';
      return '<div class="history-day"><div class="history-date"><strong>'+friendlyDate(k)+'</strong><small>'+completedSteps(d)+' / '+taskCount+' steps · '+esc(time)+'</small></div><div class="history-score">'+regularBP(d)+'/3'+(claimedBP(d)?' +'+claimedBP(d)+' ★':'')+' BP</div></div>';
    }).join(''):'<p class="empty-state">Your adventure log will appear after the first completed task.</p>';
  }
  async function pinHash(salt,pin) {
    const raw=new TextEncoder().encode(salt+':'+pin);
    const hash=await crypto.subtle.digest('SHA-256',raw);
    return Array.from(new Uint8Array(hash)).map(v=>v.toString(16).padStart(2,'0')).join('');
  }
  function validPin(pin) {return /^\d{4,8}$/.test(pin);}
  const dialog=$('parentDialog');
  function openParentGate(action) {
    if(devActive){
      pendingParentAction=action;adultUnlocked=true;
      if(action==='journey'){switchTab('journey');return;}
      $('parentDialogTitle').textContent='🧪 Dev control room';
      if(action==='piano')addBonus('piano','Completed piano practice',1);
      else if(action==='other'){renderQuickBonus();if(!dialog.open)dialog.showModal();}
      else {renderParentDashboard();if(!dialog.open)dialog.showModal();}
      return;
    }
    if(currentDay().endedAt&&(action==='piano'||action==='other')){showToast('The morning has ended. Bonuses are locked.');return;}
    pendingParentAction=action;adultUnlocked=false;
    $('parentDialogTitle').textContent=action==='journey'?'Unlock Battle Journey':action==='piano'?'🎹 Piano bonus':action==='other'?'🌟 Extra bonus':'Adult control room';
    renderParentLock();
    if(!dialog.open)dialog.showModal();
  }
  $('navParent').addEventListener('click',()=>openParentGate('dashboard'));
  dialog.addEventListener('close',()=>{adultUnlocked=false;});
  function addBonus(type,reason,amount) {
    const day=currentDay();if(day.endedAt){showToast('Morning has already ended');return false;}
    if(type==='piano'&&day.bonuses.some(b=>b.type==='piano')){showToast('Piano already offered today');return false;}
    day.bonuses.push({id:'b'+Date.now()+'-'+Math.floor(Math.random()*1000000),type,reason,amount,createdAt:new Date().toISOString(),claimedAt:null});
    save();render();dialog.close();showToast('Bonus available for Ethan to claim ★');return true;
  }
  function renderQuickBonus() {
    if(currentDay().endedAt){renderParentDashboard();return;}
    $('parentBody').innerHTML='<p class="parent-copy">Describe what Ethan did. He can then claim the bonus.</p><form class="form-stack" id="quickBonusForm"><label>Reason<textarea id="quickReason" rows="2" maxlength="180" required placeholder="What did Ethan do well?"></textarea></label><label>Bonus amount<select id="quickAmount"><option value="1">+1 Battle Point</option><option value="2">+2 Battle Points</option></select></label><button class="primary-wide" type="submit">MAKE BONUS AVAILABLE</button></form>';
    $('quickBonusForm').addEventListener('submit',e=>{e.preventDefault();const text=$('quickReason').value.trim();if(text)addBonus('other',text,Number($('quickAmount').value));});
  }
  function renderParentLock() {
    const setup=!liveData.settings.hash;
    $('parentBody').innerHTML='<p class="parent-copy">'+(setup?'First visit: create a 4–8 digit PIN to keep bonus decisions in adult hands.':'Enter your adult PIN to approve bonus rewards and manage backups.')+'</p><form id="parentLockForm" class="form-stack"><label>Adult PIN<input id="adultPin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" autocomplete="off" required></label>'+(setup?'<label>Confirm PIN<input id="adultPinConfirm" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" autocomplete="off" required></label>':'')+'<div id="pinError" class="form-error" role="alert"></div><button type="submit" class="primary-wide">'+(setup?'CREATE ADULT PIN':'UNLOCK REWARDS')+'</button></form><p class="mini-muted">The PIN is a simple family gate, not strong security. All records stay on this device.</p>';
    $('parentLockForm').addEventListener('submit',async (e)=>{
      e.preventDefault();
      const pin=$('adultPin').value;
      if(!validPin(pin)){$('pinError').textContent='Choose 4–8 digits.';return;}
      if(setup){
        if(pin!==$('adultPinConfirm').value){$('pinError').textContent='PINs do not match.';return;}
        try{
          const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
          const salt=Array.from(bytes).map(v=>v.toString(16).padStart(2,'0')).join('');
          liveData.settings={salt,hash:await pinHash(salt,pin)};data.settings=liveData.settings;localStorage.setItem(KEY,JSON.stringify(liveData));save();
        }catch(e){$('pinError').textContent='Secure PIN setup requires HTTPS or localhost.';return;}
      }else{
        try{
          if(await pinHash(liveData.settings.salt,pin)!==liveData.settings.hash){$('pinError').textContent='Incorrect PIN. Try again.';return;}
        }catch(e){$('pinError').textContent='PIN verification unavailable in this browser.';return;}
      }
      adultUnlocked=true;
      if(pendingParentAction==='journey'){dialog.close();switchTab('journey');}
      else if(pendingParentAction==='piano')addBonus('piano','Completed piano practice',1);
      else if(pendingParentAction==='other')renderQuickBonus();
      else renderParentDashboard();
    });
  }
  function renderRewardRequests() {
    const target=$('claimedRewardsAdmin');if(!target)return;
    const records=((data.journey&&data.journey.spending)||[]).filter(x=>x.kind==='reward').slice().reverse();
    target.innerHTML=records.length?records.map(r=>'<div class="pending-row"><span>'+esc(r.label)+' · '+Number(r.cost)+' BP<br><small>'+esc(r.status==='delivered'?'✓ Delivered':'⏳ Awaiting delivery')+'</small></span>'+(r.status==='delivered'?'':'<button type="button" data-fulfil="'+esc(r.id)+'">MARK DELIVERED</button>')+'</div>').join(''):'<p class="mini-muted">No real-life rewards redeemed yet.</p>';
  }
  function renderParentDashboard() {
    if(!adultUnlocked)return;
    const day=currentDay(),pianoAlready=day.bonuses.some(b=>b.type==='piano');
    const pending=day.bonuses.filter(b=>!b.claimedAt);
    $('parentBody').innerHTML='<p class="parent-copy">Choose a reason to make a bonus available. Ethan then taps CLAIM on his checklist to receive the points.</p>'+
      '<form id="bonusForm" class="form-stack"><label>Bonus type<select id="bonusType"><option value="piano" '+(pianoAlready?'disabled':'')+'>🎹 Piano practice (1 BP)</option><option value="other" '+(pianoAlready?'selected':'')+'>🌟 Other special effort</option></select></label>'+
      '<label>Reason for awarding it<textarea id="bonusReason" maxlength="180" rows="2" placeholder="What did Ethan do well?" required>'+(pianoAlready?'':'Completed piano practice')+'</textarea></label>'+
      '<label>Points<select id="bonusAmount"><option value="1">+1 BP</option><option value="2">+2 BP (special effort)</option></select></label>'+
      '<div id="bonusError" class="form-error" role="alert"></div><button type="submit" class="primary-wide">MAKE BONUS AVAILABLE</button></form>'+
      '<div class="parent-section"><h3>Waiting to be claimed</h3><div id="pendingAdmin">'+(pending.length?pending.map(b=>'<div class="pending-row"><span>'+esc(b.reason)+' · +'+Number(b.amount)+' BP</span><button type="button" data-cancel="'+esc(b.id)+'">CANCEL</button></div>').join(''):'<p class="mini-muted">No unclaimed bonuses right now.</p>')+'</div></div>'+
      '<div class="parent-section"><h3>Keep a backup</h3><p class="mini-muted">Your records are only saved in this browser. Export a backup before changing devices, clearing site data, or reinstalling.</p><div class="backup-actions"><button id="exportData" class="secondary-wide" type="button">EXPORT JSON</button><button id="importButton" class="secondary-wide" type="button">IMPORT JSON</button></div><input type="file" id="importFile" accept="application/json,.json" hidden></div>'+
      '<section class="dev-parent-section"><h3>🧪 Developer profile</h3><p>One-time PIN unlock for this device. Separate test history, BP and Journey. LIVE progress is never copied into TEST.</p><button id="devAdultToggle" class="primary-wide" type="button">'+(devUnlocked?(devActive?'EXIT DEV PROFILE':'ENTER DEV PROFILE'):'UNLOCK DEV ON THIS DEVICE')+'</button>'+(devUnlocked?'<button id="devLockDevice" class="secondary-wide" type="button">RELOCK DEV ACCESS</button>':'')+'</section>'+
      '<div class="parent-section"><h3>Adult access</h3><p class="mini-muted">4–8 digit PIN. Resetting the PIN requires the current PIN; data never leaves this browser automatically.</p><button id="changePin" type="button" class="secondary-wide">CHANGE PIN</button><div id="pinChangeArea"></div></div>'+
      '<div class="parent-section"><h3>Daily history & statistics</h3><p class="mini-muted">Daily statistics now live in the adult control room.</p><div class="stats-grid" id="statsHighlights"></div><div class="stats-panel"><div class="section-top"><h2>Last 7 mornings</h2><span class="subtle-label">REGULAR BP</span></div><div class="chart" id="weekChart"></div></div><div class="stats-panel"><h2>Daily records</h2><div id="historyList" class="history-list"></div></div></div>'+
      '<div class="parent-section"><h3>Real-world rewards awaiting delivery</h3><div id="claimedRewardsAdmin"></div></div>';
    renderStats();
    renderRewardRequests();
    $('devAdultToggle').addEventListener('click',()=>{
      if(!devUnlocked){devUnlocked=true;localStorage.setItem(DEV_UNLOCK_KEY,'1');}
      setDevActive(!devActive);
      dialog.close();
      showToast(devActive?'TEST profile active. LIVE progress is safe.':'LIVE profile restored');
    });
    if(devUnlocked)$('devLockDevice').addEventListener('click',()=>{
      if(!confirm('Relock Dev access on this device? The separate test save will be kept.'))return;
      setDevActive(false);
      devUnlocked=false;localStorage.removeItem(DEV_UNLOCK_KEY);localStorage.removeItem(DEV_ACTIVE_KEY);
      dialog.close();renderDevControls();showToast('Dev access relocked');
    });
    $('claimedRewardsAdmin').addEventListener('click',e=>{
      const btn=e.target.closest('[data-fulfil]');if(!btn)return;
      const item=data.journey&&data.journey.spending&&data.journey.spending.find(x=>x.id===btn.dataset.fulfil);
      if(!item||item.kind!=='reward'||item.status==='delivered')return;
      if(!confirm('Confirm that you have delivered '+item.label+' in real life?'))return;
      item.status='delivered';item.fulfilledAt=new Date().toISOString();save();renderRewardRequests();showToast('Reward marked delivered');
    });
    $('bonusForm').hidden=!!day.endedAt;
    $('pendingAdmin').hidden=!!day.endedAt;
    const type=$('bonusType'),amount=$('bonusAmount'),reason=$('bonusReason');
    function updateType(){
      amount.disabled=type.value==='piano';
      if(type.value==='piano'){amount.value='1';if(!reason.value.trim())reason.value='Completed piano practice';}
      else if(reason.value==='Completed piano practice')reason.value='';
    }
    type.addEventListener('change',updateType);updateType();
    $('bonusForm').addEventListener('submit',(e)=>{
      e.preventDefault();
      const kind=type.value;const message=reason.value.trim();const count=kind==='piano'?1:Number(amount.value);
      if(!message){$('bonusError').textContent='Please write a reason.';return;}
      if(kind==='piano'&&currentDay().bonuses.some(b=>b.type==='piano')){$('bonusError').textContent='Piano bonus was already offered today.';return;}
      if(currentDay().endedAt){showToast('The morning has ended');return;}
      currentDay().bonuses.push({id:'b'+Date.now()+'-'+Math.floor(Math.random()*1000000),type:kind,reason:message,amount:count,createdAt:new Date().toISOString(),claimedAt:null});
      save();render();dialog.close();showToast('Bonus is ready for Ethan to claim ★');
    });
    $('pendingAdmin').addEventListener('click',(e)=>{
      const btn=e.target.closest('[data-cancel]');if(!btn)return;
      if(currentDay().endedAt)return;
      currentDay().bonuses=currentDay().bonuses.filter(b=>b.id!==btn.dataset.cancel||b.claimedAt);
      save();render();renderParentDashboard();
    });
    $('exportData').addEventListener('click',()=>{
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
      downloadBlob(blob,'battlepoints-backup-'+todayKey()+'.json');showToast('Backup saved');
    });
    $('importButton').addEventListener('click',()=>$('importFile').click());
    $('importFile').addEventListener('change',async(e)=>{
      const file=e.target.files[0];if(!file)return;
      try{
        const incoming=JSON.parse(await file.text());
        if(incoming.version!==1||!incoming.days||typeof incoming.days!=='object'||Array.isArray(incoming.days)||!incoming.settings||typeof incoming.settings!=='object')throw Error('Invalid backup');
        if(!confirm('Replace ALL progress and the adult PIN on this device with this backup?'))return;
        if(devActive){devData=incoming;devData.settings=liveData.settings;data=devData;}
        else {liveData=incoming;data=liveData;devData.settings=liveData.settings;}
        dayFor(currentDate);save();render();dialog.close();showToast('Backup restored');
      }catch(err){showToast('That file is not a BattlePoints backup');}
    });
    $('changePin').addEventListener('click',()=>{
      $('pinChangeArea').innerHTML='<form id="changePinForm" class="form-stack"><label>New 4–8 digit PIN<input id="newPin" required inputmode="numeric" type="password" pattern="[0-9]{4,8}" minlength="4" maxlength="8"></label><label>Confirm new PIN<input id="newPinConfirm" required inputmode="numeric" type="password" pattern="[0-9]{4,8}" minlength="4" maxlength="8"></label><p id="changePinError" class="form-error"></p><button class="primary-wide" type="submit">SAVE NEW PIN</button></form>';
      $('changePinForm').addEventListener('submit',async(e)=>{
        e.preventDefault();const pin=$('newPin').value;
        if(!validPin(pin)||pin!==$('newPinConfirm').value){$('changePinError').textContent='PINs must match and contain 4–8 digits.';return;}
        const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
        const salt=Array.from(bytes).map(v=>v.toString(16).padStart(2,'0')).join('');
        liveData.settings={salt,hash:await pinHash(salt,pin)};data.settings=liveData.settings;localStorage.setItem(KEY,JSON.stringify(liveData));save();renderParentDashboard();showToast('PIN updated');
      });
    });
  }
  function downloadBlob(blob,name) {
    const url=URL.createObjectURL(blob),anchor=document.createElement('a');
    anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
  }
  journey=window.createBattleJourney({getData:()=>data,save,regularBP,totalBP,toast:showToast,refresh:render,esc,isDev:()=>devActive});
  dayFor(currentDate);save();clockTick();render();renderTimer();
  setInterval(()=>{clockTick();timerTick();},500);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){clockTick();timerTick();}});
  if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();