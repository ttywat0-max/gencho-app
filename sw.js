/* 現調ノート。一度開けば圏外でも開ける。
   版が変わったら古いものを捨てて入れ替える */
var CACHE = "gencho-588d3ccf";
var FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ return k===CACHE?null:caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  /* まずネットを見に行き、だめならしまってあるものを出す。
     こうしておくと、更新はすぐ届くのに、圏外でも開ける */
  e.respondWith(
    fetch(e.request).then(function(r){
      var copy = r.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return r;
    }).catch(function(){ return caches.match(e.request).then(function(m){
      return m || caches.match("./index.html");
    }); })
  );
});
