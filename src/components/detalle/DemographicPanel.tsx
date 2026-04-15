'use client';

import { Usuario } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataField } from './ui/DataField';
import { formatValue, getDinsneaBadgeType, getFev1BadgeType } from '@/services/detalle/formatService';
import type { BadgeType } from './ui/Badge';

interface DemographicPanelProps {
  data: Usuario;
}

export default function DemographicPanel({ data }: DemographicPanelProps) {
  return (
    <div className="w-full h-full">
      <Card className="border shadow-sm lg:border-none lg:shadow-none max-h-[calc(100vh-8rem)] overflow-y-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Datos Demográficos</CardTitle>
          <CardDescription>Información del paciente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Información Básica */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Información Básica
            </h3>
            <div className="space-y-2.5">
              <DataField label="Nombre" value={formatValue(data.nombre)} />
              <DataField label="Edad" value={data.edad ? `${data.edad} años` : '(Sin Datos)'} />
              <DataField label="Género" value={data.genero ? (data.genero === 'V' ? 'Varón' : 'Mujer') : '(Sin Datos)'} />
              <DataField label="Peso" value={data.peso ? `${data.peso} kg` : '(Sin Datos)'} />
              <DataField label="Altura" value={data.altura ? `${data.altura} cm` : '(Sin Datos)'} />
            </div>
          </div>

          <div className="border-t pt-4" />

          {/* Datos Clínicos */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Datos Clínicos
            </h3>
            <div className="space-y-2.5">
              <DataField
                label="Disnea"
                value={data.disnea !== null && data.disnea !== undefined ? `Nivel ${data.disnea}` : '(Sin Datos)'}
                badge={data.disnea !== null && data.disnea !== undefined ? getDinsneaBadgeType(data.disnea) : undefined}
              />
              <DataField
                label="FEV1"
                value={data.fev1 !== null && data.fev1 !== undefined ? `${(data.fev1 * 100).toFixed(0)}%` : '(Sin Datos)'}
                badge={data.fev1 !== null && data.fev1 !== undefined ? getFev1BadgeType(data.fev1) : undefined}
              />
              <DataField
                label="Oxigenoterapia"
                value={data.oxigenoterapia !== null && data.oxigenoterapia !== undefined ? (data.oxigenoterapia ? 'Sí' : 'No') : '(Sin Datos)'}
                badge={data.oxigenoterapia !== null && data.oxigenoterapia !== undefined ? (data.oxigenoterapia ? 'warning' : 'success') : undefined}
              />
              <DataField
                label="Antibióticos Último Año"
                value={data.antibioticos_ultimo_ano !== null && data.antibioticos_ultimo_ano !== undefined ? (data.antibioticos_ultimo_ano ? 'Sí' : 'No') : '(Sin Datos)'}
                badge={data.antibioticos_ultimo_ano !== null && data.antibioticos_ultimo_ano !== undefined ? (data.antibioticos_ultimo_ano ? 'warning' : 'success') : undefined}
              />
              <DataField
                label="Último Cigarrillo"
                value={formatValue(data.ultimo_cigarrillo)}
              />
              <DataField
                label="Ingreso Último Año"
                value={data.ingreso_ultimo_ano !== null && data.ingreso_ultimo_ano !== undefined ? (data.ingreso_ultimo_ano ? 'Sí' : 'No') : '(Sin Datos)'}
              />
            </div>
          </div>

          <div className="border-t pt-4" />

          {/* Información del Hospital */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Hospital
            </h3>
            <div className="space-y-2.5">
              <DataField label="Centro" value={formatValue(data.hospital)} />
              <DataField label="Neumólogo" value={formatValue(data.nombre_neumo)} />
              <DataField label="Centro de Salud" value={formatValue(data.nombre_cs)} />
            </div>
          </div>

          <div className="border-t pt-4" />

          {/* Información del Cuidador */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Cuidador Principal
            </h3>
            <div className="space-y-2.5">
              <DataField label="Nombre" value={formatValue(data.nombre_cuidadora)} />
              <DataField label="Teléfono" value={formatValue(data.tel_cuidadora)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Components and utilities removed - now using shared UI components from ./ui/
// This follows the DRY (Don't Repeat Yourself) principle and improves maintainability
