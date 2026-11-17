import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const x=JSON.parse(readFileSync(new URL('../data/official-results.json',import.meta.url),'utf8')).events;
test('PPC I, III and IV champions',()=>{for(const [id,champion,pts] of [['ppc-1','p-james',151],['ppc-3','p-dan',137],['ppc-4','p-james',140]]){const e=x.find(e=>e.id===id);assert.equal(e.champions[0],champion);assert.equal(e.winningPoints,pts)}});
test('PPC I scores, standings, date, and results reconcile',()=>{const e=x.find(e=>e.id==='ppc-1');assert.equal(e.date,'2024-11-22');assert.equal(e.matchScoresVerified,true);assert.equal(e.matches.length,14);assert.equal(e.standings.length,8);assert.equal(e.standings.reduce((n,p)=>n+p.points,0),896);assert.equal(e.standings.reduce((n,p)=>n+p.against,0),896);const scores={};for(const p of e.participants)scores[p]={points:0,against:0,wins:0,draws:0,losses:0,played:0};for(const m of e.matches){assert.equal(m.scoreA+m.scoreB,32);for(const [team,pf,pa] of [[m.a,m.scoreA,m.scoreB],[m.b,m.scoreB,m.scoreA]])for(const id of team){const v=scores[id];v.points+=pf;v.against+=pa;v.wins+=Number(pf>pa);v.draws+=Number(pf===pa);v.losses+=Number(pf<pa);v.played++}}for(const p of e.standings){const v=scores[p.id];assert.deepEqual([v.points,v.against,v.wins,v.draws,v.losses,v.played],[p.points,p.against,p.wins,p.draws,p.losses,p.played]);assert.equal(p.points-p.against,p.pd)}assert.equal(e.matches[11].scoreA,9);assert.equal(e.matches[11].scoreB,23)});
test('All verified match scores total 32 or 48 points',()=>{for(const e of x){assert.equal(e.matches.length,e.kind==='team'?15:e.id==='ppc-2'?0:14);for(const m of e.matches){if(m.scoreA==null||m.scoreB==null)continue;assert.equal(m.scoreA+m.scoreB,e.pointsPerMatch)}}});
test('B2Cup 411–309 result',()=>{const e=x.find(e=>e.id==='b2-cup');assert.equal(e.matches.reduce((n,m)=>n+m.scoreA,0),411);assert.equal(e.matches.reduce((n,m)=>n+m.scoreB,0),309);for(const r of e.rounds){const ms=e.matches.filter(m=>m.round===r.round);assert.equal(ms.reduce((n,m)=>n+m.scoreA,0),r.a);assert.equal(ms.reduce((n,m)=>n+m.scoreB,0),r.b)}});
test('Every Americano partnership and opponent is balanced',()=>{for(const e of x.filter(e=>e.kind==='americano'&&e.matches.length)){const p={},o={};for(const m of e.matches){for(const ids of [m.a,m.b]){const k=[...ids].sort().join('/');p[k]=(p[k]||0)+1}for(const a of m.a)for(const b of m.b){const k=[a,b].sort().join('/');o[k]=(o[k]||0)+1}}assert.equal(Object.keys(p).length,28);assert.ok(Object.values(p).every(v=>v===1));assert.ok(Object.values(o).every(v=>v===2))}});

test("Ger O'Brien is Geraldo in PPC I and all cups",()=>{
  const ppc1=x.find(e=>e.id==='ppc-1'); const ger=ppc1.standings.find(p=>p.id==='p-geraldo');
  assert.equal(ger.sourceLabel,"GER O'BRIEN");assert.equal(ger.nickname,'Geraldo');
  const subsequent=x.filter(e=>['ppc-3','b2-cup'].includes(e.id));
  for(const cup of subsequent)assert.ok(cup.participants.includes('p-geraldo'));
});

test('PPC II final standings and organiser incident report',()=>{const e=x.find(q=>q.id==='ppc-2');assert.ok(e);assert.equal(e.date,null);assert.equal(e.matches.length,0);assert.equal(e.matchScoresVerified,false);assert.deepEqual([e.champions[0],e.winningPoints],['p-james',141]);assert.equal(e.standings.length,8);assert.equal(e.standings.reduce((n,p)=>n+p.points,0),896);assert.equal(e.standings.reduce((n,p)=>n+p.against,0),896);assert.equal(e.standings.reduce((n,p)=>n+p.pd,0),0);for(const p of e.standings){assert.equal(p.played,7);assert.equal(p.wins+p.draws+p.losses,7);assert.equal(p.points-p.against,p.pd)}assert.equal(e.standings.find(p=>p.id==='p-gavin').points,96);assert.ok(e.specialReport.details.includes('three times rather than the intended twice'));assert.ok(e.specialReport.medicalNote.includes('man flu'))});

test('Dan is Daniel McCarthy across PPC II–IV, with no duplicate IDs',()=>{
 const events=x.filter(e=>e.kind==='americano');const ppc2=events.find(e=>e.id==='ppc-2');
 assert.equal(ppc2.standings.find(p=>p.id==='p-dan').points,116);
 assert.ok(!events.some(e=>e.standings.some(p=>p.id==='p-daniel-mccarthy')));
 assert.equal(events.filter(e=>e.participants.includes('p-dan')).length,3);
 const all=events.flatMap(e=>e.standings);
 const totals={}; for(const p of all)totals[p.id]=(totals[p.id]||0)+p.points;
 assert.equal(totals['p-dan'],389);
 assert.equal(totals['p-gavin'],467);assert.equal(totals['p-kennedy'],433);assert.equal(totals['p-james'],432);
 assert.equal(x.find(e=>e.id==='ppc-2').participants.filter(id=>id==='p-connell-mcbride').length,1);
});
test('All official tournament records use Padel Pinnacle Cup',()=>{for(const e of x.filter(e=>e.kind==='americano'))assert.match(e.name,/Padel Pinnacle Cup/);});

test('Roll of Honour shows James three titles and Dan one, excluding B2Cup',()=>{
  const titles={};
  for(const e of x.filter(e=>e.kind==='americano'))for(const p of e.champions||[])titles[p]=(titles[p]||0)+1;
  assert.deepEqual(titles,{'p-james':3,'p-dan':1});
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  assert.ok(html.indexOf('id="honours"')<html.indexOf('id="merit"'));
  assert.ok(js.includes('renderHonours();renderMerit();'));
});

test('Large player portraits, fallback and profile viewer are wired up',()=>{
 const portraits=readFileSync(new URL('../portraits.js',import.meta.url),'utf8');
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 for(const name of ['eric','kennedy','gavin','gary','sean','ciaran','james','geraldo','dan']){
   assert.ok(statSync(new URL('../assets/players/'+name+'.webp',import.meta.url)).size>10000,name+' image should be high resolution');
   assert.ok(portraits.includes('p-'+name),name+' has a custom portrait');
 }
 assert.ok(statSync(new URL('../assets/players/default.svg',import.meta.url)).size>500);
 assert.ok(app.includes("window.PPC_PLAYER_PORTRAITS?.[player?.id] || './assets/players/default.svg'"));
 assert.ok(html.includes('id="profileName"') && html.includes('id="editPlayerDetails"'));
 assert.ok(app.includes("[days,'Days']")&&app.includes("[hours,'Hours']")&&app.includes("[minutes,'Minutes']"));
 assert.ok(html.indexOf('id="honours"')<html.indexOf('id="merit"'));
});

test('Connell McBride has one canonical player ID and PPC II appearance',()=>{
 const event=x.find(e=>e.id==='ppc-2');
 assert.ok(event.participants.includes('p-connell-mcbride'));
 assert.equal(event.standings.find(p=>p.id==='p-connell-mcbride').points,118);
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.ok(app.includes("replace(/[^a-z0-9]+/g,'-')"));
 assert.ok(app.includes("id==='p-connellmcbride'?'p-connell-mcbride'"));
});
