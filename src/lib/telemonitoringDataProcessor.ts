import type { UsuarioCompleto, TelemonitorizacionCompleta } from '@/types/database';

/**
 * Procesa los datos de telemonitorización de un paciente y calcula métricas agregadas
 */

// Helper para obtener el valor medio de pico de flujo
const getPicoFlujoValue = (pf: Record<string, unknown>): number => {
  if (pf.valormedio !== null && pf.valormedio !== undefined) return pf.valormedio as number;
  // Si no hay valor medio, calcular de los valores individuales
  const valores = [pf.valor1, pf.valor2, pf.valor3].filter((v): v is number => v !== null && v !== undefined && typeof v === 'number');
  if (valores.length === 0) return 0;
  return valores.reduce((sum, v) => sum + v, 0) / valores.length;
};

// Helper para calcular eficiencia del sueño (porcentaje de sueño profundo + REM respecto al total)
const calculateSleepEfficiency = (sleep: Record<string, unknown>): number => {
  const totalMinutes = (sleep.duration as number) || 0;
  if (totalMinutes === 0) return 0;

  const deepMinutes = (sleep.deep_minutes as number) || 0;
  const remMinutes = (sleep.rem_minutes as number) || 0;

  return ((deepMinutes + remMinutes) / totalMinutes) * 100;
};

// Helper para convertir minutos a horas
const minutesToHours = (minutes: number | null | undefined): number => {
  if (minutes === null || minutes === undefined) return 0;
  return minutes / 60;
};

// Helper para parsear SpO2 desde el campo de Sleep (puede ser string JSON)
const parseSpO2 = (spo2Field: unknown): number | null => {
  if (!spo2Field) return null;

  // Si es un número, retornarlo directamente
  if (typeof spo2Field === 'number') return spo2Field;

  // Si es string, intentar parsear como JSON
  if (typeof spo2Field === 'string') {
    try {
      const parsed = JSON.parse(spo2Field);
      // Si el JSON tiene un campo "avgSaturation" o similar, usarlo
      if (parsed.avgSaturation !== undefined) return parsed.avgSaturation;
      if (parsed.avg !== undefined) return parsed.avg;
      // Si es un array de valores, promediar
      if (Array.isArray(parsed)) {
        const values = parsed.filter(v => typeof v === 'number');
        if (values.length > 0) {
          return values.reduce((sum, v) => sum + v, 0) / values.length;
        }
      }
    } catch (e) {
      // Si falla el parseo, intentar convertir directamente a número
      const num = parseFloat(spo2Field);
      if (!isNaN(num)) return num;
    }
  }

  return null;
};

export interface ProcessedMetrics {
  // Datos para gráficas
  saturacionData: Array<{ fecha: string; spo2: number }>;
  picoFlujoData: Array<{ fecha: string; toma1: number; toma2: number; toma3: number }>;
  suenoData: Array<{
    fecha: string;
    duracion: number;
    profundo: number;
    rem: number;
    ligero: number;
    despierto: number;
    timeInBed: number;
    average_breathing_rate: number;
    HRVdailyRmssd: number;
    HRVdeepRmssd: number;
    eficiencia: number;
    spo2Sueno: number;
    spo2Min: number;
    spo2Max: number;
    hrv: number;
    frecuenciaCardiaca: number;
    tasaRespiratoria: number;
    awakeningsCount: number;
  }>;
  calidadAire1Data: Array<{ fecha: string; pm25: number; pm10: number; pm1: number; pm4: number; co2: number; voc: number; temperatura: number; humedad: number }>;
  actividadData: Array<{
    fecha: string;
    restingHeartRate: number;
    movimiento: number;
    pasos: number;
    reposo: number;
    distancia: number;
    frecuenciaCardiaca: number;
    spo2: number;
    activos: number;
    ligeros: number;
    inactivos: number;
  }>;
  resumenData: Array<{ fecha: string; pasos: number; minutos: number; calorias: number }>;
  pesajeData: Array<{ fecha: string; peso: number }>;
  sonidosData: Array<{
    fecha: string;
    // Parámetros de la frase
    duracionFrase: number;
    tasaHabla: number;
    jitter: number;
    pitch: number;
    shimmer: number;
    hnr: number;
    intensidadPromedio: number;
    numeroPausas: number;
    duracionPausasTotal: number;
    f0Min: number;
    f0Max: number;
    mfccs: string;
    variabilidadTono: number;
    variabilidadIntensidad: number;
    variabilidadRitmo: number;
    // Parámetros de la tos
    tosDuracion: number;
    tosEnergiaRmsMean: number;
    tosZcrMean: number;
    tosSpectralCentroidMean: number;
    tosSpectralBandwidthMean: number;
    tosF0Mean: number;
    tosHnr: number;
    tosMfccMean1: number;
    tosMfccMean2: number;
  }>;
  cuestionarioHistorico: Array<{
    fecha: string;
    fatiga: number;
    disnea: number;
    tos: number;
    sueno: number;
    animo: number;
    opresion: number;
    // Métricas psicomotoras
    errorPromedio: number;
    errorMaximo: number;
    suavidad: number;
    circularidad: number;
    areaCircle: number;
    excentricidad: number;
    desviacion: number;
    variabilidadStd: number;
    variabilidadMedia: number;
    tiempo: number;
  }>;

  // Datos de correlaciones
  correlacionesClinicas: Array<{
    fecha: string;
    eficienciaSueno: number;
    spo2: number;
    picoFlujo: number;
    pm25: number;
    minutosActivos: number;
    hrv: number;
  }>;
  correlacionData: Array<{
    fecha: string;
    pasos: number;
    calorias: number;
    calidad: number;
  }>;

  // Promedios calculados
  avgSaturacion: number;
  avgPicoFlujo: number;
  sleepEfficiency: number;
  avgPM1: number;
  avgPM25: number;
  avgPM4: number;
  avgPM10: number;
  avgCO2: number;
  avgVOC: number;
  avgTemperatura: number;
  avgHumedad: number;
  avgRestingHeartRate: number;
  avgPeso: number;
  avgTimeInBed: number;
  avgBreathingRate: number;
  avgHRVdailyRmssd: number;
  avgPasos: number;
  avgFatiga: number;
  avgDisnea: number;
  avgTos: number;
  avgSuenoCuest: number;
  avgAnimo: number;
  avgOpresion: number;
}

/**
 * Procesa todos los datos de telemonitorización de un paciente
 */
export function processTelemonitoringData(paciente: UsuarioCompleto | null): ProcessedMetrics {
  // Valores por defecto si no hay datos
  const emptyMetrics: ProcessedMetrics = {
    saturacionData: [],
    picoFlujoData: [],
    suenoData: [],
    calidadAire1Data: [],
    actividadData: [],
    resumenData: [],
    pesajeData: [],
    sonidosData: [],
    cuestionarioHistorico: [],
    correlacionesClinicas: [],
    correlacionData: [],
    avgSaturacion: 0,
    avgPicoFlujo: 0,
    sleepEfficiency: 0,
    avgPM1: 0,
    avgPM25: 0,
    avgPM4: 0,
    avgPM10: 0,
    avgCO2: 0,
    avgVOC: 0,
    avgTemperatura: 0,
    avgHumedad: 0,
    avgRestingHeartRate: 0,
    avgPeso: 0,
    avgTimeInBed: 0,
    avgBreathingRate: 0,
    avgHRVdailyRmssd: 0,
    avgPasos: 0,
    avgFatiga: 0,
    avgDisnea: 0,
    avgTos: 0,
    avgSuenoCuest: 0,
    avgAnimo: 0,
    avgOpresion: 0,
  };

  if (!paciente || !paciente.telemonitorizaciones || paciente.telemonitorizaciones.length === 0) {
    return emptyMetrics;
  }

  const telemonitorizaciones = paciente.telemonitorizaciones;

  // Arrays para acumular datos
  const saturacionData: Array<{ fecha: string; spo2: number }> = [];
  const picoFlujoData: Array<{ fecha: string; toma1: number; toma2: number; toma3: number }> = [];
  const suenoData: Array<{
    fecha: string;
    duracion: number;
    profundo: number;
    rem: number;
    ligero: number;
    despierto: number;
    timeInBed: number;
    average_breathing_rate: number;
    HRVdailyRmssd: number;
    HRVdeepRmssd: number;
    eficiencia: number;
    spo2Sueno: number;
    spo2Min: number;
    spo2Max: number;
    hrv: number;
    frecuenciaCardiaca: number;
    tasaRespiratoria: number;
    awakeningsCount: number;
  }> = [];
  const calidadAireMap: Map<string, Array<{ pm25: number; pm10: number; pm1: number; pm4: number; co2: number; voc: number; temp: number; hum: number }>> = new Map();
  const actividadData: Array<{
    fecha: string;
    restingHeartRate: number;
    movimiento: number;
    pasos: number;
    reposo: number;
    distancia: number;
    frecuenciaCardiaca: number;
    spo2: number;
    activos: number;
    ligeros: number;
    inactivos: number;
  }> = [];
  const resumenData: Array<{ fecha: string; pasos: number; minutos: number; calorias: number }> = [];
  const pesajeData: Array<{ fecha: string; peso: number }> = [];
  const sonidosData: Array<{
    fecha: string;
    duracionFrase: number;
    tasaHabla: number;
    jitter: number;
    pitch: number;
    shimmer: number;
    hnr: number;
    intensidadPromedio: number;
    numeroPausas: number;
    duracionPausasTotal: number;
    f0Min: number;
    f0Max: number;
    mfccs: string;
    variabilidadTono: number;
    variabilidadIntensidad: number;
    variabilidadRitmo: number;
    tosDuracion: number;
    tosEnergiaRmsMean: number;
    tosZcrMean: number;
    tosSpectralCentroidMean: number;
    tosSpectralBandwidthMean: number;
    tosF0Mean: number;
    tosHnr: number;
    tosMfccMean1: number;
    tosMfccMean2: number;
  }> = [];
  const cuestionarioHistorico: Array<{
    fecha: string;
    fatiga: number;
    disnea: number;
    tos: number;
    sueno: number;
    animo: number;
    opresion: number;
    errorPromedio: number;
    errorMaximo: number;
    suavidad: number;
    circularidad: number;
    areaCircle: number;
    excentricidad: number;
    desviacion: number;
    variabilidadStd: number;
    variabilidadMedia: number;
    tiempo: number;
  }> = [];

  // Acumuladores para promedios
  let totalSaturacion = 0;
  let countSaturacion = 0;
  let totalPicoFlujo = 0;
  let countPicoFlujo = 0;
  let totalSleepEfficiency = 0;
  let countSleep = 0;
  let totalRestingHeartRate = 0;
  let countRestingHeartRate = 0;
  let totalPeso = 0;
  let countPeso = 0;
  let totalTimeInBed = 0;
  let countTimeInBed = 0;
  let totalBreathingRate = 0;
  let countBreathingRate = 0;
  let totalHRV = 0;
  let countHRV = 0;
  let totalPasos = 0;
  let countPasos = 0;
  let totalFatiga = 0;
  let totalDisnea = 0;
  let totalTos = 0;
  let totalSuenoCuest = 0;
  let totalAnimo = 0;
  let totalOpresion = 0;
  let countCuestionario = 0;

  // Crear un mapa para almacenar SpO2 por fecha (desde sleep)
  const spo2ByDate: Map<string, number> = new Map();

  // Primer paso: recopilar SpO2 de todos los registros de sueño
  telemonitorizaciones.forEach(tele => {
    if (tele.sleep) {
      const spo2Value = parseSpO2(tele.sleep.spo2);
      if (spo2Value !== null && spo2Value > 0) {
        spo2ByDate.set(tele.fecha, spo2Value);
      }
    }
  });

  // Procesar cada telemonitorización
  telemonitorizaciones.forEach(tele => {
    const fecha = tele.fecha;

    // Obtener resting heart rate de actividad para este día (lo necesitaremos para suenoData)
    let restingHeartRateForSleep = 0;
    if (tele.actividad && tele.actividad.restingHeartRate) {
      restingHeartRateForSleep = tele.actividad.restingHeartRate;
    }

    // Procesar datos de sueño
    if (tele.sleep) {
      const sleep = tele.sleep;

      // SpO2 desde sleep
      const spo2Value = parseSpO2(sleep.spo2);
      if (spo2Value !== null && spo2Value > 0) {
        saturacionData.push({ fecha, spo2: spo2Value });
        totalSaturacion += spo2Value;
        countSaturacion++;
      }

      // Datos de sueño
      const duration = minutesToHours(sleep.duration);
      const deepMinutes = minutesToHours(sleep.deep_minutes);
      const remMinutes = minutesToHours(sleep.rem_minutes);
      const lightMinutes = minutesToHours(sleep.light_minutes);
      const wakeMinutes = minutesToHours(sleep.wake_minutes);
      const timeInBed = minutesToHours(sleep.timeInBed);
      const breathingRate = sleep.average_breathing_rate || 0;
      const hrv = sleep.HRVdailyRmssd || 0;
      const hrvDeep = sleep.HRVdeepRmssd || 0;
      const awakenings = sleep.awakeningsCount || 0;
      const efficiency = calculateSleepEfficiency(sleep);

      // Parsear SpO2 para obtener min/max (formato: "avg;min;max" o solo número)
      let spo2Min = spo2Value || 0;
      let spo2Max = spo2Value || 0;
      if (sleep.spo2 && typeof sleep.spo2 === 'string' && sleep.spo2.includes(';')) {
        const spo2Parts = sleep.spo2.split(';').map(Number);
        if (spo2Parts.length >= 3) {
          spo2Min = spo2Parts[1] || spo2Value || 0;
          spo2Max = spo2Parts[2] || spo2Value || 0;
        }
      }

      if (duration > 0 || timeInBed > 0) {
        suenoData.push({
          fecha,
          duracion: duration,
          profundo: deepMinutes,
          rem: remMinutes,
          ligero: lightMinutes,
          despierto: wakeMinutes,
          timeInBed: timeInBed,
          average_breathing_rate: breathingRate,
          HRVdailyRmssd: hrv,
          HRVdeepRmssd: hrvDeep,
          eficiencia: efficiency,
          spo2Sueno: spo2Value || 0,
          spo2Min: spo2Min,
          spo2Max: spo2Max,
          hrv: hrv,
          frecuenciaCardiaca: restingHeartRateForSleep,
          tasaRespiratoria: breathingRate,
          awakeningsCount: awakenings,
        });

        if (efficiency > 0) {
          totalSleepEfficiency += efficiency;
          countSleep++;
        }

        if (timeInBed > 0) {
          totalTimeInBed += timeInBed;
          countTimeInBed++;
        }

        if (breathingRate > 0) {
          totalBreathingRate += breathingRate;
          countBreathingRate++;
        }

        if (hrv > 0) {
          totalHRV += hrv;
          countHRV++;
        }
      }
    }

    // Procesar pico de flujo
    if (tele.picoflujos && tele.picoflujos.length > 0) {
      // Usar el primer registro de pico de flujo del día
      const pf = tele.picoflujos[0];
      const valor1 = pf.valor1 || 0;
      const valor2 = pf.valor2 || 0;
      const valor3 = pf.valor3 || 0;

      if (valor1 > 0 || valor2 > 0 || valor3 > 0) {
        picoFlujoData.push({
          fecha,
          toma1: valor1,
          toma2: valor2,
          toma3: valor3,
        });

        const avgPF = getPicoFlujoValue(pf);
        if (avgPF > 0) {
          totalPicoFlujo += avgPF;
          countPicoFlujo++;
        }
      }
    }

    // Procesar calidad del aire
    if (tele.calidadAire && tele.calidadAire.length > 0) {
      // Agrupar por fecha y calcular promedios del día
      if (!calidadAireMap.has(fecha)) {
        calidadAireMap.set(fecha, []);
      }

      tele.calidadAire.forEach(ca => {
        calidadAireMap.get(fecha)!.push({
          pm25: ca.ppm25 || 0,
          pm10: ca.ppm10 || 0,
          pm1: ca.ppm1 || 0,
          pm4: ca.ppm4 || 0,
          co2: ca.co2 || 0,
          voc: ca.voc || 0,
          temp: ca.temp || 0,
          hum: ca.hum || 0,
        });
      });
    }

    // Procesar actividad
    if (tele.actividad) {
      const act = tele.actividad;
      const restingHR = act.restingHeartRate || 0;
      const steps = act.steps || 0;
      const sedentaryMinutes = act.sedentaryMinutes || 0;
      const distance = (act.total_distance || 0) / 1000; // Convertir a km

      // Calcular minutos de actividad (suma de todos los tipos de actividad)
      const fairlyActive = act.fairlyActiveMinutes || 0;
      const lightlyActive = act.lightlyActiveMinutes || 0;
      const veryActive = act.veryActiveMinutes || 0;
      const totalActiveMinutes = fairlyActive + lightlyActive + veryActive;

      const calories = act.caloriesOut || 0;

      // Obtener SpO2 del registro de sueño de este día
      const spo2ForDay = spo2ByDate.get(fecha) || 0;

      actividadData.push({
        fecha,
        restingHeartRate: restingHR,
        movimiento: steps,
        pasos: steps, // Agregar campo pasos explícitamente para la gráfica
        reposo: sedentaryMinutes,
        distancia: distance,
        frecuenciaCardiaca: restingHR, // Usar resting heart rate como frecuencia cardíaca
        spo2: spo2ForDay, // Obtener SpO2 del registro de sueño
        activos: veryActive + fairlyActive, // Combinar muy activos y moderadamente activos
        ligeros: lightlyActive,
        inactivos: sedentaryMinutes,
      });

      // Resumen de actividad (para gráficas de pasos/calorías)
      resumenData.push({
        fecha,
        pasos: steps,
        minutos: totalActiveMinutes,
        calorias: calories,
      });

      if (restingHR > 0) {
        totalRestingHeartRate += restingHR;
        countRestingHeartRate++;
      }

      if (steps > 0) {
        totalPasos += steps;
        countPasos++;
      }
    }

    // Procesar pesajes
    if (tele.pesajes && tele.pesajes.length > 0) {
      // Usar el primer pesaje del día
      const peso = tele.pesajes[0].peso;
      if (peso > 0) {
        pesajeData.push({ fecha, peso });
        totalPeso += peso;
        countPeso++;
      }
    }

    // Procesar cuestionarios (q1-q6 corresponden a fatiga, disnea, tos, sueño, ánimo, opresión)
    if (tele.cuestionarios && tele.cuestionarios.length > 0) {
      const cuest = tele.cuestionarios[0];
      const fatiga = cuest.q1 || 0;
      const disnea = cuest.q2 || 0;
      const tos = cuest.q3 || 0;
      const sueno = cuest.q4 || 0;
      const animo = cuest.q5 || 0;
      const opresion = cuest.q6 || 0;

      // Métricas psicomotoras del cuestionario
      const suavidad = cuest.suavidad || 0;
      const circularidad = cuest.circularidad || 0;
      const areaCircle = cuest.area_circle || 0;
      const excentricidad = cuest.Excentricidad || 0;
      const desviacion = cuest.desviacion || 0;
      const variabilidadStd = cuest.variabilidad_std || 0;
      const variabilidadMedia = cuest.variabilidad_media || 0;
      const tiempo = cuest.tiempo || 0;

      // Calcular errores del juego (formato: "ancho;alto;e1x;e1y;e2x;e2y;e3x;e3y")
      let errorPromedio = 0;
      let errorMaximo = 0;
      if (cuest.juego && typeof cuest.juego === 'string') {
        const parts = cuest.juego.split(';').map(Number);
        if (parts.length >= 8) {
          const ancho = parts[0] || 720;
          const alto = parts[1] || 1384;
          const error1 = Math.sqrt(Math.pow(parts[2] / ancho, 2) + Math.pow(parts[3] / alto, 2));
          const error2 = Math.sqrt(Math.pow(parts[4] / ancho, 2) + Math.pow(parts[5] / alto, 2));
          const error3 = Math.sqrt(Math.pow(parts[6] / ancho, 2) + Math.pow(parts[7] / alto, 2));
          errorPromedio = (error1 + error2 + error3) / 3;
          errorMaximo = Math.max(error1, error2, error3);
        }
      }

      // Solo agregar si hay al menos un valor válido
      if (fatiga > 0 || disnea > 0 || tos > 0 || sueno > 0 || animo > 0 || opresion > 0 || tiempo > 0) {
        cuestionarioHistorico.push({
          fecha,
          fatiga,
          disnea,
          tos,
          sueno,
          animo,
          opresion,
          errorPromedio,
          errorMaximo,
          suavidad,
          circularidad,
          areaCircle,
          excentricidad,
          desviacion,
          variabilidadStd,
          variabilidadMedia,
          tiempo,
        });

        // Acumular para promedios
        if (fatiga > 0) {
          totalFatiga += fatiga;
          countCuestionario++;
        }
        if (disnea > 0) totalDisnea += disnea;
        if (tos > 0) totalTos += tos;
        if (sueno > 0) totalSuenoCuest += sueno;
        if (animo > 0) totalAnimo += animo;
        if (opresion > 0) totalOpresion += opresion;
      }
    }

    // Procesar sonidos (firma acústica)
    if (tele.sonidos && tele.sonidos.length > 0) {
      const sonido = tele.sonidos[0];

      sonidosData.push({
        fecha,
        // Parámetros de la frase
        duracionFrase: sonido.duracion_frase || 0,
        tasaHabla: sonido.tasa_habla || 0,
        jitter: sonido.jitter || 0,
        pitch: sonido.pitch || 0,
        shimmer: sonido.shimmer || 0,
        hnr: sonido.hnr || 0,
        intensidadPromedio: sonido.intensidad_promedio || 0,
        numeroPausas: sonido.numero_pausas || 0,
        duracionPausasTotal: sonido.duracion_pausas_total || 0,
        f0Min: sonido.f0_min || 0,
        f0Max: sonido.f0_max || 0,
        mfccs: sonido.mfccs || '',
        variabilidadTono: sonido.variabilidad_tono || 0,
        variabilidadIntensidad: sonido.variabilidad_intensidad || 0,
        variabilidadRitmo: sonido.variabilidad_ritmo || 0,
        // Parámetros de la tos
        tosDuracion: sonido.tos_duracion || 0,
        tosEnergiaRmsMean: sonido.tos_energia_rms_mean || 0,
        tosZcrMean: sonido.tos_zcr_mean || 0,
        tosSpectralCentroidMean: sonido.tos_spectral_centroid_mean || 0,
        tosSpectralBandwidthMean: sonido.tos_spectral_bandwidth_mean || 0,
        tosF0Mean: sonido.tos_f0_mean || 0,
        tosHnr: sonido.tos_hnr || 0,
        tosMfccMean1: sonido.tos_mfcc_mean_1 || 0,
        tosMfccMean2: sonido.tos_mfcc_mean_2 || 0,
      });
    }
  });

  // Procesar calidad del aire (promedios diarios)
  const calidadAire1Data: Array<{ fecha: string; pm25: number; pm10: number; pm1: number; pm4: number; co2: number; voc: number; temperatura: number; humedad: number }> = [];
  let totalPM1 = 0;
  let totalPM25 = 0;
  let totalPM4 = 0;
  let totalPM10 = 0;
  let totalCO2 = 0;
  let totalVOC = 0;
  let totalTemperatura = 0;
  let totalHumedad = 0;
  let countAirQuality = 0;

  calidadAireMap.forEach((valores, fecha) => {
    if (valores.length > 0) {
      const avgPM1 = valores.reduce((sum, v) => sum + v.pm1, 0) / valores.length;
      const avgPM25 = valores.reduce((sum, v) => sum + v.pm25, 0) / valores.length;
      const avgPM4 = valores.reduce((sum, v) => sum + v.pm4, 0) / valores.length;
      const avgPM10 = valores.reduce((sum, v) => sum + v.pm10, 0) / valores.length;
      const avgCO2 = valores.reduce((sum, v) => sum + v.co2, 0) / valores.length;
      const avgVOC = valores.reduce((sum, v) => sum + v.voc, 0) / valores.length;
      const avgTemp = valores.reduce((sum, v) => sum + v.temp, 0) / valores.length;
      const avgHum = valores.reduce((sum, v) => sum + v.hum, 0) / valores.length;

      calidadAire1Data.push({
        fecha,
        pm1: avgPM1,
        pm25: avgPM25,
        pm4: avgPM4,
        pm10: avgPM10,
        co2: avgCO2,
        voc: avgVOC,
        temperatura: avgTemp,
        humedad: avgHum,
      });

      totalPM1 += avgPM1;
      totalPM25 += avgPM25;
      totalPM4 += avgPM4;
      totalPM10 += avgPM10;
      totalCO2 += avgCO2;
      totalVOC += avgVOC;
      totalTemperatura += avgTemp;
      totalHumedad += avgHum;
      countAirQuality++;
    }
  });

  // Calcular datos de correlaciones
  const correlacionesClinicas: Array<{
    fecha: string;
    eficienciaSueno: number;
    spo2: number;
    picoFlujo: number;
    pm25: number;
    minutosActivos: number;
    hrv: number;
  }> = [];

  const correlacionData: Array<{
    fecha: string;
    pasos: number;
    calorias: number;
    calidad: number;
  }> = [];

  // Crear un mapa de datos por fecha para correlaciones
  telemonitorizaciones.forEach(tele => {
    const fecha = tele.fecha;

    // Variables para correlaciones clínicas
    let eficienciaSueno = 0;
    let spo2 = 0;
    let picoFlujo = 0;
    let pm25 = 0;
    let minutosActivos = 0;
    let hrv = 0;

    // Variables para correlaciones generales
    let pasos = 0;
    let calorias = 0;
    let calidad = 0;

    // Obtener datos de sueño
    if (tele.sleep) {
      eficienciaSueno = calculateSleepEfficiency(tele.sleep);
      const spo2Value = parseSpO2(tele.sleep.spo2);
      if (spo2Value !== null) spo2 = spo2Value;
      hrv = tele.sleep.HRVdailyRmssd || 0;
    }

    // Obtener pico de flujo
    if (tele.picoflujos && tele.picoflujos.length > 0) {
      picoFlujo = getPicoFlujoValue(tele.picoflujos[0]);
    }

    // Obtener PM2.5 promedio del día
    if (tele.calidadAire && tele.calidadAire.length > 0) {
      const pm25Sum = tele.calidadAire.reduce((sum, ca) => sum + (ca.ppm25 || 0), 0);
      pm25 = pm25Sum / tele.calidadAire.length;

      // Calcular índice de calidad (inverso de PM2.5, normalizado a escala 0-100)
      // Menor PM2.5 = mejor calidad
      calidad = Math.max(0, 100 - pm25);
    }

    // Obtener datos de actividad
    if (tele.actividad) {
      pasos = tele.actividad.steps || 0;
      calorias = tele.actividad.caloriesOut || 0;

      const fairlyActive = tele.actividad.fairlyActiveMinutes || 0;
      const lightlyActive = tele.actividad.lightlyActiveMinutes || 0;
      const veryActive = tele.actividad.veryActiveMinutes || 0;
      minutosActivos = fairlyActive + lightlyActive + veryActive;
    }

    // Solo agregar puntos si tenemos datos válidos para correlaciones clínicas
    if (eficienciaSueno > 0 || spo2 > 0 || picoFlujo > 0 || pm25 > 0 || minutosActivos > 0 || hrv > 0) {
      correlacionesClinicas.push({
        fecha,
        eficienciaSueno,
        spo2,
        picoFlujo,
        pm25,
        minutosActivos,
        hrv,
      });
    }

    // Solo agregar puntos si tenemos datos válidos para correlaciones generales
    if (pasos > 0 || calorias > 0 || calidad > 0) {
      correlacionData.push({
        fecha,
        pasos,
        calorias,
        calidad,
      });
    }
  });

  // Calcular promedios finales
  return {
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
    avgSaturacion: countSaturacion > 0 ? Math.round(totalSaturacion / countSaturacion) : 0,
    avgPicoFlujo: countPicoFlujo > 0 ? Math.round(totalPicoFlujo / countPicoFlujo) : 0,
    sleepEfficiency: countSleep > 0 ? totalSleepEfficiency / countSleep : 0,
    avgPM1: countAirQuality > 0 ? totalPM1 / countAirQuality : 0,
    avgPM25: countAirQuality > 0 ? totalPM25 / countAirQuality : 0,
    avgPM4: countAirQuality > 0 ? totalPM4 / countAirQuality : 0,
    avgPM10: countAirQuality > 0 ? totalPM10 / countAirQuality : 0,
    avgCO2: countAirQuality > 0 ? totalCO2 / countAirQuality : 0,
    avgVOC: countAirQuality > 0 ? totalVOC / countAirQuality : 0,
    avgTemperatura: countAirQuality > 0 ? totalTemperatura / countAirQuality : 0,
    avgHumedad: countAirQuality > 0 ? totalHumedad / countAirQuality : 0,
    avgRestingHeartRate: countRestingHeartRate > 0 ? totalRestingHeartRate / countRestingHeartRate : 0,
    avgPeso: countPeso > 0 ? totalPeso / countPeso : 0,
    avgTimeInBed: countTimeInBed > 0 ? totalTimeInBed / countTimeInBed : 0,
    avgBreathingRate: countBreathingRate > 0 ? totalBreathingRate / countBreathingRate : 0,
    avgHRVdailyRmssd: countHRV > 0 ? totalHRV / countHRV : 0,
    avgPasos: countPasos > 0 ? Math.round(totalPasos / countPasos) : 0,
    avgFatiga: countCuestionario > 0 ? totalFatiga / countCuestionario : 0,
    avgDisnea: countCuestionario > 0 ? totalDisnea / countCuestionario : 0,
    avgTos: countCuestionario > 0 ? totalTos / countCuestionario : 0,
    avgSuenoCuest: countCuestionario > 0 ? totalSuenoCuest / countCuestionario : 0,
    avgAnimo: countCuestionario > 0 ? totalAnimo / countCuestionario : 0,
    avgOpresion: countCuestionario > 0 ? totalOpresion / countCuestionario : 0,
  };
}
