import React from 'react';
import { Activity } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 rounded-xl flex items-center justify-center mx-auto animate-pulse">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            TraderLog Pro
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Loading your trading dashboard...
          </p>
        </div>
        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;