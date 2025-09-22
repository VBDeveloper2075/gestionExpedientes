/**
 * Actualiza/crea las contraseñas de usuarios de prueba con bcrypt
 * Usuarios objetivo:
 *  - admin   / JP3Admin2025!
 *  - usuario / JP3User2025!
 * 
 * Ejecutar con:
 *   npm run seed  (desde carpeta servidor)
 */

// Cargar .env: preferir el de backend (../.env) y si no existe, usar el de la raíz (../../.env)
const fs = require('fs');
const path = require('path');
const backendEnv = path.resolve(__dirname, '../.env');
const rootEnv = path.resolve(__dirname, '../../.env');
const dotenvPath = fs.existsSync(backendEnv) ? backendEnv : rootEnv;
require('dotenv').config({ path: dotenvPath });

// Mostrar diagnóstico de carga de .env y conexión (sin exponer contraseñas)
console.log('🔍 Diagnóstico de carga de variables:');
console.log(`- Archivo .env usado: ${dotenvPath}${fs.existsSync(dotenvPath) ? '' : ' (no encontrado)'}`);
console.log(`- DB_HOST: ${process.env.DB_HOST || '(no definido)'}`);
console.log(`- DB_PORT: ${process.env.DB_PORT || '(no definido)'}`);
console.log(`- DB_NAME: ${process.env.DB_NAME || '(no definido)'}`);
console.log(`- DB_USER: ${process.env.DB_USER || '(no definido)'}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log('');

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const TARGET_USERS = [
	{ username: 'admin',   password: 'JP3Admin2025!', role: 'admin',  email: 'admin@jp3verito.local' },
	{ username: 'usuario', password: 'JP3User2025!',  role: 'user',   email: 'usuario@jp3verito.local' }
];

async function ensureUsersTable() {
	await pool.execute(`
		CREATE TABLE IF NOT EXISTS users (
			id INT AUTO_INCREMENT PRIMARY KEY,
			username VARCHAR(50) UNIQUE NOT NULL,
			email VARCHAR(100) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			role ENUM('admin','user') DEFAULT 'user',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
	`);
}

async function upsertUser({ username, password, role, email }) {
	const hash = await bcrypt.hash(password, 12);
	const [rows] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
	if (rows.length > 0) {
		await pool.execute('UPDATE users SET password_hash = ?, role = ? WHERE username = ?', [hash, role, username]);
		return { username, action: 'updated' };
	}
	// Si no existe, insertar
	await pool.execute(
		'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
		[username, email, hash, role]
	);
	return { username, action: 'created' };
}

async function main() {
	console.log('🔐 Actualizando contraseñas de usuarios de prueba...');
	try {
		await ensureUsersTable();
		const results = [];
		for (const u of TARGET_USERS) {
			const res = await upsertUser(u);
			results.push(res);
			console.log(`✅ Usuario ${u.username}: ${res.action}`);
		}
		console.log('\n📝 Credenciales esperadas:');
		for (const u of TARGET_USERS) {
			console.log(` - ${u.username} / ${u.password}`);
		}
		console.log('\n🎉 Listo.');
		process.exitCode = 0;
	} catch (err) {
		console.error('❌ Error actualizando contraseñas:', err.message);
		process.exitCode = 1;
	} finally {
		try { await pool.end(); } catch (_) {}
	}
}

if (require.main === module) {
	main();
}
