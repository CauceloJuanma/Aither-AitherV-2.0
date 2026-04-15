// InfoCard component following Single Responsibility Principle
// Only responsible for displaying informational messages

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface InfoCardProps {
  /**
   * Card title
   */
  title: string;

  /**
   * Icon/emoji to display with title
   */
  icon?: string;

  /**
   * Main description text
   */
  description: string;

  /**
   * Background color class (default: 'bg-blue-50')
   */
  bgColor?: string;

  /**
   * Border color class (default: 'border-blue-200')
   */
  borderColor?: string;

  /**
   * Icon color class (default: 'text-blue-600')
   */
  iconColor?: string;
}

/**
 * InfoCard component for displaying informational descriptions
 *
 * Follows SRP by only handling informational card display
 *
 * @example
 * ```tsx
 * <InfoCard
 *   title="Calidad del Aire Interior"
 *   icon="🌬️"
 *   description="Monitoreo completo de contaminantes del aire..."
 *   bgColor="bg-cyan-50"
 *   borderColor="border-cyan-200"
 *   iconColor="text-cyan-600"
 * />
 * ```
 */
export function InfoCard({
  title,
  icon,
  description,
  bgColor = 'bg-blue-50',
  borderColor = 'border-blue-200',
  iconColor = 'text-blue-600',
}: InfoCardProps) {
  return (
    <Card className={`${bgColor} ${borderColor}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon && <span className={iconColor}>{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
