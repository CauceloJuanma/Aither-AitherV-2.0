import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

/**
 * Endpoint para eliminar usuarios no autorizados de Firebase Auth
 * Se usa cuando un usuario intenta login con Google pero no está en la whitelist
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid } = body;

    if (!uid) {
      return NextResponse.json(
        { error: 'UID es requerido' },
        { status: 400 }
      );
    }

    // Eliminar usuario de Firebase Auth usando Admin SDK
    const adminAuth = getAdminAuth();

    try {
      await adminAuth.deleteUser(uid);
      console.log(`✓ Usuario no autorizado eliminado de Firebase Auth: ${uid}`);

      return NextResponse.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (authError: unknown) {
      const errorCode = authError && typeof authError === 'object' && 'code' in authError ? (authError as { code: string }).code : '';
      if (errorCode === 'auth/user-not-found') {
        // El usuario ya no existe, está bien
        return NextResponse.json({
          success: true,
          message: 'Usuario ya no existe en Firebase Auth'
        });
      }
      throw authError;
    }
  } catch (error: unknown) {
    console.error('Error eliminando usuario no autorizado:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al eliminar usuario: ' + errorMessage },
      { status: 500 }
    );
  }
}
