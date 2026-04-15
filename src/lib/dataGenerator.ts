// Funciones para generar datos aleatorios basados en el ID del paciente
export const generateRandomData = (
  patientId: string,
  days: number,
  customStartDate?: string,
  customEndDate?: string
) => {
  // Usar el ID del paciente como semilla para generar datos consistentes
  const seed = patientId.charCodeAt(patientId.length - 1);

  // Función para generar número aleatorio con semilla
  const seededRandom = (min: number, max: number, index: number) => {
    const x = Math.sin(seed * 9999 + index) * 10000;
    return Math.floor(min + (x - Math.floor(x)) * (max - min));
  };

  // Generar fechas
  const dates = [];

  if (customStartDate && customEndDate) {
    // Usar rango de fechas personalizado
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const currentDate = new Date(start);

    while (currentDate <= end) {
      dates.push(`${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else {
    // Usar días desde hoy hacia atrás
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(`${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`);
    }
  }

  const resumenData = dates.map((fecha, i) => ({
    fecha,
    pasos: seededRandom(4000, 9000, i),
    minutos: seededRandom(40, 90, i + 100),
    calorias: seededRandom(250, 550, i + 200),
  }));

  const correlacionData = resumenData.map((item, i) => ({
    pasos: item.pasos,
    calorias: item.calorias,
    calidad: seededRandom(60, 85, i + 300),
  }));

  const calidadAire1Data = dates.map((fecha, i) => ({
    fecha,
    pm1: seededRandom(5, 12, i + 350), // PM1 normal: 5-12 µg/m³
    pm25: seededRandom(10, 20, i + 400),
    pm4: seededRandom(12, 22, i + 450), // PM4 normal: 12-22 µg/m³
    pm10: seededRandom(15, 30, i + 500),
    co2: seededRandom(400, 460, i + 600),
    voc: seededRandom(100, 300, i + 900), // VOC normal: 100-300 ppb
  }));

  const calidadAire2Data = dates.map((fecha, i) => ({
    fecha,
    temperatura: seededRandom(20, 26, i + 700),
    humedad: seededRandom(50, 65, i + 800),
  }));

  // Datos del cuestionario histórico (por fecha)
  const cuestionarioHistorico = dates.map((fecha, i) => ({
    fecha,
    fatiga: seededRandom(1, 5, i + 2000),
    disnea: seededRandom(1, 5, i + 2100),
    tos: seededRandom(1, 5, i + 2200),
    sueno: seededRandom(2, 5, i + 2300),
    animo: seededRandom(2, 5, i + 2400),
    opresion: seededRandom(1, 5, i + 2500),
  }));

  // Calcular valores actuales y promedios para el gráfico de barras
  const cuestionarioData = [
    { 
      pregunta: 'P1: Fatiga',
      descripcion: 'Nivel de cansancio o agotamiento general',
      valor: cuestionarioHistorico[cuestionarioHistorico.length - 1]?.fatiga || seededRandom(1, 5, 900),
      promedio: cuestionarioHistorico.length > 0 
        ? Math.round(cuestionarioHistorico.reduce((sum, d) => sum + d.fatiga, 0) / cuestionarioHistorico.length * 10) / 10
        : seededRandom(2, 4, 901)
    },
    { 
      pregunta: 'P2: Disnea',
      descripcion: 'Sensación de falta de aire o dificultad para respirar',
      valor: cuestionarioHistorico[cuestionarioHistorico.length - 1]?.disnea || seededRandom(1, 5, 902),
      promedio: cuestionarioHistorico.length > 0
        ? Math.round(cuestionarioHistorico.reduce((sum, d) => sum + d.disnea, 0) / cuestionarioHistorico.length * 10) / 10
        : seededRandom(2, 4, 903)
    },
    { 
      pregunta: 'P3: Tos',
      descripcion: 'Frecuencia e intensidad de episodios de tos',
      valor: cuestionarioHistorico[cuestionarioHistorico.length - 1]?.tos || seededRandom(1, 5, 904),
      promedio: cuestionarioHistorico.length > 0
        ? Math.round(cuestionarioHistorico.reduce((sum, d) => sum + d.tos, 0) / cuestionarioHistorico.length * 10) / 10
        : seededRandom(1, 3, 905)
    },
    { 
      pregunta: 'P4: Sueño',
      descripcion: 'Calidad general del descanso nocturno',
      valor: cuestionarioHistorico[cuestionarioHistorico.length - 1]?.sueno || seededRandom(2, 5, 906),
      promedio: cuestionarioHistorico.length > 0
        ? Math.round(cuestionarioHistorico.reduce((sum, d) => sum + d.sueno, 0) / cuestionarioHistorico.length * 10) / 10
        : seededRandom(3, 5, 907)
    },
    { 
      pregunta: 'P5: Ánimo',
      descripcion: 'Estado emocional y bienestar psicológico',
      valor: cuestionarioHistorico[cuestionarioHistorico.length - 1]?.animo || seededRandom(2, 5, 908),
      promedio: cuestionarioHistorico.length > 0
        ? Math.round(cuestionarioHistorico.reduce((sum, d) => sum + d.animo, 0) / cuestionarioHistorico.length * 10) / 10
        : seededRandom(3, 5, 909)
    },
    { 
      pregunta: 'P6: Opresión',
      descripcion: 'Sensación de presión o peso en el pecho',
      valor: cuestionarioHistorico[cuestionarioHistorico.length - 1]?.opresion || seededRandom(1, 5, 910),
      promedio: cuestionarioHistorico.length > 0
        ? Math.round(cuestionarioHistorico.reduce((sum, d) => sum + d.opresion, 0) / cuestionarioHistorico.length * 10) / 10
        : seededRandom(1, 3, 911)
    },
  ];

  const picoFlujoData = dates.map((fecha, i) => ({
    fecha,
    toma1: seededRandom(360, 410, i + 1000),
    toma2: seededRandom(360, 410, i + 1100),
    toma3: seededRandom(360, 410, i + 1200),
  }));

  const actividadData = dates.map((fecha, i) => {
    const activos = seededRandom(40, 90, i + 1300); // Minutos activos (en movimiento intenso)
    const ligeros = seededRandom(80, 150, i + 1350); // Minutos de actividad ligera
    const inactivos = 240 - activos - ligeros; // El resto son inactivos (en reposo)

    return {
      fecha,
      activos,
      ligeros,
      inactivos,
      // Campos adicionales para métricas
      distancia: seededRandom(3, 12, i + 3000) / 10, // Distancia en km (0.3 - 1.2 km por día)
      frecuenciaCardiaca: seededRandom(65, 85, i + 3100), // Frecuencia cardíaca promedio en bpm
      spo2: seededRandom(95, 99, i + 3200), // SpO2 promedio
      restingHeartRate: seededRandom(55, 75, i + 5000), // Tasa cardíaca en reposo en bpm
      // Mantener compatibilidad con código existente
      movimiento: activos,
      reposo: inactivos,
    };
  });

  const suenoData = dates.map((fecha, i) => {
    const profundo = seededRandom(12, 24, i + 1400) / 10;
    const rem = seededRandom(12, 20, i + 1500) / 10;
    const ligero = seededRandom(35, 42, i + 1600) / 10;
    const duracion = profundo + rem + ligero;
    const timeInBed = duracion + (seededRandom(5, 30, i + 5100) / 10); // Tiempo en cama es mayor a duración del sueño

    // Nuevas métricas de sueño
    const eficiencia = seededRandom(75, 95, i + 4000); // Eficiencia del sueño en %
    const spo2Sueno = seededRandom(93, 98, i + 4100); // SpO2 durante el sueño
    const hrv = seededRandom(30, 80, i + 4200); // Variabilidad de frecuencia cardíaca en ms
    const frecuenciaCardiaca = seededRandom(50, 70, i + 4300); // FC durante el sueño en bpm
    const tasaRespiratoria = seededRandom(12, 18, i + 4400); // Tasa respiratoria en respiraciones/min
    const average_breathing_rate = seededRandom(12, 18, i + 5200); // Tasa respiratoria nocturna
    const HRVdailyRmssd = seededRandom(20, 80, i + 5300); // Variabilidad cardíaca nocturna en ms

    return {
      fecha,
      duracion,
      profundo,
      rem,
      ligero,
      timeInBed,
      // Nuevas métricas
      eficiencia,
      spo2Sueno,
      hrv,
      frecuenciaCardiaca,
      tasaRespiratoria,
      average_breathing_rate,
      HRVdailyRmssd,
    };
  });

  // Datos de saturación de oxígeno (SpO2)
  const saturacionData = dates.map((fecha, i) => ({
    fecha,
    spo2: seededRandom(95, 99, i + 1700), // SpO2 normal: 95-100%
  }));

  // Datos de variación de frecuencia cardiaca (HRV - ms)
  const hrvData = dates.map((fecha, i) => ({
    fecha,
    hrv: seededRandom(20, 100, i + 1800), // HRV normal: 20-100 ms
  }));

  // Datos de pesaje
  const pesajeData = dates.map((fecha, i) => ({
    fecha,
    peso: seededRandom(70, 90, i + 5400) + (seededRandom(0, 10, i + 5500) / 10), // Peso en kg con decimales
  }));

  // Datos de correlaciones clínicas combinados
  const correlacionesClinicas = dates.map((fecha, i) => {
    const suenoItem = suenoData[i];
    const saturacionItem = saturacionData[i];
    const picoFlujoItem = picoFlujoData[i];
    const calidadAireItem = calidadAire1Data[i];
    const actividadItem = actividadData[i];
    const hrvItem = hrvData[i];

    // Calcular eficiencia del sueño para este día (limitado a 1 decimal)
    const sleepEff = suenoItem ? ((suenoItem.profundo + suenoItem.rem) / suenoItem.duracion) * 100 : 0;

    return {
      fecha,
      // Correlación 1: Eficiencia del sueño y SpO2
      eficienciaSueno: parseFloat(sleepEff.toFixed(1)),
      spo2: saturacionItem.spo2,
      // Correlación 2: Pico de flujo y PM2.5
      picoFlujo: (picoFlujoItem.toma1 + picoFlujoItem.toma2 + picoFlujoItem.toma3) / 3,
      pm25: calidadAireItem.pm25,
      // Correlación 3: Eficiencia del sueño y minutos activos
      minutosActivos: actividadItem.movimiento,
      // Correlación 4: PM2.5 y HRV
      hrv: hrvItem.hrv,
    };
  });

  return {
    resumenData,
    correlacionData,
    calidadAire1Data,
    calidadAire2Data,
    cuestionarioData,
    cuestionarioHistorico,
    picoFlujoData,
    actividadData,
    suenoData,
    saturacionData,
    hrvData,
    pesajeData,
    correlacionesClinicas,
  };
};

// Interface para datos demográficos del paciente
export interface DemographicData {
  nombre: string;
  peso: number;
  altura: number;
  edad: number;
  genero: 'V' | 'M';
  ultimoCigarrillo: string;
  ingresoUltimoAno: string;
  disnea: 0 | 1 | 2 | 3 | 4;
  antibioticosUltimoAno: boolean;
  oxigenoterapia: boolean;
  fev1: number;
  hospital: string;
  nombreCuidadora: string;
  telCuidadora: string;
  nombreNeumo: string;
}

// Generar datos demográficos sintéticos basados en el ID del paciente
export const generateDemographicData = (patientId: string): DemographicData => {
  // Usar el ID del paciente como semilla para generar datos consistentes
  const seed = patientId.charCodeAt(patientId.length - 1);

  // Función para generar número aleatorio con semilla
  const seededRandom = (min: number, max: number, offset = 0) => {
    const x = Math.sin(seed * 9999 + offset) * 10000;
    return Math.floor(min + (x - Math.floor(x)) * (max - min));
  };

  // Generar género basado en la semilla
  const genero: 'V' | 'M' = seededRandom(0, 2, 10000) === 0 ? 'V' : 'M';

  // Listas para generar nombres aleatorios
  const nombresNeumo = [
    'Dr. García López',
    'Dra. Martínez Sánchez',
    'Dr. Rodríguez Pérez',
    'Dra. Fernández Torres',
    'Dr. González Ruiz',
    'Dra. López Navarro',
    'Dr. Hernández Castro',
    'Dra. Díaz Moreno'
  ];

  const nombresCuidadora = [
    'María González',
    'Carmen Martínez',
    'Ana López',
    'Isabel Rodríguez',
    'Rosa Fernández',
    'Pilar García',
    'Teresa Sánchez',
    'Dolores Pérez'
  ];

  const hospitales = [
    'Hospital General Universitario',
    'Hospital Clínico San Carlos',
    'Hospital La Paz',
    'Hospital Ramón y Cajal',
    'Hospital 12 de Octubre',
    'Hospital Gregorio Marañón',
    'Hospital Virgen del Rocío',
    'Hospital Vall d\'Hebron'
  ];

  const textosCigarrillo = [
    'Hace 5 años',
    'Hace 10 años',
    'Hace 2 años',
    'Nunca ha fumado',
    'Hace 15 años',
    'Hace 1 año',
    'Hace 20 años',
    'Hace 3 años'
  ];

  // Generar fecha de ingreso (último año)
  const diasAtras = seededRandom(30, 365, 10100);
  const fechaIngreso = new Date();
  fechaIngreso.setDate(fechaIngreso.getDate() - diasAtras);
  const ingresoUltimoAno = `${String(fechaIngreso.getDate()).padStart(2, '0')}/${String(fechaIngreso.getMonth() + 1).padStart(2, '0')}/${fechaIngreso.getFullYear()}`;

  // Generar teléfono
  const telCuidadora = `6${seededRandom(10, 99, 10200)}${seededRandom(100, 999, 10300)}${seededRandom(100, 999, 10400)}`;

  return {
    nombre: `Cicerone_UCA_${patientId}`,
    peso: seededRandom(60, 95, 10001), // Peso en kg
    altura: seededRandom(155, 185, 10002), // Altura en cm
    edad: seededRandom(45, 75, 10003), // Edad en años
    genero,
    ultimoCigarrillo: textosCigarrillo[seededRandom(0, textosCigarrillo.length, 10004)],
    ingresoUltimoAno,
    disnea: seededRandom(0, 5, 10005) as 0 | 1 | 2 | 3 | 4, // Nivel de disnea 0-4
    antibioticosUltimoAno: seededRandom(0, 2, 10006) === 1,
    oxigenoterapia: seededRandom(0, 2, 10007) === 1,
    fev1: seededRandom(45, 85, 10008) / 100, // FEV1 en porcentaje (0.45 - 0.85)
    hospital: hospitales[seededRandom(0, hospitales.length, 10009)],
    nombreCuidadora: nombresCuidadora[seededRandom(0, nombresCuidadora.length, 10010)],
    telCuidadora,
    nombreNeumo: nombresNeumo[seededRandom(0, nombresNeumo.length, 10011)],
  };
};

// Determinar número de días según el rango seleccionado
export const getDaysFromRange = (range: string) => {
  switch (range) {
    case '7dias': return 7;
    case '15dias': return 15;
    case '30dias': return 30;
    case 'todo': return 30;
    default: return 7;
  }
};
