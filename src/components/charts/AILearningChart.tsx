import React, { useState } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useTheme } from '../../hooks/useTheme';

interface LearningData {
  week: string;
  score: number;
}

interface AILearningChartProps {
  data: LearningData[];
}

const AILearningChart: React.FC<AILearningChartProps> = ({ data }) => {
  const { isDark } = useTheme();
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

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
    crosshair: {
      line: {
        stroke: isDark ? '#f0f0f0' : '#333333',
        strokeWidth: 1,
        strokeOpacity: 0.5,
      },
    },
  };

  // Formatar dados para o gráfico Nivo
  const chartData = [
    {
      id: 'learning-score',
      color: isDark ? '#b794f4' : '#8b5cf6',
      data: data.map(item => ({
        x: item.week,
        y: item.score,
      })),
    },
  ];

  // Calcular o crescimento do score
  const firstScore = data[0]?.score || 0;
  const lastScore = data[data.length - 1]?.score || 0;
  const growthPercent = firstScore > 0 
    ? Math.round(((lastScore - firstScore) / firstScore) * 100)
    : 0;

  return (
    <div className="space-y-3">
      {/* Estatísticas de crescimento */}
      <div className="flex justify-between items-center px-1 mb-2">
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Evolução:</div>
          <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded">
            +{growthPercent}%
          </div>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          Semana 1: {firstScore}% → Atual: {lastScore}%
        </div>
      </div>
      
      <div className="h-60">
        <ResponsiveLine
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 0,
            max: 100,
            stacked: false,
            reverse: false,
          }}
          curve="monotoneX"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Período',
            legendOffset: 36,
            legendPosition: 'middle',
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Score (%)',
            legendOffset: -40,
            legendPosition: 'middle',
          }}
          enableGridX={false}
          colors={{ datum: 'color' }}
          lineWidth={3}
          pointSize={8}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          useMesh={true}
          theme={theme}
          enableArea={true}
          areaOpacity={0.2}
          enableSlices="x"
          onMouseMove={(point) => {
            if (point && point.data) {
              setHoveredPoint(point.data.x as string);
            }
          }}
          onMouseLeave={() => setHoveredPoint(null)}
          tooltip={({ point }) => (
            <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-md p-3 text-sm border border-neutral-200 dark:border-neutral-700">
              <div className="font-medium mb-1 text-neutral-800 dark:text-neutral-100">
                {point.data.x as string}
              </div>
              <div className="flex items-center">
                <div style={{ 
                  width: 12, 
                  height: 12, 
                  backgroundColor: point.serieColor, 
                  marginRight: 8, 
                  borderRadius: '50%' 
                }}></div>
                <span className="font-semibold">{point.data.y}% pattern recognition</span>
              </div>
              <div className="mt-1 text-xs opacity-70">
                {(point.data.y as number) >= 80 
                  ? '🧠 Alto reconhecimento de padrões'
                  : (point.data.y as number) >= 60 
                  ? '📈 Aprendizado avançado' 
                  : '🔄 Em aprendizado inicial'}
              </div>
            </div>
          )}
          markers={[
            {
              axis: 'y',
              value: 90,
              lineStyle: { stroke: isDark ? '#10B981' : '#059669', strokeWidth: 2, strokeDasharray: '4' },
              legend: 'Meta',
              textStyle: { fill: isDark ? '#10B981' : '#059669' },
              legendPosition: 'right'
            },
          ]}
          pointComponent={({ x, y, size, color, borderColor, borderWidth, data }) => {
            const isHovered = hoveredPoint === data.x;
            const isLastPoint = data.x === chartData[0].data[chartData[0].data.length - 1].x;
            
            const finalSize = isHovered ? size * 1.5 : isLastPoint ? size * 1.2 : size;
            const finalBorderWidth = isHovered ? borderWidth * 1.5 : borderWidth;
            
            return (
              <g transform={`translate(${x},${y})`}>
                {/* Efeito de glow para pontos em hover */}
                {isHovered && (
                  <circle
                    r={finalSize + 4}
                    fill="none"
                    stroke={borderColor}
                    strokeWidth={1}
                    strokeOpacity={0.3}
                    style={{ transition: 'all 200ms' }}
                  />
                )}
                <circle
                  r={finalSize}
                  fill={color}
                  stroke={borderColor}
                  strokeWidth={finalBorderWidth}
                  style={{ 
                    transition: 'all 200ms',
                    filter: isHovered ? 'drop-shadow(0 0 4px rgba(0,0,0,0.2))' : 'none' 
                  }}
                />
              </g>
            );
          }}
        />
      </div>
    </div>
  );
};

export default AILearningChart; 