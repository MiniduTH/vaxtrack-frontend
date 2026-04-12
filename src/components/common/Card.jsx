import React from 'react';

export const Card = ({ children, glass = false, className = '', ...props }) => {
  const baseClasses = 'relative rounded-2xl overflow-hidden';
  const glassClasses = 'glass-card backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-soft';
  const solidClasses = 'bg-card text-card-foreground shadow-soft border border-border';
  
  return (
    <div className={`${baseClasses} ${glass ? glassClasses : solidClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-5 border-b border-border/50 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-xl font-bold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-slate-500 dark:text-slate-400 mt-1.5 ${className}`} {...props}>
    {children}
  </p>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 flex items-center border-t border-border/50 ${className}`} {...props}>
    {children}
  </div>
);

// Standard import export
export default Card;
