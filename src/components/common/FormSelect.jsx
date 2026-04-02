import React, { forwardRef } from 'react';

const FormSelect = forwardRef(({
  id,
  name,
  label,
  options = [],
  error,
  helperText,
  className = '',
  placeholder,
  ...props
}, ref) => {
  const selectId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          className={`
            block w-full rounded-xl sm:text-sm appearance-none transition-colors duration-200
            pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 shadow-sm
            ${error 
              ? 'border-danger-300 text-danger-900 focus:border-danger-500 focus:ring-danger-500 dark:border-danger-500/50 dark:text-danger-400 focus:ring-2' 
              : 'border-slate-300 text-slate-900 focus:border-primary-500 focus:ring-primary-500 dark:border-slate-700 dark:text-white focus:ring-2'
            }
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-slate-500">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <svg className={`h-4 w-4 ${error ? 'text-danger-500' : 'text-slate-400 dark:text-slate-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400" id={`${selectId}-error`}>
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400" id={`${selectId}-helper`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;
