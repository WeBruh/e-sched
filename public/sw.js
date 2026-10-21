const CACHE = "esched-v2";

async function precache() {
  const cache = await caches.open(CACHE);
  const res = await fetch("/index.html", { cache: "reload" });
  const html = await res.clone().text();
  await cache.put("/index.html", res.clone());
  await cache.put("/", res);
  const assets = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]);
  const extras = ["/icon-192.png", "/icon-512.png", "/manifest.webmanifest"];
  await Promise.all([...assets, ...extras].map((u) => cache.add(u).catch(() => {})));
}

self.addEventListener("install", (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/index.html")))
  );
});