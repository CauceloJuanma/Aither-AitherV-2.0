/**
 * Script para crear el primer usuario administrador (versión automatizada)
 *
 * Uso:
 * npm run create-admin-auto admin@aither.com admin123 "Administrador Principal"
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validar que se cargaron las variables de entorno
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Error: No se encontraron las credenciales de Firebase en .env.local');
  console.error('Asegúrate de que el archivo .env.local existe y contiene las variables NEXT_PUBLIC_FIREBASE_*');
  process.exit(1);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser(email: string, password: string, displayName: string) {
  console.log('\n=== Crear Usuario Administrador ===\n');

  try {
    if (!email || !password) {
      console.error('Error: Email y contraseña son obligatorios');
      console.error('Uso: npm run create-admin-auto <email> <password> [nombre]');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('Error: La contraseña debe tener al menos 6 caracteres');
      process.exit(1);
    }

    console.log('Creando usuario administrador...');

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✓ Usuario creado en Firebase Auth');

    // Guardar datos adicionales en Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      role: 'admin',
      displayName: displayName || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✓ Datos guardados en Firestore');

    console.log('\n✅ Usuario administrador creado exitosamente!');
    console.log(`   Email: ${email}`);
    console.log(`   UID: ${userCredential.user.uid}`);
    console.log(`   Rol: admin`);
    console.log('\nYa puedes iniciar sesión en http://localhost:3000/login\n');

    process.exit(0);
  } catch (error: unknown) {
    console.error('\n❌ Error al crear usuario:');

    const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : '';
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    if (errorCode === 'auth/email-already-in-use') {
      console.error('Este email ya está en uso');
    } else if (errorCode === 'auth/invalid-email') {
      console.error('Email inválido');
    } else if (errorCode === 'auth/weak-password') {
      console.error('La contraseña es muy débil');
    } else {
      console.error(errorMessage);
    }

    process.exit(1);
  }
}

// Obtener argumentos de la línea de comandos
const args = process.argv.slice(2);
const email = args[0];
const password = args[1];
const displayName = args[2] || '';

// Ejecutar el script
createAdminUser(email, password, displayName);
