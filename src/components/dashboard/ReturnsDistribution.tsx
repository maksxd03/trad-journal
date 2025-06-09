import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

interface ReturnsDistributionProps {
  data: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

const ReturnsDistribution: React.FC<ReturnsDistributionProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-900 dark:text-white mb-2">{label}</p>
          <p className="text-sm text-primary-600 dark:text-primary-400">
            Trades: {payload[0].value}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {payload[0].payload.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (range: string) => {
    if (range.includes('-')) return '#D63031'; // Loss
    if (range.includes('+')) return '#00B894'; // Profit
    return '#6C5CE7'; // Neutral
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-600 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
          <BarChart3 className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Returns Distribution
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Histogram of trade outcomes
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="range" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              dataKey="count" 
              fill={(entry: any) => getBarColor(entry.range)}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-loss-50 dark:bg-loss-900/20 rounded-lg">
          <div className="text-sm text-loss-600 dark:text-loss-400 font-medium">Losses</div>
          <div className="text-lg font-bold text-loss-700 dark:text-loss-300">
            {data.filter(d => d.range.includes('-')).reduce((sum, d) => sum + d.count, 0)}
          </div>
        </div>
        <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
          <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Breakeven</div>
          <div className="text-lg font-bold text-neutral-700 dark:text-neutral-300">
            {data.find(d => d.range === '0')?.count || 0}
          </div>
        </div>
        <div className="p-3 bg-profit-50 dark:bg-profit-900/20 rounded-lg">
          <div className="text-sm text-profit-600 dark:text-profit-400 font-medium">Profits</div>
          <div className="text-lg font-bold text-profit-700 dark:text-profit-300">
            {data.filter(d => d.range.includes('+')).reduce((sum, d) => sum + d.count, 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsDistribution;