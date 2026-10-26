// Retire the 2018 Gatsby root worker without touching other project sites.
const oldPages = new Set([
  '/about/', '/archive/', '/categories/tech/', '/categories/biz/',
  '/post-one/', '/post-two/', '/post-three/', '/test-netlify-cms/',
  '/biz-one/', '/biz-two/', '/lesson-one/', '/lesson-two/', '/lesson-three/',
  '/lesson-four/', '/lesson-five/', '/lesson-six/', '/offline-plugin-app-shell-fallback/'
]);
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await caches.delete(`sw-precache-v3-gatsby-plugin-offline-${self.registration.scope}`);
    await self.registration.unregister();
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    await Promise.allSettled(windows.map(client => {
      const url=new URL(client.url);
      if(url.origin!==self.location.origin)return;
      const path=url.pathname.replace(/index\.html$/,'').replace(/\/?$/,'/');
      if(path==='/'||path==='/en/')return client.navigate(client.url);
      const english=path.startsWith('/en/');
      const original=english?path.slice(3):path;
      if(oldPages.has(original))return client.navigate(url.origin+(english?'/en/':'/'));
    }));
  })());
});
