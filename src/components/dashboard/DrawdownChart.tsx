import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, AlertTriangle } from 'lucide-react';

interface DrawdownChartProps {
  data: Array<{
    date: string;
    drawdown: number;
    peak: number;
    recovery: number;
  }>;
}

const DrawdownChart: React.FC<DrawdownChartProps> = ({ data }) => {
  const maxDrawdown = Math.min(...data.map(d => d.drawdown));
  const currentDrawdown = data[data.length - 1]?.drawdown || 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-900 dark:text-white mb-2">{label}</p>
          <p className="text-sm text-loss-600 dark:text-loss-400">
            Drawdown: {payload[0].value?.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-600 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-loss-100 dark:bg-loss-900/30 rounded-lg">
            <TrendingDown className="w-5 h-5 text-loss-600 dark:text-loss-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Drawdown Analysis
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Risk periods and recovery tracking
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Max DD</div>
            <div className="text-lg font-bold text-loss-600 dark:text-loss-400">
              {maxDrawdown.toFixed(2)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">Current</div>
            <div className={`text-lg font-bold ${
              currentDrawdown < -5 
                ? 'text-loss-600 dark:text-loss-400' 
                : 'text-neutral-600 dark:text-neutral-400'
            }`}>
              {currentDrawdown.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {currentDrawdown < -10 && (
        <div className="mb-4 p-3 bg-loss-50 dark:bg-loss-900/20 border border-loss-200 dark:border-loss-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-loss-600 dark:text-loss-400" />
            <span className="text-sm font-medium text-loss-700 dark:text-loss-300">
              High Drawdown Alert: Consider reducing position sizes
            </span>
          </div>
        </div>
      )}

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area 
              type="monotone" 
              dataKey="drawdown" 
              stroke="#D63031" 
              strokeWidth={2}
              fill="url(#drawdownGradient)"
            />

            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D63031" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#D63031" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DrawdownChart;