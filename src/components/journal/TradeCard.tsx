import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, Tag, MessageSquare, DollarSign, Image, X, Eye, ExternalLink } from 'lucide-react';
import { Trade } from '../../types/trade';
import { format } from 'date-fns';

interface TradeCardProps {
  trade: Trade;
  onClick?: () => void;
}

const TradeCard: React.FC<TradeCardProps> = ({ trade, onClick }) => {
  const isProfitable = trade.pnl > 0;
  const [showScreenshot, setShowScreenshot] = useState(false);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
  };

  const handleScreenshotClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    console.log('🖼️ Tentando mostrar screenshot no TradeCard');
    console.log('🔗 URL do screenshot:', trade.screenshotUrl);
    
    if (!trade.screenshotUrl) {
      console.error('❌ Este trade não possui uma URL de screenshot válida!');
      alert('Este trade não possui um screenshot associado.');
      return;
    }
    
    // Verificar se a URL é válida
    try {
      new URL(trade.screenshotUrl);
      console.log('✅ URL do screenshot válida');
    } catch (e) {
      console.error('❌ URL do screenshot inválida:', trade.screenshotUrl);
      alert('A URL do screenshot parece ser inválida. Por favor, verifique o console para mais detalhes.');
      return;
    }
    
    setShowScreenshot(true);
  };

  return (
    <>
      <div 
        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-800/50 transition-all duration-200 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              trade.type === 'long' 
                ? 'bg-profit-100 dark:bg-profit-900/30 text-profit-600 dark:text-profit-400'
                : 'bg-loss-100 dark:bg-loss-900/30 text-loss-600 dark:text-loss-400'
            }`}>
              {trade.type === 'long' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {trade.symbol}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {format(new Date(trade.date), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-lg font-bold ${
              isProfitable 
                ? 'text-profit-600 dark:text-profit-400' 
                : 'text-loss-600 dark:text-loss-400'
            }`}>
              {formatCurrency(trade.pnl)}
            </div>
            <div className={`text-sm ${
              isProfitable 
                ? 'text-profit-600 dark:text-profit-400' 
                : 'text-loss-600 dark:text-loss-400'
            }`}>
              {formatPercentage(trade.pnlPercentage)}
            </div>
          </div>
        </div>

        {/* Trade Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Entry</div>
            <div className="text-sm font-medium text-neutral-900 dark:text-white">
              {formatCurrency(trade.entryPrice)}
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Exit</div>
            <div className="text-sm font-medium text-neutral-900 dark:text-white">
              {formatCurrency(trade.exitPrice)}
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Quantity</div>
            <div className="text-sm font-medium text-neutral-900 dark:text-white">
              {trade.quantity.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">R:R Ratio</div>
            <div className="text-sm font-medium text-neutral-900 dark:text-white">
              {trade.riskRewardRatio.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Screenshot Button (if available) */}
        {trade.screenshotUrl && (
          <button
            onClick={handleScreenshotClick}
            className="w-full flex items-center justify-center gap-2 mb-4 py-2 rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="font-medium">Ver Gráfico</span>
          </button>
        )}

        {/* Setup */}
        <div className="mb-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
            {trade.setup}
          </div>
        </div>

        {/* Tags */}
        {trade.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {trade.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-4 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{trade.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-3 h-3" />
              <span>Commission: {formatCurrency(trade.commission)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-neutral-500 dark:text-neutral-400">
            {trade.notes && (
              <div className="flex items-center">
                <MessageSquare className="w-3 h-3 mr-1" />
                <span>Has notes</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Screenshot Modal */}
      {showScreenshot && trade.screenshotUrl && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowScreenshot(false)}
        >
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={() => setShowScreenshot(false)}
              className="absolute -top-12 right-0 bg-white dark:bg-neutral-800 rounded-full p-2 shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <X className="w-6 h-6 text-neutral-500" />
            </button>
            <img 
              src={trade.screenshotUrl} 
              alt={`Screenshot for ${trade.symbol} trade`} 
              className="w-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.error('❌ Erro ao carregar imagem em tamanho completo');
                // Fallback para uma imagem de erro
                (e.target as HTMLImageElement).src = 'https://placehold.co/800x600?text=Error+Loading+Image';
              }}
            />
            <a
              href={trade.screenshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-neutral-800/70 hover:bg-neutral-900/90 text-white rounded-full p-2 flex items-center gap-1 text-sm font-medium transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Original</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default TradeCard;