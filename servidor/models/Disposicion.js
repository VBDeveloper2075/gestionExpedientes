const { supabase } = require('../config/supabase');

// Operaciones CRUD para disposiciones con Supabase
const DisposicionModel = {
  // Obtener todas las disposiciones con paginación
  getAll: async ({ page = 1, limit = 25, search = '' } = {}) => {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('disposiciones')
      .select('*', { count: 'exact' })
      .order('fecha_dispo', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`numero.ilike.${term},dispo.ilike.${term},cargo.ilike.${term},motivo.ilike.${term}`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const dispos = data || [];
    const docenteIds = [...new Set(dispos.map(d => d.docente_id).filter(Boolean))];
    const escuelaIds = [...new Set(dispos.map(d => d.escuela_id).filter(Boolean))];

    let docentesMap = new Map();
    if (docenteIds.length) {
      const { data: docentes } = await supabase
        .from('docentes')
        .select('id,nombre,apellido')
        .in('id', docenteIds);
      (docentes || []).forEach(d => docentesMap.set(d.id, `${d.apellido}, ${d.nombre}`));
    }

    let escuelasMap = new Map();
    if (escuelaIds.length) {
      const { data: escuelas } = await supabase
        .from('escuelas')
        .select('id,nombre')
        .in('id', escuelaIds);
      (escuelas || []).forEach(e => escuelasMap.set(e.id, e.nombre));
    }

    const enriched = dispos.map(d => ({
      ...d,
      docente_nombre: d.docente_id ? (docentesMap.get(d.docente_id) || null) : null,
      escuela_nombre: d.escuela_id ? (escuelasMap.get(d.escuela_id) || null) : null
    }));

    return {
      data: enriched,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  },

  // Obtener una disposición por su ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('disposiciones')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;

    let docente_nombre = null;
    if (data.docente_id) {
      const { data: dDoc } = await supabase
        .from('docentes')
        .select('nombre,apellido')
        .eq('id', data.docente_id)
        .maybeSingle();
      if (dDoc) docente_nombre = `${dDoc.apellido}, ${dDoc.nombre}`;
    }

    let escuela_nombre = null;
    if (data.escuela_id) {
      const { data: dEsc } = await supabase
        .from('escuelas')
        .select('nombre')
        .eq('id', data.escuela_id)
        .maybeSingle();
      if (dEsc) escuela_nombre = dEsc.nombre;
    }

    return { ...data, docente_nombre, escuela_nombre };
  },

  // Obtener disposiciones por expediente
  getByExpediente: async (expedienteId) => {
    const { data, error } = await supabase
      .from('disposiciones')
      .select('*')
      .eq('expediente_id', expedienteId)
      .order('fecha_dispo', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Crear una nueva disposición
  create: async (disposicion) => {
    const docente_id = Array.isArray(disposicion.docentes) && disposicion.docentes.length
      ? disposicion.docentes[0]
      : (disposicion.docente_id || null);
    const escuela_id = Array.isArray(disposicion.escuelas) && disposicion.escuelas.length
      ? disposicion.escuelas[0]
      : (disposicion.escuela_id || null);

    const payload = {
      numero: disposicion.numero,
      fecha_dispo: disposicion.fecha,
      dispo: disposicion.dispo,
      docente_id,
      escuela_id,
      cargo: disposicion.cargo || null,
      motivo: disposicion.motivo || null,
      enlace: disposicion.enlace || null
    };

    const { data, error } = await supabase
      .from('disposiciones')
      .insert([payload])
      .select();
    if (error) throw error;
    return data?.[0];
  },

  // Actualizar una disposición
  update: async (id, disposicion) => {
    const docente_id = Array.isArray(disposicion.docentes) && disposicion.docentes.length
      ? disposicion.docentes[0]
      : (disposicion.docente_id || null);
    const escuela_id = Array.isArray(disposicion.escuelas) && disposicion.escuelas.length
      ? disposicion.escuelas[0]
      : (disposicion.escuela_id || null);

    const payload = {
      numero: disposicion.numero,
      fecha_dispo: disposicion.fecha,
      dispo: disposicion.dispo,
      docente_id,
      escuela_id,
      cargo: disposicion.cargo || null,
      motivo: disposicion.motivo || null,
      enlace: disposicion.enlace || null
    };

    const { data, error } = await supabase
      .from('disposiciones')
      .update(payload)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  // Eliminar una disposición
  delete: async (id) => {
    const { error } = await supabase
      .from('disposiciones')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return id;
  }
};

module.exports = DisposicionModel;
