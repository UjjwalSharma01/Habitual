'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export default function TestConnection() {
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const testFirebaseConnection = async () => {
    try {
      setStatus('loading');
      setError(null);
      
      // Try to fetch one document from the users collection
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(1));
      const querySnapshot = await getDocs(q);
      
      // Just count the documents, don't expose user data
      const count = querySnapshot.size;
      
      setResults({
        success: true,
        message: `Firebase connection successful. Users collection has ${count} documents.`
      });
      setStatus('success');
    } catch (error) {
      console.error('Firebase connection error:', error);
      setError(error.message || 'An unknown error occurred');
      setStatus('error');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>
      
      <div className="mb-6">
        <button
          onClick={testFirebaseConnection}
          disabled={status === 'loading'}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {status === 'loading' ? 'Testing...' : 'Test Connection'}
        </button>
      </div>
      
      {status === 'loading' && (
        <div className="flex items-center text-blue-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
          Testing connection...
        </div>
      )}
      
      {status === 'success' && results && (
        <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
          {results.message}
        </div>
      )}
      
      {status === 'error' && error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          <p className="font-semibold">Connection failed:</p>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Please check your Firebase configuration in .env.local and make sure your Firebase project settings are correct.
          </p>
        </div>
      )}
    </div>
  );
}
