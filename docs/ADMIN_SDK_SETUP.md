# Configuración de Firebase Admin SDK

Este documento explica cómo configurar Firebase Admin SDK para poder crear y eliminar usuarios sin cerrar tu sesión de administrador.

## ¿Por qué necesitas esto?

Cuando usas `createUserWithEmailAndPassword` desde el cliente, Firebase automáticamente inicia sesión con el nuevo usuario, cerrando tu sesión de administrador. Para evitar esto, usamos Firebase Admin SDK desde el servidor (API routes de Next.js).

## Pasos para configurar

### 1. Generar credenciales de cuenta de servicio

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto (`aitherproyect-36239`)
3. Haz clic en el ícono de engranaje ⚙️ y selecciona **Project Settings**
4. Ve a la pestaña **Service Accounts**
5. Haz clic en **Generate new private key**
6. Confirma y descarga el archivo JSON

### 2. Extraer las credenciales del archivo JSON

El archivo JSON descargado tiene esta estructura:

```json
{
  "type": "service_account",
  "project_id": "aitherproyect-36239",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@aitherproyect-36239.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 3. Actualizar variables de entorno

Abre tu archivo `.env.local` y actualiza las siguientes variables con los valores del archivo JSON descargado:

```bash
# Firebase Admin SDK (Servidor)
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@aitherproyect-36239.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu clave privada aquí\n-----END PRIVATE KEY-----\n"
```

**IMPORTANTE**:
- La clave privada debe estar entre comillas dobles
- Debe incluir los saltos de línea como `\n`
- Copia la clave privada exactamente como aparece en el archivo JSON (incluyendo `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`)

### 4. Verificar configuración

Después de configurar las variables de entorno:

1. Reinicia el servidor de desarrollo: `npm run dev`
2. Inicia sesión como administrador
3. Ve a "Administrar usuarios"
4. Intenta crear un nuevo usuario
5. Si todo está bien configurado, el usuario se creará sin cerrar tu sesión

## Solución de problemas

### Error: "auth/invalid-credential" o "Permission denied"

**Causa**: Las credenciales del Admin SDK no están configuradas correctamente.

**Solución**:
1. Verifica que copiaste correctamente el `client_email` y la `private_key` del archivo JSON
2. Asegúrate de que la clave privada incluye los caracteres `\n` para los saltos de línea
3. Verifica que la clave privada esté entre comillas dobles
4. Reinicia el servidor de desarrollo después de cambiar las variables de entorno

### Error: "No se pudo obtener el token de autenticación"

**Causa**: El usuario no está autenticado o el token expiró.

**Solución**:
1. Cierra sesión y vuelve a iniciar sesión
2. Verifica que estás usando una cuenta de administrador

### Error: "Permisos insuficientes"

**Causa**: El usuario autenticado no tiene el rol de administrador.

**Solución**:
1. Verifica que tu usuario tenga `role: 'admin'` en Firestore
2. Revisa el documento del usuario en Firebase Console > Firestore Database > users > [tu-uid]

## Seguridad

**⚠️ MUY IMPORTANTE:**

1. **NUNCA** subas el archivo `.env.local` a Git
2. **NUNCA** compartas tu clave privada de Admin SDK
3. El archivo `.env.local` ya está en `.gitignore` - asegúrate de que permanezca ahí
4. Si accidentalmente expones la clave privada, revócala inmediatamente desde Firebase Console y genera una nueva

## Ventajas de usar Admin SDK

Con esta configuración:
- ✅ Puedes crear usuarios sin que cierre tu sesión
- ✅ Puedes eliminar usuarios directamente (Auth + Firestore)
- ✅ La creación de usuarios es más segura (se valida en el servidor)
- ✅ Los neumólogos no pueden acceder a estas funciones (validación en el servidor)
