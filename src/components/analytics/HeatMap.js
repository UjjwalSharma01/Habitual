'use client';

import { useState, useEffect } from 'react';

export default function HeatMap({ data }) {
  const [months, setMonths] = useState([]);
  const [days, setDays] = useState([]);
  const [cells, setCells] = useState([]);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Generate calendar for a year
  useEffect(() => {
    const generateCalendar = () => {
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      oneYearAgo.setDate(today.getDate() + 1); // Start from the day after one year ago
      
      // Generate months (for display on top of the heatmap)
      const monthNames = [];
      let currentMonth = -1;
      
      // Generate all days in the last year
      const allDays = [];
      const tempDay = new Date(oneYearAgo);
      
      while (tempDay <= today) {
        const month = tempDay.getMonth();
        const date = tempDay.getDate();
        const year = tempDay.getFullYear();
        const dayOfWeek = tempDay.getDay();
        const dateString = tempDay.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Add month label when the month changes
        if (month !== currentMonth) {
          currentMonth = month;
          monthNames.push({
            name: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(tempDay),
            index: allDays.length
          });
        }
        
        // Add this day to our array
        allDays.push({
          date: dateString,
          dayOfWeek,
          value: data[dateString] || 0
        });
        
        // Move to the next day
        tempDay.setDate(tempDay.getDate() + 1);
      }
      
      setMonths(monthNames);
      setCells(allDays);
      
      // Generate day labels (Sun, Mon, Tue, etc.)
      const dayLabels = [];
      for (let i = 0; i < 7; i++) {
        const day = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(2021, 0, i + 3));
        dayLabels.push(day);
      }
      setDays(dayLabels);
    };
    
    generateCalendar();
  }, [data]);

  // Get color intensity based on value
  const getColor = (value) => {
    if (value === 0) return '#ebedf0';
    if (value === 1) return '#9be9a8';
    if (value === 2) return '#40c463';
    if (value === 3) return '#30a14e';
    return '#216e39'; // 4 or more
  };

  // Handle tooltip display
  const handleMouseOver = (cell, event) => {
    const date = new Date(cell.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const message = cell.value === 0 
      ? 'No habits completed' 
      : `${cell.value} habit${cell.value > 1 ? 's' : ''} completed`;
    
    setTooltipContent(`${formattedDate}: ${message}`);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
    setShowTooltip(true);
  };

  const handleMouseOut = () => {
    setShowTooltip(false);
  };

  // Group cells by week for rendering
  const groupedCells = [];
  for (let i = 0; i < 7; i++) {
    const row = cells.filter(cell => cell.dayOfWeek === i);
    groupedCells.push(row);
  }

  return (
    <div className="relative overflow-x-auto"
         ref={(el) => {
           // Scroll to the right end (showing most recent data) when component mounts
           if (el) {
             setTimeout(() => {
               el.scrollLeft = el.scrollWidth;
             }, 100); // Small delay to ensure component is fully rendered
           }
         }}>
      <div className="min-w-[700px] pb-4">
        {/* Month labels */}
        <div className="flex mb-1 text-xs text-muted-foreground pl-10">
          {months.map((month, index) => (
            <div 
              key={index} 
              className="flex-shrink-0"
              style={{ 
                marginLeft: index === 0 ? `${month.index * 11}px` : '0',
                width: index === months.length - 1 ? 'auto' : '4rem' // Approximate width
              }}
            >
              {month.name}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col mr-2 text-xs justify-around text-right">
            {days.map((day, index) => (
              <div key={index} className="h-[11px] text-muted-foreground">{day}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex flex-col">
            {groupedCells.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, cellIndex) => (
                  <div
                    key={`${rowIndex}-${cellIndex}`}
                    className="w-[10px] h-[10px] m-[1px] rounded-sm"
                    style={{ backgroundColor: getColor(cell.value) }}
                    onMouseOver={(e) => handleMouseOver(cell, e)}
                    onMouseOut={handleMouseOut}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div 
          className="fixed sm:absolute z-10 px-3 py-2 text-xs sm:text-sm text-primary-foreground bg-primary rounded-md"
          style={{ 
            left: `${tooltipPosition.x}px`, 
            top: `${tooltipPosition.y - 40}px`,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            maxWidth: '90vw'
          }}
        >
          {tooltipContent}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center sm:justify-end mt-2 text-xs text-muted-foreground">
        <span className="mr-2">Less</span>
        {['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map((color, i) => (
          <div 
            key={i} 
            className="w-[10px] h-[10px] mx-[1px] rounded-sm" 
            style={{ backgroundColor: color }}
          ></div>
        ))}
        <span className="ml-2">More</span>
      </div>
    </div>
  );
}
