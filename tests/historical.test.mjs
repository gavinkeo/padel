import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, statSync} from 'node:fs';
import vm from 'node:vm';

const data = JSON.parse(readFileSync(new URL('../data/official-results.json', import.meta.url),'utf8'));
const events = data.events;
const byId = id => events.find(e=>e.id===id);
const html = readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app = readFileSync(new URL('../app.js',import.meta.url),'utf8');

test('The organiser-confirmed dates appear on every record',()=>{
  const dates={'ppc-1':'2024-12-10','ppc-2':'2024-12-20','b2-cup':'2025-01-21','ppc-3':'2025-02-11','ppc-4':'2025-03-14'};
  assert.deepEqual(Object.fromEntries(events.map(e=>[e.id,e.date])),dates);
});

test('PPC 1 verified match scores reconcile with all standings',()=>{
  const e=byId('ppc-1');
  assert.equal(e.matches.length,14);
  const scores={};
  for(const id of e.participants)scores[id]={points:0,against:0,wins:0,draws:0,losses:0,played:0};
  for(const m of e.matches){
    assert.equal(m.scoreA+m.scoreB,32);
    for(const [ids,forPts,against] of [[m.a,m.scoreA,m.scoreB],[m.b,m.scoreB,m.scoreA]])
      for(const id of ids){
        const x=scores[id];x.points+=forPts;x.against+=against;x.played++;
        if(forPts>against)x.wins++;else if(forPts===against)x.draws++;else x.losses++;
      }
  }
  for(const p of e.standings){
    const x=scores[p.id];assert.deepEqual(
      [x.points,x.against,x.wins,x.draws,x.losses,x.played],
      [p.points,p.against,p.wins,p.draws,p.losses,p.played]
    );
  }
  assert.equal(e.matches[11].scoreA,9);
  assert.equal(e.matches[11].scoreB,23);
});

test('PPC 2 has verified standings but no fabricated match scores',()=>{
  const e=byId('ppc-2');
  assert.equal(e.matches.length,0);
  assert.equal(e.matchScoresVerified,false);
  assert.equal(e.standings.length,8);
  assert.equal(e.standings.reduce((s,p)=>s+p.points,0),896);
  assert.ok(e.specialReport.details.includes('three times rather than the intended twice'));
  assert.ok(e.specialReport.medicalNote.includes('man flu'));
  assert.equal(e.standings.find(p=>p.id==='p-dan').points,116);
});

test('PPC 3 / IV all matches balance to 32 points and standings are correct',()=>{
  for(const id of ['ppc-3','ppc-4']){
    const e=byId(id);
    assert.equal(e.matches.length,14);
    assert.ok(e.matches.every(m=>m.scoreA+m.scoreB===32));
    assert.equal(e.standings.length,8);
    assert.equal(e.standings.reduce((s,p)=>s+p.points,0),896);
  }
  assert.deepEqual(byId('ppc-3').champions,['p-dan']);
  assert.deepEqual(byId('ppc-4').champions,['p-james']);
});

test('B2Cup was won 411–309 by HipEx; correct six players on each team',()=>{
  const e=byId('b2-cup');
  assert.equal(e.kind,'team');
  assert.equal(e.matches.length,15);
  assert.ok(e.matches.every(m=>m.scoreA+m.scoreB===48));
  assert.equal(e.matches.reduce((n,m)=>n+m.scoreA,0),411);
  assert.equal(e.matches.reduce((n,m)=>n+m.scoreB,0),309);
  const winners=new Set(e.matches.flatMap(m=>m.a));
  const opponents=new Set(e.matches.flatMap(m=>m.b));
  assert.deepEqual([...winners].sort(),['p-gavin','p-james','p-geraldo','p-sean','p-gary','p-kennedy'].sort());
  assert.deepEqual([...opponents].sort(),['p-dan','p-jack','p-cian','p-ciaran','p-luke','p-bean'].sort());
  assert.equal(data.playerAliases['p-bean'].fullName,'Ciaran Barry');
});

test('Roll of Honour is James 3 titles, Dan 1; total Order of Merit scores',()=>{
  const titles={},points={};
  for(const e of events.filter(e=>e.kind==='americano')){
    for(const id of e.champions||[])titles[id]=(titles[id]||0)+1;
    for(const row of e.standings){
      points[row.id]=(points[row.id]||0)+row.points;
    }
  }
  assert.deepEqual(titles,{'p-james':3,'p-dan':1});
  assert.equal(points['p-gavin'],467);
  assert.equal(points['p-kennedy'],433);
  assert.equal(points['p-james'],432);
  assert.equal(points['p-dan'],389);
});

test('Median is robust to a single low tournament',()=>{
  const nodes=new Map();
  const doc={
    getElementById(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',hidden:false,querySelectorAll(){return []}});return nodes.get(id);},
    addEventListener(){}
  };
  const context={window:{PPC_PLAYER_PORTRAITS:{}},document:doc,Date,console,
    fetch:async()=>({ok:true,json:async()=>data}),setInterval(){}};
  vm.runInNewContext(app,context);
  const {median,pointList,b2Team}=context.window.PPCStats;
  assert.equal(median([118,96,121,132]),119.5);
  assert.equal(median([141,10,140]),140);
  assert.equal(median([96]),96);
  assert.equal(median([]),null);
  assert.equal(pointList(events,'p-gavin').length,4);
  assert.equal(b2Team(events,'p-gavin'),'HipEx');
  assert.equal(b2Team(events,'p-dan'),'Poly');
  assert.equal(b2Team(events,'p-connell-mcbride'),null);
});

test('Public homepage is read-only with profiles at bottom and compact countdown',()=>{
  assert.ok(html.indexOf('id="players"')<html.indexOf('id="honours"'));
  assert.ok(html.indexOf('id="honours"')<html.indexOf('id="merit"'));
  assert.ok(html.indexOf('id="merit"')<html.indexOf('id="history"'));
  assert.ok(html.includes('Days')&&html.includes('Hours')&&html.includes('Minutes'));
  assert.ok(html.includes('id="playerDialog"'));
  for(const legacy of ['generateBtn','finalizeBtn','addPlayerBtn','addHistoryBtn','importBtn','exportBtn','score-input','match-centre'])
    assert.ok(!html.includes(legacy),'unexpected button: '+legacy);
  for(const legacy of ['generateTournament','saveScore','addHistory','localStorage'])
    assert.ok(!app.includes(legacy),'unexpected legacy JS '+legacy);
  assert.ok(app.includes("Member of the HipEx team who won the B2Cup in 2025."));
  assert.ok(app.includes("'p-bean', 'Ciaran Barry'"));
  assert.ok(app.includes('<small>Tournaments</small>'));
  assert.ok(app.includes('records.length + (team?1:0)'));
});

test('High-resolution portraits remain available, defaults for other players',()=>{
  const portraits=readFileSync(new URL('../portraits.js',import.meta.url),'utf8');
  for(const name of ['eric','kennedy','gavin','gary','sean','ciaran','james','geraldo','dan']){
    assert.ok(statSync(new URL('../assets/players/'+name+'.webp',import.meta.url)).size>10000,name);
    assert.ok(portraits.includes('p-'+name));
  }
  assert.ok(statSync(new URL('../assets/players/default.svg',import.meta.url)).size>500);
  assert.ok(app.includes("const FALLBACK = './assets/players/default.svg'"));
});

test('Asset URLs are versioned so new HTML never reuses old CSS or JS',()=>{
  const match = html.match(/\.\/styles\.css\?v=([^"']+)/);
  assert.ok(match,'stylesheet must use a cache-busting version');
  assert.ok(html.includes('./app.js?v='+match[1]));
  assert.ok(html.includes('./portraits.js?v='+match[1]));
  assert.ok(app.includes('official-results.json?v='+match[1]));
});

test('UI uses Arabic numeric cup labels, and live app fills all homepage sections',async()=>{
  for(const e of events.filter(e=>e.kind==='americano'))assert.match(e.name,/Padel Pinnacle Cup [1-4]$/);
  assert.ok(!/\bPPC [IVX]+\b/.test(html));
  assert.ok(!app.includes('const roman ='));
  const ids=['countdown','confirmedPlayers','tournamentGap','honoursList','meritList','archiveList','playerList','playerCount'];
  const nodes=Object.fromEntries(ids.map(id=>[id,{innerHTML:'',textContent:''}]));
  const browserDocument={getElementById(id){if(!(id in nodes))throw Error('Missing element: '+id);return nodes[id]},addEventListener(){}};
  const browser={window:{PPC_PLAYER_PORTRAITS:{}},document:browserDocument,Date,console,fetch:async()=>({ok:true,json:async()=>data}),setInterval(){}};
  vm.runInNewContext(app,browser);
  await new Promise(resolve=>setImmediate(resolve));
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(nodes.countdown.innerHTML,/Days/);
  assert.match(nodes.countdown.innerHTML,/Seconds/);
  assert.equal(nodes.tournamentGap.textContent,'630 days between tournaments');
  assert.doesNotMatch(nodes.meritList.innerHTML,/<small>(Geraldo|Dan)<\/small>/);
  assert.match(nodes.honoursList.innerHTML,/James O/);
  assert.match(nodes.honoursList.innerHTML,/Daniel McCarthy/);
  assert.match(nodes.meritList.innerHTML,/Gavin Keohane/);
  assert.match(nodes.archiveList.innerHTML,/PPC 1/);
  assert.match(nodes.archiveList.innerHTML,/PPC 4/);
  assert.match(nodes.playerList.innerHTML,/James O/);
});

test('Median rankings require two PPC appearances, keep other players visible',async()=>{
  const ids=['countdown','confirmedPlayers','tournamentGap','honoursList','meritList','archiveList','playerList','playerCount'];
  const nodes=Object.fromEntries(ids.map(id=>[id,{innerHTML:'',textContent:''}]));
  const browserDoc={getElementById(id){if(!(id in nodes))throw Error('Missing element: '+id);return nodes[id]},addEventListener(){}};
  const browser={window:{PPC_PLAYER_PORTRAITS:{}},document:browserDoc,Date,console,fetch:async()=>({ok:true,json:async()=>data}),setInterval(){}};
  vm.runInNewContext(app,browser);
  await new Promise(resolve=>setImmediate(resolve));
  await new Promise(resolve=>setImmediate(resolve));
  const {ranked,unranked}=browser.window.PPCStats.calculateRankings();
  assert.equal(ranked.length,10);
  assert.equal(unranked.length,6);
  assert.deepEqual(Array.from(ranked.slice(0,3),r=>r.player.id),['p-james','p-dan','p-gavin']);
  assert.deepEqual(Array.from(ranked.slice(0,3),r=>r.score),[141,136,119.5]);
  assert.ok(ranked.every(p=>p.events>=2));
  assert.ok(unranked.every(p=>p.events<2));
  assert.ok(unranked.some(p=>p.player.id==='p-connell-mcbride'));
  assert.ok(unranked.some(p=>p.player.id==='p-bean'));
  assert.ok(nodes.playerList.innerHTML.includes('119.5'));
  assert.ok(!nodes.playerList.innerHTML.includes('Connell McBride'));
  assert.ok(!nodes.playerList.innerHTML.includes('Ciaran Barry'));
  assert.ok(!nodes.meritList.innerHTML.includes('merit-played'));
  assert.ok(!html.includes('<span>Events</span><span>Points</span>'));
  assert.ok(html.includes('<h2>Provisional Rankings</h2>'));
});

test('Compact tournament banner and provisional rankings text',()=>{
  assert.ok(html.includes('<h2>Provisional Rankings</h2>'));
  assert.ok(html.includes('>Rankings</a>'));
  assert.ok(html.includes('<h2>Champions</h2>'));
  assert.ok(html.includes('<h2>Tournaments</h2>'));
  assert.ok(html.includes('>Champions</a>'));
  assert.ok(html.includes('>Tournaments</a>'));
  assert.ok(html.includes('PPC 5 <span>·</span> The Return'));
  assert.ok(html.includes('Friday 4 December 2026'));
  assert.ok(!html.includes('The return <span>·</span> 4 December 2026'));
  const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  assert.ok(css.includes('.next-layout{grid-template-columns:minmax(0,1fr) 305px'));
  assert.ok(css.includes('.event-countdown{max-width:none;display:flex;align-items:center'));
});

test('Connell and Peter have approved full-resolution blue padel profile portraits',()=>{
 const portraits=readFileSync(new URL('../portraits.js',import.meta.url),'utf8');
 assert.ok(portraits.includes('"p-connell-mcbride":"./assets/players/connell.webp"'));
 assert.ok(portraits.includes('"p-peter":"./assets/players/peter.webp"'));
 for(const name of ['connell','peter'])assert.ok(statSync(new URL('../assets/players/'+name+'.webp',import.meta.url)).size>40000,name);
});
