# Configuración para Producción (Vercel)

Este documento explica cómo configurar Firebase para que funcione correctamente en producción con Vercel.

## Problemas comunes y soluciones

### Error 1: "Missing or insufficient permissions"

**Causa**: Las reglas de Firestore no permiten que los usuarios autenticados lean/escriban en la colección `users`.

**Solución**: Actualizar las reglas de Firestore

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database** > **Reglas**
4. Copia y pega las reglas del archivo `firestore.rules`
5. Haz clic en **Publicar**

### Error 2: "Cross-Origin-Opener-Policy would block the window.closed call"

**Causa**: El dominio de Vercel no está autorizado en Firebase Authentication.

**Solución**: Agregar dominio de Vercel a dominios autorizados

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Authentication** > **Settings** > **Authorized domains**
4. Haz clic en **Add domain**
5. Agrega tu dominio de Vercel (ej: `aither.vercel.app`)
6. Si tienes un dominio personalizado, agrégalo también
7. Guarda los cambios

## Variables de entorno en Vercel

Asegúrate de que todas las variables de entorno estén configuradas en Vercel:

### Variables públicas (NEXT_PUBLIC_*)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=X
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=X
NEXT_PUBLIC_FIREBASE_PROJECT_ID=X
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=X
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=X
NEXT_PUBLIC_FIREBASE_APP_ID=X
```

### Variables privadas (solo servidor)

```bash
FIREBASE_ADMIN_CLIENT_EMAIL=X
FIREBASE_ADMIN_PRIVATE_KEY=X
```

**IMPORTANTE para FIREBASE_ADMIN_PRIVATE_KEY en Vercel:**

En Vercel, la clave privada debe estar en UNA SOLA LÍNEA. Para configurarla:

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega `FIREBASE_ADMIN_PRIVATE_KEY`
4. En el valor, pega la clave privada completa (incluyendo `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`)
5. Los `\n` deben permanecer como texto literal (no como saltos de línea reales)

## Pasos de configuración completos

### 1. Configurar Firebase Console

#### a) Actualizar reglas de Firestore

```
Ve a Firestore Database > Reglas
Copia el contenido de firestore.rules
Publica las reglas
```

#### b) Agregar dominios autorizados

```
Ve a Authentication > Settings > Authorized domains
Agrega:
- localhost (ya debería estar)
- tu-app.vercel.app
- tu-dominio-personalizado.com (si aplica)
```

#### c) Verificar Google Auth habilitado

```
Ve a Authentication > Sign-in method
Verifica que Google esté Enabled
```

### 2. Configurar Vercel

#### a) Agregar variables de entorno

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega TODAS las variables de .env.local
4. Importante: Marca las variables como Production, Preview y Development según necesites

#### b) Redesplegar

Después de agregar las variables de entorno:

```bash
git add .
git commit -m "Update Firebase configuration"
git push
```

O en Vercel Dashboard:
- Ve a Deployments
- Haz clic en ... > Redeploy

### 3. Verificar configuración

1. **En localhost**:
   - `npm run dev`
   - Intenta login con Google
   - Debería funcionar sin errores

2. **En producción**:
   - Ve a tu URL de Vercel
   - Intenta login con Google
   - El popup debería abrir y cerrar correctamente

## Solución de problemas

### El popup de Google se cierra inmediatamente

**Causa**: Dominio no autorizado

**Solución**:
1. Revisa la consola del navegador para ver qué dominio está intentando usar
2. Agrega ese dominio exacto en Firebase Console > Authentication > Authorized domains

### Error "auth/unauthorized-domain"

**Causa**: El dominio desde el que estás accediendo no está en la lista de dominios autorizados

**Solución**:
1. Ve a Firebase Console
2. Authentication > Settings > Authorized domains
3. Agrega el dominio que aparece en el error

### Error "Missing or insufficient permissions" después de login

**Causa**: Las reglas de Firestore no permiten la operación

**Solución**:
1. Verifica que las reglas de Firestore estén publicadas
2. Revisa que el usuario tenga un documento en la colección `users`
3. Si es Google Auth, verifica que el email esté en la whitelist

### Variables de entorno no funcionan en Vercel

**Causa**: Las variables no se aplicaron correctamente o necesitan redeploy

**Solución**:
1. Verifica que las variables estén en Settings > Environment Variables
2. Asegúrate de que estén marcadas para el entorno correcto (Production/Preview/Development)
3. Haz un redeploy manual desde Vercel Dashboard

## Checklist de producción

- [ ] Reglas de Firestore actualizadas y publicadas
- [ ] Google Auth habilitado en Firebase
- [ ] Dominio de Vercel agregado a dominios autorizados
- [ ] Todas las variables de entorno configuradas en Vercel
- [ ] Variables NEXT_PUBLIC_* accesibles desde el cliente
- [ ] Variables privadas (FIREBASE_ADMIN_*) solo en servidor
- [ ] Redeploy completado
- [ ] Login con email/password funciona en producción
- [ ] Login con Google funciona en producción
- [ ] Creación de usuarios funciona sin cerrar sesión del admin

## Contacto y soporte

Si encuentras más problemas:

1. Revisa la consola del navegador (F12) para errores específicos
2. Revisa los logs de Vercel en Dashboard > Deployments > [tu deploy] > Logs
3. Verifica que Firebase Console > Usage no tenga errores
