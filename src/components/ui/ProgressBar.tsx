import React from 'react';

interface ProgressBarProps {
  value: number; // Valor atual (0-100)
  max?: number; // Valor máximo (padrão: 100)
  size?: 'xs' | 'sm' | 'md' | 'lg'; // Tamanho da barra
  color?: 'primary' | 'profit' | 'loss' | 'neutral'; // Cor da barra
  showValue?: boolean; // Exibir o valor em porcentagem
  className?: string; // Classes adicionais
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'sm',
  color = 'primary',
  showValue = false,
  className = '',
}) => {
  // Garantir que o valor esteja entre 0 e max
  const normalizedValue = Math.max(0, Math.min(value, max));
  
  // Calcular a porcentagem
  const percentage = (normalizedValue / max) * 100;
  
  // Determinar as classes de tamanho
  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };
  
  // Determinar as classes de cor
  const colorClasses = {
    primary: 'bg-primary-600 dark:bg-primary-500',
    profit: 'bg-profit-600 dark:bg-profit-500',
    loss: 'bg-loss-600 dark:bg-loss-500',
    neutral: 'bg-neutral-600 dark:bg-neutral-500',
  };
  
  // Determinar a cor de fundo
  const bgColorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/20',
    profit: 'bg-profit-100 dark:bg-profit-900/20',
    loss: 'bg-loss-100 dark:bg-loss-900/20',
    neutral: 'bg-neutral-200 dark:bg-neutral-700',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center">
        <div className={`w-full ${sizeClasses[size]} ${bgColorClasses[color]} rounded-full overflow-hidden`}>
          <div
            className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-in-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {showValue && (
          <span className="ml-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar; 