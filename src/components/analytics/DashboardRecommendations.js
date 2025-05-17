'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  calculateConsistencyScore, 
  predictStickingPoints,
  generateHabitRecommendations 
} from '@/utils/analyticsUtils';

export default function DashboardRecommendations({ habits }) {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!habits || habits.length === 0) {
      setLoading(false);
      return;
    }
    
    // Process all habits and generate recommendations
    const processHabits = () => {
      // Calculate insights for each habit that has enough data
      const allRecommendations = [];
      
      habits.forEach(habit => {
        if (!habit.checkIns || Object.keys(habit.checkIns).length < 5) return;
        
        const habitInsights = generateHabitRecommendations(habit, habits);
        
        if (habitInsights.has_enough_data && habitInsights.recommendations.length > 0) {
          // Take only the top recommendation for each habit
          allRecommendations.push({
            habitId: habit.id,
            habitName: habit.name,
            recommendation: habitInsights.recommendations[0],
            consistencyScore: habitInsights.consistency_score,
            riskLevel: habitInsights.risk_level
          });
        }
      });
      
      // Sort recommendations - prioritize high risk habits first, then low consistency
      allRecommendations.sort((a, b) => {
        // First by risk level
        const riskOrder = { high: 0, medium: 1, low: 2, unknown: 3 };
        const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        if (riskDiff !== 0) return riskDiff;
        
        // Then by consistency score (ascending - lower consistency first)
        return a.consistencyScore - b.consistencyScore;
      });
      
      setRecommendations(allRecommendations.slice(0, 3)); // Show top 3 recommendations
      setLoading(false);
    };
    
    processHabits();
  }, [habits]);
  
  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-5 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  if (recommendations.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-4">
        <h3 className="font-medium text-base mb-2">Personalized Insights</h3>
        <div className="p-4 text-center border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Keep tracking your habits to receive personalized recommendations.
          </p>
          <button
            onClick={() => router.push('/analytics')}
            className="mt-3 inline-flex items-center justify-center px-3 py-1.5 text-xs sm:text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20"
          >
            View Analytics
          </button>
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
  
  return (
    <div className="bg-card rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-base">Personalized Insights</h3>
        <button
          onClick={() => router.push('/analytics')}
          className="text-xs sm:text-sm text-primary hover:underline"
        >
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div 
            key={index}
            onClick={() => router.push(`/habits/${rec.habitId}`)}
            className="flex items-start p-3 rounded-lg border border-border bg-card-background hover:border-primary/50 cursor-pointer transition-colors"
          >
            <div className="text-xl sm:text-2xl mr-3">
              {getEmojiForType(rec.recommendation.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium">{rec.habitName}</h4>
                {rec.riskLevel === 'high' && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Attention
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{rec.recommendation.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
