# Configuración de Google Authentication

Este documento explica cómo habilitar Google Authentication en Firebase y cómo funciona el sistema de whitelist.

## ¿Cómo funciona?

El sistema implementa un modelo de **whitelist** (lista blanca):

1. **Admin pre-registra emails**: El administrador crea usuarios con solo email y rol (sin contraseña)
2. **Usuario inicia sesión con Google**: Cuando alguien intenta iniciar sesión con Google
3. **Verificación automática**: El sistema verifica que el email de Google esté en la lista de usuarios autorizados
4. **Acceso concedido/denegado**:
   - ✅ Si el email está autorizado → acceso permitido
   - ❌ Si NO está autorizado → acceso denegado

## Paso 1: Habilitar Google Auth en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `aitherproyect-36239`
3. Ve a **Authentication** > **Sign-in method**
4. Haz clic en **Google** en la lista de proveedores
5. Habilita el toggle de **Enable**
6. En **Project support email**, selecciona tu email
7. Haz clic en **Save**

## Paso 2: Crear usuarios con Google Auth

Como administrador, puedes crear usuarios que usarán Google Auth:

1. Inicia sesión en el sistema
2. Ve a **Administrar usuarios**
3. Haz clic en **Crear nuevo usuario**
4. Llena los datos:
   - **Email**: El email de Google del usuario (ej: `doctor@gmail.com`)
   - **Nombre completo**: Nombre del usuario
   - **Rol**: Neumólogo o Administrador
   - ✅ **Marca el checkbox**: "Permitir autenticación con Google"
5. Haz clic en **Crear usuario**

**Nota**: La contraseña NO es necesaria cuando marcas "Permitir autenticación con Google"

## Paso 3: Usuario inicia sesión

El usuario autorizado puede iniciar sesión de dos formas:

### Opción 1: Con Google (Recomendado para usuarios con Google Auth)

1. Ve a la página de login
2. Haz clic en **"Iniciar sesión con Google"**
3. Selecciona su cuenta de Google
4. Si su email está autorizado → acceso concedido

### Opción 2: Con contraseña (Solo si se creó con contraseña)

1. Ingresa email y contraseña
2. Haz clic en **"Iniciar sesión"**

## Seguridad

### Protección de whitelist

- Solo los emails pre-registrados por el administrador pueden acceder
- Si alguien intenta iniciar sesión con Google pero su email NO está en la lista:
  - El sistema cierra la sesión inmediatamente
  - Muestra mensaje: "Acceso denegado. Tu email no está autorizado para acceder a este sistema. Contacta al administrador."

### Ventajas de este sistema

1. ✅ **Control total**: El admin decide quién puede acceder
2. ✅ **Sin contraseñas**: Los usuarios no necesitan recordar contraseñas
3. ✅ **Seguro**: Usa la autenticación de Google (2FA, etc.)
4. ✅ **Fácil de gestionar**: Solo agrega/elimina emails de la lista
5. ✅ **Auditoría**: Todos los accesos quedan registrados en Firebase

### Permisos de Firebase

Asegúrate de que las reglas de Firestore permitan:
- Lectura de la colección `users` solo con autenticación
- Escritura solo para administradores

## Casos de uso

### Ejemplo 1: Nuevo neumólogo

```
Admin crea usuario:
  - Email: neumologo@hospital.com
  - Rol: neumólogo
  - ✅ Permitir Google Auth

Usuario recibe email del admin:
  "Has sido agregado al sistema Aither.
   Inicia sesión en http://app.aither.com con tu cuenta de Google."

Usuario va al login:
  → Clic en "Iniciar sesión con Google"
  → Selecciona neumologo@hospital.com
  → ¡Acceso concedido!
```

### Ejemplo 2: Intento de acceso no autorizado

```
Persona random intenta acceder:
  → Clic en "Iniciar sesión con Google"
  → Selecciona hacker@malicious.com
  → ❌ "Acceso denegado. Tu email no está autorizado..."
```

### Ejemplo 3: Usuario con ambos métodos

Puedes crear un usuario con contraseña Y permitir Google Auth:

```
Admin crea usuario:
  - Email: admin@aither.com
  - Contraseña: adminpass123
  - Rol: admin
  - ✅ Permitir Google Auth

Usuario puede elegir:
  - Opción A: Email + contraseña
  - Opción B: Google Sign-In
```

## Solución de problemas

### Error: "Popup bloqueado"

**Causa**: El navegador bloqueó el popup de Google Sign-In

**Solución**:
1. Permite popups para este sitio en tu navegador
2. Intenta de nuevo

### Error: "Acceso denegado"

**Causa**: Tu email no está en la whitelist

**Solución**:
1. Contacta al administrador del sistema
2. Pídele que agregue tu email a la lista de usuarios autorizados

### Error: "Email ya en uso"

**Causa**: Otro usuario ya está registrado con ese email en Firebase Auth

**Solución**:
1. Si es el mismo usuario, puede iniciar sesión normalmente
2. Si es un usuario diferente, el admin debe usar otro email

## Mejores prácticas

1. **Emails corporativos**: Usa emails de la organización (@hospital.com, @clinica.com)
2. **Verificación**: Verifica que el email es correcto antes de crearlo
3. **Documentación**: Mantén un registro de quién tiene acceso
4. **Revisión periódica**: Revisa la lista de usuarios regularmente
5. **Eliminación**: Elimina usuarios que ya no necesitan acceso

## Mantenimiento

### Agregar dominio permitido (opcional)

Si quieres permitir solo emails de ciertos dominios (ej: @hospital.com):

1. Edita `src/contexts/AuthContext.tsx`
2. En la función `loginWithGoogle`, agrega validación de dominio:

```typescript
const allowedDomains = ['hospital.com', 'clinica.com'];
const userDomain = googleUser.email?.split('@')[1];

if (!allowedDomains.includes(userDomain)) {
  await signOut(auth);
  throw new Error('Solo se permiten emails de: ' + allowedDomains.join(', '));
}
```

### Revocar acceso

Para revocar el acceso de un usuario:

1. Ve a **Administrar usuarios**
2. Encuentra el usuario
3. Haz clic en **Eliminar**
4. El usuario ya no podrá iniciar sesión (ni con Google ni con contraseña)
