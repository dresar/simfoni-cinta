const CACHE_NAME = "simfoni-cinta-v5";

self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys.map((key) => caches.delete(key))
			)
		)
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") return;

	let url;
	try {
		url = new URL(event.request.url);
	} catch {
		return;
	}

	// Jangan pernah intersep request cross-origin (Cloudflare Insights, Google Analytics, CDN)
	if (url.origin !== self.location.origin) {
		return;
	}

	// Jangan pernah intersep API, proses login, verifikasi OAuth, atau token
	if (
		url.pathname.startsWith("/api/") ||
		url.pathname.startsWith("/login") ||
		url.pathname.startsWith("/demo/") ||
		url.pathname.startsWith("/admin") ||
		url.pathname.startsWith("/dasbor") ||
		url.search.includes("auth") ||
		url.search.includes("token") ||
		url.search.includes("verifier")
	) {
		return;
	}

	// Navigasi halaman HTML diserahkan langsung ke browser/server SSR
	if (event.request.mode === "navigate") {
		return;
	}

	// Hanya tangani file aset statis lokal
	const isStaticAsset = /\.(png|jpg|jpeg|webp|svg|ico|woff|woff2|ttf|css)$/i.test(url.pathname);
	if (!isStaticAsset) {
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cached) => {
			if (cached) return cached;
			return fetch(event.request)
				.then((response) => {
					if (!response || response.status !== 200 || response.type !== "basic") {
						return response;
					}
					const responseToCache = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache);
					});
					return response;
				})
				.catch(() => {
					return new Response("", {
						status: 404,
						statusText: "Not Found",
						headers: { "Content-Type": "text/plain" },
					});
				});
		})
	);
});
