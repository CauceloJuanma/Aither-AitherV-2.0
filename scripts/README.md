# Scripts de Migración

## migrate-duplicate-users.ts

Script para fusionar usuarios duplicados que tienen el mismo email pero diferentes UIDs en Firestore.

### Problema que resuelve

Si tu sistema tiene usuarios duplicados creados antes de implementar el account linking (por ejemplo, el mismo email registrado con Google y con contraseña), este script los fusionará automáticamente.

### Qué hace el script

1. **Busca duplicados**: Identifica usuarios con el mismo email en Firestore
2. **Fusiona authMethods**: Combina todos los métodos de autenticación de los duplicados
3. **Mantiene el usuario más antiguo**: El documento con la fecha de creación más antigua se conserva
4. **Vincula UIDs**: Los UIDs de los duplicados se agregan a `linkedUids[]`
5. **Limpia**: Elimina los documentos duplicados de Firestore y Firebase Auth

### Uso

```bash
# Opción 1: Usando tsx (recomendado)
npx tsx scripts/migrate-duplicate-users.ts

# Opción 2: Compilar TypeScript y ejecutar con Node
npm run build
node dist/scripts/migrate-duplicate-users.js
```

**Nota:** El script carga automáticamente las variables de entorno desde `.env.local`.

### Requisitos previos

1. Variables de entorno configuradas en `.env.local`:
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

2. Permisos de administrador en Firebase

### Ejemplo de salida

```text
🔍 Iniciando migración de usuarios duplicados...

📥 Obteniendo todos los usuarios de Firestore...
✓ Se encontraron 8 documentos de usuarios

🔄 Agrupando usuarios por email...
✓ Se encontraron 2 emails con duplicados

🔧 Fusionando usuarios duplicados...

📧 Procesando: usuario@example.com (2 documentos)
  1. ID: abc123, authMethods: password, createdAt: 2024-01-15
  2. ID: xyz789, authMethods: google.com, createdAt: 2024-02-20

  ✓ Manteniendo documento primario: abc123
    - authMethods fusionados: password, google.com
    - linkedUids: xyz789
  ✓ Documento primario actualizado en Firestore
  ✓ Documento duplicado eliminado de Firestore: xyz789
  ✓ Usuario eliminado de Firebase Auth: xyz789
  ✅ Fusión completada para usuario@example.com

✨ Migración completada exitosamente
   - 2 emails procesados
   - 2 documentos duplicados eliminados

👋 Script finalizado
```

### Seguridad

- El script es **idempotente**: puedes ejecutarlo múltiples veces sin problemas
- **Hace backup implícito**: Los datos fusionados conservan toda la información de los duplicados
- **No destructivo**: Mantiene el documento más antiguo como primario
- **Logs detallados**: Muestra cada paso del proceso para auditoría

### Revertir cambios

Si necesitas revertir la migración, tendrías que:

1. Restaurar desde un backup de Firestore (si tienes)
2. O manualmente recrear los usuarios eliminados usando `/admin/usuarios`

### Notas importantes

- **Ejecuta en desarrollo primero**: Prueba el script en un ambiente de desarrollo antes de producción
- **Backup recomendado**: Aunque el script es seguro, considera hacer un backup de Firestore antes de ejecutar
- **Usuarios activos**: Los usuarios pueden seguir usando el sistema durante la migración, pero es mejor ejecutarlo en horario de bajo tráfico
