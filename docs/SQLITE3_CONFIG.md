# Guía para configurar/modificar archivos con SQLite3

## 1. Requisitos del sistema

### Instalación de herramienta SQLite3

##### Instalación en Windows

En Windows PowerShell:

```bash
winget install SQLite.SQLite
```

##### Instalación en Linux

En la terminal de Linux:

```bash
sudo apt update
sudo apt install sqlite3
sqlite3 --version # Verificar versión instalada
```

## 2. Comandos básicos

### Creación/Acceso de base de datos

Para poder crear/modificar el archivo de la base de datos se usa:

```bash
sqlite3 app.db
```

Si el archivo no existe en el directorio en el que se ejecute el comando se creará, en caso contrario permitirá su modificación.

Una vez ejcutado entraremos en la terminal de sqlite3 (identificada con el prompt: sqlite3>), dentro de esta podemos ejecutar comandos de sqlite3.

### Creación de tablas

```bash
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY,
  nombre TEXT
);

INSERT INTO usuarios(nombre) VALUES ('Juan'); # insertar tuplas a la tabla

SELECT * FROM usuarios; # Comprobar inserción
```

### Modificación de tablas

```bash
ALTER TABLE usuarios ADD COLUMN telefono TEXT; # Añadir una columna

ALTER TABLE usuarios RENAME TO clientes; # Renombrar tabla

ALTER TABLE usuarios RENAME COLUMN nombre TO nombre_completo; # Renombrar columnas

UPDATE usuarios SET edad = 30 WHERE nombre = 'Juan'; #Actualizar datos 
```

### Eliminación de tablas

```bash
DROP TABLE usuarios; # Elimina la tabla completa

DELETE FROM usuarios; # Elimina tuplas de la tabla

DELETE FROM usuarios WHERE id = 1; # Elimina tuplas con condiciones WHERE
```

### Consultas en las tablas

```bash
SELECT * FROM usuarios; # Listar todos los registros

SELECT nombre, email FROM usuarios; # Ver columnas concretas

SELECT * FROM usuarios WHERE edad > 18; # Filtrado con WHERE (condiciones)
SELECT * FROM usuarios WHERE edad > 18 AND edad < 30;
SELECT * FROM usuarios WHERE nombre = 'Juan' OR nombre = 'Ana';

SELECT * FROM usuarios ORDER BY edad ASC; # Ordenación de resultados

SELECT * FROM usuarios LIMIT 5; # Limitar registros resultantes

SELECT * FROM usuarios WHERE nombre LIKE 'Ju%'; # Búsqueda parcial

SELECT COUNT(*) FROM usuarios; # Conteo de filas

SELECT MAX(edad) FROM usuarios; # Máximo
SELECT MIN(edad) FROM usuarios; # Mínimo
SELECT AVG(edad) FROM usuarios; # Promedio
```

### Comandos generales SQLite3 

```bash
.help # Mostrar información de los comandos disponibles

.tables # Ver tablas 

.schema # Ver estructura de TODAS las tablas
.schema usuarios # ver estructura de la tabla usuarios

.quit # Salir de CLI de sqlite3
.exit
```
