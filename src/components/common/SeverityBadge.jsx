import React from 'react';

const SeverityBadge = ({ severity }) => {
  let badgeStyle = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let dotColor = 'bg-slate-400';

  switch (severity?.toLowerCase()) {
    case 'mild':
      badgeStyle = 'bg-success-50 text-success-700 border-success-200 dark:bg-success-900/20 dark:text-success-400 dark:border-success-800/50';
      dotColor = 'bg-success-500';
      break;
    case 'moderate':
      badgeStyle = 'bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-900/20 dark:text-warning-400 dark:border-warning-800/50';
      dotColor = 'bg-warning-500';
      break;
    case 'severe':
      badgeStyle = 'bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-900/20 dark:text-danger-400 dark:border-danger-800/50';
      dotColor = 'bg-danger-500';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden="true"></span>
      {severity || 'Unknown'}
    </span>
  );
};

export default SeverityBadge;
