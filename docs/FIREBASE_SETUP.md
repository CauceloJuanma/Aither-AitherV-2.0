# Configuración de Firebase para Autenticación

Este documento explica cómo configurar Firebase para el sistema de autenticación con roles de usuario.

## 1. Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Sigue los pasos para crear tu proyecto
4. Una vez creado, ve a la configuración del proyecto

## 2. Configurar Firebase Authentication

1. En el menú lateral, ve a **Authentication** > **Sign-in method**
2. Habilita **Email/Password** como proveedor de autenticación
3. Guarda los cambios

## 3. Configurar Firestore Database

1. En el menú lateral, ve a **Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona el modo de producción (o modo de prueba si es para desarrollo)
4. Elige la ubicación más cercana a tus usuarios
5. Una vez creada, ve a la pestaña **Reglas** y configura las siguientes reglas de seguridad:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regla para la colección de usuarios
    match /users/{userId} {
      // Solo administradores pueden leer y escribir
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Permitir que los usuarios lean su propio documento
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4. Obtener las credenciales de Firebase

1. En la configuración del proyecto, ve a **Configuración del proyecto** > **General**
2. En la sección "Tus apps", haz clic en el ícono de web (`</>`)
3. Registra tu app con un nombre (ej: "Aither Web")
4. Copia las credenciales que aparecen
5. Actualiza el archivo `.env.local` con estos valores:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

## 5. Crear el primer usuario administrador

Para crear el primer usuario administrador, necesitas hacerlo manualmente desde la consola de Firebase:

### Opción 1: Usando Firebase Console (Recomendado para el primer admin)

1. Ve a **Authentication** > **Users** en la consola de Firebase
2. Haz clic en "Agregar usuario"
3. Ingresa el email y contraseña del administrador
4. Una vez creado, copia el **User UID**
5. Ve a **Firestore Database**
6. Crea una nueva colección llamada `users`
7. Crea un nuevo documento con el **User UID** como ID del documento
8. Agrega los siguientes campos:
   - `email` (string): el email del usuario
   - `role` (string): "admin"
   - `displayName` (string): nombre completo del administrador
   - `createdAt` (timestamp): fecha actual
   - `updatedAt` (timestamp): fecha actual

### Opción 2: Script de inicialización (si ya tienes acceso a la app)

Si ya tienes un usuario administrador, puedes usar el panel de administración en la app (`/admin/usuarios`) para crear más usuarios.

## 6. Tipos de usuarios

El sistema soporta dos tipos de usuarios:

### Neumólogo
- **Rol**: `neumólogo`
- **Permisos**: Solo lectura
- **Acceso**: Puede ver la información de pacientes pero no puede gestionar usuarios

### Administrador
- **Rol**: `admin`
- **Permisos**: Acceso completo
- **Acceso**:
  - Ver información de pacientes
  - Crear nuevos usuarios (neumólogos y administradores)
  - Eliminar usuarios
  - Gestionar accesos al sistema

## 7. Estructura de datos en Firestore

### Colección `users`

Cada documento de usuario tiene la siguiente estructura:

```javascript
{
  uid: "firebase_user_uid",           // UID del usuario de Firebase Auth
  email: "usuario@example.com",       // Email del usuario
  role: "admin" | "neumólogo",        // Rol del usuario
  displayName: "Dr. Juan Pérez",      // Nombre completo (opcional)
  createdAt: Timestamp,               // Fecha de creación
  updatedAt: Timestamp                // Fecha de última actualización
}
```

## 8. Seguridad

- Las contraseñas deben tener al menos 6 caracteres
- Solo los administradores pueden crear y eliminar usuarios
- Cada usuario solo puede acceder a su propia información de perfil
- Las rutas están protegidas en el lado del cliente
- Las reglas de Firestore protegen los datos en el lado del servidor

## 9. Prueba del sistema

1. Inicia la aplicación: `npm run dev`
2. Ve a `/login`
3. Inicia sesión con el usuario administrador que creaste
4. Verifica que aparezca el botón "Administrar usuarios" en la página principal
5. Haz clic en "Administrar usuarios"
6. Crea un nuevo usuario de prueba con rol "neumólogo"
7. Cierra sesión
8. Inicia sesión con el usuario neumólogo
9. Verifica que NO aparezca el botón "Administrar usuarios"

## Solución de problemas

### Error: Firebase not initialized
- Verifica que las variables de entorno en `.env.local` estén correctamente configuradas
- Asegúrate de que todas las variables empiecen con `NEXT_PUBLIC_`
- Reinicia el servidor de desarrollo después de modificar `.env.local`

### Error: Permission denied al crear usuarios
- Verifica que las reglas de Firestore estén correctamente configuradas
- Asegúrate de que el usuario tenga el rol "admin" en Firestore

### No puedo iniciar sesión
- Verifica que el usuario exista en Firebase Authentication
- Verifica que el usuario tenga un documento correspondiente en Firestore en la colección `users`
- Revisa la consola del navegador para ver errores específicos
