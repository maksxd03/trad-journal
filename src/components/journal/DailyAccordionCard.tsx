import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, TrendingUp, TrendingDown, Target, BarChart2, ArrowRight, DollarSign } from 'lucide-react';
import TradeCard from './TradeCard';
import CompactPnLChart from './CompactPnLChart';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trade } from '../../types/trade';

interface DailyAccordionCardProps {
  date: string;
  trades: Trade[];
  onTradeClick?: (trade: Trade) => void;
}

const DailyAccordionCard: React.FC<DailyAccordionCardProps> = ({ date, trades, onTradeClick }) => {
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
  
  // Sort trades by time (assuming trades have a time field, otherwise sort by other criteria)
  const sortedTrades = [...trades].sort((a, b) => {
    return a.id.localeCompare(b.id); // Fallback to ID if no time field
  });

  // Generate PnL curve data
  const pnlCurveData = React.useMemo(() => {
    let cumulativePnL = 0;
    return sortedTrades.map((trade, index) => {
      cumulativePnL += trade.pnl;
      return {
        tradeIndex: index + 1,
        pnl: cumulativePnL,
        symbol: trade.symbol
      };
    });
  }, [sortedTrades]);

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
          {/* Summary Section with Stats and Chart */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            {/* Daily Stats - Left Side */}
            <div className="md:col-span-7 grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
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

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
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

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
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

              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
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

            {/* PnL Curve - Right Side */}
            {pnlCurveData.length > 1 && (
              <div className="md:col-span-5 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Intraday P&L Curve
                  </h3>
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    totalPnL >= 0 
                      ? 'bg-profit-100 dark:bg-profit-900/30 text-profit-600 dark:text-profit-400' 
                      : 'bg-loss-100 dark:bg-loss-900/30 text-loss-600 dark:text-loss-400'
                  }`}>
                    <DollarSign className="w-3 h-3 inline-block mr-0.5" />
                    {totalPnL.toFixed(2)}
                  </div>
                </div>
                
                <div className="h-40 relative">
                  {/* Background grid lines */}
                  <div className="absolute inset-0 grid grid-rows-4 w-full h-full">
                    <div className="border-t border-neutral-100 dark:border-neutral-800"></div>
                    <div className="border-t border-neutral-100 dark:border-neutral-800"></div>
                    <div className="border-t border-neutral-100 dark:border-neutral-800"></div>
                    <div className="border-t border-neutral-100 dark:border-neutral-800"></div>
                  </div>
                  
                  {/* Zero line */}
                  <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-neutral-300 dark:border-neutral-600"></div>
                  
                  {/* Chart area */}
                  <div className="absolute inset-0 flex items-center">
                    <svg className="w-full h-full" viewBox={`0 0 ${pnlCurveData.length > 1 ? pnlCurveData.length-1 : 1} 100`} preserveAspectRatio="none">
                      {/* Area fill under the curve */}
                      <defs>
                        <linearGradient id={`pnl-gradient-${date}`} x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor={totalPnL >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.2" />
                          <stop offset="100%" stopColor={totalPnL >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {pnlCurveData.length > 1 && (
                        <>
                          {/* Area under the curve */}
                          <path 
                            d={`M0,${50 - (pnlCurveData[0].pnl / Math.max(...pnlCurveData.map(p => Math.max(Math.abs(p.pnl), 0.01))) * 45)} 
                              ${pnlCurveData.slice(1).map((point, i) => {
                                const y = 50 - (point.pnl / Math.max(...pnlCurveData.map(p => Math.max(Math.abs(p.pnl), 0.01))) * 45);
                                return `L${i+1},${y}`;
                              }).join(' ')} 
                              L${pnlCurveData.length-1},50 L0,50 Z`}
                            fill={`url(#pnl-gradient-${date})`}
                            strokeWidth="0"
                          />
                          
                          {/* Line curve */}
                          <path 
                            d={`M0,${50 - (pnlCurveData[0].pnl / Math.max(...pnlCurveData.map(p => Math.max(Math.abs(p.pnl), 0.01))) * 45)} 
                              ${pnlCurveData.slice(1).map((point, i) => {
                                const y = 50 - (point.pnl / Math.max(...pnlCurveData.map(p => Math.max(Math.abs(p.pnl), 0.01))) * 45);
                                return `L${i+1},${y}`;
                              }).join(' ')}`}
                            fill="none"
                            stroke={totalPnL >= 0 ? "#22c55e" : "#ef4444"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </>
                      )}
                      
                      {/* Dots for each trade */}
                      {pnlCurveData.map((point, i) => {
                        const y = 50 - (point.pnl / Math.max(...pnlCurveData.map(p => Math.max(Math.abs(p.pnl), 0.01))) * 45);
                        return (
                          <g key={i}>
                            {/* Highlight circle */}
                            <circle 
                              cx={i} 
                              cy={y} 
                              r="5" 
                              fill={point.pnl >= 0 ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"} 
                              className="opacity-0 hover:opacity-100 transition-opacity duration-200"
                            />
                            {/* Main dot */}
                            <circle 
                              cx={i} 
                              cy={y} 
                              r="3" 
                              fill={point.pnl >= 0 ? "#22c55e" : "#ef4444"}
                              stroke={point.pnl >= 0 ? "#fff" : "#fff"}
                              strokeWidth="1"
                              className="hover:stroke-2 transition-all duration-200"
                            >
                              <title>{point.symbol}: ${point.pnl.toFixed(2)}</title>
                            </circle>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Y-axis labels */}
                  <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] text-neutral-400 py-1">
                    <div>+100%</div>
                    <div>+50%</div>
                    <div>0%</div>
                    <div>-50%</div>
                    <div>-100%</div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center">
                    <span className="font-medium">Trade #1</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Trade #{pnlCurveData.length}</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trades List */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700 pb-2">
              Trades for {format(new Date(date), "MMM dd, yyyy")}
            </h3>
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

export default DailyAccordionCard;