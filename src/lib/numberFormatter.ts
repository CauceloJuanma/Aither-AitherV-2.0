/**
 * Utility functions for formatting numbers in charts and displays
 */

/**
 * Formats a number for display in chart labels
 * - Numbers >= 100: no decimals
 * - Numbers >= 10: 1 decimal
 * - Numbers < 10: 2 decimals
 *
 * @param value - The number to format
 * @returns Formatted string with appropriate decimal places
 */
export function formatChartNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const absValue = Math.abs(value);

  if (absValue >= 100) {
    return value.toFixed(0);
  } else if (absValue >= 10) {
    return value.toFixed(1);
  } else {
    return value.toFixed(2);
  }
}

/**
 * Formats a number with a maximum of 2 decimal places
 * Removes trailing zeros
 *
 * @param value - The number to format
 * @returns Formatted string
 */
export function formatNumber2Decimals(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return parseFloat(value.toFixed(2)).toString();
}

/**
 * Formats a number with a maximum of 3 decimal places
 * Removes trailing zeros
 *
 * @param value - The number to format
 * @returns Formatted string
 */
export function formatNumber3Decimals(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return parseFloat(value.toFixed(3)).toString();
}

/**
 * Formats a percentage with 1 decimal place
 *
 * @param value - The number to format
 * @returns Formatted string with % symbol
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return `${value.toFixed(1)}%`;
}

/**
 * Creates a tooltip formatter with a specific unit
 *
 * @param unit - The unit to append (e.g., 'bpm', 'ms', 'h', '%')
 * @returns A formatter function for tooltips
 */
export function createFormatterWithUnit(unit: string): (value: unknown) => string {
  return (value: unknown): string => {
    if (typeof value === 'number') {
      return `${formatChartNumber(value)} ${unit}`;
    }
    return String(value);
  };
}
