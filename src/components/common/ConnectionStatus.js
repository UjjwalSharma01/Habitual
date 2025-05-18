'use client'

import { useServiceWorker } from '@/utils/pwaUtils';
import { useEffect, useState } from 'react';

export default function ConnectionStatus() {
  const { isOnline } = useServiceWorker();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // When online/offline status changes, make the notification visible
    setVisible(true);
    
    // Hide the notification after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);
    
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
    </div>
  );
}
