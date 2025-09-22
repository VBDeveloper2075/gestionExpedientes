import supabase from './supabaseClient';

const DocentesService = {
  // Obtener todos los docentes con paginación (sin RPC, consulta directa a la tabla)
  getAll: async (page = 1, limit = 25, search = '') => {
    try {
      console.log('🔗 Supabase docentes (tabla directa):', { page, limit, search });

      const offset = (page - 1) * limit;
      let query = supabase
        .from('docentes')
        .select('*', { count: 'exact' })
        .order('apellido', { ascending: true })
        .order('nombre', { ascending: true })
        .range(offset, offset + limit - 1);

      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        // Buscar por nombre, apellido, dni, email
        query = query.or(
          `nombre.ilike.${term},apellido.ilike.${term},dni.ilike.${term},email.ilike.${term}`
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error al obtener docentes (tabla directa):', error);
      if (error.message?.includes('Failed to fetch')) {
        throw new Error('Error de conexión con la base de datos. Verifica tu conexión a internet.');
      }
      throw error;
    }
  },

  // Obtener un docente por su ID
  getById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('docentes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error al obtener el docente con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo docente
  create: async (docente) => {
    try {
      const { data, error } = await supabase
        .from('docentes')
        .insert([{
          nombre: docente.nombre,
          apellido: docente.apellido,
          dni: docente.dni,
          email: docente.email || null,
          telefono: docente.telefono || null
        }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error al crear docente:', error);
      throw error;
    }
  },

  // Actualizar un docente existente
  update: async (id, docente) => {
    try {
      const { data, error } = await supabase
        .from('docentes')
        .update({
          nombre: docente.nombre,
          apellido: docente.apellido,
          dni: docente.dni,
          email: docente.email || null,
          telefono: docente.telefono || null
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error(`Error al actualizar el docente con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un docente
  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('docentes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error al eliminar el docente con ID ${id}:`, error);
      throw error;
    }
  }
};

export default DocentesService;