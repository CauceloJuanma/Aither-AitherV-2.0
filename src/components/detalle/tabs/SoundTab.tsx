// SoundTab component following SOLID principles
// Displays voice and cough acoustic analysis data

import React from 'react';
import { ChartCard } from '../ui/ChartCard';
import { InfoCard } from '../ui/InfoCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatChartNumber, createFormatterWithUnit } from '@/lib/numberFormatter';
import type { ChartDataPoint } from '@/types/detalle/metrics.types';

/**
 * Sound data with voice and cough parameters
 */
export interface SoundData extends ChartDataPoint {
  // Voice (phrase) parameters
  duracionFrase?: number;
  tasaHabla?: number;
  jitter?: number;
  pitch?: number;
  shimmer?: number;
  hnr?: number;
  intensidadPromedio?: number;
  numeroPausas?: number;
  duracionPausasTotal?: number;
  f0Min?: number;
  f0Max?: number;
  mfccs?: string;
  variabilidadTono?: number;
  variabilidadIntensidad?: number;
  variabilidadRitmo?: number;
  // Cough parameters
  tosDuracion?: number;
  tosEnergiaRmsMean?: number;
  tosZcrMean?: number;
  tosSpectralCentroidMean?: number;
  tosSpectralBandwidthMean?: number;
  tosF0Mean?: number;
  tosHnr?: number;
  tosMfccMean1?: number;
  tosMfccMean2?: number;
}

export interface SoundTabProps {
  /**
   * Sound data array
   */
  data: SoundData[];
}

/**
 * SoundTab component for displaying voice and cough acoustic analysis
 *
 * Follows SRP: Only handles sound tab display
 * Uses composition with generic UI components (OCP)
 *
 * @example
 * ```tsx
 * <SoundTab data={sonidosData} />
 * ```
 */
export function SoundTab({ data }: SoundTabProps) {
  // Calculate averages for voice parameters
  const avgDuracionFrase =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.duracionFrase || 0), 0) / data.length
      : 0;
  const avgTasaHabla =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.tasaHabla || 0), 0) / data.length
      : 0;
  const avgJitter =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.jitter || 0), 0) / data.length
      : 0;
  const avgPitch =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.pitch || 0), 0) / data.length
      : 0;
  const avgShimmer =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.shimmer || 0), 0) / data.length
      : 0;
  const avgHnr =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.hnr || 0), 0) / data.length
      : 0;
  const avgIntensidad =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.intensidadPromedio || 0), 0) / data.length
      : 0;
  const avgNumeroPausas =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.numeroPausas || 0), 0) / data.length
      : 0;

  // Calculate averages for cough parameters
  const avgTosDuracion =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.tosDuracion || 0), 0) / data.length
      : 0;
  const avgTosEnergia =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.tosEnergiaRmsMean || 0), 0) / data.length
      : 0;
  const avgTosZcr =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.tosZcrMean || 0), 0) / data.length
      : 0;
  const avgTosCentroide =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.tosSpectralCentroidMean || 0), 0) / data.length
      : 0;
  const avgTosF0 =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.tosF0Mean || 0), 0) / data.length
      : 0;
  const avgTosHnr =
    data.length > 0
      ? data.reduce((sum, d) => sum + (d.tosHnr || 0), 0) / data.length
      : 0;

  // Check if we have voice data
  const hasVoiceData = data.some(d => (d.duracionFrase || 0) > 0 || (d.pitch || 0) > 0);
  // Check if we have cough data
  const hasCoughData = data.some(d => (d.tosDuracion || 0) > 0 || (d.tosEnergiaRmsMean || 0) > 0);

  return (
    <div className="space-y-4">
      {/* Description Card */}
      <InfoCard
        icon="🎤"
        title="Análisis Acústico de Voz y Tos"
        description="Seguimiento de la firma acústica del paciente mediante análisis de voz (lectura de frase) y tos. Incluye parámetros de frecuencia, intensidad, jitter, shimmer, y análisis espectral para detectar cambios respiratorios."
        bgColor="purple"
      />

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Registros Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-gray-600">días con análisis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Datos de Voz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hasVoiceData ? '✓ Disponible' : 'Sin datos'}</div>
            <p className="text-xs text-gray-600">análisis de frase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Datos de Tos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hasCoughData ? '✓ Disponible' : 'Sin datos'}</div>
            <p className="text-xs text-gray-600">análisis de tos</p>
          </CardContent>
        </Card>
      </div>

      {/* Voice Parameters Section */}
      {hasVoiceData && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Duración Frase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgDuracionFrase)} s</div>
                <p className="text-xs text-gray-600">promedio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tasa de Habla</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgTasaHabla)}</div>
                <p className="text-xs text-gray-600">sílabas/segundo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pitch (F0)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgPitch)} Hz</div>
                <p className="text-xs text-gray-600">frecuencia fundamental</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">HNR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgHnr)} dB</div>
                <p className="text-xs text-gray-600">ratio ruido-armónico</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Jitter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgJitter)}%</div>
                <p className="text-xs text-gray-600">variación pitch</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Shimmer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgShimmer)}%</div>
                <p className="text-xs text-gray-600">variación amplitud</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Intensidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgIntensidad)} dB</div>
                <p className="text-xs text-gray-600">promedio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pausas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgNumeroPausas)}</div>
                <p className="text-xs text-gray-600">número promedio</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Cough Parameters Section */}
      {hasCoughData && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Duración Tos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgTosDuracion)} s</div>
                <p className="text-xs text-gray-600">promedio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Energía Tos (RMS)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgTosEnergia)}</div>
                <p className="text-xs text-gray-600">valor medio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">ZCR Tos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgTosZcr)}</div>
                <p className="text-xs text-gray-600">zero crossing rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Centroide Espectral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgTosCentroide)} Hz</div>
                <p className="text-xs text-gray-600">promedio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">F0 Tos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgTosF0)} Hz</div>
                <p className="text-xs text-gray-600">frecuencia fundamental</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">HNR Tos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatChartNumber(avgTosHnr)} dB</div>
                <p className="text-xs text-gray-600">ratio ruido-armónico</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Voice Duration Chart */}
      {hasVoiceData && (
        <ChartCard
          title="Duración de la Frase"
          description="Duración de la frase leída por el paciente (segundos)"
          data={data}
          chartType="line"
          series={[{ dataKey: 'duracionFrase', name: 'Duración (s)', stroke: '#8b5cf6', strokeWidth: 2 }]}
          yAxisDomain={[0, Math.max(10, (avgDuracionFrase * 1.5))]}
          height={300}
          emptyMessage="Sin datos de duración de frase"
          emptyIcon="🗣️"
        />
      )}

      {/* Voice Pitch Chart */}
      {hasVoiceData && (
        <ChartCard
          title="Pitch (F0) de la Voz"
          description="Frecuencia fundamental de la voz a lo largo del tiempo"
          data={data}
          chartType="line"
          series={[{ dataKey: 'pitch', name: 'Pitch (Hz)', stroke: '#ec4899', strokeWidth: 2 }]}
          height={300}
          emptyMessage="Sin datos de pitch"
          emptyIcon="🎵"
        />
      )}

      {/* Voice HNR Chart */}
      {hasVoiceData && (
        <ChartCard
          title="Ratio Ruido-Armónico (HNR)"
          description="Relación entre componentes armónicos y ruido"
          data={data}
          chartType="line"
          series={[{ dataKey: 'hnr', name: 'HNR (dB)', stroke: '#14b8a6', strokeWidth: 2 }]}
          yAxisDomain={[0, 20]}
          referenceLines={[{ y: 10, stroke: '#f59e0b', strokeDasharray: '5 5', label: 'Umbral: 10dB' }]}
          height={300}
          emptyMessage="Sin datos de HNR"
          emptyIcon="📊"
        />
      )}

      {/* Cough Duration Chart */}
      {hasCoughData && (
        <ChartCard
          title="Duración de la Tos"
          description="Duración de los episodios de tos (segundos)"
          data={data}
          chartType="line"
          series={[{ dataKey: 'tosDuracion', name: 'Duración (s)', stroke: '#f97316', strokeWidth: 2 }]}
          height={300}
          emptyMessage="Sin datos de tos"
          emptyIcon="😷"
        />
      )}

      {/* Cough Energy Chart */}
      {hasCoughData && (
        <ChartCard
          title="Energía de la Tos (RMS)"
          description="Energía RMS de los episodios de tos"
          data={data}
          chartType="line"
          series={[{ dataKey: 'tosEnergiaRmsMean', name: 'Energía RMS', stroke: '#ef4444', strokeWidth: 2 }]}
          height={300}
          emptyMessage="Sin datos de energía"
          emptyIcon="⚡"
        />
      )}

      {/* Cough Spectral Centroid Chart */}
      {hasCoughData && (
        <ChartCard
          title="Centroide Espectral de la Tos"
          description="Centroide espectral de la tos (Hz)"
          data={data}
          chartType="line"
          series={[{ dataKey: 'tosSpectralCentroidMean', name: 'Centroide (Hz)', stroke: '#84cc16', strokeWidth: 2 }]}
          height={300}
          emptyMessage="Sin datos de centroide"
          emptyIcon="📈"
        />
      )}

      {/* No Data State */}
      {!hasVoiceData && !hasCoughData && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🎤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin datos de análisis acústico</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No hay registros de análisis de voz o tos para el paciente en el período seleccionado.
              Los datos de análisis acústico se generan cuando el paciente realiza las pruebas de voz y tos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}