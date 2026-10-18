/* BattlePoints: no accounts, trackers, or external runtime dependencies. */
'use strict';
(function () {
  const KEY = 'battlepoints-morning-v1';
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
  function loadData() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (data && data.version === 1 && data.days && typeof data.days === 'object' && data.settings && typeof data.settings === 'object') return data;
    } catch (e) {console.warn('Saved progress could not be loaded',e);}
    return emptyData();
  }
  let data = loadData();
  let currentDate = todayKey();
  let expandedQuest = 'morning';
  let activeTab = 'quests';
  let adultUnlocked = false;
  let toastTimer = null;
  let timerMinutes = 5, remainingSeconds = 300, timerRunning = false, timerDeadline = 0;
  function dayFor(key) {
    if (!data.days[key]) data.days[key] = {tasks:{},bonuses:[],startedAt:null};
    const day = data.days[key];
    if (!day.tasks || typeof day.tasks !== 'object') day.tasks = {};
    if (!Array.isArray(day.bonuses)) day.bonuses = [];
    return day;
  }
  function save() {
    try {localStorage.setItem(KEY,JSON.stringify(data));}
    catch(e){showToast('Device storage is full or unavailable');}
  }
  function currentDay() {return dayFor(currentDate);}
  function ensureDate() {
    const key = todayKey();
    if (key !== currentDate) {currentDate = key; expandedQuest = 'morning';dayFor(key);save();render();}
  }
  function taskDone(day,id) {return Boolean(day.tasks[id] && day.tasks[id].done);}
  function completedSteps(day) {return quests.reduce((n,q)=>n+q.tasks.filter(t=>taskDone(day,t[0])).length,0);}
  function questDone(day,q) {return q.tasks.every(t=>taskDone(day,t[0]));}
  function regularBP(day) {return quests.filter(q=>questDone(day,q)).length;}
  function claimedBP(day) {return day.bonuses.reduce((n,b)=>n+(b.claimedAt ? Number(b.amount)||0 : 0),0);}
  function allBP(day) {return regularBP(day)+claimedBP(day);}
  function totalBP() {return Object.values(data.days).reduce((n,d)=>n+allBP(d),0);}
  function level() {return 1+Math.floor(totalBP()/12);}
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
    const day=currentDay();const oldBP=regularBP(day);
    if (!day.startedAt) day.startedAt=new Date().toISOString();
    day.tasks[id]={done:checked,at:new Date().toISOString()};
    if (regularBP(day)===3) day.finishedAt=new Date().toISOString();
    else day.finishedAt=null;
    save();render();
    if(regularBP(day)>oldBP) {cheer('+1 BP');showToast('Quest complete! +1 Battle Point ✨');}
  }
  function renderQuests() {
    const day=currentDay();
    $('questList').innerHTML=quests.map((q)=>{
      const complete=questDone(day,q);
      const count=q.tasks.filter(t=>taskDone(day,t[0])).length;
      const open=expandedQuest===q.id;
      const rows=q.tasks.map(([id,label])=>'<label class="task-row"><input type="checkbox" data-task="'+id+'" '+(taskDone(day,id)?'checked':'')+'><span class="tickbox" aria-hidden="true">✓</span><span class="task-label">'+esc(label)+'</span></label>').join('');
      return '<article class="quest-card '+(complete?'finished':'')+'"><button class="quest-toggle" type="button" data-quest="'+q.id+'" aria-expanded="'+open+'" aria-controls="panel-'+q.id+'"><span class="quest-emoji" aria-hidden="true">'+q.icon+'</span><span><span class="quest-title">'+q.title+'</span><span class="quest-sub">'+count+' / '+q.tasks.length+' steps done</span></span><span class="quest-side"><span class="bp-label">'+(complete?'✓ 1 BP':'+1 BP')+'</span><span class="quest-arrow" aria-hidden="true">'+(open?'⌃':'⌄')+'</span></span></button>'+(open?'<div class="quest-body" id="panel-'+q.id+'">'+rows+(complete?'<p class="quest-win">★ QUEST COMPLETE · +1 BP ★</p>':'')+'</div>':'')+'</article>';
    }).join('');
    $('completeCount').textContent=regularBP(day)+' / 3';
    $('dailyPoints').textContent=regularBP(day);
    $('dailyMeter').setAttribute('aria-valuenow',String(regularBP(day)));
    $('meterFill').style.width=(regularBP(day)/3*100)+'%';
    $('taskSummary').textContent=completedSteps(day)+' / '+taskCount+' steps done';
    $('heroLevel').textContent='LEVEL '+level()+' EXPLORER · '+totalBP()+' TOTAL BP';
    $('avatarScene').dataset.gear=String(regularBP(day));
  }
  function renderBonuses() {
    const day=currentDay();
    const pending=day.bonuses.filter(b=>!b.claimedAt);
    const claimed=day.bonuses.filter(b=>b.claimedAt);
    $('bonusBadge').textContent=pending.length+' READY';
    const renderBonus=(b)=>'<div class="bonus-item"><div><strong>'+esc(b.type==='piano'?'🎹 Piano bonus':'🌟 Special bonus')+' · +'+Number(b.amount)+' BP</strong><p>'+esc(b.reason)+'</p></div>'+(b.claimedAt?'<span class="claimed-mark">✓ CLAIMED</span>':'<button class="claim-button" type="button" data-claim="'+esc(b.id)+'">CLAIM +'+Number(b.amount)+'</button>')+'</div>';
    $('bonusList').innerHTML=pending.map(renderBonus).join('')+claimed.map(renderBonus).join('');
  }
  function renderHealth() {const health=currentDay().health||{};$('healthVitamin').checked=!!(health.vitamins&&health.vitamins.done);$('healthMedication').checked=!!(health.medication&&health.medication.done);}
  function render() {renderQuests();renderBonuses();renderHealth();if(activeTab==='stats') renderStats();}
  $('healthReminders').addEventListener('change',(e)=>{const id=e.target.dataset.health;if(id!=='vitamins'&&id!=='medication')return;const day=currentDay();if(!day.health)day.health={};day.health[id]={done:e.target.checked,at:new Date().toISOString()};save();});
  $('questList').addEventListener('click',(e)=>{
    const button=e.target.closest('[data-quest]');
    if (button) {expandedQuest=expandedQuest===button.dataset.quest?null:button.dataset.quest;renderQuests();}
  });
  $('questList').addEventListener('change',(e)=>{
    if(e.target.matches('[data-task]')) markTask(e.target.dataset.task,e.target.checked);
  });
  $('bonusList').addEventListener('click',(e)=>{
    const btn=e.target.closest('[data-claim]');if(!btn)return;
    const item=currentDay().bonuses.find(b=>b.id===btn.dataset.claim&&!b.claimedAt);
    if(!item)return;
    item.claimedAt=new Date().toISOString();save();render();cheer('+'+item.amount+' BONUS');showToast('Bonus claimed! '+item.amount+' Battle Point'+(item.amount===1?'':'s')+' ✨');
  });
  function clockTick() {
    const now=new Date();
    $('liveClock').textContent=now.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true});
    const key=todayKey(now);if(key!==currentDate)ensureDate();
  }
  function clampMinutes(value) {const n=Number(value);return Number.isFinite(n)?Math.max(1,Math.min(120,Math.round(n))):5;}
  function readMinutes() {timerMinutes=clampMinutes($('timerMinutes').value);$('timerMinutes').value=timerMinutes;return timerMinutes;}
  function renderTimer() {
    const value=Math.max(0,Math.ceil(remainingSeconds));
    $('timerDisplay').textContent=String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');
    $('timerStatus').textContent=value===0?"TIME'S UP · WELL DONE":timerRunning?'TIMER IS RUNNING':'READY WHEN YOU ARE';
    $('timerToggle').textContent=timerRunning?'❚❚ PAUSE':'▶ '+(value===0?'RESTART':'START');
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
    activeTab=which;
    $('questView').hidden=which!=='quests';
    $('statsView').hidden=which!=='stats';
    $('navQuests').classList.toggle('active',which==='quests');
    $('navStats').classList.toggle('active',which==='stats');
    $('navQuests').setAttribute('aria-current',which==='quests'?'page':'false');
    $('navStats').setAttribute('aria-current',which==='stats'?'page':'false');
    if(which==='stats')renderStats();
    window.scrollTo({top:0,behavior:'instant'});
  }
  $('navQuests').addEventListener('click',()=>switchTab('quests'));
  $('navStats').addEventListener('click',()=>switchTab('stats'));
  function lastDays(n) {
    const out=[];const date=new Date();date.setHours(12,0,0,0);
    for(let i=n-1;i>=0;i--){const d=new Date(date);d.setDate(date.getDate()-i);out.push(todayKey(d));}
    return out;
  }
  function renderStats() {
    const keys=lastDays(7);
    const today=currentDay();
    const finished=Object.values(data.days).filter(d=>regularBP(d)===3).length;
    const bp=totalBP();
    const week=keys.reduce((n,k)=>n+(data.days[k]?allBP(data.days[k]):0),0);
    $('statsHighlights').innerHTML=[[''+bp,'TOTAL BP'],[''+finished,'3/3 DAYS'],[''+week,'7-DAY BP']].map(([v,label])=>'<div class="stat-block"><strong>'+v+'</strong><small>'+label+'</small></div>').join('');
    $('weekChart').innerHTML=keys.map(k=>{
      const day=data.days[k];const value=day?regularBP(day):0;
      const label=new Date(Number(k.slice(0,4)),Number(k.slice(5,7))-1,Number(k.slice(8))).toLocaleDateString('en-AU',{weekday:'short'});
      return '<div class="chart-col '+(k===currentDate?'today':'')+'"><strong>'+value+'</strong><div class="chart-bar-track"><div class="chart-fill" style="height:'+(value/3*100)+'%"></div></div><small>'+label+'</small></div>';
    }).join('');
    const entries=Object.entries(data.days).filter(([k,d])=>d.startedAt||completedSteps(d)||d.bonuses.length).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,30);
    $('historyList').innerHTML=entries.length?entries.map(([k,d])=>{
      const time=d.finishedAt?new Date(d.finishedAt).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit',hour12:true}):'Not all quests finished';
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
  $('navParent').addEventListener('click',()=>{
    adultUnlocked=false;
    $('parentDialogTitle').textContent='Adult control room';
    renderParentLock();dialog.showModal();
  });
  dialog.addEventListener('close',()=>{adultUnlocked=false;});
  function renderParentLock() {
    const setup=!data.settings.hash;
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
          data.settings={salt,hash:await pinHash(salt,pin)};save();
        }catch(e){$('pinError').textContent='Secure PIN setup requires HTTPS or localhost.';return;}
      }else{
        try{
          if(await pinHash(data.settings.salt,pin)!==data.settings.hash){$('pinError').textContent='Incorrect PIN. Try again.';return;}
        }catch(e){$('pinError').textContent='PIN verification unavailable in this browser.';return;}
      }
      adultUnlocked=true;renderParentDashboard();
    });
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
      '<div class="parent-section"><h3>Adult access</h3><p class="mini-muted">4–8 digit PIN. Resetting the PIN requires the current PIN; data never leaves this browser automatically.</p><button id="changePin" type="button" class="secondary-wide">CHANGE PIN</button><div id="pinChangeArea"></div></div>';
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
      currentDay().bonuses.push({id:'b'+Date.now()+'-'+Math.floor(Math.random()*1000000),type:kind,reason:message,amount:count,createdAt:new Date().toISOString(),claimedAt:null});
      save();render();dialog.close();showToast('Bonus is ready for Ethan to claim ★');
    });
    $('pendingAdmin').addEventListener('click',(e)=>{
      const btn=e.target.closest('[data-cancel]');if(!btn)return;
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
        data=incoming;dayFor(currentDate);save();render();dialog.close();showToast('Backup restored');
      }catch(err){showToast('That file is not a BattlePoints backup');}
    });
    $('changePin').addEventListener('click',()=>{
      $('pinChangeArea').innerHTML='<form id="changePinForm" class="form-stack"><label>New 4–8 digit PIN<input id="newPin" required inputmode="numeric" type="password" pattern="[0-9]{4,8}" minlength="4" maxlength="8"></label><label>Confirm new PIN<input id="newPinConfirm" required inputmode="numeric" type="password" pattern="[0-9]{4,8}" minlength="4" maxlength="8"></label><p id="changePinError" class="form-error"></p><button class="primary-wide" type="submit">SAVE NEW PIN</button></form>';
      $('changePinForm').addEventListener('submit',async(e)=>{
        e.preventDefault();const pin=$('newPin').value;
        if(!validPin(pin)||pin!==$('newPinConfirm').value){$('changePinError').textContent='PINs must match and contain 4–8 digits.';return;}
        const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
        const salt=Array.from(bytes).map(v=>v.toString(16).padStart(2,'0')).join('');
        data.settings={salt,hash:await pinHash(salt,pin)};save();renderParentDashboard();showToast('PIN updated');
      });
    });
  }
  function downloadBlob(blob,name) {
    const url=URL.createObjectURL(blob),anchor=document.createElement('a');
    anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
  }
  dayFor(currentDate);save();clockTick();render();renderTimer();
  setInterval(()=>{clockTick();timerTick();},500);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){clockTick();timerTick();}});
  if('serviceWorker' in navigator&&location.protocol==='https:')window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();