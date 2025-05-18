// Habitual PWA Service Worker with Workbox
// Service worker version: 2.0.1 - Removed all notification functionality

// Import Workbox from CDN (will be injected at build time in production)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Define cache version and names
const CACHE_VERSION = 'v3';
const CACHE_NAMES = {
  static: `habitual-static-${CACHE_VERSION}`,
  pages: `habitual-pages-${CACHE_VERSION}`,
  images: `habitual-images-${CACHE_VERSION}`,
  api: `habitual-api-${CACHE_VERSION}`,
  fonts: `habitual-fonts-${CACHE_VERSION}`
};

// This is required to trigger the InstallEvent
self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  // Pre-cache the offline page during installation
  event.waitUntil(
    caches.open(CACHE_NAMES.pages).then(cache => {
      return cache.add('/offline');
    })
  );
});

// This is required to ensure the service worker activates correctly
self.addEventListener('activate', event => {
  console.log('Service Worker activating.');
  
  // Clean up old caches on activation
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete any cache that doesn't match our current version
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients/pages immediately
      return clients.claim();
    })
  );
});

// Add message event listener to handle messages from the client
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Precache static assets during installation
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// Cache page navigations (HTML) with a network-first strategy
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAMES.pages,
    networkTimeoutSeconds: 3, // Fallback to cache if network takes > 3 seconds
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        purgeOnQuotaError: true, // Automatically delete if quota is exceeded
      }),
    ],
  })
);

// Cache images with a cache-first strategy
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_NAMES.images,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200], // Cache opaque responses as well
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Cache fonts with a cache-first strategy (longer cache time)
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'font',
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_NAMES.fonts,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Cache JavaScript and CSS with a stale-while-revalidate strategy
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === 'script' || request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE_NAMES.static,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Cache specific API endpoints using different strategies
// Habit data - stale while revalidate for frequent updates
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/habits'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE_NAMES.api,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60, // 1 hour
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// User data - network first with fast timeout for critical data
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/user'),
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAMES.api,
    networkTimeoutSeconds: 2, // Fall back to cache after 2 seconds
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Default API handling
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAMES.api,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 2 * 60 * 60, // 2 hours
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Handle offline fallback with custom responses based on request type
workbox.routing.setCatchHandler(async ({ event, request }) => {
  console.log(`Service Worker: Falling back to offline handler for: ${request.url}`);
  
  const destination = request.destination;
  
  // If it's a document/page request, return the offline page
  if (destination === 'document') {
    return caches.match('/offline') || Response.error();
  }
  
  // If it's an image request, return a fallback image
  if (destination === 'image') {
    return caches.match('/icons/offline-image.png') || Response.error();
  }
  
  // For API requests, return a JSON response indicating offline status
  if (request.url.includes('/api/')) {
    return new Response(
      JSON.stringify({
        success: false,
        offline: true,
        message: 'You are currently offline. Please try again when you have a network connection.'
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // For everything else, return an error response
  return Response.error();
});

// Listen for background sync events - for habit tracking syncing
self.addEventListener('sync', event => {
  console.log(`Service Worker: Background sync event: ${event.tag}`);
  
  if (event.tag === 'sync-habits') {
    event.waitUntil(syncHabits());
  } else if (event.tag === 'sync-user-settings') {
    event.waitUntil(syncUserSettings());
  }
});

// Function to sync habits when back online
async function syncHabits() {
  console.log('Service Worker: Syncing pending habits...');
  const db = await openIndexedDB();
  const pendingHabits = await getPendingHabits(db);
  
  // If there are no pending habits, return
  if (!pendingHabits.length) {
    console.log('Service Worker: No pending habits to sync');
    return;
  }

  console.log(`Service Worker: Found ${pendingHabits.length} pending habits to sync`);
  
  try {
    // Try to sync each habit with retry logic
    let successCount = 0;
    
    await Promise.all(pendingHabits.map(async (habit) => {
      // Try up to 3 times with exponential backoff
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch('/api/habits/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Sync-Timestamp': new Date().toISOString(),
              'X-Device-ID': getDeviceId()
            },
            body: JSON.stringify(habit),
          });

          if (response.ok) {
            // If successful, remove from pending
            await removePendingHabit(db, habit.id);
            successCount++;
            break; // Exit retry loop if successful
          } else {
            // If server error, wait and retry
            const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        } catch (err) {
          console.error(`Service Worker: Sync attempt ${attempt + 1} failed`, err);
          if (attempt === 2) break; // Don't wait after the last attempt
          
          // Wait before retrying
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }));
    
    console.log(`Service Worker: Sync completed. Synced ${successCount} of ${pendingHabits.length} habits`);
    
    // If we have a client, notify it about the sync results
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'HABITS_SYNCED',
        success: successCount > 0,
        total: pendingHabits.length,
        synced: successCount
      });
    });
    
  } catch (error) {
    console.error('Service Worker: Error syncing habits:', error);
  }
}

// Function to sync user settings when back online
async function syncUserSettings() {
  console.log('Service Worker: Syncing user settings...');
  const db = await openIndexedDB();
  
  try {
    // Get pending user settings from IndexedDB
    const pendingSettings = await getPendingUserSettings(db);
    
    if (!pendingSettings || !pendingSettings.userId) {
      console.log('Service Worker: No pending user settings to sync');
      return;
    }
    
    // Attempt to sync with the server
    const response = await fetch('/api/user/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pendingSettings),
    });
    
    if (response.ok) {
      // Clear pending settings after successful sync
      await clearPendingUserSettings(db);
      console.log('Service Worker: User settings synced successfully');
      
      // Notify clients
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'SETTINGS_SYNCED',
          success: true
        });
      });
    } else {
      console.error('Service Worker: Failed to sync user settings, will retry later');
    }
  } catch (error) {
    console.error('Service Worker: Error syncing user settings:', error);
  }
}

// Helper function to generate or retrieve a persistent device ID
function getDeviceId() {
  let deviceId = localStorage.getItem('habitual-device-id');
  
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    try {
      localStorage.setItem('habitual-device-id', deviceId);
    } catch (error) {
      console.error('Could not save device ID to localStorage:', error);
    }
  }
  
  return deviceId;
}

// Helper function to open IndexedDB with version update handling
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HabitualDB', 2); // Increased version number to add new stores

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const oldVersion = event.oldVersion;
      
      // Create object stores if they don't exist
      if (oldVersion < 1) {
        // Version 1 schema
        if (!db.objectStoreNames.contains('pendingHabits')) {
          db.createObjectStore('pendingHabits', { keyPath: 'id' });
        }
      }
      
      if (oldVersion < 2) {
        // Version 2 schema additions
        if (!db.objectStoreNames.contains('userSettings')) {
          db.createObjectStore('userSettings', { keyPath: 'userId' });
        }
        
        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionsStore = db.createObjectStore('offlineActions', { 
            keyPath: 'id',
            autoIncrement: true 
          });
          actionsStore.createIndex('actionType', 'actionType', { unique: false });
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      }
    };
  });
}

// Helper function to get pending habits
function getPendingHabits(db) {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction('pendingHabits', 'readonly');
      const store = transaction.objectStore('pendingHabits');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    } catch (error) {
      console.error('Error getting pending habits:', error);
      resolve([]); // Return empty array on error
    }
  });
}

// Helper function to remove pending habit
function removePendingHabit(db, id) {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction('pendingHabits', 'readwrite');
      const store = transaction.objectStore('pendingHabits');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
      
      // Add transaction complete handler
      transaction.oncomplete = () => console.log(`Pending habit ${id} removed from offline storage`);
    } catch (error) {
      console.error('Error removing pending habit:', error);
      reject(error);
    }
  });
}

// Helper function to get pending user settings
function getPendingUserSettings(db) {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction('userSettings', 'readonly');
      const store = transaction.objectStore('userSettings');
      // We're storing a single settings object keyed by userId
      // Get the first entry (there should only be one)
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const settings = request.result;
        resolve(settings && settings.length > 0 ? settings[0] : null);
      };
    } catch (error) {
      console.error('Error getting pending user settings:', error);
      resolve(null);
    }
  });
}

// Helper function to clear pending user settings after sync
function clearPendingUserSettings(db) {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction('userSettings', 'readwrite');
      const store = transaction.objectStore('userSettings');
      // Clear all entries in the store
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    } catch (error) {
      console.error('Error clearing user settings:', error);
      reject(error);
    }
  });
}
