'use client';

import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import StatsSection from '@/components/landing/StatsSection';
import VisualSection from '@/components/landing/VisualSection';
import QuotesSection from '@/components/landing/QuotesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';

export default function Home() {
  const { user } = useAuth();
  
  return (
    <AppLayout>
      <div className="overflow-hidden">
        <HeroSection user={user} />
        <FeaturesSection />
        <StatsSection />
        <VisualSection />
        <QuotesSection />
        <TestimonialsSection />
        <CTASection user={user} />
      </div>
    </AppLayout>
  );
}
