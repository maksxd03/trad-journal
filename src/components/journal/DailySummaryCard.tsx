import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, TrendingUp, TrendingDown, Target, BarChart2 } from 'lucide-react';
import TradeCard from './TradeCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Trade {
  id: string;
  date: string;
  symbol: string;
  type: 'long' | 'short';
  pnl: number;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  setup: string;
  notes: string;
  tags: string[];
  accountId: string;
  riskRewardRatio: number;
}

interface DailySummaryCardProps {
  date: string;
  trades: Trade[];
  onTradeClick?: (trade: Trade) => void;
}

const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ date, trades, onTradeClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate daily statistics
  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winningTrades = trades.filter(trade => trade.pnl > 0);
  const losingTrades = trades.filter(trade => trade.pnl < 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  const avgTrade = trades.length > 0 ? totalPnL / trades.length : 0;
  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length 
    : 0;
  const avgLoss = losingTrades.length > 0 
    ? losingTrades.reduce((sum, trade) => sum + Math.abs(trade.pnl), 0) / losingTrades.length 
    : 0;

  // Format date for display
  const formattedDate = format(new Date(date), "EEE, dd 'de' MMM yyyy", { locale: ptBR });
  
  // Sort trades by time (assuming trades have a time field, otherwise you might want to sort by other criteria)
  const sortedTrades = [...trades].sort((a, b) => {
    return a.id.localeCompare(b.id); // Fallback to ID if no time field
  });

  return (
    <div 
      id={`day-${date}`} 
      className="mb-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-all duration-300"
    >
      {/* Header - Always visible */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center justify-between p-4 cursor-pointer
          ${isExpanded ? 'border-b border-neutral-200 dark:border-neutral-700' : ''}
          hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors
        `}
      >
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="font-medium text-neutral-900 dark:text-white">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`text-base font-bold ${
              totalPnL >= 0 
                ? 'text-profit-600 dark:text-profit-400' 
                : 'text-loss-600 dark:text-loss-400'
            }`}>
              ${totalPnL.toFixed(2)}
            </div>
            {totalPnL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-profit-600 dark:text-profit-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-loss-600 dark:text-loss-400" />
            )}
          </div>

          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {trades.length} {trades.length === 1 ? 'Trade' : 'Trades'}
          </div>

          <div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Daily Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                  <Target className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-neutral-900 dark:text-white">
                    {winRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    Win Rate
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                  <BarChart2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-neutral-900 dark:text-white">
                    ${avgTrade.toFixed(2)}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    Avg Trade
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-profit-100 dark:bg-profit-900/30 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-profit-600 dark:text-profit-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-profit-600 dark:text-profit-400">
                    ${avgWin.toFixed(2)}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    Avg Win
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-loss-100 dark:bg-loss-900/30 rounded-lg">
                  <TrendingDown className="w-4 h-4 text-loss-600 dark:text-loss-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-loss-600 dark:text-loss-400">
                    ${avgLoss.toFixed(2)}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    Avg Loss
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trades List */}
          <div className="space-y-4">
            {sortedTrades.map(trade => (
              <TradeCard 
                key={trade.id} 
                trade={trade} 
                onClick={() => onTradeClick && onTradeClick(trade)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailySummaryCard; 