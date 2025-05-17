'use client';

import { useState, useEffect, useCallback } from 'react';

export default function HabitDetailStats({ habit }) {
  const [stats, setStats] = useState({
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    averageValue: 0,
    progressDistribution: [] // For multi-step habits
  });

  // Memoize the calculateStats function to avoid dependency issues
  const calculateStats = useCallback(() => {
    if (!habit.checkIns) {
      return;
    }

    const now = new Date();
    const checkInDates = Object.keys(habit.checkIns);
    const checkInEntries = Object.entries(habit.checkIns);
    
    // Sort dates in ascending order
    checkInDates.sort();

    // Calculate total days since start date
    const startDate = habit.startDate ? new Date(habit.startDate) : new Date(checkInDates[0]);
    const daysActive = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)) || 1;
    
    // Calculate completion stats
    let totalCompletions = 0;
    let numericValues = [];
    let progressStepsCompleted = {};
    
    // Initialize step tracking for progress habits
    if (habit.trackingType === 'progress' && habit.steps) {
      habit.steps.forEach((step, index) => {
        progressStepsCompleted[index] = 0;
      });
    }
    
    // Process check-ins based on habit type
    checkInEntries.forEach(([date, value]) => {
      // Determine if the entry counts as a completion
      if (habit.trackingType === 'binary' && value === true) {
        totalCompletions++;
      } else if (habit.trackingType === 'numeric' && value?.value) {
        // For numeric habits, collect values for averaging
        numericValues.push(value.value);
        if (value.value >= habit.targetValue) {
          totalCompletions++;
        }
      } else if (habit.trackingType === 'progress' && value?.steps && habit.steps) {
        // For progress habits, track which steps are completed most often
        if (value.completed) {
          totalCompletions++;
        }
        
        // Count individual step completions
        value.steps.forEach((isCompleted, index) => {
          if (isCompleted) {
            progressStepsCompleted[index] = (progressStepsCompleted[index] || 0) + 1;
          }
        });
      }
    });
    
    // Calculate completion rate
    const completionRate = Math.round((totalCompletions / daysActive) * 100);
    
    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(habit);
    
    // Calculate average value for numeric habits
    const averageValue = numericValues.length > 0
      ? Math.round((numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length) * 10) / 10
      : 0;
    
    // Prepare progress distribution for progress habits
    const progressDistribution = habit.trackingType === 'progress' && habit.steps
      ? habit.steps.map((step, index) => ({
          step,
          completions: progressStepsCompleted[index] || 0,
          percentage: Math.round(((progressStepsCompleted[index] || 0) / Math.max(1, checkInEntries.length)) * 100)
        }))
      : [];
    
    setStats({
      completionRate,
      currentStreak,
      longestStreak,
      totalCompletions,
      averageValue,
      progressDistribution
    });
  }, [habit]);
  
  // Add useEffect to call calculateStats when habit changes
  useEffect(() => {
    if (!habit || !habit.checkIns) {
      return;
    }

    // Calculate stats based on habit type and check-ins
    calculateStats();
  }, [habit, calculateStats]);
  
  // Calculate streak statistics
  const calculateStreaks = (habit) => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Iterate backwards from today
    let date = new Date();
    let continuousStreak = true;
    
    while (true) {
      const dateString = date.toISOString().split('T')[0];
      const checkIn = habit.checkIns[dateString];
      
      let isCompleted = false;
      
      if (checkIn) {
        // Determine completion based on tracking type
        if (habit.trackingType === 'binary') {
          isCompleted = checkIn === true;
        } else if (habit.trackingType === 'numeric') {
          isCompleted = checkIn.value >= habit.targetValue;
        } else if (habit.trackingType === 'progress') {
          isCompleted = checkIn.completed;
        } else {
          isCompleted = !!checkIn;
        }
        
        if (isCompleted) {
          tempStreak++;
          
          // If this is still the current streak
          if (continuousStreak) {
            currentStreak = tempStreak;
          }
        } else {
          // Reset temp streak on missed day
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 0;
          continuousStreak = false;
        }
      } else {
        // No data for this day - handle as missed if before today
        if (dateString !== new Date().toISOString().split('T')[0]) {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 0;
          continuousStreak = false;
        }
      }
      
      // Move to previous day
      date.setDate(date.getDate() - 1);
      
      // Stop if we've gone back 365 days or reached habit start date
      const startDate = habit.startDate ? new Date(habit.startDate) : null;
      if (date < startDate || date < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) {
        break;
      }
    }
    
    // Update longest streak if the final temp streak is the longest
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    
    return { currentStreak, longestStreak };
  };

  // Render different stat sections based on habit tracking type
  return (
    <div className="bg-card rounded-lg shadow-sm p-3 sm:p-4 mt-3 sm:mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-muted/30 p-3 sm:p-4 rounded-md">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Completion Rate</h3>
          <p className="text-xl sm:text-2xl font-bold">{stats.completionRate}%</p>
        </div>
        <div className="bg-muted/30 p-3 sm:p-4 rounded-md">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Current Streak</h3>
          <p className="text-xl sm:text-2xl font-bold">{stats.currentStreak} days</p>
        </div>
        <div className="bg-muted/30 p-3 sm:p-4 rounded-md">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Longest Streak</h3>
          <p className="text-xl sm:text-2xl font-bold">{stats.longestStreak} days</p>
        </div>
      </div>
      
      {/* Tracking type specific stats */}
      {habit.trackingType === 'numeric' && (
        <div className="mt-4 sm:mt-6">
          <h3 className="text-xs sm:text-sm font-medium mb-2">Numeric Tracking Stats</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-muted/30 p-3 sm:p-4 rounded-md">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Average Value</h3>
              <p className="text-xl sm:text-2xl font-bold truncate">
                {stats.averageValue} <span className="text-xs sm:text-sm font-normal">{habit.unit}</span>
              </p>
            </div>
            <div className="bg-muted/30 p-3 sm:p-4 rounded-md">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Target</h3>
              <p className="text-xl sm:text-2xl font-bold truncate">
                {habit.targetValue} <span className="text-xs sm:text-sm font-normal">{habit.unit}</span>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Progress tracking stats */}
      {habit.trackingType === 'progress' && stats.progressDistribution.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h3 className="text-xs sm:text-sm font-medium mb-2">Step Completion Stats</h3>
          <div className="space-y-2">
            {stats.progressDistribution.map((item, index) => (
              <div key={index} className="bg-muted/30 p-2 sm:p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs sm:text-sm truncate max-w-[70%]">{item.step}</span>
                  <span className="text-xs sm:text-sm font-medium">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-primary h-1.5 sm:h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
        <h3 className="text-xs sm:text-sm font-medium mb-1">Total Completions</h3>
        <p className="text-2xl sm:text-3xl font-bold text-primary">{stats.totalCompletions}</p>
      </div>
    </div>
  );
}
