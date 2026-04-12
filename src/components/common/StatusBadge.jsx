import React from 'react';

const StatusBadge = ({ 
  children, 
  status = 'info', 
  size = 'md',
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full ring-1 ring-inset';
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const statuses = {
    success: 'bg-success-50 text-success-700 ring-success-600/20 dark:bg-success-500/10 dark:text-success-400 dark:ring-success-500/20',
    warning: 'bg-warning-50 text-warning-800 ring-warning-600/20 dark:bg-warning-500/10 dark:text-warning-400 dark:ring-warning-500/20',
    danger:  'bg-danger-50 text-danger-700 ring-danger-600/10 dark:bg-danger-500/10 dark:text-danger-400 dark:ring-danger-500/20',
    info:    'bg-primary-50 text-primary-700 ring-primary-600/10 dark:bg-primary-500/10 dark:text-primary-400 dark:ring-primary-500/20',
    neutral: 'bg-secondary-50 text-secondary-600 ring-secondary-500/10 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
  };

  const classes = `${baseClasses} ${sizes[size]} ${statuses[status]} ${className}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default StatusBadge;
