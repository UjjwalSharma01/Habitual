'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import AppLayout from '@/components/layout/AppLayout';
import HabitList from '@/components/habits/HabitList';
import HabitOverviewCard from '@/components/habits/HabitOverviewCard';
import QuoteCard from '@/components/common/QuoteCard';
import DashboardRecommendations from '@/components/analytics/DashboardRecommendations';
import OfflineErrorBoundary from '@/components/common/OfflineErrorBoundary';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { HabitualDB, useServiceWorker } from '@/utils/pwaUtils';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { onboardingState, loadingOnboarding } = useOnboarding();
  const { isOnline } = useServiceWorker();
  const [habits, setHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [error, setError] = useState('');
  const [selectedHabit, setSelectedHabit] = useState(null);

  // Define fetchHabits outside useEffect so it has access to the current isOnline state
  const fetchHabits = async () => {
    if (!user) return;
    
    try {
      let habitsData = [];
      const localDb = new HabitualDB();
      
      // Try to get habits from Firebase if online
      if (isOnline) {
        try {
          const habitsRef = collection(db, 'habits');
          const q = query(habitsRef, where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          
          habitsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Cache habits in IndexedDB for offline use
          for (const habit of habitsData) {
            await localDb.saveHabit(habit);
          }
        } catch (firebaseError) {
          console.error('Error fetching habits from Firebase:', firebaseError);
          // If Firebase fails, try to fall back to local data
          const localHabits = await localDb.getHabits(user.uid);
          habitsData = localHabits;
        }
      } else {
        // If offline, get habits from IndexedDB
        console.log('Offline mode: getting habits from IndexedDB');
        const localHabits = await localDb.getHabits(user.uid);
        habitsData = localHabits;
      }
      
      setHabits(habitsData);
      setLoadingHabits(false);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setError('Failed to load habits. Please try again later.');
      setLoadingHabits(false);
    }
  };

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    
    // Only redirect to onboarding if explicitly completed is false (not if it's still loading)
    if (!loadingOnboarding && user && onboardingState.completed === false) {
      router.push('/onboarding');
      return;
    }
  
    // Fetch habits when component mounts and when user or online status changes
    if (user) {
      fetchHabits();
    }
  // fetchHabits is defined outside useEffect so it won't change between renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router, loadingOnboarding, onboardingState.completed, isOnline]);

  if (loading || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <OfflineErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold leading-7 text-foreground sm:text-2xl md:text-3xl truncate">
                Welcome, {user.displayName || 'User'}
              </h2>
            </div>
          <div className="mt-2 sm:mt-0">
            <button
              type="button"
              onClick={() => router.push('/habits/new')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Add New Habit
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="md:col-span-2">
            <QuoteCard />
          </div>
          <div>
            <DashboardRecommendations habits={habits} />
          </div>
        </div>
        
        {habits.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 px-1">
              <h3 className="text-md sm:text-lg leading-6 font-medium text-foreground">Progress Overview</h3>
              <div className="mt-2 sm:mt-0 w-full sm:w-auto">
                <select
                  value={selectedHabit ? selectedHabit.id : ''}
                  onChange={(e) => {
                    const habitId = e.target.value;
                    setSelectedHabit(habitId ? habits.find(h => h.id === habitId) : null);
                  }}
                  className="block w-full pl-3 pr-8 py-1 sm:py-2 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary border-border bg-background text-foreground"
                >
                  <option value="">All habits</option>
                  {habits.map(habit => (
                    <option key={habit.id} value={habit.id}>
                      {habit.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <HabitOverviewCard 
                habit={selectedHabit || habits[0]} 
                period="weekly" 
              />
              <HabitOverviewCard 
                habit={selectedHabit || habits[0]} 
                period="monthly" 
              />
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="shadow-sm overflow-hidden sm:rounded-lg bg-background text-foreground">
            <div className="px-4 py-5 sm:px-6 bg-card rounded-t-lg">
              <h3 className="text-lg leading-6 font-medium text-foreground">Your Habits</h3>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Track your progress and build consistency</p>
            </div>
            {error && (
              <div className="px-4 py-5 sm:px-6">
                <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                  {error}
                </div>
              </div>
            )}
            <div className="mt-1">
              {loadingHabits ? (
                <div className="px-4 py-12 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Loading your habits...</p>
                </div>
              ) : habits.length > 0 ? (
                <HabitList habits={habits} />
              ) : (
                <div className="px-4 py-8 sm:py-12 text-center text-muted-foreground">
                  <p>You don&apos;t have any habits yet.</p>
                  <button
                    onClick={() => router.push('/habits/new')}
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Create your first habit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </OfflineErrorBoundary>
    </AppLayout>
  );
}
