import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeQueryOne } from '@/lib/database';
import type { Usuario, Telemonitorizacion, Actividad, Sleep, Pesaje, Picoflujo, CalidadAireInterior, Cuestionario, Sonidos } from '@/types/database';
import { requireAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * GET /api/db/usuarios/[id]
 * Obtiene un usuario específico con sus datos de telemonitorización
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

    // Obtener usuario
    const usuario = await executeQueryOne<Usuario>('SELECT * FROM usuario WHERE id = ?', [id]);

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener telemonitorizaciones del usuario
    const telemonitorizaciones = await executeQuery<Telemonitorizacion>(
      'SELECT * FROM telemonitorizacion WHERE usuario_id = ? ORDER BY fecha DESC',
      [id]
    );

    // Si no hay telemonitorizaciones, retornar usuario sin datos
    if (telemonitorizaciones.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          ...usuario,
          telemonitorizaciones: []
        }
      });
    }

    // Obtener todos los IDs de telemonitorizaciones
    const teleIds = telemonitorizaciones.map(t => t.id);
    const placeholders = teleIds.map(() => '?').join(',');

    // OPTIMIZACIÓN: Hacer queries batch con IN en lugar de queries individuales
    // Esto reduce de ~240 queries a solo 7 queries (una por tabla)
    const [
      todasActividades,
      todosSleeps,
      todosPesajes,
      todosPicoflujos,
      todaCalidadAire,
      todosCuestionarios,
      todosSonidos
    ] = await Promise.all([
      executeQuery<Actividad>(
        `SELECT * FROM actividad WHERE telemonitorizacion_id IN (${placeholders})`,
        teleIds
      ),
      executeQuery<Sleep>(
        `SELECT * FROM sleep WHERE telemonitorizacion_id IN (${placeholders})`,
        teleIds
      ),
      executeQuery<Pesaje>(
        `SELECT * FROM pesaje WHERE telemonitorizacion_id IN (${placeholders})`,
        teleIds
      ),
      executeQuery<Picoflujo>(
        `SELECT * FROM picoflujo WHERE telemonitorizacion_id IN (${placeholders})`,
        teleIds
      ),
      executeQuery<CalidadAireInterior>(
        `SELECT * FROM calidadaireinterior WHERE telemonitorizacion_id IN (${placeholders})`,
        teleIds
      ),
      executeQuery<Cuestionario>(
        `SELECT * FROM cuestionario WHERE telemonitorizacion_id IN (${placeholders})`,
        teleIds
      ),
      executeQuery<Sonidos>(
        `SELECT * FROM sonidos WHERE telemonitorizacion_id IN (${placeholders})`,
        teleIds
      )
    ]);

    // Crear mapas para búsqueda rápida O(1) en lugar de O(n)
    const actividadesPorTele = new Map<number, Actividad>();
    todasActividades.forEach(a => {
      if ('telemonitorizacion_id' in a) {
        actividadesPorTele.set(a.telemonitorizacion_id as number, a);
      }
    });

    const sleepsPorTele = new Map<number, Sleep>();
    todosSleeps.forEach(s => {
      if ('telemonitorizacion_id' in s) {
        sleepsPorTele.set(s.telemonitorizacion_id as number, s);
      }
    });

    const pesajesPorTele = new Map<number, Pesaje[]>();
    todosPesajes.forEach(p => {
      if ('telemonitorizacion_id' in p) {
        const teleId = p.telemonitorizacion_id as number;
        if (!pesajesPorTele.has(teleId)) {
          pesajesPorTele.set(teleId, []);
        }
        pesajesPorTele.get(teleId)!.push(p);
      }
    });

    const picoflujosPorTele = new Map<number, Picoflujo[]>();
    todosPicoflujos.forEach(p => {
      if ('telemonitorizacion_id' in p) {
        const teleId = p.telemonitorizacion_id as number;
        if (!picoflujosPorTele.has(teleId)) {
          picoflujosPorTele.set(teleId, []);
        }
        picoflujosPorTele.get(teleId)!.push(p);
      }
    });

    const calidadAirePorTele = new Map<number, CalidadAireInterior[]>();
    todaCalidadAire.forEach(c => {
      if ('telemonitorizacion_id' in c) {
        const teleId = c.telemonitorizacion_id as number;
        if (!calidadAirePorTele.has(teleId)) {
          calidadAirePorTele.set(teleId, []);
        }
        calidadAirePorTele.get(teleId)!.push(c);
      }
    });

    const cuestionariosPorTele = new Map<number, Cuestionario[]>();
    todosCuestionarios.forEach(c => {
      if ('telemonitorizacion_id' in c) {
        const teleId = c.telemonitorizacion_id as number;
        if (!cuestionariosPorTele.has(teleId)) {
          cuestionariosPorTele.set(teleId, []);
        }
        cuestionariosPorTele.get(teleId)!.push(c);
      }
    });

    const sonidosPorTele = new Map<number, Sonidos[]>();
    todosSonidos.forEach(s => {
      if ('telemonitorizacion_id' in s) {
        const teleId = s.telemonitorizacion_id as number;
        if (!sonidosPorTele.has(teleId)) {
          sonidosPorTele.set(teleId, []);
        }
        sonidosPorTele.get(teleId)!.push(s);
      }
    });

    // Combinar datos usando los mapas (O(n) en lugar de O(n²))
    const telemonitorizacionesCompletas = telemonitorizaciones.map(tele => ({
      ...tele,
      actividad: actividadesPorTele.get(tele.id),
      sleep: sleepsPorTele.get(tele.id),
      pesajes: pesajesPorTele.get(tele.id) || [],
      picoflujos: picoflujosPorTele.get(tele.id) || [],
      calidadAire: calidadAirePorTele.get(tele.id) || [],
      cuestionarios: cuestionariosPorTele.get(tele.id) || [],
      sonidos: sonidosPorTele.get(tele.id) || []
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...usuario,
        telemonitorizaciones: telemonitorizacionesCompletas
      }
    });

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener datos del usuario',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
