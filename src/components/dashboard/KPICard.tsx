import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color?: 'primary' | 'profit' | 'loss' | 'neutral' | 'secondary';
  format?: 'currency' | 'percentage' | 'number';
  showChart?: boolean;
  customDisplay?: string;
  showCircularProgress?: boolean;
  progressValue?: number;
  maxValue?: number;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = 'neutral',
  format = 'number',
  showChart = false,
  customDisplay,
  showCircularProgress = false,
  progressValue = 0,
  maxValue = 100
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
      case 'percentage':
        return `${val.toFixed(2)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400';
      case 'secondary':
        return 'bg-secondary-50 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400';
      case 'profit':
        return 'bg-profit-50 dark:bg-profit-900/30 text-profit-600 dark:text-profit-400';
      case 'loss':
        return 'bg-loss-50 dark:bg-loss-900/30 text-loss-600 dark:text-loss-400';
      default:
        return 'bg-neutral-50 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300';
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    return change >= 0 ? 'text-profit-600 dark:text-profit-400' : 'text-loss-600 dark:text-loss-400';
  };

  const getProgressColor = () => {
    switch (color) {
      case 'profit':
        return '#00B894';
      case 'loss':
        return '#D63031';
      case 'primary':
        return '#004E64';
      case 'secondary':
        return '#FF7F50';
      default:
        return '#6B7280';
    }
  };

  const generateMiniChart = () => {
    const points = Array.from({ length: 8 }, () => Math.random() * 40 + 10);
    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${(index * 60) / 7} ${50 - point}`
    ).join(' ');

    return (
      <svg width="60" height="20" className="opacity-60">
        <path
          d={pathData}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          className={color === 'profit' ? 'text-profit-500' : color === 'loss' ? 'text-loss-500' : 'text-primary-500'}
        />
      </svg>
    );
  };

  const CircularProgress = () => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progressValue / maxValue) * circumference;
    
    return (
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-neutral-200 dark:text-neutral-700"
          />
          {/* Progress circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={getProgressColor()}
            strokeWidth="6"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
            {progressValue.toFixed(0)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600 p-4 transition-all duration-200 hover:shadow-md hover:shadow-neutral-200/50 dark:hover:shadow-neutral-700/50 hover:border-neutral-300 dark:hover:border-neutral-500">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${getColorClasses()}`}>
          <Icon className="w-4 h-4" />
        </div>
        {showChart && !showCircularProgress && (
          <div className="flex flex-col items-end">
            {generateMiniChart()}
            {change !== undefined && (
              <div className={`text-xs font-semibold mt-1 ${getChangeColor()}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </div>
            )}
          </div>
        )}
        {showCircularProgress && <CircularProgress />}
      </div>
      
      <div>
        <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
          {title}
        </h3>
        <div className="flex items-baseline space-x-2">
          <p className="text-xl font-bold text-neutral-900 dark:text-white">
            {customDisplay || formatValue(value)}
          </p>
          {!showChart && !showCircularProgress && change !== undefined && (
            <div className={`text-sm font-semibold ${getChangeColor()}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </div>
          )}
        </div>
        {changeLabel && !showChart && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {changeLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;