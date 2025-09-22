const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jp3_db'
};

// Usuarios por defecto según el CONTEXTO_PROYECTO.md
const defaultUsers = [
  {
    username: 'admin',
    email: 'vbar@abc.gob.ar',
    password: 'sadAdmin2025!',
    role: 'admin'
  },
  {
    username: 'usuario',
    email: 'usuario@abc.gob.ar',
    password: 'sadUser2025!',
    role: 'user'
  }
];

async function createUsersTable() {
  let connection;
  try {
    console.log('🔧 Creando tabla de usuarios...');
    connection = await mysql.createConnection(dbConfig);
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    
    await connection.execute(createTableSQL);
    console.log('✅ Tabla de usuarios creada o verificada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al crear tabla de usuarios:', error.message);
    return false;
  } finally {
    if (connection) await connection.end();
  }
}

async function createDefaultUsers() {
  let connection;
  try {
    console.log('👥 Creando usuarios por defecto...');
    connection = await mysql.createConnection(dbConfig);
    
    for (const userData of defaultUsers) {
      // Verificar si el usuario ya existe
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [userData.username, userData.email]
      );
      
      if (existing.length > 0) {
        console.log(`⚠️  Usuario ${userData.username} ya existe, omitiendo...`);
        continue;
      }
      
      // Hashear contraseña
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);
      
      // Crear usuario
      const [result] = await connection.execute(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [userData.username, userData.email, passwordHash, userData.role]
      );
      
      console.log(`✅ Usuario creado: ${userData.username} (${userData.role}) - ID: ${result.insertId}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error al crear usuarios por defecto:', error.message);
    return false;
  } finally {
    if (connection) await connection.end();
  }
}

async function showUsersInfo() {
  let connection;
  try {
    console.log('\n🔐 INFORMACIÓN DE ACCESO:');
    console.log('='.repeat(50));
    
    connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    for (const user of users) {
      const defaultUser = defaultUsers.find(u => u.username === user.username);
      if (defaultUser) {
        console.log(`\n👤 ${user.role.toUpperCase()}: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: ${defaultUser.password}`);
        console.log(`   Rol: ${user.role}`);
      }
    }
    
    console.log('\n📋 PERMISOS:');
    console.log('  ADMIN: Acceso completo (crear/editar/eliminar)');
    console.log('  USER:  Solo lectura (ver/buscar/exportar)');
    
  } catch (error) {
    console.error('❌ Error al mostrar información de usuarios:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando configuración de usuarios JP3 (SIN DOCKER)...\n');
    
    // Verificar JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET no está configurado en .env');
      console.log('💡 Agrega JWT_SECRET=tu_clave_secreta_aqui_min_32_chars en .env');
      process.exit(1);
    }
    
    if (process.env.JWT_SECRET.length < 32) {
      console.error('❌ JWT_SECRET debe tener al menos 32 caracteres');
      process.exit(1);
    }
    
    // Verificar conexión a MySQL
    console.log('🔍 Verificando conexión a MySQL local...');
    console.log(`  - Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`  - Database: ${dbConfig.database}`);
    console.log(`  - User: ${dbConfig.user}`);
    
    // Crear tabla
    const tableCreated = await createUsersTable();
    if (!tableCreated) {
      console.error('\n❌ No se pudo crear la tabla. Verifica que MySQL esté corriendo.');
      process.exit(1);
    }
    
    // Crear usuarios por defecto
    const usersCreated = await createDefaultUsers();
    
    if (usersCreated) {
      await showUsersInfo();
      console.log('\n✅ Configuración de usuarios completada exitosamente!');
      console.log('🎯 Ahora puedes probar el sistema de autenticación.');
    } else {
      console.error('\n❌ Hubo errores en la configuración de usuarios');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error en configuración de usuarios:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Asegúrate de que MySQL esté corriendo localmente');
    }
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}
