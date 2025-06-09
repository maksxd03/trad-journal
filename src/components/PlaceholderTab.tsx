import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface PlaceholderTabProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  features 
}) => {
  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          {title}
        </h2>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-lg">
          {description}
        </p>
        
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Coming Soon Features:
          </h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8">
          <button className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
            Get Notified When Available
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderTab;