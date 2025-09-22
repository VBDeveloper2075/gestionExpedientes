const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

// Seed controlado de usuarios iniciales.
// Se ejecuta solo si la variable de entorno INIT_SEED_USERS === 'true'.
// No borra tablas; crea tabla users si no existe y agrega usuarios solo si está vacía.
async function seedInitialUsers() {
  console.log('🚀 Iniciando seed de usuarios iniciales...');
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla users verificada');

    const [existingUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      console.log('📝 Insertando usuarios iniciales (admin / usuario)...');
      const adminPassword = await bcrypt.hash('sadAdmin2025!', 10);
      await pool.execute(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['admin', 'vbar@abc.gob.ar', adminPassword, 'admin']
      );

      const userPassword = await bcrypt.hash('sadUser2025!', 10);
      await pool.execute(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['usuario', 'usuario@abc.gob.ar', userPassword, 'user']
      );

      console.log('✅ Usuarios iniciales creados');
    } else {
      console.log('ℹ️ Usuarios ya existen, no se realiza seed adicional');
    }
    console.log('🎯 Seed de usuarios completado');
  } catch (error) {
    console.error('❌ Error durante el seed de usuarios:', error.message);
    throw error;
  }
}

if (require.main === module) {
  seedInitialUsers()
    .then(() => {
      console.log('✅ Seed ejecutado (modo standalone)');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

module.exports = { seedInitialUsers };
