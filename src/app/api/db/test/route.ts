import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { requireAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * GET /api/db/test
 * Prueba la conexión a la base de datos y muestra estadísticas básicas
 * REQUIERE AUTENTICACIÓN
 *
 * Para desarrollo local, puedes deshabilitar temporalmente la autenticación
 * cambiando process.env.NODE_ENV !== 'production'
 */
export async function GET(request: NextRequest) {
  // Requerir autenticación (solo en producción, en desarrollo es opcional)
  if (process.env.NODE_ENV === 'production') {
    const userId = await requireAuth(request);
    if (!userId) {
      return unauthorizedResponse();
    }
  }

  try {
    // Obtener contadores de las tablas principales
    const [usuarios] = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM usuario');
    const [telemonitorizaciones] = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM telemonitorizacion');
    const [actividades] = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM actividad');
    const [sleep] = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM sleep');
    const [pesajes] = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM pesaje');
    const [picoflujos] = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM picoflujo');
    const [calidadAire] = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM calidadaireinterior');
    const [cuestionarios] = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM cuestionario');
    const [sonidos] = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM sonidos');

    // Obtener algunos usuarios de ejemplo (solo primeros 3)
    const usuariosEjemplo = await executeQuery('SELECT id, nombre, edad, genero FROM usuario LIMIT 3');

    return NextResponse.json({
      success: true,
      message: 'Conexión a la base de datos exitosa',
      stats: {
        usuarios: usuarios.count,
        telemonitorizaciones: telemonitorizaciones.count,
        actividades: actividades.count,
        sleep: sleep.count,
        pesajes: pesajes.count,
        picoflujos: picoflujos.count,
        calidadAire: calidadAire.count,
        cuestionarios: cuestionarios.count,
        sonidos: sonidos.count
      },
      ejemploUsuarios: usuariosEjemplo
    });

  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al conectar con la base de datos',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
