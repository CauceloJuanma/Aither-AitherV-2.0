// Constants for metrics and thresholds following Single Responsibility Principle
// Only responsible for defining configuration values

/**
 * Air Quality Limits (µg/m³ for particulates, ppm for CO2, ppb for VOC)
 */
export const AIR_QUALITY_LIMITS = {
  PM1: 15,
  PM25: 25,
  PM4: 30,
  PM10: 50,
  CO2: 1000,  // ppm
  VOC: 400,   // ppb
} as const;

/**
 * Vital Signs Normal Ranges
 */
export const VITAL_SIGNS_RANGES = {
  // Oxygen Saturation (SpO2) - percentage
  SPO2: {
    MIN: 95,
    OPTIMAL: 95,
  },

  // Resting Heart Rate - bpm
  RESTING_HEART_RATE: {
    MIN: 60,
    MAX: 100,
  },

  // Breathing Rate - respirations per minute
  BREATHING_RATE: {
    MIN: 12,
    MAX: 20,
  },

  // HRV (Heart Rate Variability) - milliseconds
  HRV: {
    HEALTHY_MIN: 20,
  },

  // Sleep Time - hours
  SLEEP_TIME: {
    MIN: 7,
    MAX: 9,
  },

  // Sleep Efficiency - percentage
  SLEEP_EFFICIENCY: {
    OPTIMAL: 40, // Deep + REM sleep
  },
} as const;

/**
 * Respiratory Function Thresholds
 */
export const RESPIRATORY_THRESHOLDS = {
  // Peak Flow - L/min
  PEAK_FLOW: {
    NORMAL_MIN: 350,
    NORMAL_MAX: 420,
  },

  // FEV1 (Forced Expiratory Volume) - decimal (0-1, where 1 = 100%)
  FEV1: {
    NORMAL: 0.7,      // >= 70%
    MODERATE: 0.5,    // 50-69%
    // < 50% is severe
  },

  // Disnea Level - scale 1-5
  DISNEA: {
    MILD: 1,
    MODERATE: 3,
    // > 3 is severe
  },
} as const;

/**
 * Activity Thresholds
 */
export const ACTIVITY_THRESHOLDS = {
  // Daily Steps
  STEPS: {
    GOAL: 10000,
  },
} as const;

/**
 * Chart Y-Axis Domains (for consistent visualization)
 */
export const CHART_DOMAINS = {
  SPO2: [90, 100],
  PEAK_FLOW: [300, 450],
  PM25: [0, 35],
  PM10: [0, 60],
  CO2: [350, 1100],
  VOC: [0, 500],
} as const;

/**
 * Color Schemes for Status Indicators
 */
export const STATUS_COLORS = {
  SUCCESS: {
    bg: 'bg-green-500',
    text: 'text-green-600',
    stroke: '#10b981',
  },
  WARNING: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-600',
    stroke: '#f59e0b',
  },
  DANGER: {
    bg: 'bg-red-500',
    text: 'text-red-600',
    stroke: '#ef4444',
  },
  INFO: {
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    stroke: '#3b82f6',
  },
  GRAY: {
    bg: 'bg-gray-400',
    text: 'text-gray-400',
    stroke: '#9ca3af',
  },
} as const;

/**
 * Date Range Presets
 */
export const DATE_RANGES = {
  SEVEN_DAYS: '7dias',
  FIFTEEN_DAYS: '15dias',
  THIRTY_DAYS: '30dias',
  ALL: 'todo',
  CUSTOM: 'custom',
} as const;

/**
 * Helper function to get status color based on value and threshold
 */
export function getStatusColor(
  value: number,
  threshold: { min?: number; max?: number; good?: number; warning?: number }
): keyof typeof STATUS_COLORS {
  if (threshold.good !== undefined) {
    if (threshold.warning !== undefined) {
      // Has 3 levels: good, warning, danger
      if (value >= threshold.good) return 'SUCCESS';
      if (value >= threshold.warning) return 'WARNING';
      return 'DANGER';
    } else {
      // Only 2 levels: good or warning
      return value >= threshold.good ? 'SUCCESS' : 'WARNING';
    }
  } else if (threshold.min !== undefined && threshold.max !== undefined) {
    // Range-based
    return value >= threshold.min && value <= threshold.max ? 'SUCCESS' : 'WARNING';
  } else if (threshold.max !== undefined) {
    // Max threshold (lower is better)
    return value <= threshold.max ? 'SUCCESS' : 'DANGER';
  } else if (threshold.min !== undefined) {
    // Min threshold (higher is better)
    return value >= threshold.min ? 'SUCCESS' : 'DANGER';
  }

  return 'INFO';
}

/**
 * Helper to check if a pollutant exceeds its limit
 */
export function exceedsLimit(value: number, limit: number): boolean {
  return value > limit;
}

/**
 * Helper to calculate deviation percentage from average
 */
export function calculateDeviation(current: number, average: number): number {
  if (average === 0) return 0;
  return ((current - average) / average) * 100;
}
