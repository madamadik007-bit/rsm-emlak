import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../src/index.js',import.meta.url),'utf8');
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const calls=[];
Object.defineProperty(globalThis,'crypto',{value:{
 randomUUID:()=>webcrypto.randomUUID(),
 getRandomValues:x=>webcrypto.getRandomValues(x),
 subtle:{
  importKey:(...a)=>webcrypto.subtle.importKey(...a),
  digest:(...a)=>webcrypto.subtle.digest(...a),
  deriveBits:(p,...a)=>{calls.push(p.iterations);if(p.iterations>100000)throw new Error('Workers PBKDF2 cap');return webcrypto.subtle.deriveBits(p,...a);}
 }
},configurable:true});
let user=null;const sessions=new Map();
const DB={prepare(sql){return {bind(...args){return {
 async first(){if(sql.startsWith('SELECT password_hash'))return user?.email===args[0]?user:null;if(sql.startsWith('SELECT email FROM sessions'))return sessions.get(args[0])||null;throw Error(sql)},
 async run(){
 if(sql.startsWith('INSERT INTO users')){if(user)return {meta:{changes:0}};user={id:args[0],email:args[1],password_hash:args[2]};return {meta:{changes:1}}}
 if(sql.startsWith('INSERT INTO sessions')){sessions.set(args[0],{email:args[1]});return {meta:{changes:1}}}
 throw Error(sql)
 }
}}}}};
const env={DB};
const password='Synthetic-test-password-47!';
const req=(path,body)=>new Request('https://example.test/api/'+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
let res=await worker.fetch(req('register',{email:'owner@example.test',password:'short'}),env);
assert.equal(res.status,400);assert.equal(user,null);
res=await worker.fetch(req('register',{email:'owner@example.test',password}),env);
assert.equal(res.status,201);assert.match(res.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Lax/);
assert.match(user.password_hash,/^pbkdf2-sha256:100000:/);const saved={...user};
res=await worker.fetch(req('register',{email:'other@example.test',password}),env);
assert.equal(res.status,403);assert.deepEqual(user,saved);
res=await worker.fetch(req('login',{email:'owner@example.test',password:'wrong-password'}),env);assert.equal(res.status,401);
res=await worker.fetch(req('login',{email:'owner@example.test',password}),env);assert.equal(res.status,200);
res=await worker.fetch(new Request('https://example.test/api/me',{headers:{cookie:res.headers.get('set-cookie').split(';')[0]}}),env);
assert.equal((await res.json()).email,'owner@example.test');
res=await worker.fetch(req('register',{email:'owner@example.test',password}),{DB:{prepare(){throw Error('DB unavailable')}}});
assert.equal(res.status,503);assert.match((await res.json()).error,/Hesap oluşturma/);
assert.ok(calls.every(n=>n===100000));
assert.deepEqual(user,saved);
console.log('PASS: first registration, login, incorrect password, session identity, second-account lock, explicit server errors, unchanged account, capped crypto.');
