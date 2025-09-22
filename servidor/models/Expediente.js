const { supabase } = require('../config/supabase');

// Operaciones CRUD para expedientes con Supabase
const ExpedienteModel = {
  // Obtener todos los expedientes
  getAll: async () => {
    const { data: expedientes, error } = await supabase
      .from('expedientes')
      .select('*')
      .order('fecha_recibido', { ascending: false });
    if (error) throw error;
    const list = expedientes || [];
    if (!list.length) return [];

    const expIds = list.map(e => e.id);
    const { data: relDoc } = await supabase
      .from('expedientes_docentes')
      .select('expediente_id, docente_id')
      .in('expediente_id', expIds);
    const { data: relEsc } = await supabase
      .from('expedientes_escuelas')
      .select('expediente_id, escuela_id')
      .in('expediente_id', expIds);

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

  // Obtener un expediente por su ID
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

  // Crear un nuevo expediente
  create: async (expediente) => {
    const { data: inserted, error } = await supabase
      .from('expedientes')
      .insert([{
        numero: expediente.numero,
        asunto: expediente.asunto,
        fecha_recibido: expediente.fecha_recibido,
        notificacion: expediente.notificacion || null,
        resolucion: expediente.resolucion || null,
        pase: expediente.pase || null,
        observaciones: expediente.observaciones || null,
        estado: 'pendiente'
      }])
      .select();
    if (error) throw error;
    const exp = inserted?.[0];
    if (!exp) return null;

    const docentes = Array.isArray(expediente.docentes) ? expediente.docentes.filter(Boolean) : [];
    const escuelas = Array.isArray(expediente.escuelas) ? expediente.escuelas.filter(Boolean) : [];

    if (docentes.length) {
      const payload = docentes.map(docente_id => ({ expediente_id: exp.id, docente_id }));
      const { error: e } = await supabase.from('expedientes_docentes').insert(payload);
      if (e) throw e;
    }
    if (escuelas.length) {
      const payload = escuelas.map(escuela_id => ({ expediente_id: exp.id, escuela_id }));
      const { error: e } = await supabase.from('expedientes_escuelas').insert(payload);
      if (e) throw e;
    }
    return await ExpedienteModel.getById(exp.id);
  },

  // Actualizar un expediente existente
  update: async (id, expediente) => {
    const { error } = await supabase
      .from('expedientes')
      .update({
        numero: expediente.numero,
        asunto: expediente.asunto,
        fecha_recibido: expediente.fecha_recibido,
        notificacion: expediente.notificacion || null,
        resolucion: expediente.resolucion || null,
        pase: expediente.pase || null,
        observaciones: expediente.observaciones || null
      })
      .eq('id', id);
    if (error) throw error;

    // Reset relaciones
    await supabase.from('expedientes_docentes').delete().eq('expediente_id', id);
    await supabase.from('expedientes_escuelas').delete().eq('expediente_id', id);

    const docentes = Array.isArray(expediente.docentes) ? expediente.docentes.filter(Boolean) : [];
    const escuelas = Array.isArray(expediente.escuelas) ? expediente.escuelas.filter(Boolean) : [];

    if (docentes.length) {
      const payload = docentes.map(docente_id => ({ expediente_id: id, docente_id }));
      const { error: e } = await supabase.from('expedientes_docentes').insert(payload);
      if (e) throw e;
    }
    if (escuelas.length) {
      const payload = escuelas.map(escuela_id => ({ expediente_id: id, escuela_id }));
      const { error: e } = await supabase.from('expedientes_escuelas').insert(payload);
      if (e) throw e;
    }
    return await ExpedienteModel.getById(id);
  },

  // Eliminar un expediente
  delete: async (id) => {
    await supabase.from('expedientes_docentes').delete().eq('expediente_id', id);
    await supabase.from('expedientes_escuelas').delete().eq('expediente_id', id);
    const { error } = await supabase.from('expedientes').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // Obtener docentes asociados a un expediente
  getDocentesByExpediente: async (id) => {
    const { data: rel } = await supabase
      .from('expedientes_docentes')
      .select('docente_id')
      .eq('expediente_id', id);
    const ids = (rel || []).map(r => r.docente_id);
    if (!ids.length) return [];
    const { data } = await supabase
      .from('docentes')
      .select('*')
      .in('id', ids);
    return data || [];
  },

  // Obtener escuelas asociadas a un expediente
  getEscuelasByExpediente: async (id) => {
    const { data: rel } = await supabase
      .from('expedientes_escuelas')
      .select('escuela_id')
      .eq('expediente_id', id);
    const ids = (rel || []).map(r => r.escuela_id);
    if (!ids.length) return [];
    const { data } = await supabase
      .from('escuelas')
      .select('*')
      .in('id', ids);
    return data || [];
  },

  // Asociar docentes a un expediente
  asociarDocentes: async (expedienteId, docenteIds) => {
    const rows = (docenteIds || []).filter(Boolean).map(docente_id => ({ expediente_id: expedienteId, docente_id }));
    if (!rows.length) return true;
    const { error } = await supabase.from('expedientes_docentes').insert(rows);
    if (error) throw error;
    return true;
  },

  // Asociar escuelas a un expediente
  asociarEscuelas: async (expedienteId, escuelaIds) => {
    const rows = (escuelaIds || []).filter(Boolean).map(escuela_id => ({ expediente_id: expedienteId, escuela_id }));
    if (!rows.length) return true;
    const { error } = await supabase.from('expedientes_escuelas').insert(rows);
    if (error) throw error;
    return true;
  },

  // Desasociar docente de expediente
  desasociarDocente: async (expedienteId, docenteId) => {
    const { error } = await supabase
      .from('expedientes_docentes')
      .delete()
      .eq('expediente_id', expedienteId)
      .eq('docente_id', docenteId);
    if (error) throw error;
    return true;
  },

  // Desasociar escuela de expediente
  desasociarEscuela: async (expedienteId, escuelaId) => {
    const { error } = await supabase
      .from('expedientes_escuelas')
      .delete()
      .eq('expediente_id', expedienteId)
      .eq('escuela_id', escuelaId);
    if (error) throw error;
    return true;
  }
};

module.exports = ExpedienteModel;
