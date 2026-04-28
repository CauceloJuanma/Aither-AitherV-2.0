import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import type { Visitas } from '@/types/database';
import { requireAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * GET /api/db/usuarios/[id]/visitas
 * Obtiene todas las visitas hospitalarias de un usuario específico
 * REQUIERE AUTENTICACIÓN
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar autenticación
  const userId = await requireAuth(request);
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;

    // Obtener todas las visitas del usuario
    const visitas = await executeQuery<Visitas>(
      'SELECT * FROM visitas WHERE usuario_id = ? ORDER BY fecha DESC',
      [id]
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
        error: 'Error al obtener visitas del usuario',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}