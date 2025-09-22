/**
 * Ejemplo: Migrar datos de MySQL a Supabase
 * 
 * Este script muestra cómo podrías migrar datos existentes de MySQL a Supabase.
 * Necesitas instalar: mysql2, @supabase/supabase-js
 * 
 * Ejecutar: node migrate-to-supabase.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://nriwwklowzwjlzmwmyrn.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY; // Usa la API key de servicio, no la anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración MySQL
const mysqlConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jp3_db'
};

// Mapa para rastrear IDs viejos a UUIDs nuevos
const idMaps = {
  docentes: {},
  escuelas: {},
  expedientes: {},
  disposiciones: {}
};

async function migrateDocentes(connection) {
  console.log('Migrando docentes...');
  
  // Obtener todos los docentes de MySQL
  const [rows] = await connection.execute('SELECT * FROM docentes');
  
  for (const docente of rows) {
    // Insertar en Supabase y obtener el nuevo UUID
    const { data, error } = await supabase
      .from('docentes')
      .insert({
        nombre: docente.nombre,
        apellido: docente.apellido,
        dni: docente.dni,
        email: docente.email,
        telefono: docente.telefono,
        fecha_creacion: new Date(docente.fecha_creacion)
      })
      .select('id');
    
    if (error) {
      console.error('Error al insertar docente:', error);
      continue;
    }
    
    // Guardar mapeo de ID viejo a UUID nuevo
    idMaps.docentes[docente.id] = data[0].id;
  }
  
  console.log(`Migrados ${rows.length} docentes`);
}

async function migrateEscuelas(connection) {
  console.log('Migrando escuelas...');
  
  const [rows] = await connection.execute('SELECT * FROM escuelas');
  
  for (const escuela of rows) {
    const { data, error } = await supabase
      .from('escuelas')
      .insert({
        nombre: escuela.nombre,
        direccion: escuela.direccion,
        telefono: escuela.telefono,
        email: escuela.email,
        fecha_creacion: new Date(escuela.fecha_creacion)
      })
      .select('id');
    
    if (error) {
      console.error('Error al insertar escuela:', error);
      continue;
    }
    
    idMaps.escuelas[escuela.id] = data[0].id;
  }
  
  console.log(`Migradas ${rows.length} escuelas`);
}

async function migrateExpedientes(connection) {
  console.log('Migrando expedientes...');
  
  const [rows] = await connection.execute('SELECT * FROM expedientes');
  
  for (const expediente of rows) {
    // Mapear IDs relacionales
    const docenteId = expediente.docente_id ? idMaps.docentes[expediente.docente_id] : null;
    const escuelaId = expediente.escuela_id ? idMaps.escuelas[expediente.escuela_id] : null;
    
    const { data, error } = await supabase
      .from('expedientes')
      .insert({
        numero: expediente.numero,
        asunto: expediente.asunto,
        fecha_recibido: expediente.fecha_recibido,
        notificacion: expediente.notificacion,
        resolucion: expediente.resolucion,
        pase: expediente.pase,
        observaciones: expediente.observaciones,
        estado: expediente.estado,
        docente_id: docenteId,
        escuela_id: escuelaId,
        fecha_creacion: new Date(expediente.fecha_creacion),
        fecha_inicio: expediente.fecha_inicio
      })
      .select('id');
    
    if (error) {
      console.error('Error al insertar expediente:', error);
      continue;
    }
    
    idMaps.expedientes[expediente.id] = data[0].id;
  }
  
  console.log(`Migrados ${rows.length} expedientes`);
}

async function migrateRelaciones(connection) {
  console.log('Migrando relaciones expedientes-docentes...');
  
  const [docentesRows] = await connection.execute('SELECT * FROM expedientes_docentes');
  
  for (const rel of docentesRows) {
    // Mapear IDs a sus UUIDs correspondientes
    const expedienteId = idMaps.expedientes[rel.expediente_id];
    const docenteId = idMaps.docentes[rel.docente_id];
    
    if (!expedienteId || !docenteId) continue;
    
    const { error } = await supabase
      .from('expedientes_docentes')
      .insert({
        expediente_id: expedienteId,
        docente_id: docenteId
      });
    
    if (error) {
      console.error('Error al insertar relación expediente-docente:', error);
    }
  }
  
  console.log('Migrando relaciones expedientes-escuelas...');
  
  const [escuelasRows] = await connection.execute('SELECT * FROM expedientes_escuelas');
  
  for (const rel of escuelasRows) {
    const expedienteId = idMaps.expedientes[rel.expediente_id];
    const escuelaId = idMaps.escuelas[rel.escuela_id];
    
    if (!expedienteId || !escuelaId) continue;
    
    const { error } = await supabase
      .from('expedientes_escuelas')
      .insert({
        expediente_id: expedienteId,
        escuela_id: escuelaId
      });
    
    if (error) {
      console.error('Error al insertar relación expediente-escuela:', error);
    }
  }
}

async function migrateDisposiciones(connection) {
  console.log('Migrando disposiciones...');
  
  const [rows] = await connection.execute('SELECT * FROM disposiciones');
  
  for (const dispo of rows) {
    const docenteId = dispo.docente_id ? idMaps.docentes[dispo.docente_id] : null;
    
    const { data, error } = await supabase
      .from('disposiciones')
      .insert({
        numero: dispo.numero,
        fecha_dispo: dispo.fecha_dispo,
        dispo: dispo.dispo,
        docente_id: docenteId,
        cargo: dispo.cargo,
        motivo: dispo.motivo,
        enlace: dispo.enlace,
        fecha_creacion: new Date(dispo.fecha_creacion)
      })
      .select('id');
    
    if (error) {
      console.error('Error al insertar disposición:', error);
      continue;
    }
    
    idMaps.disposiciones[dispo.id] = data[0].id;
  }
  
  console.log(`Migradas ${rows.length} disposiciones`);
}

async function migrateUsers(connection) {
  console.log('Migrando usuarios...');
  
  try {
    // Asumiendo que tienes una tabla 'users' en MySQL
    const [rows] = await connection.execute('SELECT * FROM users');
    
    for (const user of rows) {
      // 1. Crear usuario en auth.users de Supabase
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'TemporaryPassword123!', // Cambiar después
        email_confirm: true
      });
      
      if (authError) {
        console.error('Error al crear usuario en auth:', authError);
        continue;
      }
      
      // 2. Insertar datos adicionales en la tabla users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id, // Referencia al id de auth.users
          username: user.username,
          email: user.email,
          role: user.role || 'user',
          created_at: new Date(user.created_at || Date.now())
        });
      
      if (userError) {
        console.error('Error al insertar datos de usuario:', userError);
      }
    }
    
    console.log(`Migrados ${rows.length} usuarios`);
  } catch (err) {
    console.error('Error en migración de usuarios:', err);
  }
}

async function main() {
  let connection;
  
  try {
    console.log('Iniciando migración a Supabase...');
    
    // Conectar a MySQL
    connection = await mysql.createConnection(mysqlConfig);
    
    // Migrar tablas en orden (para mantener integridad referencial)
    await migrateDocentes(connection);
    await migrateEscuelas(connection);
    await migrateExpedientes(connection);
    await migrateDisposiciones(connection);
    await migrateRelaciones(connection);
    await migrateUsers(connection);
    
    console.log('¡Migración completada con éxito!');
    
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    if (connection) await connection.end();
  }
}

// Ejecutar migración
main().catch(console.error);