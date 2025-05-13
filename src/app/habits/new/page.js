'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import HabitForm from '@/components/habits/HabitForm';

export default function NewHabit() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in
  if (!loading && !user) {
    router.push('/auth/login');
    return null;
  }

  const handleCreateHabit = async (habitData) => {
    try {
      setSubmitting(true);
      setError('');
      
      // Prepare the habit document
      const newHabit = {
        ...habitData,
        userId: user.uid,
        active: true,
        createdAt: new Date(),
        lastUpdated: new Date(),
        checkIns: {}
      };

      // Add the document to Firestore
      await addDoc(collection(db, 'habits'), newHabit);
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      console.error('Error adding habit:', error);
      setError('Failed to create habit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
              Create a New Habit
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Define your new habit with details to help you track consistently
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <HabitForm
          onSubmit={handleCreateHabit}
          submitButtonText="Create Habit"
          showCancel={true}
          onCancel={() => router.push('/dashboard')}
        />
      </div>
    </AppLayout>
  );
}

