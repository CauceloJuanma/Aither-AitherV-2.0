# ✅ Lista de Validaciones para Entrega - Proyecto Aither

Esta es una guía completa para validar que el proyecto **Aither** esté listo para entregar. Revisa cada punto de este checklist antes de la entrega final.

---

## 📦 1. CONFIGURACIÓN Y COMPILACIÓN

- [ ] **Build sin errores**: `npm run build` debe completar exitosamente
- [ ] **Todas las dependencias instaladas**: Verificar que no falten paquetes
- [ ] **Variables de entorno configuradas**: `.env.local` con todas las keys necesarias
- [ ] **Archivo .gitignore actualizado**: No incluir secretos ni archivos sensibles

**Comandos para verificar:**
```bash
npm install
npm run build
npm run start
```

---

## 🔍 2. CALIDAD DE CÓDIGO

- [ ] **TypeScript sin errores**: Compilar sin errores de tipos
- [ ] **ESLint limpio**: `npm run lint` sin warnings críticos
- [ ] **Código comentado**: Funciones complejas documentadas
- [ ] **Console.logs removidos**: Limpiar logs de desarrollo
- [ ] **Código muerto eliminado**: Sin imports o funciones sin usar

**Comandos para verificar:**
```bash
npm run lint
npx tsc --noEmit
```

---

## 🔒 3. SEGURIDAD

- [ ] **Secrets no expuestos**: Verificar que `.env.local` esté en `.gitignore`
- [ ] **API Keys protegidas**: Firebase keys solo en variables de entorno
- [ ] **Firestore Rules configuradas**: Reglas de seguridad activas
- [ ] **Autenticación en todos los endpoints**: JWT verificado en APIs
- [ ] **SQL injection prevenido**: Queries parametrizados
- [ ] **CORS configurado correctamente**: Solo dominios autorizados
- [ ] **Service Account segura**: `serviceAccountKey.json` no en repositorio

**Archivos a revisar:**
- `.gitignore` → Debe incluir `.env.local`, `*.db`, `serviceAccountKey.json`
- `firestore.rules` → Reglas de seguridad configuradas
- API Routes → Verificar `verifyIdToken()` en cada endpoint

**Comando para verificar secretos:**
```bash
git status --ignored
grep -r "AIza" src/  # No debe encontrar API keys hardcodeadas
```

---

## 🔐 4. AUTENTICACIÓN

- [ ] **Login funcional**: Google OAuth funcionando
- [ ] **Logout correcto**: Sesión se cierra correctamente
- [ ] **Rutas protegidas**: ProtectedRoute funciona
- [ ] **Roles de usuario**: Admin y usuario normal diferenciados
- [ ] **Token refresh**: Manejo de tokens expirados
- [ ] **Redirecciones correctas**: Login → Dashboard flujo correcto

**Páginas a probar:**
1. `/login` → Debe mostrar botón de Google
2. Después de login → Redirigir a `/`
3. Acceder a `/admin/usuarios` sin ser admin → Debe bloquear
4. Logout → Debe volver a `/login`

---

## 🗄️ 5. BASE DE DATOS

- [ ] **Conexión estable**: Database se conecta correctamente
- [ ] **Datos de prueba**: Datos suficientes para demostración
- [ ] **Queries optimizados**: Índices en columnas frecuentes
- [ ] **Integridad referencial**: Foreign keys correctas
- [ ] **Backup disponible**: `dump.sql` actualizado
- [ ] **Migraciones documentadas**: Cambios de schema documentados

**Archivos a revisar:**
- `app_1mesfinal2.db` → Base de datos principal
- `dump.sql` → Backup actualizado
- `src/lib/database.ts` → Conexión configurada

**Comandos para verificar:**
```bash
sqlite3 aither/app_1mesfinal2.db "SELECT COUNT(*) FROM usuario;"
sqlite3 aither/app_1mesfinal2.db "SELECT COUNT(*) FROM telemonitorizacion;"
```

---

## 🌐 6. API ENDPOINTS

Todos los endpoints deben:
- Requerir autenticación (JWT token)
- Devolver JSON válido
- Manejar errores apropiadamente

### Endpoints a probar:

| Endpoint | Método | Descripción | Auth |
|----------|--------|-------------|------|
| `/api/db/test` | GET | Estadísticas de conexión | ✅ |
| `/api/db/usuarios` | GET | Lista todos los usuarios | ✅ |
| `/api/db/usuarios/[id]` | GET | Datos completos de paciente | ✅ |
| `/api/db/pacientes/resumen` | GET | Métricas agregadas | ✅ |
| `/api/admin/users` | GET | Lista usuarios Firebase (admin) | ✅ Admin |
| `/api/insights` | GET | Análisis clínicos | ✅ |
| `/api/auth/delete-unauthorized` | POST | Limpieza de usuarios | ✅ Admin |

**Checklist por endpoint:**
- [ ] Devuelve 401 sin token
- [ ] Devuelve datos correctos con token válido
- [ ] Maneja errores (404, 500) apropiadamente
- [ ] Response time < 2 segundos

---

## 🎨 7. INTERFAZ DE USUARIO

### Dashboard Principal (`/`)
- [ ] **Gráficas cargan**: Comparación multi-paciente visible
- [ ] **Selector de fecha**: Cambiar rango actualiza datos
- [ ] **Badges de estado**: Stable/Observing/Critical/No Data
- [ ] **Navegación**: Click en paciente va a `/detalle`
- [ ] **Filtros funcionan**: Filtrar por estado

### Vista de Detalle (`/detalle?id=X`)
- [ ] **Información del paciente**: Nombre, edad, diagnóstico visible
- [ ] **Tabs funcionales**: Todas las tabs cargan (8 tabs)
  - [ ] Resumen
  - [ ] Actividad
  - [ ] Sueño
  - [ ] Respiración
  - [ ] Calidad del Aire
  - [ ] Cuestionarios
  - [ ] Audio
  - [ ] Peso
- [ ] **Gráficas interactivas**: Recharts funcionando
- [ ] **Exportación**: PDF/Imagen descarga correctamente
- [ ] **Datos faltantes**: Muestra mensaje apropiado

### Panel Admin (`/admin/usuarios`)
- [ ] **Solo accesible por admin**: Usuarios normales bloqueados
- [ ] **Lista de usuarios**: Tabla con todos los usuarios
- [ ] **Acciones CRUD**: Crear/Editar/Eliminar usuarios
- [ ] **Roles**: Cambiar rol usuario/admin

### Navbar y Layout
- [ ] **Logo visible**: En todas las páginas
- [ ] **Usuario logueado**: Avatar y nombre mostrado
- [ ] **Botón logout**: Funciona correctamente
- [ ] **Navegación**: Links funcionan

---

## 📱 8. RESPONSIVE DESIGN

### Mobile (320px - 768px)
- [ ] **Navbar colapsado**: Menú hamburguesa funcional
- [ ] **Gráficas adaptadas**: Se ven correctamente
- [ ] **Tablas scrolleables**: Horizontal scroll en tablas grandes
- [ ] **Botones accesibles**: Touch targets > 44px
- [ ] **Texto legible**: Font size apropiado

### Tablet (768px - 1024px)
- [ ] **Layout intermedio**: 2 columnas donde sea apropiado
- [ ] **Gráficas optimizadas**: Tamaño adecuado
- [ ] **Navegación funcional**: Todos los elementos accesibles

### Desktop (1024px+)
- [ ] **Vista completa**: Máximo aprovechamiento de espacio
- [ ] **Sidebar fijo**: (Si aplica)
- [ ] **Multi-columna**: Dashboard con múltiples gráficas

**Herramientas para probar:**
- Chrome DevTools (Responsive mode)
- Firefox Responsive Design Mode
- Dispositivos reales (si disponible)

---

## ⚡ 9. RENDIMIENTO

- [ ] **Tiempo de carga < 3s**: Primera carga rápida
- [ ] **Lighthouse Score > 70**: Performance, Accessibility, Best Practices
- [ ] **Imágenes optimizadas**: WebP o comprimidas
- [ ] **Code splitting**: Componentes lazy-loaded
- [ ] **Bundle size**: JavaScript inicial < 500KB
- [ ] **Cache funcional**: React Query cache configurado
- [ ] **Memoización**: useMemo/useCallback en renders pesados

**Comandos para verificar:**
```bash
npm run build
# Revisar output de Next.js build
# Buscar bundles grandes (route pages)
```

**Lighthouse:**
1. Abrir Chrome DevTools
2. Tab "Lighthouse"
3. Generar report para Desktop y Mobile
4. Objetivo: Performance > 70, Accessibility > 90

---

## 📚 10. DOCUMENTACIÓN

### Archivos a verificar:

- [ ] **README.md** (root): Instalación y uso básico
- [ ] **docs/FIREBASE_SETUP.md**: Firebase config completa
- [ ] **docs/ADMIN_SDK_SETUP.md**: Admin SDK setup
- [ ] **docs/GOOGLE_AUTH_SETUP.md**: OAuth setup
- [ ] **docs/SQLITE_GUIDE.md**: Schema y API endpoints
- [ ] **docs/PATIENT_STATUS_CALCULATION.md**: Algoritmo clínico
- [ ] **docs/PRODUCTION_SETUP.md**: Deployment checklist
- [ ] **docs/SECURITY_AUDIT.md**: Security best practices
- [ ] **docs/arquitectura-sistema.md**: System architecture
- [ ] **docs/caching-strategy.md**: Caching documentation
- [ ] **docs/database-optimization.md**: DB optimization

### Contenido obligatorio:

- [ ] **.env.example**: Template de variables de entorno
- [ ] **Instrucciones de instalación**: Paso a paso
- [ ] **Comandos disponibles**: npm scripts explicados
- [ ] **Estructura del proyecto**: Folders y archivos principales
- [ ] **API endpoints**: Request/Response examples
- [ ] **Troubleshooting**: Problemas comunes y soluciones

---

## 🚀 11. DESPLIEGUE

### Vercel (Recomendado para Next.js)

- [ ] **Proyecto conectado**: GitHub/GitLab integrado
- [ ] **Variables de entorno**: Todas las keys configuradas en Vercel Dashboard
- [ ] **Build settings**: `npm run build` exitoso
- [ ] **Domain configurado**: (Si aplica)
- [ ] **Preview deployments**: PRs generan previews

**Variables requeridas en Vercel:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=
DATABASE_PATH=
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

### Firebase Hosting (Alternativa)

- [ ] **firebase.json configurado**: Public directory correcto
- [ ] **Build para export**: `next.config.ts` con `output: 'export'` (si aplica)
- [ ] **Deploy exitoso**: `firebase deploy --only hosting`

### Base de Datos de Producción

⚠️ **IMPORTANTE**: SQLite local no es adecuado para producción

**Opciones recomendadas:**
1. **Turso** (SQLite en edge) - Configurado en `.env`
2. **PostgreSQL** (Vercel Postgres, Supabase, Neon)
3. **MySQL** (PlanetScale, Railway)

- [ ] **Migración planificada**: Schema SQL preparado
- [ ] **Conexión configurada**: Variables de entorno
- [ ] **Datos migrados**: Seeding script disponible

---

## 🧪 12. PRUEBAS FUNCIONALES

### Flujo completo de usuario:

1. **Login**
   - [ ] Abrir `/login`
   - [ ] Click en "Sign in with Google"
   - [ ] Autorizar en popup
   - [ ] Redirigir a dashboard

2. **Dashboard**
   - [ ] Ver lista de pacientes
   - [ ] Cambiar rango de fecha (7/15/30 días)
   - [ ] Ver gráficas actualizarse
   - [ ] Identificar badges de estado
   - [ ] Click en un paciente

3. **Detalle de Paciente**
   - [ ] Ver información demográfica
   - [ ] Navegar entre tabs (8 tabs)
   - [ ] Ver gráficas y métricas
   - [ ] Exportar PDF
   - [ ] Volver al dashboard

4. **Admin Panel** (si eres admin)
   - [ ] Acceder a `/admin/usuarios`
   - [ ] Ver lista de usuarios Firebase
   - [ ] Crear nuevo usuario admin
   - [ ] Modificar rol de usuario

5. **Logout**
   - [ ] Click en botón logout
   - [ ] Redirigir a `/login`
   - [ ] Verificar que no se puede acceder a rutas protegidas

### Casos edge a probar:

- [ ] **Paciente sin datos**: Debe mostrar "No hay datos disponibles"
- [ ] **Token expirado**: Debe redirigir a login
- [ ] **ID inválido en URL**: Debe mostrar error 404
- [ ] **Sin conexión a DB**: Debe mostrar error apropiado
- [ ] **Arrays vacíos**: No debe crashear la app

---

## 🐛 13. ERRORES COMUNES A REVISAR

### Browser Console

- [ ] **No hay errores rojos**: Console.error limpio
- [ ] **No hay warnings críticos**: React warnings resueltos
- [ ] **Network requests exitosos**: Todos 200/201

**Abrir DevTools → Console y verificar:**
```
No debe haber:
- "Warning: Each child in a list should have a unique key prop"
- "Failed to fetch"
- "Cannot read property 'X' of undefined"
- "Firebase: Error (auth/...)"
```

### Network Tab

- [ ] **No hay 404s**: Todos los recursos cargan
- [ ] **APIs responden < 2s**: Timeouts configurados
- [ ] **No hay requests fallidos**: Status codes correctos

### Navegación

- [ ] **Links funcionan**: Todos los hrefs válidos
- [ ] **Back/Forward**: Historial funciona
- [ ] **Refresh preserva estado**: (Cuando sea apropiado)

### Cross-Browser

- [ ] **Chrome**: Funcionalidad completa
- [ ] **Firefox**: Sin problemas visuales
- [ ] **Safari**: (Mac/iOS) Estilos correctos
- [ ] **Edge**: Compatibilidad básica

---

## 📊 14. DATOS Y LÓGICA CLÍNICA

### Algoritmo de Clasificación de Estado

**Puntuación de 0-100 con pesos:**
- SpO2: 35%
- Peak Flow: 30%
- Actividad (pasos): 20%
- Sueño: 15%

**Rangos de clasificación:**
- **Estable** (Stable): 70-100 puntos
- **En Observación** (Observing): 40-69 puntos
- **Crítico** (Critical): 0-39 puntos
- **Sin Datos** (No Data): Datos insuficientes

### Validaciones a realizar:

- [ ] **Cálculo correcto**: Verificar manualmente 3 pacientes
- [ ] **Pesos aplicados**: SpO2 tiene mayor impacto
- [ ] **Ventana de 7 días**: Promedio correcto
- [ ] **Manejo de nulls**: No crashea con datos faltantes
- [ ] **Fallback lógico**: Prioriza datos disponibles
- [ ] **Consistencia**: Dashboard y detalle coinciden

**Archivo a revisar:**
- `src/lib/telemonitoringDataProcessor.ts` → `calculatePatientStatus()`

### Gráficas y Visualizaciones

- [ ] **Datos coinciden**: Gráfica vs tabla
- [ ] **Ejes correctos**: Labels apropiados
- [ ] **Colores consistentes**: Paleta coherente
- [ ] **Tooltips informativos**: Datos completos al hover
- [ ] **Leyendas claras**: Fácil interpretación

---

## 🎯 ORDEN SUGERIDO DE EJECUCIÓN

Te recomiendo validar en este orden para máxima eficiencia:

### Fase 1: Fundamentos (30 min)
1. ✅ Build y compilación
2. ✅ TypeScript sin errores
3. ✅ ESLint limpio
4. ✅ Variables de entorno

### Fase 2: Backend (45 min)
5. ✅ Base de datos conectada
6. ✅ API endpoints funcionando
7. ✅ Autenticación Firebase
8. ✅ Seguridad verificada

### Fase 3: Frontend (1 hora)
9. ✅ Dashboard funcional
10. ✅ Vista de detalle completa
11. ✅ Admin panel operativo
12. ✅ Navegación y routing

### Fase 4: UX/UI (45 min)
13. ✅ Responsive design
14. ✅ Rendimiento optimizado
15. ✅ Accesibilidad básica
16. ✅ Cross-browser testing

### Fase 5: Documentación (30 min)
17. ✅ README actualizado
18. ✅ Docs completos
19. ✅ .env.example creado
20. ✅ Comentarios en código

### Fase 6: Deployment (1 hora)
21. ✅ Configuración Vercel/Firebase
22. ✅ Variables de producción
23. ✅ Deploy de prueba
24. ✅ Smoke testing en producción

---

## ✨ CHECKLIST FINAL ANTES DE ENTREGAR

Último repaso rápido (10 minutos):

- [ ] `npm run build` → ✅ Sin errores
- [ ] `npm run lint` → ✅ Limpio
- [ ] Login/Logout → ✅ Funciona
- [ ] Dashboard carga → ✅ Gráficas visibles
- [ ] Detalle paciente → ✅ Todas las tabs
- [ ] Mobile responsive → ✅ Se ve bien
- [ ] Console limpio → ✅ Sin errores rojos
- [ ] README actualizado → ✅ Instrucciones claras
- [ ] .env.local en .gitignore → ✅ No expuesto
- [ ] Commit final → ✅ "chore: final validation before delivery"

---

## 📝 NOTAS IMPORTANTES

### Limitaciones conocidas a documentar:

1. **Base de datos**: SQLite local no es escalable para producción
   - Solución: Migrar a Turso/PostgreSQL

2. **Exportación PDF**: Puede ser lenta con muchos datos
   - Solución: Mostrar loading spinner

3. **Tiempo real**: No hay updates automáticos
   - Solución: Implementar polling o WebSockets en futuro

4. **Cache**: Datos pueden estar desactualizados por cache
   - Solución: Botón de "Refrescar datos"

### Mejoras futuras (opcional):

- [ ] Tests unitarios (Jest + React Testing Library)
- [ ] Tests E2E (Playwright/Cypress)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (Sentry, LogRocket)
- [ ] Analytics (Google Analytics, Mixpanel)
- [ ] PWA support (Service Workers)

---

## 🆘 TROUBLESHOOTING

### Problema: Build falla
```bash
# Limpiar cache y reinstalar
rm -rf node_modules .next
npm install
npm run build
```

### Problema: Firebase no conecta
```bash
# Verificar variables
cat .env.local | grep FIREBASE
# Verificar firebase.json
cat firebase.json
```

### Problema: Base de datos no carga
```bash
# Verificar path
echo $DATABASE_PATH
# Verificar permisos
ls -la app_1mesfinal2.db
```

---

**Última actualización**: 2025-12-03
**Versión del proyecto**: 1.0.0
