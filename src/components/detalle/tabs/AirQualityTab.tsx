// AirQualityTab component following SOLID principles
// Displays air quality metrics and charts

import React from 'react';
import { InfoCard } from '../ui/InfoCard';
import { ChartCard } from '../ui/ChartCard';
import { MetricCardWithSparkline } from '../ui/MetricCardWithSparkline';
import { AIR_QUALITY_LIMITS, CHART_DOMAINS, calculateDeviation, exceedsLimit } from '@/services/detalle/constants';
import { calculateAverage, getLatestValue } from '@/services/detalle/metricsCalculator';
import { formatChartNumber } from '@/lib/numberFormatter';
import type { AirQualityData } from '@/types/detalle/metrics.types';

export interface AirQualityTabProps {
  /**
   * Air quality data array
   */
  data: AirQualityData[];
}

/**
 * AirQualityTab component for displaying air quality metrics
 *
 * Follows SRP: Only handles air quality tab display
 * Uses composition with generic UI components (OCP)
 * Depends on service abstractions (DIP)
 *
 * @example
 * ```tsx
 * <AirQualityTab data={calidadAire1Data} />
 * ```
 */
export function AirQualityTab({ data }: AirQualityTabProps) {
  // Calculate metrics using service
  const avgPM1 = calculateAverage(data, 'pm1');
  const avgPM25 = calculateAverage(data, 'pm25');
  const avgPM4 = calculateAverage(data, 'pm4');
  const avgPM10 = calculateAverage(data, 'pm10');
  const avgCO2 = calculateAverage(data, 'co2');
  const avgVOC = calculateAverage(data, 'voc');
  const avgTemperatura = calculateAverage(data, 'temperatura');
  const avgHumedad = calculateAverage(data, 'humedad');

  // Get current values
  const currentPM1 = getLatestValue(data, 'pm1');
  const currentPM25 = getLatestValue(data, 'pm25');
  const currentPM4 = getLatestValue(data, 'pm4');
  const currentPM10 = getLatestValue(data, 'pm10');
  const currentCO2 = getLatestValue(data, 'co2');
  const currentVOC = getLatestValue(data, 'voc');

  // Calculate deviations
  const pm1Deviation = calculateDeviation(currentPM1, avgPM1);
  const pm25Deviation = calculateDeviation(currentPM25, avgPM25);
  const pm4Deviation = calculateDeviation(currentPM4, avgPM4);
  const pm10Deviation = calculateDeviation(currentPM10, avgPM10);
  const co2Deviation = calculateDeviation(currentCO2, avgCO2);
  const vocDeviation = calculateDeviation(currentVOC, avgVOC);

  // Determine status
  const pm1Exceeds = exceedsLimit(currentPM1, AIR_QUALITY_LIMITS.PM1);
  const pm25Exceeds = exceedsLimit(currentPM25, AIR_QUALITY_LIMITS.PM25);
  const pm4Exceeds = exceedsLimit(currentPM4, AIR_QUALITY_LIMITS.PM4);
  const pm10Exceeds = exceedsLimit(currentPM10, AIR_QUALITY_LIMITS.PM10);
  const co2Exceeds = exceedsLimit(currentCO2, AIR_QUALITY_LIMITS.CO2);
  const vocExceeds = exceedsLimit(currentVOC, AIR_QUALITY_LIMITS.VOC);

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <InfoCard
        title="Calidad del Aire Interior"
        icon="🌬️"
        description="Contaminantes del aire interior vinculados a la salud respiratoria: Material particulado (PM1, PM2.5, PM4, PM10), CO2 (dióxido de carbono), VOC (compuestos orgánicos volátiles), temperatura y humedad."
        bgColor="bg-cyan-50"
        borderColor="border-cyan-200"
        iconColor="text-cyan-600"
      />

      {/* Main PM2.5 Chart */}
      <ChartCard
        title="PM2.5 - Material Particulado Fino"
        description={`Límite recomendado: ${AIR_QUALITY_LIMITS.PM25} µg/m³`}
        data={data}
        chartType="line"
        series={[{ dataKey: 'pm25', name: 'PM2.5 (µg/m³)', stroke: '#8b5cf6', strokeWidth: 2 }]}
        yAxisDomain={CHART_DOMAINS.PM25}
        referenceLines={[{ y: AIR_QUALITY_LIMITS.PM25, label: 'Límite' }]}
        emptyMessage="Sin datos de calidad del aire disponibles"
        emptyIcon="🌬️"
      />

      {/* CO2 and VOC Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="CO2 - Dióxido de Carbono"
          description={`Límite recomendado: ${AIR_QUALITY_LIMITS.CO2} ppm`}
          data={data}
          chartType="line"
          series={[{ dataKey: 'co2', name: 'CO2 (ppm)', stroke: '#06b6d4', strokeWidth: 2 }]}
          yAxisDomain={CHART_DOMAINS.CO2}
          referenceLines={[{ y: AIR_QUALITY_LIMITS.CO2, label: 'Límite' }]}
          emptyIcon="💨"
        />

        <ChartCard
          title="VOC - Compuestos Orgánicos Volátiles"
          description={`Límite recomendado: ${AIR_QUALITY_LIMITS.VOC} ppb`}
          data={data}
          chartType="line"
          series={[{ dataKey: 'voc', name: 'VOC (ppb)', stroke: '#f59e0b', strokeWidth: 2 }]}
          yAxisDomain={CHART_DOMAINS.VOC}
          referenceLines={[{ y: AIR_QUALITY_LIMITS.VOC, label: 'Límite' }]}
          emptyIcon="⚗️"
        />
      </div>

      {/* Metrics Cards Grid */}
      {data.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* PM1 Card */}
            <MetricCardWithSparkline
              title="PM1"
              value={currentPM1}
              unit=" µg/m³"
              decimals={2}
              status={pm1Exceeds ? 'DANGER' : 'SUCCESS'}
              statusText={pm1Exceeds ? '⚠ Elevado' : '✓ Adecuado'}
              sparklineData={data}
              sparklineDataKey="pm1"
              deviation={`${pm1Deviation >= 0 ? '↑' : '↓'} ${formatChartNumber(Math.abs(pm1Deviation))}% vs promedio`}
              deviationColor={pm1Deviation >= 0 ? 'text-red-600' : 'text-green-600'}
            />

            {/* PM4 Card */}
            <MetricCardWithSparkline
              title="PM4"
              value={currentPM4}
              unit=" µg/m³"
              decimals={2}
              status={pm4Exceeds ? 'DANGER' : 'SUCCESS'}
              statusText={pm4Exceeds ? '⚠ Elevado' : '✓ Adecuado'}
              sparklineData={data}
              sparklineDataKey="pm4"
              deviation={`${pm4Deviation >= 0 ? '↑' : '↓'} ${formatChartNumber(Math.abs(pm4Deviation))}% vs promedio`}
              deviationColor={pm4Deviation >= 0 ? 'text-red-600' : 'text-green-600'}
            />

            {/* VOC Card */}
            <MetricCardWithSparkline
              title="VOC"
              value={currentVOC}
              unit=" ppb"
              decimals={2}
              status={vocExceeds ? 'DANGER' : 'SUCCESS'}
              statusText={vocExceeds ? '⚠ Elevado' : '✓ Adecuado'}
              sparklineData={data}
              sparklineDataKey="voc"
              deviation={`${vocDeviation >= 0 ? '↑' : '↓'} ${formatChartNumber(Math.abs(vocDeviation))}% vs promedio`}
              deviationColor={vocDeviation >= 0 ? 'text-red-600' : 'text-green-600'}
            />

            {/* Temperature Card */}
            <MetricCardWithSparkline
              title="Temp. Promedio"
              value={avgTemperatura}
              unit=" °C"
              decimals={2}
              status="INFO"
              description="Promedio del período"
              sparklineData={data}
              sparklineDataKey="temperatura"
            />

            {/* Humidity Card */}
            <MetricCardWithSparkline
              title="Humedad Promedio"
              value={avgHumedad}
              unit=" %"
              decimals={2}
              status="INFO"
              description="Promedio del período"
              sparklineData={data}
              sparklineDataKey="humedad"
            />
          </div>

          {/* PM10 Chart */}
          <ChartCard
            title="PM10 - Material Particulado"
            description={`Límite recomendado: ${AIR_QUALITY_LIMITS.PM10} µg/m³`}
            data={data}
            chartType="line"
            series={[{ dataKey: 'pm10', name: 'PM10 (µg/m³)', stroke: '#ec4899', strokeWidth: 2 }]}
            yAxisDomain={CHART_DOMAINS.PM10}
            referenceLines={[{ y: AIR_QUALITY_LIMITS.PM10, label: 'Límite' }]}
          />

          {/* Temperature and Humidity Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard
              title="Temperatura Ambiente"
              data={data}
              chartType="line"
              series={[{ dataKey: 'temperatura', name: 'Temperatura (°C)', stroke: '#f59e0b', strokeWidth: 2 }]}
              emptyIcon="🌡️"
            />

            <ChartCard
              title="Humedad Relativa"
              data={data}
              chartType="line"
              series={[{ dataKey: 'humedad', name: 'Humedad (%)', stroke: '#06b6d4', strokeWidth: 2 }]}
              emptyIcon="💧"
            />
          </div>
        </>
      )}
    </div>
  );
}
