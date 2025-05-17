'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, BarChart3, LineChart, Quote, Trophy, Clock } from 'lucide-react';

const benefits = [
  {
    name: 'Build Lasting Habits That Stick',
    description: 'Develop routines that become second nature, making positive changes permanent parts of your lifestyle.',
    icon: Calendar,
  },
  {
    name: 'See Your Progress in Real Time',
    description: 'Experience the motivation that comes from watching your consistency grow day by day, week by week.',
    icon: BarChart3,
  },
  {
    name: 'Stay Motivated When It Matters Most',
    description: 'Receive AI-tailored encouragement precisely when you need it, helping you push through challenging moments.',
    icon: Quote,
  },
  {
    name: 'Understand What Works For You',
    description: 'Discover your unique patterns and optimize your routine based on data that reflects your personal journey.',
    icon: LineChart,
  },
  {
    name: 'Celebrate Every Win, Big or Small',
    description: 'Feel the satisfaction of achievement with a system designed to acknowledge and reward your progress.',
    icon: Trophy,
  },
  {
    name: 'Balance Life Without Missing a Beat',
    description: 'Find harmony in your daily routine with a system that adapts to your changing life priorities and schedule.',
    icon: Clock,
  },
];

function Benefit({ benefit, index }) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative rounded-2xl border border-border bg-card-background p-6 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1"
      whileHover={{ scale: 1.02 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-accent mb-6 group-hover:bg-primary/10 transition-colors">
          <benefit.icon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold leading-8 tracking-tight text-foreground">{benefit.name}</h3>
        <p className="mt-2 text-base leading-7 text-muted-foreground">{benefit.description}</p>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="py-24 sm:py-32 relative" id="features">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.05),rgba(255,255,255,0))]"></div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative inline-block"
          >
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-blue-400 opacity-30 blur-md"></div>
            <h2 className="relative text-base font-semibold leading-7 text-primary px-4 py-1.5 bg-accent border border-accent-border rounded-full">Life-Changing Benefits</h2>
          </motion.div>
          <p className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Transform Your Daily Life with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Powerful Routines</span>
          </p>
          <p className="mt-6 text-lg leading-8 text-foreground">
            Discover how Habitual can help you unlock your potential and achieve your goals through simple, 
            consistent actions that compound into remarkable results.
          </p>
        </motion.div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
          <div className="grid gap-x-8 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Benefit key={benefit.name} benefit={benefit} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
