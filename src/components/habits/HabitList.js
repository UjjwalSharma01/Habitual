'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HabitItem from './HabitItem';

export default function HabitList({ habits }) {
  const router = useRouter();
  const [filter, setFilter] = useState('all'); // all, active, completed

  const filteredHabits = habits.filter(habit => {
    if (filter === 'all') return true;
    if (filter === 'active') return habit.active;
    if (filter === 'completed') return !habit.active;
    return true;
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
