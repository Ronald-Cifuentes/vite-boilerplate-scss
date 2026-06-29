/*
 * Self-destructing "kill-switch" service worker.
 *
 * THIS APP DOES NOT USE A SERVICE WORKER. This file exists only to neutralize a
 * stale service worker that some OTHER project may have previously registered on
 * this origin (e.g. http://localhost:5173) — a common cause of "I see a different
 * old app on this port". When the browser update-checks the old SW, it fetches
 * this file, installs it, and it immediately unregisters itself and clears caches.
 *
 * Safe to delete once your browser no longer has a stale registration.
 */
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys()
        await Promise.all(keys.map(key => caches.delete(key)))
      } catch (err) {
        // ignore — best effort cache cleanup
      }
      await self.registration.unregister()
      const clients = await self.clients.matchAll({ type: 'window' })
      clients.forEach(client => client.navigate(client.url))
    })()
  )
})
