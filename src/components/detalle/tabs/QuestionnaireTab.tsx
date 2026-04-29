// QuestionnaireTab component following SOLID principles
// Displays questionnaire symptoms and psychomotor metrics

import React from 'react';
import { InfoCard } from '../ui/InfoCard';
import { ChartCard } from '../ui/ChartCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatChartNumber, createFormatterWithUnit } from '@/lib/numberFormatter';

export interface QuestionnaireQuestion {
  pregunta: string;
  descripcion: string;
  valor: number | string;
  promedio: string;
}

export interface QuestionnaireTabProps {
  /**
   * Historical questionnaire data
   */
  data: Record<string, unknown>[];

  /**
   * Questions with current values and averages
   */
  questions: QuestionnaireQuestion[];

  /**
   * Average values for each symptom
   */
  averages: {
    fatiga: number;
    disnea: number;
    tos: number;
    sueno: number;
    animo: number;
    opresion: number;
  };

  /**
   * Selected visits for reference lines in charts
   */
  visitasSeleccionadas?: { fecha: string; }[]; 
}

/**
 * QuestionnaireTab component for displaying symptom questionnaire data
 *
 * Follows SRP: Only handles questionnaire tab display
 * Uses composition with generic UI components (OCP)
 *
 * @example
 * ```tsx
 * <QuestionnaireTab
 *   data={cuestionarioHistorico}
 *   questions={cuestionarioData}
 *   averages={{ fatiga: 2.5, disnea: 3.0, ... }}
 * />
 * ```
 */
export function QuestionnaireTab({ data, questions, averages, visitasSeleccionadas }: QuestionnaireTabProps) {
  return (
    <div className="space-y-4">
      {/* Main Info Card */}
      <InfoCard
        title="Cuestionario de Síntomas"
        icon="📋"
        description="El cuestionario de salud evalúa 6 síntomas clave relacionados con la EPOC: estado general, disnea, tos, uso del inhalador de rescate, y esputo (cantidad y coloración). Cada síntoma se cuantifica en una escala de 1 (mínimo) a 5 (máximo)."
        bgColor="bg-amber-50"
        borderColor="border-amber-200"
        iconColor="text-amber-600"
      />

      {/* Questions Description Card */}
      <Card>
        <CardHeader>
          <CardTitle>Descripción de Preguntas</CardTitle>
          <CardDescription>Escala de 1 (mínimo) a 5 (máximo)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-sm text-gray-900">{item.pregunta}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-xs text-gray-500">
                    Valor actual: <span className="font-bold text-blue-600">{item.valor}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    Promedio: <span className="font-bold text-gray-700">{item.promedio}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Temporal Evolution Info */}
      <InfoCard
        title="Evolución Temporal del Cuestionario"
        icon="📈"
        description="Las siguientes gráficas muestran la evolución individual de cada síntoma a lo largo del tiempo. Esto permite identificar tendencias, patrones y cambios en el estado del paciente de manera clara y específica."
        bgColor="bg-yellow-50"
        borderColor="border-yellow-200"
        iconColor="text-yellow-600"
      />

      {/* Symptoms Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* P1: Estado de salud general (Fatiga) */}
        <ChartCard
          title="P1: Estado de salud general"
          description={`Percepción general del estado de salud - Promedio: ${formatChartNumber(averages.fatiga)}`}
          data={data}
          chartType="line"
          series={[{ dataKey: 'fatiga', name: 'Fatiga', stroke: '#ef4444', strokeWidth: 2 }]}
          yAxisDomain={[0, 5]}
          referenceLines={[
            { 
              y: averages.fatiga, label: `Promedio: ${formatChartNumber(averages.fatiga)}`, stroke: '#94a3b8' 
            },
            ...visitasSeleccionadas?.map((v) => ({
              x: v.fecha,
              stroke: 'red',
              strokeDasharray: '3 3',
              label: '',
            })) || []
        ]}
          emptyIcon="📊"
        />

        {/* P2: Disnea */}
        <ChartCard
          title="P2: Disnea"
          description={`Sensación de falta de aire o dificultad para respirar - Promedio: ${formatChartNumber(averages.disnea)}`}
          data={data}
          chartType="line"
          series={[{ dataKey: 'disnea', name: 'Disnea', stroke: '#f59e0b', strokeWidth: 2 }]}
          yAxisDomain={[0, 5]}
          referenceLines={[
            { 
              y: averages.disnea, label: `Promedio: ${formatChartNumber(averages.disnea)}`, stroke: '#94a3b8' 
            },
            ...visitasSeleccionadas?.map((v) => ({
              x: v.fecha,
              stroke: 'red',
              strokeDasharray: '3 3',
              label: '',
            })) || []
        ]}
          emptyIcon="💨"
        />

        {/* P3: Tos */}
        <ChartCard
          title="P3: Tos"
          description={`Frecuencia e intensidad de episodios de tos - Promedio: ${formatChartNumber(averages.tos)}`}
          data={data}
          chartType="line"
          series={[{ dataKey: 'tos', name: 'Tos', stroke: '#eab308', strokeWidth: 2 }]}
          yAxisDomain={[0, 5]}
          referenceLines={[
            { 
              y: averages.tos, label: `Promedio: ${formatChartNumber(averages.tos)}`, stroke: '#94a3b8' 
            },
            ...visitasSeleccionadas?.map((v) => ({
              x: v.fecha,
              stroke: 'red',
              strokeDasharray: '3 3',
              label: '',
            })) || []
          ]}
          emptyIcon="🤧"
        />

        {/* P4: Uso Inhalador */}
        <ChartCard
          title="P4: Uso Inhalador"
          description={`Frecuencia de uso del inhalador de rescate - Promedio: ${formatChartNumber(averages.sueno)}`}
          data={data}
          chartType="line"
          series={[{ dataKey: 'sueno', name: 'Sueño', stroke: '#10b981', strokeWidth: 2 }]}
          yAxisDomain={[0, 5]}
          referenceLines={[
            { 
              y: averages.sueno, label: `Promedio: ${formatChartNumber(averages.sueno)}`, stroke: '#94a3b8' 
            },
            ...visitasSeleccionadas?.map((v) => ({
              x: v.fecha,
              stroke: 'red',
              strokeDasharray: '3 3',
              label: '',
            })) || []
          ]}
          emptyIcon="💊"
        />

        {/* P5: Esputo */}
        <ChartCard
          title="P5: Esputo"
          description={`Cantidad de esputo o flema producida - Promedio: ${formatChartNumber(averages.animo)}`}
          data={data}
          chartType="line"
          series={[{ dataKey: 'animo', name: 'Ánimo', stroke: '#3b82f6', strokeWidth: 2 }]}
          yAxisDomain={[0, 5]}
          referenceLines={[
            { 
              y: averages.animo, label: `Promedio: ${formatChartNumber(averages.animo)}`, stroke: '#94a3b8' 
            },
            ...visitasSeleccionadas?.map((v) => ({
              x: v.fecha,
              stroke: 'red',
              strokeDasharray: '3 3',
              label: '',
            })) || []
          ]}
          emptyIcon="🫁"
        />

        {/* P6: Color del Esputo */}
        <ChartCard
          title="P6: Color del Esputo"
          description={`Coloración del esputo producido - Promedio: ${formatChartNumber(averages.opresion)}`}
          data={data}
          chartType="line"
          series={[{ dataKey: 'opresion', name: 'Opresión', stroke: '#8b5cf6', strokeWidth: 2 }]}
          yAxisDomain={[0, 5]}
          referenceLines={[
            { 
              y: averages.opresion, label: `Promedio: ${formatChartNumber(averages.opresion)}`, stroke: '#94a3b8' 
            },
            ...visitasSeleccionadas?.map((v) => ({
              x: v.fecha,
              stroke: 'red',
              strokeDasharray: '3 3',
              label: '',
            })) || []
          ]}
          emptyIcon="💜"
        />
      </div>

      {/* Psychomotor State Section */}
      <InfoCard
        title="Estado Psicomotor"
        icon="🎯"
        description="Evaluación de la coordinación motora y precisión del paciente mediante pruebas de trazado y pulsación. Los errores de pulsación miden la precisión al tocar objetivos en pantalla, mientras que las métricas de trazado evalúan la calidad del movimiento al dibujar círculos."
        bgColor="bg-violet-50"
        borderColor="border-violet-200"
        iconColor="text-violet-600"
      />

      {/* Tap Error Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Error de Pulsación - Promedio"
          description="Error promedio normalizado de las 3 pulsaciones"
          data={data}
          chartType="line"
          series={[{ dataKey: 'errorPromedio', name: 'Error Promedio', stroke: '#8b5cf6', strokeWidth: 2 }]}
          yAxisDomain={[0, 'auto' as const]}
          emptyIcon="🎯"
          referenceLines={[...(visitasSeleccionadas?.map((v) => ({
            x: v.fecha,
            stroke: 'red',
            strokeDasharray: '3 3',
            label: '',
          })) || [])]}
        />

        <ChartCard
          title="Error de Pulsación - Máximo"
          description="Error máximo de las 3 pulsaciones"
          data={data}
          chartType="line"
          series={[{ dataKey: 'errorMaximo', name: 'Error Máximo', stroke: '#ef4444', strokeWidth: 2 }]}
          yAxisDomain={[0, 'auto' as const]}
          emptyIcon="❌"
          referenceLines={[...(visitasSeleccionadas?.map((v) => ({
            x: v.fecha,
            stroke: 'red',
            strokeDasharray: '3 3',
            label: '',
          })) || [])]}
        />
      </div>

      {/* Drawing Metrics - Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Suavidad del Contorno"
          description="Regularidad del trazo al dibujar"
          data={data}
          chartType="line"
          series={[{ dataKey: 'suavidad', name: 'Suavidad', stroke: '#10b981', strokeWidth: 2 }]}
          height={200}
          emptyIcon="✨"
          referenceLines={[...(visitasSeleccionadas?.map((v) => ({
            x: v.fecha,
            stroke: 'red',
            strokeDasharray: '3 3',
            label: '',
          })) || [])]}
        />

        <ChartCard
          title="Circularidad"
          description="Qué tan circular es el trazado"
          data={data}
          chartType="line"
          series={[{ dataKey: 'circularidad', name: 'Circularidad', stroke: '#3b82f6', strokeWidth: 2 }]}
          height={200}
          emptyIcon="⭕"
          referenceLines={[...(visitasSeleccionadas?.map((v) => ({
            x: v.fecha,
            stroke: 'red',
            strokeDasharray: '3 3',
            label: '',
          })) || [])]}
        />
      </div>

      {/* Drawing Metrics - Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Tamaño"
          description="Área del círculo dibujado"
          data={data}
          chartType="line"
          series={[{ dataKey: 'areaCircle', name: 'Tamaño', stroke: '#f59e0b', strokeWidth: 2 }]}
          height={200}
          emptyIcon="📏"
          referenceLines={[...(visitasSeleccionadas?.map((v) => ({
            x: v.fecha,
            stroke: 'red',
            strokeDasharray: '3 3',
            label: '',
          })) || [])]}
        />

        <ChartCard
          title="Excentricidad"
          description="Desviación de la forma circular perfecta"
          data={data}
          chartType="line"
          series={[{ dataKey: 'excentricidad', name: 'Excentricidad', stroke: '#ec4899', strokeWidth: 2 }]}
          height={200}
          emptyIcon="🔄"
          referenceLines={[...(visitasSeleccionadas?.map((v) => ({
            x: v.fecha,
            stroke: 'red',
            strokeDasharray: '3 3',
            label: '',
          })) || [])]}
        />
      </div>

      {/* Drawing Metrics - Row 3 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Desviación del Centro"
          description="Distancia del centro del círculo al punto objetivo"
          data={data}
          chartType="line"
          series={[{ dataKey: 'desviacion', name: 'Desviación', stroke: '#6366f1', strokeWidth: 2 }]}
          height={200}
          emptyIcon="🎯"
          referenceLines={[...(visitasSeleccionadas?.map((v) => ({
            x: v.fecha,
            stroke: 'red',
            strokeDasharray: '3 3',
            label: '',
          })) || [])]}
        />

        <ChartCard
          title="Tiempo en Completar el Círculo"
          description="Segundos empleados en el trazado"
          data={data}
          chartType="line"
          series={[{ dataKey: 'tiempo', name: 'Tiempo (s)', stroke: '#14b8a6', strokeWidth: 2 }]}
          height={200}
          tooltipFormatter={createFormatterWithUnit('s')}
          emptyIcon="⏱️"
          referenceLines={[...(visitasSeleccionadas?.map((v) => ({
            x: v.fecha,
            stroke: 'red',
            strokeDasharray: '3 3',
            label: '',
          })) || [])]}
        />
      </div>

      {/* Radius Variability Metrics - Row 4 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="D.E. de la Variabilidad del Radio"
          description="Desviación estándar de la variabilidad del radio"
          data={data}
          chartType="line"
          series={[{ dataKey: 'variabilidadStd', name: 'D.E. Variabilidad', stroke: '#f97316', strokeWidth: 2 }]}
          height={200}
          emptyIcon="📊"
          referenceLines={[...(visitasSeleccionadas?.map((v) => ({
            x: v.fecha,
            stroke: 'red',
            strokeDasharray: '3 3',
            label: '',
          })) || [])]}
        />

        <ChartCard
          title="Media de la Variabilidad del Radio"
          description="Promedio de la variabilidad del radio"
          data={data}
          chartType="line"
          series={[{ dataKey: 'variabilidadMedia', name: 'Media Variabilidad', stroke: '#84cc16', strokeWidth: 2 }]}
          height={200}
          emptyIcon="📈"
          referenceLines={[...(visitasSeleccionadas?.map((v) => ({
            x: v.fecha,
            stroke: 'red',
            strokeDasharray: '3 3',
            label: '',
          })) || [])]}
        />
      </div>
    </div>
  );
}
