import React, { useState } from 'react';
import { Plus, Calendar, Filter, Search, TrendingUp, TrendingDown, Target } from 'lucide-react';
import TradeForm from './TradeForm';
import TradeCard from './TradeCard';
import { useTrades } from '../../hooks/useTrades';

const DailyJournal: React.FC = () => {
  const { trades, addTrade, loading } = useTrades();
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSetup, setFilterSetup] = useState('');

  const handleAddTrade = async (tradeData: any) => {
    try {
      await addTrade(tradeData);
      setShowTradeForm(false);
    } catch (error) {
      console.error('Failed to add trade:', error);
    }
  };

  const filteredTrades = trades.filter(trade => {
    const matchesDate = trade.date === selectedDate;
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.setup.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSetup = !filterSetup || trade.setup === filterSetup;
    
    return matchesDate && matchesSearch && matchesSetup;
  });

  const todayStats = {
    totalTrades: filteredTrades.length,
    totalPnL: filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0),
    winRate: filteredTrades.length > 0 
      ? (filteredTrades.filter(trade => trade.pnl > 0).length / filteredTrades.length) * 100 
      : 0,
    avgTrade: filteredTrades.length > 0 
      ? filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0) / filteredTrades.length 
      : 0
  };

  const setupOptions = ['Breakout', 'Pullback', 'Reversal', 'Gap Fill', 'Momentum', 'Support/Resistance'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading trades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Daily Journal
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Record and analyze your daily trading activities
          </p>
        </div>
        
        <button
          onClick={() => setShowTradeForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trade</span>
        </button>
      </div>

      {/* Date Selection and Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-neutral-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by symbol or setup..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={filterSetup}
              onChange={(e) => setFilterSetup(e.target.value)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Setups</option>
              {setupOptions.map(setup => (
                <option key={setup} value={setup}>{setup}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {todayStats.totalTrades}
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
              todayStats.totalPnL >= 0 
                ? 'bg-profit-100 dark:bg-profit-900/30' 
                : 'bg-loss-100 dark:bg-loss-900/30'
            }`}>
              {todayStats.totalPnL >= 0 ? (
                <TrendingUp className="w-6 h-6 text-profit-600 dark:text-profit-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-loss-600 dark:text-loss-400" />
              )}
            </div>
            <div>
              <div className={`text-2xl font-bold ${
                todayStats.totalPnL >= 0 
                  ? 'text-profit-600 dark:text-profit-400' 
                  : 'text-loss-600 dark:text-loss-400'
              }`}>
                ${todayStats.totalPnL.toFixed(2)}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Daily P&L
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
                {todayStats.winRate.toFixed(1)}%
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
              <TrendingUp className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${
                todayStats.avgTrade >= 0 
                  ? 'text-profit-600 dark:text-profit-400' 
                  : 'text-loss-600 dark:text-loss-400'
              }`}>
                ${todayStats.avgTrade.toFixed(2)}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Avg Trade
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trades List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Trades for {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h2>
        
        {filteredTrades.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
            <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No trades for this date
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Start by adding your first trade of the day
            </p>
            <button
              onClick={() => setShowTradeForm(true)}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Add Trade
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTrades.map(trade => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>
        )}
      </div>

      {/* Trade Form Modal */}
      {showTradeForm && (
        <TradeForm
          onSubmit={handleAddTrade}
          onCancel={() => setShowTradeForm(false)}
        />
      )}
    </div>
  );
};

export default DailyJournal;