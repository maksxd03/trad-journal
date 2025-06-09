import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { CalendarTrade } from '../../types/trade';

interface TradingCalendarProps {
  data: CalendarTrade[];
  enhanced?: boolean;
}

const TradingCalendar: React.FC<TradingCalendarProps> = ({ data, enhanced = false }) => {
  // Definir dezembro de 2023 como padrão para mostrar os dados reais
  const [currentDate, setCurrentDate] = useState(new Date(2023, 11, 1)); // Dezembro 2023

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

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-600 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-600 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-3 rounded-xl hover:bg-white dark:hover:bg-neutral-600 transition-all duration-200 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
          
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-3 rounded-xl hover:bg-white dark:hover:bg-neutral-600 transition-all duration-200 shadow-sm"
          >
            <ChevronRight className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>
        
        <button className="px-6 py-3 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl">
          This month
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-8 gap-4 mb-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-neutral-500 dark:text-neutral-400 py-3">
              {day}
            </div>
          ))}
          <div className="text-center text-sm font-semibold text-primary-600 dark:text-primary-400 py-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
            Weekly
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
            <div key={weekIndex} className="grid grid-cols-8 gap-4 mb-4">
              {/* Days of the week */}
              {weekDays.map(day => {
                const trade = getTradeForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={day.toString()}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-300 cursor-pointer relative text-center p-3 min-h-[85px]
                      ${!isCurrentMonth 
                        ? 'text-neutral-300 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 opacity-40' 
                        : trade 
                          ? `${getPnLColor(trade.pnl, trade.tradeCount)} hover:scale-105 hover:z-10 hover:shadow-lg transform` 
                          : 'bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-700 dark:to-neutral-600 border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-br hover:from-neutral-100 hover:to-neutral-200 dark:hover:from-neutral-600 dark:hover:to-neutral-500'
                      }
                      ${isTodayDate && isCurrentMonth ? 'ring-2 ring-primary-400 ring-offset-2 dark:ring-offset-neutral-800' : ''}
                    `}
                  >
                    <div className={`text-base font-bold ${trade ? 'mb-1' : ''}`}>
                      {day.getDate()}
                    </div>
                    {trade && (
                      <>
                        <div className="text-xs font-black leading-tight mb-1">
                          {formatPnL(trade.pnl)}
                        </div>
                        <div className="text-xs opacity-80 leading-tight font-medium">
                          {trade.tradeCount} trade{trade.tradeCount !== 1 ? 's' : ''}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Weekly Total - DESTACADO */}
              <div className={`
                aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300 min-h-[85px] p-3 font-bold shadow-md
                ${getWeeklyTotalColor(weeklyTotal)}
              `}>
                <div className="text-xs font-semibold mb-1 opacity-90">Week</div>
                <div className="text-sm font-black">
                  {formatPnL(weeklyTotal)}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  Total
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