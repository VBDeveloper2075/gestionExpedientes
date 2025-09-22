# Adaptación de la Paginación de Docentes para Supabase

Este documento detalla cómo adaptar la implementación actual de paginación para la tabla de docentes, pasando del servidor MySQL actual a la nueva implementación en Supabase PostgreSQL.

## Tabla de Contenidos

1. [Situación Actual](#situación-actual)
2. [Cambios Necesarios](#cambios-necesarios)
3. [Implementación en Supabase](#implementación-en-supabase)
4. [Adaptación del Frontend](#adaptación-del-frontend)
5. [Pruebas y Validación](#pruebas-y-validación)
6. [Solución de Problemas](#solución-de-problemas)

## Situación Actual

### Arquitectura actual
- **Backend**: Node.js/Express con MySQL
- **Frontend**: React con llamadas Axios a la API
- **Modelo de datos**: IDs numéricos, paginación implementada en SQL con LIMIT/OFFSET
- **Formato de respuesta**: `{ data: [...], pagination: { page, limit, total, totalPages } }`

### Implementación actual de paginación
- **API**: `GET /api/docentes?page=1&limit=25&search=texto`
- **Modelo**: Consultas SQL con LIMIT/OFFSET y conteo total para cálculo de páginas
- **Frontend**: Componente de paginación con navegación y búsqueda

## Cambios Necesarios

### Cambios estructurales
1. **Identificadores**: Pasar de IDs numéricos a UUIDs
2. **Nombre de columnas**: `fecha_creacion` → `created_at`, etc.
3. **Cliente de base de datos**: De MySQL a PostgreSQL/Supabase Client

### Cambios en la API
1. **Endpoints**: Migrar a funciones RPC de Supabase o mantener API propia
2. **Autenticación**: Integrar con sistema de autenticación de Supabase
3. **Políticas de seguridad**: Implementar RLS (Row Level Security)

## Implementación en Supabase

### Opción 1: Funciones PostgreSQL para Paginación

```sql
-- Crear función para obtener docentes paginados
CREATE OR REPLACE FUNCTION public.get_docentes_paginados(
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 25,
  p_search TEXT DEFAULT ''
)
RETURNS JSON AS $$
DECLARE
  v_offset INTEGER;
  v_total INTEGER;
  v_total_pages INTEGER;
  v_result JSON;
BEGIN
  -- Calcular offset
  v_offset := (p_page - 1) * p_limit;
  
  -- Contar total para calcular páginas
  SELECT COUNT(*) INTO v_total
  FROM public.docentes
  WHERE 
    p_search = '' OR
    nombre ILIKE '%' || p_search || '%' OR
    apellido ILIKE '%' || p_search || '%' OR
    dni ILIKE '%' || p_search || '%' OR
    email ILIKE '%' || p_search || '%';
  
  -- Calcular total de páginas
  v_total_pages := CEILING(v_total::NUMERIC / p_limit);
  
  -- Ejecutar consulta principal
  SELECT json_build_object(
    'data', COALESCE((
      SELECT json_agg(d)
      FROM (
        SELECT *
        FROM public.docentes
        WHERE 
          p_search = '' OR
          nombre ILIKE '%' || p_search || '%' OR
          apellido ILIKE '%' || p_search || '%' OR
          dni ILIKE '%' || p_search || '%' OR
          email ILIKE '%' || p_search || '%'
        ORDER BY apellido, nombre
        LIMIT p_limit OFFSET v_offset
      ) d
    ), '[]'::json),
    'pagination', json_build_object(
      'page', p_page,
      'limit', p_limit,
      'total', v_total,
      'totalPages', v_total_pages
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asignar permisos a la función
GRANT EXECUTE ON FUNCTION public.get_docentes_paginados TO authenticated;
```

### Opción 2: Usar las consultas nativas de Supabase Client

Esta opción requiere mantener la lógica de paginación en el backend Node.js, pero usando Supabase como cliente:

```javascript
// Importar el cliente de Supabase
const { createClient } = require('@supabase/supabase-js');

// Inicializar el cliente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// En el modelo Docente.js:
const DocenteModel = {
  // Obtener todos los docentes con paginación
  getAll: async (options = {}) => {
    try {
      const { page = 1, limit = 25, search = '' } = options;
      const offset = (page - 1) * limit;
      
      console.log(`Docentes Model (Supabase) - Página: ${page}, Límite: ${limit}, Búsqueda: "${search}"`);
      
      // Consulta principal con paginación
      let query = supabase.from('docentes').select('*');
      
      // Aplicar búsqueda si existe
      if (search) {
        query = query.or(
          `nombre.ilike.%${search}%,` + 
          `apellido.ilike.%${search}%,` +
          `dni.ilike.%${search}%,` +
          `email.ilike.%${search}%`
        );
      }
      
      // Aplicar ordenamiento, límite y offset
      const { data, error } = await query
        .order('apellido', { ascending: true })
        .order('nombre', { ascending: true })
        .range(offset, offset + limit - 1);
        
      if (error) throw error;
      
      // Contar total para calcular páginas
      const { count, error: countError } = await supabase
        .from('docentes')
        .select('id', { count: 'exact' });
        
      if (countError) throw countError;
      
      const total = count;
      console.log(`✓ Docentes: ${data.length} registros de ${total} totales (página ${page}/${Math.ceil(total / limit)})`);
      
      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error en getAll de Docentes:', error);
      throw error;
    }
  },

  // Otras funciones (getById, create, update, delete) adaptadas para Supabase
  // ...
};
```

## Adaptación del Frontend

### Cambios en DocentesService.js

```javascript
import { createClient } from '@supabase/supabase-js';

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DocentesService = {
  // Obtener todos los docentes con paginación
  getAll: async (page = 1, limit = 25, search = '') => {
    try {
      console.log('🔗 Llamando a Supabase para docentes paginados:', { page, limit, search });
      
      // Opción 1: Llamar a la función RPC de PostgreSQL
      const { data, error } = await supabase
        .rpc('get_docentes_paginados', { 
          p_page: page, 
          p_limit: limit, 
          p_search: search 
        });

      // Opción 2: Usar la API de Supabase directamente (requiere más código para la paginación)
      /*
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Consulta principal para datos
      let query = supabase.from('docentes').select('*');
      
      if (search) {
        query = query.or(
          `nombre.ilike.%${search}%,` + 
          `apellido.ilike.%${search}%,` +
          `dni.ilike.%${search}%,` +
          `email.ilike.%${search}%`
        );
      }
      
      const { data: docentes, error: dataError } = await query
        .order('apellido', { ascending: true })
        .order('nombre', { ascending: true })
        .range(from, to);
      
      if (dataError) throw dataError;
      
      // Consulta para contar total
      const { count, error: countError } = await supabase
        .from('docentes')
        .select('id', { count: 'exact' })
        .or(search ? 
          `nombre.ilike.%${search}%,` + 
          `apellido.ilike.%${search}%,` +
          `dni.ilike.%${search}%,` +
          `email.ilike.%${search}%` : '');
      
      if (countError) throw countError;
      
      const result = {
        data: docentes,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
      */
      
      if (error) throw error;
      
      console.log('📦 Respuesta de Supabase:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error al obtener docentes:', error);
      
      if (error.message?.includes('Failed to fetch')) {
        console.error('🔌 Error de conexión con Supabase');
        throw new Error('Error de conexión con la base de datos. Verifica tu conexión a internet.');
      }
      
      throw error;
    }
  },

  // Obtener un docente por su ID
  getById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('docentes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error al obtener el docente con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo docente
  create: async (docente) => {
    try {
      const { data, error } = await supabase
        .from('docentes')
        .insert([{
          nombre: docente.nombre,
          apellido: docente.apellido,
          dni: docente.dni,
          email: docente.email || null,
          telefono: docente.telefono || null
        }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error al crear docente:', error);
      throw error;
    }
  },

  // Actualizar un docente existente
  update: async (id, docente) => {
    try {
      const { data, error } = await supabase
        .from('docentes')
        .update({
          nombre: docente.nombre,
          apellido: docente.apellido,
          dni: docente.dni,
          email: docente.email || null,
          telefono: docente.telefono || null
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error(`Error al actualizar el docente con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un docente
  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('docentes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error al eliminar el docente con ID ${id}:`, error);
      throw error;
    }
  }
};

export default DocentesService;
```

### Cambios en cliente/src/config.js

```javascript
// Configuración para Supabase
export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://nriwwklowzwjlzmwmyrn.supabase.co';
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'tu_clave_anon_publica';

// Configuración de la API (para compatibilidad)
const isProd = process.env.NODE_ENV === 'production';
const baseDev = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = isProd ? '/api' : `${baseDev}/api`;

export default API_URL;
```

### Configuración del entorno

Crea un archivo `.env` en la carpeta del cliente:

```
REACT_APP_SUPABASE_URL=https://nriwwklowzwjlzmwmyrn.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anon_publica
```

## Pruebas y Validación

### Plan de pruebas para la paginación

1. **Prueba básica de carga**: Verificar que la primera página se carga correctamente
2. **Prueba de navegación**: Comprobar que funciona ir a la siguiente/anterior/última página
3. **Prueba de búsqueda**: Verificar que la búsqueda filtra correctamente y actualiza la paginación
4. **Prueba de límite**: Comprobar el cambio en el número de elementos por página
5. **Prueba de ordenamiento**: Verificar que el orden por apellido+nombre funciona
6. **Prueba de visualización**: Comprobar que la información de "mostrando X a Y de Z registros" es correcta
7. **Prueba de rendimiento**: Comparar tiempos de respuesta entre MySQL y Supabase

### Comandos de prueba

```bash
# Instalar dependencias de Supabase
npm install @supabase/supabase-js

# Ejecutar en modo de prueba
cd cliente
npm start
```

## Solución de Problemas

### Error de CORS
Si experimentas problemas de CORS al conectar con Supabase, verifica:
1. Que la URL de Supabase sea correcta
2. Que tengas habilitado el acceso desde tu dominio en la configuración de Supabase

### Problemas con UUID
Si hay problemas con los UUID:
1. Asegúrate de que el frontend envía y recibe correctamente los UUID
2. Verifica que no hay código que asuma IDs numéricos

### Error de autenticación
Si hay problemas de autenticación:
1. Verifica que el token anónimo de Supabase es correcto
2. Comprueba las políticas RLS en Supabase para los docentes

### Problemas de migración de datos
Si faltan datos o aparecen incorrectamente:
1. Verifica que la migración fue completada correctamente
2. Revisa si hay diferencias de formato entre MySQL y PostgreSQL (fechas, etc.)

## Conclusión

Esta adaptación permite mantener la misma funcionalidad de paginación existente pero utilizando Supabase como backend. Las principales ventajas son:

1. **Seguridad mejorada** gracias a las políticas RLS
2. **Mejor escalabilidad** con la infraestructura de Supabase
3. **Integración con autenticación** de Supabase
4. **Reducción de código backend** al aprovechar las funcionalidades de Supabase

La migración requiere cambios tanto en el frontend como en el backend, pero el formato de respuesta y la experiencia de usuario se mantienen idénticos, minimizando el impacto para los usuarios finales.