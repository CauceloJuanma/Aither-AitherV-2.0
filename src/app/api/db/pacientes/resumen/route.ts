import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import type { Usuario, Telemonitorizacion, Actividad, Sleep, Picoflujo } from '@/types/database';
import { requireAuth, unauthorizedResponse } from '@/lib/auth-helpers';

interface ResumenPaciente {
  id: number;
  nombre: string;
  edad: number;
  genero: string;
  peso: number;
  altura: number;
  resumenData: {
    fecha: string;
    pasos: number;
    minutos: number;
    calorias: number;
    spo2: number | null;
    picoFlujo: number | null;
  }[];
  suenoData: {
    fecha: string;
    duracion: number;
    profundo: number;
    rem: number;
    ligero: number;
  }[];
}

/**
 * GET /api/db/pacientes/resumen
 * Obtiene todos los pacientes con sus datos de actividad y sueño resumidos
 * REQUIERE AUTENTICACIÓN
 */
export async function GET(request: NextRequest) {
  // Verificar autenticación
  const userId = await requireAuth(request);
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    // OPTIMIZACIÓN: Obtener todos los datos en batch
    const usuarios = await executeQuery<Usuario>('SELECT * FROM usuario ORDER BY id');

    if (usuarios.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      });
    }

    // Obtener IDs de usuarios
    const usuarioIds = usuarios.map(u => u.id);
    const usuarioPlaceholders = usuarioIds.map(() => '?').join(',');

    // Query 1: Obtener TODAS las telemonitorizaciones de todos los usuarios
    const todasTelemonitorizaciones = await executeQuery<Telemonitorizacion>(
      `SELECT * FROM telemonitorizacion WHERE usuario_id IN (${usuarioPlaceholders}) ORDER BY usuario_id, fecha ASC`,
      usuarioIds
    );

    if (todasTelemonitorizaciones.length === 0) {
      // Retornar usuarios sin telemonitorizaciones
      const pacientesVacios = usuarios.map(usuario => ({
        id: usuario.id,
        nombre: usuario.nombre || 'Sin nombre',
        edad: usuario.edad,
        genero: usuario.genero,
        peso: usuario.peso,
        altura: usuario.altura,
        resumenData: [],
        suenoData: []
      }));

      return NextResponse.json({
        success: true,
        data: pacientesVacios,
        count: pacientesVacios.length
      });
    }

    // Obtener IDs de telemonitorizaciones
    const teleIds = todasTelemonitorizaciones.map(t => t.id);
    const telePlaceholders = teleIds.map(() => '?').join(',');

    // Query batch: Obtener TODOS los datos relacionados en paralelo
    // Esto reduce de ~1200+ queries a solo 4 queries
    const [
      todasActividades,
      todosSleeps,
      todosPicoflujos
    ] = await Promise.all([
      executeQuery<Actividad>(
        `SELECT * FROM actividad WHERE telemonitorizacion_id IN (${telePlaceholders})`,
        teleIds
      ),
      executeQuery<Sleep>(
        `SELECT * FROM sleep WHERE telemonitorizacion_id IN (${telePlaceholders})`,
        teleIds
      ),
      executeQuery<Picoflujo>(
        `SELECT * FROM picoflujo WHERE telemonitorizacion_id IN (${telePlaceholders})`,
        teleIds
      )
    ]);

    // Crear mapas para búsqueda rápida O(1)
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

    const picoflujosPorTele = new Map<number, Picoflujo>();
    todosPicoflujos.forEach(p => {
      if ('telemonitorizacion_id' in p) {
        picoflujosPorTele.set(p.telemonitorizacion_id as number, p);
      }
    });

    // Agrupar telemonitorizaciones por usuario
    const telesPorUsuario = new Map<number, Telemonitorizacion[]>();
    todasTelemonitorizaciones.forEach(tele => {
      if (!telesPorUsuario.has(tele.usuario_id)) {
        telesPorUsuario.set(tele.usuario_id, []);
      }
      telesPorUsuario.get(tele.usuario_id)!.push(tele);
    });

    // Función helper para parsear SpO2 (movida fuera del loop)
    const parseSpo2 = (sleep: Sleep | undefined): number | null => {
      if (!sleep?.spo2) return null;

      try {
        let spo2Data;

        if (typeof sleep.spo2 === 'string') {
          if (sleep.spo2.includes(';')) {
            spo2Data = sleep.spo2
              .split(';')
              .map((val: string) => parseFloat(val.trim()))
              .filter((val: number) => !isNaN(val) && val > 0);
          } else if (sleep.spo2.trim().startsWith('[') || sleep.spo2.trim().startsWith('{')) {
            spo2Data = JSON.parse(sleep.spo2);
          } else {
            const singleValue = parseFloat(sleep.spo2);
            if (!isNaN(singleValue)) {
              spo2Data = singleValue;
            }
          }
        } else if (typeof sleep.spo2 === 'number') {
          spo2Data = sleep.spo2;
        } else {
          spo2Data = sleep.spo2;
        }

        if (Array.isArray(spo2Data) && spo2Data.length > 0) {
          const validValues = spo2Data
            .map((item: unknown) => typeof item === 'object' && item !== null && 'value' in item ? (item as { value: unknown }).value : item)
            .filter((val: unknown): val is number => typeof val === 'number' && val > 0);
          if (validValues.length > 0) {
            return validValues.reduce((sum: number, val: number) => sum + val, 0) / validValues.length;
          }
        } else if (typeof spo2Data === 'number') {
          return spo2Data;
        }
      } catch (e) {
        console.error('Error parsing SpO2 data:', e);
      }

      return null;
    };

    // Construir resumen para cada paciente usando los mapas
    const pacientesResumen: ResumenPaciente[] = usuarios.map(usuario => {
      const telemonitorizaciones = telesPorUsuario.get(usuario.id) || [];

      const resumenData = telemonitorizaciones.map(tele => {
        const actividad = actividadesPorTele.get(tele.id);
        const sleep = sleepsPorTele.get(tele.id);
        const picoflujo = picoflujosPorTele.get(tele.id);

        return {
          fecha: tele.fecha,
          pasos: actividad?.steps || 0,
          minutos: (actividad?.fairlyActiveMinutes || 0) +
                   (actividad?.lightlyActiveMinutes || 0) +
                   (actividad?.veryActiveMinutes || 0),
          calorias: actividad?.caloriesOut || 0,
          spo2: parseSpo2(sleep),
          picoFlujo: picoflujo?.valormedio || null
        };
      });

      const suenoData = telemonitorizaciones.map(tele => {
        const sleep = sleepsPorTele.get(tele.id);

        return {
          fecha: tele.fecha,
          duracion: (sleep?.totalMinutesAsleep || 0) / 60,
          profundo: (sleep?.deep_minutes || 0) / 60,
          rem: (sleep?.rem_minutes || 0) / 60,
          ligero: (sleep?.light_minutes || 0) / 60
        };
      });

      return {
        id: usuario.id,
        nombre: usuario.nombre || 'Sin nombre',
        edad: usuario.edad,
        genero: usuario.genero,
        peso: usuario.peso,
        altura: usuario.altura,
        resumenData,
        suenoData
      };
    });

    return NextResponse.json({
      success: true,
      data: pacientesResumen,
      count: pacientesResumen.length
    });

  } catch (error) {
    console.error('Error al obtener resumen de pacientes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener resumen de pacientes',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
