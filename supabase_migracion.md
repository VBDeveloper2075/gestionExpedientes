# Migración de JP3 a Supabase

Este documento proporciona instrucciones para migrar la base de datos JP3 a Supabase.

## Acerca de Supabase

Supabase es una alternativa de código abierto a Firebase que proporciona:

- Base de datos PostgreSQL
- Autenticación de usuarios
- Almacenamiento de archivos
- API instantánea
- Funciones edge

## Pasos para la migración

### 1. Ejecutar el script SQL en Supabase

1. Accede al panel de Supabase: https://supabase.com/dashboard/project/nriwwklowzwjlzmwmyrn/database/schemas
2. Navega a la sección "SQL Editor"
3. Crea un nuevo query
4. Copia y pega el contenido del archivo `supabase_schema.sql`
5. Ejecuta el script

### 2. Configuración de la autenticación

El esquema utiliza integración con el sistema de autenticación de Supabase:

- La tabla `users` está vinculada con `auth.users`
- Se han configurado políticas RLS (Row Level Security)

### 3. Migración de datos

Para migrar los datos existentes, puedes usar alguna de estas opciones:

#### A. Migración manual (para pocos datos)

1. Exporta los datos de tu base de datos MySQL actual a formato CSV
2. Importa los datos usando la función de importación CSV de Supabase

#### B. Migración programática

1. Crea un script que lea datos de MySQL y los inserte en Supabase usando la API o conexiones directas
2. Considera la conversión de IDs (de INT a UUID)

### 4. Actualización de la aplicación

Tendrás que actualizar tu aplicación para:

1. Usar la API de Supabase o conexiones PostgreSQL directas
2. Manejar UUIDs en lugar de IDs enteros
3. Implementar la autenticación usando el cliente de Supabase

## Diferencias principales con MySQL

- Se usa PostgreSQL en lugar de MySQL
- IDs como UUID en lugar de INT AUTO_INCREMENT
- Uso del sistema de autenticación integrado de Supabase
- RLS (Row Level Security) para control de acceso a nivel de fila
- Nombres de columnas timestamp estandarizados (created_at, updated_at)
- Constraints más estrictos (UNIQUE, CHECK, etc.)

## Consideraciones de seguridad

- La seguridad se maneja principalmente a través de RLS
- Debes configurar reglas RLS adicionales según tus necesidades específicas
- Revisa las políticas de ejemplo incluidas y ajústalas