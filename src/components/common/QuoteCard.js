'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

// Mock quotes until we integrate with Gemini API
const MOCK_QUOTES = [
  {
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    text: "The habit of persistence is the habit of victory.",
    author: "Herbert Kaufman"
  },
  {
    text: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun"
  }
];

export default function QuoteCard() {
  const { user } = useAuth();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch a quote from Gemini API
    // For now, we'll use mock quotes
    const fetchQuote = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual Gemini API call
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Randomly select a quote from our mock data
        const randomIndex = Math.floor(Math.random() * MOCK_QUOTES.length);
        setQuote(MOCK_QUOTES[randomIndex]);
      } catch (error) {
        console.error('Error fetching quote:', error);
        // Fallback to a default quote
        setQuote({
          text: "The best way to predict your future is to create it.",
          author: "Abraham Lincoln"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  if (loading) {
    return (
      <div className="shadow overflow-hidden rounded-lg bg-card-background">
        <div className="px-3 py-4 sm:px-4 sm:py-5">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 rounded w-3/4 bg-muted"></div>
              <div className="h-4 rounded w-1/2 bg-muted"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow overflow-hidden rounded-lg">
      <div className="px-3 py-4 sm:px-5 sm:py-6 text-white">
        <div className="flex items-start">
          <svg className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 flex-shrink-0 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div>
            <p className="text-base sm:text-xl font-medium">{quote?.text}</p>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm opacity-90">— {quote?.author}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
