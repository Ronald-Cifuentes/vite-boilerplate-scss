/*
 * Self-destructing "kill-switch" service worker (CRA-style path).
 * See public/sw.js for the full explanation. This app uses no service worker;
 * this file only unregisters a stale one left by a previous project on this origin.
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
