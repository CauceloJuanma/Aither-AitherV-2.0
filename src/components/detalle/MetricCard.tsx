import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { LucideIcon } from 'lucide-react';
import { formatChartNumber } from '@/lib/numberFormatter';

interface MetricCardProps {
  title: string;
  value: number | null | undefined;
  unit: string;
  decimals?: number;
  normalRange?: { min?: number; max?: number };
  thresholds?: { good: number; warning?: number };
  icon: LucideIcon;
  sparklineData?: Record<string, unknown>[];
  sparklineKey?: string;
  description?: string;
  getStatusColor?: (value: number) => string;
  getStatusText?: (value: number) => string;
}

// Helper para verificar si hay datos válidos
const hasValidData = (value: number | null | undefined): boolean => {
  return value !== null && value !== undefined && !isNaN(value) && value !== 0;
};

export default function MetricCard({
  title,
  value,
  unit,
  decimals = 0,
  normalRange,
  thresholds,
  icon: Icon,
  sparklineData = [],
  sparklineKey,
  description,
  getStatusColor,
  getStatusText,
}: MetricCardProps) {
  const hasData = hasValidData(value);

  // Determinar color basado en thresholds o función personalizada
  let color = 'blue';
  let statusText = '';

  if (hasData && value !== null && value !== undefined) {
    if (getStatusColor) {
      color = getStatusColor(value);
    } else if (thresholds) {
      if (thresholds.warning !== undefined) {
        // Tiene 3 niveles: good, warning, danger
        color = value >= thresholds.good ? 'green' : value >= thresholds.warning ? 'yellow' : 'red';
      } else {
        // Solo 2 niveles: good o warning
        color = value >= thresholds.good ? 'green' : 'yellow';
      }
    } else if (normalRange) {
      // Rango normal
      const min = normalRange.min ?? -Infinity;
      const max = normalRange.max ?? Infinity;
      color = value >= min && value <= max ? 'green' : 'yellow';
    }

    if (getStatusText) {
      statusText = getStatusText(value);
    }
  }

  const colorClasses = {
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      stroke: '#10b981',
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-600',
      stroke: '#f59e0b',
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-red-600',
      stroke: '#ef4444',
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      stroke: '#3b82f6',
    },
    gray: {
      bg: 'bg-gray-400',
      text: 'text-gray-400',
      stroke: '#9ca3af',
    },
  };

  const currentColor = hasData ? colorClasses[color as keyof typeof colorClasses] : colorClasses.gray;

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 opacity-10 ${currentColor.bg}`} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${currentColor.text}`} />
      </CardHeader>
      <CardContent className="relative z-10">
        {/* Sparkline de fondo */}
        {sparklineData.length > 0 && sparklineKey && hasData && (
          <div className="absolute inset-x-0 bottom-0 h-12 opacity-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey={sparklineKey}
                  stroke={currentColor.stroke}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className={`text-2xl font-bold ${hasData ? currentColor.text : 'text-gray-400 italic'}`}>
          {hasData && value !== null && value !== undefined
            ? `${decimals !== undefined ? value.toFixed(decimals) : formatChartNumber(value)}${unit}`
            : '(Sin Datos)'}
        </div>
        {description && <p className="text-xs text-gray-600">{description}</p>}
        {statusText && hasData && (
          <p className={`text-xs mt-1 ${currentColor.text}`}>
            {statusText}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
