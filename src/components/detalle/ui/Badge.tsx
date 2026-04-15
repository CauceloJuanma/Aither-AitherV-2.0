// Badge component following Single Responsibility Principle
// Only responsible for displaying status badges

import React from 'react';

export type BadgeType = 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  type: BadgeType;
  label?: string;
}

/**
 * Badge component for displaying status indicators
 * Follows SRP by only handling badge display logic
 */
export function Badge({ type, label }: BadgeProps) {
  const styles: Record<BadgeType, string> = {
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const defaultLabels: Record<BadgeType, string> = {
    success: 'Normal',
    warning: 'Precaución',
    danger: 'Alerta',
    info: 'Info',
  };

  const displayLabel = label ?? defaultLabels[type];

  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[type]}`}>
      {displayLabel}
    </span>
  );
}
