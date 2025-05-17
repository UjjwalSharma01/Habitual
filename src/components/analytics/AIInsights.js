'use client';

import { useState, useEffect } from 'react';
import { generateHabitRecommendations } from '@/utils/analyticsUtils';

export default function AIInsights({ habit, allHabits }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!habit) {
      setLoading(false);
      return;
    }
    
    // Generate insights using our analytics utilities
    const recommendations = generateHabitRecommendations(habit, allHabits);
    setInsights(recommendations);
    setLoading(false);
  }, [habit, allHabits]);

  // If the component is still loading or there's no habit
  if (loading || !habit) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6 mt-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-muted rounded w-full mb-2"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    );
  }
  
  // If there's not enough data for insights
  if (!insights?.has_enough_data) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6 mt-4">
        <h3 className="text-base sm:text-lg font-semibold text-primary mb-2">AI Insights</h3>
        <div className="flex items-center p-4 border rounded-lg bg-muted/30 border-border">
          <div className="mr-3 text-2xl">🔍</div>
          <div>
            <p className="text-sm font-medium">Not enough data yet</p>
            <p className="text-xs text-muted-foreground">
              {insights?.message || "Keep tracking your habit for at least 5 days to get personalized insights."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Function to render emoji based on recommendation type
  const getEmojiForType = (type) => {
    switch (type) {
      case 'optimal_time': return '⏰';
      case 'weak_days': return '📅';
      case 'streak_insight': return '🔥';
      case 'positive_correlation': return '🔗';
      case 'negative_correlation': return '⚠️';
      case 'progress_challenge': return '🚀';
      default: return '💡';
    }
  };

  // Function to determine background color based on risk level
  const getRiskLevelClass = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-50 border-green-200 text-green-700';
      case 'medium': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'high': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-muted/30 border-border';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-primary">AI Insights</h3>
        <div className={`text-xs px-2 py-1 rounded-full ${getRiskLevelClass(insights.risk_level)}`}>
          {insights.risk_level === 'high' ? 'Needs attention' : 
           insights.risk_level === 'medium' ? 'Room for improvement' : 'On track'}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">{insights.message}</p>
      
      <div className="space-y-3 sm:space-y-4">
        {insights.recommendations.map((rec, index) => (
          <div key={index} className="rounded-lg border border-border p-3 sm:p-4 transition-all hover:border-primary/50">
            <div className="flex items-start">
              <div className="text-xl sm:text-2xl mr-3">{getEmojiForType(rec.type)}</div>
              <div>
                <h4 className="text-sm sm:text-base font-medium">{rec.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{rec.description}</p>
                {rec.actionable && (
                  <p className="text-xs sm:text-sm font-medium text-primary mt-2">{rec.action}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {insights.recommendations.length === 0 && (
        <div className="rounded-lg border border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">Keep tracking to unlock personalized recommendations!</p>
        </div>
      )}
    </div>
  );
}
