# Configuración y Troubleshooting

Guía completa de configuración del sistema Aither y solución de problemas comunes.

## Tabla de Contenidos

- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación](#instalación)
- [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Configuración de Firebase](#configuración-de-firebase)
- [Variables de Entorno](#variables-de-entorno)
- [Troubleshooting](#troubleshooting)

## Requisitos del Sistema

### Software Requerido

- **Node.js**: >= 18.17.0
- **npm**: >= 9.0.0
- **Sistema Operativo**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

### Verificar Versiones

```bash
node --version  # Debe ser >= 18.17.0
npm --version   # Debe ser >= 9.0.0
```

## Instalación

### 1. Clonar Repositorio

```bash
git clone <repository-url>
cd aither
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

### 4. Verificar Instalación

```bash
npm run build
```

Si el build es exitoso, la instalación está correcta.

## Configuración de Base de Datos

### SQLite Local (Por Defecto)

**Ubicación**: Raíz del proyecto

**Archivo**: `app_1mesfinal2.db`

**Configuración**: `src/lib/database.ts`

```typescript
// src/lib/database.ts (líneas 12-15)
const LOCAL_DB_PATH = path.join(process.cwd(), 'app_1mesfinal2.db');

const USE_TURSO = process.env.USE_TURSO === 'true';
```

### Estructura de Tablas

La base de datos debe contener las siguientes tablas:

- `usuario` - Información de pacientes
- `telemonitorizacion` - Sesiones de monitorización
- `actividad` - Datos de actividad física
- `sleep` - Datos de sueño
- `pesaje` - Mediciones de peso
- `picoflujo` - Mediciones de pico flujo
- `calidadaireinterior` - Calidad del aire
- `cuestionario` - Respuestas de cuestionarios
- `sonidos` - Análisis de sonidos

### Migrar a Turso (Opcional)

Turso es una base de datos SQLite distribuida en la nube.

**1. Instalar Turso CLI:**

```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

**2. Crear Base de Datos:**

```bash
turso db create aither
```

**3. Obtener URL y Token:**

```bash
turso db show aither --url
turso db tokens create aither
```

**4. Configurar Variables de Entorno:**

```env
USE_TURSO=true
TURSO_DATABASE_URL=libsql://aither-<your-org>.turso.io
TURSO_AUTH_TOKEN=<your-token>
```

### Verificar Conexión a BD

```bash
npm run dev
```

Navegar a: `http://localhost:3000/api/db/test`

Si retorna `{"success": true}`, la conexión es correcta.

## Configuración de Firebase

### 1. Crear Proyecto Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear nuevo proyecto
3. Habilitar Authentication
4. Habilitar Email/Password provider

### 2. Obtener Credenciales

**Para Frontend** (Firebase Client SDK):

1. Project Settings > General
2. Your apps > Web app
3. Copy configuration

**Para Backend** (Firebase Admin SDK):

1. Project Settings > Service Accounts
2. Generate new private key
3. Download JSON file

### 3. Configurar Variables de Entorno

Agregar a `.env.local`:

```env
# Firebase Client (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=<your-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>

# Firebase Admin (Backend) - Contenido del JSON
FIREBASE_PROJECT_ID=<project-id>
FIREBASE_CLIENT_EMAIL=<client-email>
FIREBASE_PRIVATE_KEY="<private-key>"
```

**IMPORTANTE**: `FIREBASE_PRIVATE_KEY` debe estar entre comillas dobles y con saltos de línea (`\n`).

### 4. Configurar Archivos

**src/lib/firebase.ts** (Client):

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

**src/lib/firebase-admin.ts** (Admin):

```typescript
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = admin.auth();
```

### Verificar Autenticación

1. Iniciar aplicación: `npm run dev`
2. Navegar a: `http://localhost:3000/login`
3. Intentar login con credenciales de prueba

## Variables de Entorno

### Archivo `.env.local`

Todas las variables de entorno sensibles deben estar en `.env.local` (NO commitear).

### Variables Requeridas

```env
# Base de Datos
USE_TURSO=false  # true para Turso, false para SQLite local
TURSO_DATABASE_URL=  # Solo si USE_TURSO=true
TURSO_AUTH_TOKEN=    # Solo si USE_TURSO=true

# Firebase Client (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Backend)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Opcional
NODE_ENV=development  # development | production
```

### Variables por Entorno

**Desarrollo** (`.env.local`):
- Usar SQLite local
- Proyecto Firebase de desarrollo
- Logs habilitados

**Producción** (Vercel/Railway/etc):
- Usar Turso (recomendado)
- Proyecto Firebase de producción
- Logs mínimos

### Verificar Variables

```bash
# Verificar que todas las variables están configuradas
npm run build

# Si falla, revisar logs para ver qué variable falta
```

## Troubleshooting

### Problemas Comunes

#### 1. Error: "Cannot find module 'better-sqlite3'"

**Causa**: Dependencia no instalada correctamente.

**Solución**:

```bash
rm -rf node_modules package-lock.json
npm install
```

Si persiste (especialmente en Windows):

```bash
npm install better-sqlite3 --build-from-source
```

#### 2. Error: "SQLITE_CANTOPEN: unable to open database file"

**Causa**: Archivo de base de datos no existe o no tiene permisos.

**Solución**:

1. Verificar que `app_1mesfinal2.db` existe en la raíz del proyecto
2. Verificar permisos del archivo:

```bash
ls -la app_1mesfinal2.db
chmod 644 app_1mesfinal2.db  # Linux/Mac
```

3. Si el archivo no existe, copiarlo desde backup o crear uno nuevo

#### 3. Error: "Firebase: Error (auth/invalid-api-key)"

**Causa**: API key de Firebase incorrecta o no configurada.

**Solución**:

1. Verificar `.env.local` contiene `NEXT_PUBLIC_FIREBASE_API_KEY`
2. Verificar que la key es correcta en Firebase Console
3. Reiniciar servidor de desarrollo:

```bash
# Ctrl+C para detener
npm run dev
```

#### 4. Error: "Firebase Admin: Failed to parse private key"

**Causa**: `FIREBASE_PRIVATE_KEY` mal formateado.

**Solución**:

1. Asegurarse de que la key está entre comillas dobles:

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

2. Los `\n` deben ser literales (no saltos de línea reales)

3. Verificar en `firebase-admin.ts`:

```typescript
privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
```

#### 5. Error: "401 Unauthorized" en API routes

**Causa**: Token de autenticación inválido o expirado.

**Solución**:

1. Cerrar sesión y volver a iniciar
2. Limpiar localStorage:

```javascript
// En DevTools Console
localStorage.clear();
location.reload();
```

3. Verificar que `auth-helpers.ts` está correctamente configurado

#### 6. Datos no se actualizan después de las 11 PM

**Causa**: Cache no se invalidó automáticamente.

**Solución**:

1. Verificar que el usuario tenía la app abierta entre 11:05-11:10 PM
2. Refrescar página manualmente (F5)
3. Verificar logs en consola:

```
[React Query] Invalidando cache después de actualización de datos (11:05pm)
```

4. Si no aparece el log, verificar `src/lib/react-query.tsx` líneas 40-63

#### 7. Build falla con errores de TypeScript

**Causa**: Tipos incorrectos o archivos desactualizados.

**Solución**:

```bash
# Limpiar cache de Next.js
rm -rf .next

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Intentar build de nuevo
npm run build
```

#### 8. Performance lento a pesar de optimizaciones

**Causas posibles**:
- Cache no funciona correctamente
- Query keys inconsistentes
- Problemas de red

**Solución**:

1. **Verificar cache con DevTools**:

```bash
npm install @tanstack/react-query-devtools
```

Agregar a `src/lib/react-query.tsx`:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// En el return
<>
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
</>
```

2. **Verificar Network tab** en Chrome DevTools:
   - ¿Se están haciendo múltiples requests del mismo endpoint?
   - ¿Los requests están tardando mucho?

3. **Verificar query keys son consistentes**:

```typescript
// Usar constantes para query keys
const QUERY_KEYS = {
  paciente: (id: number) => ['paciente', id],
  pacientes: () => ['pacientes'],
};
```

#### 9. Error: "Too many SQL variables"

**Causa**: Más de 999 items en cláusula `IN`.

**Solución**:

Implementar chunking en `src/app/api/db/usuarios/[id]/route.ts`:

```typescript
// Si teleIds.length > 999
const CHUNK_SIZE = 999;
const chunks = [];

for (let i = 0; i < teleIds.length; i += CHUNK_SIZE) {
  chunks.push(teleIds.slice(i, i + CHUNK_SIZE));
}

const allActividades = await Promise.all(
  chunks.map(chunk => {
    const placeholders = chunk.map(() => '?').join(',');
    return executeQuery(
      `SELECT * FROM actividad WHERE telemonitorizacion_id IN (${placeholders})`,
      chunk
    );
  })
);

const todasActividades = allActividades.flat();
```

### Herramientas de Debugging

#### 1. React Query DevTools

Ver estado del cache en tiempo real:

```bash
npm install @tanstack/react-query-devtools
```

#### 2. Logs de Consola

Agregar logs en hooks:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['paciente', id],
  queryFn: async () => {
    console.log('[Debug] Fetching paciente', id);
    const data = await fetchPaciente(id);
    console.log('[Debug] Paciente loaded', data);
    return data;
  },
});
```

#### 3. Network Tab (Chrome DevTools)

- Ver timing de requests
- Ver headers y payloads
- Ver status codes

#### 4. Performance Tab (Chrome DevTools)

- Ver rendering performance
- Ver tiempo de ejecución de funciones
- Detectar bottlenecks

### Obtener Ayuda

#### 1. Revisar Logs

```bash
# Logs de desarrollo
npm run dev

# Logs de build
npm run build 2>&1 | tee build.log
```

#### 2. Información del Sistema

```bash
node --version
npm --version
npx next info
```

#### 3. Crear Issue

Si el problema persiste:

1. Recopilar información del sistema
2. Incluir pasos para reproducir
3. Incluir logs de error
4. Crear issue en GitHub

## Mantenimiento

### Actualizar Dependencias

```bash
# Ver paquetes desactualizados
npm outdated

# Actualizar paquetes menores
npm update

# Actualizar paquetes mayores (con cuidado)
npm install <package>@latest
```

### Backup de Base de Datos

```bash
# Crear backup
cp app_1mesfinal2.db app_1mesfinal2.db.backup

# Restaurar backup
cp app_1mesfinal2.db.backup app_1mesfinal2.db
```

### Limpiar Cache

```bash
# Cache de Next.js
rm -rf .next

# Cache de npm
npm cache clean --force

# node_modules
rm -rf node_modules package-lock.json
npm install
```

## Despliegue a Producción

### Vercel (Recomendado)

1. **Conectar repositorio a Vercel**:
   - Ir a [vercel.com](https://vercel.com)
   - Importar proyecto desde GitHub

2. **Configurar variables de entorno**:
   - En Vercel Dashboard > Settings > Environment Variables
   - Agregar todas las variables de `.env.local`

3. **Configurar base de datos**:
   - Usar Turso en producción (recomendado)
   - Configurar `USE_TURSO=true`

4. **Deploy**:

```bash
vercel --prod
```

### Railway

1. **Crear proyecto en Railway**:
   - Ir a [railway.app](https://railway.app)
   - New Project > Deploy from GitHub

2. **Configurar variables de entorno**:
   - Settings > Variables
   - Agregar todas las variables

3. **Deploy automático**:
   - Push to main branch → auto deploy

### Consideraciones de Producción

- ✅ Usar Turso o base de datos en cloud (no SQLite local)
- ✅ Configurar CORS correctamente
- ✅ Habilitar HTTPS
- ✅ Configurar logs de errores (Sentry, LogRocket, etc)
- ✅ Monitoreo de uptime
- ✅ Backup automático de base de datos

## Checklist de Pre-Producción

- [ ] Todas las variables de entorno configuradas
- [ ] Build exitoso localmente (`npm run build`)
- [ ] Tests pasando (si existen)
- [ ] Base de datos configurada (Turso recomendado)
- [ ] Firebase configurado para producción
- [ ] Logs de errores configurados
- [ ] Backup de base de datos configurado
- [ ] Dominio personalizado configurado (opcional)
- [ ] SSL/HTTPS habilitado
- [ ] Monitoreo configurado

## Referencias

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Turso Docs](https://docs.turso.tech/)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
