import React from 'react';

interface RadarChartProps {
  data?: Array<{ axis: string; value: number }>;
}

const RadarChart: React.FC<RadarChartProps> = ({ data: propData }) => {
  // Use provided data or fallback to default data
  const data = propData || [
    { axis: 'Win Rate', value: 8.5 },
    { axis: 'Profit Factor', value: 7.5 },
    { axis: 'Consistency', value: 6.5 },
    { axis: 'Risk Mgmt', value: 7.0 },
    { axis: 'Volume', value: 4.5 },
    { axis: 'Discipline', value: 8.0 }
  ];

  const center = 100;
  const radius = 80;
  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (value: number, index: number, maxRadius: number = radius) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 10) * maxRadius; // Scale from 0-10
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const gridLevels = [2, 4, 6, 8, 10];
  const dataPoints = data.map((item, index) => getPoint(item.value, index));
  const pathData = dataPoints.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';

  return (
    <div className="flex items-center justify-center h-64">
      <svg width="200" height="200" className="overflow-visible">
        {/* Grid circles */}
        {gridLevels.map(level => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 10) * radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-neutral-200 dark:text-neutral-600"
            opacity="0.4"
          />
        ))}
        
        {/* Grid lines */}
        {data.map((_, index) => {
          const endPoint = getPoint(10, index);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-neutral-200 dark:text-neutral-600"
              opacity="0.4"
            />
          );
        })}
        
        {/* Data area */}
        <path
          d={pathData}
          fill="rgba(0, 78, 100, 0.2)"
          stroke="rgb(0, 78, 100)"
          strokeWidth="3"
          className="drop-shadow-lg"
        />
        
        {/* Data points */}
        {dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="5"
            fill="rgb(0, 78, 100)"
            stroke="white"
            strokeWidth="3"
            className="drop-shadow-md"
          />
        ))}
        
        {/* Labels */}
        {data.map((item, index) => {
          const labelPoint = getPoint(10, index, radius + 25);
          return (
            <text
              key={index}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-medium text-neutral-600 dark:text-neutral-300"
              style={{ fontWeight: 500 }}
            >
              {item.axis}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default RadarChart;