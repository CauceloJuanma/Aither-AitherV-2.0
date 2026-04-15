'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  EmailAuthProvider,
  linkWithCredential,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, query, collection, where, getDocs, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AuthContextType, UserData } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar usuario por email (para account linking)
  const findUserByEmail = async (email: string) => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, data: userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  };

  const fetchUserData = async (firebaseUser: User): Promise<UserData | null> => {
    try {
      // Primero intentar buscar por UID
      let userDocRef = doc(db, 'users', firebaseUser.uid);
      let userDoc = await getDoc(userDocRef);

      // Si no existe, buscar por email (puede estar vinculado a otro UID)
      if (!userDoc.exists()) {
        const existingUser = await findUserByEmail(firebaseUser.email || '');
        if (existingUser) {
          userDocRef = doc(db, 'users', existingUser.id);
          userDoc = await getDoc(userDocRef);
        }
      }

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: userDoc.id,
          email: firebaseUser.email || '',
          role: data.role || 'neumólogo',
          displayName: data.displayName || firebaseUser.displayName || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          authMethods: data.authMethods || ['password'],
          primaryUid: data.primaryUid || userDoc.id,
          linkedUids: data.linkedUids || [],
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const refreshUserData = async () => {
    if (auth.currentUser) {
      const userData = await fetchUserData(auth.currentUser);
      setUser(userData);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // Buscar si ya existe un usuario con este email (posiblemente con Google Auth)
      const existingUser = await findUserByEmail(email);

      if (existingUser && existingUser.id !== firebaseUser.uid) {
        // Ya existe un usuario con este email (probablemente creado con Google)
        // Vincular el método de password a la cuenta existente
        const existingData = existingUser.data;
        const authMethods = existingData.authMethods || [];
        const linkedUids = existingData.linkedUids || [];

        // Agregar 'password' si no está ya en authMethods
        if (!authMethods.includes('password')) {
          authMethods.push('password');
        }

        // Agregar el nuevo UID si no está ya vinculado
        if (!linkedUids.includes(firebaseUser.uid)) {
          linkedUids.push(firebaseUser.uid);
        }

        // Actualizar el documento existente
        await setDoc(doc(db, 'users', existingUser.id), {
          ...existingData,
          authMethods,
          linkedUids,
          updatedAt: Timestamp.now(),
        });

        console.log(`✓ Cuenta vinculada: método password vinculado al usuario ${existingUser.id}`);
      }

      // Obtener datos del usuario (usará el documento correcto gracias a fetchUserData)
      const userData = await fetchUserData(firebaseUser);
      setUser(userData);
    } catch (error: unknown) {
      const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : '';
      // Si hay error de credenciales inválidas, puede ser que la cuenta fue creada con otro método
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password') {
        // Verificar si el email tiene otros métodos de login
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods.length > 0 && !methods.includes('password')) {
            throw new Error(
              `Esta cuenta fue creada con ${methods.includes('google.com') ? 'Google' : 'otro método'}. ` +
              `Por favor, inicia sesión con ese método primero.`
            );
          }
        } catch (fetchError) {
          console.error('Error verificando métodos de login:', fetchError);
        }
      }
      // Re-lanzar el error para que sea manejado por el componente
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const googleUser = result.user;

    // Verificar si el email está en la whitelist o ya existe un usuario
    const existingUser = await findUserByEmail(googleUser.email || '');

    if (!existingUser) {
      // Email no está en la whitelist ni existe usuario
      // IMPORTANTE: Eliminar el usuario de Firebase Auth antes de salir
      // para que no quede registrado y pueda ser creado después por un admin
      try {
        // Intentar eliminar el usuario usando el método del cliente
        await googleUser.delete();
        console.log('✓ Usuario no autorizado eliminado de Firebase Auth (cliente)');
      } catch (deleteError: unknown) {
        const errorMessage = deleteError instanceof Error ? deleteError.message : 'Error desconocido';
        console.warn('⚠️  No se pudo eliminar con método cliente:', errorMessage);

        // Fallback: usar endpoint de API con Admin SDK
        try {
          await fetch('/api/auth/delete-unauthorized', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: googleUser.uid }),
          });
          console.log('✓ Usuario no autorizado eliminado de Firebase Auth (admin SDK)');
        } catch (apiError) {
          console.error('❌ Error al eliminar usuario no autorizado:', apiError);
        }

        // Hacer signOut de todas formas
        await signOut(auth);
      }

      throw new Error(
        'Acceso denegado. Tu email no está autorizado para acceder a este sistema. Contacta al administrador.'
      );
    }

    const existingData = existingUser.data;
    const authMethods = existingData.authMethods || [];
    const linkedUids = existingData.linkedUids || [];
    const primaryUid = existingData.primaryUid || existingUser.id;

    // Agregar 'google.com' si no está ya en authMethods
    if (!authMethods.includes('google.com')) {
      authMethods.push('google.com');
    }

    // Si el usuario usa un UID diferente al documento existente, vincularlo
    if (existingUser.id !== googleUser.uid) {
      // Vincular el Google UID al documento existente
      if (!linkedUids.includes(googleUser.uid)) {
        linkedUids.push(googleUser.uid);
      }

      // Actualizar el documento existente
      // IMPORTANTE: Preservar el displayName existente, no sobrescribirlo con el de Google
      await setDoc(doc(db, 'users', existingUser.id), {
        ...existingData,
        authMethods,
        linkedUids,
        primaryUid,
        displayName: existingData.displayName || googleUser.displayName || '',
        allowGoogleAuth: true,
        updatedAt: Timestamp.now(),
      });

      console.log(`✓ Cuenta vinculada: método Google vinculado al usuario ${existingUser.id}`);
    } else {
      // El UID coincide, solo actualizar los datos
      // IMPORTANTE: Preservar el displayName existente, no sobrescribirlo con el de Google
      await setDoc(doc(db, 'users', googleUser.uid), {
        email: googleUser.email,
        role: existingData.role,
        displayName: existingData.displayName || googleUser.displayName || '',
        allowGoogleAuth: true,
        authMethods,
        primaryUid: googleUser.uid,
        linkedUids,
        createdAt: existingData.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    // Obtener datos del usuario (usará el documento correcto gracias a fetchUserData)
    const userData = await fetchUserData(googleUser);
    setUser(userData);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    loginWithGoogle,
    logout,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
