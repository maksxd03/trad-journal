import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  iconBgColor = 'bg-primary-100 dark:bg-primary-900/30',
  iconColor = 'text-primary-600 dark:text-primary-400'
}) => {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-200 h-full">
      <div className="flex flex-col space-y-4">
        {/* Feature image placeholder */}
        <div className="w-full h-40 mb-2 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
          <div className="text-neutral-400 dark:text-neutral-500 text-sm">
            <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <span>Mockup da funcionalidade {title}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {title}
          </h3>
        </div>
        
        <p className="text-neutral-600 dark:text-neutral-400 flex-grow">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard; 