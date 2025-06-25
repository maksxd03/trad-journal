import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DailyTradeData {
  date: string; 
  totalPnL: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  displayDate?: string;
}

interface DailyPerformanceProps {
  data: DailyTradeData[];
}

const DailyPerformance: React.FC<DailyPerformanceProps> = ({ data }) => {
  const { t } = useTranslation();
  
  // Processar os dados para exibição
  const chartData = useMemo(() => {
    // Ordenar por data (mais recente para mais antiga)
    const sortedData = [...data].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Limitar aos últimos 14 dias com operações
    const recentData = sortedData.slice(0, 14);
    
    // Formatar datas para exibição
    return recentData.map(day => ({
      ...day,
      displayDate: new Date(day.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    })).reverse(); // Reverter para mostrar em ordem cronológica no gráfico
  }, [data]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (data.length === 0) return { 
      profitDays: 0, 
      lossDays: 0,
      bestDay: { date: '', pnl: 0 },
      worstDay: { date: '', pnl: 0 },
      averageDailyPnL: 0
    };

    const profitDays = data.filter(day => day.totalPnL > 0).length;
    const lossDays = data.filter(day => day.totalPnL < 0).length;
    
    const bestDay = data.reduce((best, current) => 
      current.totalPnL > best.totalPnL ? current : best, 
      { date: '', totalPnL: -Infinity }
    );
    
    const worstDay = data.reduce((worst, current) => 
      current.totalPnL < worst.totalPnL ? current : worst, 
      { date: '', totalPnL: Infinity }
    );
    
    const totalPnL = data.reduce((sum, day) => sum + day.totalPnL, 0);
    const averageDailyPnL = data.length > 0 ? totalPnL / data.length : 0;

    return {
      profitDays,
      lossDays,
      bestDay: { 
        date: bestDay.date, 
        pnl: bestDay.totalPnL 
      },
      worstDay: { 
        date: worstDay.date, 
        pnl: worstDay.totalPnL 
      },
      averageDailyPnL
    };
  }, [data]);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const winRate = data.tradeCount > 0 ? (data.winCount / data.tradeCount) * 100 : 0;
      
      return (
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-bold text-neutral-900 dark:text-white mb-1">{data.displayDate}</p>
          <p className={`text-sm font-medium ${data.totalPnL >= 0 ? 'text-profit-600 dark:text-profit-400' : 'text-loss-600 dark:text-loss-400'}`}>
            P&L: {data.totalPnL >= 0 ? '+' : ''}{data.totalPnL.toFixed(2)}
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            {data.tradeCount} {data.tradeCount === 1 ? 'trade' : 'trades'}
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Win rate: {winRate.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Formatação de datas
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Formatação de valores monetários
  const formatCurrency = (value: number): string => {
    return value >= 0 
      ? `+$${value.toFixed(0)}` 
      : `-$${Math.abs(value).toFixed(0)}`;
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-600 p-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <BarChart2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            {t('dashboard.daily_performance', 'Daily Performance')}
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {t('dashboard.daily_performance_subtitle', 'P&L by trading day')}
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400">
          <Calendar className="w-8 h-8 mb-2 opacity-60" />
          <p className="text-sm font-medium">No trading data available</p>
          <p className="text-xs">Add trades to see your daily performance</p>
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 25, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="totalPnL" 
                radius={[4, 4, 0, 0]}
                maxBarSize={35}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.totalPnL >= 0 ? '#00B894' : '#D63031'}
                    stroke={entry.totalPnL >= 0 ? '#00B894' : '#D63031'}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              {t('dashboard.profit_loss_days', 'Profit/Loss Days')}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <div className="flex items-center">
                <TrendingUp className="w-3 h-3 text-profit-500 mr-1" />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  {stats.profitDays} {t('dashboard.profitable_days', 'profitable')}
                </span>
              </div>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-3 h-3 text-loss-500 mr-1" />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  {stats.lossDays} {t('dashboard.losing_days', 'losing')}
                </span>
              </div>
            </div>
            <div className="flex h-8 items-end">
              {/* Simplified win rate visualization */}
              {data.length > 0 && (
                <div className="flex items-center">
                  <div className="w-20 h-3 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex">
                    <div 
                      className="h-full bg-profit-500" 
                      style={{ width: `${(stats.profitDays / (stats.profitDays + stats.lossDays)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium ml-1 text-neutral-700 dark:text-neutral-300">
                    {((stats.profitDays / (stats.profitDays + stats.lossDays)) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mb-2">
            {t('dashboard.best_worst_days', 'Best/Worst Days')}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center">
                <TrendingUp className="w-3 h-3 text-profit-500 mr-1" />
                {stats.bestDay.date ? formatDate(stats.bestDay.date) : '--'}
              </span>
              <span className="text-xs font-medium text-profit-600 dark:text-profit-400">
                {stats.bestDay.pnl ? formatCurrency(stats.bestDay.pnl) : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center">
                <TrendingDown className="w-3 h-3 text-loss-500 mr-1" />
                {stats.worstDay.date ? formatDate(stats.worstDay.date) : '--'}
              </span>
              <span className="text-xs font-medium text-loss-600 dark:text-loss-400">
                {stats.worstDay.pnl ? formatCurrency(stats.worstDay.pnl) : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPerformance; 