import React, { useState } from 'react';
import { Calendar, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  onClose: () => void;
  onApply: (dateRange: DateRange) => void;
  initialRange: DateRange;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onClose,
  onApply,
  initialRange
}) => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);
  
  // Predefined date ranges
  const predefinedRanges = [
    { 
      label: t('date_ranges.today'), 
      getValue: () => {
        const today = new Date();
        const formatted = today.toISOString().split('T')[0];
        return { startDate: formatted, endDate: formatted };
      }
    },
    { 
      label: t('date_ranges.yesterday'), 
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const formatted = yesterday.toISOString().split('T')[0];
        return { startDate: formatted, endDate: formatted };
      }
    },
    { 
      label: t('date_ranges.this_week'), 
      getValue: () => {
        const today = new Date();
        const firstDay = new Date(today);
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
        firstDay.setDate(diff);
        
        return { 
          startDate: firstDay.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0]
        };
      }
    },
    { 
      label: t('date_ranges.last_7_days'), 
      getValue: () => {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        
        return { 
          startDate: sevenDaysAgo.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0]
        };
      }
    },
    { 
      label: t('date_ranges.this_month'), 
      getValue: () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        return { 
          startDate: firstDay.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0]
        };
      }
    },
    { 
      label: t('date_ranges.last_30_days'), 
      getValue: () => {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        return { 
          startDate: thirtyDaysAgo.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0]
        };
      }
    },
    { 
      label: t('date_ranges.this_year'), 
      getValue: () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), 0, 1);
        
        return { 
          startDate: firstDay.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0]
        };
      }
    },
    { 
      label: t('date_ranges.all_time'), 
      getValue: () => {
        const today = new Date();
        const firstDay = new Date(2020, 0, 1); // Assuming the app started in 2020
        
        return { 
          startDate: firstDay.toISOString().split('T')[0], 
          endDate: today.toISOString().split('T')[0]
        };
      }
    },
  ];

  const handleApply = () => {
    onApply(dateRange);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 w-full max-w-md">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            {t('dashboard.buttons.date_range')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Custom Range Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                {t('filters.start_date')}
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                {t('filters.end_date')}
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Predefined Ranges */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('date_ranges.predefined')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {predefinedRanges.map((range, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setDateRange(range.getValue())}
                  className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                >
                  {range.label}
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

export default DateRangePicker; 