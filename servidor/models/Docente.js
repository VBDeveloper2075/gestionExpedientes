const { supabaseAdmin: supabase } = require('../config/supabase');

// Operaciones CRUD para docentes
const DocenteModel = {
  // Obtener todos los docentes con paginación
  getAll: async (options = {}) => {
    try {
      const { page = 1, limit = 25, search = '' } = options;
      const offset = (page - 1) * limit;
      console.log(`Docentes Model (Supabase) - Página: ${page}, Límite: ${limit}, Búsqueda: "${search}"`);

      let query = supabase
        .from('docentes')
        .select('*', { count: 'exact' })
        .order('apellido', { ascending: true })
        .order('nombre', { ascending: true })
        .range(offset, offset + limit - 1);

      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`nombre.ilike.${term},apellido.ilike.${term},dni.ilike.${term},email.ilike.${term}`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      const rows = data || [];
      const total = count || rows.length;

      console.log(`✓ Docentes (Supabase): ${rows.length} registros de ${total} (página ${page}/${Math.ceil(total / limit)})`);

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error en getAll de Docentes (Supabase):', error);
      throw error;
    }
  },

  // Obtener un docente por su ID
  getById: async (id) => {
    const { data, error } = await supabase.from('docentes').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  // Crear un nuevo docente
  create: async (docente) => {
    try {
      const { nombre, apellido, dni, email, telefono } = docente;
      const fecha_creacion = new Date().toISOString();
      const insert = { nombre, apellido, dni, email: email || null, telefono: telefono || null, fecha_creacion };
      const { data, error } = await supabase.from('docentes').insert([insert]).select();
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error al crear docente:', error);
      throw error;
    }
  },

  // Actualizar un docente
  update: async (id, docente) => {
    try {
      const { nombre, apellido, dni, email, telefono } = docente;
      const { data, error } = await supabase
        .from('docentes')
        .update({ nombre, apellido, dni, email: email || null, telefono: telefono || null })
        .eq('id', id)
        .select();
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error al actualizar docente:', error);
      throw error;
    }
  },

  // Eliminar un docente
  delete: async (id) => {
    const { error } = await supabase.from('docentes').delete().eq('id', id);
    if (error) throw error;
    return id;
  }
};

module.exports = DocenteModel;
