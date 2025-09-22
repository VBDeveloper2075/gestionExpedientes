const mysql = require('mysql2/promise');
require('dotenv').config();

// Función para parsear DATABASE_URL de Railway
function parseDbUrl(databaseUrl) {
  if (!databaseUrl) return null;
  
  try {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1) // remover el '/' inicial
    };
  } catch (error) {
    console.error('❌ Error parseando DATABASE_URL:', error);
    return null;
  }
}

// Configuración de conexión (Railway o local)
let dbConfig;

if (process.env.DATABASE_URL) {
  // Configuración para Railway
  console.log('🚀 Usando configuración de Railway (DATABASE_URL)');
  dbConfig = parseDbUrl(process.env.DATABASE_URL);
  if (!dbConfig) {
    throw new Error('DATABASE_URL inválida');
  }
} else {
  // Configuración local
  console.log('🔧 Usando configuración local (.env/variables de entorno)');
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  // Validar variables obligatorias sin valores por defecto
  const missing = [];
  if (!DB_HOST) missing.push('DB_HOST');
  if (!DB_USER) missing.push('DB_USER');
  if (!DB_NAME) missing.push('DB_NAME');
  if (missing.length) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${missing.join(', ')}. ` +
      'Defínelas en tu .env o pasa variables al contenedor Docker (--env/--env-file).'
    );
  }

  dbConfig = {
    host: DB_HOST,
    port: DB_PORT ? parseInt(DB_PORT, 10) : 3306,
    user: DB_USER,
    password: DB_PASSWORD ?? '',
    database: DB_NAME
  };
}

console.log('🔧 Configuración de base de datos:');
console.log('  - Host:', dbConfig.host);
console.log('  - Puerto:', dbConfig.port);
console.log('  - Base de datos:', dbConfig.database);
console.log('  - Usuario:', dbConfig.user);

// Crear pool de conexiones (configuración robusta y compatible)
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper para esperar N milisegundos
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Función para probar la conexión con reintentos
// Por defecto hará hasta 5 intentos con backoff exponencial ligero
async function testConnection(options = {}) {
  const {
    retries = 5,
    initialDelayMs = 2000,
    backoff = 1.5,
  } = options;

  let attempt = 0;
  let delayMs = initialDelayMs;

  while (attempt < retries) {
    attempt += 1;
    const attemptLabel = `#${attempt}/${retries}`;
    try {
      console.log(`🔍 Probando conexión a la base de datos (intento ${attemptLabel})...`);
      const connection = await pool.getConnection();
      console.log('✅ Conexión a la base de datos establecida con éxito');

      // Probar una consulta simple
      const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp');
      console.log('✅ Consulta de prueba exitosa:', rows[0]);

      connection.release();
      return true;
    } catch (error) {
      console.error(`❌ Error al conectar con la base de datos (intento ${attemptLabel}):`);
      console.error('📋 Detalles del error:');
      console.error(`  - Código: ${error.code}`);
      console.error(`  - Mensaje: ${error.message}`);

      if (attempt >= retries) {
        console.error('⛔ Se alcanzó el máximo de reintentos. Abortando verificación de conexión.');
        // Sugerencias basadas en el tipo de error
        if (error.code === 'ECONNREFUSED') {
          console.error('💡 Sugerencia: Verifica que MySQL esté corriendo y accesible desde el contenedor');
          console.error('💡 En Docker Desktop (Windows), usa DB_HOST=host.docker.internal para acceder al MySQL del host');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
          console.error('💡 Sugerencia: Verifica las credenciales de la base de datos (usuario/contraseña)');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
          console.error('💡 Sugerencia: La base de datos no existe o no está accesible');
        }
        return false;
      }

      // Esperar con backoff antes de reintentar
      console.log(`⏳ Esperando ${Math.round(delayMs / 1000)}s antes de reintentar...`);
      await delay(delayMs);
      delayMs = Math.round(delayMs * backoff);
    }
  }

  // No debería alcanzarse
  return false;
}

// Función para obtener información de la base de datos
async function getDatabaseInfo() {
  try {
    const connection = await pool.getConnection();
    
    // Obtener lista de tablas
    const [tables] = await connection.execute('SHOW TABLES');
    
    // Obtener información de cada tabla
    const tableInfo = {};
    for (const table of tables) {
      const tableName = table[`Tables_in_${process.env.DB_NAME || 'jp3_db'}`];
      const [counts] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      tableInfo[tableName] = counts[0].count;
    }
    
    connection.release();
    
    return {
      database: process.env.DB_NAME || 'jp3_db',
      tables: tableInfo,
      totalTables: tables.length
    };
  } catch (error) {
    console.error('❌ Error al obtener información de la base de datos:', error);
    return null;
  }
}

// Función para cerrar el pool de conexiones
async function closePool() {
  try {
    await pool.end();
    console.log('✅ Pool de conexiones cerrado');
  } catch (error) {
    console.error('❌ Error al cerrar pool de conexiones:', error);
  }
}

module.exports = {
  pool,
  testConnection,
  getDatabaseInfo,
  closePool
};
