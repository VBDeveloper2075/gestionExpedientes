# Configuración de Base de Datos para JP3

Este documento describe la estructura de la base de datos utilizada en el proyecto JP3, un sistema de gestión de expedientes educativos.

## Estructura de la Base de Datos

La base de datos `jp3_db` contiene las siguientes tablas:

### 1. Tabla `docentes`
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `nombre`: VARCHAR(100) NOT NULL
- `apellido`: VARCHAR(100) NOT NULL
- `dni`: VARCHAR(20) NOT NULL
- `email`: VARCHAR(100)
- `telefono`: VARCHAR(50)
- `fecha_creacion`: DATETIME NOT NULL

### 2. Tabla `escuelas`
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `nombre`: VARCHAR(100) NOT NULL
- `direccion`: VARCHAR(200)
- `telefono`: VARCHAR(50)
- `email`: VARCHAR(100)
- `fecha_creacion`: DATETIME NOT NULL

### 3. Tabla `expedientes`
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `numero`: VARCHAR(50) NOT NULL
- `asunto`: TEXT NOT NULL
- `fecha_recibido`: DATE NOT NULL
- `notificacion`: TEXT
- `resolucion`: TEXT
- `pase`: TEXT
- `observaciones`: TEXT
- `estado`: VARCHAR(50) DEFAULT 'pendiente'
- `docente_id`: INT (FOREIGN KEY -> docentes.id)
- `escuela_id`: INT (FOREIGN KEY -> escuelas.id)
- `fecha_creacion`: DATETIME NOT NULL
- `fecha_inicio`: DATE

### 4. Tabla `disposiciones`
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `numero`: VARCHAR(50) NOT NULL
- `fecha_dispo`: DATE NOT NULL
- `dispo`: TEXT NOT NULL
- `docente_id`: INT (FOREIGN KEY -> docentes.id)
- `cargo`: VARCHAR(100)
- `motivo`: TEXT
- `enlace`: VARCHAR(255)
- `fecha_creacion`: DATETIME NOT NULL

### 5. Tabla `expedientes_docentes` (tabla de relación)
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `expediente_id`: INT (FOREIGN KEY -> expedientes.id)
- `docente_id`: INT (FOREIGN KEY -> docentes.id)

### 6. Tabla `expedientes_escuelas` (tabla de relación)
- `id`: INT (PRIMARY KEY, AUTO_INCREMENT)
- `expediente_id`: INT (FOREIGN KEY -> expedientes.id)
- `escuela_id`: INT (FOREIGN KEY -> escuelas.id)

## Relaciones

- Un **expediente** puede estar asociado con múltiples **docentes** (relación muchos a muchos a través de `expedientes_docentes`)
- Un **expediente** puede estar asociado con múltiples **escuelas** (relación muchos a muchos a través de `expedientes_escuelas`)
- Una **disposición** está asociada a un **docente** (relación muchos a uno)
- Los expedientes también mantienen campos directos `docente_id` y `escuela_id` por compatibilidad con versiones anteriores

## Notas sobre la evolución del esquema

- La base de datos ha evolucionado desde relaciones directas (a través de `docente_id` y `escuela_id`) a relaciones muchos a muchos con tablas intermedias.
- Los campos `notificacion` y `resolucion` se modificaron de VARCHAR a TEXT para permitir contenido más largo.
- Existe un campo `fecha_inicio` que se renombró a `fecha_recibido` en algunas actualizaciones, pero se mantienen ambos por compatibilidad.

## Índices

Para optimizar el rendimiento de consultas frecuentes, se han creado los siguientes índices:

- `idx_docentes_dni` en `docentes(dni)`
- `idx_expedientes_numero` en `expedientes(numero)`
- `idx_expedientes_estado` en `expedientes(estado)`
- `idx_disposiciones_numero` en `disposiciones(numero)`

## Scripts de Inicialización

- `createDatabase.sql`: Script SQL para crear la base de datos y todas las tablas
- `initDatabase.js`: Script JavaScript que utiliza Node.js para crear la base de datos programáticamente
