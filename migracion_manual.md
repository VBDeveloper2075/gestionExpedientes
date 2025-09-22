# Migración manual de datos MySQL a Supabase

En este documento, te mostraré cómo migrar manualmente los datos de tu base MySQL a Supabase. Te proporcioné dos opciones:

1. Script para generación automática de SQL
2. Pasos para migración manual con herramientas de Supabase

## Opción 1: Generar SQL con script de Node.js

### Requisitos previos
- Node.js instalado
- Acceso a tu base de datos MySQL (XAMPP)
- Las dependencias: `mysql2`, `uuid`, `dotenv`

### Pasos

1. **Instala las dependencias**:
   ```bash
   npm install mysql2 uuid dotenv
   ```

2. **Configura el entorno**:
   Modifica `.env.supabase` con tus credenciales:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=jp3_db
   ```

3. **Ejecuta el script**:
   ```bash
   node generate-migration-sql.js
   ```

4. **Revisa el SQL generado**:
   Se generará un archivo `supabase_data_migration.sql` con todas las sentencias SQL necesarias para migrar tus datos.

5. **Ejecuta el SQL en Supabase**:
   - Accede al panel de Supabase: https://supabase.com/dashboard/project/nriwwklowzwjlzmwmyrn/database/schemas
   - Ve a la sección "SQL Editor"
   - Pega el contenido del archivo SQL generado
   - Ejecuta el script

## Opción 2: Migración manual

Si prefieres un enfoque más manual o el script no funciona por alguna razón:

### Para tablas independientes (docentes, escuelas)

1. **Exporta los datos**:
   - En phpMyAdmin, selecciona la tabla (ej: docentes)
   - Ve a "Exportar" y elige formato CSV
   - Descarga el archivo

2. **Importa a Supabase**:
   - En el panel de Supabase, ve a la sección "Table Editor"
   - Selecciona la tabla correspondiente
   - Haz clic en "Insert" -> "Import data from CSV"
   - Sube el archivo CSV
   - Configura la asignación de columnas (ignora ID, Supabase generará UUIDs nuevos)

3. **Anota el mapeo de IDs**:
   - Necesitarás crear un mapeo manual entre los IDs viejos (MySQL) y los nuevos UUIDs (Supabase)
   - Esto es necesario para mantener las relaciones

### Para tablas con dependencias (expedientes, disposiciones)

1. Primero debes tener un mapeo de IDs de las tablas independientes
2. Sigue los pasos de exportación/importación como arriba
3. Actualiza manualmente las referencias a IDs o usa SQL directo:

```sql
UPDATE expedientes SET docente_id = 'nuevo_uuid' WHERE id = 'expediente_uuid';
```

### Para usuarios

Los usuarios en Supabase requieren un proceso especial:

1. Crea los usuarios en la sección Auth de Supabase
2. Anota los UUIDs generados
3. Inserta datos adicionales en la tabla users usando esos UUIDs

## Nota sobre UUIDs

Supabase usa UUIDs como claves primarias, mientras que tu base MySQL usa enteros auto-incrementales. Esto requiere un mapeo cuidadoso para mantener las relaciones entre tablas.

El script proporcionado maneja esto automáticamente, generando UUIDs consistentes y manteniendo un mapa de conversión entre IDs viejos y nuevos.