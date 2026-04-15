import { useQuery } from '@tanstack/react-query';
import type { UsuarioCompleto } from '@/types/database';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';

interface UsePacienteReturn {
  paciente: UsuarioCompleto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook personalizado para obtener datos de un paciente específico desde la base de datos
 * OPTIMIZADO con React Query para caching automático
 */
export function usePaciente(id: number | null): UsePacienteReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const {
    data: paciente,
    isLoading,
    error,
    refetch,
  } = useQuery<UsuarioCompleto | null, Error>({
    // Query key: React Query usa esto para identificar y cachear la query
    queryKey: ['paciente', id],

    // Query function: la función que obtiene los datos
    queryFn: async () => {
      if (!id) {
        return null;
      }

      // Esperar hasta que Firebase Auth inicialice
      let user = auth.currentUser;

      // Esperar un poco si el usuario aún no está cargado
      if (!user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        user = auth.currentUser;
      }

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const token = await user.getIdToken();

      const response = await fetch(`/api/db/usuarios/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos del paciente');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      return result.data;
    },

    // Solo ejecutar la query si hay ID y el usuario está autenticado
    enabled: !!id && isAuthenticated,

    // Configuración de staleTime específica para pacientes
    // Los datos se actualizan solo a las 11pm, por lo que pueden estar
    // en cache todo el día sin problemas. Usar el default de 18 horas.
    // Cache se invalida automáticamente a las 11:05pm.
    // staleTime: se usa el default del QueryClient (18 horas)

    // No refetch automáticamente al montar el componente si hay datos en cache
    refetchOnMount: false,
  });

  return {
    paciente: paciente ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    refetch: async () => {
      await refetch();
    }
  };
}
