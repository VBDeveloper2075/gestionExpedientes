const express = require('express');
const router = express.Router();
const ExpedienteModel = require('../models/Expediente');
const DisposicionModel = require('../models/Disposicion');

// GET /api/expedientes - Obtener todos los expedientes
router.get('/', async (req, res) => {
  try {
    const expedientes = await ExpedienteModel.getAll();
    res.json(expedientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los expedientes' });
  }
});

// GET /api/expedientes/:id/docentes - Obtener docentes asociados a un expediente
router.get('/:id/docentes', async (req, res) => {
  try {
    const docentes = await ExpedienteModel.getDocentesByExpediente(req.params.id);
    res.json(docentes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los docentes del expediente' });
  }
});

// GET /api/expedientes/:id/escuelas - Obtener escuelas asociadas a un expediente
router.get('/:id/escuelas', async (req, res) => {
  try {
    const escuelas = await ExpedienteModel.getEscuelasByExpediente(req.params.id);
    res.json(escuelas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las escuelas del expediente' });
  }
});

// POST /api/expedientes/:id/docentes - Asociar docente a expediente
router.post('/:id/docentes', async (req, res) => {
  try {
    const { docenteId } = req.body;
    if (!docenteId) {
      return res.status(400).json({ error: 'El ID del docente es requerido' });
    }
    
    await ExpedienteModel.asociarDocentes(req.params.id, [docenteId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al asociar docente al expediente' });
  }
});

// POST /api/expedientes/:id/escuelas - Asociar escuela a expediente
router.post('/:id/escuelas', async (req, res) => {
  try {
    const { escuelaId } = req.body;
    if (!escuelaId) {
      return res.status(400).json({ error: 'El ID de la escuela es requerido' });
    }
    
    await ExpedienteModel.asociarEscuelas(req.params.id, [escuelaId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al asociar escuela al expediente' });
  }
});

// DELETE /api/expedientes/:id/docentes/:docenteId - Desasociar docente de expediente
router.delete('/:id/docentes/:docenteId', async (req, res) => {
  try {
    await ExpedienteModel.desasociarDocente(req.params.id, req.params.docenteId);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al desasociar docente del expediente' });
  }
});

// DELETE /api/expedientes/:id/escuelas/:escuelaId - Desasociar escuela de expediente
router.delete('/:id/escuelas/:escuelaId', async (req, res) => {
  try {
    await ExpedienteModel.desasociarEscuela(req.params.id, req.params.escuelaId);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al desasociar escuela del expediente' });
  }
});

// GET /api/expedientes/:id - Obtener un expediente por ID
router.get('/:id', async (req, res) => {
  try {
    const expediente = await ExpedienteModel.getById(req.params.id);
    if (!expediente) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }
    res.json(expediente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el expediente' });
  }
});

// GET /api/expedientes/:id/disposiciones - Obtener las disposiciones de un expediente
router.get('/:id/disposiciones', async (req, res) => {
  try {
    const disposiciones = await DisposicionModel.getByExpediente(req.params.id);
    res.json(disposiciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las disposiciones del expediente' });
  }
});

// POST /api/expedientes - Crear un nuevo expediente
router.post('/', async (req, res) => {
  try {
    console.log('Recibida petición para crear expediente:', JSON.stringify(req.body, null, 2));
    
    const { numero, asunto, fecha_recibido, notificacion, resolucion, pase, docente_id, escuela_id, observaciones, docentes, escuelas } = req.body;
    
    // Validación básica
    if (!numero || !asunto || !fecha_recibido) {
      console.log('Validación fallida: Faltan campos requeridos');
      return res.status(400).json({ error: 'Número, asunto y fecha de recepción son obligatorios' });
    }
      // Validación y normalización de formato de fecha
    if (fecha_recibido) {
      console.log('Fecha recibida (tipo):', typeof fecha_recibido, 'valor:', fecha_recibido);
      
      // Intentar convertir la fecha al formato correcto si no lo está
      let fechaFormateada = fecha_recibido;
      
      // Si la fecha es un string pero no está en formato YYYY-MM-DD
      if (typeof fecha_recibido === 'string' && !fecha_recibido.match(/^\d{4}-\d{2}-\d{2}$/)) {
        try {
          // Intentar parsearlo como fecha JavaScript
          const fechaObj = new Date(fecha_recibido);
          if (!isNaN(fechaObj.getTime())) {
            // Formatear a YYYY-MM-DD
            fechaFormateada = fechaObj.toISOString().split('T')[0];
            console.log('Fecha convertida exitosamente a:', fechaFormateada);
            // Actualizar el valor en expedienteData más adelante
          } else {
            console.log('No se pudo convertir la fecha:', fecha_recibido);
            return res.status(400).json({ error: 'El formato de fecha no es válido y no se pudo convertir automáticamente' });
          }
        } catch (error) {
          console.log('Error al convertir la fecha:', error);
          return res.status(400).json({ error: 'El formato de fecha no es válido y no se pudo convertir automáticamente' });
        }
      }
      
      // Actualizar fecha_recibido con la versión formateada
      req.body.fecha_recibido = fechaFormateada;
    }
      const expedienteData = {
      numero,
      asunto,
      fecha_recibido: req.body.fecha_recibido, // Usamos la fecha ya formateada
      notificacion: notificacion || null,
      resolucion: resolucion || null,
      pase: pase || null,
      docente_id: docente_id || null,
      escuela_id: escuela_id || null,
      observaciones: observaciones || null,
      docentes: docentes || [],
      escuelas: escuelas || []
    };
    
    console.log('Datos procesados del expediente:', JSON.stringify(expedienteData, null, 2));
    
    console.log('Datos validados, intentando crear expediente:', expedienteData);
    
    const nuevoExpediente = await ExpedienteModel.create(expedienteData);
    
    console.log('Expediente creado correctamente:', nuevoExpediente);
    res.status(201).json(nuevoExpediente);
  } catch (error) {
    console.error('Error al crear el expediente:', error);
    res.status(500).json({ 
      error: 'Error al crear el expediente', 
      mensaje: error.message,
      stack: error.stack 
    });
  }
});

// PUT /api/expedientes/:id - Actualizar un expediente
router.put('/:id', async (req, res) => {
  try {
    const { numero, asunto, fecha_recibido, notificacion, resolucion, pase, docente_id, escuela_id, observaciones, docentes, escuelas } = req.body;
    
    // Validación básica
    if (!numero || !asunto || !fecha_recibido) {
      return res.status(400).json({ error: 'Número, asunto y fecha de recepción son obligatorios' });
    }
    
    // Verificar si el expediente existe
    const expediente = await ExpedienteModel.getById(req.params.id);
    if (!expediente) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }
    
    const expedienteActualizado = await ExpedienteModel.update(req.params.id, {
      numero,
      asunto,
      fecha_recibido,
      notificacion,
      resolucion,
      pase,
      docente_id,
      escuela_id,
      observaciones,
      docentes: docentes || [],
      escuelas: escuelas || []
    });
    
    res.json(expedienteActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el expediente' });
  }
});

// DELETE /api/expedientes/:id - Eliminar un expediente
router.delete('/:id', async (req, res) => {
  try {
    // Verificar si el expediente existe
    const expediente = await ExpedienteModel.getById(req.params.id);
    if (!expediente) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }
    
    await ExpedienteModel.delete(req.params.id);
    res.json({ message: 'Expediente eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el expediente' });
  }
});

module.exports = router;
