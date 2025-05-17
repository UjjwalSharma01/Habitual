'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import HabitForm from '@/components/habits/HabitForm';
import { motion } from 'framer-motion';

export default function FirstHabitStep() {
  const router = useRouter();
  const { user } = useAuth();
  const { onboardingState, previousStep, completeOnboarding } = useOnboarding();
  const [submitting, setSubmitting] = useState(false);
  const [createdHabit, setCreatedHabit] = useState(null);
  const [error, setError] = useState('');

  // Handle habit form submission
  const handleCreateHabit = async (habitData) => {
    try {
      setSubmitting(true);
      setError('');

      // Add user suggestions based on onboarding data
      let habitSuggestion = '';
      if (onboardingState.data.preferredTimes) {
        habitSuggestion += `Based on your preferences, consider doing this ${onboardingState.data.preferredTimes.toLowerCase()}.`;
      }
      
      // Prepare the habit document
      const newHabit = {
        ...habitData,
        userId: user.uid,
        active: true,
        createdAt: new Date(),
        lastUpdated: new Date(),
        checkIns: {},
        aiSuggestion: habitSuggestion || null
      };

      // Add the document to Firestore
      const docRef = await addDoc(collection(db, 'habits'), newHabit);
      
      // Set the created habit with its ID
      setCreatedHabit({
        id: docRef.id,
        ...newHabit
      });
      
      setSubmitting(false);
    } catch (error) {
      console.error('Error adding habit:', error);
      setError('Failed to create habit. Please try again.');
      setSubmitting(false);
    }
  };

  // Handle adding another habit
  const handleAddAnother = () => {
    setCreatedHabit(null);
  };

  // Handle completing onboarding
  const handleComplete = async () => {
    await completeOnboarding();
  };

  return (
    <div className="px-6 py-6 sm:px-8 md:px-12">
      {!createdHabit ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Define Your First Habit</h2>
            <p className="mt-1 text-gray-500">
              Be specific about what you want to achieve and when.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <HabitForm 
            onSubmit={handleCreateHabit} 
            submitButtonText="Save My First Habit"
            showCancel={true}
            onCancel={previousStep}
          />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-8 space-y-8"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Habit Created Successfully! ✨
            </h2>
            <p className="text-xl text-gray-600 max-w-md mx-auto">
              You&apos;ve added <span className="font-semibold">{createdHabit.name}</span> to your habits.
            </p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 max-w-xl mx-auto">
            <h3 className="font-medium text-blue-800">What would you like to do next?</h3>
            <div className="mt-5 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAddAnother}
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-300 rounded-md shadow-sm text-base font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Another Habit
              </button>
              <button
                onClick={handleComplete}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete Onboarding
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
