import React, { forwardRef } from 'react';

const FormInput = forwardRef(({
  id,
  name,
  label,
  type = 'text',
  error,
  helperText,
  className = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props
}, ref) => {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className={`h-5 w-5 ${error ? 'text-danger-500' : 'text-slate-400 dark:text-slate-500'}`} aria-hidden="true" />
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          className={`
            block w-full rounded-xl sm:text-sm transition-colors duration-200
            ${LeftIcon ? 'pl-10' : 'pl-4'} 
            ${RightIcon ? 'pr-10' : 'pr-4'} 
            py-2.5 bg-white dark:bg-slate-900 shadow-sm
            ${error 
              ? 'border-danger-300 text-danger-900 placeholder-danger-300 focus:border-danger-500 focus:ring-danger-500 dark:border-danger-500/50 dark:text-danger-400 focus:ring-2' 
              : 'border-slate-300 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-primary-500 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 focus:ring-2'
            }
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <RightIcon className={`h-5 w-5 ${error ? 'text-danger-500' : 'text-slate-400 dark:text-slate-500'}`} aria-hidden="true" />
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400" id={`${inputId}-error`}>
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400" id={`${inputId}-helper`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
