'use client';

import { useState, useEffect } from 'react';
import { 
  calculateConsistencyScore,
  getDayOfWeekPatterns,
  predictStickingPoints
} from '@/utils/analyticsUtils';
import AIInsights from '@/components/analytics/AIInsights';

export default function InsightsDashboard({ habits, selectedHabit }) {
  const [insights, setInsights] = useState({
    topPerforming: [],
    needsAttention: [],
    recentProgress: [],
    weekdayStats: [0, 0, 0, 0, 0, 0, 0]
  });
  
  useEffect(() => {
    if (!habits || habits.length === 0) return;
    
    const calculateAllInsights = () => {
      // Calculate consistency scores for all habits
      const habitsWithScores = habits.map(habit => {
        const score = calculateConsistencyScore(
          habit.checkIns,
          habit.trackingType,
          habit.targetValue,
          habit.steps
        );
        
        const riskAssessment = predictStickingPoints(
          habit.checkIns,
          habit.trackingType,
          habit.targetValue
        );
        
        return {
          ...habit,
          consistencyScore: score,
          riskLevel: riskAssessment.riskLevel
        };
      });
      
      // Find top performing habits
      const topPerforming = [...habitsWithScores]
        .filter(h => h.consistencyScore >= 70)
        .sort((a, b) => b.consistencyScore - a.consistencyScore)
        .slice(0, 3);
      
      // Find habits that need attention
      const needsAttention = [...habitsWithScores]
        .filter(h => h.riskLevel === 'high' || h.consistencyScore < 40)
        .sort((a, b) => a.consistencyScore - b.consistencyScore)
        .slice(0, 3);
      
      // Calculate recent progress
      const now = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(now.getDate() - 14);
      
      const recentProgress = habitsWithScores.map(habit => {
        // Calculate completions for current and previous weeks
        let currentWeekCompletions = 0;
        let previousWeekCompletions = 0;
        
        if (habit.checkIns) {
          Object.entries(habit.checkIns).forEach(([date, value]) => {
            const checkInDate = new Date(date);
            let isCompleted = false;
            
            if (habit.trackingType === 'binary') {
              isCompleted = value === true;
            } else if (habit.trackingType === 'numeric') {
              isCompleted = value?.value >= habit.targetValue;
            } else if (habit.trackingType === 'progress') {
              isCompleted = value?.completed;
            }
            
            if (isCompleted) {
              if (checkInDate >= oneWeekAgo && checkInDate <= now) {
                currentWeekCompletions++;
              } else if (checkInDate >= twoWeeksAgo && checkInDate < oneWeekAgo) {
                previousWeekCompletions++;
              }
            }
          });
        }
        
        // Calculate change percentage
        let changePercentage = 0;
        if (previousWeekCompletions > 0) {
          changePercentage = Math.round(
            ((currentWeekCompletions - previousWeekCompletions) / previousWeekCompletions) * 100
          );
        } else if (currentWeekCompletions > 0) {
          changePercentage = 100; // If previous week had 0, but current week has completions
        }
        
        return {
          ...habit,
          currentWeekCompletions,
          previousWeekCompletions,
          changePercentage
        };
      }).sort((a, b) => b.changePercentage - a.changePercentage);
      
      // Calculate overall weekday statistics
      let weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
      let weekdayTotals = [0, 0, 0, 0, 0, 0, 0];
      
      habits.forEach(habit => {
        const dayPatterns = getDayOfWeekPatterns(
          habit.checkIns,
          habit.trackingType,
          habit.targetValue
        );
        
        // Aggregate patterns across habits
        dayPatterns.forEach((rate, day) => {
          weekdayCounts[day]++;
          weekdayTotals[day] += rate;
        });
      });
      
      const weekdayStats = weekdayCounts.map((count, index) =>
        count > 0 ? Math.round(weekdayTotals[index] / count) : 0
      );
      
      setInsights({
        topPerforming,
        needsAttention,
        recentProgress,
        weekdayStats
      });
    };
    
    calculateAllInsights();
  }, [habits]);
  
  // If there are no habits or they're still loading
  if (!habits || habits.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-muted rounded w-full mb-2"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    );
  }
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <div>
      {/* Overall stats section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg shadow-sm p-4">
          <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-1">Active Habits</h3>
          <p className="text-2xl font-bold">{habits.filter(h => h.active).length}</p>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-4">
          <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-1">Total Completions</h3>
          <p className="text-2xl font-bold">
            {habits.reduce((total, habit) => {
              if (!habit.checkIns) return total;
              
              return total + Object.entries(habit.checkIns).filter(([date, value]) => {
                if (habit.trackingType === 'binary') return value === true;
                if (habit.trackingType === 'numeric') return value?.value >= habit.targetValue;
                if (habit.trackingType === 'progress') return value?.completed;
                return false;
              }).length;
            }, 0)}
          </p>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-4">
          <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-1">Avg. Consistency</h3>
          <p className="text-2xl font-bold">
            {Math.round(
              habits.reduce((sum, h) => sum + (h.consistencyScore || 0), 0) / 
              Math.max(1, habits.length)
            )}%
          </p>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-4">
          <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-1">Best Day</h3>
          <p className="text-2xl font-bold">
            {dayNames[insights.weekdayStats.indexOf(Math.max(...insights.weekdayStats))]}
          </p>
        </div>
      </div>
      
      {selectedHabit === 'all' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top performing habits section */}
          <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-primary mb-4">Top Performing</h3>
            {insights.topPerforming.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {insights.topPerforming.map(habit => (
                  <div key={habit.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {habit.consistencyScore}% consistency
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-lg">🏆</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6">
                <p className="text-muted-foreground">No top performers yet</p>
              </div>
            )}
          </div>
          
          {/* Habits needing attention section */}
          <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-primary mb-4">Needs Attention</h3>
            {insights.needsAttention.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {insights.needsAttention.map(habit => (
                  <div key={habit.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {habit.consistencyScore}% consistency
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-lg">⚠️</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6">
                <p className="text-muted-foreground">All habits are on track!</p>
              </div>
            )}
          </div>
          
          {/* Weekly performance by day */}
          <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-primary mb-4">Weekly Pattern</h3>
            <div className="space-y-3">
              {dayNames.map((day, index) => (
                <div key={day} className="space-y-1">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>{day}</span>
                    <span className="font-medium">{insights.weekdayStats[index]}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div 
                      className="bg-primary h-1.5 sm:h-2 rounded-full"
                      style={{ width: `${insights.weekdayStats[index]}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent progress section */}
          <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-primary mb-4">Recent Progress</h3>
            {insights.recentProgress.slice(0, 3).map(habit => (
              <div key={habit.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 mb-3">
                <div>
                  <div className="font-medium">{habit.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {habit.currentWeekCompletions} completions this week
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  habit.changePercentage > 0 ? 'bg-green-100 text-green-800' : 
                  habit.changePercentage < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {habit.changePercentage > 0 ? '+' : ''}{habit.changePercentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Individual habit insights
        <div>
          <AIInsights 
            habit={habits.find(h => h.id === selectedHabit)} 
            allHabits={habits} 
          />
        </div>
      )}
    </div>
  );
}
