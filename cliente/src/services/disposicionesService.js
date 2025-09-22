import axios from 'axios';
import API_URL from './config';

const DisposicionesService = {  
  // Obtener todas las disposiciones con paginación
  getAll: async (page = 1, limit = 25, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const url = `${API_URL}/disposiciones?${params.toString()}`;
      console.log('🔗 Llamando a URL:', url);
      
      const response = await axios.get(url);
      
      const data = response.data;
      console.log('📦 Respuesta del servidor:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error al obtener disposiciones:', error);
      
      // Manejo específico de errores de conexión
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('🔌 Error de red: El servidor no está disponible');
        console.log('💡 Asegúrate de que el servidor esté corriendo en http://localhost:5000');
        throw new Error('Servidor no disponible. Verifica que esté ejecutándose en el puerto 5000.');
      }
      
      throw error;
    }
  },  // Obtener una disposición por su ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/disposiciones/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener la disposición con ID ${id}:`, error);
      throw error;
    }
  },
    // Crear una nueva disposición
  create: async (disposicion) => {
    try {
      // Asegurarnos que tenemos un array de docentes
      if (!disposicion.docentes && disposicion.docente_id) {
        disposicion.docentes = [disposicion.docente_id];
      }
      
      // Asegurarnos de que docentes sea un array
      if (!Array.isArray(disposicion.docentes)) {
        disposicion.docentes = disposicion.docentes ? [disposicion.docentes] : [];
      }
      
      // Asegurarnos que tenemos un array de escuelas
      if (!disposicion.escuelas && disposicion.escuela_id) {
        disposicion.escuelas = [disposicion.escuela_id];
      }
      
      // Asegurarnos de que escuelas sea un array
      if (!Array.isArray(disposicion.escuelas)) {
        disposicion.escuelas = disposicion.escuelas ? [disposicion.escuelas] : [];
      }
      
      console.log('Enviando datos de disposición formateados:', disposicion);
      const response = await axios.post(`${API_URL}/disposiciones`, disposicion);
      
      return response.data;
    } catch (error) {
      console.error('Error al crear disposición:', error);
      throw error;
    }
  },
    // Actualizar una disposición existente
  update: async (id, disposicion) => {
    try {
      // Asegurarnos que tenemos un array de docentes
      if (!disposicion.docentes && disposicion.docente_id) {
        disposicion.docentes = [disposicion.docente_id];
      }
      
      // Asegurarnos de que docentes sea un array
      if (!Array.isArray(disposicion.docentes)) {
        disposicion.docentes = disposicion.docentes ? [disposicion.docentes] : [];
      }
      
      // Asegurarnos que tenemos un array de escuelas
      if (!disposicion.escuelas && disposicion.escuela_id) {
        disposicion.escuelas = [disposicion.escuela_id];
      }
      
      // Asegurarnos de que escuelas sea un array
      if (!Array.isArray(disposicion.escuelas)) {
        disposicion.escuelas = disposicion.escuelas ? [disposicion.escuelas] : [];
      }
      
      console.log('Enviando datos de disposición formateados para actualizar:', disposicion);
      const response = await axios.put(`${API_URL}/disposiciones/${id}`, disposicion);
      
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar la disposición con ID ${id}:`, error);
      throw error;
    }
  },
  // Eliminar una disposición
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/disposiciones/${id}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar la disposición con ID ${id}:`, error);
      throw error;
    }
  }
};

export default DisposicionesService;
