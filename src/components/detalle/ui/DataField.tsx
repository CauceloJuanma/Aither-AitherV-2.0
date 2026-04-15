// DataField component following Single Responsibility Principle
// Only responsible for displaying a label-value pair

import React from 'react';
import { Badge, BadgeType } from './Badge';

export interface DataFieldProps {
  label: string;
  value: string;
  badge?: BadgeType;
}

/**
 * DataField component for displaying labeled data
 * Follows SRP by only handling the display of a single data field
 */
export function DataField({ label, value, badge }: DataFieldProps) {
  const isEmptyData = value === '(Sin Datos)';

  return (
    <div className="flex flex-col space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${isEmptyData ? 'text-gray-400 italic' : ''}`}>
          {value}
        </span>
        {badge && !isEmptyData && <Badge type={badge} />}
      </div>
    </div>
  );
}
