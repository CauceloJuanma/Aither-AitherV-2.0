'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';

/**
 * React Query Provider con configuración optimizada para la aplicación
 *
 * NOTA: Los datos se actualizan diariamente a las 11pm, por lo que
 * el cache es válido durante todo el día hasta la siguiente actualización.
 * El cache se invalida automáticamente a las 11:05pm para refrescar datos.
 */
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  // Crear QueryClient dentro del componente para evitar compartir estado entre requests (SSR)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Datos considerados "fresh" por 18 horas
            // Como los datos se actualizan solo entre 10pm-1am, pueden estar
            // en cache todo el día sin problemas
            staleTime: 18 * 60 * 60 * 1000, // 18 horas

            // Mantener datos en cache por 24 horas después de que dejen de usarse
            gcTime: 24 * 60 * 60 * 1000, // 24 horas

            // No refetch automáticamente al re-focus de la ventana
            refetchOnWindowFocus: false,

            // Reintentar 1 vez en caso de error
            retry: 1,

            // Delay de 1 segundo entre reintentos
            retryDelay: 1000,
          },
        },
      })
  );

  // Invalidar todo el cache después de las 11pm (cuando los datos ya están actualizados)
  useEffect(() => {
    const checkForDataUpdate = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Si son las 11:05pm o 11:06pm, invalidar todo el cache para forzar refetch
      // Los datos se actualizan a las 11pm, así que a las 11:05pm ya están listos
      if (hours === 23 && minutes >= 5 && minutes <= 10) {
        console.log('[React Query] Invalidando cache después de actualización de datos (11:05pm)');
        queryClient.invalidateQueries();
      }
    };

    // Verificar cada 5 minutos si necesitamos invalidar el cache
    // (más frecuente para capturar la ventana de 11:05-11:10pm)
    const interval = setInterval(checkForDataUpdate, 5 * 60 * 1000); // cada 5 minutos

    // Verificar inmediatamente al montar
    checkForDataUpdate();

    return () => clearInterval(interval);
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
