'use client';

import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SplashScreen from '@/components/common/SplashScreen';
import dynamic from 'next/dynamic';

// Only use dynamic import for PWAComponents
const PWAComponents = dynamic(
  () => import('@/components/common/PWAComponents'),
  { ssr: false }
);

export default function AppLayout({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SplashScreen>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <PWAComponents />
      </div>
    </SplashScreen>
  );
}
