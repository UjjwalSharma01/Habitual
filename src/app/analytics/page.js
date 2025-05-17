'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import HeatMap from '@/components/analytics/HeatMap';
import HabitDetailStats from '@/components/analytics/HabitDetailStats';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

export default function Analytics() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState('all');
  const [checkInData, setCheckInData] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Fetch user's habits
  useEffect(() => {
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
        
        // Process check-in data for the heatmap
        const allCheckIns = {};
        
        habitsData.forEach(habit => {
          if (habit.checkIns) {
            Object.entries(habit.checkIns).forEach(([date, value]) => {
              // Determine if the habit is completed based on tracking type
              let isCompleted = false;
              
              if (habit.trackingType === 'binary') {
                isCompleted = value === true;
              } else if (habit.trackingType === 'numeric') {
                isCompleted = value?.value >= habit.targetValue;
              } else if (habit.trackingType === 'progress') {
                isCompleted = value?.completed;
              } else {
                isCompleted = !!value; // Fallback for legacy data
              }
              
              // If the habit is completed for this date
              if (isCompleted) {
                // If the date already exists, increment the count
                if (allCheckIns[date]) {
                  allCheckIns[date]++;
                } else {
                  allCheckIns[date] = 1;
                }
              }
            });
          }
        });
        
        setCheckInData(allCheckIns);
        setLoadingData(false);
      } catch (error) {
        console.error('Error fetching habits:', error);
        setError('Failed to load analytics data. Please try again later.');
        setLoadingData(false);
      }
    };

    if (user) {
      fetchHabits();
    }
  }, [user, loading]);

  // Handle habit selection change
  useEffect(() => {
    if (habits.length === 0) return;
    
    try {
      if (selectedHabit === 'all') {
        // Process check-in data for all habits
        const allCheckIns = {};
        
        habits.forEach(habit => {
          if (habit.checkIns) {
            Object.entries(habit.checkIns).forEach(([date, value]) => {
              // Determine if the habit is completed based on tracking type
              let isCompleted = false;
              
              if (habit.trackingType === 'binary') {
                isCompleted = value === true;
              } else if (habit.trackingType === 'numeric') {
                isCompleted = value?.value >= habit.targetValue;
              } else if (habit.trackingType === 'progress') {
                isCompleted = value?.completed;
              } else {
                isCompleted = !!value; // Fallback for legacy data
              }
              
              if (isCompleted) {
                if (allCheckIns[date]) {
                  allCheckIns[date]++;
                } else {
                  allCheckIns[date] = 1;
                }
              }
            });
          }
        });
        
        setCheckInData(allCheckIns);
      } else {
        // Process check-in data for the selected habit
        const habit = habits.find(h => h.id === selectedHabit);
        if (habit && habit.checkIns) {
          const habitCheckIns = {};
          
          Object.entries(habit.checkIns).forEach(([date, value]) => {
            // Determine if the habit is completed based on tracking type
            let isCompleted = false;
            
            if (habit.trackingType === 'binary') {
              isCompleted = value === true;
            } else if (habit.trackingType === 'numeric') {
              isCompleted = value?.value >= habit.targetValue;
            } else if (habit.trackingType === 'progress') {
              isCompleted = value?.completed;
            } else {
              isCompleted = !!value; // Fallback for legacy data
            }
            
            if (isCompleted) {
              habitCheckIns[date] = 1;
            }
          });
          
          setCheckInData(habitCheckIns);
        } else {
          setCheckInData({});
        }
      }
    } catch (error) {
      console.error('Error processing habit data:', error);
    }
  }, [selectedHabit, habits]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold leading-7 text-foreground sm:text-2xl md:text-3xl">
              Your Analytics
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your habits progress and consistency
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="shadow overflow-hidden sm:rounded-lg bg-card-background text-card-foreground">
          <div className="px-3 py-3 sm:py-5 sm:px-6 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-md sm:text-lg leading-6 font-medium text-foreground">Activity Heatmap</h3>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground">Visualize your habits consistency</p>
            </div>
            
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
              <select
                id="habitSelect"
                value={selectedHabit}
                onChange={(e) => setSelectedHabit(e.target.value)}
                className="block w-full pl-3 pr-8 py-1 sm:py-2 text-sm rounded-md focus:outline-none focus:ring-primary focus:border-primary border-border bg-background text-foreground"
              >
                <option value="all">All Habits</option>
                {habits.map(habit => (
                  <option key={habit.id} value={habit.id}>
                    {habit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-border">
            {loadingData ? (
              <div className="px-4 py-12 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2">Loading your analytics...</p>
              </div>
            ) : (
              <div className="p-4">
                <HeatMap data={checkInData} />
              </div>
            )}
          </div>
        </div>

        {/* Detailed stats for individual habits */}
        {selectedHabit !== 'all' && (
          <div className="mt-6 sm:mt-8">
            <div className="shadow overflow-hidden sm:rounded-lg bg-card-background text-card-foreground">
              <div className="px-3 py-3 sm:py-5 sm:px-6">
                <h3 className="text-md sm:text-lg leading-6 font-medium text-foreground">
                  Detailed Statistics
                </h3>
                <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground">
                  Advanced tracking metrics for {habits.find(h => h.id === selectedHabit)?.name}
                </p>
              </div>
              
              <div className="border-t border-border px-3 py-3 sm:px-4 sm:py-5">
                <HabitDetailStats habit={habits.find(h => h.id === selectedHabit)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
