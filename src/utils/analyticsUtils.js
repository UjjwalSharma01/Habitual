'use client';

/**
 * Analytics Utility Functions for Habitual
 * 
 * These functions help analyze habit data, identify patterns,
 * and generate insights for users.
 */

/**
 * Calculate the consistency score for a habit
 * 
 * @param {Object} checkIns - Object containing habit check-in data
 * @param {String} trackingType - Type of habit tracking (binary, numeric, progress)
 * @param {Number} targetValue - Target value for numeric habits
 * @param {Array} steps - Steps for progress habits
 * @param {Number} daysToConsider - Number of days to look back
 * @returns {Number} Consistency score from 0 to 100
 */
export function calculateConsistencyScore(checkIns, trackingType, targetValue, steps, daysToConsider = 30) {
  if (!checkIns || Object.keys(checkIns).length === 0) {
    return 0;
  }

  const today = new Date();
  const earliestDate = new Date();
  earliestDate.setDate(today.getDate() - daysToConsider);
  
  // Convert to string format for comparison
  const earliestDateStr = earliestDate.toISOString().split('T')[0];
  
  // Filter check-ins to only include the last X days
  const recentCheckIns = Object.entries(checkIns).filter(([date]) => 
    date >= earliestDateStr && date <= today.toISOString().split('T')[0]
  );
  
  // Calculate completed days
  let completedDays = 0;
  
  recentCheckIns.forEach(([date, value]) => {
    let isCompleted = false;
    
    if (trackingType === 'binary') {
      isCompleted = value === true;
    } else if (trackingType === 'numeric') {
      isCompleted = value?.value >= targetValue;
    } else if (trackingType === 'progress') {
      isCompleted = value?.completed === true;
    }
    
    if (isCompleted) {
      completedDays++;
    }
  });
  
  // Calculate consistency score (0-100)
  const availableDays = Math.min(daysToConsider, getDaysBetweenDates(earliestDateStr, today.toISOString().split('T')[0]) + 1);
  const consistencyScore = Math.round((completedDays / availableDays) * 100);
  
  return consistencyScore;
}

/**
 * Calculate the number of days between two dates (inclusive)
 * 
 * @param {String} startDateStr - Start date in YYYY-MM-DD format
 * @param {String} endDateStr - End date in YYYY-MM-DD format
 * @returns {Number} Number of days
 */
function getDaysBetweenDates(startDateStr, endDateStr) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  
  // Get the time difference in milliseconds
  const timeDiff = endDate.getTime() - startDate.getTime();
  
  // Convert to days and add 1 to include both start and end dates
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Identify habit completion patterns by day of week
 * 
 * @param {Object} checkIns - Object containing habit check-in data
 * @param {String} trackingType - Type of habit tracking
 * @param {Number} targetValue - Target value for numeric habits
 * @returns {Array} Array of day-of-week completion rates (0-100)
 */
export function getDayOfWeekPatterns(checkIns, trackingType, targetValue) {
  if (!checkIns || Object.keys(checkIns).length === 0) {
    return [0, 0, 0, 0, 0, 0, 0];
  }

  // Initialize counters for each day of week
  const completions = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const totals = [0, 0, 0, 0, 0, 0, 0];
  
  // Process all check-ins
  Object.entries(checkIns).forEach(([date, value]) => {
    const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
    
    totals[dayOfWeek]++;
    
    let isCompleted = false;
    if (trackingType === 'binary') {
      isCompleted = value === true;
    } else if (trackingType === 'numeric') {
      isCompleted = value?.value >= targetValue;
    } else if (trackingType === 'progress') {
      isCompleted = value?.completed === true;
    }
    
    if (isCompleted) {
      completions[dayOfWeek]++;
    }
  });
  
  // Calculate completion rates
  return completions.map((completions, i) => 
    totals[i] > 0 ? Math.round((completions / totals[i]) * 100) : 0
  );
}

/**
 * Identify time-of-day patterns for habit completion
 * 
 * @param {Object} checkIns - Object containing habit check-in data with timestamps
 * @returns {Object} Object with morning, afternoon, evening, night completion counts
 */
export function getTimeOfDayPatterns(checkIns) {
  if (!checkIns) return { morning: 0, afternoon: 0, evening: 0, night: 0 };
  
  const timePatterns = {
    morning: 0,   // 5am - 11:59am
    afternoon: 0, // 12pm - 4:59pm
    evening: 0,   // 5pm - 8:59pm
    night: 0      // 9pm - 4:59am
  };
  
  Object.values(checkIns).forEach(value => {
    if (value && value.timestamp) {
      const date = new Date(value.timestamp);
      const hour = date.getHours();
      
      if (hour >= 5 && hour < 12) {
        timePatterns.morning++;
      } else if (hour >= 12 && hour < 17) {
        timePatterns.afternoon++;
      } else if (hour >= 17 && hour < 21) {
        timePatterns.evening++;
      } else {
        timePatterns.night++;
      }
    }
  });
  
  return timePatterns;
}

/**
 * Calculate trends for a specific habit over time
 * 
 * @param {Object} checkIns - Object containing habit check-in data
 * @param {String} trackingType - Type of habit tracking
 * @param {Number} targetValue - Target value for numeric habits
 * @param {Number} periodInDays - Number of days to consider
 * @returns {Array} Array of weekly or monthly stats
 */
export function calculateTrends(checkIns, trackingType, targetValue, periodInDays = 90) {
  if (!checkIns || Object.keys(checkIns).length === 0) {
    return [];
  }
  
  // Determine if we should use weekly or monthly grouping based on data amount
  const groupByWeek = periodInDays <= 90;
  
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - periodInDays);
  
  // Get all dates to consider
  const dateArray = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= today) {
    dateArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Group dates
  const groups = [];
  if (groupByWeek) {
    // Group by week
    let weekStart = new Date(dateArray[0]);
    let currentWeek = [];
    
    dateArray.forEach(date => {
      if (getDaysBetweenDates(weekStart.toISOString().split('T')[0], date.toISOString().split('T')[0]) < 7) {
        currentWeek.push(date);
      } else {
        groups.push(currentWeek);
        weekStart = new Date(date);
        currentWeek = [date];
      }
    });
    
    // Add the last week
    if (currentWeek.length > 0) {
      groups.push(currentWeek);
    }
  } else {
    // Group by month
    let currentMonth = dateArray[0].getMonth();
    let currentYear = dateArray[0].getFullYear();
    let currentMonthDates = [];
    
    dateArray.forEach(date => {
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        currentMonthDates.push(date);
      } else {
        groups.push(currentMonthDates);
        currentMonth = date.getMonth();
        currentYear = date.getFullYear();
        currentMonthDates = [date];
      }
    });
    
    // Add the last month
    if (currentMonthDates.length > 0) {
      groups.push(currentMonthDates);
    }
  }
  
  // Calculate stats for each group
  return groups.map(dateGroup => {
    const groupStart = dateGroup[0];
    const groupEnd = dateGroup[dateGroup.length - 1];
    const label = groupByWeek ? 
      `${groupStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${groupEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` :
      groupStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    let completedDays = 0;
    let totalValue = 0;
    let valueCount = 0;
    
    // Check each date in this group
    dateGroup.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      const checkIn = checkIns[dateStr];
      
      if (checkIn) {
        if (trackingType === 'binary' && checkIn === true) {
          completedDays++;
        } else if (trackingType === 'numeric' && checkIn.value !== undefined) {
          if (checkIn.value >= targetValue) completedDays++;
          totalValue += checkIn.value;
          valueCount++;
        } else if (trackingType === 'progress' && checkIn.completed === true) {
          completedDays++;
        }
      }
    });
    
    const completionRate = Math.round((completedDays / dateGroup.length) * 100);
    const averageValue = valueCount > 0 ? totalValue / valueCount : 0;
    
    return {
      label,
      completionRate,
      averageValue: trackingType === 'numeric' ? averageValue : null,
      totalDays: dateGroup.length,
      completedDays
    };
  });
}

/**
 * Identify correlations between different habits
 * 
 * @param {Array} habits - Array of habit objects with checkIns
 * @returns {Array} Array of correlation objects
 */
export function findHabitCorrelations(habits) {
  if (!habits || habits.length < 2) return [];
  
  const correlations = [];
  
  // Compare each pair of habits
  for (let i = 0; i < habits.length; i++) {
    for (let j = i + 1; j < habits.length; j++) {
      const habit1 = habits[i];
      const habit2 = habits[j];
      
      if (!habit1.checkIns || !habit2.checkIns) continue;
      
      // Get common dates between habits
      const dates1 = Object.keys(habit1.checkIns);
      const dates2 = Object.keys(habit2.checkIns);
      const commonDates = dates1.filter(date => dates2.includes(date));
      
      if (commonDates.length < 5) continue; // Need enough data points
      
      // Count co-occurrences and individual occurrences
      let bothCompleted = 0;
      let habit1OnlyCompleted = 0;
      let habit2OnlyCompleted = 0;
      let neitherCompleted = 0;
      
      commonDates.forEach(date => {
        const checkIn1 = habit1.checkIns[date];
        const checkIn2 = habit2.checkIns[date];
        
        const isCompleted1 = isHabitCompletedOnDate(habit1, date);
        const isCompleted2 = isHabitCompletedOnDate(habit2, date);
        
        if (isCompleted1 && isCompleted2) bothCompleted++;
        else if (isCompleted1 && !isCompleted2) habit1OnlyCompleted++;
        else if (!isCompleted1 && isCompleted2) habit2OnlyCompleted++;
        else neitherCompleted++;
      });
      
      // Calculate correlation coefficient (phi coefficient)
      const total = commonDates.length;
      const phi = ((bothCompleted * neitherCompleted) - (habit1OnlyCompleted * habit2OnlyCompleted)) / 
                  Math.sqrt((bothCompleted + habit1OnlyCompleted) * 
                           (bothCompleted + habit2OnlyCompleted) * 
                           (neitherCompleted + habit1OnlyCompleted) * 
                           (neitherCompleted + habit2OnlyCompleted)) || 0;
      
      // Calculate correlation strength (0-100)
      const correlationStrength = Math.round(Math.abs(phi) * 100);
      
      // Determine correlation type
      const correlationType = phi > 0 ? 'positive' : 'negative';
      
      if (correlationStrength > 20) { // Only include meaningful correlations
        correlations.push({
          habit1: {
            id: habit1.id,
            name: habit1.name,
          },
          habit2: {
            id: habit2.id,
            name: habit2.name,
          },
          strength: correlationStrength,
          type: correlationType,
          sampleSize: commonDates.length
        });
      }
    }
  }
  
  // Sort by correlation strength (highest first)
  return correlations.sort((a, b) => b.strength - a.strength);
}

/**
 * Helper function to determine if a habit was completed on a specific date
 */
function isHabitCompletedOnDate(habit, date) {
  const checkIn = habit.checkIns[date];
  
  if (!checkIn) return false;
  
  if (habit.trackingType === 'binary') {
    return checkIn === true;
  } else if (habit.trackingType === 'numeric') {
    return checkIn.value >= habit.targetValue;
  } else if (habit.trackingType === 'progress') {
    return checkIn.completed === true;
  }
  
  return false;
}

/**
 * Analyze habit performance based on time of day
 * 
 * @param {Object} checkIns - Object containing habit check-in data with timestamps
 * @returns {Object} Object with recommended times and stats
 */
export function analyzeTimePerformance(checkIns) {
  if (!checkIns) return { recommendedTime: null, data: {} };
  
  const hourCounts = Array(24).fill(0);
  const hourCompletions = Array(24).fill(0);
  
  // Count completions by hour
  Object.values(checkIns).forEach(value => {
    if (value && value.timestamp) {
      const date = new Date(value.timestamp);
      const hour = date.getHours();
      
      hourCounts[hour]++;
      
      // Check if it was completed
      if ((typeof value === 'boolean' && value) || 
          (value.completed) || 
          (value.value !== undefined)) {
        hourCompletions[hour]++;
      }
    }
  });
  
  // Calculate success rates
  const hourSuccessRates = hourCounts.map((count, hour) => ({
    hour,
    count,
    completions: hourCompletions[hour],
    rate: count > 0 ? (hourCompletions[hour] / count) * 100 : 0
  }));
  
  // Find the hour with the highest success rate (min 3 attempts)
  const validHours = hourSuccessRates.filter(h => h.count >= 3);
  const bestHour = validHours.length > 0 ? 
    validHours.reduce((best, current) => 
      current.rate > best.rate ? current : best, validHours[0]) : null;
  
  // Get the period of day with highest success rate
  const periods = [
    { name: 'morning', start: 5, end: 11, total: 0, completions: 0 },
    { name: 'afternoon', start: 12, end: 16, total: 0, completions: 0 },
    { name: 'evening', start: 17, end: 20, total: 0, completions: 0 },
    { name: 'night', start: 21, end: 4, total: 0, completions: 0 }
  ];
  
  hourSuccessRates.forEach(data => {
    const hour = data.hour;
    periods.forEach(period => {
      if ((period.start <= period.end && hour >= period.start && hour <= period.end) ||
          (period.start > period.end && (hour >= period.start || hour <= period.end))) {
        period.total += data.count;
        period.completions += data.completions;
      }
    });
  });
  
  periods.forEach(period => {
    period.rate = period.total > 0 ? (period.completions / period.total) * 100 : 0;
  });
  
  // Find best period
  const bestPeriod = periods.reduce((best, current) => 
    (current.total >= 3 && current.rate > best.rate) ? current : best, 
    { name: null, rate: 0 });
  
  // Format recommended time text
  let recommendedTime = null;
  if (bestHour && bestHour.rate > 50) {
    const hourText = bestHour.hour % 12 || 12;
    const ampm = bestHour.hour < 12 ? 'AM' : 'PM';
    recommendedTime = `${hourText} ${ampm}`;
  } else if (bestPeriod.name) {
    recommendedTime = bestPeriod.name;
  }
  
  return { 
    recommendedTime, 
    bestHour: bestHour ? {
      hour: bestHour.hour,
      rate: Math.round(bestHour.rate)
    } : null,
    bestPeriod: bestPeriod.name ? {
      period: bestPeriod.name,
      rate: Math.round(bestPeriod.rate)
    } : null,
    hourData: hourSuccessRates.map(h => ({
      hour: h.hour,
      rate: Math.round(h.rate),
      count: h.count
    })),
    periodData: periods.map(p => ({
      period: p.name,
      rate: Math.round(p.rate),
      count: p.total
    }))
  };
}

/**
 * Predict habit sticking points and likely failure days
 * 
 * @param {Object} checkIns - Object containing habit check-in data
 * @param {String} trackingType - Type of habit tracking
 * @param {Number} targetValue - Target value for numeric habits
 * @returns {Object} Prediction data about potential sticking points
 */
export function predictStickingPoints(checkIns, trackingType, targetValue) {
  if (!checkIns || Object.keys(checkIns).length < 7) {
    return { 
      riskLevel: 'unknown',
      likelyFailureDays: [],
      riskFactors: [] 
    };
  }
  
  const dayOfWeekPatterns = getDayOfWeekPatterns(checkIns, trackingType, targetValue);
  const timePatterns = getTimeOfDayPatterns(checkIns);
  
  // Find the days with the lowest completion rates
  const weakestDays = dayOfWeekPatterns
    .map((rate, index) => ({ day: index, rate }))
    .filter(day => day.rate < 50) // Days with <50% completion rate
    .sort((a, b) => a.rate - b.rate); // Sort weakest first
  
  // Convert day indices to names
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const likelyFailureDays = weakestDays.map(day => ({
    name: dayNames[day.day],
    completionRate: day.rate
  }));
  
  // Calculate streaks history
  const streakHistory = calculateStreakHistory(checkIns, trackingType, targetValue);
  
  // Calculate average streak length
  const averageStreakLength = streakHistory.length > 0
    ? streakHistory.reduce((sum, streak) => sum + streak.length, 0) / streakHistory.length
    : 0;
  
  // Calculate how often the user has missed after X days streak
  const streakBreakPoints = {};
  streakHistory.forEach(streak => {
    if (streak.broken && streak.length > 0) {
      streakBreakPoints[streak.length] = (streakBreakPoints[streak.length] || 0) + 1;
    }
  });
  
  // Find the most common streak breaking point
  let mostCommonBreakPoint = 0;
  let highestBreakCount = 0;
  
  Object.entries(streakBreakPoints).forEach(([length, count]) => {
    if (count > highestBreakCount) {
      mostCommonBreakPoint = parseInt(length);
      highestBreakCount = count;
    }
  });
  
  // Determine risk factors
  const riskFactors = [];
  
  if (likelyFailureDays.length > 0) {
    riskFactors.push({
      type: 'days',
      description: `You tend to struggle with this habit on ${likelyFailureDays.map(d => d.name).join(', ')}`,
      severity: likelyFailureDays[0].completionRate < 30 ? 'high' : 'medium'
    });
  }
  
  if (mostCommonBreakPoint > 0 && highestBreakCount >= 2) {
    riskFactors.push({
      type: 'streak',
      description: `You often break your streak after ${mostCommonBreakPoint} days`,
      severity: highestBreakCount >= 3 ? 'high' : 'medium'
    });
  }
  
  if (averageStreakLength < 3) {
    riskFactors.push({
      type: 'consistency',
      description: 'You are having trouble maintaining consistency beyond a few days',
      severity: 'high'
    });
  }
  
  // Determine overall risk level
  let riskLevel = 'low';
  if (riskFactors.some(factor => factor.severity === 'high') || riskFactors.length >= 3) {
    riskLevel = 'high';
  } else if (riskFactors.length > 0) {
    riskLevel = 'medium';
  }
  
  return {
    riskLevel,
    likelyFailureDays,
    riskFactors,
    averageStreakLength: Math.round(averageStreakLength * 10) / 10,
    commonBreakPoint: mostCommonBreakPoint > 0 ? mostCommonBreakPoint : null
  };
}

/**
 * Calculate streak history
 * 
 * @param {Object} checkIns - Object containing habit check-in data
 * @param {String} trackingType - Type of habit tracking
 * @param {Number} targetValue - Target value for numeric habits
 * @returns {Array} Array of streak objects
 */
function calculateStreakHistory(checkIns, trackingType, targetValue) {
  const dates = Object.keys(checkIns).sort(); // Sort dates chronologically
  if (dates.length === 0) return [];
  
  const streaks = [];
  let currentStreak = { start: dates[0], length: 0, broken: false };
  
  // Helper to check if a date is the day after another date
  const isNextDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setDate(d1.getDate() + 1);
    return d1.toISOString().split('T')[0] === date2;
  };
  
  // Helper to check if a check-in counts as completed
  const isCompleted = (checkIn) => {
    if (trackingType === 'binary') {
      return checkIn === true;
    } else if (trackingType === 'numeric') {
      return checkIn.value >= targetValue;
    } else if (trackingType === 'progress') {
      return checkIn.completed === true;
    }
    return false;
  };
  
  for (let i = 0; i < dates.length; i++) {
    const currentDate = dates[i];
    const checkIn = checkIns[currentDate];
    const completed = isCompleted(checkIn);
    
    if (completed) {
      currentStreak.length++;
      
      // If this is the last date or the next date is not consecutive
      if (i === dates.length - 1 || !isNextDay(currentDate, dates[i+1])) {
        // Only count streaks of 2+ days
        if (currentStreak.length >= 2) {
          currentStreak.end = currentDate;
          currentStreak.broken = i < dates.length - 1; // Not broken if it's the latest streak
          streaks.push({...currentStreak});
        }
        
        // Start a new streak if there are more dates
        if (i < dates.length - 1) {
          currentStreak = { start: dates[i+1], length: 0, broken: false };
        }
      }
    } else {
      // If the streak had started, end it
      if (currentStreak.length > 0) {
        // Only count streaks of 2+ days
        if (currentStreak.length >= 2) {
          currentStreak.end = dates[i-1];
          currentStreak.broken = true;
          streaks.push({...currentStreak});
        }
        
        // Start a new streak
        currentStreak = { start: dates[i+1], length: 0, broken: false };
      }
    }
  }
  
  return streaks;
}

/**
 * Generate personalized AI recommendations for a habit
 * 
 * @param {Object} habit - The habit object
 * @param {Array} allHabits - All user habits (for correlations)
 * @returns {Object} Personalized recommendations and insights
 */
export function generateHabitRecommendations(habit, allHabits = []) {
  if (!habit || !habit.checkIns || Object.keys(habit.checkIns).length < 5) {
    return {
      has_enough_data: false,
      message: "Track this habit for at least 5 days to get personalized recommendations.",
      recommendations: []
    };
  }
  
  const recommendations = [];
  
  // Analyze time performance
  const timeAnalysis = analyzeTimePerformance(habit.checkIns);
  if (timeAnalysis.recommendedTime) {
    recommendations.push({
      type: 'optimal_time',
      title: `Best time: ${timeAnalysis.recommendedTime}`,
      description: `You're ${timeAnalysis.bestPeriod?.rate || timeAnalysis.bestHour?.rate}% more likely to complete this habit during the ${timeAnalysis.recommendedTime}.`,
      actionable: true,
      action: `Try to schedule this habit for ${timeAnalysis.recommendedTime} to increase your chances of success.`
    });
  }
  
  // Analyze potential sticking points
  const stickingPoints = predictStickingPoints(habit.checkIns, habit.trackingType, habit.targetValue);
  if (stickingPoints.riskLevel !== 'unknown') {
    // Day-specific recommendations
    if (stickingPoints.likelyFailureDays.length > 0) {
      const weakestDay = stickingPoints.likelyFailureDays[0];
      recommendations.push({
        type: 'weak_days',
        title: `Challenging day: ${weakestDay.name}`,
        description: `You complete this habit only ${weakestDay.completionRate}% of the time on ${weakestDay.name}s.`,
        actionable: true,
        action: `Try setting a special reminder for ${weakestDay.name}s or create a specific plan for this day.`
      });
    }
    
    // Streak breaking point recommendations
    if (stickingPoints.commonBreakPoint) {
      recommendations.push({
        type: 'streak_insight',
        title: `Streak threshold: ${stickingPoints.commonBreakPoint} days`,
        description: `You often break your streak after maintaining it for ${stickingPoints.commonBreakPoint} days.`,
        actionable: true,
        action: `When you reach ${stickingPoints.commonBreakPoint} days, give yourself an extra reward or support to push through this threshold.`
      });
    }
  }
  
  // Find correlations with other habits
  if (allHabits.length > 1) {
    const correlations = findHabitCorrelations(allHabits);
    const relevantCorrelations = correlations.filter(corr => 
      corr.habit1.id === habit.id || corr.habit2.id === habit.id
    );
    
    relevantCorrelations.forEach(correlation => {
      const isHabit1 = correlation.habit1.id === habit.id;
      const otherHabit = isHabit1 ? correlation.habit2 : correlation.habit1;
      
      recommendations.push({
        type: correlation.type === 'positive' ? 'positive_correlation' : 'negative_correlation',
        title: `${correlation.type === 'positive' ? 'Positive' : 'Negative'} connection with ${otherHabit.name}`,
        description: `There's a ${correlation.strength}% ${correlation.type} correlation between this habit and ${otherHabit.name}.`,
        actionable: true,
        action: correlation.type === 'positive' 
          ? `Try stacking these habits together to boost your success rate.`
          : `Be mindful that ${otherHabit.name} might be competing with this habit. Consider scheduling them on different days.`
      });
    });
  }
  
  // If consistency is very high, provide a progression challenge
  const consistencyScore = calculateConsistencyScore(
    habit.checkIns, 
    habit.trackingType, 
    habit.targetValue, 
    habit.steps
  );
  
  if (consistencyScore > 80) {
    if (habit.trackingType === 'numeric') {
      const newTarget = Math.round(habit.targetValue * 1.1); // 10% increase
      recommendations.push({
        type: 'progress_challenge',
        title: 'Ready for a challenge?',
        description: `You're consistently hitting your target of ${habit.targetValue} ${habit.unit}. Time to level up!`,
        actionable: true,
        action: `Consider increasing your daily target to ${newTarget} ${habit.unit} to keep growing.`
      });
    } else if (habit.trackingType === 'binary' && consistencyScore > 90) {
      recommendations.push({
        type: 'progress_challenge',
        title: 'Ready for more?',
        description: `You've mastered this habit with ${consistencyScore}% consistency. Great work!`,
        actionable: true,
        action: 'Consider making this habit more challenging or building upon it with a related habit.'
      });
    }
  }
  
  return {
    has_enough_data: true,
    consistency_score: consistencyScore,
    risk_level: stickingPoints.riskLevel,
    message: stickingPoints.riskLevel === 'high' 
      ? "This habit needs attention. Here are some ways to improve your consistency."
      : consistencyScore > 70 
        ? "You're doing great with this habit! Here are some insights to help you maintain your success."
        : "Here are some insights to help you build more consistency with this habit.",
    recommendations: recommendations.slice(0, 3) // Limit to top 3 recommendations
  };
}
