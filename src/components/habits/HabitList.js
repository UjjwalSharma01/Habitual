'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HabitItem from './HabitItem';

export default function HabitList({ habits }) {
  const router = useRouter();
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [trackingFilter, setTrackingFilter] = useState('all'); // all, binary, numeric, progress

  // Apply both status and tracking type filters
  const filteredHabits = habits.filter(habit => {
    // Filter by active status
    const matchesStatus = 
      filter === 'all' || 
      (filter === 'active' && habit.active) || 
      (filter === 'completed' && !habit.active);
      
    // Filter by tracking type
    const matchesTrackingType = 
      trackingFilter === 'all' || 
      (habit.trackingType === trackingFilter);
      
    return matchesStatus && matchesTrackingType;
  });

  return (
    <div>
      <div className="border-b border-border">
        <nav className="flex -mb-px">
          <button
            onClick={() => setFilter('all')}
            className={`w-1/3 py-2 sm:py-4 px-1 text-center border-b-2 font-medium text-xs sm:text-sm ${
              filter === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            All Habits
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`w-1/3 py-2 sm:py-4 px-1 text-center border-b-2 font-medium text-xs sm:text-sm ${
              filter === 'active'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`w-1/3 py-2 sm:py-4 px-1 text-center border-b-2 font-medium text-xs sm:text-sm ${
              filter === 'completed'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Completed
          </button>
        </nav>
      </div>
      
      {/* Tracking type filter */}
      <div className="py-2 sm:py-3 px-3 sm:px-4 flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end border-b border-border">
        <div className="w-full sm:w-auto order-2 sm:order-none mt-2 sm:mt-0">
          <div className="flex flex-wrap sm:flex-nowrap items-center">
            <span className="text-xs sm:text-sm text-muted-foreground mr-2 whitespace-nowrap mb-1 sm:mb-0">Tracking Type:</span>
            <select
              value={trackingFilter}
              onChange={(e) => setTrackingFilter(e.target.value)}
              className="w-full sm:w-auto text-xs sm:text-sm border-border bg-background text-foreground rounded-md px-2 py-1 focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="binary">Yes/No</option>
              <option value="numeric">Numeric</option>
              <option value="progress">Progress Steps</option>
            </select>
          </div>
        </div>
        
        <p className="text-xs sm:text-sm text-muted-foreground order-1 sm:order-none">
          {filteredHabits.length} {filteredHabits.length === 1 ? 'habit' : 'habits'} found
        </p>
      </div>

      <ul className="divide-y divide-border">
        {filteredHabits.map(habit => (
          <HabitItem key={habit.id} habit={habit} />
        ))}
        {filteredHabits.length === 0 && (
          <li className="py-8 text-center text-muted-foreground">
            No habits match your filter.
          </li>
        )}
      </ul>
    </div>
  );
}
