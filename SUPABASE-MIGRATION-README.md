# Guía de Migración a Supabase

Este documento proporciona instrucciones para migrar la base de datos de MySQL a Supabase PostgreSQL y adaptar la funcionalidad de paginación.

## Requisitos previos

- Node.js v12 o superior
- Cuenta en Supabase con proyecto creado
- Credenciales de acceso (URL y claves)
- Módulos npm necesarios:
  - dotenv
  - @supabase/supabase-js
  - uuid

## Configuración inicial

1. Instala las dependencias necesarias:

```bash
npm install dotenv @supabase/supabase-js uuid
```

2. Crea un archivo `.env.supabase` basado en `.env.supabase.example`:

```bash
cp .env.supabase.example .env.supabase
```

3. Edita `.env.supabase` con tus credenciales reales:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu-clave-service-role-secreta
```

## Pasos de migración

### 1. Verificar conexión a Supabase

Ejecuta el script de verificación para asegurar que las credenciales son correctas:

```bash
node check-supabase-connection.js
```

### 2. Crear esquema de base de datos

Carga el esquema SQL que define las tablas:

1. Abre la consola SQL de Supabase en el panel de administración
2. Ejecuta el script `supabase_schema.sql`
3. Verifica que las tablas se hayan creado correctamente

### 3. Crear función de paginación para docentes

Ejecuta el script SQL que implementa la paginación del lado del servidor:

1. Abre la consola SQL de Supabase
2. Ejecuta el script `supabase_paginacion_docentes.sql`
3. Verifica que la función se haya creado correctamente

### 4. Convertir datos SQL a JSON

Procesa el archivo SQL de migración para generar archivos JSON más fáciles de cargar:

```bash
node generate-json-from-sql.js
```

### 5. Verificar posibles conflictos de UUID

Ejecuta la verificación de UUIDs para asegurar que no habrá conflictos en la migración:

```bash
node check-uuid-conflicts.js
```

### 6. Cargar datos por lotes

Ejecuta el script de carga de datos que inserta los registros en pequeños lotes:

```bash
node supabase_batch_loader.js
```

### 7. Actualizar servicio frontend

Reemplaza el archivo de servicio actual por la versión adaptada para Supabase:

```bash
cp docentesServiceSupabase.js cliente/src/services/docentesService.js
```

## Solución de problemas comunes

### Error de permisos en triggers

Si encuentras errores como `permission denied: 'RI_ConstraintTrigger_c_26646' is a system trigger` al ejecutar sentencias SQL directamente, utiliza la estrategia de carga por lotes que evita estos problemas.

### Conflictos de UUID

Si la verificación de UUIDs muestra problemas:

1. Revisa los datos identificados como problemáticos
2. Genera nuevos UUIDs para los registros conflictivos:
   ```javascript
   const { v4: uuidv4 } = require('uuid');
   const newId = uuidv4();
   ```
3. Actualiza los datos JSON antes de la carga

### Tiempos de espera

Si ocurren tiempos de espera durante la carga:

1. Reduce el valor de `BATCH_SIZE` en `supabase_batch_loader.js`
2. Aumenta el tiempo de espera entre lotes

## Verificación post-migración

Para verificar que la migración se completó correctamente:

1. Ejecuta consultas de prueba:
   ```bash
   node test-supabase-paginacion.js
   ```

2. Verifica la funcionalidad de paginación en la interfaz:
   ```bash
   cd cliente
   npm start
   ```

## Recursos adicionales

- [Documentación de Supabase](https://supabase.io/docs)
- [Referencia de API de cliente de Supabase](https://supabase.io/docs/reference/javascript/supabase-client)
- [Guía de PostgreSQL](https://www.postgresql.org/docs/)