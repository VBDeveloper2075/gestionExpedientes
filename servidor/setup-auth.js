// Script simple para configurar autenticación (CommonJS)
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Cargar variables de entorno
require('dotenv').config();

// Configuración de la base de datos
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jp3_db'
};

console.log('🚀 Configurando sistema de autenticación JP3 (SIN DOCKER)\n');

async function main() {
  let connection;
  
  try {
    // Conectar a MySQL
    console.log('🔍 Conectando a MySQL...');
    console.log(`  Host: ${config.host}:${config.port}`);
    console.log(`  Database: ${config.database}`);
    console.log(`  User: ${config.user}\n`);
    
    connection = await mysql.createConnection(config);
    console.log('✅ Conectado a MySQL exitosamente\n');
    
    // Crear tabla de usuarios
    console.log('🔧 Creando tabla de usuarios...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await connection.execute(createTableSQL);
    console.log('✅ Tabla "users" creada/verificada\n');
    
    // Usuarios por defecto
    const users = [
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
    
    console.log('👥 Creando usuarios por defecto...');
    
    for (const user of users) {
      // Verificar si existe
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [user.username]
      );
      
      if (existing.length > 0) {
        console.log(`⚠️  Usuario "${user.username}" ya existe`);
        continue;
      }
      
      // Crear hash de contraseña
      const hash = await bcrypt.hash(user.password, 12);
      
      // Insertar usuario
      await connection.execute(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [user.username, user.email, hash, user.role]
      );
      
      console.log(`✅ Usuario creado: ${user.username} (${user.role})`);
    }
    
    // Mostrar resumen
    const [allUsers] = await connection.execute('SELECT username, email, role FROM users');
    
    console.log('\n🔐 USUARIOS CONFIGURADOS:');
    console.log('='.repeat(50));
    
    for (const dbUser of allUsers) {
      const defaultUser = users.find(u => u.username === dbUser.username);
      console.log(`\n👤 ${dbUser.role.toUpperCase()}: ${dbUser.username}`);
      console.log(`   Email: ${dbUser.email}`);
      if (defaultUser) {
        console.log(`   Password: ${defaultUser.password}`);
      }
    }
    
    console.log('\n📋 ROLES Y PERMISOS:');
    console.log('  🔑 ADMIN: Acceso completo (crear/editar/eliminar)');
    console.log('  👁️  USER:  Solo lectura (ver/buscar/exportar)');
    
    console.log('\n✅ ¡Configuración completada exitosamente!');
    console.log('🎯 Ahora puedes iniciar el servidor y probar la autenticación');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 SOLUCIÓN:');
      console.error('   1. Verifica que MySQL esté corriendo en tu sistema');
      console.error('   2. Puedes usar XAMPP, WAMP, o instalar MySQL directamente');
      console.error('   3. O ejecuta: mysql -u root -p');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
