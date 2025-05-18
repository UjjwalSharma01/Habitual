'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useServiceWorker } from '@/utils/pwaUtils';

export default function OfflineErrorBoundary({ children }) {
  const { isOnline } = useServiceWorker();
  const [error, setError] = useState(null);
  const router = useRouter();

  // Reset error state when going back online
  useEffect(() => {
    if (isOnline) {
      setError(null);
    }
  }, [isOnline]);

  // Custom error handler that checks if the error is network-related
  const handleError = (error) => {
    console.error('Caught error:', error);
    
    // Check if it's a network error or fetch failure
    const isNetworkError = 
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError') ||
      error.name === 'TypeError' && !isOnline;
    
    if (isNetworkError && !isOnline) {
      setError({ networkError: true });
      return;
    }
    
    // For other errors, propagate them
    throw error;
  };

  // If we're offline and caught a network error, show the offline UI
  if (error?.networkError && !isOnline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-20 h-20 text-amber-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-bold mb-2">You&apos;re offline</h2>
        <p className="text-gray-600 mb-6">
          This content can&apos;t be displayed while you&apos;re offline. Please check your connection and try again.
        </p>
        
        <button
          onClick={() => router.push('/offline')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
        >
          View Offline Content
        </button>
      </div>
    );
  }

  // Try-catch pattern similar to error boundaries
  try {
    return children;
  } catch (err) {
    return handleError(err);
  }
}
