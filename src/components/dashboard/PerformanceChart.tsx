import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface PerformanceData {
  date: string;
  cumulativePnL?: number;
  dailyPnL?: number;
  pnl?: number;
  value?: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  type?: 'line' | 'area' | 'bar';
  compact?: boolean;
  showGradient?: boolean;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  data, 
  type = 'line', 
  compact = false, 
  showGradient = false 
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">{label}</p>
          <p className="text-sm text-profit-600 dark:text-profit-400">
            Value: ${payload[0].value?.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const chartProps = {
    data,
    margin: compact 
      ? { top: 5, right: 5, left: 5, bottom: 5 } 
      : { top: 5, right: 10, left: 0, bottom: 10 }
  };

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart {...chartProps}>
            {!compact && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />}
            {!compact && (
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={5}
              />
            )}
            {!compact && (
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                width={40}
              />
            )}
            {!compact && <Tooltip content={<CustomTooltip />} />}
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00B894" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="#00B894" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#00B894" stopOpacity={0.05}/>
                <stop offset="100%" stopColor="#00B894" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="cumulativePnL" 
              stroke="#00B894" 
              strokeWidth={2}
              fill={showGradient ? "url(#areaGradient)" : "#00B894"}
              fillOpacity={showGradient ? 1 : 0.1}
              baseValue="dataMin"
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...chartProps}>
            {!compact && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />}
            {!compact && (
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
            )}
            {!compact && (
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
            )}
            {!compact && <Tooltip content={<CustomTooltip />} />}
            <Bar 
              dataKey="pnl" 
              fill={(entry: any) => entry.pnl >= 0 ? '#00B894' : '#D63031'}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        );
      
      default:
        return (
          <LineChart {...chartProps}>
            {!compact && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />}
            {!compact && (
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
            )}
            {!compact && (
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
            )}
            {!compact && <Tooltip content={<CustomTooltip />} />}
            <Line 
              type="monotone" 
              dataKey={compact ? "value" : "cumulativePnL"} 
              stroke="#004E64" 
              strokeWidth={compact ? 2 : 3}
              dot={compact ? false : { fill: '#004E64', strokeWidth: 2, r: 4 }}
              activeDot={compact ? false : { r: 6, stroke: '#004E64', strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className={compact ? "h-full" : "h-full w-full"}>
      <ResponsiveContainer width="100%" height="100%" minHeight={100}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;