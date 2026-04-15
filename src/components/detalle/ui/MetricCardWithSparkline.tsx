// MetricCardWithSparkline component following Single Responsibility Principle
// Displays a metric value with a sparkline chart background

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { STATUS_COLORS } from '@/services/detalle/constants';

export type StatusType = keyof typeof STATUS_COLORS;

export interface MetricCardWithSparklineProps {
  /**
   * Card title
   */
  title: string;

  /**
   * Current metric value
   */
  value: number | null;

  /**
   * Unit string (e.g., "kg", "%", "bpm")
   */
  unit: string;

  /**
   * Number of decimal places
   */
  decimals?: number;

  /**
   * Status type for color coding
   */
  status?: StatusType;

  /**
   * Status text to display (e.g., "✓ Normal", "⚠ Elevado")
   */
  statusText?: string;

  /**
   * Sparkline chart data
   */
  sparklineData?: Record<string, unknown>[];

  /**
   * Data key for sparkline
   */
  sparklineDataKey?: string;

  /**
   * Additional description text
   */
  description?: string;

  /**
   * Deviation text (e.g., "↑ 5% vs promedio")
   */
  deviation?: string;

  /**
   * Deviation color (e.g., "text-red-600")
   */
  deviationColor?: string;
}

/**
 * MetricCardWithSparkline component for displaying metrics with background sparkline
 *
 * Follows SRP by only handling metric card display with sparkline
 *
 * @example
 * ```tsx
 * <MetricCardWithSparkline
 *   title="PM2.5"
 *   value={25.3}
 *   unit=" µg/m³"
 *   decimals={2}
 *   status="SUCCESS"
 *   statusText="✓ Adecuado"
 *   sparklineData={data}
 *   sparklineDataKey="pm25"
 *   deviation="↑ 5% vs promedio"
 *   deviationColor="text-red-600"
 * />
 * ```
 */
export function MetricCardWithSparkline({
  title,
  value,
  unit,
  decimals = 0,
  status = 'INFO',
  statusText,
  sparklineData = [],
  sparklineDataKey,
  description,
  deviation,
  deviationColor,
}: MetricCardWithSparklineProps) {
  const hasData = value !== null && value !== undefined && !isNaN(value);
  const colorScheme = hasData ? STATUS_COLORS[status] : STATUS_COLORS.GRAY;

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 opacity-10 ${colorScheme.bg}`} />
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        {/* Sparkline background */}
        {sparklineData.length > 0 && sparklineDataKey && hasData && (
          <div className="absolute inset-x-0 bottom-0 h-16 opacity-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey={sparklineDataKey}
                  stroke={colorScheme.stroke}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Value display */}
        <div className={`text-2xl font-bold ${hasData ? colorScheme.text : 'text-gray-400 italic'}`}>
          {hasData ? `${value!.toFixed(decimals)}${unit}` : '(Sin Datos)'}
        </div>

        {/* Status text */}
        {statusText && hasData && (
          <p className={`text-xs ${colorScheme.text}`}>
            {statusText}
          </p>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-600 mt-1">
            {description}
          </p>
        )}

        {/* Deviation */}
        {deviation && hasData && (
          <div className={`text-xs font-semibold mt-1 ${deviationColor || colorScheme.text}`}>
            {deviation}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
