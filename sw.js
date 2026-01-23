const CACHE_NAME = 'flag-game-1.2.1';

const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './countries.js',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/audio/background.mp3',
  './assets/audio/positive.mp3',
  './assets/audio/negative.mp3',
  './assets/audio/celebration.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/question.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/score_0.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/score_1.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/score_2.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/score_3.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/score_4.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/score_5.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/score_6.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/score_7.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/score_8.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/score_9.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/score_10.mp3'
];

// All flags used across all packs
const PACK_FLAGS = [
  // Starter Pack
  './assets/flags/us.png',
  './assets/flags/gb.png',
  './assets/flags/fr.png',
  './assets/flags/de.png',
  './assets/flags/it.png',
  './assets/flags/es.png',
  './assets/flags/ca.png',
  './assets/flags/br.png',
  './assets/flags/ru.png',
  './assets/flags/ua.png',
  './assets/flags/kz.png',
  './assets/flags/jp.png',
  './assets/flags/cn.png',
  './assets/flags/kr.png',
  './assets/flags/in.png',
  './assets/flags/au.png',
  './assets/flags/nz.png',
  './assets/flags/za.png',
  './assets/flags/fi.png',
  './assets/flags/tr.png',
  // Europe Starter (additional)
  './assets/flags/nl.png',
  './assets/flags/pl.png',
  './assets/flags/ch.png',
  './assets/flags/be.png',
  './assets/flags/ie.png',
  './assets/flags/se.png',
  './assets/flags/at.png',
  './assets/flags/no.png',
  './assets/flags/dk.png',
  './assets/flags/ro.png',
  './assets/flags/cz.png',
  './assets/flags/pt.png',
  // South America (additional)
  './assets/flags/ar.png',
  './assets/flags/bo.png',
  './assets/flags/cl.png',
  './assets/flags/co.png',
  './assets/flags/ec.png',
  './assets/flags/gy.png',
  './assets/flags/py.png',
  './assets/flags/pe.png',
  './assets/flags/sr.png',
  './assets/flags/uy.png',
  './assets/flags/ve.png',
  // Largest (additional)
  './assets/flags/dz.png',
  './assets/flags/cd.png',
  './assets/flags/sa.png',
  './assets/flags/mx.png',
  './assets/flags/id.png',
  './assets/flags/sd.png',
  './assets/flags/ly.png',
  './assets/flags/ir.png',
  './assets/flags/mn.png'
];

// All country audio files across all packs
const COUNTRY_AUDIO = [
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ar.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/at.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/au.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/be.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/bo.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/br.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ca.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/cd.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ch.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/cl.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/cn.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/co.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/cz.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/de.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/dk.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/dz.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ec.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/es.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/fi.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/fr.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/gb.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/gy.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/id.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ie.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/in.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ir.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/it.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/jp.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/kr.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/kz.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ly.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/mn.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/mx.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/nl.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/no.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/nz.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/pe.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/pl.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/pt.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/py.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ro.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ru.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/sa.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/sd.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/se.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/sr.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/tr.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ua.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/us.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/uy.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ve.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/za.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...CORE_ASSETS, ...PACK_FLAGS, ...COUNTRY_AUDIO]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
