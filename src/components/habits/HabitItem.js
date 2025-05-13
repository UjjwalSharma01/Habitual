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
    <li className="px-4 py-4 sm:px-6 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={handleCheckIn}
            disabled={loading}
            className={`mr-4 flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center ${
              completedToday 
                ? 'border-green-500 bg-green-500 text-white' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {completedToday && (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          
          <div>
            <div className="text-sm font-medium text-blue-600 truncate">{habit.name}</div>
            <div className="text-sm text-gray-500 truncate">{habit.description}</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="text-sm text-gray-500 mr-4">
            Streak: <span className="font-medium">{currentStreak} days</span>
          </div>
          <button
            onClick={() => router.push(`/habits/${habit.id}`)}
            className="ml-2 inline-flex items-center p-2 rounded-full bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}
