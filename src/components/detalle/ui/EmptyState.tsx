// EmptyState component following Single Responsibility Principle
// Only responsible for displaying "no data available" states

import React from 'react';

export interface EmptyStateProps {
  /**
   * Icon/emoji to display (default: "📊")
   */
  icon?: string;

  /**
   * Message to display (default: "Sin datos disponibles")
   */
  message?: string;

  /**
   * Height of the container (default: 250px)
   */
  height?: number;

  /**
   * Additional description text
   */
  description?: string;
}

/**
 * EmptyState component for displaying "no data" messages
 *
 * Follows SRP by only handling empty state display
 *
 * @example
 * ```tsx
 * <EmptyState />
 * <EmptyState icon="🌡️" message="No hay datos de temperatura" />
 * <EmptyState height={300} description="Intenta seleccionar otro rango de fechas" />
 * ```
 */
export function EmptyState({
  icon = '📊',
  message = 'Sin datos disponibles',
  height = 250,
  description,
}: EmptyStateProps) {
  return (
    <div
      className="flex items-center justify-center text-gray-400 italic"
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <p className="text-lg mb-2">{icon}</p>
        <p className="text-sm font-medium">{message}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
