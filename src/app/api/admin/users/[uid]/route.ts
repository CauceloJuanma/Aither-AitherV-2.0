import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Verificar que el usuario que hace la petición es administrador
async function verifyAdmin(authToken: string | null) {
  if (!authToken) {
    return { isAdmin: false, error: 'No se proporcionó token de autenticación' };
  }

  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(authToken);

    // Obtener el documento del usuario en Firestore
    const adminFirestore = getAdminFirestore();
    const userDoc = await adminFirestore.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return { isAdmin: false, error: 'Usuario no encontrado' };
    }

    const userData = userDoc.data();
    if (userData?.role !== 'admin') {
      return { isAdmin: false, error: 'Permisos insuficientes' };
    }

    return { isAdmin: true, uid: decodedToken.uid };
  } catch (error) {
    console.error('Error verifying admin:', error);
    return { isAdmin: false, error: 'Token inválido' };
  }
}

// PATCH - Actualizar usuario existente
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    // Verificar que el usuario es admin
    const verification = await verifyAdmin(token);
    if (!verification.isAdmin) {
      return NextResponse.json(
        { error: verification.error },
        { status: 403 }
      );
    }

    const { uid } = await params;
    const body = await request.json();
    const { displayName, role } = body;

    if (!uid) {
      return NextResponse.json(
        { error: 'UID de usuario requerido' },
        { status: 400 }
      );
    }

    const adminFirestore = getAdminFirestore();

    // Obtener el documento actual del usuario
    const userDoc = await adminFirestore.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Preparar datos a actualizar
    const updateData: {
      updatedAt: typeof Timestamp.prototype;
      displayName?: string;
      role?: string;
    } = {
      updatedAt: Timestamp.now(),
    };

    if (displayName !== undefined) {
      updateData.displayName = displayName;
    }

    if (role !== undefined) {
      updateData.role = role;
    }

    // Actualizar el documento en Firestore
    await adminFirestore.collection('users').doc(uid).update(updateData);

    // Obtener el documento actualizado
    const updatedDoc = await adminFirestore.collection('users').doc(uid).get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        uid: uid,
        email: updatedData?.email,
        displayName: updatedData?.displayName || '',
        role: updatedData?.role || 'neumólogo',
      },
    });
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al actualizar usuario: ' + errorMessage },
      { status: 500 }
    );
  }
}
