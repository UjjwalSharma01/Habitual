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
self.addEventListener('message', async event => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle connectivity status messages from client
  if (event.data && event.data.type === 'CONNECTIVITY_CHANGE') {
    const isOnline = event.data.isOnline;
    console.log(`Service Worker: Connectivity changed to ${isOnline ? 'online' : 'offline'}`);
    
    try {
      // Store the connectivity state in IndexedDB for future reference
      const db = await openIndexedDB();
      if (db.objectStoreNames.contains('offlineStatus')) {
        const tx = db.transaction('offlineStatus', 'readwrite');
        const store = tx.objectStore('offlineStatus');
        
        await store.put({
          key: 'connectivityStatus',
          isOnline: isOnline,
          timestamp: new Date().toISOString()
        });
      }
      
      // If coming back online, trigger sync for any pending operations
      if (isOnline) {
        // Trigger background sync if supported
        if ('sync' in self.registration) {
          // Register sync for habits
          await self.registration.sync.register('sync-habits')
            .then(() => console.log('Background sync registered after coming back online'))
            .catch(err => console.error('Error registering sync after coming online:', err));
          
          // Also register sync for user settings
          await self.registration.sync.register('sync-user-settings')
            .then(() => console.log('User settings sync registered after coming back online'))
            .catch(err => console.error('Error registering settings sync after coming online:', err));
        }
        
        // Notify all clients that we're back online
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'ONLINE_STATUS_CHANGE',
            isOnline: true,
            timestamp: new Date().toISOString()
          });
        });
      }
    } catch (error) {
      console.error('Error handling connectivity change message:', error);
    }
  }
  
  // Add a ping/health check functionality
  if (event.data && event.data.type === 'PING') {
    try {
      // Send a pong back to the client
      event.source.postMessage({
        type: 'PONG',
        timestamp: new Date().toISOString(),
        swVersion: '3.0.0' // Update this when making significant changes
      });
    } catch (error) {
      console.error('Error sending PONG response:', error);
    }
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

// Health check API with very fast fallback to help with quick offline detection
workbox.routing.registerRoute(
  ({ url }) => url.pathname.includes('/api/health-check'),
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAMES.api,
    networkTimeoutSeconds: 1.5, // Slightly longer timeout but still fast for reliable detection
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 2, // Keep the last two health check responses
        maxAgeSeconds: 300, // 5 minutes cache time for better offline experience
        purgeOnQuotaError: true,
      }),
      // Add a plugin to handle network timeouts gracefully
      {
        fetchDidFail: async ({ request }) => {
          console.log('Health check fetch failed, likely offline');
        }
      }
    ],
  })
);

// Default API handling with improved offline support
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAMES.api,
    networkTimeoutSeconds: 3, // Fall back to cache after 3 seconds - this is critical for offline support
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200], // Cache opaque responses as well as successful ones
      }),
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
  const url = new URL(request.url);
  
  // Store the failed request for potential sync later
  try {
    const db = await openIndexedDB();
    if (db.objectStoreNames.contains('offlineRequests')) {
      const tx = db.transaction('offlineRequests', 'readwrite');
      const store = tx.objectStore('offlineRequests');
      
      // Store the failed request for later analysis/retry
      store.add({
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
        processed: false,
        destination: destination,
        pathname: url.pathname
      });
    }
  } catch (dbError) {
    console.error('Failed to store offline request:', dbError);
  }
  
  // If it's a document/page request, return the offline page
  if (destination === 'document') {
    const offlinePage = await caches.match('/offline');
    if (offlinePage) return offlinePage;
    return Response.error();
  }
  
  // If it's an image request, return a fallback image
  if (destination === 'image') {
    const fallbackImage = await caches.match('/icons/offline-image.png');
    if (fallbackImage) return fallbackImage;
    return Response.error();
  }
  
  // For API requests, return a JSON response indicating offline status
  if (request.url.includes('/api/')) {
    // Check if we can provide specific offline data based on the API endpoint
    if (request.url.includes('/api/habits')) {
      // Try to get data from IndexedDB for habits requests
      try {
        const db = await openIndexedDB();
        let offlineData = [];
        
        if (db.objectStoreNames.contains('habits')) {
          const transaction = db.transaction('habits', 'readonly');
          const store = transaction.objectStore('habits');
          offlineData = await new Promise((resolve) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
          });
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            offline: true,
            data: offlineData,
            message: 'Offline data retrieved from cache. Some functionality may be limited.'
          }),
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } catch (error) {
        console.error('Error providing offline habits data:', error);
      }
    }
    
    // Default offline API response
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
    
    // Get the device ID once before the sync loop
    const deviceId = await getDeviceId();
    
    await Promise.all(pendingHabits.map(async (habit) => {
      // Try up to 3 times with exponential backoff
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch('/api/habits/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Sync-Timestamp': new Date().toISOString(),
              'X-Device-ID': deviceId,
              'X-Sync-Attempt': `${attempt + 1}` // Track retry attempts
            },
            body: JSON.stringify(habit),
          });

          if (response.ok) {
            // Log success details
            console.log(`Service Worker: Successfully synced habit ${habit.id} on attempt ${attempt + 1}`);
            
            // If successful, remove from pending
            await removePendingHabit(db, habit.id);
            successCount++;
            break; // Exit retry loop if successful
          } else {
            // If server error, wait and retry
            console.warn(`Service Worker: Sync attempt ${attempt + 1} failed with status ${response.status} for habit ${habit.id}`);
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

// Helper function to generate a persistent device ID
// Note: Service workers can't access localStorage directly, so we generate a consistent ID
function getDeviceId() {
  // Try to get a device ID from IndexedDB first for consistency
  return new Promise(async (resolve) => {
    try {
      const db = await openIndexedDB();
      
      if (db.objectStoreNames.contains('offlineStatus')) {
        const transaction = db.transaction('offlineStatus', 'readwrite');
        const store = transaction.objectStore('offlineStatus');
        
        // Try to get existing device ID
        const request = store.get('deviceId');
        
        request.onsuccess = () => {
          if (request.result && request.result.id) {
            // Use existing ID
            resolve(request.result.id);
          } else {
            // Generate new ID and store it
            const newId = `device_${self.registration?.scope || ''}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            
            store.put({
              key: 'deviceId',
              id: newId,
              created: new Date().toISOString()
            });
            
            resolve(newId);
          }
        };
        
        request.onerror = () => {
          // Fallback to generated ID if error
          const fallbackId = `device_${self.registration?.scope || ''}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
          console.error('Error getting device ID from IndexedDB, using fallback');
          resolve(fallbackId);
        };
      } else {
        // Fallback if store doesn't exist
        resolve(`device_${self.registration?.scope || ''}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`);
      }
    } catch (error) {
      // Fallback if any error occurs
      console.error('Error in getDeviceId:', error);
      resolve(`device_${self.registration?.scope || ''}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`);
    }
  });
}

// Helper function to open IndexedDB with version update handling
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HabitualDB', 3); // Version 3 for improved offline support

    request.onerror = (event) => {
      console.error('Service Worker: Error opening IndexedDB:', event.target.error);
      reject(event.target.error || new Error('Unknown IndexedDB error'));
    };
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
      
      if (oldVersion < 3) {
        // Version 3 schema additions for improved offline functionality
        console.log('Service Worker: Upgrading to schema version 3');
        
        if (!db.objectStoreNames.contains('offlineStatus')) {
          db.createObjectStore('offlineStatus', { keyPath: 'key' });
        }
        
        if (!db.objectStoreNames.contains('offlineRequests')) {
          const requestsStore = db.createObjectStore('offlineRequests', { 
            keyPath: 'id',
            autoIncrement: true 
          });
          requestsStore.createIndex('url', 'url', { unique: false });
          requestsStore.createIndex('timestamp', 'timestamp', { unique: false });
          requestsStore.createIndex('processed', 'processed', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('syncStatus')) {
          db.createObjectStore('syncStatus', { keyPath: 'type' });
        }
      }
    };
  }).catch(error => {
    console.error('Service Worker: Error opening IndexedDB:', error);
    reject(error);
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
