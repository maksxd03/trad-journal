import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAccounts } from '../../context/AccountsContext';

export interface FilterValues {
  startDate: string;
  endDate: string;
  accountId: string | null;
  tags: string[];
}

interface DashboardFiltersProps {
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  initialFilters: FilterValues;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ 
  onClose, 
  onApply, 
  initialFilters 
}) => {
  const { t } = useTranslation();
  const { accounts } = useAccounts();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  
  // Opções de tags comuns para filtrar
  const commonTags = ['Breakout', 'Pullback', 'Reversal', 'Gap Fill', 'Momentum'];
  
  const handleApply = () => {
    onApply(filters);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 w-full max-w-lg">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {t('dashboard.buttons.filters')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Date Range */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {t('dashboard.buttons.date_range')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  {t('filters.start_date')}
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  {t('filters.end_date')}
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          {/* Account */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('account')}
            </h3>
            <select
              value={filters.accountId || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, accountId: e.target.value || null }))}
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">{t('all_accounts')}</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
          </div>
          
          {/* Tags Filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('filters.tags')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setFilters(prev => {
                      if (prev.tags.includes(tag)) {
                        return { ...prev, tags: prev.tags.filter(t => t !== tag) };
                      } else {
                        return { ...prev, tags: [...prev.tags, tag] };
                      }
                    });
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
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
        
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center"
          >
            <Check className="w-4 h-4 mr-2" />
            {t('common.apply')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters; 