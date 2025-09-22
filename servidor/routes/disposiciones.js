const express = require('express');
const router = express.Router();
const DisposicionModel = require('../models/Disposicion');

// GET /api/disposiciones - Obtener todas las disposiciones con paginación
router.get('/', async (req, res) => {
  try {
    // Extraer parámetros de paginación y búsqueda
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25; // 25 elementos por página por defecto
    const search = req.query.search || req.query.q || '';
    
    console.log(`Disposiciones endpoint - Página: ${page}, Límite: ${limit}, Búsqueda: "${search}"`);
    
    // Obtener disposiciones con paginación
    const result = await DisposicionModel.getAll({ page, limit, search });
    
    res.json(result);
  } catch (error) {
    console.error('Error en endpoint disposiciones:', error);
    res.status(500).json({ error: 'Error al obtener las disposiciones' });
  }
});

// GET /api/disposiciones/:id - Obtener una disposición por ID
router.get('/:id', async (req, res) => {
  try {
    const disposicion = await DisposicionModel.getById(req.params.id);
    if (!disposicion) {
      return res.status(404).json({ error: 'Disposición no encontrada' });
    }
    res.json(disposicion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la disposición' });
  }
});

// POST /api/disposiciones - Crear una nueva disposición
router.post('/', async (req, res) => {
  try {
    const { numero, fecha, dispo, docentes = [], escuelas = [], cargo, motivo, enlace } = req.body;
    
    console.log('Datos recibidos para crear disposición:', req.body);
    
    // Validación básica
    if (!numero || !fecha || !dispo) {
      console.error('Faltan datos obligatorios:', { numero, fecha, dispo });
      return res.status(400).json({ error: 'Número, fecha y disposición son obligatorios' });
    }
    
    // Verificar si tenemos al menos un docente
    if (!Array.isArray(docentes) || docentes.length === 0) {
      console.error('No se proporcionó ningún docente');
      return res.status(400).json({ error: 'Debe seleccionar al menos un docente' });
    }
    
    // Verificar si tenemos al menos una escuela
    if (!Array.isArray(escuelas) || escuelas.length === 0) {
      console.error('No se proporcionó ninguna escuela');
      return res.status(400).json({ error: 'Debe seleccionar al menos una escuela' });
    }
      const nuevaDisposicion = await DisposicionModel.create({
      numero,
      fecha,
      dispo,
      docentes,  // Pasamos el array de docentes
      cargo: cargo || null,
      motivo: motivo || null,
      enlace: enlace || null
    });
    
    console.log('Disposición creada correctamente:', nuevaDisposicion);
    res.status(201).json(nuevaDisposicion);
  } catch (error) {
    console.error('Error detallado al crear la disposición:', error);
    res.status(500).json({ 
      error: 'Error al crear la disposición',
      detalle: error.message
    });
  }
});

// PUT /api/disposiciones/:id - Actualizar una disposición
router.put('/:id', async (req, res) => {
  try {
    const { numero, fecha, dispo, docentes = [], cargo, motivo, enlace } = req.body;
    
    console.log('Datos recibidos para actualizar disposición:', req.body);
    
    // Validación básica
    if (!numero || !fecha || !dispo) {
      console.error('Faltan datos obligatorios:', { numero, fecha, dispo });
      return res.status(400).json({ error: 'Número, fecha y disposición son obligatorios' });
    }
    
    // Verificar si tenemos al menos un docente
    if (!Array.isArray(docentes) || docentes.length === 0) {
      console.error('No se proporcionó ningún docente');
      return res.status(400).json({ error: 'Debe seleccionar al menos un docente' });
    }
    
    // Verificar si la disposición existe
    const disposicion = await DisposicionModel.getById(req.params.id);
    if (!disposicion) {
      return res.status(404).json({ error: 'Disposición no encontrada' });
    }
      const disposicionActualizada = await DisposicionModel.update(req.params.id, {
      numero,
      fecha,
      dispo,
      docentes, // Pasamos el array de docentes
      cargo: cargo || null,
      motivo: motivo || null,
      enlace: enlace || null
    });
    
    console.log('Disposición actualizada correctamente:', disposicionActualizada);
    res.json(disposicionActualizada);
  } catch (error) {
    console.error('Error detallado al actualizar la disposición:', error);
    res.status(500).json({ 
      error: 'Error al actualizar la disposición',
      detalle: error.message
    });
  }
});

// DELETE /api/disposiciones/:id - Eliminar una disposición
router.delete('/:id', async (req, res) => {
  try {
    console.log('Intentando eliminar disposición con ID:', req.params.id);
    
    // Verificar si la disposición existe
    const disposicion = await DisposicionModel.getById(req.params.id);
    if (!disposicion) {
      return res.status(404).json({ error: 'Disposición no encontrada' });
    }
    
    await DisposicionModel.delete(req.params.id);
    console.log('Disposición eliminada correctamente:', req.params.id);
    res.json({ message: 'Disposición eliminada correctamente' });
  } catch (error) {
    console.error('Error detallado al eliminar la disposición:', error);
    res.status(500).json({ 
      error: 'Error al eliminar la disposición',
      detalle: error.message
    });
  }
});

module.exports = router;
