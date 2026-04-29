import { useQuery } from '@tanstack/react-query';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';

export interface Visita {
  id: number;
  usuario_id: number;
  fecha: string;
}

interface UseVisitasReturn {
  visitas: Visita[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook personalizado para obtener las visitas hospitalarias de todos los pacientes
 */
export function useVisitas(): UseVisitasReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const {
    data: visitas = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Visita[], Error>({
    // Query key
    queryKey: ['visitas'],

    // Query function
    queryFn: async () => {

      // Esperar hasta que Firebase Auth inicialice
      let user = auth.currentUser;

      if (!user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        user = auth.currentUser;
      }

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const token = await user.getIdToken();

      const response = await fetch(`/api/db/visitas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener visitas del paciente');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      return (result.data as Visita[]).map((v) => ({
        ...v,
        usuario_id: Number(v.usuario_id),
      }));
    },

    // Solo ejecutar si hay ID y usuario autenticado
    enabled: isAuthenticated,

    // No refetch automáticamente al montar
    refetchOnMount: false,
  });

  return {
    visitas,
    loading: isLoading,
    error: error?.message ?? null,
    refetch: async () => {
      await refetch();
    }
  };
}