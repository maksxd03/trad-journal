import React, { useState, useMemo } from 'react';
import { Download, Upload, BarChart3, TrendingUp, Target, Calculator } from 'lucide-react';
import TradeFilters from './TradeFilters';
import TradeTable from './TradeTable';
import { Trade } from '../../types/trade';
import { mockTrades } from '../../utils/mockData';

const TradesView: React.FC = () => {
  const [trades] = useState<Trade[]>(mockTrades);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    symbol: '',
    type: 'all' as 'all' | 'long' | 'short',
    setup: '',
    minPnL: '',
    maxPnL: '',
    tags: [] as string[]
  });

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      // Date range filter
      if (filters.dateRange.start && trade.date < filters.dateRange.start) return false;
      if (filters.dateRange.end && trade.date > filters.dateRange.end) return false;
      
      // Symbol filter
      if (filters.symbol && !trade.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) return false;
      
      // Type filter
      if (filters.type !== 'all' && trade.type !== filters.type) return false;
      
      // Setup filter
      if (filters.setup && trade.setup !== filters.setup) return false;
      
      // P&L range filter
      if (filters.minPnL && trade.pnl < parseFloat(filters.minPnL)) return false;
      if (filters.maxPnL && trade.pnl > parseFloat(filters.maxPnL)) return false;
      
      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => trade.tags.includes(tag))) return false;
      
      return true;
    });
  }, [trades, filters]);

  const stats = useMemo(() => {
    const totalTrades = filteredTrades.length;
    const winningTrades = filteredTrades.filter(trade => trade.pnl > 0);
    const losingTrades = filteredTrades.filter(trade => trade.pnl < 0);
    
    const totalPnL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalWinAmount = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLossAmount = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
    
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : 0;
    const avgTrade = totalTrades > 0 ? totalPnL / totalTrades : 0;
    
    return {
      totalTrades,
      totalPnL,
      winRate,
      profitFactor,
      avgTrade,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length
    };
  }, [filteredTrades]);

  const clearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      symbol: '',
      type: 'all',
      setup: '',
      minPnL: '',
      maxPnL: '',
      tags: []
    });
  };

  const handleExport = () => {
    // Implementation for CSV export
    console.log('Exporting trades to CSV...');
  };

  const handleImport = () => {
    // Implementation for trade import
    console.log('Importing trades...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Trade Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Comprehensive trade tracking and analysis
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleImport}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import Trades</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <Download className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-neutral-700 dark:text-neutral-300">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats.totalTrades}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Trades
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              stats.totalPnL >= 0 
                ? 'bg-profit-100 dark:bg-profit-900/30' 
                : 'bg-loss-100 dark:bg-loss-900/30'
            }`}>
              <TrendingUp className={`w-6 h-6 ${
                stats.totalPnL >= 0 
                  ? 'text-profit-600 dark:text-profit-400' 
                  : 'text-loss-600 dark:text-loss-400'
              }`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${
                stats.totalPnL >= 0 
                  ? 'text-profit-600 dark:text-profit-400' 
                  : 'text-loss-600 dark:text-loss-400'
              }`}>
                ${stats.totalPnL.toFixed(2)}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Total P&L
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
              <Target className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Win Rate
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <Calculator className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats.profitFactor.toFixed(2)}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Profit Factor
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <TradeFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      {/* Results Summary */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Trade Results
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {filteredTrades.length} of {trades.length} trades
            </p>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-profit-600 dark:text-profit-400">
                {stats.winningTrades}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-loss-600 dark:text-loss-400">
                {stats.losingTrades}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">Losses</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${
                stats.avgTrade >= 0 
                  ? 'text-profit-600 dark:text-profit-400' 
                  : 'text-loss-600 dark:text-loss-400'
              }`}>
                ${stats.avgTrade.toFixed(2)}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">Avg Trade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <TradeTable trades={filteredTrades} />
    </div>
  );
};

export default TradesView;