const CACHE_NAME = "green-hero-cache-v1"
const OFFLINE_URL = "/"

const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/icon.svg",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch strategy
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests and skip API / hot reload calls
  if (request.method !== "GET" || url.pathname.startsWith("/api") || url.pathname.includes("_next/webpack")) {
    return
  }

  // Caching Strategy: Network first with Cache fallback for pages; Cache first for static assets
  const isStaticAsset =
    url.pathname.includes("_next/static") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2")

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse

        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse
          }
          const cacheCopy = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy))
          return networkResponse
        }).catch(() => {
          // Silent catch for missing static assets
        })
      })
    )
  } else {
    // Page navigation: Network-first
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const cacheCopy = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy))
          return networkResponse
        })
        .catch(() => {
          // If offline, serve from cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse
            
            // Fallback to offline home page shell
            return caches.match(OFFLINE_URL)
          })
        })
    )
  }
})

// Listener for FCM or local background push notifications
self.addEventListener("push", (event) => {
  let title = "Green Hero"
  let options = {
    body: "Your centerpiece ecosystem is waiting for you! 🌿",
    icon: "/icon.svg",
    badge: "/icon.svg",
  }

  if (event.data) {
    try {
      const data = event.data.json()
      title = data.title || title
      options = { ...options, ...data.options }
    } catch (e) {
      options.body = event.data.text()
    }
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/")
      }
    })
  )
})
