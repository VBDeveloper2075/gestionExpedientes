/**
 * Script para verificar posibles conflictos de UUID antes de la migración
 * Este script analiza los datos a migrar y verifica que no existan UUIDs duplicados
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ruta al directorio de datos procesados
const DATA_DIR = path.join(__dirname, 'data');

// Función para verificar UUIDs
function validateUuids(data, tableName) {
  console.log(`\n🔄 Analizando UUIDs de la tabla ${tableName}...`);
  
  // Verificar si hay datos
  if (!data || data.length === 0) {
    console.log(`ℹ️ No hay datos para la tabla ${tableName}`);
    return true;
  }
  
  console.log(`📊 Registros a analizar: ${data.length}`);
  
  // Verificar si cada registro tiene un ID
  const missingIds = data.filter(item => !item.id);
  if (missingIds.length > 0) {
    console.error(`❌ Se encontraron ${missingIds.length} registros sin ID en ${tableName}`);
    console.log('Ejemplo de registro sin ID:', missingIds[0]);
    return false;
  }
  
  // Verificar si los IDs son UUIDs válidos
  const invalidUuids = data.filter(item => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(item.id);
  });
  
  if (invalidUuids.length > 0) {
    console.error(`❌ Se encontraron ${invalidUuids.length} UUIDs inválidos en ${tableName}`);
    console.log('Ejemplo de UUID inválido:', invalidUuids[0].id);
    return false;
  }
  
  // Verificar duplicados
  const uuidMap = new Map();
  const duplicates = [];
  
  data.forEach(item => {
    if (uuidMap.has(item.id)) {
      duplicates.push({
        uuid: item.id,
        items: [uuidMap.get(item.id), item]
      });
    } else {
      uuidMap.set(item.id, item);
    }
  });
  
  if (duplicates.length > 0) {
    console.error(`❌ Se encontraron ${duplicates.length} UUIDs duplicados en ${tableName}`);
    console.log('Ejemplo de UUID duplicado:', duplicates[0].uuid);
    console.log('Registros duplicados:', duplicates[0].items);
    return false;
  }
  
  console.log(`✅ Todos los UUIDs de ${tableName} son válidos y únicos`);
  return true;
}

// Función principal
async function main() {
  console.log('🚀 Iniciando verificación de UUIDs para migración...');
  
  // Verificar si el directorio existe
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ El directorio ${DATA_DIR} no existe`);
    console.log('Ejecuta primero generate-json-from-sql.js para convertir los datos');
    return;
  }
  
  let allValid = true;
  
  // Verificar docentes
  const docentesPath = path.join(DATA_DIR, 'docentes.json');
  if (fs.existsSync(docentesPath)) {
    try {
      const docentesData = JSON.parse(fs.readFileSync(docentesPath, 'utf8'));
      const docentesValid = validateUuids(docentesData, 'docentes');
      if (!docentesValid) allValid = false;
    } catch (error) {
      console.error('❌ Error al procesar docentes.json:', error);
      allValid = false;
    }
  } else {
    console.log('ℹ️ No se encontró el archivo docentes.json');
  }
  
  // Aquí se pueden agregar más validaciones para otras tablas
  
  console.log('\n🏁 Verificación completada');
  if (allValid) {
    console.log('✅ No se encontraron problemas de UUIDs');
  } else {
    console.error('❌ Se encontraron problemas que deben corregirse antes de la migración');
  }
}

// Ejecutar función principal
main().catch(err => {
  console.error('\n❌ Error inesperado:', err);
});