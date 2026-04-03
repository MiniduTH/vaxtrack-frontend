import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl -z-10 animate-in zoom-in-50 duration-1000" />
      
      <div className="text-center z-10 animate-in slide-in-from-bottom-8 fade-in-0 duration-700 max-w-xl mx-auto">
        
        {/* Large 404 Text (decorative) */}
        <div
          className="text-8xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-400 dark:from-primary-500 dark:to-slate-600 select-none"
          aria-hidden="true"
        >
          404
        </div>
        
        <div className="mt-8 mb-10 space-y-4">
          <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">
            Page not found
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or perhaps the URL is incorrect.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            icon={FiArrowLeft}
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="primary" 
            icon={FiHome}
            className="w-full sm:w-auto"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
      
    </div>
  );
};

export default NotFoundPage;
