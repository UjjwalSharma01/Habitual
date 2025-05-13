'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import HeatMap from '@/components/analytics/HeatMap';
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
              if (value) {
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
              if (value) {
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
            if (value) {
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
              Your Analytics
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track your habits progress and consistency
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex flex-wrap items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Activity Heatmap</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Visualize your habits consistency</p>
            </div>
            
            <div className="mt-3 sm:mt-0">
              <select
                id="habitSelect"
                value={selectedHabit}
                onChange={(e) => setSelectedHabit(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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

          <div className="border-t border-gray-200">
            {loadingData ? (
              <div className="px-4 py-12 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">Loading your analytics...</p>
              </div>
            ) : (
              <div className="p-4">
                <HeatMap data={checkInData} />
              </div>
            )}
          </div>
        </div>

        {/* Additional analytics sections would go here */}
      </div>
    </AppLayout>
  );
}
