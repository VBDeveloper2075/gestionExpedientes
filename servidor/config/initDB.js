const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la conexión a MySQL sin especificar una base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

async function initializeDatabase() {
  let connection;
  
  try {
    // Conectar a MySQL
    connection = await mysql.createConnection(dbConfig);
    console.log('Conexión a MySQL establecida con éxito');
    
    // Crear la base de datos si no existe
    const dbName = process.env.DB_NAME || 'jp3_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Base de datos "${dbName}" creada o ya existente`);
    
    // Usar la base de datos
    await connection.query(`USE ${dbName}`);
    
    // Crear tabla docentes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS docentes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(30) not null,
        apellido VARCHAR(30) not null,
        dni VARCHAR(20) not null,
        email VARCHAR(30) not null,
        telefono VARCHAR(15) not null,
        fecha_creacion DATETIME NOT NULL
      )
    `);
    console.log('Tabla "docentes" creada o ya existente');
    
    // Crear tabla escuelas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS escuelas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(40) NOT NULL,
        direccion VARCHAR(100),
        telefono VARCHAR(15),
        email VARCHAR(30),
        fecha_creacion DATETIME NOT NULL
      )
    `);
    console.log('Tabla "escuelas" creada o ya existente');
      // Crear tabla expedientes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expedientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero VARCHAR(4) NOT NULL,
        asunto VARCHAR(255) NOT NULL,
        fecha_recibido DATE NOT NULL,
        notificacion VARCHAR(100),
        resolucion VARCHAR(100),
        pase VARCHAR(100),
        docente_id INT,
        escuela_id INT,
        observaciones TEXT,
        fecha_creacion DATETIME NOT NULL,
        FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL,
        FOREIGN KEY (escuela_id) REFERENCES escuelas(id) ON DELETE SET NULL
      )
    `);
    console.log('Tabla "expedientes" creada o ya existente');
      // Crear tabla disposiciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS disposiciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero VARCHAR(50) NOT NULL,
        fecha_dispo DATE NOT NULL,
        dispo VARCHAR(255) NOT NULL,
        docente_id INT,
        cargo VARCHAR(100),
        motivo TEXT,
        enlace VARCHAR(255),
        fecha_creacion DATETIME NOT NULL,
        FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL
      )
    `);
    console.log('Tabla "disposiciones" creada o ya existente');
    
    console.log('¡Base de datos inicializada con éxito!');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión a MySQL cerrada');
    }
  }
}

// Ejecutar la función
initializeDatabase();
