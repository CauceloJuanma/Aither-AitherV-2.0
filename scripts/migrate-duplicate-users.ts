/**
 * Script de migración para fusionar usuarios duplicados por email
 *
 * Este script:
 * 1. Busca todos los usuarios en Firestore
 * 2. Agrupa usuarios con el mismo email
 * 3. Fusiona los duplicados manteniendo el documento más antiguo
 * 4. Actualiza authMethods y linkedUids
 * 5. Elimina los documentos duplicados
 *
 * Uso: npx tsx scripts/migrate-duplicate-users.ts
 */

// Cargar variables de entorno desde .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar .env.local desde la raíz del proyecto
config({ path: resolve(__dirname, '../.env.local') });

import { getAdminAuth, getAdminFirestore } from '../src/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

interface UserDocument {
  id: string;
  email: string;
  role: string;
  displayName?: string;
  allowGoogleAuth?: boolean;
  authMethods?: string[];
  primaryUid?: string;
  linkedUids?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  [key: string]: unknown;
}

async function migrateDuplicateUsers() {
  console.log('🔍 Iniciando migración de usuarios duplicados...\n');

  const adminFirestore = getAdminFirestore();
  const adminAuth = getAdminAuth();

  try {
    // 1. Obtener todos los usuarios de Firestore
    console.log('📥 Obteniendo todos los usuarios de Firestore...');
    const usersSnapshot = await adminFirestore.collection('users').get();
    const allUsers: UserDocument[] = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      allUsers.push({
        id: doc.id,
        ...data,
      } as UserDocument);
    });

    console.log(`✓ Se encontraron ${allUsers.length} documentos de usuarios\n`);

    // 2. Agrupar usuarios por email
    console.log('🔄 Agrupando usuarios por email...');
    const usersByEmail: Map<string, UserDocument[]> = new Map();

    allUsers.forEach((user) => {
      if (!user.email) {
        console.warn(`⚠️  Usuario ${user.id} no tiene email, se omitirá`);
        return;
      }

      const email = user.email.toLowerCase();
      if (!usersByEmail.has(email)) {
        usersByEmail.set(email, []);
      }
      usersByEmail.get(email)!.push(user);
    });

    // 3. Identificar duplicados
    const duplicates = Array.from(usersByEmail.entries()).filter(
      ([_, users]) => users.length > 1
    );

    console.log(`✓ Se encontraron ${duplicates.length} emails con duplicados\n`);

    if (duplicates.length === 0) {
      console.log('✨ No hay duplicados para fusionar. ¡Todo listo!');
      return;
    }

    // 4. Fusionar cada grupo de duplicados
    console.log('🔧 Fusionando usuarios duplicados...\n');

    for (const [email, users] of duplicates) {
      console.log(`\n📧 Procesando: ${email} (${users.length} documentos)`);
      users.forEach((u, i) => {
        console.log(
          `  ${i + 1}. ID: ${u.id}, authMethods: ${u.authMethods?.join(', ') || 'ninguno'}, createdAt: ${u.createdAt?.toDate()?.toISOString() || 'desconocido'}`
        );
      });

      // Ordenar por fecha de creación (más antiguo primero)
      users.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return aTime - bTime;
      });

      const primaryUser = users[0]; // El más antiguo
      const duplicateUsers = users.slice(1);

      // Fusionar authMethods
      const allAuthMethods = new Set<string>();
      users.forEach((user) => {
        if (user.authMethods && Array.isArray(user.authMethods)) {
          user.authMethods.forEach((method) => allAuthMethods.add(method));
        } else {
          // Si no tiene authMethods, inferir del usuario
          if (user.allowGoogleAuth) {
            allAuthMethods.add('google.com');
          } else {
            allAuthMethods.add('password');
          }
        }
      });

      // Fusionar linkedUids
      const allLinkedUids = new Set<string>();
      users.forEach((user) => {
        // Agregar el UID del documento duplicado como linkedUid
        if (user.id !== primaryUser.id) {
          allLinkedUids.add(user.id);
        }
        // Agregar linkedUids existentes
        if (user.linkedUids && Array.isArray(user.linkedUids)) {
          user.linkedUids.forEach((uid) => allLinkedUids.add(uid));
        }
      });

      // Preparar datos fusionados
      const mergedData = {
        email: primaryUser.email,
        role: primaryUser.role,
        displayName: primaryUser.displayName || users.find((u) => u.displayName)?.displayName || '',
        allowGoogleAuth: allAuthMethods.has('google.com'),
        authMethods: Array.from(allAuthMethods),
        primaryUid: primaryUser.id,
        linkedUids: Array.from(allLinkedUids),
        createdAt: primaryUser.createdAt,
        updatedAt: Timestamp.now(),
      };

      console.log(`\n  ✓ Manteniendo documento primario: ${primaryUser.id}`);
      console.log(`    - authMethods fusionados: ${mergedData.authMethods.join(', ')}`);
      console.log(`    - linkedUids: ${mergedData.linkedUids.length > 0 ? mergedData.linkedUids.join(', ') : 'ninguno'}`);

      // 5. Actualizar el documento primario en Firestore
      await adminFirestore.collection('users').doc(primaryUser.id).set(mergedData);
      console.log(`  ✓ Documento primario actualizado en Firestore`);

      // 6. Eliminar documentos duplicados
      for (const duplicateUser of duplicateUsers) {
        try {
          // Eliminar de Firestore
          await adminFirestore.collection('users').doc(duplicateUser.id).delete();
          console.log(`  ✓ Documento duplicado eliminado de Firestore: ${duplicateUser.id}`);

          // Intentar eliminar de Firebase Auth (puede no existir si era whitelist)
          try {
            await adminAuth.deleteUser(duplicateUser.id);
            console.log(`  ✓ Usuario eliminado de Firebase Auth: ${duplicateUser.id}`);
          } catch (authError: unknown) {
            const errorCode = authError && typeof authError === 'object' && 'code' in authError ? (authError as { code: string }).code : '';
            const errorMessage = authError instanceof Error ? authError.message : 'Error desconocido';
            if (errorCode === 'auth/user-not-found') {
              console.log(`  ℹ️  Usuario no encontrado en Firebase Auth (whitelist temporal): ${duplicateUser.id}`);
            } else {
              console.warn(`  ⚠️  Error al eliminar de Firebase Auth: ${errorMessage}`);
            }
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          console.error(`  ❌ Error al eliminar usuario duplicado ${duplicateUser.id}:`, errorMessage);
        }
      }

      console.log(`  ✅ Fusión completada para ${email}`);
    }

    console.log('\n\n✨ Migración completada exitosamente');
    console.log(`   - ${duplicates.length} emails procesados`);
    console.log(`   - ${duplicates.reduce((sum, [_, users]) => sum + users.length - 1, 0)} documentos duplicados eliminados`);

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar el script
if (require.main === module) {
  migrateDuplicateUsers()
    .then(() => {
      console.log('\n👋 Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

export { migrateDuplicateUsers };
