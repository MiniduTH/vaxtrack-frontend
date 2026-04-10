import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

/**
 * Debounced search bar.
 *
 * @param {string}   value       - Controlled value (from parent)
 * @param {function} onChange    - Called with debounced string after delay
 * @param {string}   placeholder
 * @param {number}   debounce    - Debounce delay in ms (default 350)
 * @param {string}   className
 */
const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search…',
  debounce = 350,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync external value changes (e.g. reset from parent)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce: call onChange after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange) onChange(localValue);
    }, debounce);
    return () => clearTimeout(timer);
  }, [localValue, debounce, onChange]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    if (onChange) onChange('');
  }, [onChange]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <FiSearch className="h-4 w-4 text-secondary-400 dark:text-slate-500" />
      </div>

      <input
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700
          bg-white dark:bg-slate-900 text-sm text-foreground placeholder-secondary-400
          dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500
          focus:border-transparent shadow-sm transition-all duration-200"
        aria-label={placeholder}
      />

      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600 dark:hover:text-slate-300 transition-colors"
          aria-label="Clear search"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
