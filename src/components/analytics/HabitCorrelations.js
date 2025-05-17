'use client';

import { useState, useEffect } from 'react';
import { findHabitCorrelations } from '@/utils/analyticsUtils';

export default function HabitCorrelations({ habits }) {
  const [correlations, setCorrelations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!habits || habits.length < 2) {
      setCorrelations([]);
      setLoading(false);
      return;
    }
    
    // Calculate correlations between habits
    const habitCorrelations = findHabitCorrelations(habits);
    setCorrelations(habitCorrelations);
    setLoading(false);
  }, [habits]);

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-muted rounded w-full mb-2"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    );
  }
  
  if (correlations.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-primary mb-2">Habit Connections</h3>
        <div className="flex items-center p-4 border rounded-lg bg-muted/30 border-border">
          <div className="mr-3 text-2xl">🔄</div>
          <div>
            <p className="text-sm font-medium">No connections found</p>
            <p className="text-xs text-muted-foreground">
              Keep tracking multiple habits to discover how they influence each other.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-primary mb-4">Habit Connections</h3>
      
      <div className="space-y-3 sm:space-y-4">
        {correlations.slice(0, 5).map((correlation, index) => (
          <div key={index} className="rounded-lg border border-border p-3 sm:p-4 transition-all hover:border-primary/50">
            <div className="flex items-center mb-2">
              <div className="text-xl mr-3">
                {correlation.type === 'positive' ? '🔗' : '⚖️'}
              </div>
              <h4 className="text-sm sm:text-base font-medium">
                {correlation.habit1.name} + {correlation.habit2.name}
              </h4>
            </div>
            
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Connection strength</span>
                <span className="font-medium">{correlation.strength}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${correlation.type === 'positive' ? 'bg-green-500' : 'bg-amber-500'}`}
                  style={{ width: `${correlation.strength}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                {correlation.type === 'positive' 
                  ? `These habits positively reinforce each other. Completing one increases your chances of completing the other.`
                  : `These habits may compete for your time and energy. Completing one may decrease your chances of completing the other.`
                }
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
