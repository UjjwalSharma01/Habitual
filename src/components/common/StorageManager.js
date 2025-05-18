'use client'

import { useState, useEffect } from 'react';

// Storage quota management for Progressive Web App
export default function StorageManager() {
  const [showWarning, setShowWarning] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState({
    usage: 0,
    quota: 0,
    percentage: 0
  });

  useEffect(() => {
    // Check storage usage periodically
    const checkStorageUsage = async () => {
      try {
        // Check if the Storage API is supported
        if (!('storage' in navigator && 'estimate' in navigator.storage)) {
          return;
        }
        
        // Get storage estimate
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? (usage / quota) * 100 : 0;
        
        setQuotaInfo({
          usage: formatBytes(usage),
          quota: formatBytes(quota),
          percentage: Math.round(percentage)
        });
        
        // Show warning if usage is above 80%
        if (percentage > 80) {
          setShowWarning(true);
        }
      } catch (error) {
        console.error('Error checking storage usage:', error);
      }
    };
    
    // Run check immediately and then every 24 hours
    checkStorageUsage();
    const interval = setInterval(checkStorageUsage, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Format bytes to human-readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Function to clear old data
  const handleClearOldData = async () => {
    try {
      // Clear caches older than 7 days
      const cacheNames = await caches.keys();
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      
      for (const cacheName of cacheNames) {
        // Skip the current version caches
        if (cacheName.includes('v2')) continue;
        
        // Delete old cache
        await caches.delete(cacheName);
      }
      
      // Clear old IndexedDB data
      const db = await openDatabase();
      await clearOldCompletions(db, oneWeekAgo);
      await clearOldOfflineActions(db, oneWeekAgo);
      
      // Close warning
      setShowWarning(false);
      
      // Check usage again
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;
      
      setQuotaInfo({
        usage: formatBytes(usage),
        quota: formatBytes(quota),
        percentage: Math.round(percentage)
      });
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  };
  
  // Helper function to open database
  const openDatabase = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('HabitualDB', 2);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };
  
  // Helper function to clear old completions
  const clearOldCompletions = (db, timestamp) => {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction('completions', 'readwrite');
        const store = tx.objectStore('completions');
        
        // Get all completions
        const request = store.getAll();
        
        request.onsuccess = () => {
          const completions = request.result || [];
          const oldCompletions = completions.filter(completion => {
            return new Date(completion.date).getTime() < timestamp;
          });
          
          // Delete old completions
          oldCompletions.forEach(completion => {
            store.delete(completion.id);
          });
          
          tx.oncomplete = () => resolve(oldCompletions.length);
        };
        
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  };
  
  // Helper function to clear old offline actions
  const clearOldOfflineActions = (db, timestamp) => {
    return new Promise((resolve, reject) => {
      try {
        if (!db.objectStoreNames.contains('offlineActions')) {
          resolve(0);
          return;
        }
        
        const tx = db.transaction('offlineActions', 'readwrite');
        const store = tx.objectStore('offlineActions');
        const index = store.index('timestamp');
        
        // Get all actions older than timestamp
        const range = IDBKeyRange.upperBound(new Date(timestamp).toISOString());
        const request = index.openCursor(range);
        
        let count = 0;
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            store.delete(cursor.primaryKey);
            count++;
            cursor.continue();
          }
        };
        
        tx.oncomplete = () => resolve(count);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Don't render anything if no warning needed
  if (!showWarning) return null;
  
  return (
    <div className="fixed bottom-20 left-0 right-0 p-4 z-40">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-4 border-l-4 border-amber-500">
        <div className="flex items-start">
          <div className="flex-shrink-0 text-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900">Storage usage high</h3>
            <div className="mt-1 text-xs text-gray-500">
              <p>App storage: {quotaInfo.usage} of {quotaInfo.quota} ({quotaInfo.percentage}%)</p>
            </div>
            <div className="mt-2">
              <button
                type="button"
                onClick={handleClearOldData}
                className="text-xs text-white bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded"
              >
                Clear old data
              </button>
              <button
                type="button"
                onClick={() => setShowWarning(false)}
                className="ml-2 text-xs text-gray-500 hover:text-gray-700 px-3 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
