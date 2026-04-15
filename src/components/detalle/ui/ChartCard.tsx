// ChartCard component following Single Responsibility and Open/Closed Principles
// Generic chart wrapper that can display different chart types

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { EmptyState } from './EmptyState';
import { formatChartNumber } from '@/lib/numberFormatter';

export type ChartType = 'line' | 'bar';

export interface ChartDataSeries {
  dataKey: string;
  name: string;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  stackId?: string;
  dot?: boolean | Record<string, unknown>;
}

export interface ChartCardProps {
  /**
   * Card title
   */
  title: string;

  /**
   * Card description (optional)
   */
  description?: string;

  /**
   * Chart data
   */
  data: Record<string, unknown>[];

  /**
   * Type of chart
   */
  chartType: ChartType;

  /**
   * Data series to display
   */
  series: ChartDataSeries[];

  /**
   * X-axis data key
   */
  xAxisKey?: string;

  /**
   * Y-axis domain [min, max]
   * Can accept numbers or special Recharts values like 'auto', 'dataMin', 'dataMax'
   */
  yAxisDomain?: readonly [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'] | [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];

  /**
   * Reference lines (thresholds)
   */
  referenceLines?: Array<{
    y: number;
    label: string;
    stroke?: string;
    strokeDasharray?: string;
  }>;

  /**
   * Chart height in pixels
   */
  height?: number;

  /**
   * Custom empty state message
   */
  emptyMessage?: string;

  /**
   * Custom empty state icon
   */
  emptyIcon?: string;

  /**
   * Tooltip formatter function
   */
  tooltipFormatter?: (value: unknown) => string;
}

/**
 * Generic ChartCard component for displaying charts with cards
 *
 * Follows OCP: Can be extended with new chart types without modification
 * Follows SRP: Only responsible for rendering a chart with card wrapper
 *
 * @example
 * ```tsx
 * <ChartCard
 *   title="Saturación de Oxígeno"
 *   description="Tendencia de oxigenación"
 *   data={saturacionData}
 *   chartType="line"
 *   series={[{ dataKey: 'spo2', name: 'SpO2 %', stroke: '#10b981', strokeWidth: 2 }]}
 *   yAxisDomain={[90, 100]}
 *   referenceLines={[{ y: 95, label: 'Mínimo', stroke: '#ef4444' }]}
 * />
 * ```
 */
export function ChartCard({
  title,
  description,
  data,
  chartType,
  series,
  xAxisKey = 'fecha',
  yAxisDomain,
  referenceLines = [],
  height = 250,
  emptyMessage,
  emptyIcon,
  tooltipFormatter,
}: ChartCardProps) {
  // Default formatter uses intelligent decimal formatting
  const defaultFormatter = (value: unknown): string => {
    if (typeof value === 'number') {
      return formatChartNumber(value);
    }
    return String(value);
  };

  const formatter = tooltipFormatter || defaultFormatter;

  // Y-axis tick formatter - limits decimals to max 2 places
  const yAxisFormatter = (value: number) => {
    if (Number.isInteger(value)) {
      return value.toString();
    }
    // Round to 2 decimal places max
    return value.toFixed(2).replace(/\.?0+$/, '');
  };

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <EmptyState height={height} message={emptyMessage} icon={emptyIcon} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {chartType === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis domain={yAxisDomain} tickFormatter={yAxisFormatter} /> 
              <Tooltip formatter={formatter} />
              <Legend />
              {referenceLines.map((refLine, idx) => (
                <ReferenceLine
                  key={idx}
                  y={refLine.y}
                  stroke={refLine.stroke || '#ef4444'}
                  strokeDasharray={refLine.strokeDasharray || '3 3'}
                  label={{ value: refLine.label, position: 'right' }}
                />
              ))}
              {series.map((s, idx) => (
                <Line
                  key={idx}
                  type="monotone"
                  dataKey={s.dataKey}
                  stroke={s.stroke}
                  strokeWidth={s.strokeWidth || 2}
                  name={s.name}
                  dot={s.dot}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis domain={yAxisDomain} />
              <Tooltip formatter={formatter} />
              <Legend />
              {referenceLines.map((refLine, idx) => (
                <ReferenceLine
                  key={idx}
                  y={refLine.y}
                  stroke={refLine.stroke || '#ef4444'}
                  strokeDasharray={refLine.strokeDasharray || '5 5'}
                  label={{ value: refLine.label, position: 'top' }}
                />
              ))}
              {series.map((s, idx) => (
                <Bar key={idx} dataKey={s.dataKey} fill={s.fill || s.stroke} name={s.name} stackId={s.stackId} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
