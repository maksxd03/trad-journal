import React from 'react';
import { TrendingUp, TrendingDown, ExternalLink, MessageSquare, Tag } from 'lucide-react';
import { Trade } from '../../types/trade';
import { format } from 'date-fns';

interface TradeTableProps {
  trades: Trade[];
  onTradeClick?: (trade: Trade) => void;
}

const TradeTable: React.FC<TradeTableProps> = ({ trades, onTradeClick }) => {
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

  if (trades.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
        <TrendingUp className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
          No trades found
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Try adjusting your filters or add some trades to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Date & Symbol
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Type & Setup
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Entry/Exit
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                P&L
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                R:R Ratio
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {trades.map((trade) => {
              const isProfitable = trade.pnl > 0;
              
              return (
                <tr 
                  key={trade.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  onClick={() => onTradeClick?.(trade)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {trade.symbol}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {format(new Date(trade.date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${
                        trade.type === 'long' 
                          ? 'bg-profit-100 dark:bg-profit-900/30 text-profit-600 dark:text-profit-400'
                          : 'bg-loss-100 dark:bg-loss-900/30 text-loss-600 dark:text-loss-400'
                      }`}>
                        {trade.type === 'long' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {trade.type.toUpperCase()}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {trade.setup}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-neutral-900 dark:text-white">
                        {formatCurrency(trade.entryPrice)}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {formatCurrency(trade.exitPrice)}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                    {trade.quantity.toLocaleString()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${
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
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                    {trade.riskRewardRatio.toFixed(2)}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {trade.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        >
                          {tag}
                        </span>
                      ))}
                      {trade.tags.length > 2 && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          +{trade.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {trade.notes && (
                        <MessageSquare className="w-4 h-4 text-neutral-400" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTradeClick?.(trade);
                        }}
                        className="text-primary-500 hover:text-primary-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeTable;