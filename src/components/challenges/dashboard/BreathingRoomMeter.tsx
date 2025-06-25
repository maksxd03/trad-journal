import React, { useMemo } from 'react';

interface BreathingRoomMeterProps {
  title: string;
  currentValue: number;
  limitValue: number;
  unit: 'currency' | 'percentage';
  description?: string;
  isNegativeValueBad?: boolean;
}

const BreathingRoomMeter: React.FC<BreathingRoomMeterProps> = ({
  title,
  currentValue,
  limitValue,
  unit,
  description,
  isNegativeValueBad = true,
}) => {
  // Calcula a porcentagem do valor atual em relação ao limite
  const percentage = useMemo(() => {
    return Math.max(0, Math.min(100, (currentValue / limitValue) * 100));
  }, [currentValue, limitValue]);

  // Determina a cor com base na porcentagem 
  const getStatusColor = (percentage: number) => {
    if (percentage >= 50) return 'profit';
    if (percentage >= 25) return 'warning';
    return 'loss';
  };

  const statusColor = getStatusColor(percentage);

  // Formata o valor para exibição
  const formatValue = (value: number, unit: 'currency' | 'percentage') => {
    if (unit === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }
    
    return `${value.toFixed(2)}%`;
  };

  // Determina a mensagem de status
  const getStatusMessage = (percentage: number) => {
    if (percentage >= 75) return 'Zona Segura';
    if (percentage >= 50) return 'Zona Confortável';
    if (percentage >= 25) return 'Zona de Cautela';
    return 'Zona Crítica';
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-neutral-900 dark:text-white text-sm">
          {title}
        </h3>
        <div className={`text-xs px-2 py-0.5 rounded-full bg-${statusColor}-100 dark:bg-${statusColor}-900/30 text-${statusColor}-700 dark:text-${statusColor}-400`}>
          {getStatusMessage(percentage)}
        </div>
      </div>
      
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {formatValue(currentValue, unit)}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Limite: {formatValue(limitValue, unit)}
          </div>
        </div>
        
        {/* Background track */}
        <div className="overflow-hidden h-2 mb-2 text-xs flex rounded-full bg-neutral-200 dark:bg-neutral-700">
          {/* Colored progress bar */}
          <div 
            style={{ width: `${percentage}%` }} 
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${statusColor}-500`}
          ></div>
        </div>
      </div>
      
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
          {description}
        </p>
      )}
      
      {/* Indicador de alerta ou perigo */}
      {isNegativeValueBad && currentValue < limitValue * 0.25 && (
        <div className="mt-2 p-2 bg-loss-100 dark:bg-loss-900/20 rounded-md">
          <p className="text-xs text-loss-700 dark:text-loss-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Atenção: Você está se aproximando do limite!
          </p>
        </div>
      )}
    </div>
  );
};

export default BreathingRoomMeter; 