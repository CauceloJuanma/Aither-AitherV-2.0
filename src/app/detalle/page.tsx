"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/detalle/Header';
import PatientCards from '@/components/detalle/PatientCards';
import ResumenTab from '@/components/detalle/tabs/ResumenTab';
import { AirQualityTab } from '@/components/detalle/tabs/AirQualityTab';
import { QuestionnaireTab } from '@/components/detalle/tabs/QuestionnaireTab';
import { PeakFlowTab } from '@/components/detalle/tabs/PeakFlowTab';
import { ActivityTab } from '@/components/detalle/tabs/ActivityTab';
import { SleepTab } from '@/components/detalle/tabs/SleepTab';
import { SoundTab } from '@/components/detalle/tabs/SoundTab';
// TODO: Descomentar cuando se necesite el tab de Correlaciones
import { CorrelationsTab } from '@/components/detalle/tabs/CorrelationsTab';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/auth/Navbar';
import DemographicPanel from '@/components/detalle/DemographicPanel';
import { usePaciente } from '@/hooks/usePaciente';
import { processTelemonitoringData } from '@/lib/telemonitoringDataProcessor';
import { pdfService, type PatientInfo, type ReportMetrics } from '@/services/detalle/pdfService';

// 🔹 Función genérica para exportar a CSV
function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const headers = Object.keys(data[0]);

  const csvRows = [
    headers.join(','), // cabeceras
    ...data.map((row) =>
      headers
        .map((field) => {
          const value = row[field] ?? '';
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function DetallePage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dateRange') || '7dias';
    }
    return '7dias';
  });
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [customStartDate, setCustomStartDate] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('customDateFrom') || '';
    }
    return '';
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('customDateTo') || '';
    }
    return '';
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  // Obtener datos del paciente desde la BD
  const { paciente, loading: loadingPaciente, error: errorPaciente } = usePaciente(patientId);

  // Guardar filtros en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('dateRange', dateRange);
  }, [dateRange]);

  useEffect(() => {
    if (customStartDate) {
      localStorage.setItem('customDateFrom', customStartDate);
    }
  }, [customStartDate]);

  useEffect(() => {
    if (customEndDate) {
      localStorage.setItem('customDateTo', customEndDate);
    }
  }, [customEndDate]);

  useEffect(() => {
    // Recuperar pacientes seleccionados de localStorage
    // Support both legacy 'selectedPatients' (array) and new 'selectedPatient' (single id)
    const storedArray = localStorage.getItem('selectedPatients');
    const storedSingle = localStorage.getItem('selectedPatient');
    if (storedArray) {
      try {
        const patients = JSON.parse(storedArray);
        // Usar startTransition para evitar cascading renders
        React.startTransition(() => {
          setSelectedPatients(patients);
          // Convertir string ID a número (el ID en localStorage es un número como string)
          if (patients.length > 0) {
            setPatientId(parseInt(patients[0]));
          }
        });
        return;
      } catch {
        // fallthrough to check single
      }
    }

    if (storedSingle) {
      React.startTransition(() => {
        setSelectedPatients([storedSingle]);
        // Convertir string ID a número
        setPatientId(parseInt(storedSingle));
      });
      return;
    }

    // Si no hay pacientes seleccionados, redirigir a la página principal
    router.push('/');
  }, [router]);

  const handleCustomDateChange = (startDate: string, endDate: string) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  // Calcular fechas min/max reales del paciente
  const { minDate, maxDate } = React.useMemo(() => {
    if (!paciente || !paciente.telemonitorizaciones || paciente.telemonitorizaciones.length === 0) {
      return { minDate: '', maxDate: '' };
    }
    const allDates = paciente.telemonitorizaciones.map(t => t.fecha).sort();
    return {
      minDate: allDates[0],
      maxDate: allDates[allDates.length - 1]
    };
  }, [paciente]);

  // Filtrar paciente según el rango de fechas
  const filteredPaciente = React.useMemo(() => {
    if (!paciente || !paciente.telemonitorizaciones || paciente.telemonitorizaciones.length === 0) return paciente;

    // Si es "todo", no filtrar
    if (dateRange === 'todo') return paciente;

    // Calcular fecha de inicio según el rango
    let startDate: string;
    let endDate: string;

    if (dateRange === 'custom' && customStartDate && customEndDate) {
      startDate = customStartDate;
      endDate = customEndDate;
    } else {
      // Obtener la ÚLTIMA fecha disponible en los datos del paciente
      const allDates = paciente.telemonitorizaciones.map(t => t.fecha).sort();
      const lastDate = new Date(allDates[allDates.length - 1]);
      endDate = allDates[allDates.length - 1];

      // Calcular fecha de inicio restando días desde el último registro
      const daysToSubtract = dateRange === '7dias' ? 7 : dateRange === '15dias' ? 15 : dateRange === '30dias' ? 30 : 90;
      const start = new Date(lastDate);
      start.setDate(start.getDate() - daysToSubtract);
      startDate = start.toISOString().split('T')[0];
    }

    // Filtrar telemonitorizaciones por rango de fechas
    const telemonitorizacionesFiltradas = paciente.telemonitorizaciones.filter(tele =>
      tele.fecha >= startDate && tele.fecha <= endDate
    );

    return {
      ...paciente,
      telemonitorizaciones: telemonitorizacionesFiltradas
    };
  }, [paciente, dateRange, customStartDate, customEndDate]);

  // Procesar datos reales de telemonitorización del paciente (ya filtrados)
  const processedData = processTelemonitoringData(filteredPaciente);

  // Extraer datos procesados
  const {
    saturacionData,
    picoFlujoData,
    suenoData,
    calidadAire1Data,
    actividadData,
    resumenData,
    pesajeData,
    sonidosData,
    cuestionarioHistorico,
    correlacionesClinicas,
    correlacionData,
    avgSaturacion,
    avgPicoFlujo,
    sleepEfficiency,
    avgPM1,
    avgPM25,
    avgPM4,
    avgPM10,
    avgCO2,
    avgVOC,
    avgTemperatura,
    avgHumedad,
    avgRestingHeartRate,
    avgPeso,
    avgTimeInBed,
    avgBreathingRate,
    avgHRVdailyRmssd,
    avgPasos,
    avgFatiga,
    avgDisnea,
    avgTos,
    avgSuenoCuest,
    avgAnimo,
    avgOpresion,
  } = processedData;

  // 🔹 Identificador del paciente y texto del período (reutilizado en PDF y CSV)
  const patientIdDisplay = selectedPatients.length > 0 ? selectedPatients[0] : 'N/A';
  const periodoTexto =
    dateRange === '7dias'
      ? 'Últimos 7 días'
      : dateRange === '30dias'
      ? 'Últimos 30 días'
      : dateRange === '90dias'
      ? 'Últimos 90 días'
      : 'Período personalizado';

  // Datos demográficos del paciente (desde la BD o fallback)
  const demographicData = paciente || {
    id: 0,
    nombre: 'Sin nombre',
    peso: 0,
    altura: 0,
    edad: 0,
    genero: 'V',
    ultimo_cigarrillo: null,
    incumplidor: null,
    ingreso_ultimo_ano: null,
    disnea: null,
    antibioticos_ultimo_ano: null,
    oxigenoterapia: null,
    fev1: null,
    hospital: null,
    nombre_cuidadora: null,
    tel_cuidadora: null,
    nombre_cs: null,
    nombre_neumo: null,
    token: null,
    refresh_token: null,
  };

  // Mostrar loading mientras carga datos del paciente
  if (loadingPaciente) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos del paciente...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Mostrar error si falla la carga
  if (errorPaciente) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">Error al cargar datos del paciente</div>
            <p className="text-gray-600">{errorPaciente}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Calcular promedios y estadísticas (para tabs que aún usan datos mock)
  // avgPasos ahora viene de processedData
  const avgMinutos =
    resumenData.length > 0 ? Math.round(resumenData.reduce((sum, d) => sum + d.minutos, 0) / resumenData.length) : 0;
  const avgCalorias =
    resumenData.length > 0 ? Math.round(resumenData.reduce((sum, d) => sum + d.calorias, 0) / resumenData.length) : 0;

  // Estadísticas de actividad
  const avgMovimiento =
    actividadData.length > 0
      ? Math.round(actividadData.reduce((sum, d) => sum + d.movimiento, 0) / actividadData.length)
      : 0;
  const avgReposo =
    actividadData.length > 0 ? Math.round(actividadData.reduce((sum, d) => sum + d.reposo, 0) / actividadData.length) : 0;

  // Nuevas estadísticas de actividad
  const avgDistancia =
    actividadData.length > 0
      ? actividadData.reduce((sum, d) => sum + d.distancia, 0) / actividadData.length
      : 0;
  const avgFrecuenciaCardiaca =
    actividadData.length > 0
      ? Math.round(actividadData.reduce((sum, d) => sum + d.frecuenciaCardiaca, 0) / actividadData.length)
      : 0;
  const avgSpo2Actividad =
    actividadData.length > 0 ? Math.round(actividadData.reduce((sum, d) => sum + d.spo2, 0) / actividadData.length) : 0;

  // avgPicoFlujo ahora viene de processedData

  // Último valor promedio (promedio de las 3 tomas del último día)
  const ultimoPicoFlujoPromedio =
    picoFlujoData.length > 0
      ? Math.round(
          (picoFlujoData[picoFlujoData.length - 1].toma1 +
            picoFlujoData[picoFlujoData.length - 1].toma2 +
            picoFlujoData[picoFlujoData.length - 1].toma3) /
            3
        )
      : 0;

  // Mejor valor histórico (mejor promedio diario de las 3 tomas)
  const mejorPicoFlujo =
    picoFlujoData.length > 0
      ? Math.max(...picoFlujoData.map((d) => Math.round((d.toma1 + d.toma2 + d.toma3) / 3)))
      : 0;

  // Estadísticas de sueño
  const avgDuracionSueno =
    suenoData.length > 0 ? suenoData.reduce((sum, d) => sum + d.duracion, 0) / suenoData.length : 0;
  const avgProfundo =
    suenoData.length > 0 ? (suenoData.reduce((sum, d) => sum + d.profundo, 0) / suenoData.length).toFixed(2) : '0.0';
  const avgRem =
    suenoData.length > 0 ? (suenoData.reduce((sum, d) => sum + d.rem, 0) / suenoData.length).toFixed(2) : '0.0';
  const avgLigero =
    suenoData.length > 0 ? (suenoData.reduce((sum, d) => sum + d.ligero, 0) / suenoData.length).toFixed(2) : '0.0';

  // Nuevas estadísticas de sueño
  const avgEficienciaSueno =
    suenoData.length > 0 ? Math.round(suenoData.reduce((sum, d) => sum + d.eficiencia, 0) / suenoData.length) : 0;
  const avgSpo2Sueno =
    suenoData.length > 0 ? Math.round(suenoData.reduce((sum, d) => sum + d.spo2Sueno, 0) / suenoData.length) : 0;
  const avgHrvSueno =
    suenoData.length > 0 ? Math.round(suenoData.reduce((sum, d) => sum + d.hrv, 0) / suenoData.length) : 0;
  const avgFrecuenciaCardiacaSueno =
    suenoData.length > 0
      ? Math.round(suenoData.reduce((sum, d) => sum + d.frecuenciaCardiaca, 0) / suenoData.length)
      : 0;
  const avgTasaRespiratoria =
    suenoData.length > 0 ? Math.round(suenoData.reduce((sum, d) => sum + d.tasaRespiratoria, 0) / suenoData.length) : 0;

  // Los siguientes promedios ahora vienen de processedData:
  // avgRestingHeartRate, avgPeso, avgTimeInBed, avgBreathingRate, avgHRVdailyRmssd

  // Valores actuales (último registro) de calidad del aire
  const currentPM1 = calidadAire1Data.length > 0 ? calidadAire1Data[calidadAire1Data.length - 1].pm1 : 0;
  const currentPM25 = calidadAire1Data.length > 0 ? calidadAire1Data[calidadAire1Data.length - 1].pm25 : 0;
  const currentPM4 = calidadAire1Data.length > 0 ? calidadAire1Data[calidadAire1Data.length - 1].pm4 : 0;
  const currentPM10 = calidadAire1Data.length > 0 ? calidadAire1Data[calidadAire1Data.length - 1].pm10 : 0;
  const currentCO2 = calidadAire1Data.length > 0 ? calidadAire1Data[calidadAire1Data.length - 1].co2 : 0;
  const currentVOC = calidadAire1Data.length > 0 ? calidadAire1Data[calidadAire1Data.length - 1].voc : 0;

  // Los promedios de calidad del aire (avgPM1, avgPM25, avgPM4, avgPM10, avgCO2, avgVOC, avgTemperatura, avgHumedad)
  // ahora vienen de processedData

  // Calcular porcentajes de desviación respecto a límites
  const PM1_LIMIT = 15;
  const PM25_LIMIT = 25;
  const PM4_LIMIT = 30;
  const PM10_LIMIT = 50;
  const CO2_LIMIT = 1000;
  const VOC_LIMIT = 400;

  const pm1Deviation = avgPM1 > 0 ? ((currentPM1 - avgPM1) / avgPM1) * 100 : 0;
  const pm25Deviation = avgPM25 > 0 ? ((currentPM25 - avgPM25) / avgPM25) * 100 : 0;
  const pm4Deviation = avgPM4 > 0 ? ((currentPM4 - avgPM4) / avgPM4) * 100 : 0;
  const pm10Deviation = avgPM10 > 0 ? ((currentPM10 - avgPM10) / avgPM10) * 100 : 0;
  const co2Deviation = avgCO2 > 0 ? ((currentCO2 - avgCO2) / avgCO2) * 100 : 0;
  const vocDeviation = avgVOC > 0 ? ((currentVOC - avgVOC) / avgVOC) * 100 : 0;

  // Los promedios del cuestionario (avgFatiga, avgDisnea, avgTos, avgSuenoCuest, avgAnimo, avgOpresion)
  // ahora vienen de processedData


  const correlacionEficienciaSueno = correlacionesClinicas.length > 0
  ? Math.round(correlacionesClinicas.reduce((sum, d) => sum + (d.eficienciaSueno || 0), 0) / correlacionesClinicas.length)
    : 0;
  const correlacionSpo2 = correlacionesClinicas.length > 0
    ? Math.round(correlacionesClinicas.reduce((sum, d) => sum + (d.spo2 || 0), 0) / correlacionesClinicas.length)
    : 0;
  const correlacionPicoFlujo = correlacionesClinicas.length > 0
    ? Math.round(correlacionesClinicas.reduce((sum, d) => sum + (d.picoFlujo || 0), 0) / correlacionesClinicas.length)
    : 0;
  const correlacionPM25 = correlacionesClinicas.length > 0
    ? Math.round(correlacionesClinicas.reduce((sum, d) => sum + (d.pm25 || 0), 0) / correlacionesClinicas.length)
    : 0;
  const correlacionMinutosActivos = correlacionesClinicas.length > 0
    ? Math.round(correlacionesClinicas.reduce((sum, d) => sum + (d.minutosActivos || 0), 0) / correlacionesClinicas.length)
    : 0;
  const correlacionHRV = correlacionesClinicas.length > 0
    ? Math.round(correlacionesClinicas.reduce((sum, d) => sum + (d.hrv || 0), 0) / correlacionesClinicas.length)
    : 0;

  // Crear array de datos del cuestionario con valores actuales (último registro)
  const ultimoCuestionario = cuestionarioHistorico.length > 0
    ? cuestionarioHistorico[cuestionarioHistorico.length - 1]
    : { fatiga: 0, disnea: 0, tos: 0, sueno: 0, animo: 0, opresion: 0 };

  const cuestionarioData = [
    {
      pregunta: 'P1: Estado de salud general',
      descripcion: 'Percepción general del estado de salud del paciente',
      valor: ultimoCuestionario.fatiga,
      promedio: avgFatiga.toFixed(2),
    },
    {
      pregunta: 'P2: Disnea',
      descripcion: 'Sensación de falta de aire o dificultad para respirar',
      valor: ultimoCuestionario.disnea,
      promedio: avgDisnea.toFixed(2),
    },
    {
      pregunta: 'P3: Tos',
      descripcion: 'Frecuencia e intensidad de episodios de tos',
      valor: ultimoCuestionario.tos,
      promedio: avgTos.toFixed(2),
    },
    {
      pregunta: 'P4: Uso Inhalador',
      descripcion: 'Frecuencia de uso del inhalador de rescate',
      valor: ultimoCuestionario.sueno,
      promedio: avgSuenoCuest.toFixed(2),
    },
    {
      pregunta: 'P5: Esputo',
      descripcion: 'Cantidad de esputo o flema producida',
      valor: ultimoCuestionario.animo,
      promedio: avgAnimo.toFixed(2),
    },
    {
      pregunta: 'P6: Color del Esputo',
      descripcion: 'Coloración del esputo producido',
      valor: ultimoCuestionario.opresion,
      promedio: avgOpresion.toFixed(2),
    },
  ];

  // 🔹 Construir tabla consolidada por fecha con los datos que se visualizan en el resumen
  const buildResumenCSVRows = () => {
    const map: Record<string, Record<string, unknown>> = {};

    const ensureRow = (fecha: string) => {
      if (!map[fecha]) {
        map[fecha] = { fecha };
      }
      return map[fecha];
    };

    // Resumen actividad general
    resumenData.forEach((d: Record<string, unknown>) => {
      const row = ensureRow(d.fecha as string);
      row.pasos = d.pasos;
      row.minutos_activos = d.minutos;
      row.calorias = d.calorias;
    });

    // Saturación
    saturacionData.forEach((d: Record<string, unknown>) => {
      const row = ensureRow(d.fecha as string);
      row.spo2 = d.spo2;
    });

    // Sueño
    suenoData.forEach((d: Record<string, unknown>) => {
      const row = ensureRow(d.fecha as string);
      row.sueno_duracion_h = d.duracion;
      row.sueno_profundo_h = d.profundo;
      row.sueno_rem_h = d.rem;
      row.sueno_ligero_h = d.ligero;
      row.sueno_despierto_h = d.despierto;
      row.sueno_tiempo_en_cama_h = d.timeInBed;
      row.sueno_eficiencia_pct = d.eficiencia;
      row.sueno_spo2_promedio_pct = d.spo2Sueno;
      row.sueno_spo2_min_pct = d.spo2Min;
      row.sueno_spo2_max_pct = d.spo2Max;
      row.sueno_hrv_diario_ms = d.HRVdailyRmssd;
      row.sueno_hrv_profundo_ms = d.HRVdeepRmssd;
      row.sueno_hrv_general_ms = d.hrv;
      row.sueno_fc_bpm = d.frecuenciaCardiaca;
      row.sueno_tasa_respiratoria_rpm = d.tasaRespiratoria;
      row.sueno_tasa_respiratoria_avg_rpm = d.average_breathing_rate;
      row.sueno_despertares = d.awakeningsCount;
    });

    // Pico de flujo (promedio de las tres tomas por día)
    picoFlujoData.forEach((d: Record<string, unknown>) => {
      const row = ensureRow(d.fecha as string);
      const promedioDiario = ((d.toma1 as number) + (d.toma2 as number) + (d.toma3 as number)) / 3;
      row.pico_flujo_toma1 = d.toma1;
      row.pico_flujo_toma2 = d.toma2;
      row.pico_flujo_toma3 = d.toma3;
      row.pico_flujo_promedio = Math.round(promedioDiario);
    });

    // Calidad del aire (incluye PM, gases, temperatura y humedad)
    calidadAire1Data.forEach((d: Record<string, unknown>) => {
      const row = ensureRow(d.fecha as string);
      row.pm1 = d.pm1;
      row.pm25 = d.pm25;
      row.pm4 = d.pm4;
      row.pm10 = d.pm10;
      row.co2_ppm = d.co2;
      row.voc_ppb = d.voc;
      row.temperatura_c = d.temperatura;
      row.humedad_pct = d.humedad;
    });

    // Actividad detallada
    actividadData.forEach((d: Record<string, unknown>) => {
      const row = ensureRow(d.fecha as string);
      row.actividad_pasos = d.pasos;
      row.actividad_fc_reposo_bpm = d.restingHeartRate;
      row.actividad_distancia_km = d.distancia;
      row.actividad_fc_promedio_bpm = d.frecuenciaCardiaca;
      row.actividad_spo2_pct = d.spo2;
      row.actividad_minutos_activos = d.activos;
      row.actividad_minutos_ligeros = d.ligeros;
      row.actividad_minutos_inactivos = d.inactivos;
      row.actividad_minutos_movimiento = d.movimiento;
      row.actividad_minutos_reposo = d.reposo;
    });

    // Pesaje
    pesajeData.forEach((d: Record<string, unknown>) => {
      const row = ensureRow(d.fecha as string);
      row.peso_kg = d.peso;
    });

    // Cuestionario (síntomas y estado psicomotor)
    cuestionarioHistorico.forEach((d: Record<string, unknown>) => {
      const row = ensureRow(d.fecha as string);
      row.cuest_fatiga = d.fatiga;
      row.cuest_disnea = d.disnea;
      row.cuest_tos = d.tos;
      row.cuest_sueno = d.sueno;
      row.cuest_animo = d.animo;
      row.cuest_opresion = d.opresion;
      // Métricas psicomotoras
      row.psico_error_promedio = d.errorPromedio;
      row.psico_error_maximo = d.errorMaximo;
      row.psico_suavidad = d.suavidad;
      row.psico_circularidad = d.circularidad;
      row.psico_area = d.areaCircle;
      row.psico_excentricidad = d.excentricidad;
      row.psico_desviacion = d.desviacion;
      row.psico_variabilidad_std = d.variabilidadStd;
      row.psico_variabilidad_media = d.variabilidadMedia;
      row.psico_tiempo_s = d.tiempo;
    });

    // Sonidos (firma acústica)
    sonidosData.forEach((d: Record<string, unknown>) => {
      const row = ensureRow(d.fecha as string);
      // Parámetros de la frase
      row.voz_duracion_frase_s = d.duracionFrase;
      row.voz_tasa_habla = d.tasaHabla;
      row.voz_jitter = d.jitter;
      row.voz_pitch_hz = d.pitch;
      row.voz_shimmer = d.shimmer;
      row.voz_hnr_db = d.hnr;
      row.voz_intensidad_promedio_db = d.intensidadPromedio;
      row.voz_numero_pausas = d.numeroPausas;
      row.voz_duracion_pausas_s = d.duracionPausasTotal;
      row.voz_f0_min_hz = d.f0Min;
      row.voz_f0_max_hz = d.f0Max;
      row.voz_variabilidad_tono = d.variabilidadTono;
      row.voz_variabilidad_intensidad = d.variabilidadIntensidad;
      row.voz_variabilidad_ritmo = d.variabilidadRitmo;
      row.voz_mfccs = d.mfccs;
      // Parámetros de la tos
      row.tos_duracion_s = d.tosDuracion;
      row.tos_energia_rms = d.tosEnergiaRmsMean;
      row.tos_zcr = d.tosZcrMean;
      row.tos_centroide_espectral = d.tosSpectralCentroidMean;
      row.tos_ancho_banda_espectral = d.tosSpectralBandwidthMean;
      row.tos_f0_mean_hz = d.tosF0Mean;
      row.tos_hnr_db = d.tosHnr;
      row.tos_mfcc_1 = d.tosMfccMean1;
      row.tos_mfcc_2 = d.tosMfccMean2;
    });

    // Correlaciones clínicas (métricas combinadas para análisis)
    correlacionesClinicas.forEach((d: Record<string, unknown>) => {
      const row = ensureRow(d.fecha as string);
      row.correlacion_eficiencia_sueno = d.eficienciaSueno;
      row.correlacion_spo2 = d.spo2;
      row.correlacion_pico_flujo = d.picoFlujo;
      row.correlacion_pm25 = d.pm25;
      row.correlacion_minutos_activos = d.minutosActivos;
      row.correlacion_hrv = d.hrv;
    });

    // Convertir a array ordenado por fecha
    return Object.values(map).sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      return new Date(a.fecha as string).getTime() - new Date(b.fecha as string).getTime();
    });
  };

  const handleDownloadCSV = () => {
    const rows = buildResumenCSVRows();
    if (!rows || rows.length === 0) {
      alert('No hay datos para exportar en el período seleccionado.');
      return;
    }

    const safePeriodo = periodoTexto.replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Aither_telemonitorizacion_${patientIdDisplay}_${safePeriodo}_${timestamp}.csv`;
    exportToCSV(rows, filename);
  };

  // Función para generar PDF usando el servicio
  const generatePDFReport = async () => {
    // Preparar datos del paciente
    const patientInfo: PatientInfo = {
      patientId: patientIdDisplay,
      periodo: periodoTexto,
    };

    // Preparar todas las métricas
    const metrics: ReportMetrics = {
      avgSaturacion,
      avgPicoFlujo,
      mejorPicoFlujo,
      avgSpo2Sueno,
      avgPasos,
      avgDuracionSueno,
      avgEficienciaSueno,
      avgFrecuenciaCardiaca,
      avgPM25,
      avgCO2,
      avgVOC,
      avgTemperatura,
      avgFatiga,
      avgDisnea,
      avgTos,
      avgAnimo,
      avgOpresion,
      correlacionSpo2,
      correlacionPicoFlujo,
      correlacionPM25,
      correlacionMinutosActivos,
      correlacionHRV,
    };

    // Llamar al servicio de PDF
    await pdfService.generateReport(patientInfo, metrics, {
      onProgress: (progress, _message) => {
        setPdfProgress(progress);
      },
      onStart: () => {
        setIsGeneratingPDF(true);
        setPdfProgress(0);
      },
      onComplete: () => {
        setIsGeneratingPDF(false);
        setPdfProgress(0);
      },
      onError: () => {
        setIsGeneratingPDF(false);
        setPdfProgress(0);
      },
    });
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-[1800px] mx-auto space-y-8">
          <Header
            selectedPatients={selectedPatients}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomDateChange={handleCustomDateChange}
            minDate={minDate}
            maxDate={maxDate}
          />

          <PatientCards selectedPatients={selectedPatients} />

          {/* Sección de descarga de informes */}
          <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Descripción */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Exportar datos
                  </h3>
                  <p className="text-sm text-gray-600 max-w-2xl">
                    Descarga los datos del paciente en formato CSV para análisis detallado o genera un informe PDF completo con gráficos y métricas.
                  </p>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Botón CSV */}
                  <button
                    onClick={handleDownloadCSV}
                    className="
                      group relative overflow-hidden
                      bg-white border-2 border-green-500 text-green-700
                      font-semibold px-6 py-3.5 rounded-xl shadow-md
                      flex items-center justify-center gap-2.5
                      transition-all duration-300 ease-out
                      hover:bg-green-500 hover:text-white hover:shadow-xl hover:scale-105
                      focus:outline-none focus:ring-4 focus:ring-green-200
                      active:scale-95
                    "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 transition-transform group-hover:scale-110"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-base">Datos CSV</span>
                  </button>

                  {/* Botón PDF */}
                  <button
                    onClick={generatePDFReport}
                    disabled={isGeneratingPDF}
                    className={`
                      group relative overflow-hidden
                      ${isGeneratingPDF
                        ? 'bg-gray-300 border-2 border-gray-400 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-blue-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105 cursor-pointer'
                      }
                      font-semibold px-6 py-3.5 rounded-xl shadow-md
                      flex items-center justify-center gap-2.5
                      transition-all duration-300 ease-out
                      focus:outline-none focus:ring-4 focus:ring-blue-200
                      active:scale-95
                    `}
                  >
                    {isGeneratingPDF ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="text-base">Generando PDF...</span>
                        {pdfProgress > 0 && (
                          <span className="text-sm opacity-90">({pdfProgress}%)</span>
                        )}
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 transition-transform group-hover:scale-110"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-base">Informe PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layout con panel demográfico y tabs */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Panel demográfico a la izquierda (oculto en móvil, visible en desktop) */}
            <div className="hidden lg:block lg:w-80 xl:w-96 lg:flex-shrink-0">
              <div className="sticky top-8">
                <DemographicPanel data={demographicData} />
              </div>
            </div>

            {/* Contenido principal (Tabs) */}
            <div className="flex-1 min-w-0">
              {/* Panel demográfico en móvil (card colapsable) */}
              <div className="lg:hidden mb-6">
                <DemographicPanel data={demographicData} />
              </div>

              {/* Tabs */}
              <Tabs defaultValue="resumen" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2 bg-white p-1.5 rounded-xl shadow-md border border-gray-200">
              {/* TODO: 'correlaciones' ocultado temporalmente - revisar en el futuro */}
              {['resumen', 'correlaciones', 'aire1', 'cuestionario', 'pico', 'actividad', 'sueno', 'sonidos'].map(
                (tab) => {
                  const labels: Record<string, string> = {
                    resumen: 'Resumen',
                    correlaciones: 'Correlaciones', // TODO: ocultado temporalmente
                    aire1: 'Aire Interior',
                    cuestionario: 'Cuestionario',
                    pico: 'Pico Flujo',
                    actividad: 'Actividad',
                    sueno: 'Sueño',
                    sonidos: 'Sonidos',
                  };

                  return (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="
                        px-2 py-2 rounded-lg font-semibold text-xs
                        transition-all duration-300 ease-out
                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600
                        data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105
                        data-[state=inactive]:bg-gray-50 data-[state=inactive]:text-gray-600
                        data-[state=inactive]:hover:bg-gray-100 data-[state=inactive]:hover:text-gray-900
                        hover:shadow-md cursor-pointer
                        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                        whitespace-nowrap
                      "
                    >
                      {labels[tab]}
                    </TabsTrigger>
                  );
                }
              )}
            </TabsList>

            {/* Resumen Tab */}
            <TabsContent value="resumen">
              <ResumenTab
                saturacionData={saturacionData}
                avgSaturacion={avgSaturacion}
                picoFlujoData={picoFlujoData}
                avgPicoFlujo={avgPicoFlujo}
                suenoData={suenoData}
                sleepEfficiency={sleepEfficiency}
                calidadAire1Data={calidadAire1Data}
                avgPM25={avgPM25}
                avgPM10={avgPM10}
                resumenData={resumenData}
                avgPasos={avgPasos}
                actividadData={actividadData}
                avgRestingHeartRate={avgRestingHeartRate}
                pesajeData={pesajeData}
                avgPeso={avgPeso}
                avgTimeInBed={avgTimeInBed}
                avgBreathingRate={avgBreathingRate}
                avgHRVdailyRmssd={avgHRVdailyRmssd}
                cuestionarioHistorico={cuestionarioHistorico}
              />
            </TabsContent>

            {/*
             * TODO: Tab de Correlaciones - Temporalmente deshabilitado
             *
             * Para habilitar:
             * 1. Descomentar el import de CorrelationsTab arriba
             * 2. Descomentar 'correlaciones' en el array de tabs (TabsList)
             * 3. Descomentar el TabsContent abajo
             * 4. Descomentar el código en CorrelationsTab.tsx
             *
             * El componente completo está en:
             * src/components/detalle/tabs/CorrelationsTab.tsx
             */}
            
            <TabsContent value="correlaciones">
              <CorrelationsTab
                clinicalData={correlacionesClinicas}
                activityData={correlacionData}
              />
            </TabsContent>

          {/* Calidad de Aire 1 Tab - Refactorizado con SOLID */}
          <TabsContent value="aire1">
            <AirQualityTab data={calidadAire1Data} />
          </TabsContent>

          {/* Cuestionario Tab - Refactorizado con SOLID */}
          <TabsContent value="cuestionario">
            <QuestionnaireTab
              data={cuestionarioHistorico}
              questions={cuestionarioData}
              averages={{
                fatiga: avgFatiga,
                disnea: avgDisnea,
                tos: avgTos,
                sueno: avgSuenoCuest,
                animo: avgAnimo,
                opresion: avgOpresion,
              }}
            />
          </TabsContent>

          {/* Pico de Flujo Tab - Refactorizado con SOLID */}
          <TabsContent value="pico">
            <PeakFlowTab
              data={picoFlujoData}
              avgPeakFlow={avgPicoFlujo}
              latestAverage={ultimoPicoFlujoPromedio}
              bestValue={mejorPicoFlujo}
            />
          </TabsContent>

          {/* Actividad Tab */}
          <TabsContent value="actividad">
            <ActivityTab
              activityData={actividadData}
              sleepData={suenoData}
              avgPasos={avgPasos}
              avgDistancia={avgDistancia}
              avgFrecuenciaCardiaca={avgFrecuenciaCardiaca}
              avgSpo2Actividad={avgSpo2Actividad}
              avgRestingHeartRate={avgRestingHeartRate}
              avgHRVdailyRmssd={avgHRVdailyRmssd}
            />
          </TabsContent>

          {/* Sueño Tab */}
          <TabsContent value="sueno">
            <SleepTab
              data={suenoData}
              avgDuracionSueno={avgDuracionSueno}
              avgEficienciaSueno={avgEficienciaSueno}
              avgSpo2Sueno={avgSpo2Sueno}
              avgHrvSueno={avgHrvSueno}
              avgFrecuenciaCardiacaSueno={avgFrecuenciaCardiacaSueno}
              avgTasaRespiratoria={avgTasaRespiratoria}
              avgTimeInBed={avgTimeInBed}
            />
          </TabsContent>

          {/* Sonidos Tab */}
          <TabsContent value="sonidos">
            <SoundTab data={sonidosData} />
          </TabsContent>


              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
