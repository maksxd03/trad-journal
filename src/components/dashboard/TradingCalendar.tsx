import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { CalendarTrade } from '../../types/trade';
import { useTranslation } from 'react-i18next';

interface TradingCalendarProps {
  data: CalendarTrade[];
  enhanced?: boolean;
  onDateClick?: (date: string) => void;
  compact?: boolean;
}

const TradingCalendar: React.FC<TradingCalendarProps> = ({ data, enhanced = false, onDateClick, compact = false }) => {
  const { t } = useTranslation();
  // Set the current date to June 19, 2025
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 19)); // June 2025 (month is 0-indexed)

  // Function to check if a date is our simulated "today" (June 19, 2025)
  const isSimulatedToday = (date: Date) => {
    return date.getFullYear() === 2025 && 
           date.getMonth() === 5 && 
           date.getDate() === 19;
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calcular semanas do mês
  const weeks = eachWeekOfInterval({ 
    start: startOfWeek(monthStart), 
    end: endOfWeek(monthEnd) 
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getTradeForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return data.find(trade => trade.date === dateStr);
  };

  // Handle day click
  const handleDayClick = (day: Date) => {
    if (onDateClick && isSameMonth(day, currentDate)) {
      const dateStr = format(day, 'yyyy-MM-dd');
      const trade = data.find(t => t.date === dateStr);
      
      // Only trigger click for dates that have trades
      if (trade) {
        onDateClick(dateStr);
      }
    }
  };

  // Calcular total da semana
  const getWeeklyTotal = (weekStart: Date) => {
    const weekEnd = endOfWeek(weekStart);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return weekDays.reduce((total, day) => {
      const trade = getTradeForDate(day);
      return total + (trade ? trade.pnl : 0);
    }, 0);
  };

  const getPnLColor = (pnl: number, tradeCount: number) => {
    if (pnl > 0) {
      // Verde pastel para lucros - gradação suave
      if (pnl >= 1500) return 'bg-gradient-to-br from-green-200 to-green-300 text-green-800 border border-green-300 shadow-sm';
      if (pnl >= 500) return 'bg-gradient-to-br from-green-100 to-green-200 text-green-700 border border-green-200 shadow-sm';
      return 'bg-gradient-to-br from-green-50 to-green-100 text-green-600 border border-green-100';
    } else if (pnl < 0) {
      // Rosa/vermelho pastel para perdas - gradação suave
      if (Math.abs(pnl) >= 1500) return 'bg-gradient-to-br from-red-200 to-red-300 text-red-800 border border-red-300 shadow-sm';
      if (Math.abs(pnl) >= 500) return 'bg-gradient-to-br from-red-100 to-red-200 text-red-700 border border-red-200 shadow-sm';
      return 'bg-gradient-to-br from-red-50 to-red-100 text-red-600 border border-red-100';
    } else {
      // Azul pastel para breakeven
      return 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border border-blue-100';
    }
  };

  const getWeeklyTotalColor = (total: number) => {
    if (total > 0) {
      return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-600';
    } else if (total < 0) {
      return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-600';
    }
    return 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600';
  };

  const formatPnL = (pnl: number) => {
    if (Math.abs(pnl) >= 1000) {
      return `${pnl > 0 ? '' : '-'}$${(Math.abs(pnl) / 1000).toFixed(pnl >= 10000 ? 0 : 1)}K`;
    }
    return `${pnl > 0 ? '' : '-'}$${Math.abs(pnl).toFixed(0)}`;
  };

  // Dias da semana traduzidos
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
    t(`calendar.days.${day.toLowerCase()}`)
  );

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-600 ${compact ? 'shadow-sm' : 'shadow-xl'} overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${compact ? 'p-3' : 'p-6'} border-b border-neutral-200 dark:border-neutral-600 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className={`${compact ? 'p-1.5' : 'p-3'} rounded-lg hover:bg-white dark:hover:bg-neutral-600 transition-all duration-200 shadow-sm`}
          >
            <ChevronLeft className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-neutral-600 dark:text-neutral-400`} />
          </button>
          
          <div className={`${compact ? 'text-base' : 'text-2xl'} font-bold text-neutral-900 dark:text-white`}>
            {format(currentDate, 'MMMM yyyy')}
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            className={`${compact ? 'p-1.5' : 'p-3'} rounded-lg hover:bg-white dark:hover:bg-neutral-600 transition-all duration-200 shadow-sm`}
          >
            <ChevronRight className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-neutral-600 dark:text-neutral-400`} />
          </button>
        </div>
        
        <button 
          onClick={() => setCurrentDate(new Date(2025, 5, 1))}
          className={`${compact ? 'px-3 py-1.5 text-xs rounded-lg' : 'px-6 py-3 rounded-xl text-sm'} bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-all duration-200 ${compact ? 'shadow-sm' : 'shadow-lg hover:shadow-xl'}`}
        >
          {t('common.this_month')}
        </button>
      </div>

      {/* Calendar Grid */}
      <div className={compact ? 'p-2' : 'p-6'}>
        {/* Day Headers */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className={`text-center ${compact ? 'text-xs py-1' : 'text-sm py-3'} font-semibold text-neutral-500 dark:text-neutral-400`}>
              {day}
            </div>
          ))}
          <div className={`text-center ${compact ? 'text-xs py-1' : 'text-sm py-3'} font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-lg`}>
            {t('calendar.weekly')}
          </div>
        </div>

        {/* Calendar Weeks */}
        {weeks.map((weekStart, weekIndex) => {
          const weekDays = eachDayOfInterval({ 
            start: weekStart, 
            end: endOfWeek(weekStart) 
          });
          const weeklyTotal = getWeeklyTotal(weekStart);

          return (
            <div key={weekIndex} className="grid grid-cols-8 gap-1 mb-1">
              {/* Days of the week */}
              {weekDays.map(day => {
                const trade = getTradeForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const hasTrades = !!trade;

                return (
                  <div
                    key={day.toString()}
                    onClick={() => handleDayClick(day)}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-300 relative text-center ${compact ? 'p-1 min-h-[50px]' : 'p-3 min-h-[85px]'}
                      ${!isCurrentMonth 
                        ? 'text-neutral-300 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 opacity-40' 
                        : trade 
                          ? `${getPnLColor(trade.pnl, trade.tradeCount)} hover:scale-105 hover:z-10 hover:shadow-lg transform cursor-pointer` 
                          : 'bg-white dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                      }
                      ${isSimulatedToday(day) && isCurrentMonth ? 'ring-2 ring-primary-500' : ''}
                      ${hasTrades && isCurrentMonth ? 'cursor-pointer' : ''}
                    `}
                  >
                    <div className={`${compact ? 'text-xs' : 'text-base'} font-bold ${trade ? 'mb-0.5' : ''}`}>
                      {day.getDate()}
                    </div>
                    {trade && (
                      <>
                        <div className={`${compact ? 'text-[10px]' : 'text-xs'} font-black leading-tight ${compact ? 'mb-0.5' : 'mb-1'}`}>
                          {formatPnL(trade.pnl)}
                        </div>
                        <div className={`${compact ? 'text-[9px]' : 'text-xs'} opacity-80 leading-tight font-medium`}>
                          {trade.tradeCount} {trade.tradeCount !== 1 ? t('calendar.trades') : t('calendar.trade')}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Weekly Total */}
              <div className={`
                aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-300 ${compact ? 'min-h-[50px] p-1' : 'min-h-[85px] p-3'} font-bold ${compact ? 'shadow-sm' : 'shadow-md'}
                ${getWeeklyTotalColor(weeklyTotal)}
              `}>
                <div className={`${compact ? 'text-[9px]' : 'text-xs'} font-semibold ${compact ? 'mb-0.5' : 'mb-1'} opacity-90`}>{t('calendar.week')}</div>
                <div className={`${compact ? 'text-xs' : 'text-sm'} font-black`}>
                  {formatPnL(weeklyTotal)}
                </div>
                <div className={`${compact ? 'text-[9px]' : 'text-xs'} opacity-70 ${compact ? 'mt-0.5' : 'mt-1'}`}>
                  {t('calendar.total')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TradingCalendar;