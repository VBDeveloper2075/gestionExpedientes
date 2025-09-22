import supabase from './supabaseClient';
import axios from 'axios';
import API_URL from './config';

const ExpedientesService = {
  // Obtener todos los expedientes, incluyendo docentes y escuelas asociados (nombres)
  getAll: async () => {
    // Trae expedientes básicos
    const { data: expedientes, error } = await supabase
      .from('expedientes')
      .select('*')
      .order('fecha_recibido', { ascending: false });
    if (error) throw error;

    const list = expedientes || [];
    if (!list.length) return [];

    // Cargar relaciones desde tablas pivote
    const expIds = list.map(e => e.id);

    const { data: relDoc, error: relDocErr } = await supabase
      .from('expedientes_docentes')
      .select('expediente_id, docente_id')
      .in('expediente_id', expIds);
    if (relDocErr) throw relDocErr;

    const { data: relEsc, error: relEscErr } = await supabase
      .from('expedientes_escuelas')
      .select('expediente_id, escuela_id')
      .in('expediente_id', expIds);
    if (relEscErr) throw relEscErr;

    const docenteIds = [...new Set((relDoc || []).map(r => r.docente_id))];
    const escuelaIds = [...new Set((relEsc || []).map(r => r.escuela_id))];

    let docentesMap = new Map();
    if (docenteIds.length) {
      const { data: docentes } = await supabase
        .from('docentes')
        .select('id,nombre,apellido')
        .in('id', docenteIds);
      (docentes || []).forEach(d => docentesMap.set(d.id, d));
    }

    let escuelasMap = new Map();
    if (escuelaIds.length) {
      const { data: escuelas } = await supabase
        .from('escuelas')
        .select('id,nombre')
        .in('id', escuelaIds);
      (escuelas || []).forEach(e => escuelasMap.set(e.id, e));
    }

    const agrupadoDoc = (relDoc || []).reduce((acc, r) => {
      if (!acc[r.expediente_id]) acc[r.expediente_id] = [];
      const d = docentesMap.get(r.docente_id);
      if (d) acc[r.expediente_id].push(d);
      return acc;
    }, {});

    const agrupadoEsc = (relEsc || []).reduce((acc, r) => {
      if (!acc[r.expediente_id]) acc[r.expediente_id] = [];
      const e = escuelasMap.get(r.escuela_id);
      if (e) acc[r.expediente_id].push(e);
      return acc;
    }, {});

    return list.map(exp => ({
      ...exp,
      docentes: agrupadoDoc[exp.id] || [],
      escuelas: agrupadoEsc[exp.id] || []
    }));
  },

  getById: async (id) => {
    const { data: exp, error } = await supabase
      .from('expedientes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;

    const { data: relDoc } = await supabase
      .from('expedientes_docentes')
      .select('docente_id')
      .eq('expediente_id', id);
    const { data: relEsc } = await supabase
      .from('expedientes_escuelas')
      .select('escuela_id')
      .eq('expediente_id', id);

    const dIds = (relDoc || []).map(r => r.docente_id);
    const eIds = (relEsc || []).map(r => r.escuela_id);

    let docentes = [];
    if (dIds.length) {
      const { data } = await supabase
        .from('docentes')
        .select('id,nombre,apellido')
        .in('id', dIds);
      docentes = data || [];
    }

    let escuelas = [];
    if (eIds.length) {
      const { data } = await supabase
        .from('escuelas')
        .select('id,nombre')
        .in('id', eIds);
      escuelas = data || [];
    }

    return { ...exp, docentes, escuelas };
  },

  create: async (expediente) => {
    const res = await axios.post(`${API_URL}/expedientes`, expediente);
    return res.data;
  },

  update: async (id, expediente) => {
    const res = await axios.put(`${API_URL}/expedientes/${id}`, expediente);
    return res.data;
  },

  delete: async (id) => {
    await axios.delete(`${API_URL}/expedientes/${id}`);
    return true;
  }
};

export default ExpedientesService;
