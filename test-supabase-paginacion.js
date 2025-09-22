/**
 * Script para probar la conexión y paginación con Supabase
 * Ejecutar con Node.js después de configurar las variables de entorno
 */

require('dotenv').config({ path: './.env.supabase' });
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Verificar configuración
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY son requeridas');
  console.error('Crea un archivo .env.supabase con las credenciales de tu proyecto');
  process.exit(1);
}

// Inicializar cliente
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('🔄 Iniciando prueba de conexión a Supabase...');

// Función para probar la paginación
async function testPagination() {
  try {
    console.log('🔍 Probando función de paginación get_docentes_paginados...');
    
    // Probar varios casos
    const testCases = [
      { page: 1, limit: 10, search: '' },
      { page: 2, limit: 5, search: '' },
      { page: 1, limit: 5, search: 'a' }
    ];
    
    for (const test of testCases) {
      console.log(`\n📊 Caso: página ${test.page}, límite ${test.limit}, búsqueda "${test.search}"`);
      
      const { data, error } = await supabase.rpc(
        'get_docentes_paginados', 
        { 
          p_page: test.page, 
          p_limit: test.limit,
          p_search: test.search
        }
      );
      
      if (error) {
        console.error('❌ Error:', error.message);
        continue;
      }
      
      if (!data) {
        console.error('❓ Error: No se recibieron datos');
        continue;
      }
      
      // Mostrar resultados
      const { data: docentes, pagination } = data;
      console.log(`✅ Recibidos ${docentes?.length || 0} docentes`);
      console.log(`📄 Página ${pagination?.page || '?'} de ${pagination?.totalPages || '?'}`);
      console.log(`📚 Total de registros: ${pagination?.total || '?'}`);
      
      // Mostrar primer y último registro (si hay datos)
      if (docentes && docentes.length > 0) {
        console.log('\n📋 Primer registro:');
        console.log(`- ${docentes[0].apellido}, ${docentes[0].nombre} (ID: ${docentes[0].id})`);
        
        if (docentes.length > 1) {
          console.log('📋 Último registro:');
          console.log(`- ${docentes[docentes.length-1].apellido}, ${docentes[docentes.length-1].nombre} (ID: ${docentes[docentes.length-1].id})`);
        }
      } else {
        console.log('❗ No hay registros para mostrar');
      }
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar prueba
testPagination()
  .then(() => console.log('\n✅ Prueba completada'))
  .catch(err => console.error('❌ Error en prueba:', err))
  .finally(() => process.exit(0));