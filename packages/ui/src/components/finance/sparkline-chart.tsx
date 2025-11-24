import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
  showGradient?: boolean;
  animate?: boolean;
}

function getTrend(data: number[]): 'up' | 'down' | 'neutral' {
  if (data.length < 2) return 'neutral';
  const first = data[0];
  const last = data[data.length - 1];
  if (first === undefined || last === undefined) return 'neutral';
  if (last > first) return 'up';
  if (last < first) return 'down';
  return 'neutral';
}

function normalizeData(data: number[], height: number, padding: number = 4): number[] {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return data.map(
    (value) => height - padding - ((value - min) / range) * (height - padding * 2)
  );
}

function createPath(data: number[], width: number): string {
  if (data.length === 0) return '';

  const step = width / (data.length - 1);

  return data
    .map((y, i) => {
      const x = i * step;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');
}

export function SparklineChart({
  data,
  width = 100,
  height = 32,
  strokeWidth = 1.5,
  className,
  showGradient = true,
  animate = true,
}: SparklineChartProps) {
  const trend = getTrend(data);
  const normalizedData = normalizeData(data, height);
  const path = createPath(normalizedData, width);

  const strokeColor = trend === 'up'
    ? '#22c55e'
    : trend === 'down'
    ? '#ef4444'
    : '#6b7280';

  const gradientId = React.useId();
  const fillGradientId = React.useId();

  // Create fill path (closed polygon)
  const fillPath = path
    ? `${path} L ${width} ${height} L 0 ${height} Z`
    : '';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="1" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fill area */}
      {showGradient && fillPath && (
        <path
          d={fillPath}
          fill={`url(#${fillGradientId})`}
          className={animate ? 'animate-fade-in' : ''}
        />
      )}

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={showGradient ? `url(#${gradientId})` : strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? 'animate-fade-in' : ''}
      />

      {/* End dot */}
      {data.length > 0 && normalizedData.length > 0 && (
        <circle
          cx={width}
          cy={normalizedData[normalizedData.length - 1]}
          r={2}
          fill={strokeColor}
          className={animate ? 'animate-pulse' : ''}
        />
      )}
    </svg>
  );
}
