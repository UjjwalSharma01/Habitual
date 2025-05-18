'use client'

import { useState, useEffect } from 'react';

// Enhanced check for PWA mode with better error handling
function checkIfPWA() {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check if running in standalone mode (PWA)
    const isStandalone = window.matchMedia && 
      window.matchMedia('(display-mode: standalone)').matches;
    
    // iOS PWA check
    const isIOSPWA = window.navigator && 
      window.navigator.standalone === true;
    
    // Check if localStorage has the flag (which is set during PWA install)
    const hasStorageFlag = localStorage.getItem('habitual-pwa-installed') === 'true';
    
    return isStandalone || isIOSPWA || hasStorageFlag;
  } catch (err) {
    console.error('Error in checkIfPWA:', err);
    return false;
  }
}

export default function SplashScreen({ children }) {
  const [showSplash, setShowSplash] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    // Only show splash screen for PWA mode
    if (!checkIfPWA()) {
      setShowSplash(false);
      return;
    }

    // Store the timestamp for when the app was last opened
    const lastOpened = localStorage.getItem('lastAppOpened');
    const now = Date.now();
    localStorage.setItem('lastAppOpened', now.toString());
    
    // If the app was opened in the last 10 minutes, don't show splash screen
    if (lastOpened && now - parseInt(lastOpened, 10) < 10 * 60 * 1000) {
      setShowSplash(false);
      return;
    }
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        const next = prev + (100 - prev) / 10;
        return Math.min(next, 100);
      });
    }, 100);
    
    // Hide splash screen after a delay
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);
  
  if (!showSplash) {
    return children;
  }
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-indigo-600 to-indigo-800 flex flex-col items-center justify-center z-50">
      <div className="w-32 h-32 mb-8 animate-pulse">
        <img 
          src="/icons/icon-192x192.png"
          alt="Habitual Logo"
          className="w-full h-full"
        />
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-8">Habitual</h1>
      
      <div className="w-64 h-2 bg-indigo-300 bg-opacity-30 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-300 ease-out rounded-full"
          style={{ width: `${loadProgress}%` }}
        />
      </div>
      
      <p className="text-indigo-100 mt-4 text-sm">Building better habits</p>
    </div>
  );
}
