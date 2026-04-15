# Aither

**Sistema de Telemonitorización Clínica para Pacientes Respiratorios**

Plataforma web avanzada para monitorización y análisis de pacientes con enfermedades respiratorias crónicas (EPOC). Incluye dashboard interactivo con visualización de métricas en tiempo real, análisis comparativo multi-paciente, y evaluación automática del estado clínico mediante algoritmos ponderados.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Características Principales

### 📊 Dashboard Multi-Paciente
- Visualización comparativa de múltiples pacientes simultáneamente
- Gráficos interactivos (Recharts): líneas, barras, scatter plots
- Selector de rango de fechas: 7/15/30 días, personalizado, o histórico completo
- Filtros dinámicos por estado del paciente (Estable, Observación, Crítico)

### 🏥 Evaluación Clínica Automatizada
- **Sistema multi-factor ponderado** para clasificación de estado del paciente:
  - SpO2 (Saturación de Oxígeno) — 35%
  - Pico Flujo Espiratorio — 30%
  - Actividad Física (Pasos) — 20%
  - Horas de Sueño — 15%
- Fallback inteligente para datos faltantes
- Normalización dinámica de scores
- Ver documentación detallada: [Cálculo del Estado del Paciente](docs/PATIENT_STATUS_CALCULATION.md)

### 📈 Métricas Monitorizadas
- **Actividad Física**: Pasos, minutos activos, calorías, distancias
- **Sueño**: Duración, eficiencia, fases (profundo, REM, ligero)
- **Función Respiratoria**: Pico de flujo espiratorio, SpO2, frecuencia respiratoria
- **Calidad del Aire**: PM2.5, PM10, CO2, VOC, temperatura, humedad
- **Audio Clínico**: Análisis de tos y habla (MFCCs, HNR, jitter, shimmer)
- **Evaluaciones**: Cuestionarios CAT, juegos cognitivos, peso

### 👤 Vista Detallada por Paciente
- Perfil completo del paciente con historial clínico
- Navegación por pestañas: Resumen, Actividad, Sueño, Respiración, etc.
- Gráficos de tendencias temporales
- Indicadores de alertas y anomalías

### 🔐 Autenticación y Seguridad
- Autenticación mediante Firebase Authentication
- Google OAuth integrado
- Protección de rutas con middleware
- Gestión de roles: usuario estándar y administrador
- Tokens de sesión seguros

### 💾 Base de Datos SQLite
- Conexión nativa a `app_1mesfinal2.db` (base de datos de ejemplo)
- 9 tablas principales: usuarios, telemonitorización, actividad, sueño, picoflujo, pesaje, calidad del aire, cuestionarios, sonidos
- Acceso optimizado con `better-sqlite3` y WAL mode
- API REST completa para consultas
- **📖 Para conectar tu backend real de Cicerone:** [CICERONE_BACKEND_SETUP.md](docs/CICERONE_BACKEND_SETUP.md)

### 🔗 Interoperabilidad con Cicerone

Aither está diseñado para integrarse con el sistema backend de Cicerone:

- **Compatible con SQLite**: Se conecta directamente a la base de datos SQLite de Cicerone
- **Esquema flexible**: Soporta el esquema de datos existente de Cicerone
- **Opciones de conexión**: Múltiples estrategias para conectar según tu infraestructura
  - Local: Acceso directo al archivo .db (mismo servidor)
  - Remoto: Túnel SSH para servidores separados
  - Cloud: Replicación a Turso para despliegue en la nube
- **Sin modificaciones al backend**: No requiere cambios en tu API REST de Python existente
- **Coexistencia**: Puede ejecutarse en el mismo servidor Linux que tu aplicación Cicerone

**Guía completa de integración:** [CICERONE_BACKEND_SETUP.md](docs/CICERONE_BACKEND_SETUP.md)

---

## Tecnologías

| Categoría | Stack |
|-----------|-------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **UI/UX** | Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Next.js API Routes (serverless) |
| **Base de Datos** | SQLite 3 (`better-sqlite3`) |
| **Autenticación** | Firebase Authentication, Firebase Admin SDK |
| **Despliegue** | Vercel (recomendado) |

---

## Inicio Rápido

### Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Firebase (para autenticación)
- Base de datos SQLite `app_1mesfinal2.db` en la raíz del proyecto (archivo de ejemplo incluido)
  - Para conectar tu base de datos real de Cicerone, ver: [CICERONE_BACKEND_SETUP.md](docs/CICERONE_BACKEND_SETUP.md)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/aither.git
cd aither

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Firebase
```

### Configuración de Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Google Authentication
3. Descargar credenciales:
   - Web app config → Variables de entorno públicas
   - Service Account → `firebase-service-account.json`
4. Ver guías detalladas:
   - [Configuración de Firebase](docs/FIREBASE_SETUP.md)
   - [Configuración de Admin SDK](docs/ADMIN_SDK_SETUP.md)
   - [Google OAuth Setup](docs/GOOGLE_AUTH_SETUP.md)

### Ejecución Local

```bash
# Desarrollo (http://localhost:3000)
npm run dev

# Build de producción
npm run build

# Ejecutar build en producción
npm start
```

---

## Estructura del Proyecto

```
aither/
├── src/
│   ├── app/                      # App Router de Next.js
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── detalle/page.tsx      # Vista detallada del paciente
│   │   ├── login/page.tsx        # Página de login
│   │   ├── admin/usuarios/       # Panel de administración
│   │   └── api/                  # API Routes
│   │       ├── db/               # Endpoints de base de datos
│   │       └── insights/         # Endpoints de análisis
│   ├── components/
│   │   ├── ui/                   # Componentes UI base
│   │   ├── auth/                 # Componentes de autenticación
│   │   └── detalle/              # Componentes de vista detalle
│   ├── contexts/                 # React Contexts (Auth)
│   ├── hooks/                    # Custom Hooks
│   ├── lib/                      # Utilidades y configuración
│   │   ├── database.ts           # Cliente SQLite
│   │   ├── firebase-admin.ts     # Firebase Admin SDK
│   │   └── auth-helpers.ts       # Helpers de autenticación
│   ├── types/                    # Definiciones TypeScript
│   │   └── database.ts           # Tipos de tablas SQLite
│   └── services/                 # Lógica de negocio
├── docs/                         # Documentación (ver sección abajo)
├── public/                       # Assets estáticos
├── app_1mesfinal2.db             # Base de datos SQLite
├── firebase-service-account.json # Credenciales Firebase (no subir a Git)
└── .env.local                    # Variables de entorno (no subir a Git)
```

---

## Documentación

El proyecto incluye guías técnicas completas en el directorio `/docs`:

### 📚 Guías de Configuración

| Documento | Descripción |
|-----------|-------------|
| [**FIREBASE_SETUP.md**](docs/FIREBASE_SETUP.md) | Configuración inicial de Firebase para el proyecto |
| [**ADMIN_SDK_SETUP.md**](docs/ADMIN_SDK_SETUP.md) | Instalación y configuración del Firebase Admin SDK |
| [**GOOGLE_AUTH_SETUP.md**](docs/GOOGLE_AUTH_SETUP.md) | Configuración de Google OAuth en Firebase |
| [**SQLITE_GUIDE.md**](docs/SQLITE_GUIDE.md) | Guía de uso de la base de datos SQLite local |
| [**CICERONE_BACKEND_SETUP.md**](docs/CICERONE_BACKEND_SETUP.md) | Guía para conectar el backend real de Cicerone (SQLite en Linux) |

### 🚀 Guías de Despliegue

| Documento | Descripción |
|-----------|-------------|
| [**PRODUCTION_SETUP.md**](docs/PRODUCTION_SETUP.md) | Checklist completo para despliegue en producción |
| [**PRIVATE_DATABASE_DEPLOYMENT.md**](docs/PRIVATE_DATABASE_DEPLOYMENT.md) | Estrategias para desplegar con base de datos privada |

### 🔒 Seguridad y Calidad

| Documento | Descripción |
|-----------|-------------|
| [**SECURITY_AUDIT.md**](docs/SECURITY_AUDIT.md) | Auditoría de seguridad y mejores prácticas |
| [**SOLID.md**](docs/SOLID.md) | Principios SOLID aplicados al proyecto |

### 🏥 Algoritmos Clínicos

| Documento | Descripción |
|-----------|-------------|
| [**PATIENT_STATUS_CALCULATION.md**](docs/PATIENT_STATUS_CALCULATION.md) | Documentación detallada del algoritmo de evaluación del estado del paciente (sistema multi-factor ponderado) |

---

## API Endpoints

### Autenticación (Requerida)

Todos los endpoints de datos requieren autenticación mediante token JWT de Firebase.

**Headers requeridos:**
```
Authorization: Bearer <firebase-id-token>
```

### Base de Datos

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/db/test` | GET | Test de conexión y estadísticas de tablas |
| `/api/db/usuarios` | GET | Lista de todos los usuarios |
| `/api/db/usuarios/[id]` | GET | Usuario específico con telemonitorización completa |
| `/api/db/pacientes/resumen` | GET | Resumen de todos los pacientes con métricas agregadas |

### Administración

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/admin/users` | GET | Lista de usuarios autenticados (solo admin) |

Ver más detalles en [SQLITE_GUIDE.md](docs/SQLITE_GUIDE.md).

---

## Algoritmo de Estado del Paciente

El sistema evalúa automáticamente el estado de cada paciente usando un **algoritmo multi-factor ponderado**:

### Factores y Pesos

- **SpO2** (35%): Saturación de oxígeno en sangre
- **Pico Flujo** (30%): Función pulmonar
- **Pasos** (20%): Actividad física diaria
- **Sueño** (15%): Horas de descanso

### Clasificación

| Score | Estado | Acción |
|-------|--------|--------|
| ≥70 | **Estable** 🟢 | Seguimiento rutinario |
| 50-69 | **Observación** 🟡 | Monitoreo cercano |
| <50 | **Crítico** 🔴 | Intervención inmediata |
| <2 factores | **Sin datos** ⚪ | Insuficiente información |

### Características Avanzadas

- ✅ **Fallback inteligente**: Funciona con datos parciales
- ✅ **Normalización dinámica**: Ajusta pesos según factores disponibles
- ✅ **Ventana móvil**: Promedios de últimos 7 días
- ✅ **Validación robusta**: Filtra valores nulos e inválidos

**Documentación completa:** [PATIENT_STATUS_CALCULATION.md](docs/PATIENT_STATUS_CALCULATION.md)

---

## Componentes Principales

### Dashboard (`src/app/page.tsx`)

- Listado de pacientes con badges de estado
- Selector múltiple para comparativas
- Gráficos comparativos:
  - Pasos diarios (línea)
  - Minutos activos (línea)
  - Calorías (línea)
  - Horas de sueño (línea)
  - Correlación pasos-calorías (scatter)
  - Actividad vs reposo (barras apiladas)
- Filtros por rango de fechas

### Vista Detalle (`src/app/detalle/page.tsx`)

- Header con información del paciente
- Tarjetas de métricas principales
- Navegación por pestañas:
  - Resumen general
  - Actividad física
  - Sueño
  - Respiración y SpO2
  - Calidad del aire
  - Cuestionarios
  - Audio clínico
  - Peso

### Autenticación (`src/components/auth/`)

- **ProtectedRoute**: HOC para proteger rutas
- **AuthContext**: Estado global de autenticación
- **Navbar**: Navegación con perfil y logout
- Integración con Firebase Auth

---

## Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```bash
# Firebase Web SDK (Público)
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id

# Firebase Admin SDK (Privado - NUNCA subir a Git)
FIREBASE_PROJECT_ID=tu_proyecto_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu_proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Base de datos
DATABASE_PATH=./app_1mesfinal2.db

# Opcional: Base URL para metadata
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

**⚠️ IMPORTANTE**: Nunca subir `.env.local` o `firebase-service-account.json` a control de versiones.

---

## Despliegue en Producción

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno en Vercel Dashboard
3. Agregar base de datos como Vercel Blob o servicio externo
4. Deploy automático desde `main` branch

Ver guía completa: [PRODUCTION_SETUP.md](docs/PRODUCTION_SETUP.md)

### Otras Opciones

- Railway
- Render
- Fly.io
- VPS tradicional con PM2

**Importante**: La base de datos SQLite local no es adecuada para producción. Considerar migrar a PostgreSQL, MySQL o servicio gestionado.

Ver: [PRIVATE_DATABASE_DEPLOYMENT.md](docs/PRIVATE_DATABASE_DEPLOYMENT.md)

---

## Desarrollo

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Ejecutar build en producción
npm run lint         # ESLint
npm run type-check   # TypeScript compiler check
```

### Convenciones de Código

- **TypeScript estricto**: Todos los archivos `.ts` y `.tsx`
- **Componentes funcionales**: Usar hooks de React
- **Styled components**: Tailwind CSS con clases utilitarias
- **Naming**:
  - Componentes: PascalCase (`PatientCard.tsx`)
  - Archivos: kebab-case para no-componentes (`data-generator.ts`)
  - Variables/funciones: camelCase

### Estructura de Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: añadir gráfico de tendencias de SpO2
fix: corregir cálculo de promedio de sueño
docs: actualizar guía de despliegue
refactor: optimizar queries de base de datos
```

---

## Base de Datos

### Tablas Principales

1. **usuario**: Datos demográficos y clínicos del paciente
2. **telemonitorizacion**: Registro diario de monitorización
3. **actividad**: Métricas de actividad física (Fitbit)
4. **sleep**: Métricas de sueño y SpO2
5. **picoflujo**: Mediciones de pico de flujo espiratorio
6. **pesaje**: Registro de peso
7. **calidad_aire_interior**: Sensores ambientales
8. **cuestionario**: Evaluaciones CAT y juegos cognitivos
9. **sonidos**: Análisis de audio (tos, habla)

### Relaciones

```
usuario (1) → (n) telemonitorizacion
telemonitorizacion (1) → (1) actividad
telemonitorizacion (1) → (1) sleep
telemonitorizacion (1) → (n) picoflujo
telemonitorizacion (1) → (n) pesaje
telemonitorizacion (1) → (n) calidad_aire_interior
telemonitorizacion (1) → (n) cuestionario
telemonitorizacion (1) → (n) sonidos
```

Ver esquema completo: [SQLITE_GUIDE.md](docs/SQLITE_GUIDE.md)

---

## Testing (Pendiente)

Próximas implementaciones:

- Unit tests con Cypress y Jest
- Integration tests con React Testing Library
- E2E tests con Playwright
- CI/CD con GitHub Actions

---

## Contribuir

### Flujo de Trabajo

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feat/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'feat: descripción'`
4. Push a la rama: `git push origin feat/nueva-funcionalidad`
5. Abrir Pull Request

### Guías de Contribución

- Seguir principios SOLID ([SOLID.md](docs/SOLID.md))
- Revisar auditoría de seguridad ([SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md))
- Documentar nuevos algoritmos clínicos
- Agregar tests para nuevas funcionalidades
- Actualizar documentación en `/docs`

---

## Licencia

MIT License - Ver archivo `LICENSE` para más detalles.

---

## Contacto y Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/aither/issues)
- **Documentación**: Ver directorio `/docs`
- **Email**: a01642529@tec.mx

---

## Roadmap

### Próximas Funcionalidades

- [ ] Sistema de alertas en tiempo real (vía email/notificaciones)
- [x] Exportación de reportes PDF (cumplida)
- [x] Integración con APIs médicas (Cicerone) (cumplida)
- [ ] Dashboard para médicos vs pacientes (separado)
- [ ] App móvil (React Native)
- [ ] Machine Learning para predicción de exacerbaciones (Cicerone) 
- [ ] Tests automatizados (Cypress, Jest)
- [ ] Internacionalización (i18n)

---

**Desarrollado con ❤️ para mejorar el cuidado de pacientes respiratorios**
