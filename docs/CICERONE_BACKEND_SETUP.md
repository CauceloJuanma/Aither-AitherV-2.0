# Guía de Conexión del Backend de Cicerone

## Introducción

Este documento proporciona instrucciones detalladas para que el equipo de **Cicerone** pueda conectar su base de datos SQLite real (que corre en un entorno Linux local) con la aplicación web **Aither**.

Durante el desarrollo, se utilizó un archivo de base de datos de ejemplo (`app_1mesfinal2.db`) proporcionado por Cicerone para establecer la estructura y probar la integración. Ahora, este documento explica cómo conectar la aplicación con la base de datos de producción real.

## Requisitos Previos

### Del lado de Cicerone (Backend)

- Servidor Linux con la base de datos SQLite de Cicerone ejecutándose
- Acceso SSH al servidor (si se utiliza conexión remota)
- Base de datos SQLite con el esquema compatible (ver sección "Esquema de Base de Datos Requerido")
- Python y API REST de Cicerone ya en funcionamiento

### Del lado de Aither (Aplicación Web)

- Node.js 18+ instalado
- Aplicación Aither clonada y configurada
- Variables de entorno configuradas (Firebase, etc.)

## Esquema de Base de Datos Requerido

La aplicación Aither espera las siguientes tablas en la base de datos SQLite:

### Tablas Principales

1. **usuario** - Información demográfica y clínica del paciente
   - Campos principales: `id`, `nombre`, `peso`, `altura`, `edad`, `genero`, etc.

2. **telemonitorizacion** - Registro diario de monitorización
   - Campos principales: `id`, `fecha`, `usuario_id`
   - Relaciona todas las mediciones del día

3. **actividad** - Métricas de actividad física (datos de Fitbit o similar)
   - Campos: `steps`, `caloriesOut`, `restingHeartRate`, `fairlyActiveMinutes`, etc.

4. **sleep** - Métricas de sueño y saturación de oxígeno
   - Campos: `duration`, `deep_minutes`, `rem_minutes`, `light_minutes`, `spo2`, etc.

5. **picoflujo** - Mediciones de pico de flujo espiratorio
   - Campos: `valor1`, `valor2`, `valor3`, `valormedio`

6. **pesaje** - Registro de peso
   - Campos: `peso`, `telemonitorizacion_id`

7. **calidadaireinterior** - Datos de sensores ambientales
   - Campos: `ppm25`, `ppm10`, `co2`, `voc`, `temp`, `hum`

8. **cuestionario** - Evaluaciones CAT y juegos cognitivos
   - Campos: `q1`, `q2`, `q3`, etc.

9. **sonidos** - Análisis de audio (tos, habla)
   - Campos relacionados con análisis de audio clínico

### Relaciones Entre Tablas

```
usuario (1) → (n) telemonitorizacion
telemonitorizacion (1) → (1) actividad
telemonitorizacion (1) → (1) sleep
telemonitorizacion (1) → (n) picoflujo
telemonitorizacion (1) → (n) pesaje
telemonitorizacion (1) → (n) calidadaireinterior
telemonitorizacion (1) → (n) cuestionario
telemonitorizacion (1) → (n) sonidos
```

Para ver el esquema detallado de cada tabla, consultar: [SQLITE_GUIDE.md](./SQLITE_GUIDE.md)

## Opciones de Conexión

Existen tres opciones principales para conectar la base de datos real de Cicerone con Aither:

### Opción 1: Reemplazo Directo del Archivo .db (Recomendada para Desarrollo)

**Ideal para:** Desarrollo local, testing, o cuando Aither corre en el mismo servidor que Cicerone

**Ventajas:**
- Configuración más simple
- Sin latencia de red
- Acceso directo y rápido

**Desventajas:**
- Requiere que ambas aplicaciones estén en el mismo servidor o tener acceso al archivo
- No adecuado si las apps están en diferentes servidores

### Opción 2: Conexión Remota via Túnel SSH

**Ideal para:** Cuando Aither y la base de datos Cicerone están en servidores diferentes

**Ventajas:**
- Permite acceso remoto seguro
- No requiere exponer la base de datos públicamente

**Desventajas:**
- Configuración más compleja
- Ligera latencia de red
- Requiere mantener túnel SSH activo

### Opción 3: Replicación a Turso (SQLite en la Nube)

**Ideal para:** Despliegue en producción (Vercel, Railway, etc.)

**Ventajas:**
- Base de datos accesible globalmente
- Escalable y de alta disponibilidad
- Compatible con plataformas serverless

**Desventajas:**
- Requiere sincronización periódica de datos
- Servicio externo adicional

---

## Implementación de Opciones

### OPCIÓN 1: Reemplazo Directo del Archivo .db

Esta es la opción más sencilla si ambas aplicaciones corren en el mismo servidor Linux.

#### Paso 1: Localizar la Base de Datos de Cicerone

En el servidor Linux de Cicerone, localizar el archivo SQLite:

```bash
# Ejemplo: la base de datos podría estar en:
/home/cicerone/database/cicerone.db
# O en la carpeta de la aplicación Python
/var/www/cicerone-api/db/cicerone.db
```

#### Paso 2: Verificar el Esquema de la Base de Datos

Antes de conectar, verificar que la base de datos tenga las tablas requeridas:

```bash
sqlite3 /ruta/a/tu/cicerone.db ".tables"
```

Deberías ver las tablas: `usuario`, `telemonitorizacion`, `actividad`, `sleep`, `picoflujo`, `pesaje`, `calidadaireinterior`, `cuestionario`, `sonidos`

#### Paso 3A: Copiar el Archivo (Si está en el mismo servidor)

Si Aither y Cicerone están en el mismo servidor:

```bash
# Navegar a la carpeta de Aither
cd /ruta/a/aither

# Copiar el archivo de base de datos
cp /ruta/a/tu/cicerone.db ./app_1mesfinal2.db

# O crear un enlace simbólico (recomendado para mantener sincronizado)
ln -sf /ruta/a/tu/cicerone.db ./app_1mesfinal2.db
```

#### Paso 3B: Transferir el Archivo (Si está en servidor diferente)

Si estás desarrollando localmente y necesitas la base de datos del servidor:

```bash
# Desde tu máquina local, descargar la base de datos via SCP
scp usuario@servidor-cicerone:/ruta/a/tu/cicerone.db ./app_1mesfinal2.db
```

#### Paso 4: Configurar Variables de Entorno

Editar el archivo `.env.local` en la raíz de Aither:

```bash
# Base de datos local
USE_TURSO=false

# Opcionalmente, si el archivo tiene un nombre diferente:
DATABASE_PATH=./app_1mesfinal2.db
```

**Nota:** Si deseas usar un nombre de archivo diferente, debes modificar el archivo `src/lib/database.ts` línea 34:

```typescript
// Cambiar de:
const dbPath = path.join(process.cwd(), 'app_1mesfinal2.db');

// A:
const dbPath = path.join(process.cwd(), process.env.DATABASE_PATH || 'app_1mesfinal2.db');
```

#### Paso 5: Verificar la Conexión

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

Abrir en el navegador: `http://localhost:3000/api/db/test`

Deberías ver estadísticas de las tablas de tu base de datos.

---

### OPCIÓN 2: Conexión Remota via Túnel SSH

Esta opción permite conectar Aither a la base de datos Cicerone a través de un túnel SSH seguro.

#### Paso 1: Configurar Túnel SSH

En el servidor donde corre Aither, crear un túnel SSH hacia el servidor de Cicerone:

```bash
# Crear túnel SSH que mapea la base de datos remota localmente
ssh -L 9999:localhost:9999 usuario@servidor-cicerone -N -f

# El puerto 9999 es un ejemplo, puedes usar cualquier puerto disponible
```

**Explicación:**
- `-L 9999:localhost:9999`: Mapea el puerto 9999 local al puerto 9999 del servidor remoto
- `-N`: No ejecuta comandos remotos
- `-f`: Corre en segundo plano

#### Paso 2: Exponer SQLite via Servicio HTTP (En servidor Cicerone)

SQLite no soporta conexiones de red directamente. Necesitas crear un servicio HTTP simple en Python:

Crear archivo `sqlite_server.py` en el servidor Cicerone:

```python
#!/usr/bin/env python3
import sqlite3
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

DB_PATH = '/ruta/a/tu/cicerone.db'
PORT = 9999

class SQLiteHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parsear query string
        parsed_path = urlparse(self.path)
        query_params = parse_qs(parsed_path.query)

        if parsed_path.path == '/query':
            sql = query_params.get('sql', [''])[0]

            try:
                conn = sqlite3.connect(DB_PATH)
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute(sql)

                rows = [dict(row) for row in cursor.fetchall()]

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'data': rows}).encode())

                conn.close()
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('localhost', PORT), SQLiteHandler)
    print(f'SQLite HTTP Server running on port {PORT}...')
    server.serve_forever()
```

Ejecutar el servidor:

```bash
python3 sqlite_server.py &
```

#### Paso 3: Modificar Aither para usar la API HTTP

Crear un nuevo adaptador en `src/lib/database-remote.ts`:

```typescript
import fetch from 'node-fetch';

const REMOTE_DB_URL = 'http://localhost:9999/query';

export async function queryRemoteDatabase(sql: string) {
  const response = await fetch(`${REMOTE_DB_URL}?sql=${encodeURIComponent(sql)}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}
```

**Nota:** Esta opción requiere modificaciones significativas en la aplicación y se recomienda solo si las Opciones 1 y 3 no son viables.

---

### OPCIÓN 3: Replicación a Turso (Recomendada para Producción)

Turso es un servicio de SQLite en la nube que permite acceder a la base de datos desde cualquier lugar.

#### Paso 1: Instalar Turso CLI

En el servidor de Cicerone:

```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

#### Paso 2: Autenticarse en Turso

```bash
turso auth login
```

Esto abrirá un navegador para autenticarte.

#### Paso 3: Crear Base de Datos en Turso

```bash
turso db create aither-cicerone-prod
```

#### Paso 4: Replicar Datos desde SQLite Local a Turso

```bash
# Exportar datos de la base de datos local
sqlite3 /ruta/a/tu/cicerone.db .dump > cicerone_dump.sql

# Importar a Turso
turso db shell aither-cicerone-prod < cicerone_dump.sql
```

#### Paso 5: Obtener Credenciales de Turso

```bash
# Obtener URL de la base de datos
turso db show aither-cicerone-prod --url

# Crear token de autenticación
turso db tokens create aither-cicerone-prod
```

Guardar estos valores:
- `TURSO_DATABASE_URL`: La URL obtenida del primer comando
- `TURSO_AUTH_TOKEN`: El token obtenido del segundo comando

#### Paso 6: Configurar Variables de Entorno en Aither

Editar `.env.local`:

```bash
# Usar Turso
USE_TURSO=true

# Credenciales de Turso
TURSO_DATABASE_URL=libsql://aither-cicerone-prod-XXXXX.turso.io
TURSO_AUTH_TOKEN=tu_token_aqui
```

#### Paso 7: Sincronización Automática (Opcional)

Para mantener los datos sincronizados, crear un script cron en el servidor Cicerone:

Crear archivo `sync_to_turso.sh`:

```bash
#!/bin/bash

DB_PATH="/ruta/a/tu/cicerone.db"
TURSO_DB="aither-cicerone-prod"
TEMP_DUMP="/tmp/cicerone_dump.sql"

# Exportar base de datos local
sqlite3 $DB_PATH .dump > $TEMP_DUMP

# Limpiar base de datos remota y reimportar
turso db shell $TURSO_DB "DROP TABLE IF EXISTS usuario;"
turso db shell $TURSO_DB "DROP TABLE IF EXISTS telemonitorizacion;"
# ... (eliminar todas las tablas)

turso db shell $TURSO_DB < $TEMP_DUMP

echo "Sincronización completada: $(date)"
```

Hacer el script ejecutable:

```bash
chmod +x sync_to_turso.sh
```

Agregar a cron (ejecutar cada hora):

```bash
crontab -e

# Agregar línea:
0 * * * * /ruta/a/sync_to_turso.sh >> /var/log/turso_sync.log 2>&1
```

#### Paso 8: Verificar Conexión

```bash
npm run dev
```

Abrir: `http://localhost:3000/api/db/test`

---

## Verificación de la Configuración

### 1. Probar Endpoint de Test

```bash
curl http://localhost:3000/api/db/test
```

Respuesta esperada:

```json
{
  "success": true,
  "message": "Conexión exitosa a la base de datos",
  "stats": {
    "usuarios": 16,
    "telemonitorizaciones": 501,
    "actividades": 496,
    ...
  }
}
```

### 2. Probar Listado de Usuarios

```bash
curl http://localhost:3000/api/db/usuarios
```

### 3. Probar Usuario Específico

```bash
curl http://localhost:3000/api/db/usuarios/1
```

Reemplazar `1` con un ID de usuario válido de tu base de datos.

### 4. Verificar en la Interfaz Web

1. Abrir navegador en `http://localhost:3000`
2. Iniciar sesión con Firebase
3. Verificar que se muestren los pacientes de tu base de datos
4. Hacer clic en un paciente para ver el dashboard detallado
5. Verificar que todas las métricas se muestren correctamente

---

## Configuración en Producción

### Despliegue en Servidor Linux (Mismo servidor que Cicerone)

Si deseas desplegar Aither en el mismo servidor Linux donde corre Cicerone:

#### Usando PM2 (Recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Build de producción
npm run build

# Iniciar con PM2
pm2 start npm --name "aither" -- start

# Configurar para que inicie automáticamente
pm2 startup
pm2 save
```

#### Configurar Nginx como Reverse Proxy

Crear archivo `/etc/nginx/sites-available/aither`:

```nginx
server {
    listen 80;
    server_name aither.cicerone.local;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Habilitar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/aither /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Despliegue en Vercel (Requiere Turso)

1. Conectar repositorio de Aither a Vercel
2. Configurar variables de entorno en Vercel Dashboard:
   - Todas las variables de Firebase
   - `USE_TURSO=true`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
3. Deploy automático

Ver más detalles en: [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)

---

## Consideraciones de Seguridad

### 1. Protección de Datos Sensibles

La base de datos contiene información médica sensible (datos personales de pacientes):

- **NUNCA** subir el archivo `.db` a Git
- **NUNCA** exponer la base de datos públicamente sin autenticación
- Usar siempre HTTPS en producción
- Implementar autenticación en todos los endpoints de API

### 2. Permisos de Archivo

En Linux, asegurar permisos adecuados:

```bash
# La base de datos debe ser legible solo por el usuario de la app
chmod 600 cicerone.db
chown aither-user:aither-user cicerone.db
```

### 3. Backups Regulares

Configurar backups automáticos de la base de datos:

```bash
#!/bin/bash
# backup_db.sh

DB_PATH="/ruta/a/tu/cicerone.db"
BACKUP_DIR="/backups/cicerone"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear backup
sqlite3 $DB_PATH ".backup '$BACKUP_DIR/cicerone_$DATE.db'"

# Mantener solo últimos 30 días
find $BACKUP_DIR -name "cicerone_*.db" -mtime +30 -delete

echo "Backup completado: cicerone_$DATE.db"
```

Agregar a cron (diario a las 2 AM):

```bash
0 2 * * * /ruta/a/backup_db.sh >> /var/log/cicerone_backup.log 2>&1
```

### 4. Firewall

Si usas la Opción 2 (túnel SSH), asegurar que el puerto del servicio HTTP solo acepte conexiones locales:

```bash
# Configurar firewall para bloquear puerto 9999 externamente
sudo ufw deny 9999
sudo ufw allow from 127.0.0.1 to any port 9999
```

---

## Troubleshooting

### Problema: "Database file not found"

**Solución:**
- Verificar que el archivo `.db` exista en la ruta correcta
- Verificar permisos de lectura del archivo
- Revisar que la ruta en `database.ts` sea correcta

```bash
ls -la app_1mesfinal2.db
```

### Problema: "Database is locked"

**Causa:** Otro proceso está usando la base de datos.

**Solución:**
- Si Cicerone y Aither usan la misma base de datos, asegurar que ambos usen WAL mode
- Cerrar cualquier conexión sqlite3 abierta en terminal
- Reiniciar la aplicación

```bash
# Habilitar WAL mode en la base de datos
sqlite3 cicerone.db "PRAGMA journal_mode=WAL;"
```

### Problema: "Missing columns" o datos no se muestran

**Causa:** El esquema de la base de datos real difiere del ejemplo.

**Solución:**
1. Verificar esquema de las tablas:

```bash
sqlite3 cicerone.db ".schema usuario"
sqlite3 cicerone.db ".schema telemonitorizacion"
# ... para cada tabla
```

2. Comparar con los tipos TypeScript en `src/types/database.ts`
3. Ajustar el código si hay nombres de columnas diferentes

### Problema: "No data" en los gráficos

**Causas posibles:**
- Fechas en formato incorrecto (debe ser `YYYY-MM-DD`)
- Valores NULL en columnas críticas
- IDs de relaciones incorrectos

**Solución:**
1. Verificar datos de ejemplo en la base de datos:

```bash
sqlite3 cicerone.db "SELECT * FROM usuario LIMIT 1;"
sqlite3 cicerone.db "SELECT * FROM telemonitorizacion LIMIT 1;"
```

2. Verificar consola del navegador (F12) para errores de JavaScript
3. Revisar logs del servidor: `npm run dev` mostrará errores de queries

### Problema: Rendimiento lento

**Soluciones:**
1. Agregar índices a la base de datos:

```sql
-- En la base de datos Cicerone
CREATE INDEX IF NOT EXISTS idx_telemon_usuario ON telemonitorizacion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_telemon_fecha ON telemonitorizacion(fecha);
CREATE INDEX IF NOT EXISTS idx_actividad_telemon ON actividad(telemonitorizacion_id);
CREATE INDEX IF NOT EXISTS idx_sleep_telemon ON sleep(telemonitorizacion_id);
```

2. Habilitar WAL mode (si no está habilitado):

```bash
sqlite3 cicerone.db "PRAGMA journal_mode=WAL;"
```

3. Si usas Turso, considerar configurar réplicas más cercanas geográficamente

---

## Migración de Datos del Ejemplo a Producción

Si la base de datos real de Cicerone tiene un esquema ligeramente diferente, puede ser necesario crear un script de migración.

### Ejemplo: Script de Migración de Columnas

Si los nombres de columnas difieren:

```sql
-- migration.sql

-- Crear tabla temporal con el esquema esperado por Aither
CREATE TABLE usuario_new AS SELECT
  id,
  nombre,
  peso,
  altura,
  edad,
  genero,
  -- Mapear nombres diferentes
  ultimo_cigarro AS ultimo_cigarrillo,
  es_incumplidor AS incumplidor,
  -- ...más campos
FROM usuario_old;

-- Eliminar tabla antigua y renombrar
DROP TABLE usuario_old;
ALTER TABLE usuario_new RENAME TO usuario;
```

Ejecutar migración:

```bash
sqlite3 cicerone.db < migration.sql
```

---

## Contacto y Soporte

Si tienes problemas durante la configuración:

1. **Revisar documentación técnica:**
   - [SQLITE_GUIDE.md](./SQLITE_GUIDE.md) - Detalles del esquema de base de datos
   - [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) - Guía de despliegue completo

2. **Logs de la aplicación:**
   - Revisar consola del navegador (F12 → Console)
   - Revisar logs del servidor Node.js
   - Revisar logs de PM2: `pm2 logs aither`

3. **Contactar al equipo de desarrollo:**
   - Email: a01642529@tec.mx
   - GitHub Issues: [Repositorio de Aither]

---

## Checklist de Implementación

Usar este checklist para verificar que la conexión esté completa:

- [ ] Base de datos de Cicerone localizada y accesible
- [ ] Esquema verificado (todas las tablas requeridas existen)
- [ ] Opción de conexión seleccionada (1, 2 o 3)
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servidor de desarrollo iniciado (`npm run dev`)
- [ ] Endpoint `/api/db/test` retorna datos correctos
- [ ] Dashboard principal muestra pacientes reales
- [ ] Vista de detalle muestra métricas correctas
- [ ] Gráficos se renderizan con datos reales
- [ ] Autenticación de Firebase funciona correctamente
- [ ] Permisos de archivos configurados correctamente (Linux)
- [ ] Backups configurados (para producción)
- [ ] Firewall configurado (si aplica)
- [ ] HTTPS configurado (para producción)

---

## Resumen de Recomendaciones por Escenario

| Escenario | Opción Recomendada | Complejidad | Rendimiento |
|-----------|-------------------|-------------|-------------|
| **Desarrollo Local** | Opción 1: Reemplazo directo | Baja ⭐ | Excelente ⚡⚡⚡ |
| **Mismo Servidor** | Opción 1: Enlace simbólico | Baja ⭐ | Excelente ⚡⚡⚡ |
| **Servidores Diferentes (interno)** | Opción 2: Túnel SSH | Alta ⭐⭐⭐ | Bueno ⚡⚡ |
| **Producción (Vercel/Cloud)** | Opción 3: Turso | Media ⭐⭐ | Muy bueno ⚡⚡⚡ |
| **Producción (Linux VPS)** | Opción 1: Directo | Baja ⭐ | Excelente ⚡⚡⚡ |

---

**¡Listo!** Con esta guía, el equipo de Cicerone debería poder conectar su base de datos real con Aither de manera exitosa.

Para cualquier duda o problema durante la implementación, consultar las secciones de Troubleshooting o contactar al equipo de desarrollo.
