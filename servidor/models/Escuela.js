const { supabase } = require('../config/supabase');

// Operaciones CRUD para escuelas con Supabase
const EscuelaModel = {
  // Obtener todas las escuelas
  getAll: async () => {
    const { data, error } = await supabase
      .from('escuelas')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // Obtener una escuela por su ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('escuelas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Crear una nueva escuela
  create: async (escuela) => {
    const { data, error } = await supabase
      .from('escuelas')
      .insert([{
        nombre: escuela.nombre,
        direccion: escuela.direccion || null,
        telefono: escuela.telefono || null,
        email: escuela.email || null
      }])
      .select();
    if (error) throw error;
    return data?.[0];
  },

  // Actualizar una escuela
  update: async (id, escuela) => {
    const { data, error } = await supabase
      .from('escuelas')
      .update({
        nombre: escuela.nombre,
        direccion: escuela.direccion || null,
        telefono: escuela.telefono || null,
        email: escuela.email || null
      })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  // Eliminar una escuela
  delete: async (id) => {
    const { error } = await supabase
      .from('escuelas')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return id;
  }
};

module.exports = EscuelaModel;
