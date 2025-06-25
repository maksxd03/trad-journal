import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskMeterProps {
  title: string;
  currentValue: number;
  limitValue: number;
  description?: string;
  icon?: 'shield' | 'alert';
}

const RiskMeter: React.FC<RiskMeterProps> = ({
  title,
  currentValue,
  limitValue,
  description,
  icon = 'shield',
}) => {
  // Calculate percentage of how close we are to the limit (reversed)
  // When currentValue is high (far from limit), percentage should be high (good)
  const safetyPercentage = Math.min(100, Math.max(0, (currentValue / limitValue) * 100));
  
  // Format currency value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Determine color and message based on percentage
  const getStatusInfo = (percentage: number) => {
    if (percentage >= 75) {
      return {
        color: 'profit',
        label: 'Zona Segura',
        textColor: 'text-profit-600 dark:text-profit-400',
        bgColor: 'bg-profit-500'
      };
    }
    if (percentage >= 50) {
      return {
        color: 'primary',
        label: 'Zona Confortável',
        textColor: 'text-primary-600 dark:text-primary-400',
        bgColor: 'bg-primary-500'
      };
    }
    if (percentage >= 25) {
      return {
        color: 'yellow',
        label: 'Zona de Cautela',
        textColor: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-500'
      };
    }
    return {
      color: 'loss',
      label: 'Zona Crítica',
      textColor: 'text-loss-600 dark:text-loss-400',
      bgColor: 'bg-loss-500'
    };
  };
  
  const statusInfo = getStatusInfo(safetyPercentage);
  
  // Choose icon based on prop
  const IconComponent = icon === 'shield' ? ShieldAlert : AlertTriangle;
  
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-md bg-${statusInfo.color}-100 dark:bg-${statusInfo.color}-900/30 mr-3`}>
            <IconComponent className={`h-5 w-5 ${statusInfo.textColor}`} />
          </div>
          <h3 className="font-medium text-lg text-neutral-900 dark:text-white">
            {title}
          </h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium bg-${statusInfo.color}-100 dark:bg-${statusInfo.color}-900/30 ${statusInfo.textColor}`}>
          {statusInfo.label}
        </div>
      </div>
      
      {/* Current Value and Limit */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-3xl font-bold block mb-1 text-neutral-900 dark:text-white">
            {formatCurrency(currentValue)}
          </span>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Distância atual
          </span>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold block mb-1 text-neutral-700 dark:text-neutral-300">
            {formatCurrency(limitValue)}
          </span>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Limite de perda
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4 mb-3">
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${statusInfo.bgColor}`}
            style={{ width: `${safetyPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Measurement Marks */}
      <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-2">
        <div>0%</div>
        <div>25%</div>
        <div>50%</div>
        <div>75%</div>
        <div>100%</div>
      </div>
      
      {/* Description */}
      {description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3">
          {description}
        </p>
      )}
      
      {/* Warning for Critical Zone */}
      {safetyPercentage < 25 && (
        <div className="mt-4 p-3 bg-loss-100 dark:bg-loss-900/20 rounded-md flex items-start">
          <AlertTriangle className="h-5 w-5 text-loss-600 dark:text-loss-400 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-loss-700 dark:text-loss-400">
            Atenção! Você está muito próximo do limite de drawdown. Considere reduzir o tamanho das posições ou implementar stops mais rígidos.
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskMeter; 