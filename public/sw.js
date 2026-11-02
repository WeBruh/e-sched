const CACHE = "esched-v6";
const WALLPAPERS = [
  "/wallpapers/ghost-rider-skull.mp4",
  "/wallpapers/spring-stroll-with-her.mp4",
];

async function precache() {
  const cache = await caches.open(CACHE);
  const res = await fetch("/index.html", { cache: "reload" });
  const html = await res.clone().text();
  await cache.put("/index.html", res.clone());
  await cache.put("/", res);
  const assets = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]);
  const files = [...assets, "/icon-192.png", "/icon-512.png", "/manifest.webmanifest", "/sounds/check.wav"];
  for (const u of assets.filter((a) => a.endsWith(".css"))) {
    try {
      const css = await (await fetch(u)).text();
      [...css.matchAll(/url\((\/[^)]+)\)/g)].forEach((m) => files.push(m[1]));
    } catch {}
  }
  await Promise.all(files.map((u) => cache.add(u).catch(() => {})));
  await cache.addAll(WALLPAPERS);
}

self.addEventListener("install", (e) => e.waitUntil(precache().then(() => self.skipWaiting())));

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => clients.claim())
  );
});

// Saved copy first (instant, works offline), refresh in the background
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  if (req.destination === "video") {
    e.respondWith((async () => {
      const cached = await caches.match(req.url);
      if (!cached) return fetch(req);

      const range = req.headers.get("range");
      if (!range) return cached;

      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const blob = await cached.blob();
      const size = blob.size;
      if (!match || (!match[1] && !match[2])) {
        return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      }

      let start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
      let end = match[2] && match[1] ? Number(match[2]) : size - 1;
      if (start >= size || end < start) {
        return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      }
      end = Math.min(end, size - 1);

      const headers = new Headers(cached.headers);
      headers.set("Accept-Ranges", "bytes");
      headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
      headers.set("Content-Length", String(end - start + 1));
      return new Response(blob.slice(start, end + 1, cached.headers.get("Content-Type") || "video/mp4"), {
        status: 206,
        statusText: "Partial Content",
        headers,
      });
    })());
    return;
  }

  if (req.mode === "navigate" || new URL(req.url).pathname === "/index.html") {
    e.respondWith(
      fetch(req, { cache: "no-cache" })
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("/index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() => hit || caches.match("/index.html"));
      return hit || net;
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if ("focus" in c) return c.focus();
      return clients.openWindow("/");
    })
  );
});