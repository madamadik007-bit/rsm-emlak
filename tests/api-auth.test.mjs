import assert from "node:assert/strict";
import worker from "../src/index.js";

const env={
 DB:{prepare(){throw new Error("Unauthenticated requests must not query the database")}},
 ASSETS:{fetch(){return new Response("static asset")}}
};
async function check(path,options,expected){
 const response=await worker.fetch(new Request("https://example.test"+path,options),env);
 assert.equal(response.status,expected,path);
 return response.json();
}
await check("/api/me",{},401);
await check("/api/people",{},401);
await check("/api/backup/preview",{method:"POST",headers:{"Content-Type":"application/json","Origin":"https://untrusted.test"},body:"{}"},403);
await check("/api/backup/preview",{method:"POST",headers:{"Origin":"https://example.test","Content-Type":"text/plain"},body:"{}"},415);
await check("/api/backup/preview",{method:"POST",headers:{"Origin":"https://example.test","Content-Type":"application/json"},body:"{}"},401);
console.log("API authentication and request-origin checks passed");
