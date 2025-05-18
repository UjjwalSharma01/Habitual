'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HabitItem from './HabitItem';
import { HabitualDB, useServiceWorker } from '@/utils/pwaUtils';

export default function HabitList({ habits }) {
  const router = useRouter();
  const { isOnline } = useServiceWorker();
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [trackingFilter, setTrackingFilter] = useState('all'); // all, binary, numeric, progress
  const [mergedHabits, setMergedHabits] = useState(habits);
  const [offlineIndicators, setOfflineIndicators] = useState([]);
  
  // Fetch and merge habits from local storage
  useEffect(() => {
    async function fetchLocalHabits() {
      try {
        const db = new HabitualDB();
        // Fetch habits from local DB - you'll need to get the userId from authentication context
        const localHabits = await db.getHabits("current-user"); // Replace with actual userId
        
        // Track which habits are only available offline
        const offlineOnly = localHabits
          .filter(localHabit => !habits.some(serverHabit => serverHabit.id === localHabit.id))
          .map(habit => habit.id);
        
        setOfflineIndicators(offlineOnly);
        
        // Merge habits from server and local DB, preferring local versions for duplicates
        const merged = [...habits];
        
        localHabits.forEach(localHabit => {
          const existingIndex = merged.findIndex(h => h.id === localHabit.id);
          if (existingIndex >= 0) {
            merged[existingIndex] = localHabit; // Replace with local version
          } else {
            merged.push(localHabit); // Add new local habit
          }
        });
        
        setMergedHabits(merged);
      } catch (error) {
        console.error("Error fetching local habits:", error);
        setMergedHabits(habits); // Fall back to server habits if error
      }
    }
    
    fetchLocalHabits();
  }, [habits]);

  // Apply both status and tracking type filters
  const filteredHabits = mergedHabits.filter(habit => {
    // Filter by active status
    const matchesStatus = 
      filter === 'all' || 
      (filter === 'active' && habit.active) || 
      (filter === 'completed' && !habit.active);
      
    // Filter by tracking type
    const matchesTrackingType = 
      trackingFilter === 'all' || 
      (habit.trackingType === trackingFilter);
      
    return matchesStatus && matchesTrackingType;
  });

  return (
    <div>
      <div className="bg-card">
        <nav className="flex">
          <button
            onClick={() => setFilter('all')}
            className={`w-1/3 py-3 sm:py-4 px-1 text-center border-b-2 font-medium text-xs sm:text-sm ${
              filter === 'all'
                ? 'border-primary text-primary bg-muted/30'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
            }`}
          >
            All Habits
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`w-1/3 py-3 sm:py-4 px-1 text-center border-b-2 font-medium text-xs sm:text-sm ${
              filter === 'active'
                ? 'border-primary text-primary bg-muted/30'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`w-1/3 py-3 sm:py-4 px-1 text-center border-b-2 font-medium text-xs sm:text-sm ${
              filter === 'completed'
                ? 'border-primary text-primary bg-muted/30'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
            }`}
          >
            Completed
          </button>
        </nav>
      </div>
      
      {/* Tracking type filter */}
      <div className="py-3 sm:py-4 px-3 sm:px-4 flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end bg-muted/30">
        <div className="w-full sm:w-auto order-2 sm:order-none mt-2 sm:mt-0">
          <div className="flex flex-wrap sm:flex-nowrap items-center">
            <span className="text-xs sm:text-sm text-muted-foreground mr-2 whitespace-nowrap mb-1 sm:mb-0">Tracking Type:</span>
            <select
              value={trackingFilter}
              onChange={(e) => setTrackingFilter(e.target.value)}
              className="w-full sm:w-auto text-xs sm:text-sm border-border bg-background text-foreground rounded-md px-2 py-1 focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="binary">Yes/No</option>
              <option value="numeric">Numeric</option>
              <option value="progress">Progress Steps</option>
            </select>
          </div>
        </div>
        
        <p className="text-xs sm:text-sm text-muted-foreground order-1 sm:order-none">
          {filteredHabits.length} {filteredHabits.length === 1 ? 'habit' : 'habits'} found
        </p>
      </div>

      {!isOnline && (
        <div className="p-3 mb-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center text-amber-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm">You&apos;re currently offline. Your changes will sync when you reconnect.</span>
          </div>
        </div>
      )}
      
      <ul className="space-y-1">
        {filteredHabits.map(habit => (
          <div key={habit.id} className="relative">
            {offlineIndicators.includes(habit.id) && (
              <span className="absolute top-2 right-2 z-10 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                Offline
              </span>
            )}
            <HabitItem habit={habit} />
          </div>
        ))}
        {filteredHabits.length === 0 && (
          <li className="py-8 text-center text-muted-foreground">
            No habits match your filter.
          </li>
        )}
      </ul>
    </div>
  );
}
