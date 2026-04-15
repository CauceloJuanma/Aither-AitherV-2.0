# Cálculo del Estado del Paciente

## Descripción General

El sistema Aither utiliza un **algoritmo multi-factor ponderado** para determinar el estado de salud de los pacientes. Este algoritmo evalúa cuatro factores clave relacionados con la función respiratoria y el bienestar general del paciente.

## Sistema de Puntuación

El estado del paciente se calcula mediante un sistema de puntuación de **0-100 puntos**, donde cada factor de salud contribuye con un peso específico al score final.

### Factores Evaluados

| Factor | Peso | Importancia |
|--------|------|-------------|
| **SpO2** (Saturación de Oxígeno) | 35% | Crítico - Indicador directo de función respiratoria |
| **Pico Flujo** | 30% | Alta - Medida de función pulmonar |
| **Actividad Física** (Pasos) | 20% | Media - Indicador de movilidad general |
| **Horas de Sueño** | 15% | Baja - Indicador de descanso y recuperación |

---

## Criterios de Puntuación por Factor

### 1. SpO2 - Saturación de Oxígeno en Sangre (35%)

Mide el porcentaje de hemoglobina saturada con oxígeno en la sangre.

| Rango SpO2 | Puntos | Interpretación |
|------------|--------|----------------|
| ≥ 95% | 100 | Saturación normal |
| 90-94% | 50 | Saturación borderline - requiere monitoreo |
| < 90% | 0 | Saturación crítica - hipoxemia |

**Fuente de datos:** Campo `spo2` en tabla `sleep` (promedio de últimos 7 días)

**Ejemplo de cálculo:**
```
Promedio SpO2 = 96%
Score SpO2 = 100 puntos
Contribución al total = 100 × 0.35 = 35 puntos
```

---

### 2. Pico Flujo (30%)

Mide la velocidad máxima de espiración (L/min), indicador clave de función pulmonar.

| Rango Pico Flujo | Puntos | Interpretación |
|------------------|--------|----------------|
| ≥ 400 L/min | 100 | Excelente función pulmonar |
| 250-399 L/min | 70 | Función pulmonar aceptable |
| 150-249 L/min | 40 | Función pulmonar reducida |
| < 150 L/min | 0 | Función pulmonar muy deteriorada |

**Fuente de datos:** Campo `valormedio` en tabla `picoflujo` (promedio de últimos 7 días)

**Ejemplo de cálculo:**
```
Promedio Pico Flujo = 320 L/min
Score Pico Flujo = 70 puntos
Contribución al total = 70 × 0.30 = 21 puntos
```

---

### 3. Actividad Física - Pasos Diarios (20%)

Mide el nivel de movilidad y actividad física del paciente.

| Rango Pasos | Puntos | Interpretación |
|-------------|--------|----------------|
| ≥ 5,000 pasos/día | 100 | Actividad excelente |
| 2,000-4,999 pasos/día | 60 | Actividad moderada |
| < 2,000 pasos/día | 20 | Actividad muy reducida |

**Fuente de datos:** Campo `steps` en tabla `actividad` (promedio de últimos 7 días)

**Ejemplo de cálculo:**
```
Promedio Pasos = 3,500 pasos
Score Pasos = 60 puntos
Contribución al total = 60 × 0.20 = 12 puntos
```

---

### 4. Horas de Sueño (15%)

Mide la calidad del descanso nocturno del paciente.

| Rango Sueño | Puntos | Interpretación |
|-------------|--------|----------------|
| 7-9 horas | 100 | Sueño óptimo |
| 6-7 horas o 9-10 horas | 70 | Sueño aceptable |
| 5-6 horas | 40 | Sueño insuficiente |
| < 5 horas o > 10 horas | 0 | Sueño muy deficiente o excesivo |

**Fuente de datos:** Campo `totalMinutesAsleep` en tabla `sleep` convertido a horas (promedio de últimos 7 días)

**Ejemplo de cálculo:**
```
Promedio Sueño = 7.5 horas
Score Sueño = 100 puntos
Contribución al total = 100 × 0.15 = 15 puntos
```

---

## Cálculo del Score Final

### Fórmula Base

```
Score Final = (Score_SpO2 × 0.35) + (Score_PicoFlujo × 0.30) +
              (Score_Pasos × 0.20) + (Score_Sueño × 0.15)
```

### Sistema de Fallback para Datos Faltantes

El algoritmo incluye un **mecanismo inteligente de normalización** cuando faltan datos de algún factor:

1. **Detección de valores válidos**: Solo se consideran valores no nulos y mayores a 0
2. **Recálculo de pesos**: Los pesos se ajustan dinámicamente según los factores disponibles
3. **Normalización**: El score se normaliza a escala 0-100

#### Fórmula con Normalización

```
Score Final Normalizado = (Suma de Contribuciones / Suma de Pesos Disponibles) × 100
```

#### Requisitos Mínimos

- **Mínimo 2 factores** con datos válidos para generar una evaluación
- Si hay menos de 2 factores: estado = `sin datos`

---

## Clasificación Final del Estado

El score final se traduce en uno de estos estados:

| Score Final | Estado | Color | Descripción |
|-------------|--------|-------|-------------|
| ≥ 70 | **Estable** | Verde | Paciente en condiciones normales |
| 50-69 | **Observación** | Amarillo | Paciente requiere monitoreo cercano |
| < 50 | **Crítico** | Rojo | Paciente requiere atención inmediata |
| < 2 factores | **Sin datos** | Gris | Datos insuficientes para evaluación |

---

## Ejemplos Completos

### Ejemplo 1: Paciente Estable (Score: 100)

**Datos disponibles (últimos 7 días):**
- SpO2: 96%
- Pico Flujo: 420 L/min
- Pasos: 6,000 pasos/día
- Sueño: 8 horas

**Cálculo:**
```
Score SpO2       = 100 × 0.35 = 35.0
Score Pico Flujo = 100 × 0.30 = 30.0
Score Pasos      = 100 × 0.20 = 20.0
Score Sueño      = 100 × 0.15 = 15.0
--------------------------------
Score Final      = 100.0
Estado           = Estable ✅
```

---

### Ejemplo 2: Paciente en Observación (Score: 58)

**Datos disponibles (últimos 7 días):**
- SpO2: 92%
- Pico Flujo: 280 L/min
- Pasos: 3,200 pasos/día
- Sueño: 6.5 horas

**Cálculo:**
```
Score SpO2       = 50 × 0.35 = 17.5
Score Pico Flujo = 70 × 0.30 = 21.0
Score Pasos      = 60 × 0.20 = 12.0
Score Sueño      = 70 × 0.15 = 10.5
--------------------------------
Score Final      = 61.0
Estado           = Observación ⚠️
```

---

### Ejemplo 3: Paciente Crítico (Score: 28.5)

**Datos disponibles (últimos 7 días):**
- SpO2: 88%
- Pico Flujo: 140 L/min
- Pasos: 1,500 pasos/día
- Sueño: 4.5 horas

**Cálculo:**
```
Score SpO2       = 0 × 0.35 = 0.0
Score Pico Flujo = 0 × 0.30 = 0.0
Score Pasos      = 20 × 0.20 = 4.0
Score Sueño      = 0 × 0.15 = 0.0
--------------------------------
Score Final      = 4.0
Estado           = Crítico 🔴
```

---

### Ejemplo 4: Datos Parciales con Normalización (Score: 66.88)

**Datos disponibles (últimos 7 días):**
- SpO2: 92%
- Pico Flujo: 280 L/min
- Pasos: **SIN DATOS**
- Sueño: 7.5 horas

**Cálculo con normalización:**
```
Score SpO2       = 50 × 0.35 = 17.5
Score Pico Flujo = 70 × 0.30 = 21.0
Score Pasos      = No disponible
Score Sueño      = 100 × 0.15 = 15.0
--------------------------------
Suma Parcial     = 53.5
Peso Total       = 0.35 + 0.30 + 0.15 = 0.80

Score Normalizado = (53.5 / 0.80) × 100 = 66.88
Estado            = Observación ⚠️
```

---

### Ejemplo 5: Datos Insuficientes

**Datos disponibles (últimos 7 días):**
- SpO2: **SIN DATOS**
- Pico Flujo: **SIN DATOS**
- Pasos: 3,000 pasos/día
- Sueño: **SIN DATOS**

**Resultado:**
```
Factores con datos válidos = 1 (solo Pasos)
Factores requeridos        = 2 mínimo
--------------------------------
Estado = Sin datos ⚪
```

---

## Implementación Técnica

### Ubicación del Código

**Función de evaluación:** `src/app/page.tsx:34-160`
```typescript
const determinarEstado = (resumenData: any[], suenoData: any[])
```

**Endpoint API:** `src/app/api/db/pacientes/resumen/route.ts`
- Recopila datos de SpO2, Pico Flujo, Actividad y Sueño
- Calcula promedios de los últimos 7 días
- Retorna datos agregados para evaluación

### Flujo de Datos

```
1. API Request → /api/db/pacientes/resumen
2. Consulta a base de datos SQLite
   ├── Tabla: actividad (pasos)
   ├── Tabla: sleep (SpO2, horas de sueño)
   └── Tabla: picoflujo (pico flujo)
3. Procesamiento de datos
   ├── Parseo de SpO2 desde JSON
   ├── Cálculo de promedios de 7 días
   └── Filtrado de valores nulos
4. Evaluación → determinarEstado()
   ├── Scoring por factor
   ├── Aplicación de pesos
   ├── Normalización si hay datos faltantes
   └── Clasificación final
5. Renderizado en UI con código de color
```

---

## Validación y Manejo de Errores

### Validaciones Implementadas

1. **Valores nulos o inválidos:**
   - Se filtran valores `null`, `undefined` o `<= 0`
   - Se usa `filter()` antes de calcular promedios

2. **División por cero:**
   - Se verifica `pesoTotal > 0` antes de normalizar
   - Retorna score 0 si no hay pesos disponibles

3. **Arrays vacíos:**
   - Se verifica `length > 0` antes de calcular promedios
   - Factor ignorado si no hay datos válidos

4. **Datos insuficientes:**
   - Se requieren mínimo 2 factores para evaluar
   - Estado = "sin datos" si no se cumple el requisito

### Manejo de Casos Especiales

**SpO2 como JSON:**
```typescript
// El campo SpO2 puede estar en formato JSON array
const spo2Data = JSON.parse(sleep.spo2);
if (Array.isArray(spo2Data)) {
  const validValues = spo2Data
    .map(item => item.value || item)
    .filter(val => typeof val === 'number' && val > 0);
  spo2Value = promedio(validValues);
}
```

---

## Consideraciones Clínicas

### Fundamentos Médicos

1. **SpO2 (35% de peso):**
   - Valores normales: 95-100%
   - Hipoxemia moderada: 90-94%
   - Hipoxemia severa: <90%
   - **Crítico en EPOC**: La saturación baja indica insuficiencia respiratoria

2. **Pico Flujo (30% de peso):**
   - Valores normales adultos: 400-600 L/min
   - Obstrucción moderada: 250-400 L/min
   - Obstrucción severa: <250 L/min
   - **Indicador clave**: Medida directa de función pulmonar

3. **Actividad Física (20% de peso):**
   - Recomendación general: 5,000-10,000 pasos/día
   - Pacientes EPOC: 2,000-5,000 pasos aceptable
   - **Indicador de capacidad funcional**: Menor actividad = mayor deterioro

4. **Sueño (15% de peso):**
   - Recomendación adultos: 7-9 horas
   - Sueño <6h o >10h asociado a peores resultados de salud
   - **Importante para recuperación**: Pero menos crítico que factores respiratorios

### Periodo de Evaluación: 7 Días

Se usa un promedio móvil de **7 días** para:
- Reducir variabilidad diaria
- Detectar tendencias sostenidas
- Evitar alarmas por datos aislados
- Mantener sensibilidad a cambios recientes

---

## Personalización y Ajustes Futuros

### Parámetros Configurables

Actualmente los umbrales están hardcodeados, pero podrían externalizarse a configuración:

```typescript
// Ejemplo de configuración futura
const CONFIG = {
  weights: {
    spo2: 0.35,
    picoFlujo: 0.30,
    pasos: 0.20,
    sueno: 0.15
  },
  thresholds: {
    spo2: { normal: 95, borderline: 90 },
    picoFlujo: { excelente: 400, aceptable: 250, reducido: 150 },
    pasos: { excelente: 5000, moderado: 2000 },
    sueno: { optimo_min: 7, optimo_max: 9 }
  },
  stateRanges: {
    estable: 70,
    observacion: 50
  }
}
```

### Posibles Extensiones

1. **Factores adicionales:**
   - Frecuencia respiratoria
   - Frecuencia cardíaca en reposo
   - FEV1 (volumen espiratorio forzado)
   - Cuestionarios de síntomas (CAT score)

2. **Ajuste por perfil del paciente:**
   - Edad
   - Severidad EPOC (GOLD stage)
   - Comorbilidades

3. **Tendencias temporales:**
   - Comparación con periodo anterior
   - Detección de deterioro agudo

4. **Machine Learning:**
   - Pesos adaptativos según resultados históricos
   - Predicción de exacerbaciones

---

## Referencias

- **Ubicación del código:** `src/app/page.tsx:34-160`
- **API Endpoint:** `src/app/api/db/pacientes/resumen/route.ts`
- **Tipos de datos:** `src/types/database.ts`
- **Guía de base de datos:** `docs/SQLITE_GUIDE.md`

---

## Historial de Cambios

### Versión 2.0 (2025-11-25)
- Implementación de sistema multi-factor ponderado
- Agregado soporte para SpO2 y Pico Flujo
- Sistema de fallback para datos faltantes
- Normalización dinámica de pesos
- Requisito mínimo de 2 factores

### Versión 1.0 (Anterior)
- Evaluación basada únicamente en pasos diarios
- Sin sistema de fallback
- Umbrales: ≥5000 Estable, 2000-4999 Observación, <2000 Crítico
