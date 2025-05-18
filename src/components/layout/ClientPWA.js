'use client'

import dynamic from 'next/dynamic';

// Import PWA components with no SSR to avoid hydration errors
const PWAComponents = dynamic(() => import('@/components/common/PWAComponents'), {
  ssr: false
});

export default function ClientPWA() {
  return <PWAComponents />;
}
