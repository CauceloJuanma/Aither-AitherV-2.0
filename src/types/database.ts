// Tipos para las tablas principales de la base de datos SQLite

export interface Usuario {
  id: number;
  nombre: string;
  peso: number;
  altura: number;
  edad: number;
  genero: string;
  ultimo_cigarrillo: number | null;
  incumplidor: number | null;
  ingreso_ultimo_ano: number | null;
  disnea: number | null;
  antibioticos_ultimo_ano: number | null;
  oxigenoterapia: number | null;
  fev1: number | null;
  hospital: string | null;
  nombre_cuidadora: string | null;
  tel_cuidadora: number | null;
  nombre_cs: string | null;
  nombre_neumo: string | null;
  token: string | null;
  refresh_token: string | null;
  [key: string]: unknown;
}

export interface Telemonitorizacion {
  id: number;
  fecha: string;
  usuario_id: number;
  [key: string]: unknown;
}

export interface Actividad {
  id: number;
  telemonitorizacion_id: number;
  activityCalories: number | null;
  caloriesBMR: number | null;
  caloriesOut: number | null;
  total_distance: number | null;
  veryActive_distance: number | null;
  moderatelyActive_distance: number | null;
  lightlyActive_distance: number | null;
  sedentaryActive_distance: number | null;
  fairlyActiveMinutes: number | null;
  floors: number | null;
  caloriesOut_fueraIntervalo: number | null;
  caloriesOut_minutes_fueraIntervalo: number | null;
  caloriesOut_quemaGrasas: number | null;
  caloriesOut_minutes_quemaGrasas: number | null;
  caloriesOut_zonaCardio: number | null;
  caloriesOut_minutes_zonaCardio: number | null;
  caloriesOut_zonaMaxima: number | null;
  caloriesOut_minutes_zonaMaxima: number | null;
  lightlyActiveMinutes: number | null;
  marginalCalories: number | null;
  restingHeartRate: number | null;
  sedentaryMinutes: number | null;
  steps: number | null;
  veryActiveMinutes: number | null;
  heart_file: string | null;
  activity_file: string | null;
  [key: string]: unknown;
}

export interface Sleep {
  id: number;
  telemonitorizacion_id: number;
  duration: number | null;
  efficiency: number | null;
  deep_count: number | null;
  deep_minutes: number | null;
  light_count: number | null;
  light_minutes: number | null;
  rem_count: number | null;
  rem_minutes: number | null;
  wake_count: number | null;
  wake_minutes: number | null;
  timeInBed: number | null;
  totalMinutesAsleep: number | null;
  totalTimeInBed: number | null;
  vo2Max: string | null;
  HRV_file: string | null;
  SpO2_file: string | null;
  awakeningsCount: number | null;
  average_breathing_rate: number | null;
  deepbreathing_rate: number | null;
  remgebreathing_rate: number | null;
  lightbreathing_rate: number | null;
  Sleep_File: string | null;
  tempSkinrelative: number | null;
  HRVdailyRmssd: number | null;
  HRVdeepRmssd: number | null;
  spo2: string | null;
  BR_file: string | null;
  [key: string]: unknown;
}

export interface Pesaje {
  id: number;
  peso: number;
  telemonitorizacion_id: number;
  [key: string]: unknown;
}

export interface Picoflujo {
  id: number;
  valor1: number;
  valor2: number | null;
  valor3: number | null;
  valormedio: number | null;
  telemonitorizacion_id: number;
  [key: string]: unknown;
}

export interface CalidadAireInterior {
  id: number;
  ppm1: number;
  ppm25: number;
  ppm4: number;
  ppm10: number;
  temp: number;
  hum: number;
  co2: number;
  voc: number;
  hora: string;
  telemonitorizacion_id: number;
  tos: number | null;
  [key: string]: unknown;
}

export interface Cuestionario {
  id: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  juego: string | null;
  telemonitorizacion_id: number;
  nombre_fichero: string | null;
  imagen: string | null;
  tiempo: number | null;
  Excentricidad: number | null;
  area_circle: number | null;
  circularidad: number | null;
  desviacion: number | null;
  suavidad: number | null;
  variabilidad_media: number | null;
  variabilidad_std: number | null;
  [key: string]: unknown;
}

export interface Sonidos {
  id: number;
  nombre_fichero_tos: string;
  nombre_fichero_frase: string;
  telemonitorizacion_id: number;
  duracion_frase: number | null;
  tasa_habla: number | null;
  pitch: number | null;
  shimmer: number | null;
  hnr: number | null;
  intensidad_promedio: number | null;
  numero_pausas: number | null;
  duracion_pausas_total: number | null;
  f0_min: number | null;
  f0_max: number | null;
  mfccs: string | null;
  variabilidad_tono: number | null;
  variabilidad_intensidad: number | null;
  variabilidad_ritmo: number | null;
  jitter: number | null;
  tos_duracion: number | null;
  tos_energia_rms_mean: number | null;
  tos_zcr_mean: number | null;
  tos_spectral_centroid_mean: number | null;
  tos_spectral_bandwidth_mean: number | null;
  tos_f0_mean: number | null;
  tos_f0_std: number | null;
  tos_hnr: number | null;
  tos_mfcc_mean_1: number | null;
  tos_mfcc_std_1: number | null;
  tos_mfcc_mean_2: number | null;
  tos_mfcc_std_2: number | null;
  tos_mfcc_mean_3: number | null;
  tos_mfcc_std_3: number | null;
  tos_mfcc_mean_4: number | null;
  tos_mfcc_std_4: number | null;
  tos_mfcc_mean_5: number | null;
  tos_mfcc_std_5: number | null;
  tos_mfcc_mean_6: number | null;
  tos_mfcc_std_6: number | null;
  tos_mfcc_mean_7: number | null;
  tos_mfcc_std_7: number | null;
  tos_mfcc_mean_8: number | null;
  tos_mfcc_std_8: number | null;
  tos_mfcc_mean_9: number | null;
  tos_mfcc_std_9: number | null;
  tos_mfcc_mean_10: number | null;
  tos_mfcc_std_10: number | null;
  tos_mfcc_mean_11: number | null;
  tos_mfcc_std_11: number | null;
  tos_mfcc_mean_12: number | null;
  tos_mfcc_std_12: number | null;
  tos_mfcc_mean_13: number | null;
  tos_mfcc_std_13: number | null;
  tos_tonnetz: number | null;
  tos_spectral_contrast: number | null;
  tos_spectral_flatness: number | null;
  tos_spectral_rolloff: number | null;
  [key: string]: unknown;
}

export interface Visitas {
  id: number;
  usuario_id: number;
  fecha: string;
}

// Tipo para datos completos de un usuario con telemonitorización
export interface UsuarioCompleto extends Usuario {
  telemonitorizaciones?: TelemonitorizacionCompleta[];
}

export interface TelemonitorizacionCompleta extends Telemonitorizacion {
  actividad?: Actividad;
  sleep?: Sleep;
  pesajes?: Pesaje[];
  picoflujos?: Picoflujo[];
  calidadAire?: CalidadAireInterior[];
  cuestionarios?: Cuestionario[];
  sonidos?: Sonidos[];
}
