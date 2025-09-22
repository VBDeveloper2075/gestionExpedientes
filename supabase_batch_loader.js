/**
 * Script para cargar datos en Supabase por lotes
 * Esto evita problemas con scripts SQL grandes y permite un mejor manejo de errores
 */

require('dotenv').config({ path: './.env.supabase' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // ¡IMPORTANTE! Usar service_key para operaciones administrativas

// Verificar configuración
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridas');
  console.error('Crea un archivo .env.supabase con las credenciales de tu proyecto');
  process.exit(1);
}

// Inicializar cliente con clave de servicio (tiene permisos completos)
const supabase = createClient(supabaseUrl, supabaseKey);

// Archivo de datos de origen (ya convertido a formato JSON para facilitar el procesamiento)
const BATCH_SIZE = 50; // Número de registros a insertar en cada lote

// Función para cargar docentes por lotes
async function loadDocentes() {
  try {
    console.log('🔄 Cargando datos de docentes desde el archivo data/docentes.json...');
    
    // Cargar datos de docentes (este archivo se puede generar a partir del SQL)
    const docentesPath = path.join(__dirname, 'data', 'docentes.json');
    
    // Verificar si el archivo existe
    if (!fs.existsSync(docentesPath)) {
      console.error(`❌ Error: El archivo ${docentesPath} no existe`);
      console.error('Ejecuta primero el script generate-json-from-sql.js para convertir los datos SQL a JSON');
      return false;
    }
    
    const docentesData = JSON.parse(fs.readFileSync(docentesPath, 'utf8'));
    console.log(`📊 Cargados ${docentesData.length} registros de docentes`);
    
    // Procesar por lotes
    const totalBatches = Math.ceil(docentesData.length / BATCH_SIZE);
    console.log(`🔢 Procesando en ${totalBatches} lotes de ${BATCH_SIZE} registros`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, docentesData.length);
      const batch = docentesData.slice(start, end);
      
      console.log(`\n📦 Procesando lote ${i+1}/${totalBatches} (${start+1}-${end} de ${docentesData.length})`);
      
      try {
        // Insertar lote en Supabase
        const { data, error } = await supabase
          .from('docentes')
          .insert(batch);
        
        if (error) {
          console.error(`❌ Error en lote ${i+1}:`, error);
          errorCount++;
        } else {
          console.log(`✅ Lote ${i+1} insertado correctamente`);
          successCount += batch.length;
        }
      } catch (err) {
        console.error(`❌ Error crítico en lote ${i+1}:`, err);
        errorCount++;
      }
      
      // Breve pausa para no sobrecargar la API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n📈 Resumen de carga de docentes:`);
    console.log(`✅ Registros insertados: ${successCount} de ${docentesData.length}`);
    console.log(`❌ Lotes con errores: ${errorCount} de ${totalBatches}`);
    
    return errorCount === 0;
  } catch (error) {
    console.error('❌ Error al cargar docentes:', error);
    return false;
  }
}

// Función para convertir SQL a JSON (será implementada en otro archivo)
function generateJSONFromSQL() {
  console.log('⚠️ Esta función debe implementarse separadamente');
  console.log('Ejecuta el script generate-json-from-sql.js para convertir el SQL a JSON');
}

// Función principal
async function main() {
  console.log('🚀 Iniciando carga de datos a Supabase...');
  
  // Crear directorio data si no existe
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Creado directorio data/');
  }
  
  // Cargar docentes
  const docentesSuccess = await loadDocentes();
  
  if (docentesSuccess) {
    console.log('\n✅ Carga de docentes completada exitosamente');
  } else {
    console.error('\n⚠️ Carga de docentes completada con errores');
  }
  
  // Aquí se pueden agregar más funciones para cargar otras tablas
  // siguiendo la misma estructura
}

// Ejecutar función principal
main()
  .then(() => console.log('\n✅ Proceso completado'))
  .catch(err => console.error('\n❌ Error en proceso principal:', err));