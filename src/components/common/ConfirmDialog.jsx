import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  intent = 'danger',
  isLoading = false,
  icon: Icon
}) => {
  
  const footer = (
    <>
      <Button 
        variant="outline" 
        onClick={onClose} 
        disabled={isLoading}
      >
        {cancelLabel}
      </Button>
      <Button 
        variant={intent} 
        onClick={onConfirm} 
        isLoading={isLoading}
      >
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? onClose : undefined}
      closeOnOutsideClick={!isLoading}
      size="sm"
      footer={footer}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
        {/* Icon based on intent */}
        <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full 
          ${intent === 'danger' ? 'bg-danger-100 dark:bg-danger-500/10 text-danger-600 dark:text-danger-500' : ''}
          ${intent === 'warning' ? 'bg-warning-100 dark:bg-warning-500/10 text-warning-600 dark:text-warning-500' : ''}
          ${intent === 'primary' ? 'bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500' : ''}
        `}>
          {Icon ? (
            <Icon className="w-6 h-6" aria-hidden="true" />
          ) : intent === 'danger' ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : intent === 'warning' ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 mt-1">
          <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
