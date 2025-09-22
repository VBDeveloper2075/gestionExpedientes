import axios from 'axios';
import API_URL from './config';

const ExpedientesService = {
  // Obtener todos los expedientes
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/expedientes`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener expedientes:', error);
      throw error;
    }
  },

  // Obtener un expediente por su ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/expedientes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el expediente con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Obtener docentes asociados a un expediente
  getDocentesByExpediente: async (expedienteId) => {
    try {
      const response = await axios.get(`${API_URL}/expedientes/${expedienteId}/docentes`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener docentes del expediente ${expedienteId}:`, error);
      throw error;
    }
  },
  
  // Obtener escuelas asociadas a un expediente
  getEscuelasByExpediente: async (expedienteId) => {
    try {
      const response = await axios.get(`${API_URL}/expedientes/${expedienteId}/escuelas`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener escuelas del expediente ${expedienteId}:`, error);
      throw error;
    }
  },
  
  // Asociar un docente a un expediente
  asociarDocente: async (expedienteId, docenteId) => {
    try {
      const response = await axios.post(`${API_URL}/expedientes/${expedienteId}/docentes`, { docenteId });
      return response.data;
    } catch (error) {
      console.error(`Error al asociar docente ${docenteId} al expediente ${expedienteId}:`, error);
      throw error;
    }
  },
  
  // Asociar una escuela a un expediente
  asociarEscuela: async (expedienteId, escuelaId) => {
    try {
      const response = await axios.post(`${API_URL}/expedientes/${expedienteId}/escuelas`, { escuelaId });
      return response.data;
    } catch (error) {
      console.error(`Error al asociar escuela ${escuelaId} al expediente ${expedienteId}:`, error);
      throw error;
    }
  },
  
  // Desasociar un docente de un expediente
  desasociarDocente: async (expedienteId, docenteId) => {
    try {
      await axios.delete(`${API_URL}/expedientes/${expedienteId}/docentes/${docenteId}`);
      return true;
    } catch (error) {
      console.error(`Error al desasociar docente ${docenteId} del expediente ${expedienteId}:`, error);
      throw error;
    }
  },
  
  // Desasociar una escuela de un expediente
  desasociarEscuela: async (expedienteId, escuelaId) => {
    try {
      await axios.delete(`${API_URL}/expedientes/${expedienteId}/escuelas/${escuelaId}`);
      return true;
    } catch (error) {
      console.error(`Error al desasociar escuela ${escuelaId} del expediente ${expedienteId}:`, error);
      throw error;
    }
  },

  // Obtener las disposiciones de un expediente
  getDisposicionesByExpedienteId: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/expedientes/${id}/disposiciones`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener disposiciones del expediente con ID ${id}:`, error);
      throw error;
    }
  },  // Crear un nuevo expediente
  create: async (expediente) => {
    try {
      console.log('Intentando crear expediente:', JSON.stringify(expediente, null, 2));
      
      // Asegurarse de que la fecha tiene el formato correcto
      if (expediente.fecha_recibido) {
        try {
          const fechaObj = new Date(expediente.fecha_recibido);
          if (!isNaN(fechaObj.getTime())) {
            expediente.fecha_recibido = fechaObj.toISOString().split('T')[0];
            console.log('Fecha formateada en servicio:', expediente.fecha_recibido);
          }
        } catch (fechaError) {
          console.error('Error al formatear la fecha en el servicio:', fechaError);
        }
      }
      
      const response = await axios.post(`${API_URL}/expedientes`, expediente);
      console.log('Respuesta del servidor al crear expediente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al crear expediente:', error);
      if (error.response) {
        console.error('Respuesta de error del servidor:', error.response.data);
        console.error('Código de estado:', error.response.status);
      }
      throw error;
    }
  },

  // Actualizar un expediente existente
  update: async (id, expediente) => {
    try {
      const response = await axios.put(`${API_URL}/expedientes/${id}`, expediente);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar el expediente con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un expediente
  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/expedientes/${id}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar el expediente con ID ${id}:`, error);
      throw error;
    }
  }
};

export default ExpedientesService;
