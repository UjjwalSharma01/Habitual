'use client';

import { useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { motion } from 'framer-motion';

export default function WelcomeStep() {
  const { nextStep } = useOnboarding();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="px-6 py-16 sm:px-12 md:px-16 lg:px-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8"
      >
        <div className="mx-auto w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <motion.h1 
          className="text-4xl font-bold tracking-tight text-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Welcome to Habitual!
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Craft habits that truly fit <span className="text-blue-600 font-semibold">your</span> life.
          We&apos;ll help you integrate new habits into your existing routines for lasting success.
        </motion.p>
        
        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <button
            onClick={nextStep}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-8 py-4 text-lg font-medium text-white shadow-md transition duration-300 ease-out hover:shadow-xl"
          >
            <span className="relative z-10">Get Started</span>
            <span
              className={`absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 transition-transform duration-300 ease-in-out ${
                isHovered ? 'translate-y-0' : 'translate-y-full'
              }`}
            ></span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
