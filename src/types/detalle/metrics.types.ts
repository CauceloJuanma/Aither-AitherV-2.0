// Types for patient metrics following SOLID principles
// This provides a contract (Dependency Inversion Principle)

export interface MetricThreshold {
  min?: number;
  max?: number;
  good?: number;
  warning?: number;
}

export interface ChartDataPoint {
  fecha: string;
  [key: string]: string | number | undefined;
}

export interface AirQualityData extends ChartDataPoint {
  pm1: number;
  pm25: number;
  pm4: number;
  pm10: number;
  co2: number;
  voc: number;
  temperatura: number;
  humedad: number;
}

export interface SleepData extends ChartDataPoint {
  duracion: number;
  profundo: number;
  rem: number;
  ligero: number;
  despertares: number;
  timeInBed: number;
  average_breathing_rate: number;
  HRVdailyRmssd: number;
}

export interface ActivityData extends ChartDataPoint {
  pasos: number;
  minutos: number;
  calorias: number;
  distancia: number;
  restingHeartRate: number;
}

export interface PeakFlowData extends ChartDataPoint {
  toma1: number;
  toma2?: number;
  toma3?: number;
}

export interface SaturationData extends ChartDataPoint {
  spo2: number;
}

export interface QuestionnaireData extends ChartDataPoint {
  disnea: number;
  tos: number;
  expectoracion: number;
  sibilancias: number;
  dolorPecho: number;
}

export interface MetricSummary {
  value: number;
  label: string;
  unit: string;
  decimals?: number;
  threshold?: MetricThreshold;
  status?: 'good' | 'warning' | 'danger';
}

export interface ExportData {
  patientId: string;
  period: string;
  dateRange: string;
  data: Record<string, unknown>;
}

export interface DateRangeConfig {
  minDate?: string;
  maxDate?: string;
  range: '7dias' | '15dias' | '30dias' | 'todo' | 'custom';
  customStart?: string;
  customEnd?: string;
}
