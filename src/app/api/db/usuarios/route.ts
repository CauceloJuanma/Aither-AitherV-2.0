import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import type { Usuario } from '@/types/database';
import { requireAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * GET /api/db/usuarios
 * Obtiene la lista de todos los usuarios
 * REQUIERE AUTENTICACIÓN
 */
export async function GET(request: NextRequest) {
  // Verificar autenticación
  const userId = await requireAuth(request);
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    // Consulta simple para obtener todos los usuarios
    const usuarios = await executeQuery<Usuario>('SELECT * FROM usuario');

    return NextResponse.json({
      success: true,
      data: usuarios,
      count: usuarios.length
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener usuarios',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
