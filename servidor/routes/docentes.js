const express = require('express');
const router = express.Router();
const DocenteModel = require('../models/Docente');

// GET /api/docentes - Obtener todos los docentes con paginación
router.get('/', async (req, res) => {
  try {
    // Extraer parámetros de paginación y búsqueda
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25; // 25 elementos por página por defecto
    const search = req.query.search || req.query.q || '';
    
    console.log(`Docentes endpoint - Página: ${page}, Límite: ${limit}, Búsqueda: "${search}"`);
    
    // Obtener docentes con paginación
    const result = await DocenteModel.getAll({ page, limit, search });
    
    res.json(result);
  } catch (error) {
    console.error('Error en endpoint docentes:', error);
    res.status(500).json({ error: 'Error al obtener los docentes' });
  }
});

// GET /api/docentes/:id - Obtener un docente por ID
router.get('/:id', async (req, res) => {
  try {
    const docente = await DocenteModel.getById(req.params.id);
    if (!docente) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    res.json(docente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el docente' });
  }
});

// POST /api/docentes - Crear un nuevo docente
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, dni, email, telefono } = req.body;
    
    console.log('Datos recibidos para crear docente:', req.body);
    
    // Validación básica
    if (!nombre || !apellido || !dni) {
      console.error('Faltan datos obligatorios:', { nombre, apellido, dni });
      return res.status(400).json({ error: 'Nombre, apellido y DNI son obligatorios' });
    }
    
    const nuevoDocente = await DocenteModel.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      email: email?.trim() || null,
      telefono: telefono?.trim() || null
    });
    
    console.log('Docente creado correctamente:', nuevoDocente);
    res.status(201).json(nuevoDocente);
  } catch (error) {
    console.error('Error detallado al crear el docente:', error);
    res.status(500).json({ 
      error: 'Error al crear el docente',
      detalle: error.message
    });
  }
});

// PUT /api/docentes/:id - Actualizar un docente
router.put('/:id', async (req, res) => {
  try {
    const { nombre, apellido, dni, email, telefono } = req.body;
    
    // Validación básica
    if (!nombre || !apellido || !dni) {
      return res.status(400).json({ error: 'Nombre, apellido y DNI son obligatorios' });
    }
    
    // Verificar si el docente existe
    const docente = await DocenteModel.getById(req.params.id);
    if (!docente) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    
    const docenteActualizado = await DocenteModel.update(req.params.id, {
      nombre,
      apellido,
      dni,
      email,
      telefono
    });
    
    res.json(docenteActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el docente' });
  }
});

// DELETE /api/docentes/:id - Eliminar un docente
router.delete('/:id', async (req, res) => {
  try {
    // Verificar si el docente existe
    const docente = await DocenteModel.getById(req.params.id);
    if (!docente) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    
    await DocenteModel.delete(req.params.id);
    res.json({ message: 'Docente eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el docente' });
  }
});

module.exports = router;
