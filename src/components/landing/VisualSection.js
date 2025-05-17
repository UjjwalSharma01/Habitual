'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Create a mock heatmap visualization
function HeatMapVisual() {
  // Generate 365 days (full year) of mock data
  const generateMockData = () => {
    const data = [];
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    // Create months
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(today.getFullYear(), month + 1, 0).getDate();
      const monthData = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(today.getFullYear(), month, day);
        // Generate a random value between 0-4 with higher probability for regular patterns
        // This creates a more realistic habit tracking pattern
        let value = 0;
        
        if (date > today) {
          // Future dates are empty
          value = 0;
        } else {
          // Past dates have values
          const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
          const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;
          // Create a pattern: more likely to have activity on weekdays
          const rand = Math.random();
          if (isWeekday && rand > 0.2) {
            value = Math.floor(Math.random() * 4) + 1; // 1-4
          } else if (!isWeekday && rand > 0.5) {
            value = Math.floor(Math.random() * 4) + 1; // 1-4
          }
        }
        
        monthData.push({
          date,
          value
        });
      }
      data.push(monthData);
    }
    
    return data;
  };

  const heatmapData = generateMockData();

  // Get month names
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="heatmap-container p-4 bg-card-background rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-medium text-foreground">Meditation Habit</div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-sm bg-primary opacity-10"></div>
          <div className="h-3 w-3 rounded-sm bg-primary opacity-30"></div>
          <div className="h-3 w-3 rounded-sm bg-primary opacity-60"></div>
          <div className="h-3 w-3 rounded-sm bg-primary opacity-90"></div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center">
        {/* Day labels */}
        <div className="w-8"></div>
        <div className="flex-1 grid grid-cols-7 gap-1">
          {dayNames.map((day, i) => (
            <div key={i} className="text-xs text-muted-foreground text-center">{day}</div>
          ))}
        </div>
      </div>

      {/* Calendar heatmap */}
      <div className="max-h-96 overflow-y-auto pr-2">
        <div className="space-y-6">
          {heatmapData.map((month, monthIndex) => (
            <div key={monthIndex} className="flex">
              {/* Month label */}
              <div className="w-8 text-xs text-muted-foreground flex items-start mt-1">
                {monthNames[monthIndex]}
              </div>
              
              {/* Month cells */}
              <div className="flex-1">
                <div className="grid grid-cols-7 gap-1">
                  {/* Add empty cells for offset at start of month */}
                  {Array.from({ length: new Date(new Date().getFullYear(), monthIndex, 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-4 w-4"></div>
                  ))}
                  
                  {/* Actual days */}
                  {month.map((day, i) => (
                    <div 
                      key={i} 
                      className={`h-4 w-4 rounded-sm ${
                        day.value === 0 ? 'bg-muted' :
                        day.value === 1 ? 'bg-primary opacity-20' :
                        day.value === 2 ? 'bg-primary opacity-40' :
                        day.value === 3 ? 'bg-primary opacity-70' :
                        'bg-primary'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="h-1 w-full bg-muted rounded"></div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-foreground font-medium">Current streak: <span className="text-primary">14 days</span></div>
          <div className="text-sm text-foreground font-medium">Completion rate: <span className="text-primary">87%</span></div>
        </div>
      </div>
    </div>
  );
}

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
  
  const [activeTab, setActiveTab] = useState("heatmap");

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
          <div className="p-1 bg-muted rounded-lg mb-6 inline-flex mx-auto">
            <button 
              onClick={() => setActiveTab("heatmap")} 
              className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "heatmap" ? "bg-card-background shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              Habit Heatmap
            </button>
            <button 
              onClick={() => setActiveTab("analytics")} 
              className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "analytics" ? "bg-card-background shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              Analytics
            </button>
          </div>

          <div className="relative">
            <div className={activeTab === "heatmap" ? "block" : "hidden"}>
              <HeatMapVisual />
            </div>
            <div className={activeTab === "analytics" ? "block" : "hidden"}>
              <AnalyticsVisual />
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 -right-4 -bottom-4 -z-10 bg-gradient-to-r from-accent/50 to-accent/5 blur-xl opacity-50 rounded-xl"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
