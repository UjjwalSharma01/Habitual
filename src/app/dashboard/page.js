'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import AppLayout from '@/components/layout/AppLayout';
import HabitList from '@/components/habits/HabitList';
import QuoteCard from '@/components/common/QuoteCard';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { onboardingState, loadingOnboarding } = useOnboarding();
  const [habits, setHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    
    // Redirect to onboarding if not completed
    if (!loadingOnboarding && user && !onboardingState.completed) {
      router.push('/onboarding');
      return;
    }

    // Fetch user's habits
    const fetchHabits = async () => {
      if (!user) return;
      
      try {
        const habitsRef = collection(db, 'habits');
        const q = query(habitsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const habitsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setHabits(habitsData);
        setLoadingHabits(false);
      } catch (error) {
        console.error('Error fetching habits:', error);
        setError('Failed to load habits. Please try again later.');
        setLoadingHabits(false);
      }
    };

    if (user) {
      fetchHabits();
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome, {user.displayName || 'User'}
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => router.push('/habits/new')}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add New Habit
            </button>
          </div>
        </div>

        <div className="mt-8">
          <QuoteCard />
        </div>

        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Your Habits</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Track your progress and build consistency</p>
            </div>
            {error && (
              <div className="px-4 py-5 sm:px-6">
                <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                  {error}
                </div>
              </div>
            )}
            <div className="border-t border-gray-200">
              {loadingHabits ? (
                <div className="px-4 py-12 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2">Loading your habits...</p>
                </div>
              ) : habits.length > 0 ? (
                <HabitList habits={habits} />
              ) : (
                <div className="px-4 py-12 text-center text-gray-500">
                  <p>You don't have any habits yet.</p>
                  <button
                    onClick={() => router.push('/habits/new')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create your first habit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
