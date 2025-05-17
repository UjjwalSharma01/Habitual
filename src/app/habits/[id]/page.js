'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import HabitDetailStats from '@/components/analytics/HabitDetailStats';
import AIInsights from '@/components/analytics/AIInsights';
import HabitCoaching from '@/components/analytics/HabitCoaching';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { use } from 'react';

export default function HabitDetail({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user, loading } = useAuth();
  const [habit, setHabit] = useState(null);
  const [allHabits, setAllHabits] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    
    // Fetch the specific habit and all habits for context
    const fetchData = async () => {
      if (!user || !params.id) return;
      
      try {
        // Get the specific habit
        const habitRef = doc(db, 'habits', params.id);
        const habitSnap = await getDoc(habitRef);
        
        if (!habitSnap.exists()) {
          setError('Habit not found.');
          setLoadingData(false);
          return;
        }
        
        const habitData = {
          id: habitSnap.id,
          ...habitSnap.data()
        };
        
        // Check if this habit belongs to the current user
        if (habitData.userId !== user.uid) {
          setError('You do not have permission to view this habit.');
          setLoadingData(false);
          return;
        }
        
        setHabit(habitData);
        
        // Get all habits for the user (for correlations and context)
        const habitsRef = collection(db, 'habits');
        const q = query(habitsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const habitsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAllHabits(habitsData);
        setLoadingData(false);
      } catch (error) {
        console.error('Error fetching habit:', error);
        setError('Failed to load habit data. Please try again later.');
        setLoadingData(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user, loading, params.id, router]);
  
  if (loading || loadingData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }
  
  if (error) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <div className="mt-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="text-sm font-medium text-red-700 hover:text-red-600"
                  >
                    Go back to dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (!habit) return null;
  
  const trackingTypeText = {
    binary: 'Yes/No',
    numeric: `Numeric (${habit.targetValue} ${habit.unit} target)`,
    progress: 'Progress Steps'
  };
  
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-3 p-1 rounded-full hover:bg-muted text-foreground"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h2 className="text-xl font-bold leading-7 text-foreground sm:text-2xl truncate">
                {habit.name}
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {habit.description || 'No description'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {trackingTypeText[habit.trackingType] || 'Tracking'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                {habit.active ? 'Active' : 'Completed'}
              </span>
            </div>
          </div>
          <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => router.push(`/habits/${habit.id}/edit`)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-1.5 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Edit
            </button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <HabitDetailStats habit={habit} />
            <AIInsights habit={habit} allHabits={allHabits} />
          </div>
          <div className="space-y-6">
            <HabitCoaching habit={habit} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
