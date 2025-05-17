'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Create a simple charts visual
function AnalyticsVisual() {
  return (
    <div className="p-4 bg-card-background rounded-xl border border-border shadow-sm">
      <div className="mb-4">
        <div className="text-lg font-medium text-foreground mb-2">Habit Completion Rate</div>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-foreground">Morning Workout</div>
            <div className="text-sm font-medium text-primary">78%</div>
          </div>
          <div className="mt-2 h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-foreground">Meditation</div>
            <div className="text-sm font-medium text-primary">92%</div>
          </div>
          <div className="mt-2 h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-foreground">Reading</div>
            <div className="text-sm font-medium text-primary">65%</div>
          </div>
          <div className="mt-2 h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-foreground">Water Intake</div>
            <div className="text-sm font-medium text-primary">88%</div>
          </div>
          <div className="mt-2 h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VisualSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl lg:text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-primary">Visualize</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Beautiful insights to keep you motivated
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Track your habits with interactive visualizations that show your progress over time.
            See your streaks grow and understand your patterns with our intuitive analytics.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 mx-auto max-w-4xl"
        >
          <div className="relative">
            <AnalyticsVisual />

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 -right-4 -bottom-4 -z-10 bg-gradient-to-r from-accent/50 to-accent/5 blur-xl opacity-50 rounded-xl"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
