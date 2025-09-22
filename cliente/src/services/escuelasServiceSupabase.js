import supabase from './supabaseClient';
import axios from 'axios';
import API_URL from './config';

const EscuelasService = {
  // Obtener todas las escuelas (orden por nombre)
  getAll: async () => {
    const { data, error } = await supabase
      .from('escuelas')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // Obtener una escuela por ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('escuelas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Crear una escuela (vía backend, usa service role)
  create: async (escuela) => {
    const res = await axios.post(`${API_URL}/escuelas`, escuela);
    return res.data;
  },

  // Actualizar una escuela (vía backend)
  update: async (id, escuela) => {
    const res = await axios.put(`${API_URL}/escuelas/${id}`, escuela);
    return res.data;
  },

  // Eliminar una escuela (vía backend)
  delete: async (id) => {
    await axios.delete(`${API_URL}/escuelas/${id}`);
    return true;
  }
};

export default EscuelasService;
