import React from 'react';

interface GoalGaugeProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  label?: string;
}

const GoalGauge: React.FC<GoalGaugeProps> = ({
  percentage,
  size = 'lg',
  showValue = true,
  label,
}) => {
  // Calculate dimensions based on size
  const dimensions = {
    sm: 100,
    md: 150,
    lg: 200,
  }[size];
  
  // Stroke width based on size
  const strokeWidth = {
    sm: 5,
    md: 7,
    lg: 10,
  }[size];
  
  // Font size for the percentage
  const fontSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }[size];
  
  // Label font size
  const labelSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];
  
  // Calculate circle properties
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Determine color based on percentage
  const getColor = () => {
    if (percentage < 33) return 'primary';
    if (percentage < 66) return 'yellow';
    if (percentage < 100) return 'profit';
    return 'profit';
  };
  
  const color = getColor();
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: dimensions, height: dimensions }}>
        {/* Background circle */}
        <svg 
          className="w-full h-full transform -rotate-90"
          viewBox={`0 0 ${dimensions} ${dimensions}`}
        >
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            className="text-neutral-200 dark:text-neutral-700"
          />
          
          {/* Progress circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`text-${color}-500`}
          />
        </svg>
        
        {/* Center text */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`${fontSize} font-bold text-neutral-900 dark:text-white`}>
              {Math.round(percentage)}%
            </span>
            {label && (
              <span className={`${labelSize} text-neutral-600 dark:text-neutral-400 mt-1`}>
                {label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalGauge; 