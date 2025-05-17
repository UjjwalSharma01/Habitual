'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function CTASection({ user }) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div className="relative isolate my-24 sm:my-32 overflow-hidden">
      {/* Background design elements */}
      <div className="absolute inset-0 -z-10">
        <div className="hidden sm:block absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-card-background shadow-xl shadow-primary/5 ring-1 ring-border sm:mr-28 lg:mr-0 lg:right-full lg:-translate-x-1/2 lg:skew-x-0"></div>
        <div className="sm:hidden absolute inset-y-0 inset-x-0 -z-10 bg-card-background/50 shadow-xl shadow-primary/5 ring-1 ring-border"></div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.12),rgba(255,255,255,0))]"></div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card-background shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary opacity-5 blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-primary opacity-5 blur-3xl"></div>
          
          <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Begin Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Transformation</span> Today
                </h2>
                <p className="mt-6 text-lg leading-8 text-foreground/80">
                  Join a community of people who are taking control of their habits and unlocking their full potential.
                  Experience the difference for yourself.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-10 flex items-center justify-center gap-x-6 flex-wrap"
              >
                {!user ? (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mb-4 sm:mb-0"
                    >
                      <Link
                        href="/auth/register"
                        className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-primary px-8 py-2 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                      >
                        <span className="relative flex items-center gap-2">
                          Start your journey
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                        </span>
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Link href="/auth/login" className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-transparent px-6 py-2 text-sm font-medium text-foreground transition-all hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
                        <span className="relative flex items-center gap-2">
                          Log in
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                        </span>
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/dashboard"
                      className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-primary px-8 py-2 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                    >
                      <span className="relative flex items-center gap-2">
                        Go to Dashboard
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                      </span>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
