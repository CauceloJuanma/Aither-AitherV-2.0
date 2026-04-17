"use client";
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/auth/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { usePacientes } from '@/hooks/usePacientes';

// Paleta de colores para los pacientes
const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#60a5fa'];

// Función para convertir fecha YYYY-MM-DD a DD/MM
const formatDateShort = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}`;
};

/**
 * Función para determinar estado del paciente basado en múltiples factores
 * Sistema de puntuación ponderado (0-100):
 * - SpO2 (35%): Saturación de oxígeno en sangre
 * - Pico Flujo (30%): Función pulmonar
 * - Actividad/Pasos (20%): Movilidad
 * - Sueño (15%): Descanso y recuperación
 *
 * Score final: >=70 Estable, 50-69 Observación, <50 Crítico
 * Requiere al menos 2 factores con datos válidos
 */
const determinarEstado = (resumenData: Array<{ [key: string]: unknown }>, suenoData: Array<{ [key: string]: unknown }>) => {
  if (resumenData.length === 0 && suenoData.length === 0) return 'sin datos';

  const ultimosDias = resumenData.slice(-7);
  const ultimosDiasSueno = suenoData.slice(-7);

  // Contadores para factores disponibles
  let factoresDisponibles = 0;
  let scoreTotal = 0;
  let pesoTotal = 0;

  // FACTOR 1: SpO2 (35% de peso) - Crítico para pacientes respiratorios
  const spo2Values = ultimosDias
    .map(d => d.spo2 as number | null)
    .filter((val): val is number => val !== null && val > 0);

  if (spo2Values.length > 0) {
    const promedioSpo2 = spo2Values.reduce((sum: number, val: number) => sum + val, 0) / spo2Values.length;
    let scoreSpo2 = 0;

    if (promedioSpo2 >= 95) {
      scoreSpo2 = 100; // Saturación normal
    } else if (promedioSpo2 >= 90) {
      scoreSpo2 = 50; // Saturación borderline
    } else {
      scoreSpo2 = 0; // Saturación crítica
    }

    scoreTotal += scoreSpo2 * 0.35;
    pesoTotal += 0.35;
    factoresDisponibles++;
  }

  // FACTOR 2: Pico Flujo (30% de peso) - Función pulmonar directa
  const picoFlujoValues = ultimosDias
    .map(d => d.picoFlujo as number | null)
    .filter((val): val is number => val !== null && val > 0);

  if (picoFlujoValues.length > 0) {
    const promedioPicoFlujo = picoFlujoValues.reduce((sum: number, val: number) => sum + val, 0) / picoFlujoValues.length;
    let scorePicoFlujo = 0;

    if (promedioPicoFlujo >= 400) {
      scorePicoFlujo = 100; // Excelente función pulmonar
    } else if (promedioPicoFlujo >= 250) {
      scorePicoFlujo = 70; // Función pulmonar aceptable
    } else if (promedioPicoFlujo >= 150) {
      scorePicoFlujo = 40; // Función pulmonar reducida
    } else {
      scorePicoFlujo = 0; // Función pulmonar muy deteriorada
    }

    scoreTotal += scorePicoFlujo * 0.30;
    pesoTotal += 0.30;
    factoresDisponibles++;
  }

  // FACTOR 3: Actividad Física/Pasos (20% de peso) - Movilidad general
  const pasosValues = ultimosDias
    .map(d => d.pasos as number | null)
    .filter((val): val is number => val !== null && val > 0);

  if (pasosValues.length > 0) {
    const promedioPasos = pasosValues.reduce((sum: number, val: number) => sum + val, 0) / pasosValues.length;
    let scorePasos = 0;

    if (promedioPasos >= 5000) {
      scorePasos = 100; // Actividad excelente
    } else if (promedioPasos >= 2000) {
      scorePasos = 60; // Actividad moderada
    } else {
      scorePasos = 20; // Actividad muy reducida
    }

    scoreTotal += scorePasos * 0.20;
    pesoTotal += 0.20;
    factoresDisponibles++;
  }

  // FACTOR 4: Sueño (15% de peso) - Descanso y recuperación
  const suenoValues = ultimosDiasSueno
    .map(d => d.duracion as number | null)
    .filter((val): val is number => val !== null && val > 0);

  if (suenoValues.length > 0) {
    const promedioSueno = suenoValues.reduce((sum: number, val: number) => sum + val, 0) / suenoValues.length;
    let scoreSueno = 0;

    if (promedioSueno >= 7 && promedioSueno <= 9) {
      scoreSueno = 100; // Sueño óptimo
    } else if ((promedioSueno >= 6 && promedioSueno < 7) || (promedioSueno > 9 && promedioSueno <= 10)) {
      scoreSueno = 70; // Sueño aceptable
    } else if (promedioSueno >= 5 && promedioSueno < 6) {
      scoreSueno = 40; // Sueño insuficiente
    } else {
      scoreSueno = 0; // Sueño muy deficiente o excesivo
    }

    scoreTotal += scoreSueno * 0.15;
    pesoTotal += 0.15;
    factoresDisponibles++;
  }

  // Verificar si hay suficientes datos para hacer una evaluación
  if (factoresDisponibles < 2) {
    return 'sin datos';
  }

  // Normalizar el score final según los pesos disponibles
  const scoreFinal = pesoTotal > 0 ? (scoreTotal / pesoTotal) * 100 : 0;

  // Determinar estado según el score final
  if (scoreFinal >= 70) return 'estable';
  if (scoreFinal >= 50) return 'observación';
  return 'crítico';
};

export default function HomePage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dateRange') || '7dias';
    }
    return '7dias';
  });
  const [customDateFrom, setCustomDateFrom] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('customDateFrom') || '';
    }
    return '';
  });
  const [customDateTo, setCustomDateTo] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('customDateTo') || '';
    }
    return '';
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');

  // Obtener datos reales de la base de datos
  const { pacientes: pacientesDB, loading, error } = usePacientes();

  // Calcular las fechas mínima y máxima disponibles en los datos
  const { minDate, maxDate } = useMemo(() => {
    if (!pacientesDB || pacientesDB.length === 0 || !pacientesDB[0].resumenData || pacientesDB[0].resumenData.length === 0) {
      return { minDate: '', maxDate: '' };
    }
    const allDates = pacientesDB[0].resumenData.map(d => d.fecha).sort();
    return {
      minDate: allDates[0],
      maxDate: allDates[allDates.length - 1]
    };
  }, [pacientesDB]);

  // Guardar filtros en localStorage cuando cambien
  React.useEffect(() => {
    localStorage.setItem('dateRange', dateRange);
  }, [dateRange]);

  React.useEffect(() => {
    if (customDateFrom) {
      localStorage.setItem('customDateFrom', customDateFrom);
    }
  }, [customDateFrom]);

  React.useEffect(() => {
    if (customDateTo) {
      localStorage.setItem('customDateTo', customDateTo);
    }
  }, [customDateTo]);

  // Inicializar fechas personalizadas con el rango completo cuando se carguen los datos
  React.useEffect(() => {
    if (pacientesDB && pacientesDB.length > 0 && pacientesDB[0].resumenData.length > 0 && !customDateFrom && !customDateTo) {
      setCustomDateFrom(minDate);
      setCustomDateTo(maxDate);
    }
  }, [pacientesDB, customDateFrom, customDateTo, minDate, maxDate]);

  // Procesar datos según el rango de fechas seleccionado
  const pacientesList = useMemo(() => {
    if (!pacientesDB || pacientesDB.length === 0) return [];

    return pacientesDB.map((p, i) => {
      let resumenDataFiltered: typeof p.resumenData;
      let suenoDataFiltered: typeof p.suenoData;

      // Filtrar datos según el rango
      if (dateRange === 'personalizado') {
        // Filtrar por rango de fechas personalizado
        resumenDataFiltered = p.resumenData.filter(d =>
          d.fecha >= customDateFrom && d.fecha <= customDateTo
        );
        suenoDataFiltered = p.suenoData.filter(d =>
          d.fecha >= customDateFrom && d.fecha <= customDateTo
        );
      } else if (dateRange === 'todo') {
        resumenDataFiltered = p.resumenData;
        suenoDataFiltered = p.suenoData;
      } else {
        // Filtrar por los últimos N DÍAS (no registros)
        let daysToSubtract = 7; // Valor por defecto
        if (dateRange === '7dias') {
          daysToSubtract = 7;
        } else if (dateRange === '15dias') {
          daysToSubtract = 15;
        } else if (dateRange === '30dias') {
          daysToSubtract = 30;
        }

        // Obtener la última fecha disponible en los datos
        if (p.resumenData.length > 0) {
          const lastDate = new Date(p.resumenData[p.resumenData.length - 1].fecha);
          const startDate = new Date(lastDate);
          startDate.setDate(startDate.getDate() - daysToSubtract);

          const startDateStr = startDate.toISOString().split('T')[0];

          resumenDataFiltered = p.resumenData.filter(d => d.fecha >= startDateStr);
          suenoDataFiltered = p.suenoData.filter(d => d.fecha >= startDateStr);
        } else {
          resumenDataFiltered = [];
          suenoDataFiltered = [];
        }
      }

      // Convertir formato de fechas
      const resumenData = resumenDataFiltered.map(d => ({
        fecha: formatDateShort(d.fecha),
        pasos: d.pasos,
        minutos: d.minutos,
        calorias: d.calorias
      }));

      const suenoData = suenoDataFiltered.map(d => ({
        fecha: formatDateShort(d.fecha),
        duracion: d.duracion,
        profundo: d.profundo,
        rem: d.rem,
        ligero: d.ligero
      }));

      return {
        id: p.id,
        idDisplay: `P${String(i + 1).padStart(3, '0')}`,
        nombre: p.nombre,
        edad: p.edad,
        genero: p.genero,
        estado: determinarEstado(resumenDataFiltered, suenoDataFiltered),
        color: palette[i % palette.length],
        resumenData,
        suenoData,
        correlacionData: resumenData.map(d => ({ pasos: d.pasos, calorias: d.calorias })),
        actividadData: resumenData.map(d => ({
          fecha: d.fecha,
          movimiento: Math.round(d.minutos * 0.9),
          reposo: 240 - Math.round(d.minutos * 0.9)
        })),
      };
    });
  }, [pacientesDB, dateRange, customDateFrom, customDateTo]);

  // Obtener todas las fechas del rango actual
  const fechas = useMemo(() => {
    if (pacientesList.length > 0 && pacientesList[0].resumenData) {
      return pacientesList[0].resumenData.map(d => d.fecha);
    }
    return [];
  }, [pacientesList]);

  // Aplicar filtros y búsqueda a la lista de pacientes
  const pacientesListFiltered = useMemo(() => {
    return pacientesList.filter(paciente => {
      // Filtro por nombre
      const matchesSearch = searchTerm === '' ||
        paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.idDisplay.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por estado
      const matchesEstado = estadoFilter === 'todos' || paciente.estado === estadoFilter;

      return matchesSearch && matchesEstado;
    });
  }, [pacientesList, searchTerm, estadoFilter]);

  const togglePatient = (patientId: number) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  // Helper: construir dataset combinado (misma longitud de fechas) para un metric dado
  const buildCombined = React.useCallback((metric: 'pasos' | 'minutos' | 'calorias' | 'duracion') => {
    const selected = pacientesList.filter(p => selectedPatients.includes(p.id));
    const combined = fechas.map(fecha => {
      const item: Record<string, unknown> = { fecha };
      selected.forEach(p => {
        const pData = p as Record<string, unknown>;
        const resumenData = (pData.resumenData as Record<string, unknown>[]) || [];
        const suenoData = (pData.suenoData as Record<string, unknown>[]) || [];
        const row = resumenData.find((r: Record<string, unknown>) => r.fecha === fecha) || suenoData.find((r: Record<string, unknown>) => r.fecha === fecha) || {};
        item[`${metric}_${p.id}`] = (row as Record<string, unknown>)[metric] ?? null;
      });
      return item;
    });
    return combined;
  }, [pacientesList, selectedPatients, fechas]);

  const getEstadoColor = (estado: string) => {
    switch(estado) {
      case 'estable': return 'bg-green-100 text-green-800 border-green-300';
      case 'observación': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'crítico': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleVerDetalles = () => {
    // Only allow viewing details when exactly one patient is selected
    if (selectedPatients.length === 1) {
      // Guardar el paciente seleccionado (único) en localStorage
      localStorage.setItem('selectedPatient', String(selectedPatients[0]));
      router.push('/detalle');
    }
  };

  // Mostrar loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos de pacientes...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Mostrar error state
  if (error) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">Error al cargar datos</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sistema de Monitoreo de Pacientes</h1>
              <p className="text-gray-600 mt-1">
                {selectedPatients.length} paciente{selectedPatients.length !== 1 ? 's' : ''} seleccionado{selectedPatients.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Selector de rango de fechas */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
              {[
                { value: '7dias', label: '7 días' },
                { value: '15dias', label: '15 días' },
                { value: '30dias', label: '30 días' },
                { value: 'todo', label: 'Todo' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => {
                    setDateRange(range.value);
                    setShowCustomDatePicker(false);
                  }}
                  className={`
                    flex-1 min-w-[80px] px-3 md:px-4 py-2 rounded-lg border-2 font-medium text-xs md:text-sm
                    transition-all duration-200
                    ${dateRange === range.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-sm'
                    }
                  `}
                >
                  {range.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setDateRange('personalizado');
                  setShowCustomDatePicker(true);
                }}
                className={`
                  flex-1 min-w-[100px] px-3 md:px-4 py-2 rounded-lg border-2 font-medium text-xs md:text-sm
                  transition-all duration-200
                  ${dateRange === 'personalizado'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-sm'
                  }
                `}
              >
                Personalizado
              </button>
            </div>

            {/* Date pickers para rango personalizado */}
            {showCustomDatePicker && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-center bg-white p-3 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 min-w-[50px]">Desde:</label>
                  <input
                    type="date"
                    value={customDateFrom}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 min-w-[50px]">Hasta:</label>
                  <input
                    type="date"
                    value={customDateTo}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={handleVerDetalles}
            disabled={selectedPatients.length !== 1}
            className={`
              w-full sm:w-auto px-4 md:px-6 py-2.5 rounded-lg font-semibold text-xs md:text-sm
              transition-all duration-200
              ${selectedPatients.length === 1
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md cursor-pointer'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
            aria-disabled={selectedPatients.length !== 1}
            title={
              selectedPatients.length === 1
                ? `Ver detalle de ${selectedPatients[0]}`
                : selectedPatients.length === 0
                  ? 'Selecciona exactamente 1 paciente para ver detalle'
                  : 'Solo se puede ver detalle de un paciente a la vez (deselecciona extras)'
            }
          >
            <span className="hidden sm:inline">
              {selectedPatients.length === 1 ? 'Ver detalle del paciente' : 'Selecciona 1 paciente para ver detalle'}
            </span>
            <span className="sm:hidden">
              {selectedPatients.length === 1 ? 'Ver detalle' : 'Selecciona 1 paciente'}
            </span>
          </button>

          {/* Botón de administración - solo visible para administradores */}
          {isAdmin && (
            <button
              onClick={() => router.push('/admin/usuarios')}
              className="w-full sm:w-auto px-4 md:px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 hover:shadow-md transition-all duration-200 font-semibold text-xs md:text-sm"
            >
              Administrar usuarios
            </button>
          )}

          {/* Botón de predicción de IA */}
          {(
            <button
              onClick={() => router.push('/predecir')}
              className="w-full sm:w-auto px-4 md:px-6 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 hover:shadow-md transition-all duration-200 font-semibold text-xs md:text-sm"
            >
              Predecir
            </button>
          )}
        </div>

        

        {/* Barra de búsqueda y filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Barra de búsqueda */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nombre o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm md:text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filtros */}
              <div className="space-y-3">
                {/* Filtro por estado */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">Estado:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'todos', label: 'Todos', shortLabel: 'Todos' },
                      { value: 'estable', label: 'Estable', shortLabel: 'Estable' },
                      { value: 'observación', label: 'Observación', shortLabel: 'Obs.' },
                      { value: 'crítico', label: 'Crítico', shortLabel: 'Crítico' },
                      { value: 'sin datos', label: 'Sin datos', shortLabel: 'S/D' }
                    ].map((estado) => (
                      <button
                        key={estado.value}
                        onClick={() => setEstadoFilter(estado.value)}
                        className={`
                          flex-1 min-w-[70px] px-2 md:px-3 py-1.5 rounded-lg border text-xs md:text-sm font-medium transition-all duration-200
                          ${estadoFilter === estado.value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                          }
                        `}
                      >
                        <span className="md:hidden">{estado.shortLabel}</span>
                        <span className="hidden md:inline">{estado.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contador de resultados */}
                <div className="text-xs md:text-sm text-gray-600 text-center md:text-right pt-2 border-t">
                  Mostrando <span className="font-semibold text-blue-600">{pacientesListFiltered.length}</span> de <span className="font-semibold">{pacientesList.length}</span> pacientes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selector de Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Pacientes</CardTitle>
            <CardDescription>Haz clic en los pacientes para seleccionar/deseleccionar (puedes seleccionar varios)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {pacientesListFiltered.map((paciente) => (
                <button
                  key={paciente.id}
                  onClick={() => togglePatient(paciente.id)}
                  className={`
                    relative p-3 sm:p-4 rounded-lg border-2 transition-all duration-200
                    hover:shadow-lg active:scale-95 sm:hover:scale-105 cursor-pointer
                    ${selectedPatients.includes(paciente.id)
                      ? 'bg-blue-50 border-blue-500 shadow-md'
                      : 'bg-white border-gray-300 hover:border-blue-300'
                    }
                  `}
                >
                  {selectedPatients.includes(paciente.id) && (
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{paciente.idDisplay}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 truncate" title={paciente.nombre}>{paciente.nombre}</div>
                    <div className="text-xs text-gray-500 mb-1.5 sm:mb-2">{paciente.edad} años</div>
                    <div className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border ${getEstadoColor(paciente.estado)}`}>
                      {paciente.estado}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts: comparativas entre pacientes seleccionados */}
        {selectedPatients.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pasos Diarios (comparativa)</CardTitle>
                <CardDescription>Comparación de pasos entre pacientes seleccionados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={buildCombined('pasos')}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {pacientesList.filter(p => selectedPatients.includes(p.id)).map(p => (
                      <Line
                        key={p.id}
                        type="monotone"
                        dataKey={`pasos_${p.id}`}
                        stroke={p.color}
                        dot={{ r: 3 }}
                        name={`${p.idDisplay} ${p.nombre.split(' ')[0]}`}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Minutos de Actividad</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={buildCombined('minutos')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {pacientesList.filter(p => selectedPatients.includes(p.id)).map(p => (
                        <Bar key={p.id} dataKey={`minutos_${p.id}`} fill={p.color} name={`${p.idDisplay} ${p.nombre.split(' ')[0]}`} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Calorías Quemadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={buildCombined('calorias')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {pacientesList.filter(p => selectedPatients.includes(p.id)).map(p => (
                        <Line key={p.id} type="monotone" dataKey={`calorias_${p.id}`} stroke={p.color} strokeWidth={2} name={`${p.idDisplay} ${p.nombre.split(' ')[0]}`} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pasos vs Calorías (Scatter)</CardTitle>
                <CardDescription>Relación actividad-gasto calórico por paciente</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="pasos" name="Pasos" />
                    <YAxis type="number" dataKey="calorias" name="Calorías" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    {pacientesList.filter(p => selectedPatients.includes(p.id)).map(p => (
                      <Scatter key={p.id} name={`${p.idDisplay} ${p.nombre.split(' ')[0]}`} data={p.correlacionData} fill={p.color} />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}


        </div>
      </div>
    </ProtectedRoute>
  );
}
