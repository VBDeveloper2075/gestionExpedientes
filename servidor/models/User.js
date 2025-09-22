const { pool } = require('../config/db');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.role = data.role;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Crear tabla de usuarios si no existe
  static async createTable() {
    try {
      const connection = await pool.getConnection();
      
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
      connection.release();
      
      console.log('✅ Tabla de usuarios creada o verificada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error al crear tabla de usuarios:', error);
      return false;
    }
  }

  // Encontrar usuario por ID
  static async findById(id) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      connection.release();
      
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      return null;
    }
  }

  // Encontrar usuario por username
  static async findByUsername(username) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT id, username, email, role, created_at, updated_at FROM users WHERE username = ?',
        [username]
      );
      connection.release();
      
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      console.error('Error al buscar usuario por username:', error);
      return null;
    }
  }

  // Encontrar usuario por email
  static async findByEmail(email) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT id, username, email, role, created_at, updated_at FROM users WHERE email = ?',
        [email]
      );
      connection.release();
      
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      return null;
    }
  }

  // Obtener todos los usuarios
  static async findAll() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
      );
      connection.release();
      
      return rows.map(row => new User(row));
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      return [];
    }
  }

  // Verificar si existe un admin
  static async hasAdmin() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT COUNT(*) as count FROM users WHERE role = "admin"'
      );
      connection.release();
      
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error al verificar si existe admin:', error);
      return false;
    }
  }

  // Contar usuarios
  static async count() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
      connection.release();
      
      return rows[0].count;
    } catch (error) {
      console.error('Error al contar usuarios:', error);
      return 0;
    }
  }

  // Métodos de instancia
  isAdmin() {
    return this.role === 'admin';
  }

  isUser() {
    return this.role === 'user';
  }

  // Convertir a objeto plano (sin métodos)
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = User;
