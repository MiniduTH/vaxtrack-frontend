import { format, parseISO, isValid } from 'date-fns';

/**
 * Formats a date string to a standard readable format (e.g., 'Oct 12, 2023')
 * @param {string|Date} dateString - The date to format
 * @param {string} formatStr - The date-fns format string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return 'N/A';
  
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  
  if (!isValid(date)) return 'Invalid Date';
  
  return format(date, formatStr);
};

/**
 * Formats a date string to include time (e.g., 'Oct 12, 2023 14:30')
 */
export const formatDateTime = (dateString) => {
  return formatDate(dateString, 'MMM dd, yyyy HH:mm');
};

/**
 * Formats a phone number for display (basic implementation)
 * @param {string} phoneNumber 
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';
  
  // Basic cleanup: extract only numbers
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  // Example for 10-digit numbers: (123) 456-7890
  if (cleaned.length === 10) {
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  }
  
  // Default fallback if it doesn't match standard patterns
  return phoneNumber;
};
