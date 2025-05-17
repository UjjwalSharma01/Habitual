// This is a simple tabs implementation
'use client';

import * as React from 'react';

const TabsContext = React.createContext(null);

const Tabs = React.forwardRef(({ defaultValue, value, onValueChange, children, ...props }, ref) => {
  const [tabValue, setTabValue] = React.useState(defaultValue);
  const actualValue = value !== undefined ? value : tabValue;

  const handleValueChange = (value) => {
    setTabValue(value);
    onValueChange?.(value);
  };

  return (
    <TabsContext.Provider
      value={{
        value: actualValue,
        onValueChange: handleValueChange,
      }}
    >
      <div ref={ref} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef(({ children, ...props }, ref) => {
  return (
    <div ref={ref} role="tablist" className="inline-flex items-center justify-center rounded-lg bg-card-background border border-border p-1 shadow-sm" {...props}>
      {children}
    </div>
  );
});
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef(({ value, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }

  const isActive = context.value === value;

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => context.onValueChange?.(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isActive ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-foreground hover:bg-accent hover:text-primary'
      }`}
      {...props}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef(({ value, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }

  const isActive = context.value === value;

  if (!isActive) return null;

  return (
    <div 
      ref={ref} 
      role="tabpanel" 
      tabIndex={0} 
      aria-labelledby={`tabs-trigger-${value}`} 
      className="mt-2 rounded-md animate-in fade-in-0 slide-in-from-top-1 duration-300"
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };

