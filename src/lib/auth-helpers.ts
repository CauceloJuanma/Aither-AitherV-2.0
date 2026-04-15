import { NextRequest } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

/**
 * Verifica que la solicitud tenga un token de autenticación válido
 * Retorna el UID del usuario si el token es válido, null si no
 */
export async function verifyAuthToken(request: NextRequest): Promise<string | null> {
  try {
    // Obtener el token del header Authorization
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];

    // Verificar el token con Firebase Admin
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);

    return decodedToken.uid;
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}

/**
 * Respuesta de error de autenticación
 */
export function unauthorizedResponse() {
  return Response.json(
    {
      success: false,
      error: 'No autorizado',
      message: 'Debes iniciar sesión para acceder a este recurso'
    },
    { status: 401 }
  );
}

/**
 * Middleware helper para proteger rutas de API
 * Uso:
 *
 * export async function GET(request: NextRequest) {
 *   const userId = await requireAuth(request);
 *   if (!userId) return unauthorizedResponse();
 *
 *   // Tu lógica aquí...
 * }
 */
export async function requireAuth(request: NextRequest): Promise<string | null> {
  return await verifyAuthToken(request);
}
