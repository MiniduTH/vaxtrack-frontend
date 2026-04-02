import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 active:scale-95 disabled:opacity-60 disabled:pointer-events-none disabled:active:scale-100';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-6 py-2.5 text-base rounded-xl',
    lg: 'px-8 py-3.5 text-lg rounded-xl',
  };

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-soft hover:shadow-glow focus:ring-primary-500',
    secondary: 'bg-secondary-100 hover:bg-secondary-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-secondary-900 dark:text-slate-100 shadow-sm focus:ring-secondary-500',
    outline: 'border border-secondary-300 dark:border-slate-700 bg-transparent hover:bg-secondary-50 dark:hover:bg-slate-800 text-secondary-900 dark:text-slate-100 focus:ring-secondary-500',
    danger: 'bg-danger-500 hover:bg-danger-600 text-white shadow-soft focus:ring-danger-500',
    ghost: 'bg-transparent hover:bg-secondary-100 dark:hover:bg-slate-800 text-secondary-700 dark:text-slate-300 focus:ring-secondary-500 shadow-none',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && Icon && <Icon className="mr-2 h-5 w-5" aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Button;
