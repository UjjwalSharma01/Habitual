'use client';

import { useState, useEffect, useCallback } from 'react';

export default function HabitOverviewCard({ habit, period = 'weekly' }) {
  const [overview, setOverview] = useState({
    totalDays: 0,
    completedDays: 0,
    completionRate: 0,
    averageValue: 0, // For numeric habits
    bestDay: null,
    data: [] // Daily data for the chart
  });
  
  // Memoize the calculateOverview function
  const calculateOverview = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Determine time range based on period
    const rangeStart = new Date(today);
    if (period === 'weekly') {
      // Go back to the start of the week (Sunday)
      const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
      rangeStart.setDate(today.getDate() - day);
    } else if (period === 'monthly') {
      // Go back to the 1st of the month
      rangeStart.setDate(1);
    } else {
      // Default to weekly
      const day = today.getDay();
      rangeStart.setDate(today.getDate() - day);
    }
    
    // Generate all days in the range
    const daysInRange = [];
    const tempDate = new Date(rangeStart);
    
    while (tempDate <= today) {
      daysInRange.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    // Initialize data structure for each day
    const dailyData = daysInRange.map(date => {
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = date.getDate();
      
      return {
        date,
        dateString,
        dayName,
        dayNumber,
        value: null,
        isCompleted: false
      };
    });
    
    // Fill in data from check-ins
    let completedDays = 0;
    let bestValue = 0;
    let bestDay = null;
    const numericValues = [];
    
    dailyData.forEach(dayData => {
      const checkIn = habit.checkIns?.[dayData.dateString];
      
      if (checkIn) {
        // Process based on tracking type
        if (habit.trackingType === 'binary') {
          dayData.isCompleted = checkIn === true;
          dayData.value = checkIn ? 1 : 0;
        } else if (habit.trackingType === 'numeric' && checkIn.value !== undefined) {
          const value = checkIn.value;
          dayData.value = value;
          numericValues.push(value);
          
          dayData.isCompleted = value >= habit.targetValue;
          
          // Track best day
          if (value > bestValue) {
            bestValue = value;
            bestDay = dayData.dateString;
          }
        } else if (habit.trackingType === 'progress' && checkIn.steps) {
          const completedSteps = checkIn.steps.filter(Boolean).length;
          const totalSteps = habit.steps?.length || checkIn.steps.length;
          
          dayData.value = completedSteps;
          dayData.isCompleted = checkIn.completed;
          dayData.progressPercentage = Math.round((completedSteps / totalSteps) * 100);
        }
        
        if (dayData.isCompleted) {
          completedDays++;
        }
      }
    });
    
    // Calculate overview stats
    const totalDays = dailyData.length;
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    const averageValue = numericValues.length > 0
      ? Math.round((numericValues.reduce((a, b) => a + b, 0) / numericValues.length) * 10) / 10
      : 0;
    
    setOverview({
      totalDays,
      completedDays,
      completionRate,
      averageValue,
      bestDay,
      data: dailyData
    });
  }, [habit, period]);
  
  // Calculate overview data when habit or period changes
  useEffect(() => {
    if (!habit || !habit.checkIns) {
      return;
    }
    
    calculateOverview();
  }, [habit, period, calculateOverview]);

  // Format date for display
  const formatDateRange = () => {
    if (!overview.data.length) return '';
    
    const startDate = overview.data[0].date;
    const endDate = overview.data[overview.data.length - 1].date;
    
    const formatOptions = { month: 'short', day: 'numeric' };
    
    return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`;
  };

  if (!habit) {
    return <div className="p-4 text-center text-muted-foreground">No habit selected</div>;
  }

  return (
    <div className="bg-card p-3 sm:p-4 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div>
          <h3 className="font-medium">{period === 'weekly' ? 'Weekly' : 'Monthly'} Overview</h3>
          <p className="text-xs text-muted-foreground">{formatDateRange()}</p>
        </div>
        <div className="text-right sm:mt-0 mt-1">
          <p className="text-xl sm:text-2xl font-bold text-primary">{overview.completionRate}%</p>
          <p className="text-xs text-muted-foreground">Completion rate</p>
        </div>
      </div>
      
      {/* Visual overview - scrollable on mobile, showing most recent data first */}
      <div className="mt-4 flex justify-between overflow-x-auto pb-2 gap-2 md:gap-0 flex-row-reverse" 
           ref={(el) => {
             // Scroll to the right end (showing most recent data) when component mounts
             if (el) {
               el.scrollLeft = el.scrollWidth;
             }
           }}>
        {overview.data.map((day, i) => (
          <div key={i} className="flex flex-col items-center flex-shrink-0 w-10 md:w-auto">
            <span className="text-xs font-medium mb-1">{day.dayName}</span>
            {habit.trackingType === 'binary' ? (
              <div 
                className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center border-2 ${
                  day.isCompleted 
                    ? 'border-primary bg-primary text-white' 
                    : 'border-gray-300'
                }`}
              >
                {day.isCompleted && (
                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ) : habit.trackingType === 'numeric' ? (
              <div className="flex flex-col items-center">
                <div 
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center border-2 ${
                    day.isCompleted 
                      ? 'border-primary bg-primary text-white' 
                      : day.value ? 'border-amber-500' : 'border-gray-300'
                  }`}
                >
                  {day.value !== null && (
                    <span className="text-2xs sm:text-xs font-medium">{day.value}</span>
                  )}
                </div>
                <span className="text-2xs sm:text-xs mt-1">{day.dayNumber}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Progress tracking */}
                <div className="h-7 w-7 sm:h-8 sm:w-8 relative">
                  <svg className="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={day.isCompleted ? "#10B981" : "#FCD34D"}
                      strokeWidth="3"
                      strokeDasharray={`${day.progressPercentage || 0}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xs sm:text-xs font-medium">{day.value || 0}</span>
                  </div>
                </div>
                <span className="text-2xs sm:text-xs mt-1">{day.dayNumber}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Stats based on habit type */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-muted/20 p-2 sm:p-3 rounded">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-sm sm:text-lg font-medium">{overview.completedDays}/{overview.totalDays} days</p>
        </div>
        
        {habit.trackingType === 'numeric' && (
          <div className="bg-muted/20 p-2 sm:p-3 rounded">
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-sm sm:text-lg font-medium truncate">{overview.averageValue} {habit.unit}</p>
          </div>
        )}
        
        {habit.trackingType === 'progress' && (
          <div className="bg-muted/20 p-2 sm:p-3 rounded">
            <p className="text-xs text-muted-foreground">Steps Completion</p>
            <p className="text-sm sm:text-lg font-medium">
              {Math.round(overview.data.reduce((sum, day) => sum + (day.progressPercentage || 0), 0) / Math.max(1, overview.data.length))}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
