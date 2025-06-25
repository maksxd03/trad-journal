import React, { useState } from 'react';
import { Filter, Calendar, TrendingUp, TrendingDown, X, ChevronDown, ChevronUp } from 'lucide-react';

interface TradeFiltersProps {
  filters: {
    dateRange: { start: string; end: string };
    symbol: string;
    type: 'all' | 'long' | 'short';
    setup: string;
    minPnL: string;
    maxPnL: string;
    tags: string[];
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

const TradeFilters: React.FC<TradeFiltersProps> = ({ filters, onFiltersChange, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const setupOptions = ['Breakout', 'Pullback', 'Reversal', 'Gap Fill', 'Momentum', 'Support/Resistance'];
  const commonTags = ['momentum', 'tech', 'reversal', 'index', 'gap', 'earnings'];

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateDateRange = (key: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: { ...filters.dateRange, [key]: value }
    });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilter('tags', newTags);
  };

  const hasActiveFilters = 
    filters.symbol || 
    filters.type !== 'all' || 
    filters.setup || 
    filters.minPnL || 
    filters.maxPnL || 
    filters.tags.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;
    
  // Get active filters summary for collapsed state
  const getActiveFiltersSummary = () => {
    const parts = [];
    
    if (filters.dateRange.start || filters.dateRange.end) {
      parts.push('Date');
    }
    
    if (filters.symbol) {
      parts.push(`Symbol: ${filters.symbol}`);
    }
    
    if (filters.type !== 'all') {
      parts.push(`Type: ${filters.type}`);
    }
    
    if (filters.setup) {
      parts.push(`Setup: ${filters.setup}`);
    }
    
    if (filters.minPnL || filters.maxPnL) {
      parts.push('P&L Range');
    }
    
    if (filters.tags.length > 0) {
      parts.push(`Tags: ${filters.tags.length}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'None';
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 transition-all">
      {/* Header - always visible */}
      <div 
        className="flex items-center justify-between cursor-pointer py-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Filters</h3>
          
          {/* Counters and summarized info - visible when collapsed */}
          {!isExpanded && hasActiveFilters && (
            <div className="ml-3 flex">
              <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                {getActiveFiltersSummary()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearFilters();
              }}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          )}
        </div>
      </div>

      {/* Filters content - conditionally rendered */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => updateDateRange('start', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => updateDateRange('end', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="End date"
                />
              </div>
            </div>

            {/* Symbol */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Symbol
              </label>
              <input
                type="text"
                value={filters.symbol}
                onChange={(e) => updateFilter('symbol', e.target.value)}
                placeholder="AAPL, TSLA..."
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Position Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Position Type
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateFilter('type', 'all')}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    filters.type === 'all'
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => updateFilter('type', 'long')}
                  className={`flex-1 flex items-center justify-center px-3 py-2 text-sm rounded-lg border transition-colors ${
                    filters.type === 'long'
                      ? 'bg-profit-500 text-white border-profit-500'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Long
                </button>
                <button
                  onClick={() => updateFilter('type', 'short')}
                  className={`flex-1 flex items-center justify-center px-3 py-2 text-sm rounded-lg border transition-colors ${
                    filters.type === 'short'
                      ? 'bg-loss-500 text-white border-loss-500'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 mr-1" />
                  Short
                </button>
              </div>
            </div>

            {/* Setup */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Setup
              </label>
              <select
                value={filters.setup}
                onChange={(e) => updateFilter('setup', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Setups</option>
                {setupOptions.map(setup => (
                  <option key={setup} value={setup}>{setup}</option>
                ))}
              </select>
            </div>

            {/* P&L Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                P&L Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.minPnL}
                  onChange={(e) => updateFilter('minPnL', e.target.value)}
                  placeholder="Min P&L"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={filters.maxPnL}
                  onChange={(e) => updateFilter('maxPnL', e.target.value)}
                  placeholder="Max P&L"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.tags.includes(tag)
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeFilters;