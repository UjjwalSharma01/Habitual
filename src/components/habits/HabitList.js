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
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setFilter('all')}
            className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Habits
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              filter === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              filter === 'completed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Completed
          </button>
        </nav>
      </div>

      <ul className="divide-y divide-gray-200">
        {filteredHabits.map(habit => (
          <HabitItem key={habit.id} habit={habit} />
        ))}
        {filteredHabits.length === 0 && (
          <li className="py-8 text-center text-gray-500">
            No habits match your filter.
          </li>
        )}
      </ul>
    </div>
  );
}
