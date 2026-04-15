// ActivityTab component following SOLID principles
// Displays physical activity metrics and heart rate variability

import React from 'react';
import { ChartCard } from '../ui/ChartCard';
import { InfoCard } from '../ui/InfoCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatChartNumber, createFormatterWithUnit } from '@/lib/numberFormatter';
import type { ChartDataPoint } from '@/types/detalle/metrics.types';

/**
 * Activity data with daily step counts and activity distribution
 */
export interface ActivityData extends ChartDataPoint {
  pasos?: number;
  distancia?: number;
  activos?: number;
  ligeros?: number;
  inactivos?: number;
  restingHeartRate?: number;
}

/**
 * Sleep data used for HRV metrics
 */
export interface SleepDataForHRV extends ChartDataPoint {
  HRVdailyRmssd?: number;
}

export interface ActivityTabProps {
  /**
   * Activity summary data (steps, distance, activity distribution)
   */
  activityData: ActivityData[];

  /**
   * Sleep data for HRV chart
   */
  sleepData: SleepDataForHRV[];

  /**
   * Average daily steps
   */
  avgPasos: number;

  /**
   * Average daily distance (km)
   */
  avgDistancia: number;

  /**
   * Average heart rate during activity
   */
  avgFrecuenciaCardiaca: number;

  /**
   * Average SpO2 during activity
   */
  avgSpo2Actividad: number;

  /**
   * Average resting heart rate
   */
  avgRestingHeartRate: number;

  /**
   * Average HRV daily RMSSD
   */
  avgHRVdailyRmssd: number;
}

/**
 * ActivityTab component for displaying physical activity and cardiac metrics
 *
 * Follows SRP: Only handles activity tab display
 * Uses composition with generic UI components (OCP)
 *
 * @example
 * ```tsx
 * <ActivityTab
 *   activityData={actividadData}
 *   sleepData={suenoData}
 *   avgPasos={8500}
 *   avgDistancia={5.2}
 *   avgFrecuenciaCardiaca={120}
 *   avgSpo2Actividad={96}
 *   avgRestingHeartRate={65}
 *   avgHRVdailyRmssd={42}
 * />
 * ```
 */
export function ActivityTab({
  activityData,
  sleepData,
  avgPasos,
  avgDistancia,
  avgFrecuenciaCardiaca,
  avgSpo2Actividad,
  avgRestingHeartRate,
  avgHRVdailyRmssd,
}: ActivityTabProps) {
  return (
    <div className="space-y-4">
      {/* Description Card */}
      <InfoCard
        icon="ℹ️"
        title="Monitoreo de Actividad Física"
        description="Actividad física diaria. La actividad se clasifica en: **minutos activos** (ejercicio intenso), **minutos ligeros** (caminata, tareas del hogar) e **minutos inactivos** (sedentarismo). También se registra la distancia recorrida, los pasos y la frecuencia cardíaca en reposo."
        bgColor="purple"
      />

      {/* Statistics Cards Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Average Steps */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pasos Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPasos.toLocaleString()}</div>
            <p className="text-xs text-gray-600">pasos/día</p>
          </CardContent>
        </Card>

        {/* Total Distance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Distancia Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatChartNumber(avgDistancia)} km</div>
            <p className="text-xs text-gray-600">promedio diario</p>
          </CardContent>
        </Card>

        {/* Heart Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Frecuencia Cardíaca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgFrecuenciaCardiaca} bpm</div>
            <p className="text-xs text-gray-600">promedio en actividad</p>
          </CardContent>
        </Card>

        {/* SpO2 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">SpO2 Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSpo2Actividad}%</div>
            <p className="text-xs text-gray-600">saturación de oxígeno</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Steps Bar Chart */}
      <ChartCard
        title="Pasos Diarios"
        description="Meta recomendada: 10,000 pasos/día"
        data={activityData}
        chartType="bar"
        series={[{ dataKey: 'pasos', name: 'Pasos', fill: '#3b82f6' }]}
        referenceLines={[
          {
            y: 10000,
            stroke: '#f59e0b',
            strokeDasharray: '5 5',
            label: 'Meta: 10,000 pasos',
          },
        ]}
        height={300}
        emptyMessage="Sin datos de pasos disponibles"
        emptyIcon="👟"
      />

      {/* Activity Distribution Stacked Bar Chart */}
      <ChartCard
        title="Distribución de Actividad"
        description="Minutos activos, ligeros e inactivos por día"
        data={activityData}
        chartType="bar"
        series={[
          { dataKey: 'activos', name: 'Activos (Movimiento)', fill: '#10b981', stackId: 'a' },
          { dataKey: 'ligeros', name: 'Ligeros', fill: '#fbbf24', stackId: 'a' },
          { dataKey: 'inactivos', name: 'Inactivos (Reposo)', fill: '#94a3b8', stackId: 'a' },
        ]}
        height={300}
        emptyMessage="Sin datos de actividad disponibles"
        emptyIcon="🏃"
      />

      {/* Cardiac Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Resting Heart Rate */}
        <ChartCard
          title="Tasa Cardíaca en Reposo"
          description={`Frecuencia cardíaca en reposo (bpm) - Promedio: ${formatChartNumber(avgRestingHeartRate)} bpm`}
          data={activityData}
          chartType="line"
          series={[
            {
              dataKey: 'restingHeartRate',
              name: 'FC Reposo',
              stroke: '#ef4444',
              strokeWidth: 2,
              dot: { fill: '#ef4444' },
            },
          ]}
          yAxisDomain={[40, 100]}
          referenceLines={[
            {
              y: avgRestingHeartRate,
              stroke: '#94a3b8',
              strokeDasharray: '3 3',
              label: `Promedio: ${formatChartNumber(avgRestingHeartRate)}`,
            },
          ]}
          height={250}
          tooltipFormatter={createFormatterWithUnit('bpm')}
          emptyMessage="Sin datos de frecuencia cardíaca"
          emptyIcon="❤️"
        />

        {/* HRV Daily RMSSD */}
        <ChartCard
          title="Variabilidad Cardíaca Diaria (HRV)"
          description={`HRV RMSSD nocturno (ms) - Promedio: ${formatChartNumber(avgHRVdailyRmssd)} ms`}
          data={sleepData}
          chartType="line"
          series={[
            {
              dataKey: 'HRVdailyRmssd',
              name: 'HRV RMSSD',
              stroke: '#8b5cf6',
              strokeWidth: 2,
              dot: { fill: '#8b5cf6' },
            },
          ]}
          yAxisDomain={[0, 120]}
          referenceLines={[
            {
              y: avgHRVdailyRmssd,
              stroke: '#94a3b8',
              strokeDasharray: '3 3',
              label: `Promedio: ${formatChartNumber(avgHRVdailyRmssd)}`,
            },
          ]}
          height={250}
          tooltipFormatter={createFormatterWithUnit('ms')}
          emptyMessage="Sin datos de HRV disponibles"
          emptyIcon="💓"
        />
      </div>
    </div>
  );
}
