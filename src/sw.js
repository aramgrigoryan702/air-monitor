// eslint-disable-next-line no-undef
workbox.core.skipWaiting();
// eslint-disable-next-line no-undef
workbox.core.clientsClaim();

// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', event => {
    console.log("install.")
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', event => {
    console.log("activate")
});


// eslint-disable-next-line no-undef
workbox.routing.registerRoute(
    new RegExp('/api/v1/chart_events'),
    // eslint-disable-next-line no-undef
    workbox.strategies.StaleWhileRevalidate({
        cacheName: 'chart-events',
        cacheExpiration: {
            maxAgeSeconds: 60 * 15, //cache the news content for 5min
        },
    }),
);

// eslint-disable-next-line no-undef,no-restricted-globals
workbox.precaching.precacheAndRoute(self.__precacheManifest || []);
