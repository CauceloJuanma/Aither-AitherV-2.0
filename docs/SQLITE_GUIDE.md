# Guía de Uso de SQLite en el Proyecto

## ✅ Configuración Completada

Se ha configurado SQLite para acceder a la base de datos `app_1mesfinal2.db` desde tu aplicación Next.js.

## 📁 Archivos Creados

### 1. Módulo de Conexión
**`src/lib/database.ts`**
- Gestiona la conexión singleton a SQLite
- Usa `better-sqlite3` para acceso síncrono rápido
- Configura WAL mode para mejor rendimiento

### 2. Tipos TypeScript
**`src/types/database.ts`**
- Interfaces para todas las tablas principales:
  - `Usuario`
  - `Telemonitorizacion`
  - `Actividad`
  - `Sleep`
  - `Pesaje`
  - `Picoflujo`
  - `CalidadAireInterior`
  - `Cuestionario`
  - `Sonidos`

### 3. API Routes

#### `/api/db/test` - Prueba de conexión
```bash
curl http://localhost:3000/api/db/test
```
Devuelve estadísticas de todas las tablas.

#### `/api/db/usuarios` - Lista de usuarios
```bash
curl http://localhost:3000/api/db/usuarios
```
Devuelve todos los usuarios en la base de datos.

#### `/api/db/usuarios/[id]` - Usuario específico
```bash
curl http://localhost:3000/api/db/usuarios/12345001
```
Devuelve un usuario con toda su telemonitorización completa.

## 🔍 Datos en la Base de Datos

**Estadísticas actuales:**
- 16 usuarios
- 501 telemonitorizaciones
- 496 actividades
- 496 registros de sueño
- 32,959 registros de calidad de aire
- 195 cuestionarios
- 191 archivos de sonidos

## 💻 Cómo Usar en tus Componentes

### Ejemplo 1: Obtener lista de usuarios
```typescript
// En un componente o página
async function obtenerUsuarios() {
  const response = await fetch('/api/db/usuarios');
  const { data } = await response.json();
  return data; // Array de usuarios
}
```

### Ejemplo 2: Obtener usuario específico
```typescript
async function obtenerUsuario(id: number) {
  const response = await fetch(`/api/db/usuarios/${id}`);
  const { data } = await response.json();
  return data; // Usuario con telemonitorizaciones
}
```

### Ejemplo 3: Crear tu propia API route

```typescript
// src/app/api/db/actividades/route.ts
import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';

export async function GET() {
  const db = getDatabase();

  const actividades = db.prepare(`
    SELECT a.*, u.nombre as nombre_usuario
    FROM actividad a
    JOIN telemonitorizacion t ON a.telemonitorizacion_id = t.id
    JOIN usuario u ON t.usuario_id = u.id
    WHERE a.steps > 5000
    ORDER BY a.steps DESC
    LIMIT 10
  `).all();

  return NextResponse.json({ data: actividades });
}
```

## 🔧 Queries Útiles

### Obtener actividad de un usuario en una fecha
```typescript
const db = getDatabase();
const actividad = db.prepare(`
  SELECT a.*
  FROM actividad a
  JOIN telemonitorizacion t ON a.telemonitorizacion_id = t.id
  WHERE t.usuario_id = ? AND t.fecha = ?
`).get(usuarioId, fecha);
```

### Obtener promedio de pasos por usuario
```typescript
const db = getDatabase();
const promedios = db.prepare(`
  SELECT u.nombre, AVG(a.steps) as promedio_pasos
  FROM usuario u
  JOIN telemonitorizacion t ON u.id = t.usuario_id
  JOIN actividad a ON t.id = a.telemonitorizacion_id
  GROUP BY u.id
`).all();
```

### Obtener datos de sueño del último mes
```typescript
const db = getDatabase();
const sleepData = db.prepare(`
  SELECT s.*, t.fecha, u.nombre
  FROM sleep s
  JOIN telemonitorizacion t ON s.telemonitorizacion_id = t.id
  JOIN usuario u ON t.usuario_id = u.id
  WHERE t.fecha >= date('now', '-30 days')
  ORDER BY t.fecha DESC
`).all();
```

## 🚀 Próximos Pasos

### ✅ Sistema Dual Configurado

La aplicación ahora soporta **dos modos de base de datos**:

#### Modo Local (Desarrollo)
```bash
USE_TURSO=false  # En .env.local
```
- Usa SQLite local con `better-sqlite3`
- Acceso directo al archivo `app_1mesfinal2.db`
- Sin latencia de red
- Operaciones síncronas

#### Modo Turso (Producción/Vercel)
```bash
USE_TURSO=true  # En Vercel
```
- Usa Turso (SQLite en la nube) con `@libsql/client`
- Base de datos ya configurada en: `libsql://aither-db-aitherproyect.aws-eu-west-1.turso.io`
- Datos ya importados (16 usuarios, 501 telemonitorizaciones, etc.)
- Disponible globalmente

### 📖 Guía Completa de Deploy

Para instrucciones detalladas sobre cómo hacer deploy a Vercel con Turso, consulta:

**[DATABASE_DEPLOYMENT.md](./DATABASE_DEPLOYMENT.md)**

Incluye:
- Configuración de variables de entorno en Vercel
- Pasos para hacer deploy
- Sincronización de datos
- Troubleshooting
- Comandos útiles de Turso

## 📊 Estructura de las Tablas

### Usuario
Información del paciente (edad, peso, altura, etc.)

### Telemonitorizacion
Registro diario de monitorización

### Actividad
Datos de Fitbit (pasos, calorías, distancia, minutos activos)

### Sleep
Datos de sueño (eficiencia, fases REM, profundo, ligero)

### Pesaje
Mediciones de peso

### Picoflujo
Mediciones respiratorias

### CalidadAireInterior
Datos ambientales (CO2, VOC, temperatura, humedad)

### Cuestionario
Evaluaciones clínicas y juegos

### Sonidos
Análisis de tos y voz

## 🔐 Seguridad

- La base de datos contiene datos médicos sensibles
- Asegúrate de implementar autenticación en tus API routes
- No expongas endpoints públicamente sin protección
- Considera usar middleware de autenticación con Firebase

## ❓ Preguntas Frecuentes

**¿Puedo usar Prisma o Drizzle ORM?**
Sí, pero `better-sqlite3` es más rápido y simple para SQLite local.

**¿Cómo actualizo datos?**
```typescript
const db = getDatabase();
db.prepare('UPDATE usuario SET peso = ? WHERE id = ?').run(75, 12345001);
```

**¿Cómo inserto datos?**
```typescript
const db = getDatabase();
const info = db.prepare('INSERT INTO pesaje (peso, telemonitorizacion_id) VALUES (?, ?)').run(75.5, 5136);
console.log('ID insertado:', info.lastInsertRowid);
```

## 🔄 Migración de Datos Mock a Datos Reales

### Arquitectura de Procesamiento de Datos

#### 1. Procesador de Telemonitorización
**`src/lib/telemonitoringDataProcessor.ts`**

Este módulo procesa los datos crudos de la base de datos y los convierte en métricas agregadas listas para visualización.

**Funciones principales:**
- `processTelemonitoringData(paciente: UsuarioCompleto)`: Procesa todos los datos de telemonitorización
- Retorna datos agregados y promedios calculados
- Maneja valores nulos y datos faltantes de forma segura

**Datos procesados que retorna:**
```typescript
interface ProcessedMetrics {
  // Arrays para gráficas
  saturacionData: Array<{ fecha: string; spo2: number }>;
  picoFlujoData: Array<{ fecha: string; toma1: number; toma2: number; toma3: number }>;
  suenoData: Array<{ fecha: string; duracion: number; profundo: number; ... }>;
  calidadAire1Data: Array<{ fecha: string; pm25: number; pm10: number; ... }>;
  actividadData: Array<{ fecha: string; restingHeartRate: number; ... }>;
  resumenData: Array<{ fecha: string; pasos: number; minutos: number; calorias: number }>;
  pesajeData: Array<{ fecha: string; peso: number }>;
  cuestionarioHistorico: Array<{ fecha: string; disnea: number }>;

  // Promedios calculados
  avgSaturacion: number;
  avgPicoFlujo: number;
  sleepEfficiency: number;  // Calculado como (deep + REM) / duration * 100
  avgPM25: number;
  avgPM10: number;
  avgRestingHeartRate: number;
  avgPeso: number;
  avgTimeInBed: number;
  avgBreathingRate: number;
  avgHRVdailyRmssd: number;
  avgPasos: number;
}
```

#### 2. Hook Personalizado para Pacientes
**`src/hooks/usePaciente.ts`**

Hook de React que obtiene datos de un paciente específico desde la API:

```typescript
const { paciente, loading, error, refetch } = usePaciente(patientId);
```

- Maneja estados de carga y error
- Actualiza automáticamente cuando cambia el ID
- Función `refetch()` para recargar datos manualmente

#### 3. Flujo de Datos en Página de Detalle

**`src/app/detalle/page.tsx`**

1. **Obtener ID del paciente desde localStorage**
   ```typescript
   const [patientId, setPatientId] = useState<number | null>(null);
   ```

2. **Cargar datos del paciente con hook**
   ```typescript
   const { paciente, loading, error } = usePaciente(patientId);
   ```

3. **Procesar telemonitorización**
   ```typescript
   const processedData = processTelemonitoringData(paciente);
   ```

4. **Extraer métricas procesadas**
   ```typescript
   const {
     saturacionData,
     avgSaturacion,
     sleepEfficiency,
     // ... más métricas
   } = processedData;
   ```

5. **Pasar datos al componente ResumenTab**
   ```typescript
   <ResumenTab
     saturacionData={saturacionData}
     avgSaturacion={avgSaturacion}
     // ... más props
   />
   ```

### Detalles de Procesamiento de Datos

#### SpO2 (Saturación de Oxígeno)
- **Fuente**: Campo `spo2` en tabla `sleep`
- **Formato en DB**: Puede ser número directo o JSON string
- **Procesamiento**: La función `parseSpO2()` maneja diferentes formatos:
  - Si es número: retorna directamente
  - Si es JSON: extrae `avgSaturation`, `avg`, o promedia array de valores
- **Promedio**: Calculado sobre todos los registros válidos

#### Pico de Flujo
- **Fuente**: Tabla `picoflujo`
- **Campos**: `valor1`, `valor2`, `valor3`, `valormedio`
- **Procesamiento**:
  - Si existe `valormedio`, lo usa
  - Si no, calcula promedio de valor1, valor2, valor3
- **Gráfica**: Muestra las 3 tomas por día

#### Sueño
- **Fuente**: Tabla `sleep`
- **Conversión**: Minutos → Horas (divide entre 60)
- **Campos principales**:
  - `duration`: Duración total del sueño
  - `deep_minutes`: Sueño profundo
  - `rem_minutes`: Sueño REM
  - `light_minutes`: Sueño ligero
  - `timeInBed`: Tiempo en cama
  - `average_breathing_rate`: Tasa respiratoria
  - `HRVdailyRmssd`: Variabilidad cardíaca

**Eficiencia del sueño:**
```typescript
sleepEfficiency = ((deep_minutes + rem_minutes) / duration) * 100
```

#### Actividad
- **Fuente**: Tabla `actividad` (datos de Fitbit)
- **Campos clave**:
  - `steps`: Pasos diarios
  - `caloriesOut`: Calorías quemadas
  - `restingHeartRate`: Frecuencia cardíaca en reposo
  - `fairlyActiveMinutes`, `lightlyActiveMinutes`, `veryActiveMinutes`
  - `total_distance`: Distancia en metros (se convierte a km)

**Minutos activos totales:**
```typescript
totalActiveMinutes = fairlyActive + lightlyActive + veryActive
```

#### Calidad del Aire
- **Fuente**: Tabla `calidadaireinterior`
- **Múltiples registros por día**: Se agrupan por fecha y se promedian
- **Campos**:
  - `ppm1`, `ppm25`, `ppm4`, `ppm10`: Partículas en suspensión
  - `co2`: CO2 en ppm
  - `voc`: Compuestos orgánicos volátiles en ppb
  - `temp`: Temperatura
  - `hum`: Humedad

**Nota**: Los nombres en la DB son `ppm1`, `ppm25`, etc., no `pm1`, `pm25`

#### Cuestionarios (Disnea)
- **Fuente**: Tabla `cuestionario`
- **Campo usado**: `q2` (pregunta 2 = disnea)
- **Escala**: 1-5 (menor = mejor)
- **Niveles**:
  - ≤2: Leve (verde)
  - ≤3: Moderada (amarillo)
  - >3: Severa (rojo)

### Manejo de Datos Vacíos

Todos los componentes implementan el patrón "(Sin Datos)":

```typescript
// Helper para validar datos
const hasValidData = (value: number | null | undefined): boolean => {
  return value !== null && value !== undefined && !isNaN(value) && value !== 0;
};

// Renderizado condicional
<div className={hasValidData(value) ? 'text-green-600' : 'text-gray-400 italic'}>
  {hasValidData(value) ? `${value}%` : '(Sin Datos)'}
</div>
```

**Regla**: Un valor es considerado "sin datos" si es:
- `null`
- `undefined`
- `NaN`
- `0` (cero se considera ausencia de medición)

### Estructura de Datos de Usuario Completo

Cuando se solicita un usuario específico (`/api/db/usuarios/[id]`), la API devuelve:

```typescript
{
  success: true,
  data: {
    // Datos básicos del usuario
    id: number,
    nombre: string,
    edad: number,
    // ... más campos de usuario

    // Array de telemonitorizaciones
    telemonitorizaciones: [
      {
        id: number,
        fecha: "2025-08-15",
        usuario_id: number,

        // Datos relacionados (si existen)
        actividad?: { steps: 5000, caloriesOut: 2000, ... },
        sleep?: { duration: 450, deep_minutes: 90, ... },
        picoflujos?: [{ valor1: 350, valor2: 360, ... }],
        pesajes?: [{ peso: 75.5 }],
        calidadAire?: [{ ppm25: 15, co2: 800, ... }],
        cuestionarios?: [{ q1: 2, q2: 3, ... }],
        sonidos?: [{ ... }]
      },
      // ... más días
    ]
  }
}
```

### Pacientes en la Base de Datos

**Total**: 16 pacientes

**IDs de ejemplo**:
- Cicerone_UCA_P001 a Cicerone_UCA_P016

**Pacientes con mayor actividad** (promedio de pasos):
1. P015: 9,735 pasos/día
2. P016: 7,893 pasos/día
3. P012: 7,602 pasos/día

**Pacientes con baja movilidad**:
- P009: 0 pasos (paciente con movilidad limitada)

**Rango de fechas de datos**: Agosto-Septiembre 2025

## 📝 Notas

- El archivo `.db` ya está en `.gitignore` por seguridad
- Los tipos TypeScript proporcionan autocompletado completo
- Todas las queries son síncronas (más rápidas que async)
- WAL mode permite lecturas concurrentes
- Los datos históricos usan `.slice(-N)` para obtener últimos N registros en lugar de filtros de fecha absoluta
