var CACHE_NAME = 'myshopos-cache-v1';
var urlsToCache = [
  '/',
  '/index.html',
  '/evt.js',
  '/auth.js',
//   '/login.php',
//   '/login.php?pincode=123456',
   '/pos/index.html',
   '/pos/evt.js',
   '/pos/receipt.js',
  // '/pos/crud.php',
   '/stock/index.html',
   '/stock/evt.js',
  // '/stock/crud.php',
  // '/stock/categories/crud.php',
   '/staff/index.html',
   '/staff/evt.js',
  // '/staff/crud.php',
   '/report/index.html',
   '/report/evt.js',
  // '/report/rpt_func.php',
   '/config/index.html',
   '/config/evt.js',
   '/config/crud.php',
   '/config/crud.php?pop',
   '/assets/icons/64x64.png',
   '/assets/icons/xxxhdpi.png',
   '/assets/icons/256x256.png',
   '/assets/icons/512x512.png',
   'https://fonts.googleapis.com/css2?family=Josefin+Slab&family=Lato&family=Open+Sans&family=Oswald&family=Pacifico&family=Source+Sans+Pro&display=swap',
   '/assets/fonts/font-awesome-4.7.0/css/font-awesome.min.css',
   '/assets/plugins/alertify/css/themes/default.css',
   '/assets/plugins/alertify/css/alertify.min.css',
   '/assets/styles/Samad_Responsive_Layout.css',
   '/assets/styles/style.css',
   '/assets/plugins/filepond/dist/filepond.css',
   '/assets/plugins/filepond/dist/filepond-plugin-image-preview.css',
   '/assets/plugins/filepond/dist/filepond-plugin-image-edit.css',
   '/assets/img/cart.bmp',
   '/assets/js/jquery-3.3.1.min.js',
   '/assets/js/event.js',
   '/assets/plugins/alertify/alertify.min.js',
   '/assets/plugins/filepond/dist/filepond-plugin-image-preview.js',
   '/assets/plugins/filepond/dist/filepond-plugin-image-exif-orientation.js',
   '/assets/plugins/filepond/dist/filepond-plugin-file-validate-type.js',
   '/assets/plugins/filepond/dist/filepond-plugin-image-crop.js',
   '/assets/plugins/filepond/dist/filepond-plugin-image-resize.js',
   '/assets/plugins/filepond/dist/filepond-plugin-image-transform.js',
   '/assets/plugins/filepond/dist/filepond-plugin-image-edit.js',
   '/assets/plugins/filepond/dist/filepond.js',
   '/assets/plugins/loadash-4.15.0.js',
   '/assets/plugins/tabulator-master/dist/js/tabulator.min.js',
   '/assets/plugins/tabulator-master/dist/xlsx.full.min.js',
   '/assets/plugins/tabulator-master/dist/jspdf.min-1.3.5.js',
   '/assets/plugins/tabulator-master/dist/jspdf.plugin.autotable-3.0.5.js',
   '/assets/plugins/moment-with-locales.min.js',
   '/assets/plugins/qrcoder/qrcode.min.js',
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
    console.log(event.request.url);
   
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
});  
   

// self.addEventListener('fetch', function(event) {
// //   console.log(event.target.url);
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         // Cache hit - return response
//         if (response) {
//           return response;
//         }

//       return fetch(event.request).then(
//         function(response) {
//           // Check if we received a valid response
//           if(!response || response.status !== 200 || response.type !== 'basic') {
//             return response;
//           }

//           // IMPORTANT: Clone the response. A response is a stream
//           // and because we want the browser to consume the response
//           // as well as the cache consuming the response, we need
//           // to clone it so we have two streams.
//           var responseToCache = response.clone();

//           caches.open(CACHE_NAME)
//             .then(function(cache) {
//               cache.put(event.request, responseToCache);
//             });

//           return response;
//         }
//       );
//     })
//   );
// });

//   self.addEventListener('activate', function(event) {

//     var cacheAllowlist = ['pages-cache-v1', 'blog-posts-cache-v1'];
  
//     event.waitUntil(
//       caches.keys().then(function(cacheNames) {
//         return Promise.all(
//           cacheNames.map(function(cacheName) {
//             if (cacheAllowlist.indexOf(cacheName) === -1) {
//               return caches.delete(cacheName);
//             }
//           })
//         );
//       })
//     );
//   });