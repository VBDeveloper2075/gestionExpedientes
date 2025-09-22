const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// Cargar variables de entorno
dotenv.config();

// Mapeo de IDs
let docentesMapping = {};
let escuelasMapping = {};
let expedientesMapping = {};

// Configurar cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración MySQL
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'jp3_db',
  port: process.env.MYSQL_PORT || 3306
};

// Cargar mapeos existentes
async function loadMappings() {
  try {
    console.log('🔄 Cargando mapeos de IDs...');
    
    // Cargar mapeo de docentes si existe
    if (fs.existsSync('./docentes_id_mapping.json')) {
      docentesMapping = JSON.parse(fs.readFileSync('./docentes_id_mapping.json', 'utf8'));
      console.log(`✅ Mapeo de docentes cargado: ${Object.keys(docentesMapping).length} registros`);
    }
    
    // Cargar mapeo de escuelas si existe
    if (fs.existsSync('./escuelas_id_mapping.json')) {
      escuelasMapping = JSON.parse(fs.readFileSync('./escuelas_id_mapping.json', 'utf8'));
      console.log(`✅ Mapeo de escuelas cargado: ${Object.keys(escuelasMapping).length} registros`);
    }
    
    // Cargar mapeo de expedientes si existe
    if (fs.existsSync('./expedientes_id_mapping.json')) {
      expedientesMapping = JSON.parse(fs.readFileSync('./expedientes_id_mapping.json', 'utf8'));
      console.log(`✅ Mapeo de expedientes cargado: ${Object.keys(expedientesMapping).length} registros`);
    }
  } catch (error) {
    console.error('❌ Error al cargar los mapeos:', error);
  }
}

// Migrar docentes
async function migrateDocentes() {
  console.log('\n🚀 Iniciando migración de docentes a Supabase...');
  
  try {
    // Solo migrar si tenemos el mapeo
    if (Object.keys(docentesMapping).length === 0) {
      console.log('❗ No hay mapeo de docentes disponible, omitiendo migración');
      return;
    }
    
    // Conectar a MySQL
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conexión a MySQL establecida');
    
    // Obtener docentes de MySQL
    const [rows] = await connection.execute('SELECT * FROM docentes');
    console.log(`📊 Encontrados ${rows.length} docentes en MySQL`);
    
    // Preparar datos para Supabase
    const docentes = rows.map(row => {
      const uuid = docentesMapping[row.id] || uuidv4();
      
      return {
        id: uuid,
        nombre: row.nombre || '',
        apellido: row.apellido || '',
        documento: row.documento ? row.documento.toString() : '',
        telefono: row.telefono || '',
        email: row.email || '',
        domicilio: row.domicilio || '',
        fecha_nacimiento: row.fecha_nacimiento ? new Date(row.fecha_nacimiento).toISOString() : null,
        fecha_creacion: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    // Migrar en lotes
    const batchSize = 50;
    let processed = 0;
    
    for (let i = 0; i < docentes.length; i += batchSize) {
      const batch = docentes.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('docentes')
        .upsert(batch, { onConflict: 'id' })
        .select();
      
      if (error) {
        console.error(`❌ Error al insertar lote de docentes: ${error.message}`);
        continue;
      }
      
      processed += batch.length;
      console.log(`✅ Lote de docentes procesado: ${i + 1}-${Math.min(i + batchSize, docentes.length)} de ${docentes.length}`);
    }
    
    await connection.end();
    console.log(`✅ Migración de docentes completada: ${processed} de ${docentes.length} registros`);
    
  } catch (error) {
    console.error('❌ Error durante la migración de docentes:', error);
  }
}

// Migrar escuelas
async function migrateEscuelas() {
  console.log('\n🚀 Iniciando migración de escuelas a Supabase...');
  
  try {
    // Solo migrar si tenemos el mapeo
    if (Object.keys(escuelasMapping).length === 0) {
      console.log('❗ No hay mapeo de escuelas disponible, omitiendo migración');
      return;
    }
    
    // Conectar a MySQL
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conexión a MySQL establecida');
    
    // Obtener escuelas de MySQL
    const [rows] = await connection.execute('SELECT * FROM escuelas');
    console.log(`📊 Encontradas ${rows.length} escuelas en MySQL`);
    
    // Preparar datos para Supabase
    const escuelas = rows.map(row => {
      const uuid = escuelasMapping[row.id] || uuidv4();
      
      return {
        id: uuid,
        nombre: row.nombre || '',
        numero: row.numero ? row.numero.toString() : '',
        direccion: row.direccion || '',
        localidad: row.localidad || '',
        telefono: row.telefono || '',
        email: row.email || '',
        nivel: row.nivel || '',
        fecha_creacion: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    // Migrar en lotes
    const batchSize = 50;
    let processed = 0;
    
    for (let i = 0; i < escuelas.length; i += batchSize) {
      const batch = escuelas.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('escuelas')
        .upsert(batch, { onConflict: 'id' })
        .select();
      
      if (error) {
        console.error(`❌ Error al insertar lote de escuelas: ${error.message}`);
        continue;
      }
      
      processed += batch.length;
      console.log(`✅ Lote de escuelas procesado: ${i + 1}-${Math.min(i + batchSize, escuelas.length)} de ${escuelas.length}`);
    }
    
    await connection.end();
    console.log(`✅ Migración de escuelas completada: ${processed} de ${escuelas.length} registros`);
    
  } catch (error) {
    console.error('❌ Error durante la migración de escuelas:', error);
  }
}

// Migrar expedientes
async function migrateExpedientes() {
  console.log('\n🚀 Iniciando migración de expedientes a Supabase...');
  
  try {
    // Solo migrar si tenemos el mapeo
    if (Object.keys(expedientesMapping).length === 0) {
      console.log('❗ No hay mapeo de expedientes disponible, omitiendo migración');
      return;
    }
    
    // Conectar a MySQL
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conexión a MySQL establecida');
    
    // Obtener expedientes de MySQL
    const [rows] = await connection.execute('SELECT * FROM expedientes');
    console.log(`📊 Encontrados ${rows.length} expedientes en MySQL`);
    
    // Preparar datos para Supabase
    const expedientes = rows.map(row => {
      const uuid = expedientesMapping[row.id] || uuidv4();
      
      return {
        id: uuid,
        numero: row.numero || '',
        anio: row.anio ? row.anio.toString() : '',
        caratula: row.caratula || '',
        iniciador: row.iniciador || '',
        fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toISOString() : null,
        estado: row.estado || 'En trámite',
        ubicacion: row.ubicacion || '',
        docente_id: row.docente_id ? docentesMapping[row.docente_id] : null,
        escuela_id: row.escuela_id ? escuelasMapping[row.escuela_id] : null,
        observaciones: row.observaciones || '',
        fecha_creacion: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    // Migrar en lotes
    const batchSize = 20;
    let processed = 0;
    
    for (let i = 0; i < expedientes.length; i += batchSize) {
      const batch = expedientes.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('expedientes')
        .upsert(batch, { onConflict: 'id' })
        .select();
      
      if (error) {
        console.error(`❌ Error al insertar lote de expedientes: ${error.message}`);
        continue;
      }
      
      processed += batch.length;
      console.log(`✅ Lote de expedientes procesado: ${i + 1}-${Math.min(i + batchSize, expedientes.length)} de ${expedientes.length}`);
    }
    
    await connection.end();
    console.log(`✅ Migración de expedientes completada: ${processed} de ${expedientes.length} registros`);
    
  } catch (error) {
    console.error('❌ Error durante la migración de expedientes:', error);
  }
}

// Migrar disposiciones desde el archivo SQL
async function migrateDisposiciones() {
  console.log('\n🚀 Iniciando migración de disposiciones a Supabase...');
  
  try {
    // Leer el archivo SQL
    if (!fs.existsSync('./supabase_disposiciones_fixed.sql')) {
      console.error('❌ El archivo supabase_disposiciones_fixed.sql no existe');
      return;
    }
    
    const sqlContent = fs.readFileSync('./supabase_disposiciones_fixed.sql', 'utf8');
    
    // Extraer los VALUES de las sentencias INSERT
    const insertRegex = /INSERT INTO disposiciones.*VALUES\s+([\s\S]+?);/i;
    const match = sqlContent.match(insertRegex);
    
    if (!match || !match[1]) {
      throw new Error('No se encontraron datos de inserción en el archivo SQL');
    }
    
    // Obtener todas las filas de datos
    const valuesText = match[1];
    const rowRegex = /\(([^()]+)\)/g;
    let rowMatch;
    const rows = [];
    
    while ((rowMatch = rowRegex.exec(valuesText)) !== null) {
      const rowData = rowMatch[1].split(',').map(item => {
        item = item.trim();
        // Convertir 'NULL' a null real en JavaScript
        if (item === 'NULL') return null;
        // Eliminar comillas simples de strings
        if (item.startsWith("'") && item.endsWith("'")) {
          return item.substring(1, item.length - 1);
        }
        return item;
      });
      
      // Crear objeto con los valores para insertar en Supabase
      const disposicion = {
        id: rowData[0],
        numero: rowData[1],
        fecha_dispo: rowData[2] !== null ? rowData[2] : null,
        dispo: rowData[3],
        docente_id: rowData[4],
        cargo: rowData[5],
        motivo: rowData[6],
        enlace: rowData[7],
        fecha_creacion: rowData[8],
        updated_at: rowData[9],
        escuela_id: rowData[10]
      };
      
      rows.push(disposicion);
    }
    
    console.log(`📊 Se encontraron ${rows.length} disposiciones para cargar`);
    
    // Procesar en lotes para evitar problemas con límites de API
    const batchSize = 50;
    let processed = 0;
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('disposiciones')
        .upsert(batch, { onConflict: 'id' })
        .select();
      
      if (error) {
        console.error(`❌ Error al insertar lote de disposiciones: ${error.message}`);
        continue;
      }
      
      processed += batch.length;
      console.log(`✅ Lote de disposiciones procesado: ${i + 1}-${Math.min(i + batchSize, rows.length)} de ${rows.length}`);
    }
    
    console.log(`✅ Migración de disposiciones completada: ${processed} de ${rows.length} disposiciones cargadas en Supabase`);
    
  } catch (error) {
    console.error('❌ Error durante la migración de disposiciones:', error);
  }
}

// Función principal para ejecutar toda la migración
async function migrateAllToSupabase() {
  console.log('🌟 Iniciando migración completa a Supabase...');
  
  try {
    // Cargar mapeos
    await loadMappings();
    
    // Migrar datos en orden correcto para respetar referencias
    await migrateDocentes();
    await migrateEscuelas();
    await migrateExpedientes();
    await migrateDisposiciones();
    
    console.log('\n✅✅✅ Migración completa finalizada exitosamente ✅✅✅');
    
  } catch (error) {
    console.error('❌ Error durante la migración completa:', error);
  }
}

// Ejecutar la migración completa
migrateAllToSupabase();