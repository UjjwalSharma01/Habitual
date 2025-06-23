'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [cachedHabits, setCachedHabits] = useState([]);
  const [cachedResources, setCachedResources] = useState({
    habits: false,
    images: false,
    pages: false
  });
  
  useEffect(() => {
    // Try to fetch cached habits from IndexedDB when the component mounts
    async function fetchCachedHabits() {
      try {
        console.log('Opening IndexedDB to fetch cached habits');
        const db = await openIndexedDB();
        
        // Get habits from cache
        const habits = await getHabitsFromCache(db);
        setCachedHabits(habits);
        
        // Also check offline status from the offlineStatus store if available
        if (db.objectStoreNames.contains('offlineStatus')) {
          try {
            const transaction = db.transaction('offlineStatus', 'readonly');
            const store = transaction.objectStore('offlineStatus');
            const request = store.get('lastOffline');
            
            request.onsuccess = () => {
              if (request.result) {
                console.log('Found offline status data:', request.result);
                // You could use this data to show when the app went offline
              }
            };
          } catch (statusError) {
            console.error('Error checking offline status:', statusError);
          }
        }
      } catch (error) {
        console.error('Error fetching cached habits:', error);
      }
    }
    
    fetchCachedHabits();
  }, []);
  
  useEffect(() => {
    // Check what's available in the cache
    async function checkCachedResources() {
      if ('caches' in window) {
        try {
          // Check for habits data in cache
          const habitsCache = await caches.match('/api/habits');
          
          // Check for dashboard page in cache
          const dashboardCache = await caches.match('/dashboard');
          
          // Check for cached images
          const iconCache = await caches.match('/icons/icon-192x192.png');
          
          setCachedResources({
            habits: !!habitsCache || cachedHabits.length > 0,
            pages: !!dashboardCache,
            images: !!iconCache
          });
          
          console.log('Cache status:', {
            habits: !!habitsCache || cachedHabits.length > 0,
            pages: !!dashboardCache,
            images: !!iconCache
          });
        } catch (error) {
          console.error('Error checking cache status:', error);
        }
      }
    }
    
    checkCachedResources();
  }, [cachedHabits]);
  
  // Helper function to open IndexedDB
  function openIndexedDB() {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('HabitualDB', 3); // Updated to version 3 to match service worker

        request.onerror = (event) => {
          console.error('IndexedDB error:', event.target.error);
          reject(event.target.error);
        };
        
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          const oldVersion = event.oldVersion;
          
          // Create object stores if they don't exist
          if (oldVersion < 1) {
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
      } catch (error) {
        console.error('Error opening IndexedDB:', error);
        reject(error);
      }
    });
  }
  
  // Helper function to get habits from cache
  function getHabitsFromCache(db) {
    return new Promise((resolve, reject) => {
      try {
        // Check if habits store exists
        if (!db.objectStoreNames.contains('habits')) {
          console.log('No habits object store found in IndexedDB');
          return resolve([]);
        }
        
        const transaction = db.transaction('habits', 'readonly');
        const store = transaction.objectStore('habits');
        const request = store.getAll();

        // Set up error handling
        request.onerror = (event) => {
          console.error('Error fetching habits from IndexedDB:', event.target.error);
          reject(event.target.error);
        };
        
        // Handle successful retrieval
        request.onsuccess = () => {
          const habits = request.result || [];
          console.log(`Retrieved ${habits.length} habits from IndexedDB cache`);
          resolve(habits);
        };
        
        // Add transaction error handler
        transaction.onerror = (event) => {
          console.error('Transaction error when fetching habits:', event.target.error);
        };
        
        // Add transaction complete handler for debugging
        transaction.oncomplete = () => {
          console.log('Habits retrieval transaction completed');
        };
      } catch (error) {
        console.error('Error getting cached habits:', error);
        resolve([]); // Return empty array on error to prevent UI breakage
      }
    });
  }
  
  const [isOnline, setIsOnline] = useState(false);
  
  // Check online status periodically
  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);
    
    // Add event listeners for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set up a periodic check for connectivity
    const intervalId = setInterval(() => {
      // Use fetch to check if we can reach the server with cache busting
      const cacheBuster = Date.now();
      fetch(`/api/health-check?cb=${cacheBuster}`, { 
        method: 'HEAD',
        cache: 'no-store',
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(2000)
      })
      .then(() => {
        if (!isOnline) {
          console.log('Connection restored');
          setIsOnline(true);
          
          // Trigger background sync when coming back online
          if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready
              .then(registration => {
                registration.sync.register('sync-habits')
                  .then(() => console.log('Background sync registered after coming back online'))
                  .catch(err => console.error('Error registering sync after coming online:', err));
              })
              .catch(err => console.error('Error with service worker when coming online:', err));
          }
        }
      })
      .catch(error => {
        // Only log and update state if we're transitioning from online to offline
        if (isOnline) {
          console.log('Connection lost:', error.name);
          setIsOnline(false);
        }
      });
    }, 5000); // Check every 5 seconds for faster feedback
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-md p-8 mx-auto space-y-6 bg-white rounded-xl shadow-lg">
        <div className="w-20 h-20 mx-auto mb-4 text-indigo-600">
          {isOnline ? (
            // Connected icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-label="Online status indicator">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            // Disconnected icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-label="Offline status indicator">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          {isOnline ? 'You\'re back online!' : 'You\'re currently offline'}
        </h1>
        
        <p className="text-gray-600">
          {isOnline 
            ? 'Your connection has been restored. You can now access all features.'
            : 'It looks like you\'re not connected to the internet. Your data is safely stored and will sync when you\'re back online.'}
        </p>
        
        {!isOnline && cachedHabits.length > 0 && (
          <div className="p-4 mt-6 space-y-4 text-left bg-gray-50 rounded-lg">
            <h2 className="font-medium text-gray-900">Your cached habits:</h2>
            <ul className="space-y-2">
              {cachedHabits.map(habit => (
                <li key={habit.id} className="p-3 bg-white rounded-md shadow-sm">
                  <span className="font-medium">{habit.name}</span>
                  <div className="text-xs text-gray-500 mt-1">{habit.description || 'No description'}</div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              You can view and update these habits while offline. Changes will sync when connection is restored.
            </p>
          </div>
        )}
        
        {!isOnline && cachedHabits.length === 0 && (
          <div className="p-4 mt-6 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">No cached habits available. You'll need an internet connection to load your habits.</p>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Offline Status</h3>
              <ul className="mt-2 text-xs text-gray-600">
                <li className="flex items-center">
                  <span className={`h-2 w-2 rounded-full mr-2 ${cachedResources.habits ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  Habit data: {cachedResources.habits ? 'Available offline' : 'Not cached'}
                </li>
                <li className="flex items-center mt-1">
                  <span className={`h-2 w-2 rounded-full mr-2 ${cachedResources.pages ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  App pages: {cachedResources.pages ? 'Available offline' : 'Not cached'}
                </li>
                <li className="flex items-center mt-1">
                  <span className={`h-2 w-2 rounded-full mr-2 ${cachedResources.images ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  Images: {cachedResources.images ? 'Available offline' : 'Not cached'}
                </li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="pt-4 mt-8 border-t border-gray-200">
          <button 
            onClick={() => {
              if (isOnline) {
                // If online, navigate to dashboard
                window.location.href = '/dashboard';
              } else {
                // If offline, try a more robust connection check
                const statusElement = document.getElementById('connection-status');
                if (statusElement) statusElement.textContent = 'Checking connection...';
                
                // Use cache busting
                const timestamp = Date.now();
                fetch(`/api/health-check?cb=${timestamp}`, { 
                  method: 'HEAD', 
                  cache: 'no-store',
                  headers: { 'Cache-Control': 'no-cache' },
                  signal: AbortSignal.timeout(3000) // 3 second timeout
                })
                .then(() => {
                  // Success! We're online
                  setIsOnline(true);
                  if (statusElement) statusElement.textContent = 'Connection restored!';
                  
                  // Wait a moment so the user sees we're online, then reload
                  setTimeout(() => window.location.reload(), 1000);
                })
                .catch(err => {
                  // Still offline
                  if (statusElement) statusElement.textContent = 'Still offline. Please check your connection.';
                  console.log('Connection check failed:', err.name);
                });
              }
            }}
            className={`px-5 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isOnline 
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
            }`}
          >
            {isOnline ? 'Continue to App' : 'Retry Connection'}
          </button>
          
          {/* Connection status message */}
          <div id="connection-status" className="mt-2 text-sm text-gray-500"></div>
          
          <div className="mt-6">
            <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800">
              {isOnline ? 'Go to Dashboard' : 'Try using offline mode'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
