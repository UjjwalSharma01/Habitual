'use client'

import { useState, useEffect } from 'react';
import { useServiceWorker } from '@/utils/pwaUtils';

export default function UpdateNotification() {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isUpdateAvailable) {
      setVisible(true);
    }
  }, [isUpdateAvailable]);

  const handleUpdate = () => {
    updateServiceWorker();
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-green-50 shadow-lg z-50 animate-slide-up">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 p-2 bg-green-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Update available!</p>
            <p className="text-sm text-gray-600">A new version of Habitual is ready to install</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleDismiss}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Later
          </button>
          <button 
            onClick={handleUpdate}
            className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Update now
          </button>
        </div>
      </div>
    </div>
  );
}
