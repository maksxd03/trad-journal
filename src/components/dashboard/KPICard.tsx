import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';
import { useTranslation } from 'react-i18next';
import ArcGauge from './ArcGauge';
import RatioBar from './RatioBar';
import { cn } from '../../lib/utils';

export interface KPICardProps {
  title: string;
  mainValue: string | number;
  mainValueFormatted?: string;
  changeValue?: number;
  changePercentage?: number;
  tooltipContent?: string;
  variant?: 'default' | 'positive' | 'negative' | 'neutral';
  
  // Visualização
  visualType?: 'none' | 'gauge' | 'bar';
  
  // Dados para ArcGauge
  gaugeData?: {
    winCount: number;
    lossCount: number;
  };
  
  // Dados para RatioBar
  barData?: {
    winValue: number;
    lossValue: number;
  };
  
  // Configuração de layout
  inlineBarLabels?: boolean;
  contentAlign?: 'left' | 'center';
  
  // Métricas secundárias
  subMetrics?: {
    label: string;
    value: string | number;
  }[];
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  mainValue,
  mainValueFormatted,
  changeValue = 0,
  changePercentage = 0,
  tooltipContent,
  variant = 'default',
  visualType = 'none',
  gaugeData,
  barData,
  inlineBarLabels = false,
  contentAlign = 'center',
  subMetrics = []
}) => {
  const { t } = useTranslation();
  const tooltipId = `tooltip-${title.replace(/\s+/g, '-').toLowerCase()}`;
  
  // Determinar a cor do valor principal com base na variante
  const getMainValueColor = () => {
    if (variant === 'positive') return 'text-profit-600 dark:text-profit-400';
    if (variant === 'negative') return 'text-loss-600 dark:text-loss-400';
    return 'text-neutral-900 dark:text-white';
  };
  
  // Determinar a cor do indicador de mudança
  const getChangeColor = () => {
    if (variant === 'positive' || changeValue > 0) return 'text-profit-600 dark:text-profit-400';
    if (variant === 'negative' || changeValue < 0) return 'text-loss-600 dark:text-loss-400';
    return 'text-neutral-500 dark:text-neutral-400';
  };
  
  // Obter o ícone de mudança
  const getChangeIcon = () => {
    if (variant === 'positive' || changeValue > 0) return <ArrowUpIcon className="h-3 w-3" />;
    if (variant === 'negative' || changeValue < 0) return <ArrowDownIcon className="h-3 w-3" />;
    return null;
  };

  // Formatar valores para exibição inline
  const formattedWinValue = barData ? `$${Math.abs(barData.winValue).toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}` : '';
  
  const formattedLossValue = barData ? `-$${Math.abs(barData.lossValue).toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}` : '';

  // Verificar se é o card de P&L Líquido
  const isPnLCard = title === t('dashboard.net_pnl');

  return (
    <div className={cn(
      "bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700 p-4 hover:shadow-lg transition-shadow h-full",
      isPnLCard ? "flex flex-col" : ""
    )}>
      {/* Cabeçalho com título e ícone de informação */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <h3 
            className="text-sm font-medium text-neutral-500 dark:text-neutral-400"
            data-tooltip-id={tooltipId}
          >
            {title}
          </h3>
          {tooltipContent && (
            <InformationCircleIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          )}
        </div>
        
        {/* Indicador de mudança */}
        {(changeValue !== 0 || changePercentage !== 0) && (
          <div className={cn("flex items-center text-xs font-medium", getChangeColor())}>
            {getChangeIcon()}
            <span className="ml-0.5">
              {changePercentage !== 0 && `${changePercentage > 0 ? '+' : ''}${changePercentage.toFixed(1)}%`}
            </span>
          </div>
        )}
      </div>
      
      {/* Conteúdo principal */}
      <div className={cn(
        "flex items-center justify-between",
        isPnLCard ? "flex-1 items-center" : "mt-3"
      )}>
        <div className={cn(
          "flex-1", 
          visualType === 'none' ? `flex ${contentAlign === 'left' ? 'justify-start' : 'justify-center'}` : '',
          contentAlign === 'left' ? 'text-left' : '',
          isPnLCard ? 'flex items-center' : ''
        )}>
          {/* Valor principal - ajustado para manter consistência */}
          <div className={cn(
            "text-3xl font-bold", 
            getMainValueColor()
          )}>
            {mainValueFormatted || mainValue}
          </div>
          
          {/* Métricas secundárias */}
          {subMetrics.length > 0 && (
            <div className="mt-3 space-y-1">
              {subMetrics.map((metric, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400">{metric.label}</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{metric.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Visualização - Gauge */}
        {visualType === 'gauge' && gaugeData && (
          <div className="ml-2 flex items-center justify-center">
            <ArcGauge 
              winCount={gaugeData.winCount} 
              lossCount={gaugeData.lossCount} 
            />
          </div>
        )}
      </div>
      
      {/* Barra de proporção */}
      {visualType === 'bar' && barData && !inlineBarLabels && (
        <div className="mt-4">
          <RatioBar 
            winValue={barData.winValue} 
            lossValue={barData.lossValue} 
          />
        </div>
      )}
      
      {/* Barra de proporção com labels inline */}
      {visualType === 'bar' && barData && inlineBarLabels && (
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-profit-600 dark:text-profit-400 min-w-[40px]">
              {formattedWinValue}
            </span>
            <div className="flex-1 h-2.5 rounded-full overflow-hidden flex">
              <div 
                className="bg-profit-500 dark:bg-profit-400" 
                style={{ width: `${(barData.winValue / (barData.winValue + barData.lossValue)) * 100}%` }}
              />
              <div 
                className="bg-loss-500 dark:bg-loss-400" 
                style={{ width: `${(barData.lossValue / (barData.winValue + barData.lossValue)) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-loss-600 dark:text-loss-400 min-w-[40px] text-right">
              {formattedLossValue}
            </span>
          </div>
        </div>
      )}
      
      {/* Tooltip */}
      {tooltipContent && (
        <Tooltip id={tooltipId} place="top">
          {tooltipContent}
        </Tooltip>
      )}
    </div>
  );
};

export default KPICard;