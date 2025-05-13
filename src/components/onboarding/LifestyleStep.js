'use client';

import { useState, useEffect } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { motion } from 'framer-motion';

export default function LifestyleStep() {
  const { onboardingState, updateOnboardingData, nextStep, previousStep } = useOnboarding();
  const [formData, setFormData] = useState({
    dailyRoutine: onboardingState.data.dailyRoutine || '',
    preferredTimes: onboardingState.data.preferredTimes || ''
  });
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(!!formData.dailyRoutine);
  }, [formData.dailyRoutine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = async () => {
    if (isFormValid) {
      await updateOnboardingData({
        dailyRoutine: formData.dailyRoutine,
        preferredTimes: formData.preferredTimes
      });
      nextStep();
    }
  };

  return (
    <div className="px-6 py-10 sm:px-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Your Daily Lifestyle</h2>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Understanding your routine helps us find the best spots for your new habits.
          </p>
        </div>

        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-blue-700">
              Your answers help us suggest habit integrations that feel natural in your day-to-day life.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-6"
        >
          <div>
            <label htmlFor="dailyRoutine" className="block text-sm font-medium text-gray-700">
              Tell us about your typical day <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <motion.textarea
                whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
                rows={5}
                name="dailyRoutine"
                id="dailyRoutine"
                value={formData.dailyRoutine}
                onChange={handleChange}
                className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="For example: I wake up at 7am, work from 9-5, go to the gym three times a week in the evenings, and usually relax or see friends on weekends..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This helps us understand when new habits might fit into your existing routines.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="preferredTimes" className="block text-sm font-medium text-gray-700">
              Any specific times you prefer for new activities, or times to avoid? (Optional)
            </label>
            <div className="mt-2">
              <motion.textarea
                whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" }}
                rows={3}
                name="preferredTimes"
                id="preferredTimes"
                value={formData.preferredTimes}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md transition-shadow"
                placeholder="For example: I'm a morning person, so I prefer to start new habits before 10am. I'm usually too tired after 8pm..."
              />
            </div>
          </div>
        </motion.div>

        <div className="flex justify-between pt-6">
          <button
            onClick={previousStep}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isFormValid}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              isFormValid
                ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}
