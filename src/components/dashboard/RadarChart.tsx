import React from 'react';

const RadarChart: React.FC = () => {
  const data = [
    { label: 'Win %', value: 85, max: 100 },
    { label: 'Consistency', value: 65, max: 100 },
    { label: 'Profit factor', value: 75, max: 100 },
    { label: 'Avg win/loss', value: 70, max: 100 },
    { label: 'Max drawdown', value: 45, max: 100 },
    { label: 'Recovery factor', value: 80, max: 100 }
  ];

  const center = 100;
  const radius = 80;
  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (value: number, index: number, maxRadius: number = radius) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const gridLevels = [20, 40, 60, 80, 100];
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
            r={(level / 100) * radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-neutral-200 dark:text-neutral-600"
            opacity="0.4"
          />
        ))}
        
        {/* Grid lines */}
        {data.map((_, index) => {
          const endPoint = getPoint(100, index);
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
          const labelPoint = getPoint(100, index, radius + 25);
          return (
            <text
              key={index}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium text-neutral-600 dark:text-neutral-300"
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default RadarChart;