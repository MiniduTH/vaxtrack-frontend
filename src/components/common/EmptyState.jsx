import React from 'react';
import Button from './Button';

const EmptyState = ({ 
  icon: Icon,
  imageSrc,
  title, 
  description, 
  actionLabel, 
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center min-h-[300px] bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 ${className}`}>
      
      {/* Visual Indicator (Icon or Image) */}
      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-32 h-32 mb-6 opacity-80 dark:opacity-70 object-contain drop-shadow-md"
        />
      ) : Icon ? (
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
          <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" aria-hidden="true" />
        </div>
      ) : null}

      {/* Text Content */}
      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
      
    </div>
  );
};

export default EmptyState;
