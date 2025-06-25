import React, { useState } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useTheme } from '../../hooks/useTheme';

interface AccuracyData {
  date: string;
  accuracy: number;
}

interface AccuracyHistoryChartProps {
  data: AccuracyData[];
}

const AccuracyHistoryChart: React.FC<AccuracyHistoryChartProps> = ({ data }) => {
  const { isDark } = useTheme();
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  // Função para formatar a data em formato DD/MM
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Formatar dados para o gráfico Nivo
  const chartData = [
    {
      id: 'accuracy',
      color: isDark ? '#8B5CF6' : '#6366F1',
      data: data.map(item => ({
        x: formatDate(item.date),
        y: item.accuracy,
        originalDate: item.date,
      })),
    },
  ];

  // Encontrar último valor de acurácia para destacar
  const lastEntry = data[data.length - 1];
  const lastAccuracy = lastEntry ? lastEntry.accuracy : 0;
  const lastUpdateDate = lastEntry ? formatDate(lastEntry.date) : '';

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

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Histórico de acurácia dos insights
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Evolução da precisão das predições ao longo do tempo
          </p>
        </div>
        
        {/* Indicador de última atualização */}
        <div className="bg-neutral-100 dark:bg-neutral-700 px-3 py-1 rounded-full text-xs flex items-center">
          <span className="text-neutral-500 dark:text-neutral-400 mr-1">Último:</span>
          <span className="text-primary-600 dark:text-primary-400 font-medium">{lastAccuracy}%</span>
          <span className="mx-1 text-neutral-400">•</span>
          <span className="text-neutral-500 dark:text-neutral-400">{lastUpdateDate}</span>
        </div>
      </div>

      {/* Badge de atualizado */}
      <div className="absolute top-5 right-5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
          Atualizado
        </span>
      </div>
      
      <div className="h-80 relative">
        <ResponsiveLine
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
            reverse: false,
          }}
          curve="monotoneX"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Data',
            legendOffset: 40,
            legendPosition: 'middle',
            format: (value) => value, // Já formatamos como DD/MM
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Acurácia (%)',
            legendOffset: -50,
            legendPosition: 'middle',
          }}
          enableGridX={false}
          colors={[isDark ? '#8B5CF6' : '#6366F1']}
          lineWidth={3}
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          enableArea={true}
          areaOpacity={0.15}
          useMesh={true}
          theme={theme}
          onMouseMove={(point) => {
            if (point && point.data) {
              setHoveredPoint(point.data.x as string);
            }
          }}
          onMouseLeave={() => setHoveredPoint(null)}
          tooltip={({ point }) => (
            <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-md p-3 text-sm border border-neutral-200 dark:border-neutral-700">
              <div className="font-medium mb-1 text-neutral-800 dark:text-neutral-100">
                Data: {point.data.x as string}
              </div>
              <div className="flex items-center">
                <div 
                  style={{ 
                    width: 12, 
                    height: 12, 
                    backgroundColor: point.serieColor, 
                    marginRight: 8, 
                    borderRadius: '50%' 
                  }}
                ></div>
                <span className="font-semibold">{point.data.y}% de acurácia</span>
              </div>
              <div className="mt-1 text-xs opacity-70">
                {(point.data.y as number) >= 80 
                  ? '🎯 Excelente precisão!'
                  : (point.data.y as number) >= 70 
                  ? '✅ Boa precisão'
                  : '⚠️ Precisão moderada'}
              </div>
            </div>
          )}
          pointComponent={({ x, y, size, color, borderColor, borderWidth, data }) => {
            const isHovered = hoveredPoint === data.x;
            const isLastPoint = data.x === chartData[0].data[chartData[0].data.length - 1].x;
            
            // Aumentar tamanho para último ponto ou hover
            const finalSize = isHovered ? size * 1.5 : isLastPoint ? size * 1.2 : size;
            const finalBorderWidth = isHovered ? borderWidth * 1.5 : borderWidth;

            return (
              <g transform={`translate(${x},${y})`}>
                {/* Efeito de glow para pontos em hover */}
                {isHovered && (
                  <circle
                    r={finalSize + 5}
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

export default AccuracyHistoryChart; 