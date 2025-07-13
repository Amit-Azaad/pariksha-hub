import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute([{"revision":"eac0ff85f821792198cec0a76698ca3f","url":"favicon.ico"},{"revision":"01baf8e84451c2bdf8d2b814c1af7da3","url":"logo-dark.png"},{"revision":"1cea347c5ec100cc3389e28f75a04241","url":"logo-light.png"},{"revision":"762149415d16e08f162b5fdfde0b6b5b","url":"manifest.json"}] || []);

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  clients.claim();
}); 