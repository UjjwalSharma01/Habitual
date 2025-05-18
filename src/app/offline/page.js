'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [cachedHabits, setCachedHabits] = useState([]);
  
  useEffect(() => {
    // Try to fetch cached habits from IndexedDB when the component mounts
    async function fetchCachedHabits() {
      try {
        const db = await openIndexedDB();
        const habits = await getHabitsFromCache(db);
        setCachedHabits(habits);
      } catch (error) {
        console.error('Error fetching cached habits:', error);
      }
    }
    
    fetchCachedHabits();
  }, []);
  
  // Helper function to open IndexedDB
  function openIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('HabitualDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
  
  // Helper function to get habits from cache
  function getHabitsFromCache(db) {
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains('habits')) {
        return resolve([]);
      }
      
      const transaction = db.transaction('habits', 'readonly');
      const store = transaction.objectStore('habits');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-md p-8 mx-auto space-y-6 bg-white rounded-xl shadow-lg">
        <div className="w-20 h-20 mx-auto mb-4 text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">You&apos;re currently offline</h1>
        
        <p className="text-gray-600">
          It looks like you&apos;re not connected to the internet. Some features may be limited until you&apos;re back online.
        </p>
        
        {cachedHabits.length > 0 ? (
          <div className="p-4 mt-6 space-y-4 text-left bg-gray-50 rounded-lg">
            <h2 className="font-medium text-gray-900">Your cached habits:</h2>
            <ul className="space-y-2">
              {cachedHabits.map(habit => (
                <li key={habit.id} className="p-3 bg-white rounded-md shadow-sm">
                  <span className="font-medium">{habit.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No cached habits available.</p>
        )}
        
        <div className="pt-4 mt-8 border-t border-gray-200">
          <button 
            onClick={() => window.location.reload()} 
            className="px-5 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retry Connection
          </button>
          
          <div className="mt-6">
            <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800">
              Try going to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
