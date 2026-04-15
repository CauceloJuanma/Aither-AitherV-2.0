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

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { email, password, displayName, role, allowGoogleAuth } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Si no permite Google Auth, la contraseña es obligatoria
    if (!allowGoogleAuth && !password) {
      return NextResponse.json(
        { error: 'Contraseña es requerida cuando no se usa Google Auth' },
        { status: 400 }
      );
    }

    // Crear usuario en Firebase Auth usando Admin SDK
    const adminAuth = getAdminAuth();

    // Si permite Google Auth, no creamos el usuario en Auth aún
    // Solo guardamos en Firestore como "whitelist"
    let userRecord;
    if (!allowGoogleAuth) {
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: displayName || undefined,
      });
    }

    // Guardar información adicional en Firestore
    const adminFirestore = getAdminFirestore();

    if (allowGoogleAuth) {
      // Para Google Auth, guardamos el email como whitelist
      // Usamos el email como ID del documento (temporal, se actualizará al login)
      const emailId = email.replace(/[@.]/g, '_');
      await adminFirestore.collection('users').doc(emailId).set({
        email,
        role: role || 'neumólogo',
        displayName: displayName || '',
        allowGoogleAuth: true,
        authMethods: ['google.com'],
        primaryUid: emailId,
        linkedUids: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return NextResponse.json({
        success: true,
        user: {
          uid: emailId,
          email: email,
          displayName: displayName || '',
          role: role || 'neumólogo',
          allowGoogleAuth: true,
        },
      });
    } else {
      // Para autenticación con contraseña
      await adminFirestore.collection('users').doc(userRecord!.uid).set({
        email,
        role: role || 'neumólogo',
        displayName: displayName || '',
        allowGoogleAuth: false,
        authMethods: ['password'],
        primaryUid: userRecord!.uid,
        linkedUids: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return NextResponse.json({
        success: true,
        user: {
          uid: userRecord!.uid,
          email: userRecord!.email,
          displayName: displayName || '',
          role: role || 'neumólogo',
          allowGoogleAuth: false,
        },
      });
    }
  } catch (error: unknown) {
    console.error('Error creating user:', error);

    const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : '';
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    if (errorCode === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'Este email ya está en uso' },
        { status: 400 }
      );
    } else if (errorCode === 'auth/invalid-email') {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    } else if (errorCode === 'auth/weak-password') {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear usuario: ' + errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { error: 'UID de usuario requerido' },
        { status: 400 }
      );
    }

    // Eliminar usuario de Firebase Auth
    const adminAuth = getAdminAuth();
    await adminAuth.deleteUser(uid);

    // Eliminar documento de Firestore
    const adminFirestore = getAdminFirestore();
    await adminFirestore.collection('users').doc(uid).delete();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al eliminar usuario: ' + errorMessage },
      { status: 500 }
    );
  }
}
