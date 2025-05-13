'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import PrimaryGoalStep from '@/components/onboarding/PrimaryGoalStep';
import LifestyleStep from '@/components/onboarding/LifestyleStep';
import IntroHabitStep from '@/components/onboarding/IntroHabitStep';
import FirstHabitStep from '@/components/onboarding/FirstHabitStep';
import AppLayout from '@/components/layout/AppLayout';

export default function Onboarding() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { onboardingState, loadingOnboarding } = useOnboarding();

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    // Redirect if onboarding is already completed
    if (!loadingOnboarding && user && onboardingState.completed) {
      router.push('/dashboard');
    }
  }, [user, loading, loadingOnboarding, onboardingState.completed, router]);

  // Show loading state
  if (loading || loadingOnboarding || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  // Render current step based on onboardingState.currentStep
  const renderStep = () => {
    switch (onboardingState.currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <PrimaryGoalStep />;
      case 2:
        return <LifestyleStep />;
      case 3:
        return <IntroHabitStep />;
      case 4:
        return <FirstHabitStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full">
            {/* Progress indicator */}
            {onboardingState.currentStep > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-blue-600 font-medium">
                    Step {onboardingState.currentStep} of 4
                  </div>
                  <div className="text-xs text-gray-500">
                    Personalizing your experience...
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${(onboardingState.currentStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Current step content */}
            <div className="bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-300">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
