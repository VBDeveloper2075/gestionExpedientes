// Script para inicializar la base de datos
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  
  try {
    // Conectar a MySQL sin seleccionar una base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true // Permitir múltiples consultas
    });
    
    console.log('Conectado a MySQL correctamente');
    
    // Crear la base de datos si no existe
    await connection.query('CREATE DATABASE IF NOT EXISTS jp3_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('Base de datos jp3_db creada o ya existente');
    
    // Seleccionar la base de datos
    await connection.query('USE jp3_db');
    
    // Crear tablas
    console.log('Creando tablas...');
    
    // Tabla docentes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS docentes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        dni VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        telefono VARCHAR(50),
        fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla docentes creada');
    
    // Tabla escuelas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS escuelas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        direccion VARCHAR(200),
        telefono VARCHAR(50),
        email VARCHAR(100),
        fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla escuelas creada');
    
    // Tabla expedientes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expedientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero VARCHAR(50) NOT NULL,
        asunto TEXT NOT NULL,
        fecha_recibido DATE NOT NULL,
        notificacion TEXT,
        resolucion TEXT,
        pase TEXT,
        observaciones TEXT,
        estado VARCHAR(50) DEFAULT 'pendiente',
        docente_id INT,
        escuela_id INT,
        fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_inicio DATE,
        FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL,
        FOREIGN KEY (escuela_id) REFERENCES escuelas(id) ON DELETE SET NULL
      )
    `);
    console.log('Tabla expedientes creada');
    
    // Tabla disposiciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS disposiciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero VARCHAR(50) NOT NULL,
        fecha_dispo DATE NOT NULL,
        dispo TEXT NOT NULL,
        docente_id INT,
        cargo VARCHAR(100),
        motivo TEXT,
        enlace VARCHAR(255),
        fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL
      )
    `);
    console.log('Tabla disposiciones creada');
    
    // Tabla expedientes_docentes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expedientes_docentes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        expediente_id INT NOT NULL,
        docente_id INT NOT NULL,
        FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE,
        FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_expediente_docente (expediente_id, docente_id)
      )
    `);
    console.log('Tabla expedientes_docentes creada');
    
    // Tabla expedientes_escuelas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expedientes_escuelas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        expediente_id INT NOT NULL,
        escuela_id INT NOT NULL,
        FOREIGN KEY (expediente_id) REFERENCES expedientes(id) ON DELETE CASCADE,
        FOREIGN KEY (escuela_id) REFERENCES escuelas(id) ON DELETE CASCADE,
        UNIQUE KEY unique_expediente_escuela (expediente_id, escuela_id)
      )
    `);
    console.log('Tabla expedientes_escuelas creada');
    
    // Crear índices para optimizar consultas (idempotente y compatible con MySQL)
    async function ensureIndex(table, indexName, ddl) {
      const [rows] = await connection.query(
        `SELECT COUNT(1) AS cnt
         FROM information_schema.statistics
         WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
        [table, indexName]
      );
      if ((rows[0]?.cnt || 0) === 0) {
        await connection.query(ddl);
        console.log(`Índice creado: ${indexName} en ${table}`);
      } else {
        console.log(`Índice ya existe: ${indexName} en ${table}`);
      }
    }

    await ensureIndex('docentes', 'idx_docentes_dni', 'CREATE INDEX idx_docentes_dni ON docentes(dni)');
    await ensureIndex('expedientes', 'idx_expedientes_numero', 'CREATE INDEX idx_expedientes_numero ON expedientes(numero)');
    await ensureIndex('expedientes', 'idx_expedientes_estado', 'CREATE INDEX idx_expedientes_estado ON expedientes(estado)');
    await ensureIndex('disposiciones', 'idx_disposiciones_numero', 'CREATE INDEX idx_disposiciones_numero ON disposiciones(numero)');
    console.log('Índices verificados/creados');
    
    console.log('Inicialización de la base de datos completada con éxito');
    
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión a la base de datos cerrada');
    }
  }
}

// Ejecutar la función
initializeDatabase();

module.exports = { initializeDatabase };
