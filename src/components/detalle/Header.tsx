import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';

interface HeaderProps {
  selectedPatients: string[];
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomDateChange?: (startDate: string, endDate: string) => void;
  minDate?: string;
  maxDate?: string;
}

export default function Header({
  selectedPatients,
  dateRange,
  onDateRangeChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
  minDate,
  maxDate
}: HeaderProps) {
  const router = useRouter();
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(customStartDate || '');
  const [tempEndDate, setTempEndDate] = useState(customEndDate || '');

  // Rango de fechas disponibles (usa fechas reales del paciente si están disponibles)
  const dateRangeData = useMemo(() => {
    let oldestDate: Date;
    let latestDate: Date;

    if (minDate && maxDate) {
      // Usar fechas reales del paciente
      oldestDate = new Date(minDate);
      latestDate = new Date(maxDate);
    } else {
      // Fallback: últimos 365 días desde hoy
      latestDate = new Date();
      oldestDate = new Date();
      oldestDate.setDate(latestDate.getDate() - 365);
    }

    const dates: Date[] = [];
    const currentDate = new Date(oldestDate);

    while (currentDate <= latestDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      dates,
      minDate: oldestDate,
      maxDate: latestDate,
      totalDays: dates.length
    };
  }, [minDate, maxDate]);

  // Índices del slider (0 a totalDays-1)
  const [sliderStart, setSliderStart] = useState(dateRangeData.totalDays - 30); // Últimos 30 días por defecto
  const [sliderEnd, setSliderEnd] = useState(dateRangeData.totalDays - 1);

  // Inicializar fechas temporales con el rango completo de datos del paciente
  useEffect(() => {
    if (minDate && maxDate && !tempStartDate && !tempEndDate) {
      // Usar startTransition para evitar cascading renders
      React.startTransition(() => {
        setTempStartDate(minDate);
        setTempEndDate(maxDate);
        setSliderStart(0);
        setSliderEnd(dateRangeData.totalDays - 1);
      });
    }
  }, [minDate, maxDate, tempStartDate, tempEndDate, dateRangeData.totalDays]);

  // Sincronizar slider con inputs de fecha
  useEffect(() => {
    if (tempStartDate && tempEndDate) {
      const startDate = new Date(tempStartDate);
      const endDate = new Date(tempEndDate);

      // Encontrar índices correspondientes
      const startIdx = dateRangeData.dates.findIndex(d =>
        d.toISOString().split('T')[0] === startDate.toISOString().split('T')[0]
      );
      const endIdx = dateRangeData.dates.findIndex(d =>
        d.toISOString().split('T')[0] === endDate.toISOString().split('T')[0]
      );

      // Usar startTransition para evitar cascading renders
      React.startTransition(() => {
        if (startIdx !== -1) setSliderStart(startIdx);
        if (endIdx !== -1) setSliderEnd(endIdx);
      });
    }
  }, [tempStartDate, tempEndDate, dateRangeData.dates]);

  const handleVolver = () => {
    router.push('/');
  };

  const handleSliderChange = (start: number, end: number) => {
    setSliderStart(start);
    setSliderEnd(end);

    // Actualizar inputs de fecha
    const startDate = dateRangeData.dates[start];
    const endDate = dateRangeData.dates[end];

    setTempStartDate(startDate.toISOString().split('T')[0]);
    setTempEndDate(endDate.toISOString().split('T')[0]);
  };

  const handleApplyCustomDates = () => {
    if (tempStartDate && tempEndDate && onCustomDateChange) {
      onCustomDateChange(tempStartDate, tempEndDate);
      onDateRangeChange('custom');
      setShowCustomDatePicker(false);
    }
  };

  const handlePresetClick = (preset: string) => {
    if (preset !== 'custom') {
      setShowCustomDatePicker(false);
    }
    onDateRangeChange(preset);
  };

  // Formatear fecha para mostrar
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Control</h1>
          <p className="text-gray-600">
            Pacientes seleccionados: <span className="font-semibold text-gray-900">{selectedPatients.join(', ')}</span>
          </p>
          {dateRange === 'custom' && customStartDate && customEndDate && (
            <p className="text-sm text-blue-600 mt-1">
              Rango personalizado: {new Date(customStartDate).toLocaleDateString('es-ES')} - {new Date(customEndDate).toLocaleDateString('es-ES')}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto">
          {/* Selector de rango de fechas estilo slider */}
          <div className="flex gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm flex-wrap">
            <button
              onClick={() => handlePresetClick('7dias')}
              className={`
                px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
                ${dateRange === '7dias'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              7 días
            </button>
            <button
              onClick={() => handlePresetClick('15dias')}
              className={`
                px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
                ${dateRange === '15dias'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              15 días
            </button>
            <button
              onClick={() => handlePresetClick('30dias')}
              className={`
                px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
                ${dateRange === '30dias'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              30 días
            </button>
            <button
              onClick={() => handlePresetClick('todo')}
              className={`
                px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
                ${dateRange === 'todo'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              Todo
            </button>
            <button
              onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
              className={`
                flex items-center gap-1 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
                ${dateRange === 'custom'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Calendar className="h-4 w-4" />
              Personalizado
            </button>
          </div>

          <button
            onClick={handleVolver}
            className="
              flex items-center justify-center gap-2
              px-5 py-2.5
              bg-white text-gray-700
              border-2 border-gray-300
              rounded-lg font-medium
              hover:bg-gray-50 hover:border-gray-400
              transition-all duration-200
            "
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>
        </div>
      </div>

      {/* Selector de fechas personalizado */}
      {showCustomDatePicker && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Seleccionar Rango de Fechas</h3>

          {/* Slider de rango de fechas */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{formatDate(dateRangeData.minDate)}</span>
              <span>{formatDate(dateRangeData.maxDate)}</span>
            </div>

            {/* Contenedor del slider doble */}
            <div className="relative h-10">
              {/* Track del slider */}
              <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-2 bg-gray-300 rounded-full">
                {/* Área seleccionada */}
                <div
                  className="absolute h-full bg-blue-500 rounded-full"
                  style={{
                    left: `${(sliderStart / (dateRangeData.totalDays - 1)) * 100}%`,
                    width: `${((sliderEnd - sliderStart) / (dateRangeData.totalDays - 1)) * 100}%`
                  }}
                />
              </div>

              {/* Slider de inicio */}
              <input
                type="range"
                min="0"
                max={dateRangeData.totalDays - 1}
                value={sliderStart}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value <= sliderEnd) {
                    handleSliderChange(value, sliderEnd);
                  }
                }}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                style={{ zIndex: sliderStart === sliderEnd ? 2 : 1 }}
              />

              {/* Slider de fin */}
              <input
                type="range"
                min="0"
                max={dateRangeData.totalDays - 1}
                value={sliderEnd}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= sliderStart) {
                    handleSliderChange(sliderStart, value);
                  }
                }}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                style={{ zIndex: 2 }}
              />
            </div>

            {/* Indicadores de fechas seleccionadas */}
            <div className="flex justify-between text-sm font-medium text-blue-600">
              <span>{tempStartDate && formatDate(new Date(tempStartDate))}</span>
              <span className="text-gray-400">←→</span>
              <span>{tempEndDate && formatDate(new Date(tempEndDate))}</span>
            </div>
          </div>

          {/* Inputs de fecha (opcional) */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio
              </label>
              <input
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                min={dateRangeData.minDate.toISOString().split('T')[0]}
                max={dateRangeData.maxDate.toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de fin
              </label>
              <input
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                min={tempStartDate || dateRangeData.minDate.toISOString().split('T')[0]}
                max={dateRangeData.maxDate.toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApplyCustomDates}
                disabled={!tempStartDate || !tempEndDate}
                className="
                  px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm
                  hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                Aplicar
              </button>
              <button
                onClick={() => setShowCustomDatePicker(false)}
                className="
                  px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md font-medium text-sm
                  hover:bg-gray-50
                  transition-all duration-200
                "
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
