'use client'

import { useServiceWorker } from '@/utils/pwaUtils';
import { useEffect, useState } from 'react';

export default function ConnectionStatus() {
  const { isOnline, registration } = useServiceWorker();
  const [visible, setVisible] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // Notify service worker about connectivity changes
  useEffect(() => {
    if (registration && registration.active) {
      registration.active.postMessage({
        type: 'CONNECTIVITY_CHANGE',
        isOnline
      });
    }

    // Track if we were previously offline and just came back online
    if (isOnline && wasOffline) {
      // If we were offline and now we're online, trigger sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          registration.sync.register('sync-habits').catch(err => {
            console.warn('Failed to register background sync:', err);
          });
        });
      }
    }
    
    setWasOffline(!isOnline);
  }, [isOnline, registration, wasOffline]);

  useEffect(() => {
    // When online/offline status changes, make the notification visible
    setVisible(true);
    
    // Hide the notification after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isOnline]);

  // If currently visible, show the notification
  if (!visible) return null;

  return (
    <div 
      className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-md z-50 transition-opacity duration-300 ${
        isOnline ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'
      }`}
    >
      <div className="flex items-center space-x-2">
        <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`}></div>
        <span className="text-sm font-medium">
          {isOnline ? 'Back online' : 'You are offline'}
        </span>
      </div>
      {!isOnline && (
        <p className="text-xs mt-1">Limited functionality available</p>
      )}
      {isOnline && wasOffline && (
        <p className="text-xs mt-1">Syncing your data...</p>
      )}
    </div>
  );
}
