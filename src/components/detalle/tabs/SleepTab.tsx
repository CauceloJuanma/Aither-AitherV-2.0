// SleepTab component following SOLID principles
// Displays sleep quality metrics and cardiorespiratory data

import React from 'react';
import { ChartCard } from '../ui/ChartCard';
import { InfoCard } from '../ui/InfoCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatChartNumber, createFormatterWithUnit } from '@/lib/numberFormatter';
import type { ChartDataPoint } from '@/types/detalle/metrics.types';

/**
 * Sleep data with duration, efficiency, phases, and vital signs
 */
export interface SleepData extends ChartDataPoint {
  duracion?: number;
  eficiencia?: number;
  spo2Sueno?: number;
  spo2Max?: number;
  spo2Min?: number;
  HRVdeepRmssd?: number;
  tasaRespiratoria?: number;
  profundo?: number;
  ligero?: number;
  rem?: number;
  despierto?: number;
  timeInBed?: number;
  awakeningsCount?: number;
}

export interface SleepTabProps {
  /**
   * Sleep data array
   */
  data: SleepData[];

  /**
   * Average sleep duration (hours)
   */
  avgDuracionSueno: number;

  /**
   * Average sleep efficiency (%)
   */
  avgEficienciaSueno: number;

  /**
   * Average SpO2 during sleep (%)
   */
  avgSpo2Sueno: number;

  /**
   * Average HRV during deep sleep (ms)
   */
  avgHrvSueno: number;

  /**
   * Average heart rate during sleep (bpm)
   */
  avgFrecuenciaCardiacaSueno: number;

  /**
   * Average respiratory rate (rpm)
   */
  avgTasaRespiratoria: number;

  /**
   * Average time in bed (hours)
   */
  avgTimeInBed: number;
}

/**
 * SleepTab component for displaying sleep quality and cardiorespiratory metrics
 *
 * Follows SRP: Only handles sleep tab display
 * Uses composition with generic UI components (OCP)
 *
 * @example
 * ```tsx
 * <SleepTab
 *   data={suenoData}
 *   avgDuracionSueno={7.5}
 *   avgEficienciaSueno={88}
 *   avgSpo2Sueno={96}
 *   avgHrvSueno={55}
 *   avgFrecuenciaCardiacaSueno={62}
 *   avgTasaRespiratoria={14}
 *   avgTimeInBed={8.2}
 * />
 * ```
 */
export function SleepTab({
  data,
  avgDuracionSueno,
  avgEficienciaSueno,
  avgSpo2Sueno,
  avgHrvSueno,
  avgFrecuenciaCardiacaSueno,
  avgTasaRespiratoria,
  avgTimeInBed,
}: SleepTabProps) {
  // Calculate average awakenings
  const avgDespertares =
    data.length > 0
      ? formatChartNumber(data.reduce((sum, d) => sum + (d.awakeningsCount || 0), 0) / data.length)
      : '0';

  return (
    <div className="space-y-4">
      {/* Description Card */}
      <InfoCard
        icon="ℹ️"
        title="Monitoreo de Calidad del Sueño"
        description="Seguimiento diario de la eficiencia del sueño, mediante pulsera inteligente, incluyendo: duración del sueño; eficiencia; saturación de oxígeno en sangre; variabilidad de la frecuencia cardiaca durante el sueño; frecuencia cardiaca media; tasa respiratoria; tiempo total en cama y número de despertares. El perfil del sueño cuantifica el tiempo despierto/a, en fase REM, en sueño ligero y en sueño profundo."
        bgColor="indigo"
      />

      {/* First Row Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Duración Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatChartNumber(avgDuracionSueno)} h</div>
            <p className="text-xs text-gray-600">por noche</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Eficiencia Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEficienciaSueno}%</div>
            <p className="text-xs text-gray-600">calidad del sueño</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">SpO2 Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSpo2Sueno}%</div>
            <p className="text-xs text-gray-600">saturación nocturna</p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Variabilidad FC (Sueño Profundo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHrvSueno} ms</div>
            <p className="text-xs text-gray-600">HRV en sueño profundo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Frecuencia Cardíaca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgFrecuenciaCardiacaSueno} bpm</div>
            <p className="text-xs text-gray-600">FC durante sueño (restingHeartRate)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tasa Respiratoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTasaRespiratoria} rpm</div>
            <p className="text-xs text-gray-600">respiraciones/minuto</p>
          </CardContent>
        </Card>
      </div>

      {/* Third Row Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tiempo Total en Cama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatChartNumber(avgTimeInBed)} h</div>
            <p className="text-xs text-gray-600">promedio por noche</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Despertares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDespertares}</div>
            <p className="text-xs text-gray-600">promedio por noche</p>
          </CardContent>
        </Card>
      </div>

      {/* Sleep Duration Chart */}
      <ChartCard
        title="Duración Total del Sueño"
        description="Meta recomendada: 7-9 horas por noche"
        data={data}
        chartType="line"
        series={[{ dataKey: 'duracion', name: 'Duración', stroke: '#8b5cf6', strokeWidth: 2 }]}
        yAxisDomain={[0, 10]}
        referenceLines={[
          { y: 7, stroke: '#10b981', strokeDasharray: '5 5', label: 'Mínimo: 7h' },
          { y: 9, stroke: '#f59e0b', strokeDasharray: '5 5', label: 'Máximo: 9h' },
        ]}
        height={300}
        emptyMessage="Sin datos de sueño disponibles"
        emptyIcon="😴"
      />

      {/* Sleep Efficiency Chart */}
      <ChartCard
        title="Eficiencia del Sueño"
        description="Porcentaje de eficiencia del sueño a lo largo del tiempo"
        data={data}
        chartType="line"
        series={[{ dataKey: 'eficiencia', name: 'Eficiencia %', stroke: '#3b82f6', strokeWidth: 2 }]}
        yAxisDomain={[0, 100]}
        referenceLines={[{ y: 85, stroke: '#10b981', strokeDasharray: '5 5', label: 'Meta: 85%' }]}
        height={300}
        emptyMessage="Sin datos de eficiencia disponibles"
        emptyIcon="📊"
      />

      {/* Sleep Profile Stacked Bar Chart */}
      <ChartCard
        title="Perfil de Sueño"
        description="Distribución de fases del sueño por noche (horas)"
        data={data}
        chartType="bar"
        series={[
          { dataKey: 'profundo', name: 'Sueño Profundo', fill: '#1e40af', stackId: 'a' },
          { dataKey: 'ligero', name: 'Sueño Ligero', fill: '#60a5fa', stackId: 'a' },
          { dataKey: 'rem', name: 'REM', fill: '#a78bfa', stackId: 'a' },
          { dataKey: 'despierto', name: 'Despierto', fill: '#f87171', stackId: 'a' },
        ]}
        height={300}
        tooltipFormatter={createFormatterWithUnit('h')}
        emptyMessage="Sin datos de fases del sueño"
        emptyIcon="🌙"
      />

      {/* Time in Bed and Awakenings Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Tiempo Total en Cama"
          description="Horas en cama por noche"
          data={data}
          chartType="bar"
          series={[{ dataKey: 'timeInBed', name: 'Tiempo en Cama', fill: '#6366f1' }]}
          yAxisDomain={[0, 12]}
          referenceLines={[{ y: 8, stroke: '#10b981', strokeDasharray: '5 5', label: 'Recomendado: 8h' }]}
          height={250}
          tooltipFormatter={createFormatterWithUnit('h')}
          emptyMessage="Sin datos de tiempo en cama"
          emptyIcon="🛏️"
        />

        <ChartCard
          title="Despertares Nocturnos"
          description="Número de despertares por noche"
          data={data}
          chartType="bar"
          series={[{ dataKey: 'awakeningsCount', name: 'Despertares', fill: '#f59e0b' }]}
          height={250}
          emptyMessage="Sin datos de despertares"
          emptyIcon="⏰"
        />
      </div>

      {/* SpO2 During Sleep Chart */}
      <ChartCard
        title="Saturación de Oxígeno Durante el Sueño"
        description="SpO2 nocturna (promedio, mínimo y máximo) - Alerta si está por debajo de 95%"
        data={data}
        chartType="line"
        series={[
          {
            dataKey: 'spo2Max',
            name: 'SpO2 Máximo',
            stroke: '#22c55e',
            strokeWidth: 1,
            dot: false,
          },
          { dataKey: 'spo2Sueno', name: 'SpO2 Promedio', stroke: '#10b981', strokeWidth: 2 },
          {
            dataKey: 'spo2Min',
            name: 'SpO2 Mínimo',
            stroke: '#ef4444',
            strokeWidth: 1,
            dot: false,
          },
        ]}
        yAxisDomain={[85, 100]}
        referenceLines={[{ y: 95, stroke: '#ef4444', strokeDasharray: '5 5', label: 'Límite: 95%' }]}
        height={300}
        tooltipFormatter={createFormatterWithUnit('%')}
        emptyMessage="Sin datos de SpO2 nocturna"
        emptyIcon="🫁"
      />

      {/* Cardiorespiratory Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Variabilidad FC en Sueño Profundo"
          description="HRV RMSSD durante sueño profundo (ms)"
          data={data}
          chartType="line"
          series={[{ dataKey: 'HRVdeepRmssd', name: 'HRV Sueño Profundo', stroke: '#8b5cf6', strokeWidth: 2 }]}
          yAxisDomain={[0, 100]}
          referenceLines={[{ y: 50, stroke: '#3b82f6', strokeDasharray: '5 5', label: 'Normal: >50ms' }]}
          height={250}
          emptyMessage="Sin datos de HRV"
          emptyIcon="💓"
        />

        <ChartCard
          title="Tasa Respiratoria"
          description="Respiraciones por minuto durante el sueño"
          data={data}
          chartType="line"
          series={[{ dataKey: 'tasaRespiratoria', name: 'Respiraciones/min', stroke: '#f59e0b', strokeWidth: 2 }]}
          yAxisDomain={[10, 20]}
          referenceLines={[
            { y: 12, stroke: '#10b981', strokeDasharray: '5 5', label: 'Rango normal' },
            { y: 18, stroke: '#f59e0b', strokeDasharray: '5 5', label: '' },
          ]}
          height={250}
          emptyMessage="Sin datos de respiración"
          emptyIcon="🫁"
        />
      </div>
    </div>
  );
}
