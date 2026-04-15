/**
 * Script para crear el primer usuario administrador
 *
 * Uso:
 * 1. Asegúrate de tener las credenciales de Firebase en .env.local
 * 2. Ejecuta: npm run create-admin
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import * as readline from 'readline';
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

// Crear interfaz de readline para input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdminUser() {
  console.log('\n=== Crear Usuario Administrador ===\n');

  try {
    // Solicitar información del administrador
    const email = await question('Email del administrador: ');
    const password = await question('Contraseña (mínimo 6 caracteres): ');
    const displayName = await question('Nombre completo (opcional): ');

    if (!email || !password) {
      console.error('Error: Email y contraseña son obligatorios');
      rl.close();
      return;
    }

    if (password.length < 6) {
      console.error('Error: La contraseña debe tener al menos 6 caracteres');
      rl.close();
      return;
    }

    console.log('\nCreando usuario administrador...');

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
    console.log('\nYa puedes iniciar sesión en http://localhost:3000/login\n');

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
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Ejecutar el script
createAdminUser();
