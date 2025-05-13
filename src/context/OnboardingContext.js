'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

const OnboardingContext = createContext({});

export const useOnboarding = () => useContext(OnboardingContext);

export const OnboardingProvider = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [onboardingState, setOnboardingState] = useState({
    completed: false,
    currentStep: 0,
    data: {
      primaryGoal: '',
      dailyRoutine: '',
      preferredTimes: '',
    }
  });
  const [loadingOnboarding, setLoadingOnboarding] = useState(true);

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setOnboardingState(prevState => ({
            ...prevState,
            completed: userData.onboardingCompleted || false,
            data: userData.onboardingData || prevState.data
          }));
        } else {
          // Create user document if it doesn't exist
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            onboardingCompleted: false,
            onboardingData: {},
            createdAt: new Date()
          });
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setLoadingOnboarding(false);
      }
    };

    if (user && !loading) {
      checkOnboardingStatus();
    } else if (!loading) {
      setLoadingOnboarding(false);
    }
  }, [user, loading]);

  // Update onboarding data
  const updateOnboardingData = async (data) => {
    if (!user) return;

    try {
      setOnboardingState(prevState => ({
        ...prevState,
        data: { ...prevState.data, ...data }
      }));

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        onboardingData: { ...onboardingState.data, ...data }
      }, { merge: true });
    } catch (error) {
      console.error("Error updating onboarding data:", error);
    }
  };

  // Mark onboarding as complete
  const completeOnboarding = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        onboardingCompleted: true
      }, { merge: true });

      setOnboardingState(prevState => ({
        ...prevState,
        completed: true
      }));
      
      router.push('/onboarding/success');
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  // Navigate to next onboarding step
  const nextStep = () => {
    setOnboardingState(prevState => ({
      ...prevState,
      currentStep: prevState.currentStep + 1
    }));
  };

  // Navigate to previous onboarding step
  const previousStep = () => {
    setOnboardingState(prevState => ({
      ...prevState,
      currentStep: Math.max(0, prevState.currentStep - 1)
    }));
  };

  return (
    <OnboardingContext.Provider value={{
      onboardingState,
      loadingOnboarding,
      updateOnboardingData,
      completeOnboarding,
      nextStep,
      previousStep
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
