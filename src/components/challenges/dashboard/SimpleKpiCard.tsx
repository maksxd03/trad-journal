import React from 'react';

interface SimpleKpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string | number;
  };
  color?: 'default' | 'primary' | 'profit' | 'loss' | 'warning';
}

const SimpleKpiCard: React.FC<SimpleKpiCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  color = 'default',
}) => {
  // Determina as classes de cor para o valor principal
  const getColorClasses = (colorName: string) => {
    switch (colorName) {
      case 'primary':
        return 'text-primary-600 dark:text-primary-400';
      case 'profit':
        return 'text-profit-600 dark:text-profit-400';
      case 'loss':
        return 'text-loss-600 dark:text-loss-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-neutral-900 dark:text-white';
    }
  };

  // Classes para o trend (tendência)
  const getTrendClasses = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-profit-600 dark:text-profit-400';
      case 'down':
        return 'text-loss-600 dark:text-loss-400';
      case 'neutral':
      default:
        return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    if (direction === 'up') {
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    
    if (direction === 'down') {
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
    
    return (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {title}
        </div>
        {icon && (
          <div className={`p-1.5 rounded-md bg-${color === 'default' ? 'neutral' : color}-100 dark:bg-${color === 'default' ? 'neutral' : color}-900/30`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end space-x-2 mb-0.5">
        <div className={`text-2xl font-semibold ${getColorClasses(color)}`}>
          {value}
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 ${getTrendClasses(trend.direction)}`}>
            {getTrendIcon(trend.direction)}
            <span className="text-xs">{trend.value}</span>
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
    </div>
  );
};

export default SimpleKpiCard; 