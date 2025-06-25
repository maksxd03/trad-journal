import React from 'react';
import { Tooltip } from 'react-tooltip';
import { useTranslation } from 'react-i18next';

interface ArcGaugeProps {
  winRate?: number; // Valor de 0 a 100
  winCount: number;
  lossCount: number;
}

const ArcGauge: React.FC<ArcGaugeProps> = ({ winRate, winCount, lossCount }) => {
  const { t } = useTranslation();
  const size = 120;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth;

  const totalValue = winCount + lossCount;
  const calculatedWinRate = winRate !== undefined 
    ? winRate 
    : (totalValue > 0 ? (winCount / totalValue) * 100 : 50);

  const angle = (240 * calculatedWinRate) / 100 - 120; // Arco de 240 graus

  const polarToCartesian = (angleDeg: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180.0);
    return {
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
    };
  };

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(endAngle);
    const end = polarToCartesian(startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const lossCoord = polarToCartesian(120);
  const winCoord = polarToCartesian(-120);
  
  // IDs únicos para os tooltips
  const winArcTooltipId = `win-arc-tooltip-${Math.random().toString(36).substr(2, 9)}`;
  const lossArcTooltipId = `loss-arc-tooltip-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="relative">
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.9}`} style={{ overflow: 'visible' }}>
        {/* Arco de Fundo */}
        <path 
          d={describeArc(-120, 120)} 
          fill="none" 
          stroke="#E5E7EB" 
          strokeWidth={strokeWidth} 
          strokeLinecap="round" 
          className="dark:stroke-neutral-700"
        />
        
        {/* Arco de Perdas com Tooltip */}
        <g>
          {calculatedWinRate < 100 && (
            <path 
              d={describeArc(angle, 120)} 
              fill="none" 
              stroke="#EF4444" 
              strokeWidth={strokeWidth} 
              strokeLinecap="round"
              className="dark:stroke-loss-400 cursor-pointer"
              data-tooltip-id={lossArcTooltipId}
              data-tooltip-content={`Trades Losing: ${lossCount}`}
            />
          )}
        </g>
        
        {/* Arco de Ganhos com Tooltip */}
        <g>
          {calculatedWinRate > 0 && (
            <path 
              d={describeArc(-120, angle)} 
              fill="none" 
              stroke="#10B981" 
              strokeWidth={strokeWidth} 
              strokeLinecap="round"
              className="dark:stroke-profit-400 cursor-pointer"
              data-tooltip-id={winArcTooltipId}
              data-tooltip-content={`Trades Winning: ${winCount}`}
            />
          )}
        </g>

        {/* Círculos nas extremidades do arco */}
        <circle 
          cx={lossCoord.x} 
          cy={lossCoord.y} 
          r="6" 
          fill="#EF4444" 
          className="dark:fill-loss-400" 
        />
        <circle 
          cx={winCoord.x} 
          cy={winCoord.y} 
          r="6" 
          fill="#10B981" 
          className="dark:fill-profit-400" 
        />
        
        {/* Valores ao lado dos círculos */}
        <text 
          x={lossCoord.x + 10} 
          y={lossCoord.y + 4} 
          textAnchor="start" 
          fill="#EF4444" 
          className="dark:fill-loss-400" 
          fontSize="12px" 
          fontWeight="bold"
        >
          {lossCount}
        </text>
        <text 
          x={winCoord.x - 10} 
          y={winCoord.y + 4} 
          textAnchor="end" 
          fill="#10B981" 
          className="dark:fill-profit-400" 
          fontSize="12px" 
          fontWeight="bold"
        >
          {winCount}
        </text>
      </svg>
      
      {/* Tooltips personalizados */}
      <Tooltip 
        id={winArcTooltipId} 
        place="top"
        className="bg-black text-white py-1 px-2 rounded text-sm font-medium z-50"
      />
      <Tooltip 
        id={lossArcTooltipId} 
        place="top"
        className="bg-black text-white py-1 px-2 rounded text-sm font-medium z-50"
      />
    </div>
  );
};

export default ArcGauge; 