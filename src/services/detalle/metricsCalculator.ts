// Metrics calculation utilities following Single Responsibility Principle
// Only responsible for calculating metrics from data

/**
 * Calculate average of a numeric field from an array of objects
 * @param data Array of objects
 * @param key Key of the numeric field
 * @returns Average value, or 0 if no valid data
 */
export function calculateAverage(data: Record<string, unknown>[], key: string): number {
  if (!data || data.length === 0) return 0;

  const validValues = data
    .map((item) => item[key] as number)
    .filter((value): value is number => value !== null && value !== undefined && !isNaN(value));

  if (validValues.length === 0) return 0;

  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return sum / validValues.length;
}

/**
 * Calculate sum of a numeric field from an array of objects
 * @param data Array of objects
 * @param key Key of the numeric field
 * @returns Sum value, or 0 if no valid data
 */
export function calculateSum(data: Record<string, unknown>[], key: string): number {
  if (!data || data.length === 0) return 0;

  const validValues = data
    .map((item) => item[key] as number)
    .filter((value): value is number => value !== null && value !== undefined && !isNaN(value));

  return validValues.reduce((acc, val) => acc + val, 0);
}

/**
 * Get the most recent value from data
 * @param data Array of objects
 * @param key Key of the field
 * @returns Most recent value, or 0 if no data
 */
export function getLatestValue(data: Record<string, unknown>[], key: string): number {
  if (!data || data.length === 0) return 0;

  const latestItem = data[data.length - 1];
  const value = latestItem[key] as number;

  return value !== null && value !== undefined && !isNaN(value) ? value : 0;
}

/**
 * Calculate min value of a numeric field from an array of objects
 * @param data Array of objects
 * @param key Key of the numeric field
 * @returns Min value, or 0 if no valid data
 */
export function calculateMin(data: Record<string, unknown>[], key: string): number {
  if (!data || data.length === 0) return 0;

  const validValues = data
    .map((item) => item[key] as number)
    .filter((value): value is number => value !== null && value !== undefined && !isNaN(value));

  if (validValues.length === 0) return 0;

  return Math.min(...validValues);
}

/**
 * Calculate max value of a numeric field from an array of objects
 * @param data Array of objects
 * @param key Key of the numeric field
 * @returns Max value, or 0 if no valid data
 */
export function calculateMax(data: Record<string, unknown>[], key: string): number {
  if (!data || data.length === 0) return 0;

  const validValues = data
    .map((item) => item[key] as number)
    .filter((value): value is number => value !== null && value !== undefined && !isNaN(value));

  if (validValues.length === 0) return 0;

  return Math.max(...validValues);
}

/**
 * Calculate multiple averages at once
 * @param data Array of objects
 * @param keys Array of keys to calculate averages for
 * @returns Object with averages for each key
 */
export function calculateMultipleAverages(
  data: Record<string, unknown>[],
  keys: string[]
): Record<string, number> {
  const result: Record<string, number> = {};

  keys.forEach((key) => {
    result[key] = calculateAverage(data, key);
  });

  return result;
}

/**
 * Round a number to specified decimal places
 * @param value Number to round
 * @param decimals Number of decimal places
 * @returns Rounded number
 */
export function roundToDecimals(value: number, decimals: number = 0): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}
