# Arquitectura del Sistema Aither Deprecated in 11/11/2025

## Información General del Proyecto

**Nombre:** Aither
**Versión:** 0.1.0 (actualmente no funcional ya que se ha cambiado demasiado requiere una revision completa y cambios exaustivos para esto mejor referirse al README.md)
**Descripción:** Plataforma de Monitorización Clínica para pacientes en tiempo real con visualizaciones clínicas, alertas y gestión de casos.

---

## 1. ARQUITECTURA DE PAQUETES

### 1.1 Estructura General del Proyecto

```
Aither/
├── aither/                    # Aplicación principal Next.js
│   ├── src/                   # Código fuente
│   │   ├── app/              # App Router de Next.js
│   │   ├── components/       # Componentes React
│   │   └── lib/              # Utilidades y lógica de negocio
│   ├── public/               # Archivos estáticos
│   ├── .vercel/              # Configuración de Vercel
│   └── node_modules/         # Dependencias
├── docs/                      # Documentación del sistema
└── package-lock.json         # Lockfile raíz
```

### 1.2 Paquete Principal: `/aither`

#### 1.2.1 Capa de Presentación (`/src/app`)

**Responsabilidad:** Rutas y páginas de la aplicación usando Next.js App Router

**Componentes principales:**
- `layout.tsx` - Layout raíz de la aplicación
  - Configuración de metadatos SEO
  - Configuración de fuentes (Geist Sans, Geist Mono)
  - OpenGraph y Twitter Cards
  - Tema responsive (light/dark)

- `page.tsx` - Página principal (Home)
  - Sistema de selección de pacientes
  - Visualización comparativa de múltiples pacientes
  - Gráficas de resumen (pasos, calorías, actividad)
  - Navegación a vista de detalle

- `detalle/page.tsx` - Página de detalle de paciente
  - Vista detallada de un paciente individual
  - Sistema de tabs con 8 secciones de datos
  - Selector de rango de fechas (7, 15, 30 días, todo)
  - Recuperación de datos desde localStorage

**Dependencias:**
- Next.js 16.0.1 (App Router)
- React 19.2.0
- React DOM 19.2.0

#### 1.2.2 Capa de Componentes (`/src/components`)

**Responsabilidad:** Componentes reutilizables de UI y lógica de presentación

##### 1.2.2.1 Componentes UI Base (`/components/ui`)

**Componentes primitivos:**
- `card.tsx` - Sistema de tarjetas
  - Card (contenedor principal)
  - CardHeader
  - CardTitle
  - CardDescription
  - CardContent
  - CardFooter

- `tabs.tsx` - Sistema de pestañas
  - Tabs (contenedor)
  - TabsList
  - TabsTrigger
  - TabsContent

- `select.tsx` - Componente de selección

**Características:**
- Diseño modular y composable
- Estilizado con Tailwind CSS
- Soporte para temas y variantes

##### 1.2.2.2 Componentes de Detalle (`/components/detalle`)

**Componentes especializados:**
- `Header.tsx` - Encabezado del panel de control
  - Selector de rango de fechas
  - Botón de navegación (volver)
  - Información de pacientes seleccionados

- `PatientCards.tsx` - Tarjetas de pacientes
  - Visualización de pacientes en monitoreo activo
  - Grid responsive

- `tabs/ResumenTab.tsx` - Tab de resumen de métricas
  - Estadísticas de actividad
  - Gráficas de pasos, minutos, calorías

**Dependencias:**
- lucide-react 0.552.0 (iconos)
- Componentes UI base

#### 1.2.3 Capa de Lógica de Negocio (`/src/lib`)

**Responsabilidad:** Utilidades, generadores de datos y lógica de aplicación

**Módulos:**
- `dataGenerator.ts` - Generación de datos de pacientes
  - `generateRandomData()`: Genera datos aleatorios basados en ID de paciente
  - `getDaysFromRange()`: Calcula días según rango seleccionado

**Tipos de datos generados:**
- `resumenData`: Pasos, minutos de actividad, calorías
- `correlacionData`: Relación pasos-calorías-calidad aire
- `calidadAire1Data`: PM2.5, PM10, CO2
- `calidadAire2Data`: Temperatura, humedad
- `cuestionarioData`: Respuestas de 5 preguntas (fatiga, disnea, tos, sueño, ánimo)
- `picoFlujoData`: 3 tomas diarias de flujo espiratorio
- `actividadData`: Minutos en movimiento vs reposo
- `suenoData`: Duración, sueño profundo, REM, ligero

**Características:**
- Generación determinista con semilla basada en ID
- Datos consistentes entre renderizados
- Soporte para múltiples rangos temporales

#### 1.2.4 Capa de Recursos Estáticos (`/public`)

**Recursos disponibles:**
- `favicon-medical.svg` - Favicon médico
- `og-image.svg` - Imagen OpenGraph
- `icons/` - Iconos PWA
  - `medical-192.svg`
  - `medical-512.svg`
  - `apple-touch-icon.svg`
- Iconos diversos: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`

#### 1.2.5 Configuración del Proyecto

**Archivos de configuración:**

1. **package.json** - Definición de proyecto y dependencias
   - Scripts: dev, build, start, lint
   - Dependencias de producción: Next.js, React, Recharts, Lucide React
   - Dependencias de desarrollo: TypeScript, ESLint, Tailwind CSS, Babel React Compiler

2. **tsconfig.json** - Configuración TypeScript
   - Target: ES2017
   - Module: ESNext
   - JSX: react-jsx
   - Path aliases: `@/*` → `./src/*`
   - Strict mode habilitado

3. **next.config.ts** - Configuración Next.js
   - React Compiler habilitado
   - Optimizaciones de rendimiento

4. **eslint.config.mjs** - Configuración ESLint
   - Reglas de código
   - Integración con Next.js

5. **postcss.config.mjs** - Configuración PostCSS
   - Integración Tailwind CSS

6. **tailwindcss** (v4) - Sistema de diseño
   - Utilidades CSS
   - Diseño responsive
   - Temas personalizables

### 1.3 Dependencias del Sistema

#### 1.3.1 Dependencias de Producción

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| next | 16.0.1 | Framework React con SSR/SSG |
| react | 19.2.0 | Librería UI |
| react-dom | 19.2.0 | Renderizado DOM |
| recharts | 3.3.0 | Librería de gráficas |
| lucide-react | 0.552.0 | Sistema de iconos |

#### 1.3.2 Dependencias de Desarrollo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| typescript | ^5 | Lenguaje tipado |
| @types/node | ^20 | Types de Node.js |
| @types/react | ^19 | Types de React |
| @types/react-dom | ^19 | Types de React DOM |
| eslint | ^9 | Linter |
| eslint-config-next | 16.0.1 | Config ESLint para Next.js |
| tailwindcss | ^4 | Framework CSS |
| @tailwindcss/postcss | ^4 | Plugin PostCSS |
| babel-plugin-react-compiler | 1.0.0 | Compilador React |

### 1.4 Flujo de Datos

```
Usuario → Página Principal (page.tsx)
    ↓
Selección de Pacientes (localStorage)
    ↓
    ├→ Visualización Múltiple (comparativas)
    │   ↓
    │   Recharts (LineChart, BarChart, ScatterChart)
    │
    └→ Navegación a Detalle (detalle/page.tsx)
        ↓
        dataGenerator.generateRandomData()
        ↓
        8 Tabs de Visualización
        ↓
        Componentes especializados (Header, PatientCards, ResumenTab)
        ↓
        Componentes UI (Card, Tabs)
```

### 1.5 Patrones de Diseño Utilizados

1. **Component Composition** - Componentes modulares y componibles
2. **Container/Presentational** - Separación lógica/presentación
3. **Custom Hooks** - useState, useEffect, useRouter
4. **Atomic Design** - Componentes UI base → Componentes compuestos
5. **Client-Side Rendering** - Directiva "use client"
6. **Local Storage Pattern** - Persistencia de selección de pacientes

---

## 2. ARQUITECTURA DE DESPLIEGUE

### 2.1 Entorno de Desarrollo

**Plataforma:** macOS (Darwin 25.0.0)
**Gestor de paquetes:** npm
**Puerto de desarrollo:** 3000 (por defecto Next.js)

**Scripts disponibles:**
```bash
npm run dev     # Servidor de desarrollo
npm run build   # Construcción de producción
npm run start   # Servidor de producción
npm run lint    # Análisis estático de código
```

### 2.2 Entorno de Producción

**Plataforma de Hosting:** Vercel
**Configuración:**
- Project ID: `prj_VnjhEbqDLH2VrFozusLHQi0VsVOD`
- Organization ID: `team_JlXJ5W8tkPBjg6vWBn6yqvVl`
- Project Name: `aither`

**Características de Vercel:**
- Deploy automático desde Git
- Edge Network global (CDN)
- Optimizaciones automáticas
- Serverless Functions
- Instant Rollbacks
- Preview Deployments
- Analytics integrado

### 2.3 Pipeline de Build

```
Código fuente (TypeScript/React)
    ↓
Compilación TypeScript → JavaScript
    ↓
React Compiler (optimizaciones)
    ↓
Tailwind CSS → CSS optimizado
    ↓
Next.js Build
    ├→ Static Generation (SSG)
    ├→ Server-Side Rendering (SSR)
    └→ Client Components
    ↓
Optimizaciones Vercel
    ├→ Code splitting
    ├→ Tree shaking
    ├→ Minificación
    └→ Image optimization
    ↓
Deploy a Edge Network
```

### 2.4 Arquitectura de Renderizado

**Estrategia híbrida Next.js:**

1. **Server Components** (por defecto)
   - Layout raíz (`layout.tsx`)
   - Metadatos estáticos

2. **Client Components** ("use client")
   - Página principal (`page.tsx`)
   - Página de detalle (`detalle/page.tsx`)
   - Componentes interactivos (Header, PatientCards, etc.)

3. **Static Assets**
   - Servidos desde CDN
   - Optimizados automáticamente
   - Cacheo agresivo

### 2.5 Almacenamiento de Datos

**Estrategia actual:**
- **Generación en cliente:** Datos generados dinámicamente con `dataGenerator.ts`
- **Persistencia:** localStorage del navegador
- **Alcance:** Selección de pacientes, preferencias de usuario

**Consideraciones para escalabilidad futura:**
- Backend API (REST o GraphQL)
- Base de datos (PostgreSQL, MongoDB)
- Cache distribuido (Redis)
- Tiempo real (WebSockets, Server-Sent Events)

### 2.6 Diagrama de Despliegue

```
┌─────────────────────────────────────────────────┐
│           Usuario (Navegador Web)                │
│  - Chrome, Firefox, Safari, Edge                │
│  - localStorage para persistencia               │
└────────────────┬────────────────────────────────┘
                 │ HTTPS
                 ↓
┌─────────────────────────────────────────────────┐
│         Vercel Edge Network (CDN)               │
│  - Distribución global                          │
│  - SSL/TLS automático                           │
│  - Cacheo inteligente                           │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│        Vercel Serverless Functions              │
│  - Next.js 16 Runtime                           │
│  - React 19 Server Components                   │
│  - Renderizado híbrido (SSR/SSG)                │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│         Aplicación Next.js (Aither)             │
│  ┌───────────────────────────────────────────┐  │
│  │  App Router (/app)                        │  │
│  │  - layout.tsx (Server Component)          │  │
│  │  - page.tsx (Client Component)            │  │
│  │  - detalle/page.tsx (Client Component)    │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  Components (/components)                 │  │
│  │  - UI Components (card, tabs, select)     │  │
│  │  - Detalle Components                     │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  Business Logic (/lib)                    │  │
│  │  - dataGenerator.ts                       │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  Static Assets (/public)                  │  │
│  │  - Icons, Images, Fonts                   │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 2.7 Seguridad y Performance

**Medidas de seguridad:**
- HTTPS obligatorio (Vercel)
- Headers de seguridad (CSP, HSTS)
- Input validation (TypeScript strict mode)
- No almacenamiento de datos sensibles en cliente

**Optimizaciones de rendimiento:**
- Code splitting automático (Next.js)
- Image optimization (next/image)
- Font optimization (next/font)
- React Compiler (optimización de re-renders)
- Tailwind CSS purging (CSS mínimo)
- Lazy loading de componentes
- Prefetching de rutas

### 2.8 Monitoreo y Analytics

**Capacidades de Vercel:**
- Real User Monitoring (RUM)
- Web Vitals tracking
- Error tracking
- Deploy logs
- Build analytics

---

## 3. TECNOLOGÍAS CLAVE

### 3.1 Stack Tecnológico

**Frontend:**
- React 19.2.0 - Librería UI con React Compiler
- Next.js 16.0.1 - Framework fullstack con App Router
- TypeScript 5 - Tipado estático
- Tailwind CSS 4 - Utility-first CSS

**Visualización de Datos:**
- Recharts 3.3.0 - Gráficas responsivas (Line, Bar, Scatter)
- Lucide React 0.552.0 - Iconos SVG

**Tooling:**
- ESLint 9 - Code quality
- Babel React Compiler - Performance optimizations
- PostCSS - CSS processing

### 3.2 Compatibilidad de Navegadores

**Soporte:**
- Chrome/Edge (moderno)
- Firefox (moderno)
- Safari (moderno)
- Target: ES2017+

**Features utilizadas:**
- ES Modules
- Async/await
- localStorage API
- CSS Grid/Flexbox
- SVG rendering

---

## 4. MÓDULOS Y RESPONSABILIDADES

### 4.1 Módulo de Presentación (App Router)

**Responsabilidades:**
- Routing y navegación
- SEO y metadatos
- Server-Side Rendering
- Client-Side Rendering
- Layout compartido

**Archivos clave:**
- `/src/app/layout.tsx`
- `/src/app/page.tsx`
- `/src/app/detalle/page.tsx`

### 4.2 Módulo de Componentes UI

**Responsabilidades:**
- Componentes reutilizables
- Sistema de diseño
- Accesibilidad
- Responsive design

**Archivos clave:**
- `/src/components/ui/card.tsx`
- `/src/components/ui/tabs.tsx`
- `/src/components/ui/select.tsx`

### 4.3 Módulo de Visualización de Datos

**Responsabilidades:**
- Gráficas interactivas
- Procesamiento de métricas
- Comparativas de pacientes
- Rangos temporales

**Componentes Recharts utilizados:**
- LineChart (tendencias temporales)
- BarChart (comparativas)
- ScatterChart (correlaciones)
- CartesianGrid, XAxis, YAxis, Tooltip, Legend

### 4.4 Módulo de Lógica de Negocio

**Responsabilidades:**
- Generación de datos
- Cálculo de estadísticas
- Transformación de datos
- Validación de rangos

**Archivos clave:**
- `/src/lib/dataGenerator.ts`

### 4.5 Módulo de Estado y Persistencia

**Responsabilidades:**
- Gestión de estado (React hooks)
- Persistencia local (localStorage)
- Sincronización entre páginas
- Navegación con estado

**Hooks utilizados:**
- `useState` - Estado local de componentes
- `useEffect` - Efectos y sincronización
- `useRouter` - Navegación programática
- `useMemo` - Memorización de cálculos

---

## 5. CONSIDERACIONES PARA DIAGRAMAS UML

### 5.1 Diagrama de Paquetes Sugerido

**Paquetes principales:**
1. `app` (Routing y páginas)
2. `components.ui` (Componentes base)
3. `components.detalle` (Componentes especializados)
4. `lib` (Utilidades y lógica)
5. `public` (Assets estáticos)

**Dependencias:**
- `app` → `components.ui`
- `app` → `components.detalle`
- `app` → `lib`
- `components.detalle` → `components.ui`
- `components.detalle` → `lib`

### 5.2 Diagrama de Despliegue Sugerido

**Nodos:**
1. **Cliente (Navegador)**
   - Artefactos: HTML, CSS, JavaScript bundled, localStorage

2. **Vercel Edge CDN**
   - Artefactos: Static assets, cached pages

3. **Vercel Serverless**
   - Artefactos: Next.js runtime, React Server Components

4. **Build Pipeline**
   - Artefactos: TypeScript compiler, Babel, Tailwind, Next.js bundler

**Conexiones:**
- Cliente ↔ Edge CDN (HTTPS)
- Edge CDN ↔ Serverless (Internal)
- Git Repo → Build Pipeline → Deploy

---

## 6. MODELO ENTIDAD-RELACIÓN (MER)

### 6.1 Introducción al Modelo de Datos

El sistema Aither actualmente utiliza un modelo de datos **generado en cliente** sin persistencia en base de datos. Sin embargo, para crear el diagrama MER/ERD, se documenta aquí el modelo conceptual de datos que representa las entidades del dominio médico y sus relaciones.

### 6.2 Entidades Principales

#### 6.2.1 Entidad: PACIENTE

**Descripción:** Representa a un paciente en el sistema de monitoreo clínico.

**Atributos:**

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id | String | PK, NOT NULL, UNIQUE | Identificador único (formato: P001, P002, ...) |
| nombre | String | NOT NULL | Nombre completo del paciente |
| edad | Integer | NOT NULL, CHECK (edad >= 0 AND edad <= 120) | Edad del paciente en años |
| estado | Enum | NOT NULL | Estado clínico: 'estable', 'observación', 'crítico' |
| color | String | NOT NULL | Color asignado para visualización (hex) |
| fecha_registro | DateTime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de alta en el sistema |

**Reglas de negocio:**
- Cada paciente debe tener un ID único generado por el sistema
- El estado debe ser uno de los valores permitidos
- La edad debe estar en un rango válido

#### 6.2.2 Entidad: REGISTRO_ACTIVIDAD

**Descripción:** Registros diarios de actividad física del paciente.

**Atributos:**

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id | Integer | PK, AUTO_INCREMENT | Identificador único del registro |
| paciente_id | String | FK → PACIENTE(id), NOT NULL | Referencia al paciente |
| fecha | Date | NOT NULL | Fecha del registro |
| pasos | Integer | NOT NULL, CHECK (pasos >= 0) | Número de pasos diarios |
| minutos_actividad | Integer | NOT NULL, CHECK (minutos >= 0) | Minutos de actividad física |
| calorias_quemadas | Integer | NOT NULL, CHECK (calorias >= 0) | Calorías quemadas en el día |
| minutos_movimiento | Integer | CHECK (minutos >= 0) | Minutos en movimiento |
| minutos_reposo | Integer | CHECK (minutos >= 0) | Minutos en reposo |

**Índices:**
- UNIQUE(paciente_id, fecha) - Un registro por paciente por día
- INDEX(fecha) - Búsquedas por rango de fechas

#### 6.2.3 Entidad: CALIDAD_AIRE

**Descripción:** Mediciones de calidad del aire ambiental.

**Atributos:**

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id | Integer | PK, AUTO_INCREMENT | Identificador único del registro |
| paciente_id | String | FK → PACIENTE(id), NOT NULL | Referencia al paciente |
| fecha | Date | NOT NULL | Fecha de la medición |
| pm25 | Decimal(5,2) | NOT NULL, CHECK (pm25 >= 0) | Partículas PM2.5 (µg/m³) |
| pm10 | Decimal(5,2) | NOT NULL, CHECK (pm10 >= 0) | Partículas PM10 (µg/m³) |
| co2 | Integer | NOT NULL, CHECK (co2 >= 0) | Nivel de CO2 (ppm) |
| temperatura | Decimal(4,2) | CHECK (temp >= -50 AND temp <= 60) | Temperatura ambiente (°C) |
| humedad | Decimal(5,2) | CHECK (humedad >= 0 AND humedad <= 100) | Humedad relativa (%) |

**Valores de referencia:**
- PM2.5: Límite recomendado 25 µg/m³
- PM10: Límite recomendado 50 µg/m³
- CO2: Límite recomendado 1000 ppm

#### 6.2.4 Entidad: CUESTIONARIO_SALUD

**Descripción:** Respuestas diarias a cuestionario de salud del paciente.

**Atributos:**

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id | Integer | PK, AUTO_INCREMENT | Identificador único |
| paciente_id | String | FK → PACIENTE(id), NOT NULL | Referencia al paciente |
| fecha | Date | NOT NULL | Fecha del cuestionario |
| fatiga | Integer | NOT NULL, CHECK (fatiga >= 1 AND fatiga <= 5) | Nivel de fatiga (escala 1-5) |
| disnea | Integer | NOT NULL, CHECK (disnea >= 1 AND disnea <= 5) | Nivel de dificultad respiratoria |
| tos | Integer | NOT NULL, CHECK (tos >= 1 AND tos <= 5) | Nivel de tos |
| calidad_sueno | Integer | NOT NULL, CHECK (calidad >= 1 AND calidad <= 5) | Calidad del sueño |
| estado_animo | Integer | NOT NULL, CHECK (animo >= 1 AND animo <= 5) | Estado de ánimo |

**Escala de valores:**
- 1: Muy bajo / Excelente
- 5: Muy alto / Muy malo

#### 6.2.5 Entidad: PICO_FLUJO

**Descripción:** Mediciones diarias de pico de flujo espiratorio (PEF).

**Atributos:**

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id | Integer | PK, AUTO_INCREMENT | Identificador único |
| paciente_id | String | FK → PACIENTE(id), NOT NULL | Referencia al paciente |
| fecha | Date | NOT NULL | Fecha de las mediciones |
| toma1 | Integer | NOT NULL, CHECK (toma >= 0) | Primera medición (L/min) |
| toma2 | Integer | NOT NULL, CHECK (toma >= 0) | Segunda medición (L/min) |
| toma3 | Integer | NOT NULL, CHECK (toma >= 0) | Tercera medición (L/min) |
| promedio | Integer | CALCULATED | Promedio de las tres tomas |
| hora_toma1 | Time | | Hora de primera toma |
| hora_toma2 | Time | | Hora de segunda toma |
| hora_toma3 | Time | | Hora de tercera toma |

**Rango típico:** 350-420 L/min (varía según edad, sexo, altura)

#### 6.2.6 Entidad: REGISTRO_SUENO

**Descripción:** Registro diario de patrones de sueño.

**Atributos:**

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id | Integer | PK, AUTO_INCREMENT | Identificador único |
| paciente_id | String | FK → PACIENTE(id), NOT NULL | Referencia al paciente |
| fecha | Date | NOT NULL | Fecha (noche del sueño) |
| duracion_total | Decimal(4,2) | NOT NULL, CHECK (duracion >= 0 AND duracion <= 24) | Horas totales de sueño |
| sueno_profundo | Decimal(4,2) | CHECK (profundo >= 0) | Horas de sueño profundo |
| sueno_rem | Decimal(4,2) | CHECK (rem >= 0) | Horas de sueño REM |
| sueno_ligero | Decimal(4,2) | CHECK (ligero >= 0) | Horas de sueño ligero |
| hora_inicio | Time | | Hora de inicio del sueño |
| hora_fin | Time | | Hora de despertar |

**Validación:**
- sueno_profundo + sueno_rem + sueno_ligero ≤ duracion_total

#### 6.2.7 Entidad: CORRELACION_DATOS

**Descripción:** Tabla derivada para análisis de correlaciones entre métricas.

**Atributos:**

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id | Integer | PK, AUTO_INCREMENT | Identificador único |
| paciente_id | String | FK → PACIENTE(id), NOT NULL | Referencia al paciente |
| fecha | Date | NOT NULL | Fecha del análisis |
| pasos | Integer | | Pasos del día |
| calorias | Integer | | Calorías quemadas |
| calidad_aire_indice | Decimal(5,2) | | Índice de calidad del aire |

**Propósito:** Facilitar análisis de correlación entre actividad física y calidad del aire.

### 6.3 Relaciones entre Entidades

#### 6.3.1 Relación: PACIENTE - REGISTRO_ACTIVIDAD

- **Tipo:** Uno a Muchos (1:N)
- **Cardinalidad:** Un paciente tiene múltiples registros de actividad (uno por día)
- **Participación:**
  - PACIENTE: Opcional (un paciente puede no tener registros aún)
  - REGISTRO_ACTIVIDAD: Obligatoria (todo registro pertenece a un paciente)
- **Clave foránea:** `REGISTRO_ACTIVIDAD.paciente_id` → `PACIENTE.id`
- **Operaciones en cascada:**
  - ON DELETE CASCADE (eliminar paciente elimina sus registros)
  - ON UPDATE CASCADE

#### 6.3.2 Relación: PACIENTE - CALIDAD_AIRE

- **Tipo:** Uno a Muchos (1:N)
- **Cardinalidad:** Un paciente tiene múltiples mediciones de calidad de aire
- **Participación:**
  - PACIENTE: Opcional
  - CALIDAD_AIRE: Obligatoria
- **Clave foránea:** `CALIDAD_AIRE.paciente_id` → `PACIENTE.id`
- **Operaciones en cascada:** ON DELETE CASCADE, ON UPDATE CASCADE

#### 6.3.3 Relación: PACIENTE - CUESTIONARIO_SALUD

- **Tipo:** Uno a Muchos (1:N)
- **Cardinalidad:** Un paciente completa múltiples cuestionarios (uno por día)
- **Participación:**
  - PACIENTE: Opcional
  - CUESTIONARIO_SALUD: Obligatoria
- **Clave foránea:** `CUESTIONARIO_SALUD.paciente_id` → `PACIENTE.id`
- **Operaciones en cascada:** ON DELETE CASCADE, ON UPDATE CASCADE

#### 6.3.4 Relación: PACIENTE - PICO_FLUJO

- **Tipo:** Uno a Muchos (1:N)
- **Cardinalidad:** Un paciente tiene múltiples mediciones de pico de flujo
- **Participación:**
  - PACIENTE: Opcional
  - PICO_FLUJO: Obligatoria
- **Clave foránea:** `PICO_FLUJO.paciente_id` → `PACIENTE.id`
- **Operaciones en cascada:** ON DELETE CASCADE, ON UPDATE CASCADE

#### 6.3.5 Relación: PACIENTE - REGISTRO_SUENO

- **Tipo:** Uno a Muchos (1:N)
- **Cardinalidad:** Un paciente tiene múltiples registros de sueño
- **Participación:**
  - PACIENTE: Opcional
  - REGISTRO_SUENO: Obligatoria
- **Clave foránea:** `REGISTRO_SUENO.paciente_id` → `PACIENTE.id`
- **Operaciones en cascada:** ON DELETE CASCADE, ON UPDATE CASCADE

#### 6.3.6 Relación: PACIENTE - CORRELACION_DATOS

- **Tipo:** Uno a Muchos (1:N)
- **Cardinalidad:** Un paciente tiene múltiples registros de correlación
- **Participación:**
  - PACIENTE: Opcional
  - CORRELACION_DATOS: Obligatoria
- **Clave foránea:** `CORRELACION_DATOS.paciente_id` → `PACIENTE.id`
- **Operaciones en cascada:** ON DELETE CASCADE, ON UPDATE CASCADE

### 6.4 Diagrama Entidad-Relación (Notación Chen - Textual)

```
┌─────────────┐
│  PACIENTE   │
├─────────────┤
│ PK id       │
│    nombre   │
│    edad     │
│    estado   │
│    color    │
│    fecha_reg│
└──────┬──────┘
       │
       │ 1
       │
       ├─────────────────┐
       │                 │
       │ N               │ N
       │                 │
┌──────▼──────────┐  ┌───▼──────────────┐
│ REGISTRO_       │  │  CALIDAD_AIRE    │
│ ACTIVIDAD       │  ├──────────────────┤
├─────────────────┤  │ PK id            │
│ PK id           │  │ FK paciente_id   │
│ FK paciente_id  │  │    fecha         │
│    fecha        │  │    pm25          │
│    pasos        │  │    pm10          │
│    minutos_act  │  │    co2           │
│    calorias     │  │    temperatura   │
│    min_mov      │  │    humedad       │
│    min_reposo   │  └──────────────────┘
└─────────────────┘
       │
       │ N
       │
       │
┌──────▼──────────────┐
│ CUESTIONARIO_SALUD  │
├─────────────────────┤
│ PK id               │
│ FK paciente_id      │
│    fecha            │
│    fatiga           │
│    disnea           │
│    tos              │
│    calidad_sueno    │
│    estado_animo     │
└─────────────────────┘

       │
       │ N
       │
┌──────▼──────────┐      ┌──────────────────┐
│  PICO_FLUJO     │      │ REGISTRO_SUENO   │
├─────────────────┤      ├──────────────────┤
│ PK id           │      │ PK id            │
│ FK paciente_id  │      │ FK paciente_id   │
│    fecha        │      │    fecha         │
│    toma1        │      │    duracion_total│
│    toma2        │      │    sueno_profundo│
│    toma3        │      │    sueno_rem     │
│    promedio     │      │    sueno_ligero  │
│    hora_toma1   │      │    hora_inicio   │
│    hora_toma2   │      │    hora_fin      │
│    hora_toma3   │      └──────────────────┘
└─────────────────┘
       │
       │ N
       │
┌──────▼───────────────┐
│ CORRELACION_DATOS    │
├──────────────────────┤
│ PK id                │
│ FK paciente_id       │
│    fecha             │
│    pasos             │
│    calorias          │
│    calidad_aire_ind  │
└──────────────────────┘
```

### 6.5 Restricciones de Integridad

#### 6.5.1 Restricciones de Clave Primaria
- Todas las entidades tienen clave primaria única y no nula
- `PACIENTE.id` es clave primaria de tipo String (formato alfanumérico)
- Resto de entidades usan claves primarias auto-incrementales

#### 6.5.2 Restricciones de Clave Foránea
- Todas las FK referencian a `PACIENTE.id`
- Integridad referencial garantizada
- Operaciones en cascada configuradas para mantener consistencia

#### 6.5.3 Restricciones de Dominio

**Rangos numéricos:**
- Edad: 0-120 años
- Escalas de cuestionario: 1-5
- Porcentajes (humedad): 0-100
- Valores de medición: >= 0

**Valores categóricos:**
- Estado del paciente: ENUM('estable', 'observación', 'crítico')

**Restricciones temporales:**
- Fechas no pueden ser futuras
- Una sola medición por paciente por día (UNIQUE constraint)

#### 6.5.4 Restricciones de Negocio

1. **Consistencia temporal:**
   - Las fechas de registros deben ser <= fecha actual
   - Registros históricos no se pueden modificar

2. **Validación de sueño:**
   - Suma de fases de sueño ≤ duración total
   - Duración total ≤ 24 horas

3. **Validación de actividad:**
   - minutos_movimiento + minutos_reposo ≤ 1440 (24h en minutos)

4. **Pico de flujo:**
   - Las 3 tomas deben estar dentro del rango esperado (300-600 L/min típicamente)

### 6.6 Índices y Optimizaciones

**Índices recomendados:**

```sql
-- Búsquedas por paciente
CREATE INDEX idx_actividad_paciente ON REGISTRO_ACTIVIDAD(paciente_id);
CREATE INDEX idx_aire_paciente ON CALIDAD_AIRE(paciente_id);
CREATE INDEX idx_cuestionario_paciente ON CUESTIONARIO_SALUD(paciente_id);
CREATE INDEX idx_pico_paciente ON PICO_FLUJO(paciente_id);
CREATE INDEX idx_sueno_paciente ON REGISTRO_SUENO(paciente_id);

-- Búsquedas por fecha
CREATE INDEX idx_actividad_fecha ON REGISTRO_ACTIVIDAD(fecha);
CREATE INDEX idx_aire_fecha ON CALIDAD_AIRE(fecha);

-- Índices compuestos para consultas comunes
CREATE UNIQUE INDEX idx_actividad_paciente_fecha
  ON REGISTRO_ACTIVIDAD(paciente_id, fecha);
CREATE UNIQUE INDEX idx_aire_paciente_fecha
  ON CALIDAD_AIRE(paciente_id, fecha);
```

### 6.7 Consultas Típicas del Sistema

**1. Obtener todos los registros de un paciente en un rango:**
```sql
SELECT * FROM REGISTRO_ACTIVIDAD
WHERE paciente_id = 'P001'
  AND fecha BETWEEN '2025-01-01' AND '2025-01-07'
ORDER BY fecha;
```

**2. Calcular promedios de actividad:**
```sql
SELECT
  paciente_id,
  AVG(pasos) as promedio_pasos,
  AVG(minutos_actividad) as promedio_minutos,
  AVG(calorias_quemadas) as promedio_calorias
FROM REGISTRO_ACTIVIDAD
WHERE paciente_id = 'P001'
  AND fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY paciente_id;
```

**3. Obtener estado actual de pacientes:**
```sql
SELECT id, nombre, edad, estado
FROM PACIENTE
WHERE estado IN ('observación', 'crítico')
ORDER BY estado DESC, nombre;
```

**4. Análisis de correlación actividad-calidad aire:**
```sql
SELECT
  a.fecha,
  a.pasos,
  a.calorias_quemadas,
  c.pm25,
  c.co2
FROM REGISTRO_ACTIVIDAD a
JOIN CALIDAD_AIRE c
  ON a.paciente_id = c.paciente_id
  AND a.fecha = c.fecha
WHERE a.paciente_id = 'P001'
ORDER BY a.fecha;
```

### 6.8 Implementación Actual vs Modelo Propuesto

**Estado actual:**
- Datos generados dinámicamente en cliente
- Sin persistencia en base de datos
- Uso de localStorage para selección de pacientes

**Modelo propuesto (para futuro):**
- Base de datos relacional (PostgreSQL, MySQL)
- API REST/GraphQL para acceso a datos
- Autenticación y autorización
- Sincronización tiempo real
- Histórico completo de pacientes

### 6.9 Normalización del Modelo

El modelo propuesto está en **Tercera Forma Normal (3NF)**:

- **1NF:** Todos los atributos son atómicos, no hay grupos repetitivos
- **2NF:** No hay dependencias parciales (todas las FK dependen completamente de PK)
- **3NF:** No hay dependencias transitivas entre atributos no clave

**Atributo calculado:**
- `PICO_FLUJO.promedio` es un campo calculado que se puede derivar de toma1, toma2, toma3
- Se incluye por rendimiento (desnormalización controlada)

---

## 7. FUTURAS EXTENSIONES

### 7.1 Escalabilidad

**Backend API:**
- RESTful API o GraphQL
- Autenticación y autorización
- Base de datos para pacientes reales
- Tiempo real con WebSockets

**Infraestructura:**
- Microservicios para módulos independientes
- Cache distribuido (Redis)
- Message queue (RabbitMQ, Kafka)
- Monitoreo avanzado (Datadog, New Relic)

### 7.2 Funcionalidades

**Clínicas:**
- Alertas en tiempo real
- Integración con dispositivos médicos
- Histórico de pacientes
- Reportes exportables (PDF)

**Técnicas:**
- PWA (Progressive Web App)
- Notificaciones push
- Modo offline
- Tests automatizados (Jest, Cypress)

---

## 8. GLOSARIO TÉCNICO

| Término | Definición |
|---------|------------|
| App Router | Sistema de routing de Next.js basado en sistema de archivos |
| SSR | Server-Side Rendering - renderizado en servidor |
| SSG | Static Site Generation - generación estática |
| CSR | Client-Side Rendering - renderizado en cliente |
| Edge Network | Red de servidores distribuidos globalmente (CDN) |
| Serverless | Arquitectura sin gestión de servidores |
| React Compiler | Herramienta de optimización automática de React |
| Tailwind CSS | Framework CSS utility-first |
| TypeScript | Superset tipado de JavaScript |
| Recharts | Librería de gráficas basada en D3 |

---

**Documento generado el:** 2025-11-08
**Versión del documento:** 1.0
**Autor:** Documentación técnica de Aither
