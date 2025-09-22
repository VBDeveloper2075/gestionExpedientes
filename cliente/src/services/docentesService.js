import axios from 'axios';
import API_URL from './config';

const DocentesService = {
  // Obtener todos los docentes con paginación
  getAll: async (page = 1, limit = 25, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const url = `${API_URL}/docentes?${params.toString()}`;
      console.log('🔗 Llamando a URL:', url);
      
      const response = await axios.get(url);
      console.log('📦 Respuesta del servidor:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener docentes:', error);
      
      // Manejo específico de errores de conexión
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('🔌 Error de red: El servidor no está disponible');
        console.log('💡 Asegúrate de que el servidor esté corriendo en http://localhost:5000');
        throw new Error('Servidor no disponible. Verifica que esté ejecutándose en el puerto 5000.');
      }
      
      throw error;
    }
  },

  // Obtener un docente por su ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/docentes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el docente con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo docente
  create: async (docente) => {
    try {
      const response = await axios.post(`${API_URL}/docentes`, docente);
      return response.data;
    } catch (error) {
      console.error('Error al crear docente:', error);
      throw error;
    }
  },

  // Actualizar un docente existente
  update: async (id, docente) => {
    try {
      const response = await axios.put(`${API_URL}/docentes/${id}`, docente);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el docente con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un docente
  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/docentes/${id}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar el docente con ID ${id}:`, error);
      throw error;
    }
  }
};

export default DocentesService;
