# Documentación de Aither

Documentación técnica del sistema de monitorización clínica Aither.

## Contenido

### Optimizaciones de Performance

1. **[Optimización de Base de Datos](./database-optimization.md)**
   - Eliminación del problema N+1
   - Estrategia de batch queries
   - Mejoras de performance en endpoints

2. **[Sistema de Caching](./caching-strategy.md)**
   - Implementación de React Query
   - Configuración de cache adaptada a actualización nocturna
   - Invalidación automática de cache

3. **[Configuración y Troubleshooting](./configuration.md)**
   - Variables de entorno
   - Configuración de base de datos
   - Solución de problemas comunes

## Resumen de Mejoras de Performance

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Queries por paciente individual | ~240 | 9 | 96% |
| Queries para lista de pacientes | ~1,200 | 5 | 99.6% |
| API calls por día (por usuario) | 50-100+ | 1-2 | ~98% |
| Tiempo de respuesta (navegación) | 500-2000ms | 0-50ms | ~98% |

## Arquitectura del Sistema

### Stack Tecnológico

- **Frontend**: Next.js 16 (App Router) + React
- **Backend**: Next.js API Routes
- **Base de Datos**: SQLite (local) con soporte para Turso
- **Autenticación**: Firebase Auth
- **Caching**: TanStack React Query
- **UI**: Tailwind CSS + shadcn/ui

### Flujo de Datos

```
Usuario → React Component → React Query Hook → API Route → Database → Response
                ↓                                                        ↑
              Cache (18hrs)                                              |
                ↓_____________ Cache Hit? → Retornar datos cacheados _____|
```

## Características Clave

### 1. Actualización de Datos
- Los datos se actualizan **diariamente a las 11:00 PM**
- El cache se invalida automáticamente a las **11:05 PM**
- Cache válido por **18 horas** durante el día

### 2. Optimización de Queries
- Uso de `IN` clauses para batch queries
- Maps (HashMap) para búsqueda O(1)
- Queries paralelas con `Promise.all`

### 3. Sistema de Caching
- Cache en memoria con React Query
- Invalidación automática post-actualización
- Sin refetch innecesarios durante el día

## Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración

1. Configurar variables de entorno (ver [configuration.md](./configuration.md))
2. Colocar base de datos SQLite en la raíz del proyecto
3. Configurar Firebase credentials

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

## Monitoreo y Debugging

### React Query DevTools (Opcional)

Para ver el estado del cache en tiempo real durante desarrollo:

```tsx
// En src/lib/react-query.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Dentro del return del ReactQueryProvider
<>
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
</>
```

### Logs de Consola

El sistema genera logs útiles:
- `[React Query] Invalidando cache después de actualización...` - Cache invalidado a las 11:05 PM

## Mantenimiento

### Cambiar Horario de Actualización

Si el horario de actualización de datos cambia:

1. Editar `src/lib/react-query.tsx` línea 49
2. Actualizar la condición de `hours` y `minutes`
3. Actualizar comentarios en la documentación

### Ajustar Tiempo de Cache

Para modificar el tiempo de validez del cache:

1. Editar `src/lib/react-query.tsx` línea 22 (`staleTime`)
2. Considerar el patrón de actualización de datos

## Soporte

Para reportar bugs o solicitar features:
- Crear issue en el repositorio
- Contactar al equipo de desarrollo

## Contribuir

Ver guía de contribución en el repositorio principal.
