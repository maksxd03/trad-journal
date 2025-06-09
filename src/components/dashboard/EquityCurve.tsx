import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import { Calendar, ZoomIn, TrendingUp } from 'lucide-react';

interface EquityCurveProps {
  data: Array<{
    date: string;
    equity: number;
    drawdown: number;
    deposits: number;
  }>;
}

const EquityCurve: React.FC<EquityCurveProps> = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('3M');
  const [showDrawdown, setShowDrawdown] = useState(false);

  const periods = [
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '6M', value: '6M' },
    { label: '1Y', value: '1Y' },
    { label: 'All', value: 'All' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-600 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Equity Curve
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Account evolution with zoom controls
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDrawdown(!showDrawdown)}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              showDrawdown 
                ? 'bg-loss-100 dark:bg-loss-900/30 text-loss-700 dark:text-loss-400'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Drawdown
          </button>
          
          <div className="flex bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1">
            {periods.map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Line 
              type="monotone" 
              dataKey="equity" 
              stroke="#00B894" 
              strokeWidth={3}
              dot={false}
              name="Account Equity"
            />
            
            <Line 
              type="monotone" 
              dataKey="deposits" 
              stroke="#6C5CE7" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Deposits"
            />

            {showDrawdown && (
              <Line 
                type="monotone" 
                dataKey="drawdown" 
                stroke="#D63031" 
                strokeWidth={2}
                dot={false}
                name="Drawdown"
              />
            )}

            <Brush 
              dataKey="date" 
              height={30} 
              stroke="#004E64"
              fill="#004E64"
              fillOpacity={0.1}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EquityCurve;