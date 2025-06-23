'use client'

import { useState, useEffect } from 'react';
import { Workbox } from 'workbox-window';

export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [isInstallPromptShown, setIsInstallPromptShown] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [lastPingSuccess, setLastPingSuccess] = useState(null);

  // Enhanced connectivity checker - more reliable than just navigator.onLine
  const checkConnectivity = async () => {
    const navigatorOnline = navigator.onLine;
    
    if (!navigatorOnline) {
      // If the browser says we're offline, trust it
      setIsOnline(false);
      
      // Store offline status in IndexedDB if possible
      try {
        const dbPromise = indexedDB.open('HabitualDB', 3);
        dbPromise.onsuccess = (event) => {
          const db = event.target.result;
          
          if (db.objectStoreNames.contains('offlineStatus')) {
            const tx = db.transaction('offlineStatus', 'readwrite');
            const store = tx.objectStore('offlineStatus');
            store.put({
              key: 'lastOffline',
              timestamp: new Date().toISOString(),
              reason: 'navigator.onLine=false'
            });
          }
        };
      } catch (dbError) {
        console.error('Failed to record offline status:', dbError);
      }
      
      return false;
    }

    try {
      // Attempt to fetch a tiny endpoint with cache busting
      const cacheBuster = Date.now();
      const response = await fetch(`/api/health-check?cb=${cacheBuster}`, {
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        // Short timeout to avoid hanging
        signal: AbortSignal.timeout(2000)
      });
      
      // If we get a response, we're online
      const online = response.ok;
      
      // Update state and record successful ping
      setIsOnline(online);
      if (online) {
        setLastPingSuccess(Date.now());
        
        // Notify service worker about online status
        if (registration && registration.active) {
          registration.active.postMessage({
            type: 'CONNECTIVITY_CHANGE',
            isOnline: true
          });
        }
      }
      
      return online;
    } catch (error) {
      // If we can't reach the server, we might be offline even if navigator.onLine is true
      console.log('Connectivity check failed:', error.name);
      
      // If we've had a successful ping in the last minute, give the benefit of the doubt
      // This prevents flickering due to temporary network hiccups
      const wasRecentlyOnline = lastPingSuccess && (Date.now() - lastPingSuccess < 60000);
      
      // Only update state if we're truly offline (not just a temporary hiccup)
      if (!wasRecentlyOnline) {
        setIsOnline(false);
        
        // Notify service worker about offline status
        if (registration && registration.active) {
          registration.active.postMessage({
            type: 'CONNECTIVITY_CHANGE',
            isOnline: false
          });
        }
      }
      
      return wasRecentlyOnline;
    }
  };

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      const wb = new Workbox('/sw.js');

      // Add update found event listener
      wb.addEventListener('controlling', event => {
        console.log('Service worker is now controlling the page');
        // Reload the page to ensure it uses the latest version
        window.location.reload();
      });

      wb.addEventListener('waiting', event => {
        console.log('New service worker is waiting to activate');
        // Set flag to show update prompt to user
        setIsUpdateAvailable(true);
      });
      
      wb.addEventListener('activated', event => {
        console.log('Service worker activated');
        // If there were clients waiting for this activation, reload
        if (event.isUpdate) {
          console.log('Service worker updated - reloading page');
          window.location.reload();
        }
      });
      
      wb.addEventListener('redundant', event => {
        console.warn('Service worker became redundant - may indicate an issue');
      });

      // Listen for messages from the service worker
      wb.addEventListener('message', event => {
        const data = event.data;
        console.log('Message from Service Worker:', data);
        
        // Handle different message types from service worker
        if (data && data.type === 'CONNECTION_TEST') {
          // Handle connection test results from SW
          setIsOnline(data.isOnline);
        } else if (data && data.type === 'HABITS_SYNCED') {
          console.log(`Sync completed: ${data.synced} of ${data.total} habits synced`);
          // Could trigger a notification or UI update here
        } else if (data && data.type === 'SETTINGS_SYNCED') {
          console.log('Settings synchronized successfully');
          // Could trigger a settings refresh here
        }
      });

      // Register the service worker
      wb.register()
        .then(reg => {
          setRegistration(reg);
        })
        .catch(err => console.error('Service worker registration failed:', err));
    }

    // Set up online/offline listeners
    const handleOnline = () => {
      // Don't immediately trust the browser's online event
      // Verify with an actual network request
      checkConnectivity();
    };
    
    const handleOffline = () => setIsOnline(false);

    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    });

    // Set up online/offline detection
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial online state and start periodic checks
    checkConnectivity();
    const intervalId = setInterval(checkConnectivity, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to update service worker
  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      // Send message to service worker to skip waiting and activate new version
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  // Function to show install prompt
  const showInstallPrompt = async () => {
    if (installPrompt) {
      setIsInstallPromptShown(true);
      
      // Show the prompt
      const result = await installPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const choiceResult = await result;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the saved prompt since it can't be used again
      setInstallPrompt(null);
    }
  };

  return {
    isOnline,
    isUpdateAvailable,
    updateServiceWorker,
    registration,
    showInstallPrompt,
    canInstall: !!installPrompt && !isInstallPromptShown
  };
}

// IndexedDB Wrapper for offline data handling
export class HabitualDB {
  constructor() {
    this.dbPromise = this.initDB();
    this.syncInProgress = false;
    this.lastSyncTime = this.getLastSyncTime();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('HabitualDB', 3); // Updated to version 3 for additional offline capabilities

        request.onerror = (event) => {
          console.error('IndexedDB error:', event.target.error);
          reject('Error opening database');
        };

        request.onsuccess = (event) => {
          const db = request.result;
          
          // Add error handler for the database
          db.onerror = (event) => {
            console.error('Database error:', event.target.error);
          };
          
          resolve(db);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          const oldVersion = event.oldVersion;
          
          console.log(`Upgrading IndexedDB from version ${oldVersion} to ${event.newVersion}`);
          
          // Create object stores if they don't exist
          if (oldVersion < 1) {
            // Version 1 schema
            if (!db.objectStoreNames.contains('habits')) {
              const habitStore = db.createObjectStore('habits', { keyPath: 'id' });
              habitStore.createIndex('userId', 'userId', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('completions')) {
              const completionsStore = db.createObjectStore('completions', { keyPath: 'id' });
              completionsStore.createIndex('habitId', 'habitId', { unique: false });
              completionsStore.createIndex('date', 'date', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('pendingHabits')) {
              db.createObjectStore('pendingHabits', { keyPath: 'id' });
            }
          }
          
          if (oldVersion < 2) {
          // Version 2 schema additions
          if (!db.objectStoreNames.contains('userSettings')) {
            db.createObjectStore('userSettings', { keyPath: 'userId' });
          }
          
          if (!db.objectStoreNames.contains('userData')) {
            db.createObjectStore('userData', { keyPath: 'uid' });
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
          if (!db.objectStoreNames.contains('offlineStatus')) {
            const statusStore = db.createObjectStore('offlineStatus', { keyPath: 'key' });
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
          
          // Add sync status store for tracking sync operations
          if (!db.objectStoreNames.contains('syncStatus')) {
            const syncStore = db.createObjectStore('syncStatus', { keyPath: 'type' });
          }
        }
      }
      } catch (err) {
        console.error('Critical error during IndexedDB initialization:', err);
        reject('Failed to initialize database: ' + err.message);
      }
    });
  }

  getLastSyncTime() {
    try {
      const syncData = localStorage.getItem('habitual-last-sync');
      return syncData ? JSON.parse(syncData).time : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  updateLastSyncTime() {
    try {
      const now = new Date().toISOString();
      localStorage.setItem('habitual-last-sync', JSON.stringify({
        time: now,
        status: 'success'
      }));
      this.lastSyncTime = now;
      return true;
    } catch (error) {
      console.error('Error updating last sync time:', error);
      return false;
    }
  }

  async getDB() {
    return await this.dbPromise;
  }

  // Habits related methods
  async getHabits(userId) {
    if (!userId) {
      console.warn('No userId provided for getHabits');
      return [];
    }
    
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction('habits', 'readonly');
        const store = transaction.objectStore('habits');
        const index = store.index('userId');
        const request = index.getAll(userId);

        request.onerror = () => {
          console.error('Error getting habits:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => resolve(request.result || []);
        
      } catch (error) {
        console.error('Error in getHabits transaction:', error);
        resolve([]); // Return empty array on error
      }
    });
  }

  async getHabit(id) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('habits', 'readonly');
      const store = transaction.objectStore('habits');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveHabit(habit) {
    if (!habit || !habit.id) {
      throw new Error('Invalid habit data provided');
    }
    
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        // Save to habits store
        const transaction = db.transaction(['habits', 'offlineActions'], 'readwrite');
        const store = transaction.objectStore('habits');
        const actionStore = transaction.objectStore('offlineActions');
        
        // Save habit data
        const request = store.put(habit);
        
        // Log the action for offline sync
        const actionRequest = actionStore.add({
          actionType: 'saveHabit',
          data: habit,
          timestamp: new Date().toISOString()
        });
        
        // Set up error handlers
        transaction.onerror = () => {
          console.error('Transaction error when saving habit:', transaction.error);
          reject(transaction.error);
        };
        
        request.onerror = () => {
          console.error('Error saving habit:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          // If we're online, try to sync the change immediately
          if (navigator.onLine) {
            this.addPendingHabit(habit)
              .then(() => this.registerSync())
              .catch(err => console.error('Error queuing habit for sync:', err));
          }
          
          resolve(request.result);
        };
      } catch (error) {
        console.error('Error in saveHabit transaction:', error);
        reject(error);
      }
    });
  }

  async deleteHabit(id) {
    if (!id) {
      throw new Error('No habit ID provided for deletion');
    }
    
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        // First, get the habit to keep a copy for sync purposes
        const getTransaction = db.transaction('habits', 'readonly');
        const getStore = getTransaction.objectStore('habits');
        const getRequest = getStore.get(id);
        
        getRequest.onerror = () => {
          console.error('Error getting habit for deletion:', getRequest.error);
          reject(getRequest.error);
        };
        
        getRequest.onsuccess = () => {
          const habitToDelete = getRequest.result;
          
          if (!habitToDelete) {
            resolve(); // Nothing to delete
            return;
          }
          
          // Now delete and log the action
          const transaction = db.transaction(['habits', 'offlineActions'], 'readwrite');
          const store = transaction.objectStore('habits');
          const actionStore = transaction.objectStore('offlineActions');
          
          // Delete from store
          const request = store.delete(id);
          
          // Log the action
          const actionRequest = actionStore.add({
            actionType: 'deleteHabit',
            data: { id, habit: habitToDelete },
            timestamp: new Date().toISOString()
          });
          
          request.onerror = () => {
            console.error('Error deleting habit:', request.error);
            reject(request.error);
          };
          
          request.onsuccess = () => {
            // If we're online, try to sync the deletion
            if (navigator.onLine) {
              const deletionMarker = {
                id,
                deleted: true,
                lastModified: new Date().toISOString()
              };
              
              this.addPendingHabit(deletionMarker)
                .then(() => this.registerSync())
                .catch(err => console.error('Error queuing habit deletion for sync:', err));
            }
            
            resolve();
          };
        };
      } catch (error) {
        console.error('Error in deleteHabit transaction:', error);
        reject(error);
      }
    });
  }

  // Completions related methods
  async getCompletions(habitId, startDate, endDate) {
    if (!habitId) {
      return [];
    }
    
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction('completions', 'readonly');
        const store = transaction.objectStore('completions');
        const index = store.index('habitId');
        let request;
        
        // If date range is provided, use IDBKeyRange to filter by date
        if (startDate && endDate) {
          const range = IDBKeyRange.bound(startDate, endDate);
          request = index.getAll(habitId, range);
        } else {
          request = index.getAll(habitId);
        }

        request.onerror = () => {
          console.error('Error getting completions:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => resolve(request.result || []);
      } catch (error) {
        console.error('Error in getCompletions transaction:', error);
        resolve([]); // Return empty array on error
      }
    });
  }

  async saveCompletion(completion) {
    if (!completion || !completion.id || !completion.habitId) {
      throw new Error('Invalid completion data provided');
    }
    
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['completions', 'offlineActions'], 'readwrite');
        const store = transaction.objectStore('completions');
        const actionStore = transaction.objectStore('offlineActions');
        
        // Save the completion
        const request = store.put(completion);
        
        // Log the action
        const actionRequest = actionStore.add({
          actionType: 'saveCompletion',
          data: completion,
          timestamp: new Date().toISOString()
        });
        
        transaction.onerror = () => {
          console.error('Transaction error saving completion:', transaction.error);
          reject(transaction.error);
        };
        
        request.onerror = () => {
          console.error('Error saving completion:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          // Queue for sync if online
          if (navigator.onLine) {
            this.addPendingCompletion(completion)
              .then(() => this.registerSync())
              .catch(err => console.error('Error queuing completion for sync:', err));
          }
          
          resolve(request.result);
        };
      } catch (error) {
        console.error('Error in saveCompletion transaction:', error);
        reject(error);
      }
    });
  }
  
  // User data methods
  async saveUserData(userData) {
    if (!userData || !userData.uid) {
      throw new Error('Invalid user data provided');
    }
    
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction('userData', 'readwrite');
        const store = transaction.objectStore('userData');
        
        // Don't include sensitive data
        const safeUserData = {
          ...userData,
          // Remove sensitive fields if present
          password: undefined,
          stsTokenManager: undefined,
          apiKey: undefined
        };
        
        const request = store.put(safeUserData);
        
        request.onerror = () => {
          console.error('Error saving user data:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => resolve(request.result);
      } catch (error) {
        console.error('Error in saveUserData transaction:', error);
        reject(error);
      }
    });
  }

  async getUserData() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction('userData', 'readonly');
        const store = transaction.objectStore('userData');
        const request = store.getAll();
        
        request.onerror = () => {
          console.error('Error getting user data:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          const users = request.result;
          // Return the first user found or null
          resolve(users && users.length > 0 ? users[0] : null);
        };
      } catch (error) {
        console.error('Error in getUserData transaction:', error);
        resolve(null);
      }
    });
  }

  // User settings methods
  async saveUserSettings(settings) {
    if (!settings || !settings.userId) {
      throw new Error('Invalid settings data provided');
    }
    
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['userSettings', 'offlineActions'], 'readwrite');
        const store = transaction.objectStore('userSettings');
        const actionStore = transaction.objectStore('offlineActions');
        
        // Add timestamp
        const settingsWithTimestamp = {
          ...settings,
          lastModified: new Date().toISOString()
        };
        
        // Save settings
        const request = store.put(settingsWithTimestamp);
        
        // Log action
        actionStore.add({
          actionType: 'saveUserSettings',
          data: settingsWithTimestamp,
          timestamp: new Date().toISOString()
        });
        
        request.onerror = () => {
          console.error('Error saving user settings:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          // Queue for sync if online
          if (navigator.onLine) {
            this.registerSyncSettings();
          }
          
          resolve(request.result);
        };
      } catch (error) {
        console.error('Error in saveUserSettings transaction:', error);
        reject(error);
      }
    });
  }

  // Pending sync data methods
  async addPendingHabit(habit) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction('pendingHabits', 'readwrite');
        const store = transaction.objectStore('pendingHabits');
        const request = store.put(habit);

        request.onerror = () => {
          console.error('Error adding pending habit:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => resolve();
      } catch (error) {
        console.error('Error in addPendingHabit transaction:', error);
        reject(error);
      }
    });
  }
  
  async addPendingCompletion(completion) {
    // For completions, we'll add them to the same pendingHabits store
    // but with a special flag to identify them
    const pendingItem = {
      id: `completion_${completion.id}`,
      type: 'completion',
      data: completion,
      timestamp: new Date().toISOString()
    };
    
    return this.addPendingHabit(pendingItem);
  }

  // Register for sync when back online
  async registerSync() {
    // First check if we're online - if we are, we might not need background sync
    if (navigator.onLine) {
      try {
        // If we're online, try immediate sync first
        const pendingHabits = await this.getPendingHabitsForSync();
        if (pendingHabits && pendingHabits.length > 0) {
          console.log(`Attempting immediate sync of ${pendingHabits.length} pending habits`);
          await this.syncPendingHabitsImmediately(pendingHabits);
        }
      } catch (error) {
        console.warn('Error during immediate sync attempt:', error);
        // Fall back to background sync
      }
    }
    
    // Check if background sync is supported
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.log('Background sync not supported in this browser');
      return false;
    }
    
    try {
      // Get the service worker registration without creating new ones
      const registrations = await navigator.serviceWorker.getRegistrations();
      const registration = registrations.find(reg => 
        reg.active && (reg.scope.includes('/') || reg.scope.endsWith('/'))
      );
      
      // Only register sync if we actually have an active service worker
      if (registration && registration.active) {
        // Check if we have permission to use background sync
        const permissionStatus = await navigator.permissions.query({
          name: 'periodic-background-sync'
        }).catch(() => ({ state: 'denied' })); // Handle browsers that don't support this API
        
        if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
          await registration.sync.register('sync-habits');
          console.log('Background sync registered for habits');
          return true;
        } else {
          console.log('Background sync permission not granted');
          // Fall back to storing data for retry later
          return false;
        }
      } else {
        console.log('No active service worker found for registration');
        return false;
      }
    } catch (err) {
      console.error('Error registering background sync:', err);
      return false;
    }
  }
  
  // New method to handle immediate sync when online
  async syncPendingHabitsImmediately(pendingHabits) {
    if (!pendingHabits || !pendingHabits.length) return false;
    
    let syncedCount = 0;
    
    for (const habit of pendingHabits) {
      try {
        const response = await fetch('/api/habits/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(habit)
        });
        
        if (response.ok) {
          // Remove from pending storage
          await this.removePendingHabit(habit.id);
          syncedCount++;
        }
      } catch (error) {
        console.error('Error syncing habit immediately:', error);
      }
    }
    
    return syncedCount > 0;
  }
  
  // Helper to get pending habits for sync
  async getPendingHabitsForSync() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        if (!db.objectStoreNames.contains('pendingHabits')) {
          return resolve([]);
        }
        
        const transaction = db.transaction('pendingHabits', 'readonly');
        const store = transaction.objectStore('pendingHabits');
        const request = store.getAll();
        
        request.onerror = () => {
          console.error('Error getting pending habits:', request.error);
          resolve([]);
        };
        
        request.onsuccess = () => resolve(request.result || []);
      } catch (error) {
        console.error('Error in getPendingHabitsForSync:', error);
        resolve([]);
      }
    });
  }
  
  // Helper to remove a pending habit after sync
  async removePendingHabit(id) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction('pendingHabits', 'readwrite');
        const store = transaction.objectStore('pendingHabits');
        const request = store.delete(id);
        
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => {
          console.error('Error removing pending habit:', transaction.error);
          resolve(false);
        };
      } catch (error) {
        console.error('Error in removePendingHabit:', error);
        resolve(false);
      }
    });
  }
  
  // Register for user settings sync
  async registerSyncSettings() {
    // Check if we're in an installed PWA context before trying to access the service worker
    // This prevents permission prompts in regular browser context
    const isPWA = isRunningAsPWA();
    
    if (!isPWA) {
      console.log('Not registering settings sync - not running as PWA');
      return false;
    }
    
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.log('Not registering settings sync - ServiceWorker or SyncManager not supported');
      return false;
    }
    
    try {
      // Use a safer way to get registration that doesn't trigger permission requests
      // Only check for *currently active* registrations, don't try to register one
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      
      // Only register sync if we actually have an active service worker
      if (registration && registration.active) {
        await registration.sync.register('sync-user-settings');
        console.log('Background sync registered for user settings');
        return true;
      } else {
        console.log('Not registering settings sync - no active service worker found');
        return false;
      }
    } catch (err) {
      console.error('Error registering settings sync:', err);
      return false;
    }
  }
}

// Check if the app is installed and running as PWA
export function isRunningAsPWA() {
  // Safely check for browser features first
  if (typeof window === 'undefined') return false;
  
  try {
    // Create an array of conditions to check
    const pwaConditions = [
      // Standard way to detect display mode
      () => window.matchMedia && window.matchMedia('(display-mode: standalone)').matches,
      // iOS specific
      () => window.navigator.standalone === true,
      // Alternative for some Android browsers
      () => typeof document !== 'undefined' && document.referrer && document.referrer.includes('android-app://'),
      // Check for display-mode: fullscreen (some PWAs)
      () => window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches,
      // Check for display-mode: minimal-ui (some PWAs)
      () => window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches,
      // Look at the URL or origin to handle some edge cases
      () => typeof window.location !== 'undefined' && 
            window.location.href && 
            window.location.href.includes('?pwa=true'),
      // Check if there's an app-installed flag in localStorage
      () => typeof localStorage !== 'undefined' && localStorage.getItem('habitual-pwa-installed') === 'true'
    ];
    
    // Return true if any of the conditions are met
    return pwaConditions.some(condition => {
      try {
        return condition();
      } catch (e) {
        // If any individual check fails, catch the error and continue
        console.warn('Error in PWA detection:', e);
        return false;
      }
    });
  } catch (error) {
    // If anything unexpected fails, log it and assume not a PWA
    console.error('Error checking PWA status:', error);
    return false;
  }
}
