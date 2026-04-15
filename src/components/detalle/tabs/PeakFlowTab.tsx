// PeakFlowTab component following SOLID principles
// Displays peak flow (pico de flujo) respiratory metrics

import React from 'react';
import { ChartCard } from '../ui/ChartCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PeakFlowData } from '@/types/detalle/metrics.types';

export interface PeakFlowTabProps {
  /**
   * Peak flow data with 3 daily measurements
   */
  data: PeakFlowData[];

  /**
   * Average peak flow across all measurements
   */
  avgPeakFlow: number;

  /**
   * Latest daily average (average of 3 most recent measurements)
   */
  latestAverage: number;

  /**
   * Best historical daily average
   */
  bestValue: number;
}

/**
 * PeakFlowTab component for displaying peak flow respiratory metrics
 *
 * Follows SRP: Only handles peak flow tab display
 * Uses composition with generic UI components (OCP)
 *
 * @example
 * ```tsx
 * <PeakFlowTab
 *   data={picoFlujoData}
 *   avgPeakFlow={385}
 *   latestAverage={390}
 *   bestValue={410}
 * />
 * ```
 */
export function PeakFlowTab({ data, avgPeakFlow, latestAverage, bestValue }: PeakFlowTabProps) {
  return (
    <div className="space-y-4">
      {/* Description Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              ℹ️
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Qué es el Pico de Flujo Espiratorio?</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Seguimiento diario del Pico de flujo o flujo espiratorio máximo (FEM). Se realiza una adquisición diaria, en la que se completan 3 pruebas consecutivas. Se registran los 3 valores, el valor medio y el mejor valor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Average Total */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Promedio Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPeakFlow} L/min</div>
            <p className="text-xs text-gray-600">Promedio de todas las tomas del período</p>
          </CardContent>
        </Card>

        {/* Latest Average */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Último Valor Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestAverage} L/min</div>
            <p className="text-xs text-blue-600">Promedio de las 3 tomas más recientes</p>
          </CardContent>
        </Card>

        {/* Best Historical Value */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Mejor Valor Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestValue} L/min</div>
            <p className="text-xs text-green-600">Mejor promedio diario registrado</p>
          </CardContent>
        </Card>
      </div>

      {/* Three Daily Measurements Chart */}
      <ChartCard
        title="Tres Tomas Diarias"
        description="Mediciones de pico de flujo espiratorio a lo largo del tiempo"
        data={data}
        chartType="line"
        series={[
          { dataKey: 'toma1', name: 'Toma 1 (Mañana)', stroke: '#3b82f6', strokeWidth: 2 },
          { dataKey: 'toma2', name: 'Toma 2 (Tarde)', stroke: '#10b981', strokeWidth: 2 },
          { dataKey: 'toma3', name: 'Toma 3 (Noche)', stroke: '#f59e0b', strokeWidth: 2 },
        ]}
        yAxisDomain={[350, 420]}
        height={350}
        emptyMessage="Sin datos de pico de flujo disponibles"
        emptyIcon="🫁"
      />
    </div>
  );
}
