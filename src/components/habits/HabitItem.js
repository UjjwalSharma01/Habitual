'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { HabitualDB, useServiceWorker } from '@/utils/pwaUtils';

export default function HabitItem({ habit }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [numericValue, setNumericValue] = useState(habit.checkIns && habit.checkIns[new Date().toISOString().split('T')[0]]?.value || 0);
  const [progressSteps, setProgressSteps] = useState(
    habit.checkIns && habit.checkIns[new Date().toISOString().split('T')[0]]?.steps || 
    (habit.steps ? habit.steps.map(() => false) : [])
  );
  
  const { isOnline } = useServiceWorker();
  const localDb = new HabitualDB();
  
  const handleBinaryCheckIn = async () => {
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Create a copy of the current check-ins or an empty object if it doesn't exist
      const checkIns = habit.checkIns || {};
      
      // Toggle the check-in status for today
      checkIns[today] = !checkIns[today];
      
      // Update the habit object with new check-ins
      const updatedHabit = {
        ...habit,
        checkIns,
        lastUpdated: new Date()
      };
      
      // Always store in IndexedDB for offline access
      await localDb.saveHabit(updatedHabit);
      
      // If online, also update Firebase
      if (isOnline) {
        const habitRef = doc(db, 'habits', habit.id);
        await updateDoc(habitRef, {
          checkIns,
          lastUpdated: new Date()
        });
      } else {
        // If offline, add to pending sync queue
        await localDb.addPendingHabit(updatedHabit);
        await localDb.registerSync();
      }
      
      // Refresh the habits list
      router.refresh();
    } catch (error) {
      console.error('Error updating habit check-in:', error);
      // Save locally even if Firebase update fails
      try {
        const updatedHabit = {
          ...habit,
          checkIns: habit.checkIns || {},
          lastUpdated: new Date()
        };
        updatedHabit.checkIns[today] = !updatedHabit.checkIns[today];
        await localDb.saveHabit(updatedHabit);
        await localDb.addPendingHabit(updatedHabit);
        router.refresh();
      } catch (localError) {
        console.error('Local save also failed:', localError);
        alert('Failed to update habit. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle numeric check-ins
  const handleNumericCheckIn = async (value) => {
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Create a copy of the current check-ins or an empty object if it doesn't exist
      const checkIns = habit.checkIns || {};
      
      // Add or update the check-in value for today
      checkIns[today] = {
        value: Number(value),
        timestamp: new Date()
      };
      
      // Update the habit object with new check-ins
      const updatedHabit = {
        ...habit,
        checkIns,
        lastUpdated: new Date()
      };
      
      // Always store in IndexedDB for offline access
      await localDb.saveHabit(updatedHabit);
      
      // If online, also update Firebase
      if (isOnline) {
        const habitRef = doc(db, 'habits', habit.id);
        await updateDoc(habitRef, {
          checkIns,
          lastUpdated: new Date()
        });
      } else {
        // If offline, add to pending sync queue
        await localDb.addPendingHabit(updatedHabit);
        await localDb.registerSync();
      }
      
      // Close the modal
      setShowTrackingModal(false);
      
      // Refresh the habits list
      router.refresh();
    } catch (error) {
      console.error('Error updating habit check-in:', error);
      
      // Try to save locally even if Firebase update fails
      try {
        const updatedHabit = {
          ...habit,
          checkIns: habit.checkIns || {},
          lastUpdated: new Date()
        };
        updatedHabit.checkIns[today] = {
          value: Number(value),
          timestamp: new Date()
        };
        await localDb.saveHabit(updatedHabit);
        await localDb.addPendingHabit(updatedHabit);
        setShowTrackingModal(false);
        router.refresh();
      } catch (localError) {
        console.error('Local save also failed:', localError);
        alert('Failed to update habit. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle progress check-ins
  const handleProgressCheckIn = async (steps) => {
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Create a copy of the current check-ins or an empty object if it doesn't exist
      const checkIns = habit.checkIns || {};
      
      // Add or update the progress steps for today
      checkIns[today] = {
        steps,
        completed: steps.every(step => step),
        timestamp: new Date()
      };
      
      // Update the habit object with new check-ins
      const updatedHabit = {
        ...habit,
        checkIns,
        lastUpdated: new Date()
      };
      
      // Always store in IndexedDB for offline access
      await localDb.saveHabit(updatedHabit);
      
      // If online, also update Firebase
      if (isOnline) {
        const habitRef = doc(db, 'habits', habit.id);
        await updateDoc(habitRef, {
          checkIns,
          lastUpdated: new Date()
        });
      } else {
        // If offline, add to pending sync queue
        await localDb.addPendingHabit(updatedHabit);
        await localDb.registerSync();
      }
      
      // Close the modal
      setShowTrackingModal(false);
      
      // Refresh the habits list
      router.refresh();
    } catch (error) {
      console.error('Error updating habit check-in:', error);
      
      // Try to save locally even if Firebase update fails
      try {
        const updatedHabit = {
          ...habit,
          checkIns: habit.checkIns || {},
          lastUpdated: new Date()
        };
        updatedHabit.checkIns[today] = {
          steps,
          completed: steps.every(step => step),
          timestamp: new Date()
        };
        await localDb.saveHabit(updatedHabit);
        await localDb.addPendingHabit(updatedHabit);
        setShowTrackingModal(false);
        router.refresh();
      } catch (localError) {
        console.error('Local save also failed:', localError);
        alert('Failed to update habit. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to open tracking modal or directly toggle binary habit
  const handleCheckIn = () => {
    if (habit.trackingType === 'binary') {
      handleBinaryCheckIn();
    } else {
      setShowTrackingModal(true);
    }
  };
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Check if the habit has been completed today based on tracking type
  const completedToday = habit.checkIns && (() => {
    if (habit.trackingType === 'binary') {
      return habit.checkIns[today];
    } else if (habit.trackingType === 'numeric') {
      return habit.checkIns[today]?.value >= habit.targetValue;
    } else if (habit.trackingType === 'progress') {
      return habit.checkIns[today]?.completed;
    }
    return false;
  })();
  
  // Get tracking progress for today
  const todayProgress = habit.checkIns && habit.checkIns[today];
  
  // Calculate progress percentage for numeric habits
  const numericProgressPercentage = habit.trackingType === 'numeric' && todayProgress ? 
    Math.min(100, Math.round((todayProgress.value / habit.targetValue) * 100)) : 0;
  
  // Calculate progress percentage for multi-step habits
  const progressBarPercentage = habit.trackingType === 'progress' && todayProgress && todayProgress.steps ? 
    Math.round((todayProgress.steps.filter(step => step).length / todayProgress.steps.length) * 100) : 0;
  
  // Calculate current streak
  const calculateStreak = () => {
    if (!habit.checkIns) return 0;
    
    let streak = 0;
    let date = new Date();
    
    // Check backwards from today
    while (true) {
      const dateString = date.toISOString().split('T')[0];
      const checkIn = habit.checkIns[dateString];
      
      if (checkIn) {
        // Different tracking types have different completion criteria
        let isCompleted = false;
        
        if (habit.trackingType === 'binary') {
          isCompleted = checkIn === true;
        } else if (habit.trackingType === 'numeric') {
          isCompleted = checkIn.value >= habit.targetValue;
        } else if (habit.trackingType === 'progress') {
          isCompleted = checkIn.completed;
        }
        
        if (isCompleted) {
          streak++;
          date.setDate(date.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const currentStreak = calculateStreak();
  
  return (
    <li className="rounded-lg transition-colors duration-200 hover:bg-muted bg-card">
      <div className="px-3 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
            
            {/* Numeric Progress Bar */}
            {habit.trackingType === 'numeric' && todayProgress && (
              <div className="mt-1">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${numericProgressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-0.5 text-xs text-muted-foreground">
                  <span>{todayProgress.value} {habit.unit}</span>
                  <span>{habit.targetValue} {habit.unit}</span>
                </div>
              </div>
            )}
            
            {/* Multi-step Progress Bar */}
            {habit.trackingType === 'progress' && todayProgress && todayProgress.steps && (
              <div className="mt-1">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${progressBarPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-0.5 text-xs text-muted-foreground">
                  <span>{todayProgress.steps.filter(s => s).length}/{habit.steps.length} steps</span>
                </div>
              </div>
            )}
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
      
      {/* Tracking Modal for non-binary habits */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">{habit.name}</h3>
            
            {habit.trackingType === 'numeric' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="numericValue" className="block text-sm font-medium text-foreground mb-1">
                    Enter your progress ({habit.unit})
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="numericValue"
                      min="0"
                      step="any"
                      value={numericValue}
                      onChange={(e) => setNumericValue(e.target.value)}
                      className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md bg-background"
                    />
                    <span className="ml-2">{habit.unit}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Target: {habit.targetValue} {habit.unit}</p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTrackingModal(false)}
                    className="px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumericCheckIn(numericValue)}
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {loading ? 'Saving...' : 'Save Progress'}
                  </button>
                </div>
              </div>
            )}
            
            {habit.trackingType === 'progress' && habit.steps && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Track your progress
                  </label>
                  {habit.steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`step-${index}`}
                        checked={progressSteps[index] || false}
                        onChange={() => {
                          const newSteps = [...progressSteps];
                          newSteps[index] = !newSteps[index];
                          setProgressSteps(newSteps);
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      />
                      <label htmlFor={`step-${index}`} className="ml-2 block text-sm text-foreground">
                        {step}
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTrackingModal(false)}
                    className="px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProgressCheckIn(progressSteps)}
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {loading ? 'Saving...' : 'Save Progress'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
