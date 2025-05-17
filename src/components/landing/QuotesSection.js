'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Quote, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

// Premium-looking quotes related to habits
const quotes = [
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    category: "Excellence"
  },
  {
    text: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun",
    category: "Persistence"
  },
  {
    text: "Habits are the compound interest of self-improvement.",
    author: "James Clear",
    category: "Growth"
  }
];

export default function QuotesSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  
  const [sampleData, setSampleData] = useState({});
  
  // Generate sample heatmap data
  useEffect(() => {
    const generateSampleData = () => {
      const data = {};
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      // Loop through each day of the past year
      for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Create patterns - higher values for weekends, occasional streaks
        const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
        const month = d.getMonth();
        const dayOfMonth = d.getDate();
        
        // Create some patterns in the data
        let value = 0;
        
        // Weekend pattern - higher values on weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          value = Math.floor(Math.random() * 3) + 1; // 1-3
        }
        
        // Monthly pattern - higher values at start of month
        if (dayOfMonth <= 5) {
          value = Math.max(value, Math.floor(Math.random() * 2) + 1); // 1-2
        }
        
        // Quarterly focus - higher values every 3 months
        if ((month % 3 === 0) && dayOfMonth <= 20) {
          value = Math.max(value, Math.floor(Math.random() * 4) + 1); // 1-4
        }
        
        // Random streaks for realistic look
        if (Math.random() < 0.1) { // 10% chance of a streak starting
          const streakLength = Math.floor(Math.random() * 7) + 3; // 3-10 day streak
          const streakValue = Math.floor(Math.random() * 3) + 2; // 2-4 value
          
          // Apply streak forward
          const streakStart = new Date(d);
          for (let i = 0; i < streakLength; i++) {
            const streakDate = new Date(streakStart);
            streakDate.setDate(streakStart.getDate() + i);
            if (streakDate > today) break;
            
            const streakDateString = streakDate.toISOString().split('T')[0];
            data[streakDateString] = streakValue;
          }
          
          // Skip ahead to avoid processing days we've already set in the streak
          d.setDate(d.getDate() + streakLength - 1);
          continue;
        }
        
        // Set the value for this day
        data[dateString] = value;
      }
      
      setSampleData(data);
    };
    
    generateSampleData();
  }, []);
  
  // Function to render an improved heatmap visualization
  const renderEnhancedHeatmap = () => {
    // Colors for the heatmap (from light to dark)
    const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
    
    // Month labels for display
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate a more realistic pattern that shows common habits
    const generatePatternedData = () => {
      // Create pattern matrices for different types of habit patterns
      const consistentPattern = [
        [1,1,1,1,1,1,1, 0,0,0,0,0,0,0],
        [1,1,1,1,1,1,1, 0,0,0,0,0,0,0],
        [1,1,1,1,1,1,1, 0,0,0,0,0,0,0],
        [2,2,2,2,2,2,2, 1,1,1,1,1,1,1]
      ];
      
      const weekdayPattern = [
        [0,0,0,0,0,1,1, 0,0,0,0,0,2,2],
        [0,2,2,2,2,1,0, 0,3,2,2,2,1,0],
        [0,2,2,2,2,0,0, 0,3,3,3,2,0,0]
      ];
      
      const increasingPattern = [
        [1,0,1,0,1,0,1, 1,0,2,0,2,0,1],
        [1,1,1,1,2,1,2, 2,2,2,3,2,2,3],
        [2,2,3,2,3,2,3, 3,3,4,3,4,3,4]
      ];
      
      // Combine patterns for diverse visualization
      const cells = [];
      
      // First month: sporadic activity
      for (let i = 0; i < 30; i++) {
        cells.push(Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0);
      }
      
      // Second month: consistent pattern
      for (let row = 0; row < consistentPattern.length; row++) {
        cells.push(...consistentPattern[row]);
      }
      
      // Third month: weekday focus
      for (let row = 0; row < weekdayPattern.length; row++) {
        cells.push(...weekdayPattern[row]);
      }
      
      // Fourth month: increasing pattern showing improvement
      for (let row = 0; row < increasingPattern.length; row++) {
        cells.push(...increasingPattern[row]);
      }
      
      // Fill remaining with realistic random data
      while (cells.length < 365) {
        // More consistent for latest months - higher chance of non-zero
        const recentProbability = 0.6;
        cells.push(Math.random() > recentProbability ? 0 : Math.floor(Math.random() * 4) + 1);
      }
      
      return cells;
    };
    
    // Generate data with realistic patterns
    const heatmapData = generatePatternedData();
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="mx-auto max-w-7xl mb-20 pt-4"
      >
        <div className="relative p-4 sm:p-6 md:p-8 rounded-2xl bg-card-background border border-border shadow-xl overflow-hidden">
          {/* Background gradients for visual appeal */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent"></div>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-primary/5 blur-2xl"></div>
          
          {/* Header with title and analytics label */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mr-3 shadow-sm">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground">Habit Analytics</h3>
                <p className="text-sm text-muted-foreground">Track your progress over time</p>
              </div>
            </div>
            
            <div className="flex items-center px-3 py-1.5 rounded-lg bg-accent border border-accent-border shadow-sm">
              <span className="text-xs font-medium text-primary mr-2">Activity Level</span>
              <div className="flex items-center gap-0.5">
                {colors.map((color, i) => (
                  <div 
                    key={i} 
                    className="w-3 h-3 rounded-sm transition-transform hover:scale-110" 
                    style={{ backgroundColor: color }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Month labels - responsive hidden on smallest screens */}
          <div className="hidden sm:flex mb-2 pl-8 text-xs text-muted-foreground">
            {monthLabels.map((month, i) => (
              <div key={i} className="flex-1 text-center">{month}</div>
            ))}
          </div>
          
          {/* Main heatmap visualization - scrollable on mobile */}
          <div className="relative overflow-x-auto pb-2">
            <div className="min-w-[700px] sm:min-w-0">
              <div className="flex">
                {/* Day labels */}
                <div className="flex flex-col mr-2 text-xs justify-around h-[126px]">
                  {['Mon', 'Wed', 'Fri', 'Sun'].map((day, i) => (
                    <span key={i} className="text-muted-foreground">{day}</span>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="flex-1 grid grid-rows-7 grid-flow-col gap-1">
                  {heatmapData.map((value, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: i % 10 * 0.002 }} // Subtle staggered animation
                      className="w-3 h-3 rounded-sm hover:scale-125 transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: colors[value] }}
                    ></motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Key stats below the heatmap */}
          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div className="flex flex-col items-center">
              <span className="text-sm text-muted-foreground">Current Streak</span>
              <span className="text-2xl font-bold text-foreground">24 days</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm text-muted-foreground">Longest Streak</span>
              <span className="text-2xl font-bold text-foreground">38 days</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <span className="text-2xl font-bold text-foreground">89%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm text-muted-foreground">Total Days</span>
              <span className="text-2xl font-bold text-foreground">254</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Background design elements - responsive sizing */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -z-10 opacity-20 hidden sm:block">
        <Quote className="h-40 w-40 md:h-64 md:w-64 text-primary/20 -rotate-12" />
      </div>
      <div className="absolute top-1/4 right-0 -z-10 opacity-20 hidden sm:block">
        <Quote className="h-24 w-24 md:h-40 md:w-40 text-primary/20 rotate-12" />
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Render the enhanced heatmap above the quotes section */}
        {renderEnhancedHeatmap()}
        
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl lg:max-w-3xl text-center px-4 sm:px-0"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
            className="relative inline-block mb-2"
          >
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-blue-400 opacity-30 blur-md"></div>
            <h2 className="relative text-sm sm:text-base font-semibold leading-7 text-primary px-3 sm:px-4 py-1 sm:py-1.5 bg-accent border border-accent-border rounded-full">Daily Inspiration</h2>
          </motion.div>
          <p className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">motivation</span> with AI-powered quotes
          </p>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-foreground">
            Receive personalized quotes that resonate with your journey, delivered right when you need them most to help you stay consistent and inspired.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 sm:mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-4 sm:gap-6 md:gap-8 sm:mt-20 lg:mx-0 lg:max-w-none md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((quote, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              className="group relative overflow-hidden rounded-3xl bg-card-background border border-border p-5 sm:p-8 shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Quote className="h-5 w-5 text-primary" />
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent text-primary border border-accent-border">
                  {quote.category}
                </span>
              </div>
              <div className="relative">
                <p className="text-xl font-medium leading-relaxed text-foreground mb-6">{quote.text}</p>
                <p className="text-base font-medium text-primary">— {quote.author}</p>
              </div>
              
              <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
