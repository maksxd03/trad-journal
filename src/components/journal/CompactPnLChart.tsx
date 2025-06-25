import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PnLDataPoint {
  tradeIndex: number;
  pnl: number;
  symbol: string;
}

interface CompactPnLChartProps {
  data: PnLDataPoint[];
  totalPnL: number;
}

const CompactPnLChart: React.FC<CompactPnLChartProps> = ({ data, totalPnL }) => {
  // Não mostrar gráfico se não houver dados suficientes
  if (!data || data.length < 2) {
    return null;
  }

  return (
    <div className="h-full w-full">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Intraday P&L Curve
        </h3>
        <div className={`text-xs font-medium rounded-sm px-1.5 py-0.5 ${
          totalPnL >= 0 
            ? 'bg-profit-50 dark:bg-profit-900/20 text-profit-600 dark:text-profit-400' 
            : 'bg-loss-50 dark:bg-loss-900/20 text-loss-600 dark:text-loss-400'
        }`}>
          ${totalPnL.toFixed(2)}
        </div>
      </div>

      <div className="h-[88px] relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] text-neutral-400">
          <div>+100%</div>
          <div>0%</div>
          <div>-100%</div>
        </div>

        {/* Chart area */}
        <div className="absolute left-8 right-0 inset-y-0 flex items-center">
          <svg className="w-full h-full" viewBox={`0 0 ${data.length > 1 ? data.length-1 : 1} 100`} preserveAspectRatio="none">
            {/* Definições de gradientes */}
            <defs>
              <linearGradient id="compactPnLGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={totalPnL >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.1" />
                <stop offset="100%" stopColor={totalPnL >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.02" />
              </linearGradient>
              
              {/* Definição de clipping path para a área abaixo da curva */}
              <clipPath id="curveClip">
                <path 
                  d={`M0,${50 - (data[0].pnl / Math.max(...data.map(p => Math.max(Math.abs(p.pnl), 0.01))) * 45)} 
                    ${data.slice(1).map((point, i) => {
                      const y = 50 - (point.pnl / Math.max(...data.map(p => Math.max(Math.abs(p.pnl), 0.01))) * 45);
                      return `L${i+1},${y}`;
                    }).join(' ')} 
                    L${data.length-1},50 L0,50 Z`}
                />
              </clipPath>
            </defs>
            
            {/* Grade de fundo */}
            <line x1="0" y1="50" x2={data.length-1} y2="50" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="0" y1="25" x2={data.length-1} y2="25" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="1,2" />
            <line x1="0" y1="75" x2={data.length-1} y2="75" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="1,2" />

            {/* Área sob a curva */}
            <rect 
              x="0" 
              y="0" 
              width={data.length-1} 
              height="100" 
              fill="url(#compactPnLGradient)" 
              clipPath="url(#curveClip)" 
            />
            
            {/* Linha principal */}
            <path 
              d={`M0,${50 - (data[0].pnl / Math.max(...data.map(p => Math.max(Math.abs(p.pnl), 0.01))) * 45)} 
                ${data.slice(1).map((point, i) => {
                  const y = 50 - (point.pnl / Math.max(...data.map(p => Math.max(Math.abs(p.pnl), 0.01))) * 45);
                  return `L${i+1},${y}`;
                }).join(' ')}`}
              fill="none"
              stroke={totalPnL >= 0 ? "#22c55e" : "#ef4444"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            
            {/* Ponto inicial e final */}
            <circle 
              cx="0" 
              cy={50 - (data[0].pnl / Math.max(...data.map(p => Math.max(Math.abs(p.pnl), 0.01))) * 45)} 
              r="2" 
              fill={totalPnL >= 0 ? "#22c55e" : "#ef4444"} 
            />
            
            <circle 
              cx={data.length-1} 
              cy={50 - (data[data.length-1].pnl / Math.max(...data.map(p => Math.max(Math.abs(p.pnl), 0.01))) * 45)} 
              r="2" 
              fill={totalPnL >= 0 ? "#22c55e" : "#ef4444"} 
            />
          </svg>
        </div>
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center">
          <span className="text-[9px]">Trade #1</span>
        </div>
        <div className="flex items-center">
          <span className="text-[9px]">Trade #{data.length}</span>
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </div>
      </div>
    </div>
  );
};

export default CompactPnLChart;