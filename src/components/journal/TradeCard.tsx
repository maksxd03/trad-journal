import React from 'react';
import { TrendingUp, TrendingDown, Clock, Tag, MessageSquare, DollarSign } from 'lucide-react';
import { Trade } from '../../types/trade';
import { format } from 'date-fns';

interface TradeCardProps {
  trade: Trade;
  onClick?: () => void;
}

const TradeCard: React.FC<TradeCardProps> = ({ trade, onClick }) => {
  const isProfitable = trade.pnl > 0;
  
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

  return (
    <div 
      className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-800/50 transition-all duration-200 cursor-pointer"
      onClick={onClick}
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
        
        {trade.notes && (
          <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
            <MessageSquare className="w-3 h-3 mr-1" />
            <span>Has notes</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeCard;