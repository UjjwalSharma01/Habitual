'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

export default function HabitItem({ habit }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleCheckIn = async () => {
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      const habitRef = doc(db, 'habits', habit.id);
      
      // Create a copy of the current check-ins or an empty object if it doesn't exist
      const checkIns = habit.checkIns || {};
      
      // Toggle the check-in status for today
      checkIns[today] = !checkIns[today];
      
      await updateDoc(habitRef, {
        checkIns,
        lastUpdated: new Date()
      });
      
      // Refresh the habits list
      router.refresh();
    } catch (error) {
      console.error('Error updating habit check-in:', error);
      alert('Failed to update habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  // Check if the habit has been completed today
  const completedToday = habit.checkIns && habit.checkIns[today];
  
  // Calculate current streak
  const calculateStreak = () => {
    if (!habit.checkIns) return 0;
    
    let streak = 0;
    let date = new Date();
    
    // Check backwards from today
    while (true) {
      const dateString = date.toISOString().split('T')[0];
      if (habit.checkIns[dateString]) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const currentStreak = calculateStreak();
  
  return (
    <li className="px-3 py-3 sm:px-6 sm:py-4 transition-colors duration-200 hover:bg-muted">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center">
          <button 
            onClick={handleCheckIn}
            disabled={loading}
            className={`mr-3 sm:mr-4 flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center ${
              completedToday 
                ? 'border-green-500 bg-green-500 text-white' 
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            {completedToday && (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate text-primary">{habit.name}</div>
            <div className="text-xs sm:text-sm truncate text-muted-foreground max-w-[200px] sm:max-w-[300px]">{habit.description}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pl-9 sm:pl-0 mt-1 sm:mt-0">
          <div className="text-xs sm:text-sm mr-2 sm:mr-4 text-muted-foreground">
            Streak: <span className="font-medium">{currentStreak} days</span>
          </div>
          <button
            onClick={() => router.push(`/habits/${habit.id}`)}
            className="ml-2 inline-flex items-center p-1.5 sm:p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 bg-card-background text-muted-foreground"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}
