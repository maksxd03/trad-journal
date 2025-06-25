import React, { useMemo } from 'react';

interface ProgressBarProps {
  title: string;
  currentValue: number;
  targetValue: number;
  unit?: 'currency' | 'percentage';
  showPercentage?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  title,
  currentValue,
  targetValue,
  unit = 'currency',
  showPercentage = true,
  height = 'md',
}) => {
  // Calcula a porcentagem do progresso
  const percentage = useMemo(() => {
    return Math.max(0, Math.min(100, (currentValue / targetValue) * 100));
  }, [currentValue, targetValue]);

  // Determina a cor com base na porcentagem
  const getColor = (percentage: number) => {
    if (percentage < 33) return 'primary';
    if (percentage < 66) return 'warning';
    if (percentage < 100) return 'profit';
    return 'profit';
  };

  const color = getColor(percentage);
  
  // Formata o valor para exibição
  const formatValue = (value: number) => {
    if (unit === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    
    return `${value.toFixed(2)}%`;
  };

  // Define a altura da barra de progresso
  const heightClass = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }[height];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-neutral-900 dark:text-white text-sm">
          {title}
        </h3>
        {showPercentage && (
          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {percentage.toFixed(1)}%
          </div>
        )}
      </div>
      
      <div className="relative pt-1">
        {/* Meta e valor atual */}
        <div className="flex mb-2 items-center justify-between text-xs">
          <div className="text-neutral-600 dark:text-neutral-400">
            <span className="font-medium">{formatValue(currentValue)}</span> concluído
          </div>
          <div className="text-neutral-600 dark:text-neutral-400">
            Meta: {formatValue(targetValue)}
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className={`overflow-hidden ${heightClass} mb-2 text-xs flex rounded-full bg-neutral-200 dark:bg-neutral-700`}>
          <div 
            style={{ width: `${percentage}%` }} 
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${color}-500`}
          ></div>
        </div>
      </div>

      {/* Indicadores de milestone */}
      <div className="mt-2 flex justify-between items-center">
        <div className="w-5 h-5 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center text-xs">
          <span className="text-neutral-700 dark:text-neutral-300">0</span>
        </div>
        <div className="w-5 h-5 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center text-xs">
          <span className="text-neutral-700 dark:text-neutral-300">25</span>
        </div>
        <div className="w-5 h-5 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center text-xs">
          <span className="text-neutral-700 dark:text-neutral-300">50</span>
        </div>
        <div className="w-5 h-5 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center text-xs">
          <span className="text-neutral-700 dark:text-neutral-300">75</span>
        </div>
        <div className="w-5 h-5 rounded-full bg-profit-500 flex items-center justify-center text-xs">
          <span className="text-white">✓</span>
        </div>
      </div>
      
      {/* Mensagem de incentivo com base no progresso */}
      <div className="mt-3">
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          {percentage < 25 && 'Você está no início do seu desafio. Mantenha o foco!'}
          {percentage >= 25 && percentage < 50 && 'Você já percorreu 1/4 do caminho. Continue assim!'}
          {percentage >= 50 && percentage < 75 && 'Metade do caminho concluído! Você está indo muito bem.'}
          {percentage >= 75 && percentage < 100 && 'Falta pouco! Continue com sua estratégia.'}
          {percentage >= 100 && 'Parabéns! Você atingiu sua meta.'}
        </p>
      </div>
    </div>
  );
};

export default ProgressBar; 