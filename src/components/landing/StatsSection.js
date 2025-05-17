'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { TrendingUp, Users, Award, Calendar } from 'lucide-react';

const stats = [
  { name: 'Active users', value: '20,000+', icon: Users },
  { name: 'Habits created', value: '1.2M+', icon: Calendar },
  { name: 'Completion rate', value: '89%', icon: TrendingUp },
  { name: 'Achievement unlocked', value: '6.8M+', icon: Award },
];

export default function StatsSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div className="py-24 sm:py-32 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-accent/5 to-background"></div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl lg:max-w-4xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
            className="relative inline-block mb-2"
          >
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-blue-400 opacity-30 blur-md"></div>
            <h2 className="relative text-base font-semibold leading-7 text-primary px-4 py-1.5 bg-accent border border-accent-border rounded-full">Real Results</h2>
          </motion.div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Join a community of transformation
          </p>
          <p className="mt-6 text-lg leading-8 text-foreground">
            Thousands are already experiencing the power of consistent habits, backed by data that proves our approach works.
          </p>
        </motion.div>
        <div className="mx-auto mt-16 flex flex-col gap-8 sm:mt-20 lg:mx-0 lg:max-w-none">
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group flex flex-col rounded-xl bg-card-background border border-border p-8 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent mb-4 group-hover:bg-primary/10 transition-colors">
                    <stat.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col">
                    <dd className="text-4xl font-bold tracking-tight text-foreground mb-2">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.8, delay: index * 0.2 }}
                      >
                        {stat.value}
                      </motion.span>
                    </dd>
                    <dt className="text-base font-medium leading-6 text-foreground">{stat.name}</dt>
                  </div>
                </div>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

