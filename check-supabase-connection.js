/**
 * Script para verificar la conexión a Supabase
 * Este script prueba la conexión y los permisos básicos para asegurar
 * que las credenciales están configuradas correctamente
 */

require('dotenv').config({ path: './.env.supabase' });
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Función para mostrar información formateada
function showInfo(label, value) {
  const valueStr = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
  console.log(`${label}: ${valueStr}`);
}

async function main() {
  console.log('🔍 Verificando configuración de Supabase...\n');
  
  // Verificar variables de entorno
  if (!supabaseUrl) {
    console.error('❌ Error: Variable SUPABASE_URL no encontrada en .env.supabase');
    console.error('Asegúrate de crear el archivo .env.supabase basado en .env.supabase.example');
    return;
  }
  
  if (!supabaseKey) {
    console.error('❌ Error: Variable SUPABASE_SERVICE_KEY no encontrada en .env.supabase');
    console.error('Asegúrate de usar la clave service_role (NO la anon/public)');
    return;
  }
  
  console.log('✅ Variables de entorno encontradas');
  
  // Inicializar cliente Supabase
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente Supabase inicializado');
    
    // Probar una consulta básica para verificar conexión
    console.log('\n🔄 Probando conexión a Supabase...');
    const { data: version, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      console.error('❌ Error al consultar versión:', versionError);
    } else {
      console.log('✅ Conexión exitosa');
      showInfo('Versión PostgreSQL', version);
    }
    
    // Verificar permisos verificando tablas
    console.log('\n🔄 Verificando acceso a tablas...');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public')
      .order('tablename');
    
    if (tablesError) {
      console.error('❌ Error al consultar tablas:', tablesError);
      console.error('Verifica que estés usando la clave service_role (NO la anon/public)');
    } else {
      console.log('✅ Acceso a tablas confirmado');
      console.log('\n📋 Tablas disponibles:');
      tables.forEach(t => {
        console.log(`   - ${t.tablename}`);
      });
    }
    
    // Probar específicamente la tabla docentes
    console.log('\n🔄 Verificando tabla docentes...');
    const { data: docentesCount, error: docentesError } = await supabase
      .from('docentes')
      .select('*', { count: 'exact', head: true });
    
    if (docentesError) {
      if (docentesError.code === '42P01') { // Tabla no existe
        console.error('❌ La tabla "docentes" no existe en la base de datos');
        console.error('Asegúrate de haber ejecutado primero el script de creación de schema');
      } else {
        console.error('❌ Error al consultar tabla docentes:', docentesError);
      }
    } else {
      console.log(`✅ Tabla docentes accesible, contiene ${docentesCount.count || 0} registros`);
    }
    
    // Verificar función de paginación
    console.log('\n🔄 Verificando función de paginación...');
    const { data: paginationResult, error: paginationError } = await supabase
      .rpc('paginar_docentes', { 
        p_limit: 10, 
        p_offset: 0, 
        p_campo_orden: 'apellido',
        p_direccion: 'asc',
        p_filtro: ''
      });
    
    if (paginationError) {
      if (paginationError.message && paginationError.message.includes('does not exist')) {
        console.error('❌ La función "paginar_docentes" no existe en la base de datos');
        console.error('Asegúrate de haber ejecutado el script de creación de la función de paginación');
      } else {
        console.error('❌ Error al ejecutar función de paginación:', paginationError);
      }
    } else {
      console.log('✅ Función de paginación disponible y funcional');
      console.log(`   Registros devueltos: ${paginationResult.data?.length || 0}`);
      console.log(`   Total de registros: ${paginationResult.total || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Error al inicializar cliente Supabase:', error);
    console.error('Verifica la URL y la clave en el archivo .env.supabase');
  }
  
  console.log('\n🏁 Verificación completada');
}

// Ejecutar función principal
main().catch(err => {
  console.error('\n❌ Error inesperado:', err);
});