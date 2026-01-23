const CACHE_NAME = 'flag-game-v2';

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
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/correct.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/correct_alt1.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/correct_alt2.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/incorrect.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/congrats.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/try_again.mp3',
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

const LEVEL1_FLAGS = [
  './assets/flags/us.png',
  './assets/flags/gb.png',
  './assets/flags/fr.png',
  './assets/flags/de.png',
  './assets/flags/it.png',
  './assets/flags/es.png',
  './assets/flags/pt.png',
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
  './assets/flags/tr.png'
];

const COUNTRY_AUDIO = [
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/us.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/gb.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/fr.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/de.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/it.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/es.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/pt.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ca.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/br.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ru.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/ua.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/kz.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/jp.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/cn.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/kr.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/in.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/au.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/nz.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/za.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/fi.mp3',
  './assets/audio/kPzsL2i3teMYv0FxEYQ6/tr.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...CORE_ASSETS, ...LEVEL1_FLAGS, ...COUNTRY_AUDIO]);
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
