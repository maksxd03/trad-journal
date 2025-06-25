import React, { useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from '../../hooks/useTheme';

interface HourlyPerformanceData {
  hour: string;
  winRate: number;
}

interface HourlyPerformanceChartProps {
  data: HourlyPerformanceData[];
  onBarClick?: (hour: string, winRate: number) => void;
}

const HourlyPerformanceChart: React.FC<HourlyPerformanceChartProps> = ({ data, onBarClick }) => {
  const { isDark } = useTheme();
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const theme = {
    axis: {
      ticks: {
        text: {
          fill: isDark ? '#e0e0e0' : '#333333',
          fontSize: 12,
        },
      },
      legend: {
        text: {
          fill: isDark ? '#e0e0e0' : '#333333',
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
    },
    grid: {
      line: {
        stroke: isDark ? '#444444' : '#e0e0e0',
        strokeWidth: 1,
        strokeDasharray: '4 4',
      },
    },
    tooltip: {
      container: {
        background: isDark ? '#333333' : '#ffffff',
        color: isDark ? '#ffffff' : '#333333',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        borderRadius: '6px',
        padding: '10px 14px',
        fontSize: '14px',
        fontWeight: 500,
      },
    },
    legends: {
      text: {
        fill: isDark ? '#e0e0e0' : '#333333',
        fontSize: 12,
      },
    },
  };

  // Define a função para determinar cores com base na win rate
  const getBarColor = (bar: any) => {
    const winRate = bar.data.winRate;
    const isHovered = hoveredBar === bar.data.hour;
    
    let color;
    if (winRate >= 70) color = isHovered ? '#2DCB8A' : '#34D399'; // Verde
    else if (winRate >= 60) color = isHovered ? '#3B95F5' : '#60A5FA'; // Azul
    else if (winRate >= 50) color = isHovered ? '#F5B118' : '#FBBF24'; // Amarelo
    else if (winRate >= 40) color = isHovered ? '#F56565' : '#F87171'; // Vermelho claro
    else color = isHovered ? '#E02424' : '#EF4444';                    // Vermelho
    
    return color;
  };

  // Legenda para o gráfico
  const legends = [
    {
      dataFrom: 'keys',
      anchor: 'bottom-right',
      direction: 'column',
      justify: false,
      translateX: 120,
      translateY: 0,
      itemsSpacing: 2,
      itemWidth: 100,
      itemHeight: 20,
      itemDirection: 'left-to-right',
      itemOpacity: 0.85,
      symbolSize: 20,
      effects: [
        {
          on: 'hover',
          style: {
            itemOpacity: 1
          }
        }
      ],
      data: [
        {
          id: 'winRate',
          label: 'Win Rate (%)',
          color: '#60A5FA'
        }
      ]
    }
  ];

  // Classes para efeito de hover nos elementos do gráfico
  const getBarClass = (bar: any) => {
    return hoveredBar === bar.data.hour 
      ? "transform scale-105 shadow-lg transition-all duration-200" 
      : "transition-all duration-200";
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Desempenho por hora do dia
        </h3>
        <div className="flex justify-between items-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Win rate médio para trades realizados em cada hora do dia
          </p>
          <div className="flex items-center space-x-1">
            <span className="inline-block w-3 h-3 bg-green-400 rounded-full"></span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Alta</span>
            <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full ml-2"></span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Média</span>
            <span className="inline-block w-3 h-3 bg-red-400 rounded-full ml-2"></span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Baixa</span>
          </div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveBar
          data={data}
          keys={['winRate']}
          indexBy="hour"
          margin={{ top: 10, right: 20, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={getBarColor}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Hora do Dia',
            legendPosition: 'middle',
            legendOffset: 45,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Win Rate (%)',
            legendPosition: 'middle',
            legendOffset: -50,
          }}
          enableLabel={false}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1.6]],
          }}
          animate={true}
          motionStiffness={90}
          motionDamping={15}
          theme={theme}
          onMouseEnter={(bar) => setHoveredBar(bar.data.hour)}
          onMouseLeave={() => setHoveredBar(null)}
          onClick={(bar) => {
            if (onBarClick) {
              onBarClick(bar.data.hour, bar.data.winRate);
            }
          }}
          tooltip={({ id, value, color, indexValue }) => (
            <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-md p-3 text-sm border border-neutral-200 dark:border-neutral-700">
              <div className="font-medium mb-1 text-neutral-800 dark:text-neutral-100">
                Horário: {indexValue}
              </div>
              <div className="flex items-center">
                <div style={{ width: 12, height: 12, backgroundColor: color, marginRight: 8, borderRadius: '3px' }}></div>
                <span className="font-semibold">{value}% win rate</span>
              </div>
              <div className="mt-1 text-xs opacity-70">
                {value >= 70 
                  ? '🔥 Excelente horário para trades!'
                  : value >= 60 
                  ? '👍 Bom desempenho neste horário'
                  : value >= 50
                  ? '➖ Desempenho médio' 
                  : '⚠️ Considere evitar trades neste horário'}
              </div>
            </div>
          )}
          // Propriedade customizada para aplicar classes em cada barra
          barComponent={({ bar, ...rest }) => {
            // Aplicando classe de transição ao elemento da barra
            const className = hoveredBar === bar.data.data.hour 
              ? "transform scale-105 cursor-pointer filter drop-shadow-lg" 
              : "cursor-pointer";
            
            return (
              <g 
                transform={`translate(${bar.x},${bar.y})`}
                className={className}
                style={{ transition: 'all 0.2s ease-in-out' }}
              >
                <rect 
                  x={-bar.width / 2} 
                  y={0} 
                  width={bar.width} 
                  height={bar.height} 
                  fill={bar.color} 
                  style={{ 
                    transition: 'fill 0.2s ease-in-out',
                    filter: hoveredBar === bar.data.data.hour ? 'brightness(1.1)' : 'none'
                  }} 
                  rx={2}
                />
              </g>
            );
          }}
        />
      </div>
    </div>
  );
};

export default HourlyPerformanceChart; 