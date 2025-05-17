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
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Your Daily Lifestyle</h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Understanding your routine helps us find the best spots for your new habits.
          </p>
        </div>

        <div className="bg-accent p-5 rounded-lg border border-accent-border">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-foreground">
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
            <label htmlFor="dailyRoutine" className="block text-sm font-medium text-foreground">
              Tell us about your typical day <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <motion.textarea
                whileFocus={{ boxShadow: "0 0 0 3px rgba(var(--primary), 0.3)" }}
                rows={5}
                name="dailyRoutine"
                id="dailyRoutine"
                value={formData.dailyRoutine}
                onChange={handleChange}
                className="shadow-sm block w-full sm:text-sm border-border rounded-md focus:ring-primary focus:border-primary transition-shadow bg-background text-foreground"
                placeholder="For example: I wake up at 7am, work from 9-5, go to the gym three times a week in the evenings, and usually relax or see friends on weekends..."
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                This helps us understand when new habits might fit into your existing routines.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="preferredTimes" className="block text-sm font-medium text-foreground">
              Any specific times you prefer for new activities, or times to avoid? (Optional)
            </label>
            <div className="mt-2">
              <motion.textarea
                whileFocus={{ boxShadow: "0 0 0 3px rgba(var(--primary), 0.3)" }}
                rows={3}
                name="preferredTimes"
                id="preferredTimes"
                value={formData.preferredTimes}
                onChange={handleChange}
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-border rounded-md transition-shadow bg-background text-foreground"
                placeholder="For example: I'm a morning person, so I prefer to start new habits before 10am. I'm usually too tired after 8pm..."
              />
            </div>
          </div>
        </motion.div>

        <div className="flex justify-between pt-6">
          <button
            onClick={previousStep}
            className="inline-flex items-center px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isFormValid}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              isFormValid
                ? "bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                : "bg-primary/50 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}
