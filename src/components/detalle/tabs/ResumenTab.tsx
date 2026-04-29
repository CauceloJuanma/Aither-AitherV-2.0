import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Heart, Wind, Moon, Activity, AlertCircle } from 'lucide-react';
import { formatChartNumber } from '@/lib/numberFormatter';

// Helper para formatear valores numéricos con fallback a "(Sin Datos)"
const formatValue = (value: number | null | undefined, suffix: string = '', decimals: number = 0): string => {
  if (value === null || value === undefined || isNaN(value) || value === 0) {
    return '(Sin Datos)';
  }
  return `${value.toFixed(decimals)}${suffix}`;
};

// Helper para verificar si hay datos válidos
const hasValidData = (value: number | null | undefined): boolean => {
  return value !== null && value !== undefined && !isNaN(value) && value !== 0;
};

interface ResumenTabProps {
  saturacionData: Record<string, unknown>[];
  avgSaturacion: number;
  picoFlujoData: Record<string, unknown>[];
  avgPicoFlujo: number;
  suenoData: Record<string, unknown>[];
  sleepEfficiency: number;
  calidadAire1Data: Record<string, unknown>[];
  avgPM25: number;
  avgPM10: number;
  resumenData: Record<string, unknown>[];
  avgPasos: number;
  actividadData: Record<string, unknown>[];
  avgRestingHeartRate: number;
  pesajeData: Record<string, unknown>[];
  avgPeso: number;
  avgTimeInBed: number;
  avgBreathingRate: number;
  avgHRVdailyRmssd: number;
  cuestionarioHistorico: Record<string, unknown>[];
  visitasSeleccionadas: { fecha: string; }[];
}

export default function ResumenTab({
  saturacionData,
  avgSaturacion,
  picoFlujoData,
  avgPicoFlujo,
  suenoData,
  sleepEfficiency,
  calidadAire1Data,
  avgPM25,
  avgPM10,
  resumenData,
  avgPasos,
  actividadData,
  avgRestingHeartRate,
  pesajeData,
  avgPeso,
  avgTimeInBed,
  avgBreathingRate,
  avgHRVdailyRmssd,
  cuestionarioHistorico,
  visitasSeleccionadas
}: ResumenTabProps) {
  // Calcular promedio de disnea del cuestionario
  const avgDisnea = cuestionarioHistorico.length > 0
    ? cuestionarioHistorico.reduce((sum, d) => sum + (d.disnea as number), 0) / cuestionarioHistorico.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Descripción breve */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Resumen Clínico del Paciente</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 leading-relaxed">
            Este panel muestra indicadores clínicos básicos del paciente. Incluye métricas como la saturación de oxígeno en sangre, el flujo espiratorio máximo (FEM) o pico de flujo, parámetros de la calidad del sueño y concentraciones de determinados polutantes en el aire interior. Estos datos permiten evaluar, de forma general, el estado de salud respiratoria del paciente.
          </p>
        </CardContent>
      </Card>

      {/* Tarjetas de métricas críticas - Fila 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Saturación de Oxígeno */}
        <Card className="relative overflow-hidden">
          <div className={`absolute inset-0 opacity-10 ${avgSaturacion >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Saturación SpO2</CardTitle>
            <Heart className={`h-4 w-4 ${avgSaturacion >= 95 ? 'text-green-600' : 'text-yellow-600'}`} />
          </CardHeader>
          <CardContent className="relative z-10">
            {/* Sparkline de fondo */}
            <div className="absolute inset-x-0 bottom-0 h-12 opacity-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={saturacionData}>
                  <Line
                    type="monotone"
                    dataKey="spo2"
                    stroke={avgSaturacion >= 95 ? '#10b981' : '#f59e0b'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`text-2xl font-bold ${hasValidData(avgSaturacion) ? (avgSaturacion >= 95 ? 'text-green-600' : 'text-yellow-600') : 'text-gray-400 italic'}`}>
              {hasValidData(avgSaturacion) ? `${avgSaturacion}%` : '(Sin Datos)'}
            </div>
            <p className="text-xs text-gray-600">Promedio (Normal: ≥95%)</p>
            {hasValidData(avgSaturacion) && (
              <p className={`text-xs mt-1 ${avgSaturacion >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                {avgSaturacion >= 95 ? '✓ Normal' : '⚠ Monitorear'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pico de Flujo */}
        <Card className="relative overflow-hidden">
          <div className={`absolute inset-0 opacity-10 ${avgPicoFlujo >= 350 ? 'bg-green-500' : 'bg-orange-500'}`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Pico de Flujo</CardTitle>
            <Activity className={`h-4 w-4 ${avgPicoFlujo >= 350 ? 'text-green-600' : 'text-orange-600'}`} />
          </CardHeader>
          <CardContent className="relative z-10">
            {/* Sparkline de fondo */}
            <div className="absolute inset-x-0 bottom-0 h-12 opacity-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={picoFlujoData}>
                  <Line
                    type="monotone"
                    dataKey="toma1"
                    stroke={avgPicoFlujo >= 350 ? '#10b981' : '#f59e0b'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`text-2xl font-bold ${hasValidData(avgPicoFlujo) ? (avgPicoFlujo >= 350 ? 'text-green-600' : 'text-orange-600') : 'text-gray-400 italic'}`}>
              {hasValidData(avgPicoFlujo) ? `${avgPicoFlujo} L/min` : '(Sin Datos)'}
            </div>
            <p className="text-xs text-gray-600">Promedio (Normal: 350-420)</p>
            {hasValidData(avgPicoFlujo) && (
              <p className={`text-xs mt-1 ${avgPicoFlujo >= 350 ? 'text-green-600' : 'text-orange-600'}`}>
                {avgPicoFlujo >= 350 ? '✓ Adecuado' : '⚠ Bajo'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Eficiencia del Sueño */}
        <Card className="relative overflow-hidden">
          <div className={`absolute inset-0 opacity-10 ${sleepEfficiency >= 40 ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Eficiencia Sueño</CardTitle>
            <Moon className={`h-4 w-4 ${sleepEfficiency >= 40 ? 'text-green-600' : 'text-yellow-600'}`} />
          </CardHeader>
          <CardContent className="relative z-10">
            {/* Sparkline de fondo */}
            <div className="absolute inset-x-0 bottom-0 h-12 opacity-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={suenoData}>
                  <Line
                    type="monotone"
                    dataKey="duracion"
                    stroke={sleepEfficiency >= 40 ? '#10b981' : '#f59e0b'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`text-2xl font-bold ${hasValidData(sleepEfficiency) ? (sleepEfficiency >= 40 ? 'text-green-600' : 'text-yellow-600') : 'text-gray-400 italic'}`}>
              {hasValidData(sleepEfficiency) ? `${formatChartNumber(sleepEfficiency)}%` : '(Sin Datos)'}
            </div>
            <p className="text-xs text-gray-600">Sueño profundo + REM (Meta: ≥40%)</p>
            {hasValidData(sleepEfficiency) && (
              <p className={`text-xs mt-1 ${sleepEfficiency >= 40 ? 'text-green-600' : 'text-yellow-600'}`}>
                {sleepEfficiency >= 40 ? '✓ Buena calidad' : '⚠ Mejorar'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Promedio PM2.5 */}
        <Card className="relative overflow-hidden">
          <div className={`absolute inset-0 opacity-10 ${avgPM25 < 25 ? 'bg-green-500' : 'bg-red-500'}`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Calidad Aire PM2.5</CardTitle>
            <Wind className={`h-4 w-4 ${avgPM25 < 25 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent className="relative z-10">
            {/* Sparkline de fondo */}
            <div className="absolute inset-x-0 bottom-0 h-12 opacity-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calidadAire1Data}>
                  <Line
                    type="monotone"
                    dataKey="pm25"
                    stroke={avgPM25 < 25 ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`text-2xl font-bold ${hasValidData(avgPM25) ? (avgPM25 < 25 ? 'text-green-600' : 'text-red-600') : 'text-gray-400 italic'}`}>
              {hasValidData(avgPM25) ? `${formatChartNumber(avgPM25)} µg/m³` : '(Sin Datos)'}
            </div>
            <p className="text-xs text-gray-600">Promedio (Límite: &lt;25 µg/m³)</p>
            {hasValidData(avgPM25) && (
              <p className={`text-xs mt-1 ${avgPM25 < 25 ? 'text-green-600' : 'text-red-600'}`}>
                {avgPM25 < 25 ? '✓ Aire limpio' : '⚠ Contaminado'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tasa Cardíaca en Reposo */}
        <Card className="relative overflow-hidden">
          <div className={`absolute inset-0 opacity-10 ${avgRestingHeartRate >= 60 && avgRestingHeartRate <= 100 ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">FC en Reposo</CardTitle>
            <Heart className={`h-4 w-4 ${avgRestingHeartRate >= 60 && avgRestingHeartRate <= 100 ? 'text-green-600' : 'text-yellow-600'}`} />
          </CardHeader>
          <CardContent className="relative z-10">
            {/* Sparkline de fondo */}
            <div className="absolute inset-x-0 bottom-0 h-12 opacity-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={actividadData}>
                  <Line
                    type="monotone"
                    dataKey="restingHeartRate"
                    stroke={avgRestingHeartRate >= 60 && avgRestingHeartRate <= 100 ? '#10b981' : '#f59e0b'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`text-2xl font-bold ${hasValidData(avgRestingHeartRate) ? (avgRestingHeartRate >= 60 && avgRestingHeartRate <= 100 ? 'text-green-600' : 'text-yellow-600') : 'text-gray-400 italic'}`}>
              {hasValidData(avgRestingHeartRate) ? `${Math.round(avgRestingHeartRate)} bpm` : '(Sin Datos)'}
            </div>
            <p className="text-xs text-gray-600">Promedio (Normal: 60-100 bpm)</p>
            {hasValidData(avgRestingHeartRate) && (
              <p className={`text-xs mt-1 ${avgRestingHeartRate >= 60 && avgRestingHeartRate <= 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                {avgRestingHeartRate >= 60 && avgRestingHeartRate <= 100 ? '✓ Normal' : '⚠ Monitorear'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas de métricas críticas - Fila 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Peso */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-blue-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Peso</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            {/* Sparkline de fondo */}
            <div className="absolute inset-x-0 bottom-0 h-12 opacity-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pesajeData}>
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`text-2xl font-bold ${hasValidData(avgPeso) ? 'text-blue-600' : 'text-gray-400 italic'}`}>
              {hasValidData(avgPeso) ? `${formatChartNumber(avgPeso)} kg` : '(Sin Datos)'}
            </div>
            <p className="text-xs text-gray-600">Promedio del período</p>
          </CardContent>
        </Card>

        {/* Tiempo en Cama */}
        <Card className="relative overflow-hidden">
          <div className={`absolute inset-0 opacity-10 ${avgTimeInBed >= 7 && avgTimeInBed <= 9 ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Tiempo en Cama</CardTitle>
            <Moon className={`h-4 w-4 ${avgTimeInBed >= 7 && avgTimeInBed <= 9 ? 'text-green-600' : 'text-yellow-600'}`} />
          </CardHeader>
          <CardContent className="relative z-10">
            {/* Sparkline de fondo */}
            <div className="absolute inset-x-0 bottom-0 h-12 opacity-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={suenoData}>
                  <Line
                    type="monotone"
                    dataKey="timeInBed"
                    stroke={avgTimeInBed >= 7 && avgTimeInBed <= 9 ? '#10b981' : '#f59e0b'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`text-2xl font-bold ${hasValidData(avgTimeInBed) ? (avgTimeInBed >= 7 && avgTimeInBed <= 9 ? 'text-green-600' : 'text-yellow-600') : 'text-gray-400 italic'}`}>
              {hasValidData(avgTimeInBed) ? `${formatChartNumber(avgTimeInBed)} h` : '(Sin Datos)'}
            </div>
            <p className="text-xs text-gray-600">Promedio (Recomendado: 7-9h)</p>
            {hasValidData(avgTimeInBed) && (
              <p className={`text-xs mt-1 ${avgTimeInBed >= 7 && avgTimeInBed <= 9 ? 'text-green-600' : 'text-yellow-600'}`}>
                {avgTimeInBed >= 7 && avgTimeInBed <= 9 ? '✓ Adecuado' : '⚠ Revisar'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tasa Respiratoria Nocturna */}
        <Card className="relative overflow-hidden">
          <div className={`absolute inset-0 opacity-10 ${avgBreathingRate >= 12 && avgBreathingRate <= 20 ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Tasa Resp. Nocturna</CardTitle>
            <Wind className={`h-4 w-4 ${avgBreathingRate >= 12 && avgBreathingRate <= 20 ? 'text-green-600' : 'text-yellow-600'}`} />
          </CardHeader>
          <CardContent className="relative z-10">
            {/* Sparkline de fondo */}
            <div className="absolute inset-x-0 bottom-0 h-12 opacity-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={suenoData}>
                  <Line
                    type="monotone"
                    dataKey="average_breathing_rate"
                    stroke={avgBreathingRate >= 12 && avgBreathingRate <= 20 ? '#10b981' : '#f59e0b'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`text-2xl font-bold ${hasValidData(avgBreathingRate) ? (avgBreathingRate >= 12 && avgBreathingRate <= 20 ? 'text-green-600' : 'text-yellow-600') : 'text-gray-400 italic'}`}>
              {hasValidData(avgBreathingRate) ? `${Math.round(avgBreathingRate)} rpm` : '(Sin Datos)'}
            </div>
            <p className="text-xs text-gray-600">Promedio (Normal: 12-20 rpm)</p>
            {hasValidData(avgBreathingRate) && (
              <p className={`text-xs mt-1 ${avgBreathingRate >= 12 && avgBreathingRate <= 20 ? 'text-green-600' : 'text-yellow-600'}`}>
                {avgBreathingRate >= 12 && avgBreathingRate <= 20 ? '✓ Normal' : '⚠ Monitorear'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Variabilidad Cardíaca Nocturna */}
        <Card className="relative overflow-hidden">
          <div className={`absolute inset-0 opacity-10 ${avgHRVdailyRmssd >= 20 ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">HRV Nocturna</CardTitle>
            <Heart className={`h-4 w-4 ${avgHRVdailyRmssd >= 20 ? 'text-green-600' : 'text-yellow-600'}`} />
          </CardHeader>
          <CardContent className="relative z-10">
            {/* Sparkline de fondo */}
            <div className="absolute inset-x-0 bottom-0 h-12 opacity-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={suenoData}>
                  <Line
                    type="monotone"
                    dataKey="HRVdailyRmssd"
                    stroke={avgHRVdailyRmssd >= 20 ? '#10b981' : '#f59e0b'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`text-2xl font-bold ${hasValidData(avgHRVdailyRmssd) ? (avgHRVdailyRmssd >= 20 ? 'text-green-600' : 'text-yellow-600') : 'text-gray-400 italic'}`}>
              {hasValidData(avgHRVdailyRmssd) ? `${Math.round(avgHRVdailyRmssd)} ms` : '(Sin Datos)'}
            </div>
            <p className="text-xs text-gray-600">Promedio (Saludable: ≥20 ms)</p>
            {hasValidData(avgHRVdailyRmssd) && (
              <p className={`text-xs mt-1 ${avgHRVdailyRmssd >= 20 ? 'text-green-600' : 'text-yellow-600'}`}>
                {avgHRVdailyRmssd >= 20 ? '✓ Buena' : '⚠ Baja'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Disnea (Cuestionario) */}
        <Card className="relative overflow-hidden">
          <div className={`absolute inset-0 opacity-10 ${avgDisnea <= 2 ? 'bg-green-500' : avgDisnea <= 3 ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Disnea</CardTitle>
            <Wind className={`h-4 w-4 ${avgDisnea <= 2 ? 'text-green-600' : avgDisnea <= 3 ? 'text-yellow-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent className="relative z-10">
            {/* Sparkline de fondo */}
            <div className="absolute inset-x-0 bottom-0 h-12 opacity-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cuestionarioHistorico}>
                  <Line
                    type="monotone"
                    dataKey="disnea"
                    stroke={avgDisnea <= 2 ? '#10b981' : avgDisnea <= 3 ? '#f59e0b' : '#ef4444'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`text-2xl font-bold ${hasValidData(avgDisnea) ? (avgDisnea <= 2 ? 'text-green-600' : avgDisnea <= 3 ? 'text-yellow-600' : 'text-red-600') : 'text-gray-400 italic'}`}>
              {hasValidData(avgDisnea) ? `${formatChartNumber(avgDisnea)}/5` : '(Sin Datos)'}
            </div>
            <p className="text-xs text-gray-600">Nivel promedio (Escala 1-5)</p>
            {hasValidData(avgDisnea) && (
              <p className={`text-xs mt-1 ${avgDisnea <= 2 ? 'text-green-600' : avgDisnea <= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                {avgDisnea <= 2 ? '✓ Leve' : avgDisnea <= 3 ? '⚠ Moderada' : '⚠ Severa'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficas detalladas */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Saturación de Oxígeno */}
        <Card>
          <CardHeader>
            <CardTitle>Saturación de Oxígeno (SpO2)</CardTitle>
            <CardDescription>Tendencia de oxigenación sanguínea</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={saturacionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis domain={[90, 100]} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={95} stroke="#ef4444" strokeDasharray="3 3" label="Mínimo" />
                {visitasSeleccionadas.map((v) => (
                  <ReferenceLine x={v.fecha} stroke="red" strokeDasharray="3 3" label="" />
                ))}
                <Line type="monotone" dataKey="spo2" stroke="#10b981" strokeWidth={2} name="SpO2 %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pico de Flujo Espiratorio */}
        <Card>
          <CardHeader>
            <CardTitle>Pico de Flujo Espiratorio (PEF)</CardTitle>
            <CardDescription>Función pulmonar - Primera toma diaria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={picoFlujoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis domain={[300, 450]} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={350} stroke="#f59e0b" strokeDasharray="3 3" label="Mínimo" />
                <Line type="monotone" dataKey="toma1" stroke="#3b82f6" strokeWidth={2} name="PEF (L/min)" />
                {visitasSeleccionadas.map((v) => (
                  <ReferenceLine x={v.fecha} stroke="red" strokeDasharray="3 3" label="" />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica de Pasos Diarios */}
      <Card>
        <CardHeader>
          <CardTitle>Pasos Diarios</CardTitle>
          <CardDescription>Meta recomendada: 10,000 pasos/día - Promedio: {avgPasos.toLocaleString()} pasos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={resumenData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <ReferenceLine y={10000} stroke="#f59e0b" strokeDasharray="5 5" label="Meta: 10,000 pasos" />
              {visitasSeleccionadas.map((v) => (
                  <ReferenceLine x={v.fecha} stroke="red" strokeDasharray="3 3" label="" />
                ))}
              <Bar dataKey="pasos" fill="#3b82f6" name="Pasos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
