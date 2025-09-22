const { pool } = require('../config/db');

// Operaciones CRUD para expedientes
const ExpedienteModel = {  // Obtener todos los expedientes
  getAll: async () => {
    try {
      // Obtener todos los expedientes básicos
      const [expedientes] = await pool.query(`
        SELECT e.* 
        FROM expedientes e
        ORDER BY e.fecha_recibido DESC
      `);

      console.log(`Se encontraron ${expedientes.length} expedientes en la base de datos.`);
      
      // Si no hay expedientes, devolver un array vacío
      if (!expedientes.length) {
        return [];
      }

      // Para cada expediente, obtener sus docentes y escuelas asociadas
      for (let expediente of expedientes) {
        try {
          // Obtener docentes asociados usando LEFT JOIN para incluir expedientes sin docentes
          const [docentes] = await pool.query(`
            SELECT d.*, ed.id as relacion_id 
            FROM docentes d
            JOIN expedientes_docentes ed ON d.id = ed.docente_id
            WHERE ed.expediente_id = ?
          `, [expediente.id]);
          
          // Obtener escuelas asociadas usando LEFT JOIN para incluir expedientes sin escuelas
          const [escuelas] = await pool.query(`
            SELECT e.*, ee.id as relacion_id 
            FROM escuelas e
            JOIN expedientes_escuelas ee ON e.id = ee.escuela_id
            WHERE ee.expediente_id = ?
          `, [expediente.id]);
          
          // Agregar los arrays de docentes y escuelas al objeto de expediente
          expediente.docentes = docentes || [];
          expediente.escuelas = escuelas || [];
          
          console.log(`Expediente ${expediente.id} - ${expediente.numero} tiene ${docentes.length} docentes y ${escuelas.length} escuelas asociados.`);
        } catch (error) {
          console.error(`Error al obtener relaciones del expediente ${expediente.id}:`, error);
          // Si hay error al obtener las relaciones, asignar arrays vacíos
          expediente.docentes = [];
          expediente.escuelas = [];
        }
      }
      
      return expedientes;
    } catch (error) {
      console.error('Error al obtener todos los expedientes:', error);
      throw error;
    }
  },
  // Obtener un expediente por su ID
  getById: async (id) => {
    try {
      console.log(`Obteniendo expediente con ID: ${id}`);
      // Obtener información básica del expediente
      const [expedientes] = await pool.query(`
        SELECT e.*
        FROM expedientes e
        WHERE e.id = ?
      `, [id]);
      
      if (!expedientes.length) {
        console.log(`No se encontró expediente con ID: ${id}`);
        return null;
      }
      
      const expediente = expedientes[0];
      console.log(`Expediente básico obtenido: ${expediente.numero}`);
      
      // Verificar los nombres de las tablas primero
      const [tablas] = await pool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND (table_name LIKE 'expediente%docente%' OR table_name LIKE 'expedientes%docente%')"
      );
      
      const tablaDocentes = tablas.length > 0 
        ? tablas[0].table_name 
        : 'expedientes_docentes'; // nombre por defecto
      
      const [tablasEscuelas] = await pool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND (table_name LIKE 'expediente%escuela%' OR table_name LIKE 'expedientes%escuela%')"
      );
      
      const tablaEscuelas = tablasEscuelas.length > 0 
        ? tablasEscuelas[0].table_name 
        : 'expedientes_escuelas'; // nombre por defecto
      
      console.log(`Usando tablas de relación: ${tablaDocentes} y ${tablaEscuelas}`);
      
      // Obtener docentes asociados
      try {
        const [docentes] = await pool.query(`
          SELECT d.*, ed.id as relacion_id 
          FROM docentes d
          JOIN ${tablaDocentes} ed ON d.id = ed.docente_id
          WHERE ed.expediente_id = ?
        `, [id]);
        
        expediente.docentes = docentes;
        console.log(`Se encontraron ${docentes.length} docentes asociados`);
      } catch (errorDocentes) {
        console.error(`Error al obtener docentes asociados:`, errorDocentes);
        expediente.docentes = [];
      }
      
      // Obtener escuelas asociadas
      try {
        const [escuelas] = await pool.query(`
          SELECT e.*, ee.id as relacion_id 
          FROM escuelas e
          JOIN ${tablaEscuelas} ee ON e.id = ee.escuela_id
          WHERE ee.expediente_id = ?
        `, [id]);
        
        expediente.escuelas = escuelas;
        console.log(`Se encontraron ${escuelas.length} escuelas asociadas`);
      } catch (errorEscuelas) {
        console.error(`Error al obtener escuelas asociadas:`, errorEscuelas);
        expediente.escuelas = [];
      }
      
      // Agregar los arrays de docentes y escuelas al objeto de expediente
      expediente.docentes = docentes;
      expediente.escuelas = escuelas;
      
      return expediente;
    } catch (error) {
      console.error(`Error al obtener expediente con ID ${id}:`, error);
      throw error;
    }
  },
  // Crear un nuevo expediente  create: async (expediente) => {
    let connection;
    try {
      console.log('Creando expediente con datos:', JSON.stringify(expediente, null, 2));
      
      const { 
        numero, 
        asunto, 
        fecha_recibido, 
        notificacion, 
        resolucion, 
        pase, 
        observaciones, 
        docente_id, // Mantenemos por compatibilidad
        escuela_id, // Mantenemos por compatibilidad
        docentes,   // Nuevo: array de IDs de docentes
        escuelas    // Nuevo: array de IDs de escuelas
      } = expediente;
      
      // Verificar y validar docentes y escuelas
      console.log('Docentes recibidos:', docentes);
      console.log('Escuelas recibidas:', escuelas);
      
      const fecha_creacion = new Date();
      
      // Asegurar que fecha_recibido sea una fecha válida
      let fechaDb = fecha_recibido;
      if (typeof fecha_recibido === 'string') {
        // Si es una cadena, asegurarse de que tenga el formato correcto
        fechaDb = fecha_recibido.split('T')[0]; // Eliminar la parte de hora si existe
      }
      
      connection = await pool.getConnection();
      await connection.beginTransaction();
      
      // Campos que sabemos que existen en la tabla
      const fields = ['numero', 'asunto', 'fecha_recibido', 'notificacion', 'resolucion', 'pase', 'observaciones', 'fecha_creacion'];
      const values = [numero, asunto, fechaDb, notificacion, resolucion, pase, observaciones, fecha_creacion];
      
      // Mantenemos docente_id y escuela_id por compatibilidad
      if (docente_id) {
        fields.push('docente_id');
        values.push(docente_id);
      }
      
      if (escuela_id) {
        fields.push('escuela_id');
        values.push(escuela_id);
      }
      
      // Campo estado (si existe en la tabla)
      const [columns] = await connection.query('DESCRIBE expedientes');
      const hasEstado = columns.some(col => col.Field === 'estado');
      
      if (hasEstado) {
        fields.push('estado');
        values.push('pendiente'); // Valor por defecto
      }
      
      const placeholders = values.map(() => '?').join(', ');
      const query = `INSERT INTO expedientes (${fields.join(', ')}) VALUES (${placeholders})`;
      
      console.log(`Ejecutando consulta: ${query}`);
      const [result] = await connection.query(query, values);
      const expedienteId = result.insertId;
      
      // Asociar docentes al expediente
      if (docentes && Array.isArray(docentes) && docentes.length > 0) {
        await ExpedienteModel.asociarDocentes(expedienteId, docentes, connection);
      } else if (docente_id) {
        // Usar docente_id para crear una relación en la nueva tabla
        await ExpedienteModel.asociarDocentes(expedienteId, [docente_id], connection);
      }
      
      // Asociar escuelas al expediente
      if (escuelas && Array.isArray(escuelas) && escuelas.length > 0) {
        await ExpedienteModel.asociarEscuelas(expedienteId, escuelas, connection);
      } else if (escuela_id) {
        // Usar escuela_id para crear una relación en la nueva tabla
        await ExpedienteModel.asociarEscuelas(expedienteId, [escuela_id], connection);
      }
      
      await connection.commit();
      console.log('Expediente creado exitosamente con ID:', expedienteId);
      
      // Obtener el expediente completo con sus relaciones
      const nuevoExpediente = await ExpedienteModel.getById(expedienteId);
      return nuevoExpediente;
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error al crear expediente:', error);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },

  // Actualizar un expediente
  update: async (id, expediente) => {
    let connection;
    try {
      console.log('Actualizando expediente con datos:', JSON.stringify(expediente, null, 2));
      
      const { 
        numero, 
        asunto, 
        fecha_recibido, 
        notificacion, 
        resolucion, 
        pase, 
        observaciones, 
        docente_id, // Mantenemos por compatibilidad
        escuela_id, // Mantenemos por compatibilidad
        docentes,   // Nuevo: array de IDs de docentes
        escuelas    // Nuevo: array de IDs de escuelas
      } = expediente;
      
      // Asegurar que fecha_recibido sea una fecha válida
      let fechaDb = fecha_recibido;
      if (typeof fecha_recibido === 'string') {
        // Si es una cadena, asegurarse de que tenga el formato correcto
        fechaDb = fecha_recibido.split('T')[0]; // Eliminar la parte de hora si existe
      }
      
      connection = await pool.getConnection();
      await connection.beginTransaction();
      
      // Actualizar datos básicos del expediente
      await connection.query(
        `UPDATE expedientes SET 
         numero = ?, 
         asunto = ?, 
         fecha_recibido = ?, 
         notificacion = ?, 
         resolucion = ?, 
         pase = ?, 
         observaciones = ?
         WHERE id = ?`,
        [numero, asunto, fechaDb, notificacion || null, resolucion || null, 
         pase || null, observaciones || null, id]
      );
      
      // Actualizar campos de compatibilidad si están presentes
      if (docente_id !== undefined) {
        await connection.query(
          'UPDATE expedientes SET docente_id = ? WHERE id = ?',
          [docente_id || null, id]
        );
      }
      
      if (escuela_id !== undefined) {
        await connection.query(
          'UPDATE expedientes SET escuela_id = ? WHERE id = ?',
          [escuela_id || null, id]
        );
      }
      
      // Actualizar relaciones con docentes
      if (docentes && Array.isArray(docentes)) {
        // Eliminar relaciones actuales y agregar las nuevas
        await connection.query(
          'DELETE FROM expedientes_docentes WHERE expediente_id = ?',
          [id]
        );
        
        await ExpedienteModel.asociarDocentes(id, docentes, connection);
      } else if (docente_id) {
        // Si solo se proporciona docente_id, actualizar la relación en la nueva tabla
        await connection.query(
          'DELETE FROM expedientes_docentes WHERE expediente_id = ?',
          [id]
        );
        
        await ExpedienteModel.asociarDocentes(id, [docente_id], connection);
      }
      
      // Actualizar relaciones con escuelas
      if (escuelas && Array.isArray(escuelas)) {
        // Eliminar relaciones actuales y agregar las nuevas
        await connection.query(
          'DELETE FROM expedientes_escuelas WHERE expediente_id = ?',
          [id]
        );
        
        await ExpedienteModel.asociarEscuelas(id, escuelas, connection);
      } else if (escuela_id) {
        // Si solo se proporciona escuela_id, actualizar la relación en la nueva tabla
        await connection.query(
          'DELETE FROM expedientes_escuelas WHERE expediente_id = ?',
          [id]
        );
        
        await ExpedienteModel.asociarEscuelas(id, [escuela_id], connection);
      }
      
      await connection.commit();
      console.log('Expediente actualizado exitosamente con ID:', id);
      
      // Obtener el expediente actualizado con sus relaciones
      const expedienteActualizado = await ExpedienteModel.getById(id);
      return expedienteActualizado;
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error al actualizar expediente:', error);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },

  // Eliminar un expediente
  delete: async (id) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      
      // Eliminar relaciones en tablas de unión
      await connection.query('DELETE FROM expedientes_docentes WHERE expediente_id = ?', [id]);
      await connection.query('DELETE FROM expedientes_escuelas WHERE expediente_id = ?', [id]);
      
      // Eliminar el expediente
      await connection.query('DELETE FROM expedientes WHERE id = ?', [id]);
      
      await connection.commit();
      return id;
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error(`Error al eliminar expediente con ID ${id}:`, error);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },
  
  // MÉTODOS PARA MANEJAR RELACIONES
  
  // Obtener docentes asociados a un expediente
  getDocentesByExpediente: async (expedienteId) => {
    try {
      const [docentes] = await pool.query(`
        SELECT d.*, ed.id as relacion_id 
        FROM docentes d
        JOIN expedientes_docentes ed ON d.id = ed.docente_id
        WHERE ed.expediente_id = ?
      `, [expedienteId]);
      
      return docentes;
    } catch (error) {
      console.error(`Error al obtener docentes del expediente ${expedienteId}:`, error);
      throw error;
    }
  },
  
  // Obtener escuelas asociadas a un expediente
  getEscuelasByExpediente: async (expedienteId) => {
    try {
      const [escuelas] = await pool.query(`
        SELECT e.*, ee.id as relacion_id 
        FROM escuelas e
        JOIN expedientes_escuelas ee ON e.id = ee.escuela_id
        WHERE ee.expediente_id = ?
      `, [expedienteId]);
      
      return escuelas;
    } catch (error) {
      console.error(`Error al obtener escuelas del expediente ${expedienteId}:`, error);
      throw error;
    }
  },
    // Asociar docentes a un expediente
  asociarDocentes: async (expedienteId, docenteIds, connection = null) => {
    const conn = connection || await pool.getConnection();
    const useLocalConnection = !connection;
    
    try {
      console.log(`Asociando docentes al expediente ${expedienteId}:`, docenteIds);
      
      // Asegurarse de que docenteIds sea un array válido
      if (!docenteIds || !Array.isArray(docenteIds) || docenteIds.length === 0) {
        console.log('No hay docentes para asociar');
        return true;
      }
      
      if (useLocalConnection) await conn.beginTransaction();
      
      // Verificar que la tabla existe (busca variantes del nombre)
      const [tablas] = await conn.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND (table_name LIKE 'expediente%docente%' OR table_name LIKE 'expedientes%docente%')"
      );
      
      const tablaDocentes = tablas.length > 0 
        ? tablas[0].table_name 
        : 'expedientes_docentes'; // nombre por defecto
      
      console.log(`Usando tabla: ${tablaDocentes} para asociar docentes`);
      
      for (const docenteId of docenteIds) {
        if (!docenteId) continue; // Saltamos valores nulos o vacíos
        
        try {
          // Verificar si la relación ya existe
          const [existeRelacion] = await conn.query(
            `SELECT id FROM ${tablaDocentes} WHERE expediente_id = ? AND docente_id = ?`,
            [expedienteId, docenteId]
          );
          
          // Si no existe, crearla
          if (existeRelacion.length === 0) {
            await conn.query(
              `INSERT INTO ${tablaDocentes} (expediente_id, docente_id) VALUES (?, ?)`,
              [expedienteId, docenteId]
            );
            console.log(`Docente ${docenteId} asociado correctamente al expediente ${expedienteId}`);
          } else {
            console.log(`La relación entre expediente ${expedienteId} y docente ${docenteId} ya existe`);
          }
        } catch (error) {
          console.error(`Error al asociar docente ${docenteId} al expediente ${expedienteId}:`, error);
        }
      }
      
      if (useLocalConnection) await conn.commit();
      return true;
    } catch (error) {
      if (useLocalConnection) await conn.rollback();
      console.error(`Error al asociar docentes al expediente ${expedienteId}:`, error);
      throw error;
    } finally {
      if (useLocalConnection && conn) conn.release();
    }
  },
  
  // Asociar escuelas a un expediente
  asociarEscuelas: async (expedienteId, escuelaIds, connection = null) => {
    const conn = connection || await pool.getConnection();
    const useLocalConnection = !connection;
    
    try {
      if (useLocalConnection) await conn.beginTransaction();
      
      for (const escuelaId of escuelaIds) {
        // Verificar si la relación ya existe
        const [existeRelacion] = await conn.query(
          'SELECT id FROM expedientes_escuelas WHERE expediente_id = ? AND escuela_id = ?',
          [expedienteId, escuelaId]
        );
        
        // Si no existe, crearla
        if (existeRelacion.length === 0) {
          await conn.query(
            'INSERT INTO expedientes_escuelas (expediente_id, escuela_id) VALUES (?, ?)',
            [expedienteId, escuelaId]
          );
        }
      }
      
      if (useLocalConnection) await conn.commit();
      return true;
    } catch (error) {
      if (useLocalConnection) await conn.rollback();
      console.error(`Error al asociar escuelas al expediente ${expedienteId}:`, error);
      throw error;
    } finally {
      if (useLocalConnection && conn) conn.release();
    }
  },
  
  // Eliminar asociación entre expediente y docente
  desasociarDocente: async (expedienteId, docenteId) => {
    try {
      await pool.query(
        'DELETE FROM expedientes_docentes WHERE expediente_id = ? AND docente_id = ?',
        [expedienteId, docenteId]
      );
      return true;
    } catch (error) {
      console.error(`Error al desasociar docente ${docenteId} del expediente ${expedienteId}:`, error);
      throw error;
    }
  },
  
  // Eliminar asociación entre expediente y escuela
  desasociarEscuela: async (expedienteId, escuelaId) => {
    try {
      await pool.query(
        'DELETE FROM expedientes_escuelas WHERE expediente_id = ? AND escuela_id = ?',
        [expedienteId, escuelaId]
      );
      return true;
    } catch (error) {
      console.error(`Error al desasociar escuela ${escuelaId} del expediente ${expedienteId}:`, error);
      throw error;
    }
  }
};

module.exports = ExpedienteModel;
