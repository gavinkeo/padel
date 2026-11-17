/* Padel Pinnacle Cup — read-only historical site. Source: data/official-results.json */
(() => {
  'use strict';

  const NEXT_EVENT = Date.UTC(2026, 11, 4, 10, 0, 0); // December in Ireland is GMT
  const FALLBACK = './assets/players/default.svg';
  const PORTRAITS = window.PPC_PLAYER_PORTRAITS || {};
  const PLAYERS = [
    ['p-gavin', 'Gavin Keohane'], ['p-kennedy', 'Kennedy Murphy'],
    ['p-ciaran', 'Ciaran Kearney'], ['p-luke', 'Luke Murphy'],
    ['p-geraldo', "Ger O'Brien", 'Geraldo'], ['p-sean', 'Sean Kelly'],
    ['p-cian', "Cian O'Connor"], ['p-dan', 'Daniel McCarthy', 'Dan'],
    ['p-peter', 'Peter Gilroy'], ['p-james', "James O'Leary"],
    ['p-rob', 'Rob McKenzie'], ['p-gary', 'Gary Foolkes'],
    ['p-jack', 'Jack'], ['p-bean', 'Ciaran Barry', 'Bean'],
    ['p-eric', 'Eric Trihy'], ['p-connell-mcbride', 'Connell McBride']
  ].map(([id, name, nickname]) => ({id, name, nickname: nickname || ''}));
  const playerById = new Map(PLAYERS.map(p => [p.id, p]));
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[c]);
  const getPlayer = id => playerById.get(id) || {id, name: id || 'Unknown player', nickname: ''};
  const portrait = id => PORTRAITS[id] || FALLBACK;
  const fmtDate = iso => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return 'Date to confirm';
    return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-IE', {
      day:'numeric', month:'short', year:'numeric', timeZone:'UTC'
    });
  };
  const eventLabel = e => e.number ? 'PPC ' + e.number : e.name;
  const median = scores => {
    if (!scores.length) return null;
    const sorted = [...scores].sort((a,b) => a-b), n = sorted.length;
    return n % 2 ? sorted[(n-1)/2] : (sorted[n/2-1] + sorted[n/2])/2;
  };
  const number = n => Number.isInteger(n) ? String(n) : n.toFixed(1);
  const pointList = (events, id) =>
    events.filter(e => e.kind === 'americano' && Array.isArray(e.standings))
      .map(event => ({event, row: event.standings.find(x => x.id === id)}))
      .filter(x => x.row && Number.isFinite(x.row.points))
      .sort((a,b) => (a.event.date||'').localeCompare(b.event.date||''));
  const champs = (events, id) =>
    events.filter(e => e.kind === 'americano' && (e.champions||[]).includes(id));
  const b2Team = (events,id) => {
    const event = events.find(e => e.id === 'b2-cup');
    if (!event) return null;
    if (event.matches?.some(m => m.a.includes(id))) return 'HipEx';
    if (event.matches?.some(m => m.b.includes(id))) return 'Poly';
    return null;
  };
  let events = [];

  function renderTournamentGap() {
    const lastDate = events.reduce((latest, event) =>
      /^\d{4}-\d{2}-\d{2}$/.test(event.date || '') && event.date > latest ? event.date : latest, '');
    if (!lastDate) return;

    const nextDate = new Date(NEXT_EVENT).toISOString().slice(0, 10);
    const days = (Date.parse(nextDate) - Date.parse(lastDate)) / 86400000;
    if (days > 0) $('tournamentGap').textContent = days + ' days between tournaments';
  }

  function countdown() {
    const difference = NEXT_EVENT - Date.now();
    if (difference <= 0) {
      $('countdown').innerHTML = '<span class="countdown-finished">Tournament date reached</span>';
      return;
    }
    const d = Math.floor(difference/86400000);
    const h = Math.floor(difference/3600000) % 24;
    const m = Math.floor(difference/60000) % 60;
    const s = Math.floor(difference/1000) % 60;
    $('countdown').innerHTML = [[d,'Days'],[h,'Hours'],[m,'Minutes'],[s,'Seconds']].map(([n,label]) =>
      '<span class="timeblock"><strong>' + String(n).padStart(2,'0') +
      '</strong><small>' + label + '</small></span>'
    ).join('');
  }

  function renderHonours() {
    const tally = new Map();
    for (const e of events.filter(x => x.kind === 'americano')) {
      for (const id of e.champions || []) {
        if (!tally.has(id)) tally.set(id, {id, titles:[]});
        tally.get(id).titles.push(e);
      }
    }
    const rows = [...tally.values()].sort((a,b) => b.titles.length-a.titles.length ||
      getPlayer(a.id).name.localeCompare(getPlayer(b.id).name));
    $('honoursList').innerHTML = rows.map((r,i) => {
      const p = getPlayer(r.id);
      return '<article class="honour-card' + (i===0?' honours-first':'') + '">' +
        '<div class="honour-identity"><img src="' + esc(portrait(r.id)) + '" alt="" loading="lazy">' +
        '<div><span class="small-label">' + (i===0?'Most titles':'PPC champion') + '</span>' +
        '<h3>' + esc(p.name) + '</h3><button class="text-link" type="button" data-player="' + esc(r.id) +
        '">View player profile <span aria-hidden="true">↗</span></button></div></div>' +
        '<div class="honour-total"><strong>' + r.titles.length + '</strong><span>' +
        (r.titles.length===1?'TITLE':'TITLES') + '</span></div>' +
        '<div class="honour-cups">' + r.titles.sort((a,b)=>a.number-b.number).map(e =>
          '<button type="button" data-event="' + esc(e.id) + '">' + esc(eventLabel(e)) + ' ↗</button>'
        ).join('') + '</div></article>';
    }).join('');
  }

  function renderMerit() {
    const totals = new Map();
    for (const e of events.filter(e => e.kind === 'americano' && e.standings)) {
      for (const p of e.standings) {
        if (!Number.isFinite(p.points)) continue;
        if (!totals.has(p.id)) totals.set(p.id, {id:p.id,points:0,played:0});
        const row=totals.get(p.id);
        row.points += p.points; row.played++;
      }
    }
    const ranked = [...totals.values()].sort((a,b)=>b.points-a.points ||
      getPlayer(a.id).name.localeCompare(getPlayer(b.id).name));
    $('meritList').innerHTML = ranked.map((r,i)=>{
      const p=getPlayer(r.id);
      const nickname = p.id === 'p-geraldo' || p.id === 'p-dan' ? '' : p.nickname;
      return '<button class="merit-row" type="button" data-player="' + esc(r.id) +
        '" aria-label="View ' + esc(p.name) + ' profile">' +
        '<span class="merit-person"><span class="rank">' + (i+1) + '</span>' +
        '<img src="' + esc(portrait(r.id)) + '" alt="" loading="lazy">' +
        '<span>' + esc(p.name) + (nickname ? '<small>' + esc(nickname) + '</small>' : '') + '</span></span>' +
        '<strong class="merit-points">' + r.points + '</strong></button>';
    }).join('');
  }

  function renderArchive() {
    const sorted = [...events].sort((a,b) => (b.date||'').localeCompare(a.date||''));
    $('archiveList').innerHTML = sorted.map(e=>{
      const team=e.kind==='team';
      const winner=team?'HipEx ' + e.winningScore + '–' + e.losingScore + ' Poly' :
        esc((e.champions||[]).map(id=>getPlayer(id).name).join(' & '));
      const title=team?'B2Cup':eventLabel(e);
      return '<button type="button" class="archive-card" data-event="' + esc(e.id) +
        '" aria-label="View results for ' + esc(e.name) + '">' +
        '<span class="archive-icon">' + (team?'B2':'PPC') + '</span>' +
        '<span class="archive-info"><span class="small-label">' + esc(fmtDate(e.date)) + '</span>' +
        '<strong>' + esc(title) + '</strong><span>' + winner + (team?'':' · Champion') + '</span></span>' +
        '<span class="arrow" aria-hidden="true">↗</span></button>';
    }).join('');
  }

  function calculateRankings() {
    const rows=PLAYERS.map(player=>{
      const records=pointList(events,player.id);
      const scores=records.map(item=>item.row.points);
      return {player,events:scores.length,score:median(scores),best:scores.length?Math.max(...scores):null};
    });
    // Highest median first; a best single-event score breaks equal medians, then name.
    const ranked=rows.filter(r=>r.events>=2)
      .sort((a,b)=>b.score-a.score||b.best-a.best||a.player.name.localeCompare(b.player.name));
    const unranked=rows.filter(r=>r.events<2).sort((a,b)=>
      b.events-a.events||a.player.name.localeCompare(b.player.name));
    return {ranked,unranked};
  }
  function renderPlayers() {
    const {ranked}=calculateRankings();
    $('playerList').innerHTML=ranked.map((r,i)=>{
      const p=r.player;
      return '<button class="ranking-row" type="button" data-player="'+esc(p.id)+
        '" aria-label="View '+esc(p.name)+' player statistics">'+
        '<span class="ranking-position">'+(i+1)+'</span>'+
        '<img class="ranking-avatar" src="'+esc(portrait(p.id))+'" alt="" loading="lazy">'+
        '<span class="ranking-name">'+esc(p.name)+'</span>'+
        '<strong class="ranking-points">'+number(r.score)+'</strong></button>';
    }).join('');
  }

  function profile(id) {
    const p=getPlayer(id), records=pointList(events,id), scores=records.map(x=>x.row.points);
    const typical=median(scores), high=scores.length?Math.max(...scores):null;
    const titles=champs(events,id).length, team=b2Team(events,id);
    $('playerDialogAvatar').src=portrait(id);
    $('playerDialogAvatar').alt='Portrait of '+p.name;
    $('playerDialogName').textContent=p.name;
    $('playerDialogNick').textContent=p.nickname || '';
    $('playerDialogNick').hidden=!p.nickname;
    $('playerDialogSub').textContent=titles + ' PPC ' + (titles===1?'title':'titles');
    $('playerDialogBody').innerHTML =
      '<div class="profile-metrics">' +
      '<div><small>Highest PPC score</small><strong>' + (high??'—') + '</strong></div>' +
      '<div><small>Tournaments</small><strong>' + (records.length + (team?1:0)) + '</strong></div>' +
      '<div><small>Median PPC score</small><strong>' + (typical===null?'—':number(typical)) + '</strong></div>' +
      '</div>' +
      (team === 'HipEx' ?
        '<p class="b2-honour"><span aria-hidden="true">★</span> Member of the HipEx team who won the B2Cup in 2025.</p>' :
        team === 'Poly' ? '<p class="b2-participant">Represented Poly in the B2Cup on 21 January 2025.</p>' : '') +
      '<h3 class="detail-subheading">PPC results</h3>' +
      (records.length ?
        '<div class="profile-event-list">' + records.map(({event,row}) =>
          '<button type="button" data-event="' + esc(event.id) + '"><span>' + esc(eventLabel(event)) +
          '<small>' + esc(fmtDate(event.date)) + '</small></span><strong>' + row.points + ' pts' +
          ((event.champions||[]).includes(id)?' ★':'') + '</strong></button>'
        ).join('') + '</div>' :
        '<p class="empty-note">No individual PPC appearances recorded.</p>');
    $('playerDialog').showModal();
  }

  function viewEvent(id) {
    const e=events.find(x=>x.id===id);
    if (!e) return;
    const team=e.kind==='team';
    $('eventDialogTitle').textContent=team?'B2Cup — HipEx vs Poly':e.name;
    $('eventDialogMeta').textContent=fmtDate(e.date) + (team?' · Team competition':' · Americano · 7 rounds');
    let content='';
    if (team) {
      content='<div class="event-result"><span>HIPEX</span><strong>' + e.winningScore + '–' + e.losingScore +
        '</strong><span>POLY</span></div>';
    } else {
      const winner=(e.champions||[]).map(id=>getPlayer(id).name).join(' & ');
      content='<div class="event-winner"><span>Champion</span><strong>' + esc(winner) +
        '</strong><b>' + e.winningPoints + ' pts</b></div>';
      if (e.standings?.length) {
        content+='<h3 class="detail-subheading">Final standings</h3><div class="table-wrap"><table class="results-table"><thead><tr>' +
          '<th>#</th><th>Player</th><th>W–D–L</th><th>Points</th><th>PD</th></tr></thead><tbody>' +
          e.standings.map((r,i)=>'<tr><td>' + (i+1) + '</td><td>' + esc(getPlayer(r.id).name) +
            '</td><td>' + (r.wins??0) + '–' + (r.draws??0) + '–' +
            (r.losses??((r.played??7)-(r.wins??0)-(r.draws??0))) + '</td><td><b>' + r.points +
            '</b></td><td>' + (r.pd>0?'+':'') + r.pd + '</td></tr>').join('') +
          '</tbody></table></div>';
      }
    }
    if (e.specialReport) {
      content+='<div class="incident-note"><h3>' + esc('PPC 2 — Scheduling note') + '</h3><p>' +
        esc(e.specialReport.details) + '</p><p>' + esc(e.specialReport.medicalNote) + '</p></div>';
    }
    if (e.matches?.length) {
      content+='<h3 class="detail-subheading">Match results</h3>';
      for (let round=1;round<= (team?5:7);round++) {
        const matches=e.matches.filter(m=>m.round===round);
        if (!matches.length) continue;
        const detail=team?e.rounds?.find(r=>r.round===round):null;
        content+='<div class="round-block"><div class="round-label">Round ' + round +
          (detail?' · '+esc(detail.time)+' · HipEx '+detail.a+'–'+detail.b+' Poly':'') + '</div>' +
          matches.map(m=>'<div class="match-line"><small>Court ' + m.court + '</small>' +
            '<span>' + m.a.map(id => esc(getPlayer(id).name)).join('<br>') + '</span>' +
            '<strong>' + (m.scoreA??'—') + ' – ' + (m.scoreB??'—') + '</strong>' +
            '<span>' + m.b.map(id => esc(getPlayer(id).name)).join('<br>') + '</span></div>').join('') +
          '</div>';
      }
    }
    if (e.sourceUrl) content+='<p class="source-link"><a href="' + esc(e.sourceUrl) +
      '" target="_blank" rel="noopener noreferrer">Original Padelution record ↗</a></p>';
    $('eventDialogBody').innerHTML=content;
    $('eventDialog').showModal();
  }

  function delegateClicks(event) {
    const eventButton=event.target.closest('[data-event]');
    if (eventButton) {
      const other=$('playerDialog');
      if (other.open) other.close();
      viewEvent(eventButton.dataset.event);return;
    }
    const playerButton=event.target.closest('[data-player]');
    if (playerButton) profile(playerButton.dataset.player);
  }

  async function init() {
    countdown();
    setInterval(countdown,1000);
    document.addEventListener('click', event=>{
      const close=event.target.closest('[data-close]');
      if (close) {$(close.dataset.close).close();return;}
      if (event.target.matches('dialog')) event.target.close();
      delegateClicks(event);
    });
    try {
      const response=await fetch('./data/official-results.json?v=20261117-serve-icon', {cache:'no-store'});
      if (!response.ok) throw new Error('HTTP '+response.status);
      const json=await response.json();
      if (!Array.isArray(json.events)) throw new Error('Invalid archive format');
      events=json.events;
      renderTournamentGap();
      renderHonours();renderMerit();renderArchive();renderPlayers();
    } catch (error) {
      const message='<p class="empty-note">Unable to load tournament records. Please refresh the page.</p>';
      ['honoursList','meritList','archiveList','playerList'].forEach(id=>$(id).innerHTML=message);
      console.error('PPC archive loading error:',error);
    }
  }
  // Read-only helpers used by the site tests. No browser editing or score-entry functionality.
  window.PPCStats={median,pointList,b2Team,calculateRankings};
  init();
})();
