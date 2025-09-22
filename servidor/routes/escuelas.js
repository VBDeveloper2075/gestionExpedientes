const express = require('express');
const router = express.Router();
const EscuelaModel = require('../models/Escuela');

// GET /api/escuelas - Obtener todas las escuelas
router.get('/', async (req, res) => {
  try {
    const escuelas = await EscuelaModel.getAll();
    res.json(escuelas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las escuelas' });
  }
});

// GET /api/escuelas/:id - Obtener una escuela por ID
router.get('/:id', async (req, res) => {
  try {
    const escuela = await EscuelaModel.getById(req.params.id);
    if (!escuela) {
      return res.status(404).json({ error: 'Escuela no encontrada' });
    }
    res.json(escuela);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la escuela' });
  }
});

// POST /api/escuelas - Crear una nueva escuela
router.post('/', async (req, res) => {
  try {
    const { nombre, direccion, telefono, email } = req.body;
    
    console.log('Datos recibidos para crear escuela:', req.body);
    
    // Validación básica
    if (!nombre) {
      console.error('El nombre de la escuela es obligatorio');
      return res.status(400).json({ error: 'El nombre de la escuela es obligatorio' });
    }
    
    const nuevaEscuela = await EscuelaModel.create({
      nombre: nombre.trim(),
      direccion: direccion?.trim() || null,
      telefono: telefono?.trim() || null,
      email: email?.trim() || null
    });
    
    console.log('Escuela creada correctamente:', nuevaEscuela);
    res.status(201).json(nuevaEscuela);
  } catch (error) {
    console.error('Error detallado al crear la escuela:', error);
    res.status(500).json({ 
      error: 'Error al crear la escuela',
      detalle: error.message 
    });
  }
});

// PUT /api/escuelas/:id - Actualizar una escuela
router.put('/:id', async (req, res) => {
  try {
    const { nombre, direccion, telefono, email } = req.body;
    
    console.log('Datos recibidos para actualizar escuela:', req.body);
    
    // Validación básica
    if (!nombre) {
      console.error('El nombre de la escuela es obligatorio');
      return res.status(400).json({ error: 'El nombre de la escuela es obligatorio' });
    }
    
    // Verificar si la escuela existe
    const escuela = await EscuelaModel.getById(req.params.id);
    if (!escuela) {
      return res.status(404).json({ error: 'Escuela no encontrada' });
    }
    
    const escuelaActualizada = await EscuelaModel.update(req.params.id, {
      nombre: nombre.trim(),
      direccion: direccion?.trim() || null,
      telefono: telefono?.trim() || null,
      email: email?.trim() || null
    });
    
    console.log('Escuela actualizada correctamente:', escuelaActualizada);
    res.json(escuelaActualizada);
  } catch (error) {
    console.error('Error detallado al actualizar la escuela:', error);
    res.status(500).json({ 
      error: 'Error al actualizar la escuela',
      detalle: error.message 
    });
  }
});

// DELETE /api/escuelas/:id - Eliminar una escuela
router.delete('/:id', async (req, res) => {
  try {
    // Verificar si la escuela existe
    const escuela = await EscuelaModel.getById(req.params.id);
    if (!escuela) {
      return res.status(404).json({ error: 'Escuela no encontrada' });
    }
    
    await EscuelaModel.delete(req.params.id);
    res.json({ message: 'Escuela eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la escuela' });
  }
});

module.exports = router;
