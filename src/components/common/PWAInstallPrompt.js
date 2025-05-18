'use client'

import { useState, useEffect } from 'react';
import { useServiceWorker, isRunningAsPWA } from '@/utils/pwaUtils';

export default function PWAInstallPrompt() {
  const { canInstall, showInstallPrompt } = useServiceWorker();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if we should show the install prompt
    if (canInstall && !isRunningAsPWA() && !dismissed) {
      // Wait 30 seconds before showing the prompt
      const timer = setTimeout(() => {
        // Check if the user has dismissed this prompt before
        const hasDismissed = localStorage.getItem('pwa-install-prompt-dismissed');
        if (!hasDismissed) {
          setVisible(true);
        }
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [canInstall, dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    // Remember that the user has dismissed the prompt
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
  };

  const handleInstall = () => {
    showInstallPrompt();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg z-50 animate-slide-up">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 p-2 bg-indigo-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Install Habitual</p>
            <p className="text-sm text-gray-600">Add to your home screen for a better experience</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleDismiss}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Not now
          </button>
          <button 
            onClick={handleInstall}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
