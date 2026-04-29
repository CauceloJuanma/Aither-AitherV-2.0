import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import type { Visitas } from '@/types/database';
import { requireAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * GET /api/db/visitas
 * Obtiene todas las visitas hospitalarias
 * REQUIERE AUTENTICACIÓN
 */
export async function GET(
  request: NextRequest,
) {
  // Verificar autenticación
  const userId = await requireAuth(request);
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    // Obtener todas las visitas
    const visitas = await executeQuery<Visitas>(
      'SELECT * FROM visitas ORDER BY fecha DESC',
    );

    return NextResponse.json({
      success: true,
      data: visitas
    });

  } catch (error) {
    console.error('Error al obtener visitas:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener visitas a las consultas',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}