'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import PWA components to avoid SSR issues
const PWAInstallPrompt = dynamic(() => import('@/components/common/PWAInstallPrompt'), {
  ssr: false
});

const UpdateNotification = dynamic(() => import('@/components/common/UpdateNotification'), {
  ssr: false
});

const ConnectionStatus = dynamic(() => import('@/components/common/ConnectionStatus'), {
  ssr: false
});

const StorageManager = dynamic(() => import('@/components/common/StorageManager'), {
  ssr: false
});

export default function PWAComponents() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <>
      <PWAInstallPrompt />
      <UpdateNotification />
      <ConnectionStatus />
      <StorageManager />
    </>
  );
}
