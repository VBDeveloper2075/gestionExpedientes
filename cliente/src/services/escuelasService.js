import axios from 'axios';
import API_URL from './config';

const EscuelasService = {
  // Obtener todas las escuelas
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/escuelas`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener escuelas:', error);
      throw error;
    }
  },

  // Obtener una escuela por su ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/escuelas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener la escuela con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear una nueva escuela
  create: async (escuela) => {
    try {
      const response = await axios.post(`${API_URL}/escuelas`, escuela);
      return response.data;
    } catch (error) {
      console.error('Error al crear escuela:', error);
      throw error;
    }
  },

  // Actualizar una escuela existente
  update: async (id, escuela) => {
    try {
      const response = await axios.put(`${API_URL}/escuelas/${id}`, escuela);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar la escuela con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar una escuela
  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/escuelas/${id}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar la escuela con ID ${id}:`, error);
      throw error;
    }
  }
};

export default EscuelasService;
