import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

interface ResumenData {
  fecha: string;
  pasos: number;
  minutos: number;
  calorias: number;
  [key: string]: unknown;
}

interface SuenoData {
  fecha: string;
  duracion: number;
  profundo: number;
  rem: number;
  ligero: number;
  [key: string]: unknown;
}

export interface PacienteData {
  id: number;
  nombre: string;
  edad: number;
  genero: string;
  peso: number;
  altura: number;
  resumenData: ResumenData[];
  suenoData: SuenoData[];
}

interface UsePacientesReturn {
  pacientes: PacienteData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook personalizado para obtener datos de pacientes desde la base de datos
 * OPTIMIZADO con React Query para caching automático
 */
export function usePacientes(): UsePacientesReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const {
    data: pacientes,
    isLoading,
    error,
    refetch,
  } = useQuery<PacienteData[], Error>({
    // Query key: React Query usa esto para identificar y cachear la query
    queryKey: ['pacientes'],

    // Query function: la función que obtiene los datos
    queryFn: async () => {
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

      const response = await fetch('/api/db/pacientes/resumen', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos de pacientes');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      return result.data;
    },

    // Solo ejecutar la query si el usuario está autenticado
    enabled: isAuthenticated,

    // Configuración de staleTime específica para lista de pacientes
    // Los datos se actualizan solo a las 11pm, por lo que pueden estar
    // en cache todo el día sin problemas. Usar el default de 18 horas.
    // Cache se invalida automáticamente a las 11:05pm.
    // staleTime: se usa el default del QueryClient (18 horas)

    // No refetch automáticamente al montar el componente si hay datos en cache
    refetchOnMount: false,
  });

  return {
    pacientes: pacientes ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch: async () => {
      await refetch();
    }
  };
}
