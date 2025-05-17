'use client';

/**
 * Utility function to apply correct theme-aware styles to components
 * Use this to replace common tailwind classes with their theme-aware equivalents
 */

export function applyThemeClass(element, className = '') {
  // Mapping of common Tailwind classes to their CSS variable equivalents
  const styleMap = {
    'bg-white': { backgroundColor: 'var(--card-background)' },
    'text-gray-900': { color: 'var(--card-foreground)' },
    'text-gray-800': { color: 'var(--card-foreground)' },
    'text-gray-700': { color: 'var(--card-foreground)' },
    'text-gray-600': { color: 'var(--muted-foreground)' },
    'text-gray-500': { color: 'var(--muted-foreground)' },
    'text-gray-400': { color: 'var(--muted-foreground)' },
    'border-gray-200': { borderColor: 'var(--border)' },
    'border-gray-300': { borderColor: 'var(--border)' },
  };

  // Extract classes from className string
  const classes = className.split(' ');
  
  // Initialize style object
  const style = {};
  
  // Apply mapped styles based on classes
  for (const cls of classes) {
    if (styleMap[cls]) {
      Object.assign(style, styleMap[cls]);
    }
  }
  
  // Create a new element with the updated styles
  return React.cloneElement(element, { style: { ...element.props.style, ...style } });
}

// Helper for card-like components
export function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`shadow overflow-hidden sm:rounded-lg ${className}`}
      style={{ 
        backgroundColor: 'var(--card-background)', 
        color: 'var(--card-foreground)',
        ...props.style 
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Helper for text that should adapt to theme
export function ThemedText({ children, variant = 'default', className = '', ...props }) {
  const variantStyles = {
    'default': { color: 'var(--foreground)' },
    'muted': { color: 'var(--muted-foreground)' },
    'primary': { color: 'var(--primary)' }
  };
  
  return (
    <span 
      className={className}
      style={{ 
        ...variantStyles[variant],
        ...props.style 
      }}
      {...props}
    >
      {children}
    </span>
  );
}
