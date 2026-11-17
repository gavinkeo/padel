
/* PINNACLE//PADEL — offline-first Americano tournament companion.
   All 8-player/2-court rounds satisfy: each partnership exactly once;
   each player faces every other player exactly twice. */
(() => {
  'use strict';
  const STORAGE_KEY = 'pinnacle-padel-v2';
  const COMEBACK_START = new Date('2026-12-04T10:00:00Z'); // December is GMT in Cork
  const CORE_SCHEDULE = [
    [[[0,1],[2,3]],[[4,5],[6,7]]],
    [[[0,2],[4,6]],[[1,3],[5,7]]],
    [[[0,3],[4,7]],[[1,2],[5,6]]],
    [[[0,4],[1,5]],[[2,6],[3,7]]],
    [[[0,5],[2,7]],[[1,4],[3,6]]],
    [[[0,6],[3,5]],[[1,7],[2,4]]],
    [[[0,7],[1,6]],[[2,5],[3,4]]]
  ];
  const el = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const imgFor = player => window.PPC_AVATARS[String(((Number(player?.avatar)||1)-1)%12+1).padStart(2,'0')];
  const getPlayer = id => state.players.find(p => p.id === id) || { id, name:'Unknown player', avatar:1, nickname:'NEW CHALLENGER', style:'THE CHALLENGER' };
  const shortName = p => p.name.length > 20 ? p.name.slice(0,17) + '…' : p.name;
  const dateFormat = iso => {const [y,m,d] = String(iso || '').split('-').map(Number);return y&&m&&d ? new Date(Date.UTC(y,m-1,d)).toLocaleDateString('en-IE',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).toUpperCase() : 'DATE TBC';};
  const makeFixtures = selected => CORE_SCHEDULE.map((round,i)=>round.map(([a,b],c)=>({id:`r${i}c${c}`,round:i+1,court:c+1,a:a.map(k=>selected[k]),b:b.map(k=>selected[k])})));

  /* Verified from photographs of PPC III, PPC IV and the HipEx v Poly B2Cup.
     Exact event dates are not printed. Keep them unknown until confirmed. */
  const ID = name => 'p-'+name.toLowerCase().replace(/[^a-z0-9]/g,'');
  const PPC3 = [
    ['Gavin/Kennedy','Ciaran/Luke',17,15],['Geraldo/Sean','Cian/Dan',10,22],
    ['Ciaran/Gavin','Cian/Sean',17,15],['Dan/Geraldo','Kennedy/Luke',22,10],
    ['Ciaran/Cian','Dan/Luke',17,15],['Geraldo/Kennedy','Sean/Gavin',13,19],
    ['Ciaran/Dan','Geraldo/Gavin',19,13],['Kennedy/Sean','Luke/Cian',17,15],
    ['Ciaran/Geraldo','Kennedy/Cian',17,15],['Sean/Luke','Gavin/Dan',10,22],
    ['Ciaran/Kennedy','Sean/Dan',13,19],['Luke/Gavin','Cian/Geraldo',19,13],
    ['Ciaran/Sean','Luke/Geraldo',16,16],['Gavin/Cian','Dan/Kennedy',14,18]
  ];
  const PPC4 = [
    ['Gavin/Kennedy','Cian/Luke',25,7],['Peter/James','Rob/Dan',14,18],
    ['Gavin/Cian','Peter/Dan',17,15],['Rob/James','Luke/Kennedy',19,13],
    ['Gavin/Dan','Kennedy/Rob',25,7],['Luke/James','Peter/Cian',22,10],
    ['Gavin/Rob','James/Cian',11,21],['Kennedy/Dan','Peter/Luke',23,9],
    ['Gavin/James','Dan/Luke',21,11],['Peter/Kennedy','Rob/Cian',21,11],
    ['Gavin/Luke','Peter/Rob',22,10],['James/Dan','Cian/Kennedy',22,10],
    ['Gavin/Peter','James/Kennedy',11,21],['Dan/Cian','Luke/Rob',22,10]
  ];
  const B2 = [
    ['Gavin/James','Dan/Jack',31,17],['Geraldo/Sean','Cian/Ciaran',27,21],['Gary/Kennedy','Luke/Bean',26,22],
    ['James/Geraldo','Dan/Luke',28,20],['Gavin/Gary','Cian/Bean',25,23],['Sean/Kennedy','Jack/Ciaran',31,17],
    ['James/Sean','Jack/Cian',36,12],['Gavin/Kennedy','Ciaran/Luke',23,25],['Geraldo/Gary','Dan/Bean',20,28],
    ['James/Gary','Dan/Ciaran',25,23],['Gavin/Sean','Jack/Bean',23,25],['Geraldo/Kennedy','Cian/Luke',27,21],
    ['James/Kennedy','Ciaran/Bean',30,18],['Gavin/Geraldo','Jack/Luke',31,17],['Sean/Gary','Dan/Cian',28,20]
  ];
  function historicMatches(rows,id,courts){
    return rows.map(([a,b,scoreA,scoreB],i)=>({id:id+'-m'+(i+1),round:Math.floor(i/courts.length)+1,court:courts[i%courts.length],a:a.split('/').map(ID),b:b.split('/').map(ID),scoreA,scoreB}));
  }
  function historicalStandings(matches){
    const t={};
    for(const m of matches)for(const [ids,forPts,against] of [[m.a,m.scoreA,m.scoreB],[m.b,m.scoreB,m.scoreA]]){
      for(const id of ids){const x=t[id]??={id,points:0,against:0,wins:0,played:0,draws:0};
        x.points+=forPts;x.against+=against;x.wins+=+(forPts>against);x.played++;x.draws+=+(forPts===against);
      }
    }
    return Object.values(t).map(x=>({...x,pd:x.points-x.against})).sort((a,b)=>b.points-a.points||b.wins-a.wins||b.pd-a.pd||a.id.localeCompare(b.id));
  }
  function historicCup(id,name,rows,courts,number){
    const matches=historicMatches(rows,id,courts),standings=historicalStandings(matches);
    return {id,name,number,order:number,kind:'americano',date:null,dateLabel:'2024–25 · DATE TO CONFIRM',source:'Photographed original tournament sheet',champions:[standings[0].id],runnerUpId:standings[1].id,winningPoints:standings[0].points,participants:standings.map(t=>t.id),standings,matches,pointsPerMatch:32};
  }
  function seedArchive(){
    const a=historicCup('ppc-3','Pinnacle Padel Cup III',PPC3,[2,3],3);
    const b=historicCup('ppc-4','Pinnacle Padel Cup IV',PPC4,[3,2],4);
    const matches=historicMatches(B2,'b2',[2,3,4]);
    const scores=[0,1,2,3,4].map(i=>({round:i+1,time:['10:00','10:24','10:48','11:12','11:36'][i],a:matches.slice(i*3,i*3+3).reduce((s,m)=>s+m.scoreA,0),b:matches.slice(i*3,i*3+3).reduce((s,m)=>s+m.scoreB,0)}));
    const c={id:'b2-cup',name:'B2Cup · HipEx vs Poly',kind:'team',order:5,date:null,dateLabel:'DATE TO CONFIRM',source:'Photographed original Ryder Cup-style team sheet',winningTeam:'HipEx',losingTeam:'Poly',winningScore:411,losingScore:309,champions:[],participants:[...new Set(matches.flatMap(m=>[...m.a,...m.b]))],matches,rounds:scores,pointsPerMatch:48};
    return [a,b,c];
  }

  const defaultPlayers = ['Gavin','Kennedy','Ciaran','Luke','Geraldo','Sean','Cian','Dan','Peter','James','Rob','Gary','Jack','Bean'].map((name,i)=>({id:ID(name),name,nickname:'PPC CONTENDER',style:'THE CHALLENGER',bio:'Pinnacle Padel Cup competitor. Full profile coming soon.',avatar:i%12+1}));
  const defaultState = () => ({version:2,players:defaultPlayers,selected:[],active:{id:'comeback-2026',name:'Pinnacle Comeback Cup',date:'2026-12-04',participants:[],fixtures:[],scores:{},completed:false},archive:seedArchive(),viewRound:0});
  const safeLoad = () => {try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return defaultState();const parsed=JSON.parse(raw);if(parsed&&Array.isArray(parsed.players)&&Array.isArray(parsed.archive)&&parsed.active&&Array.isArray(parsed.active.fixtures)&&Array.isArray(parsed.selected))return parsed;}catch(e){console.warn('Saved data unavailable:',e)}return defaultState();};
  let state = safeLoad();
  let toastTimer;
  function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){console.warn('Local save unavailable:',e);notify('Could not save — browser storage may be disabled.')}}
  function notify(message){el('toast').textContent=message;el('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el('toast').classList.remove('visible'),3600)}
  function calculate(){
    const totals=Object.fromEntries(state.active.participants.map(id=>[id,{id,points:0,against:0,wins:0,played:0,draws:0}]));
    for(const round of state.active.fixtures){for(const match of round){const a=state.active.scores[match.id];if(!Number.isInteger(a)||a<0||a>32)continue;const b=32-a;
      for(const id of match.a){if(!totals[id])continue;totals[id].points+=a;totals[id].against+=b;totals[id].played++;if(a>b)totals[id].wins++;if(a===b)totals[id].draws++}
      for(const id of match.b){if(!totals[id])continue;totals[id].points+=b;totals[id].against+=a;totals[id].played++;if(b>a)totals[id].wins++;if(a===b)totals[id].draws++}
    }}
    return Object.values(totals).map(t=>({...t,pd:t.points-t.against})).sort((a,b)=>b.points-a.points||b.wins-a.wins||b.pd-a.pd||getPlayer(a.id).name.localeCompare(getPlayer(b.id).name));
  }
  const completeMatches = () => state.active.fixtures.flat().filter(m=>Number.isInteger(state.active.scores[m.id])).length;
  function career(id){const wins=state.archive.filter(a=>(a.champions||[a.championId]).includes(id)).length;const appearances=state.archive.filter(a=>Array.isArray(a.participants)&&a.participants.includes(id)).length;return {wins,appearances};}
  function renderRoster(){
    el('rosterCount').textContent=`${state.players.length} HISTORIC PLAYERS`;
    const playerStats=calculate();
    el('rosterGrid').innerHTML=state.players.map((p,i)=>{const isActive=state.active.participants.includes(p.id);const stats=playerStats.find(t=>t.id===p.id);const c=career(p.id);return `<button type="button" class="player-card" data-edit="${esc(p.id)}" aria-label="Edit ${esc(p.name)} profile"><div class="portrait"><img src="${imgFor(p)}" alt="Fictional game-style avatar for ${esc(p.name)}" loading="lazy"/><span class="number">${String(i+1).padStart(2,'0')}</span>${isActive?'<span class="player-indicator">◉ SELECTED CONTENDER</span>':''}</div><div class="player-info"><span class="player-role">${esc(p.style || 'THE CHALLENGER')}</span><h3>${esc(p.name)}</h3><div class="player-bottom"><span>${esc(p.nickname||'NEW CHALLENGER')}</span><span><b>${c.wins}</b> TITLES</span></div></div></button>`}).join('');
    el('rosterGrid').querySelectorAll('[data-edit]').forEach(node=>node.addEventListener('click',()=>openPlayer(node.dataset.edit)));
  }
  function renderPicker(){
    el('selectedCount').textContent=state.selected.length;
    el('playerPicker').innerHTML=state.players.map(p=>{const on=state.selected.includes(p.id);return `<button type="button" class="picker ${on?'chosen':''}" data-pick="${esc(p.id)}" aria-pressed="${on}"><img src="${imgFor(p)}" alt=""/><span>${esc(p.name)}</span><b class="pick-check">${on?'✓':'+'}</b></button>`}).join('');
    el('playerPicker').querySelectorAll('[data-pick]').forEach(btn=>btn.addEventListener('click',()=>togglePlayer(btn.dataset.pick)));
  }
  function togglePlayer(id){const has=state.selected.includes(id);if(has){state.selected=state.selected.filter(n=>n!==id)}else if(state.selected.length<8){state.selected.push(id)}else{notify('Eight-player maximum. Deselect someone first.');return}save();renderPicker()}
  function renderRounds(){
    const round=Math.min(6,Math.max(0,state.viewRound||0));state.viewRound=round;
    if(!state.active.fixtures.length){el('roundNav').innerHTML='';el('roundTitle').innerHTML='AWAITING LINEUP';el('matchProgress').textContent='0 / 14 MATCHES';el('tournamentStatus').textContent='LINEUP TO BE CONFIRMED';el('matchCards').innerHTML='<div class="fixtures-empty"><strong>THE DRAW ISN\'T SET. YET.</strong><p>Pick eight players above and generate the seven-round Americano schedule. No December lineup has been assumed.</p></div>';el('prevRound').disabled=true;el('nextRound').disabled=true;el('finalizeBtn').disabled=true;return;}
    el('roundNav').innerHTML=state.active.fixtures.map((fixtures,i)=>{const done=fixtures.every(m=>Number.isInteger(state.active.scores[m.id]));return `<button type="button" data-round="${i}" class="${i===round?'current':''} ${done?'done':''}" aria-label="Round ${i+1}${done?', completed':''}" aria-pressed="${i===round}">${String(i+1).padStart(2,'0')}${done?' ✓':''}</button>`}).join('');
    el('roundTitle').innerHTML=`ROUND ${String(round+1).padStart(2,'0')} <small>/ 07</small>`;
    el('matchProgress').textContent=`${completeMatches()} / 14 MATCHES`;
    el('tournamentStatus').textContent=state.active.completed?'TOURNAMENT COMPLETE':completeMatches()>0?'RESULTS IN PROGRESS':'SCHEDULED EVENT';
    const matches=state.active.fixtures[round] || [];
    el('matchCards').innerHTML=matches.map(m=>{const pts=state.active.scores[m.id];const done=Number.isInteger(pts);const sA=done?pts:'—';const sB=done?32-pts:'—';const duo=ids=>ids.map(id=>getPlayer(id));const team=(ids,score,winning)=>`<div class="team-line"><div class="team-mini-images">${duo(ids).map(p=>`<img src="${imgFor(p)}" alt="" />`).join('')}</div><div class="team-names" title="${esc(duo(ids).map(p=>p.name).join(' & '))}">${esc(duo(ids).map(p=>shortName(p)).join(' + '))}</div><strong class="team-score ${winning?'score-winning':''}">${score}</strong></div>`;return `<article class="match-card ${done?'completed':''}"><div class="match-card-top"><span>COURT ${String(m.court).padStart(2,'0')} / R${String(m.round).padStart(2,'0')}</span><span class="match-state">${done?'✓ FINAL':'● AWAITING SCORE'}</span></div>${team(m.a,sA,done&&pts>16)}<div class="team-vs">VS</div>${team(m.b,sB,done&&pts<16)}<div class="score-input-row"><label for="score-${m.id}">TEAM A POINTS<input id="score-${m.id}" type="number" min="0" max="32" step="1" inputmode="numeric" placeholder="0–32" value="${done?pts:''}" /></label><button type="button" data-score="${m.id}">${done?'UPDATE':'SAVE'} ↗</button></div></article>`}).join('');
    el('roundNav').querySelectorAll('[data-round]').forEach(btn=>btn.addEventListener('click',()=>{state.viewRound=Number(btn.dataset.round);save();renderRounds()}));
    el('matchCards').querySelectorAll('[data-score]').forEach(btn=>btn.addEventListener('click',()=>saveScore(btn.dataset.score)));
    el('prevRound').disabled=round===0;el('nextRound').disabled=round===6;
    el('finalizeBtn').disabled=state.active.completed||completeMatches()<14;
    el('finalizeBtn').textContent=state.active.completed?'CHAMPION CROWNED ★':'CROWN THE CHAMPION ★';
  }
  function saveScore(id){if(state.active.completed){notify('Tournament already finalised. Start a new event for new scores.');return}
    const input=el(`score-${id}`);const raw=input?.value?.trim();const num=Number(raw);
    if(!raw||!Number.isInteger(num)||num<0||num>32){notify('Enter a whole number from 0 to 32.');input?.focus();return}
    state.active.scores[id]=num;save();renderRounds();renderLeaderboard();notify(`Score saved: ${num} – ${32-num}`);
  }
  function renderLeaderboard(){const rows=calculate();if(!rows.length){el('leaderboard').innerHTML='<div class="leaderboard-empty">Select eight contenders to activate the leaderboard. The historic championships are already loaded below.</div>';return}el('leaderboard').innerHTML=`<table class="leaderboard-table"><thead><tr><th>#</th><th>PLAYER</th><th>PTS</th><th>W</th><th>PD</th></tr></thead><tbody>${rows.map((t,i)=>{const p=getPlayer(t.id);return `<tr><td><span class="table-rank">${String(i+1).padStart(2,'0')}</span></td><td><span class="leader-identity"><img src="${imgFor(p)}" alt=""/><span title="${esc(p.name)}">${esc(p.name)}</span></span></td><td>${t.points}</td><td>${t.wins}</td><td>${t.pd>0?'+':''}${t.pd}</td></tr>`}).join('')}</tbody></table>`}

  function renderHistory(){
    el('archiveCount').textContent=`${String(state.archive.length).padStart(2,'0')} RECORDS`;
    const records=[...state.archive].sort((a,b)=>(b.order||0)-(a.order||0));
    el('archiveList').innerHTML=records.map(a=>{
      const team=a.kind==='team',champ=team?a.winningTeam:(a.champions||[]).map(id=>getPlayer(id).name).join(' & ');
      const tagline=team?`${a.winningScore}–${a.losingScore} · ${a.winningTeam} DEFEAT ${a.losingTeam}`:
        `CHAMPION: ${champ}${a.winningPoints!=null?' · '+a.winningPoints+' POINTS':''}${a.runnerUpId?' · RUNNER-UP: '+getPlayer(a.runnerUpId).name:''}`;
      const avatar=team?'<span class="record-icon">⚔</span>':`<img src="${imgFor(getPlayer((a.champions||[])[0]))}" alt="" />`;
      return `<button type="button" class="history-record archive-entry" data-archive="${esc(a.id)}" aria-label="See full ${esc(a.name)} results">${avatar}<span class="history-record-info"><span class="history-date">${esc(a.date?dateFormat(a.date):a.dateLabel||'DATE TO CONFIRM')} · ${team?'TEAM SHOWDOWN':'AMERICANO'}</span><h4>${esc(a.name)}</h4><p>${esc(tagline)}</p><span class="archive-open">VIEW MATCHES, STANDINGS & SCORES ↗</span></span><span class="medal">${team?'⚡':'★'}</span></button>`;
    }).join('');
    el('archiveList').querySelectorAll('[data-archive]').forEach(btn=>btn.addEventListener('click',()=>openArchive(btn.dataset.archive)));
  }
  function openArchive(id){
    const a=state.archive.find(x=>x.id===id);if(!a)return;
    const team=a.kind==='team';
    const roundsCount=team?5:(a.matches?.length?7:0);
    const summary=team?`<div class="archive-hero-score"><span>HIPEX</span><strong>${a.winningScore} <b>—</b> ${a.losingScore}</strong><span>POLY</span></div><p class="archive-caveat">Historic team totals verified against the original score sheet. Each match was played to 48 points.</p>`:
      `<div class="archive-hero-score"><span>CHAMPION</span><strong>${esc(getPlayer(a.champions[0]).name)} · ${a.winningPoints} PTS</strong><span>${roundsCount} ROUNDS</span></div>`;
    const standings=team?'':`<div class="archive-detail-title">FINAL PLAYER STANDINGS</div><div class="historic-table-wrap"><table class="historic-table"><thead><tr><th>RANK</th><th>PLAYER</th><th>POINTS</th><th>WINS</th><th>+/-</th></tr></thead><tbody>${(a.standings||[]).map((p,i)=>`<tr><td>${i+1}${i===0?' 🏆':''}</td><td>${esc(getPlayer(p.id).name)}</td><td><b>${p.points}</b></td><td>${p.wins}</td><td>${p.pd>0?'+':''}${p.pd}</td></tr>`).join('')}</tbody></table></div>`;
    const rounds=Array.from({length:roundsCount},(_,i)=>(a.matches||[]).filter(m=>m.round===i+1));
    const matchHTML=rounds.length?rounds.map((ms,i)=>{
      const subtotal=team?a.rounds[i]:null;
      return `<div class="historic-round"><div class="historic-round-head"><b>ROUND ${String(i+1).padStart(2,'0')}</b><span>${team?subtotal.time:['10:00','10:17','10:34','10:51','11:08','11:25','11:42'][i]}</span>${team?`<strong>HIPEx ${subtotal.a} — ${subtotal.b} POLY</strong>`:''}</div>${ms.map(m=>`<div class="historic-match"><span class="historic-court">COURT ${m.court}</span><span>${esc(m.a.map(id=>getPlayer(id).name).join(' / '))}</span><strong class="historic-score">${m.scoreA}<small>–</small>${m.scoreB}</strong><span>${esc(m.b.map(id=>getPlayer(id).name).join(' / '))}</span></div>`).join('')}</div>`;
    }).join(''):'<p class="archive-caveat">The overall winner is recorded; the individual match scores are still to come.</p>';
    el('archiveDialogTitle').textContent=a.name;
    el('archiveDialogMeta').textContent=(a.date?dateFormat(a.date):(a.dateLabel||'DATE NOT RECORDED'))+' · '+(team?'3 COURTS / 5 ROUNDS':'2 COURTS / 7 ROUNDS');
    el('archiveDialogBody').innerHTML=summary+standings+'<div class=\"archive-detail-title\">ORIGINAL MATCH RESULTS</div>'+matchHTML+'<p class=\"archive-caveat\">Source: photographed original score sheet. Event date has not been verified.</p>';
    el('archiveDialog').showModal();
  }
  function renderAll(){el('tournamentName').value=state.active.name||'Pinnacle Comeback Cup';el('tournamentDate').value=state.active.date||'2026-12-04';renderRoster();renderPicker();renderRounds();renderLeaderboard();renderHistory()}
  function generateTournament(){if(state.selected.length!==8){el('setupMessage').textContent='You need exactly eight players before generating fixtures.';return}
    if(completeMatches()>0&&!confirm('Generate new fixtures? This will clear all existing scores for the current tournament.'))return;
    const name=el('tournamentName').value.trim()||'Pinnacle Cup';const date=el('tournamentDate').value||'2026-12-04';
    state.active={id:`event-${Date.now()}`,name,date,participants:[...state.selected],fixtures:makeFixtures(state.selected),scores:{},completed:false};state.viewRound=0;el('setupMessage').textContent='Seven rounds, fourteen matches — all partnerships and opponent matchups verified.';save();renderAll();notify('Perfectly balanced fixtures generated.')
  }
  function finalize(){if(state.active.completed)return;if(completeMatches()!==14){notify('All 14 match results are required to award the trophy.');return}
    const ranked=calculate();const leader=ranked[0];const champions=ranked.filter(t=>t.points===leader.points&&t.wins===leader.wins&&t.pd===leader.pd).map(t=>t.id);
    const champNames=champions.map(id=>getPlayer(id).name).join(' & ');
    if(!confirm(`Crown ${champNames} as ${champions.length>1?'joint champions':'champion'} with ${leader.points} points? This archives the result and locks the scores.`))return;
    state.archive.push({id:state.active.id,name:state.active.name,date:state.active.date,champions,winningPoints:leader.points,participants:[...state.active.participants],standings:ranked,completedAt:new Date().toISOString()});state.active.completed=true;save();renderAll();notify(`🏆 ${champNames} ${champions.length>1?'are your champions!':'is your champion!'}`);
  }
  function openPlayer(id){const p=getPlayer(id);el('editPlayerId').value=p.id;el('editPlayerName').value=p.name;el('editPlayerNick').value=p.nickname||'';el('editPlayerStyle').value=p.style||'THE CHALLENGER';el('editPlayerBio').value=p.bio||'';el('dialogAvatar').src=imgFor(p);const cups=state.archive.filter(e=>e.kind==='americano'&&Array.isArray(e.standings));const points=cups.reduce((n,e)=>n+(e.standings.find(x=>x.id===id)?.points||0),0);const apps=cups.filter(e=>e.participants?.includes(id)).length;const titles=cups.filter(e=>e.champions?.includes(id)).length;const b2=state.archive.find(e=>e.id==='b2-cup');const side=b2?.matches?.some(m=>m.a.includes(id))?'HIPEX':b2?.matches?.some(m=>m.b.includes(id))?'POLY':null;el('playerCareerMetrics').innerHTML=`<div><strong>${titles}</strong><span>PPC TITLES</span></div><div><strong>${apps}</strong><span>PPC APPS</span></div><div><strong>${points}</strong><span>PPC POINTS</span></div>`+(side?`<p>B2CUP · ${side}${side==='HIPEX'?' 🏆':''}</p>`:'');el('editPlayerDialog').showModal()}
  function updatePlayer(event){event.preventDefault();const id=el('editPlayerId').value;const p=state.players.find(x=>x.id===id);if(!p)return;const name=el('editPlayerName').value.trim();if(!name){notify('Player name cannot be blank.');return}p.name=name;p.nickname=el('editPlayerNick').value.trim()||'NEW CHALLENGER';p.style=el('editPlayerStyle').value;p.bio=el('editPlayerBio').value.trim();save();renderAll();el('editPlayerDialog').close();notify(`${p.name}'s player profile updated.`)}
  function addPlayer(){if(state.players.length>=20){notify('Maximum 20 players in this edition.');return}const i=state.players.length+1;const p={id:`p-${Date.now()}`,name:`Player ${String(i).padStart(2,'0')}`,nickname:'NEW CHALLENGER',style:'THE CHALLENGER',bio:'Your story starts on the court.',avatar:(i-1)%12+1};state.players.push(p);save();renderAll();openPlayer(p.id);notify('New player slot added.')}
  function openHistory(){el('historyName').value='';el('historyDate').value='';const options=state.players.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');el('historyWinner').innerHTML='<option value="">Select the champion</option>'+options;el('historyRunner').innerHTML='<option value="">Not recorded</option>'+options;el('historyDialog').showModal()}
  function addHistory(event){event.preventDefault();const name=el('historyName').value.trim(),date=el('historyDate').value,champion=el('historyWinner').value,runner=el('historyRunner').value;
    if(!name||!champion){notify('Event name, date and champion are required.');return}if(runner===champion){notify('Champion and runner-up must be different players.');return}
    state.archive.push({id:`historic-${Date.now()}`,name,date:date||null,dateLabel:'DATE TO CONFIRM',kind:'americano',order:0,champions:[champion],runnerUpId:runner||null,participants:null});save();renderAll();el('historyDialog').close();notify('Real tournament result added to Hall of Fame.')
  }
  function countdown(){const ms=COMEBACK_START.getTime()-Date.now();if(ms<=0){el('countdown').innerHTML='<span class="timeunit"><strong>GAME</strong><small>ON!</small></span>';return}const days=Math.floor(ms/86400000),hours=Math.floor(ms/3600000)%24,minutes=Math.floor(ms/60000)%60;el('countdown').innerHTML=[[days,'D'],[hours,'H'],[minutes,'M']].map(([n,u])=>`<span class="timeunit"><strong>${String(n).padStart(2,'0')}</strong><small>${u}</small></span>`).join('')}
  function exportClub(){const blob=new Blob([JSON.stringify({app:'PINNACLE//PADEL',exportedAt:new Date().toISOString(),data:state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`shift-smash-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);notify('Club data backup downloaded.')}
  async function importClub(event){const file=event.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());const incoming=parsed.data||parsed;if(!incoming||!Array.isArray(incoming.players)||!Array.isArray(incoming.archive)||!incoming.active||!Array.isArray(incoming.active.fixtures)||!Array.isArray(incoming.selected))throw Error('Invalid backup format');if(!confirm('Import this backup? It will replace all player names, tournament scores, and history in this browser.'))return;
    state=incoming;save();renderAll();notify('Club data restored from backup.')
  }catch(e){notify(`Import failed: ${e.message}`)}finally{event.target.value=''}}
  function wireEvents(){el('generateBtn').addEventListener('click',generateTournament);el('prevRound').addEventListener('click',()=>{state.viewRound=Math.max(0,state.viewRound-1);save();renderRounds()});el('nextRound').addEventListener('click',()=>{state.viewRound=Math.min(6,state.viewRound+1);save();renderRounds()});el('finalizeBtn').addEventListener('click',finalize);el('editPlayerForm').addEventListener('submit',updatePlayer);el('historyForm').addEventListener('submit',addHistory);el('addPlayerBtn').addEventListener('click',addPlayer);el('addHistoryBtn').addEventListener('click',openHistory);el('exportBtn').addEventListener('click',exportClub);el('importBtn').addEventListener('click',()=>el('importFile').click());el('importFile').addEventListener('change',importClub);document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>el(b.dataset.close).close()));
    const menu=el('mobileNav');el('menuToggle').addEventListener('click',()=>{const next=menu.hidden;menu.hidden=!next;el('menuToggle').setAttribute('aria-expanded',String(next))});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.hidden=true;el('menuToggle').setAttribute('aria-expanded','false')}));
    document.querySelectorAll('.desktop-nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.desktop-nav a').forEach(x=>x.classList.remove('active'));a.classList.add('active')}));
  }
  renderAll();wireEvents();document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>openArchive(b.dataset.jump)));countdown();setInterval(countdown,60*1000);
  // Expose a read-only diagnostic for testing schedule invariants without changing UI state.
  window.ShiftSmashDiagnostics={getSchedule:()=>JSON.parse(JSON.stringify(state.active.fixtures)),getStandings:()=>JSON.parse(JSON.stringify(calculate()))};
})();

