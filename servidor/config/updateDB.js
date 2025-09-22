const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de conexión
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jp3_db',
};

async function updateDatabase() {
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('Conexión a MySQL establecida con éxito');
    
    // Modificar la tabla expedientes
    await connection.query(`
      ALTER TABLE expedientes 
      MODIFY notificacion VARCHAR(255),
      MODIFY resolucion VARCHAR(255)
    `);
    console.log('Tabla "expedientes" actualizada con éxito');
    
    console.log('¡Base de datos actualizada correctamente!');
  } catch (error) {
    console.error('Error al actualizar la base de datos:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateDatabase();
