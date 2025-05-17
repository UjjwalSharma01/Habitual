'use client';

import { useState, useEffect } from 'react';
import { 
  analyzeTimePerformance, 
  predictStickingPoints 
} from '@/utils/analyticsUtils';

export default function HabitCoaching({ habit }) {
  const [coachingTips, setCoachingTips] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!habit) {
      setLoading(false);
      return;
    }
    
    // Generate coaching tips based on habit data
    const generateCoachingTips = () => {
      if (!habit.checkIns || Object.keys(habit.checkIns).length < 5) {
        setCoachingTips({
          hasEnoughData: false,
          message: "Keep tracking this habit to receive personalized coaching tips."
        });
        setLoading(false);
        return;
      }
      
      // Analyze time performance
      const timeAnalysis = analyzeTimePerformance(habit.checkIns);
      
      // Predict sticking points
      const stickingPoints = predictStickingPoints(
        habit.checkIns, 
        habit.trackingType, 
        habit.targetValue
      );
      
      // Generate customized coaching tips based on the analyses
      const tips = [];
      
      // Add optimal time tip
      if (timeAnalysis.recommendedTime) {
        tips.push({
          type: 'timing',
          title: 'Optimal Timing',
          tip: `Try completing this habit during the ${timeAnalysis.recommendedTime} when you're ${timeAnalysis.bestPeriod?.rate || timeAnalysis.bestHour?.rate}% more likely to succeed.`
        });
      }
      
      // Add tips for challenging days
      if (stickingPoints.likelyFailureDays && stickingPoints.likelyFailureDays.length > 0) {
        const weakDay = stickingPoints.likelyFailureDays[0];
        tips.push({
          type: 'schedule',
          title: 'Challenging Day Strategy',
          tip: `${weakDay.name}s are your most difficult day (${weakDay.completionRate}% completion). Try setting a specific time or create a special reminder for this day.`
        });
      }
      
      // Add streak management tip
      if (stickingPoints.commonBreakPoint) {
        tips.push({
          type: 'streak',
          title: 'Streak Management',
          tip: `You tend to break your streak after ${stickingPoints.commonBreakPoint} days. When you reach this point, give yourself an extra reward or motivation boost.`
        });
      }
      
      // Add consistency tip based on average streak length
      if (stickingPoints.averageStreakLength < 3) {
        tips.push({
          type: 'consistency',
          title: 'Building Consistency',
          tip: 'Focus on completing this habit for just 3 days in a row to build momentum. Small wins add up to long-term success.'
        });
      }
      
      // Add tips based on habit type
      if (habit.trackingType === 'numeric') {
        tips.push({
          type: 'tracking',
          title: 'Progress Focus',
          tip: `Even if you don't hit your target of ${habit.targetValue} ${habit.unit}, track any progress you make. Partial completion is better than skipping entirely.`
        });
      } else if (habit.trackingType === 'progress' && habit.steps && habit.steps.length > 0) {
        tips.push({
          type: 'steps',
          title: 'Step by Step',
          tip: `If you can't complete all steps, focus on finishing at least one. Any progress builds the neural pathways that make this habit stick.`
        });
      }
      
      setCoachingTips({
        hasEnoughData: true,
        riskLevel: stickingPoints.riskLevel,
        tips: tips
      });
      setLoading(false);
    };
    
    generateCoachingTips();
  }, [habit]);
  
  if (loading || !habit) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-5 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-16 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!coachingTips?.hasEnoughData) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-4">
        <h3 className="text-base font-semibold mb-2">Habit Coaching</h3>
        <div className="p-3 border rounded-md bg-muted/30">
          <div className="flex items-center">
            <div className="text-2xl mr-3">👨‍🏫</div>
            <p className="text-sm text-muted-foreground">
              {coachingTips?.message || "Track this habit for at least 5 days to receive personalized coaching."}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Function to get icon for tip type
  const getTipIcon = (type) => {
    switch (type) {
      case 'timing': return '⏰';
      case 'schedule': return '📅';
      case 'streak': return '🔥';
      case 'consistency': return '📈';
      case 'tracking': return '📊';
      case 'steps': return '📝';
      default: return '💡';
    }
  };
  
  return (
    <div className="bg-card rounded-lg shadow-sm p-4">
      <h3 className="text-base font-semibold mb-3">Habit Coaching</h3>
      
      <div className="space-y-3">
        {coachingTips.tips.slice(0, 3).map((tip, index) => (
          <div key={index} className="p-3 rounded-md bg-muted/30 border">
            <div className="flex items-start">
              <div className="text-xl mr-3">{getTipIcon(tip.type)}</div>
              <div>
                <h4 className="text-sm font-medium">{tip.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{tip.tip}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
