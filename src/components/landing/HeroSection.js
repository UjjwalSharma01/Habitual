'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroSection({ user }) {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.1),rgba(255,255,255,0))]"></div>
      <div className="hidden sm:block absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-card-background shadow-xl shadow-primary/10 ring-1 ring-border sm:mr-28 lg:mr-0 lg:right-full lg:-translate-x-1/2 lg:skew-x-0"></div>
      <div className="sm:hidden absolute inset-y-0 inset-x-0 -z-10 bg-card-background/50 shadow-xl shadow-primary/10 ring-1 ring-border"></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
          <motion.div 
            className="flex max-w-full overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="relative flex items-center gap-x-2 sm:gap-x-4 rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm leading-6 text-foreground border border-border bg-card-background shadow-sm">
              <span className="font-semibold text-primary shrink-0">New</span>
              <span className="h-4 w-px bg-border" aria-hidden="true"></span>
              <a href="#features" className="flex items-center gap-x-1 group truncate">
                <span className="truncate">Just launched: AI habit insights</span>
                <svg className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" viewBox="0 0 16 16" fill="none">
                  <path d="M6 13L10 8L6 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </motion.div>
          <h1 className="mt-6 sm:mt-10 max-w-lg text-3xl sm:text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Transform Your Life, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">One Habit at a Time</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-foreground">
            Elevate your daily routine with personalized habit tracking that delivers real results and meaningful transformation.
          </p>
          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-x-6">
            {!user ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Link 
                    href="/auth/register" 
                    className="group relative inline-flex h-12 w-full sm:w-auto items-center justify-center overflow-hidden rounded-full bg-primary px-6 sm:px-8 py-2 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                  >
                    <span className="relative flex items-center gap-2">
                      <span className="sm:hidden">Get Started</span>
                      <span className="hidden sm:inline">Begin Your Journey</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                    </span>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="w-full sm:w-auto"
                >
                  <Link href="/auth/login" className="group relative inline-flex h-12 w-full sm:w-auto items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-transparent px-6 py-2 text-sm font-medium text-foreground transition-all hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
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
                className="w-full sm:w-auto"
              >
                <Link 
                  href="/dashboard" 
                  className="group relative inline-flex h-12 w-full sm:w-auto items-center justify-center overflow-hidden rounded-full bg-primary px-6 sm:px-8 py-2 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                >
                  <span className="relative flex items-center gap-2">
                    Go to Dashboard
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                  </span>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0"
        >
          <div className="relative mx-auto w-[22rem] max-w-full overflow-hidden rounded-xl border border-border bg-card-background p-5 shadow-2xl sm:w-[28rem] backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"></div>
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border"></div>
            
            {/* App header with Habitual branding */}
            <div className="relative flex justify-between items-center p-2 mb-6 rounded-md bg-card-background shadow-sm border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">H</div>
                <div className="text-sm font-semibold text-foreground">Habitual</div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </div>
              </div>
            </div>
            
            <div className="relative space-y-4">
              <div className="px-2">
                <h4 className="text-sm font-medium text-foreground mb-3">Your Progress</h4>
                <motion.div 
                  className="grid grid-cols-7 gap-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.02
                      }
                    }
                  }}
                >
                  {[...Array(28)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      className={`h-8 w-8 rounded-md flex items-center justify-center text-xs font-medium ${
                        i % 8 === 0 || i % 7 === 0 || i % 5 === 0 
                          ? 'bg-primary text-primary-foreground' 
                          : i % 3 === 0 
                            ? 'bg-primary/30 text-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}
                      variants={{
                        hidden: { scale: 0.8, opacity: 0 },
                        visible: { scale: 1, opacity: 1 }
                      }}
                    >
                      {i + 1}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              
              <div className="mt-4 space-y-3 p-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-foreground">Current streak</div>
                  <div className="text-sm font-bold text-primary">14 days</div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                  ></motion.div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div>Progress to next milestone</div>
                  <div>65%</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
