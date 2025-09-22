// Modelo para manejar Expedientes - Versión mejorada
const { pool } = require('../config/db');

// Operaciones CRUD para expedientes
const ExpedienteModel = {
  // Obtener todos los expedientes
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
          // Obtener docentes asociados
          const [docentes] = await pool.query(`
            SELECT d.*, ed.id as relacion_id 
            FROM docentes d
            JOIN expedientes_docentes ed ON d.id = ed.docente_id
            WHERE ed.expediente_id = ?
          `, [expediente.id]);
          
          // Obtener escuelas asociadas
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
      
      try {
        // Obtener docentes asociados
        const [docentes] = await pool.query(`
          SELECT d.*, ed.id as relacion_id 
          FROM docentes d
          JOIN expedientes_docentes ed ON d.id = ed.docente_id
          WHERE ed.expediente_id = ?
        `, [id]);
        
        expediente.docentes = docentes || [];
        console.log(`Se encontraron ${docentes.length} docentes asociados`);
      } catch (errorDocentes) {
        console.error(`Error al obtener docentes asociados:`, errorDocentes);
        expediente.docentes = [];
      }
      
      try {
        // Obtener escuelas asociadas
        const [escuelas] = await pool.query(`
          SELECT e.*, ee.id as relacion_id 
          FROM escuelas e
          JOIN expedientes_escuelas ee ON e.id = ee.escuela_id
          WHERE ee.expediente_id = ?
        `, [id]);
        
        expediente.escuelas = escuelas || [];
        console.log(`Se encontraron ${escuelas.length} escuelas asociadas`);
      } catch (errorEscuelas) {
        console.error(`Error al obtener escuelas asociadas:`, errorEscuelas);
        expediente.escuelas = [];
      }
      
      return expediente;
    } catch (error) {
      console.error(`Error al obtener expediente con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo expediente
  create: async (expediente) => {
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
      
      // Insertar el registro básico del expediente
      const [result] = await connection.query(
        'INSERT INTO expedientes (numero, asunto, fecha_recibido, notificacion, resolucion, pase, observaciones, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          numero, 
          asunto, 
          fechaDb, 
          notificacion, 
          resolucion, 
          pase, 
          observaciones,
          'pendiente', // Estado predeterminado
          fecha_creacion
        ]
      );
      
      const expedienteId = result.insertId;
      console.log('Expediente básico creado con ID:', expedienteId);
      
      // Asociar docentes al expediente
      if (docentes && Array.isArray(docentes) && docentes.length > 0) {
        for (const docenteId of docentes) {
          if (!docenteId) continue; // Saltar IDs vacíos
          
          try {
            await connection.query(
              'INSERT INTO expedientes_docentes (expediente_id, docente_id) VALUES (?, ?)',
              [expedienteId, docenteId]
            );
            console.log(`Docente ${docenteId} asociado correctamente`);
          } catch (error) {
            console.error(`Error al asociar docente ${docenteId}:`, error.message);
          }
        }
      } else if (docente_id) {
        // Compatibilidad con el campo individual
        try {
          await connection.query(
            'INSERT INTO expedientes_docentes (expediente_id, docente_id) VALUES (?, ?)',
            [expedienteId, docente_id]
          );
        } catch (error) {
          console.error(`Error al asociar docente_id ${docente_id}:`, error.message);
        }
      }
      
      // Asociar escuelas al expediente
      if (escuelas && Array.isArray(escuelas) && escuelas.length > 0) {
        for (const escuelaId of escuelas) {
          if (!escuelaId) continue; // Saltar IDs vacíos
          
          try {
            await connection.query(
              'INSERT INTO expedientes_escuelas (expediente_id, escuela_id) VALUES (?, ?)',
              [expedienteId, escuelaId]
            );
            console.log(`Escuela ${escuelaId} asociada correctamente`);
          } catch (error) {
            console.error(`Error al asociar escuela ${escuelaId}:`, error.message);
          }
        }
      } else if (escuela_id) {
        // Compatibilidad con el campo individual
        try {
          await connection.query(
            'INSERT INTO expedientes_escuelas (expediente_id, escuela_id) VALUES (?, ?)',
            [expedienteId, escuela_id]
          );
        } catch (error) {
          console.error(`Error al asociar escuela_id ${escuela_id}:`, error.message);
        }
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

  // Actualizar un expediente existente
  update: async (id, expediente) => {
    let connection;
    try {
      console.log(`Actualizando expediente ID ${id} con datos:`, JSON.stringify(expediente, null, 2));
      
      const { 
        numero, 
        asunto, 
        fecha_recibido, 
        notificacion, 
        resolucion, 
        pase, 
        observaciones, 
        docentes,
        escuelas
      } = expediente;
      
      // Asegurar que fecha_recibido sea una fecha válida
      let fechaDb = fecha_recibido;
      if (typeof fecha_recibido === 'string') {
        // Si es una cadena, asegurarse de que tenga el formato correcto
        fechaDb = fecha_recibido.split('T')[0]; // Eliminar la parte de hora si existe
      }
      
      connection = await pool.getConnection();
      await connection.beginTransaction();
      
      // Actualizar los datos básicos del expediente
      await connection.query(
        'UPDATE expedientes SET numero = ?, asunto = ?, fecha_recibido = ?, notificacion = ?, resolucion = ?, pase = ?, observaciones = ? WHERE id = ?',
        [numero, asunto, fechaDb, notificacion, resolucion, pase, observaciones, id]
      );
      
      // Actualizar docentes asociados
      if (docentes && Array.isArray(docentes)) {
        // Eliminar relaciones actuales
        await connection.query('DELETE FROM expedientes_docentes WHERE expediente_id = ?', [id]);
        
        // Agregar nuevas relaciones
        for (const docenteId of docentes) {
          if (!docenteId) continue; // Saltar IDs vacíos
          
          try {
            await connection.query(
              'INSERT INTO expedientes_docentes (expediente_id, docente_id) VALUES (?, ?)',
              [id, docenteId]
            );
          } catch (error) {
            console.error(`Error al asociar docente ${docenteId}:`, error.message);
          }
        }
      }
      
      // Actualizar escuelas asociadas
      if (escuelas && Array.isArray(escuelas)) {
        // Eliminar relaciones actuales
        await connection.query('DELETE FROM expedientes_escuelas WHERE expediente_id = ?', [id]);
        
        // Agregar nuevas relaciones
        for (const escuelaId of escuelas) {
          if (!escuelaId) continue; // Saltar IDs vacíos
          
          try {
            await connection.query(
              'INSERT INTO expedientes_escuelas (expediente_id, escuela_id) VALUES (?, ?)',
              [id, escuelaId]
            );
          } catch (error) {
            console.error(`Error al asociar escuela ${escuelaId}:`, error.message);
          }
        }
      }
      
      await connection.commit();
      
      // Obtener el expediente actualizado
      const expedienteActualizado = await ExpedienteModel.getById(id);
      return expedienteActualizado;
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error(`Error al actualizar expediente con ID ${id}:`, error);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },

  // Eliminar un expediente
  delete: async (id) => {
    try {
      console.log(`Eliminando expediente con ID: ${id}`);
      
      await pool.query('DELETE FROM expedientes WHERE id = ?', [id]);
      
      return true;
    } catch (error) {
      console.error(`Error al eliminar expediente con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener docentes asociados a un expediente
  getDocentesByExpediente: async (id) => {
    try {
      const [docentes] = await pool.query(`
        SELECT d.*, ed.id as relacion_id 
        FROM docentes d
        JOIN expedientes_docentes ed ON d.id = ed.docente_id
        WHERE ed.expediente_id = ?
      `, [id]);
      
      return docentes;
    } catch (error) {
      console.error(`Error al obtener docentes del expediente ${id}:`, error);
      return [];
    }
  },

  // Obtener escuelas asociadas a un expediente
  getEscuelasByExpediente: async (id) => {
    try {
      const [escuelas] = await pool.query(`
        SELECT e.*, ee.id as relacion_id 
        FROM escuelas e
        JOIN expedientes_escuelas ee ON e.id = ee.escuela_id
        WHERE ee.expediente_id = ?
      `, [id]);
      
      return escuelas;
    } catch (error) {
      console.error(`Error al obtener escuelas del expediente ${id}:`, error);
      return [];
    }
  },
  
  // Asociar docentes a un expediente
  asociarDocentes: async (expedienteId, docenteIds) => {
    let connection;
    try {
      console.log(`Asociando docentes al expediente ${expedienteId}:`, docenteIds);
      
      // Asegurarse de que docenteIds sea un array válido
      if (!docenteIds || !Array.isArray(docenteIds) || docenteIds.length === 0) {
        console.log('No hay docentes para asociar');
        return true;
      }
      
      connection = await pool.getConnection();
      await connection.beginTransaction();
      
      for (const docenteId of docenteIds) {
        if (!docenteId) continue; // Saltar IDs vacíos
        
        try {
          // Verificar si la relación ya existe
          const [existeRelacion] = await connection.query(
            'SELECT id FROM expedientes_docentes WHERE expediente_id = ? AND docente_id = ?',
            [expedienteId, docenteId]
          );
          
          // Si no existe, crearla
          if (existeRelacion.length === 0) {
            await connection.query(
              'INSERT INTO expedientes_docentes (expediente_id, docente_id) VALUES (?, ?)',
              [expedienteId, docenteId]
            );
            console.log(`Docente ${docenteId} asociado correctamente al expediente ${expedienteId}`);
          }
        } catch (error) {
          console.error(`Error al asociar docente ${docenteId}:`, error);
        }
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error(`Error al asociar docentes al expediente ${expedienteId}:`, error);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },
  
  // Asociar escuelas a un expediente
  asociarEscuelas: async (expedienteId, escuelaIds) => {
    let connection;
    try {
      console.log(`Asociando escuelas al expediente ${expedienteId}:`, escuelaIds);
      
      // Asegurarse de que escuelaIds sea un array válido
      if (!escuelaIds || !Array.isArray(escuelaIds) || escuelaIds.length === 0) {
        console.log('No hay escuelas para asociar');
        return true;
      }
      
      connection = await pool.getConnection();
      await connection.beginTransaction();
      
      for (const escuelaId of escuelaIds) {
        if (!escuelaId) continue; // Saltar IDs vacíos
        
        try {
          // Verificar si la relación ya existe
          const [existeRelacion] = await connection.query(
            'SELECT id FROM expedientes_escuelas WHERE expediente_id = ? AND escuela_id = ?',
            [expedienteId, escuelaId]
          );
          
          // Si no existe, crearla
          if (existeRelacion.length === 0) {
            await connection.query(
              'INSERT INTO expedientes_escuelas (expediente_id, escuela_id) VALUES (?, ?)',
              [expedienteId, escuelaId]
            );
            console.log(`Escuela ${escuelaId} asociada correctamente al expediente ${expedienteId}`);
          }
        } catch (error) {
          console.error(`Error al asociar escuela ${escuelaId}:`, error);
        }
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error(`Error al asociar escuelas al expediente ${expedienteId}:`, error);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },
  
  // Desasociar docente de expediente
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
  
  // Desasociar escuela de expediente
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
