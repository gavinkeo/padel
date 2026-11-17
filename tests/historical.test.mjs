import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const x=JSON.parse(readFileSync(new URL('../data/official-results.json',import.meta.url),'utf8')).events;
test('Champions and scores',()=>{assert.equal(x.find(e=>e.id==='ppc-3').winningPoints,137);assert.equal(x.find(e=>e.id==='ppc-3').champions[0],'p-dan');assert.equal(x.find(e=>e.id==='ppc-4').winningPoints,140);assert.equal(x.find(e=>e.id==='ppc-4').champions[0],'p-james')});
test('All match scores total 32 or 48 points',()=>{for(const e of x){assert.equal(e.matches.length,e.kind==='team'?15:14);for(const m of e.matches)assert.equal(m.scoreA+m.scoreB,e.pointsPerMatch)}});
test('B2 Cup total is HipEx 411, Poly 309',()=>{const e=x.find(e=>e.id==='b2-cup');assert.equal(e.matches.reduce((n,m)=>n+m.scoreA,0),411);assert.equal(e.matches.reduce((n,m)=>n+m.scoreB,0),309);for(const r of e.rounds){const m=e.matches.filter(x=>x.round===r.round);assert.equal(m.reduce((n,x)=>n+x.scoreA,0),r.a);assert.equal(m.reduce((n,x)=>n+x.scoreB,0),r.b)}});
test('PPC III / IV seven matches per player',()=>{for(const e of x.filter(e=>e.kind==='americano'))for(const p of e.participants)assert.equal(e.matches.filter(m=>m.a.concat(m.b).includes(p)).length,7)});
