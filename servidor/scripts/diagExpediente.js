// Script simple para diagnosticar la creación de expedientes
// Se puede ejecutar con: node scripts/diagExpediente.js

// Importaciones utilizando ES modules
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const ExpedienteModel = require('../models/Expediente');
const { pool } = require('../config/db');

// Datos de prueba para un expediente
const expedienteData = {
  numero: 'TEST-' + Date.now().toString().substring(8),
  asunto: 'Expediente de diagnóstico',
  fecha_recibido: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
  notificacion: null,
  resolucion: null,
  pase: null,
  docente_id: null,
  escuela_id: null,
  observaciones: 'Creado por script de diagnóstico',
  docentes: [],
  escuelas: []
};

async function verificarTablas() {
  try {
    console.log('\n1. VERIFICANDO ESTRUCTURA DE TABLAS:');
    const connection = await pool.getConnection();
    
    // Verificar tabla expedientes
    const [columnsExpedientes] = await connection.query('DESCRIBE expedientes');
    console.log(`\nTabla expedientes (${columnsExpedientes.length} columnas):`);
    columnsExpedientes.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    // Verificar tabla expediente_docente
    console.log('\nVerificando tabla expediente_docente:');
    const [columnsExpDoc] = await connection.query('DESCRIBE expediente_docente');
    console.log(`Tabla expediente_docente (${columnsExpDoc.length} columnas):`);
    columnsExpDoc.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    // Verificar tabla expediente_escuela
    console.log('\nVerificando tabla expediente_escuela:');
    const [columnsExpEsc] = await connection.query('DESCRIBE expediente_escuela');
    console.log(`Tabla expediente_escuela (${columnsExpEsc.length} columnas):`);
    columnsExpEsc.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Error al verificar las tablas:', error);
    return false;
  }
}

// Crear un expediente de prueba
async function crearExpediente() {
  try {
    console.log('\n2. CREANDO EXPEDIENTE DE PRUEBA');
    console.log('Datos del expediente de prueba:', expedienteData);
    
    const nuevoExpediente = await ExpedienteModel.create(expedienteData);
    
    console.log('✅ Expediente creado correctamente con ID:', nuevoExpediente.id);
    return nuevoExpediente.id;
  } catch (error) {
    console.error('❌ Error al crear expediente de prueba:', error);
    return null;
  }
}

// Verificar el expediente creado
async function verificarExpediente(id) {
  try {
    console.log(`\n3. VERIFICANDO EXPEDIENTE CREADO (ID: ${id})`);
    
    // Obtener expediente de la base de datos
    const connection = await pool.getConnection();
    
    // Consulta expediente
    const [expediente] = await connection.query('SELECT * FROM expedientes WHERE id = ?', [id]);
    
    if (expediente.length === 0) {
      console.log('❌ El expediente no existe en la base de datos');
      connection.release();
      return false;
    }
    
    console.log('✅ Expediente encontrado en base de datos:', expediente[0]);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Error al verificar el expediente:', error);
    return false;
  }
}

// Función principal
async function main() {
  try {
    console.log('=== DIAGNÓSTICO DE EXPEDIENTES ===');
    console.log(new Date().toISOString());
    
    // 1. Verificar tablas
    const tablasOK = await verificarTablas();
    
    if (!tablasOK) {
      console.log('❌ Hay problemas con las tablas. Abortando prueba.');
      return;
    }
    
    // 2. Crear expediente de prueba
    const expedienteId = await crearExpediente();
    
    if (!expedienteId) {
      console.log('❌ No se pudo crear el expediente de prueba. Abortando prueba.');
      return;
    }
    
    // 3. Verificar expediente creado
    await verificarExpediente(expedienteId);
    
    console.log('\n=== FIN DEL DIAGNÓSTICO ===');
  } catch (error) {
    console.error('Error general en diagnóstico:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar el script
main();
