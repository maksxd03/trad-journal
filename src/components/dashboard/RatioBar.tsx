import React from 'react';

interface RatioBarProps {
  winValue: number;
  lossValue: number;
}

const RatioBar: React.FC<RatioBarProps> = ({ winValue, lossValue }) => {
  // Calcular as porcentagens para as larguras das barras
  const total = winValue + lossValue;
  const winPercentage = total > 0 ? (winValue / total) * 100 : 50;
  const lossPercentage = total > 0 ? (lossValue / total) * 100 : 50;
  
  // Formatar os valores para exibição
  const formattedWinValue = `$${Math.abs(winValue).toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
  
  const formattedLossValue = `-$${Math.abs(lossValue).toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
  
  return (
    <div className="space-y-1.5">
      {/* Barra de proporção */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        <div 
          className="bg-profit-500 dark:bg-profit-400" 
          style={{ width: `${winPercentage}%` }}
        />
        <div 
          className="bg-loss-500 dark:bg-loss-400" 
          style={{ width: `${lossPercentage}%` }}
        />
      </div>
      
      {/* Valores */}
      <div className="flex justify-between">
        <span className="text-xs font-medium text-profit-600 dark:text-profit-400">
          {formattedWinValue}
        </span>
        <span className="text-xs font-medium text-loss-600 dark:text-loss-400">
          {formattedLossValue}
        </span>
      </div>
    </div>
  );
};

export default RatioBar; 