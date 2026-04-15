// Format service following Single Responsibility Principle
// Only responsible for formatting values for display

/**
 * Formats a value with fallback for null/undefined/empty values
 * @param value Value to format
 * @param fallback Fallback string if value is empty
 * @returns Formatted string
 */
export function formatValue(value: unknown, fallback: string = '(Sin Datos)'): string {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return String(value);
}

/**
 * Checks if a value has valid data (not null, undefined, NaN, or 0)
 * @param value Value to check
 * @returns true if value has valid data
 */
export function hasValidData(value: number | null | undefined): boolean {
  return value !== null && value !== undefined && !isNaN(value) && value !== 0;
}

/**
 * Formats a numeric value with decimals and unit
 * @param value Numeric value
 * @param unit Unit string
 * @param decimals Number of decimal places
 * @param fallback Fallback string if value is invalid
 * @returns Formatted string
 */
export function formatNumericValue(
  value: number | null | undefined,
  unit: string = '',
  decimals: number = 0,
  fallback: string = '(Sin Datos)'
): string {
  if (!hasValidData(value)) {
    return fallback;
  }
  return `${value!.toFixed(decimals)}${unit}`;
}

/**
 * Gets badge type based on disnea level
 * @param disnea Disnea value (0-5)
 * @returns Badge type
 */
export function getDinsneaBadgeType(disnea: number): 'success' | 'warning' | 'danger' {
  if (disnea <= 1) return 'success';
  if (disnea <= 3) return 'warning';
  return 'danger';
}

/**
 * Gets badge type based on FEV1 value
 * @param fev1 FEV1 value (0-1, where 1 = 100%)
 * @returns Badge type
 */
export function getFev1BadgeType(fev1: number): 'success' | 'warning' | 'danger' {
  if (fev1 >= 0.7) return 'success'; // >= 70%
  if (fev1 >= 0.5) return 'warning'; // 50-69%
  return 'danger'; // < 50%
}

/**
 * Format service interface for dependency injection
 */
export interface IFormatService {
  formatValue(value: unknown, fallback?: string): string;
  hasValidData(value: number | null | undefined): boolean;
  formatNumericValue(
    value: number | null | undefined,
    unit?: string,
    decimals?: number,
    fallback?: string
  ): string;
  getDinsneaBadgeType(disnea: number): 'success' | 'warning' | 'danger';
  getFev1BadgeType(fev1: number): 'success' | 'warning' | 'danger';
}

/**
 * Default format service implementation
 */
export const FormatService: IFormatService = {
  formatValue,
  hasValidData,
  formatNumericValue,
  getDinsneaBadgeType,
  getFev1BadgeType,
};
