import { createClient } from '@supabase/supabase-js';

// Centraliza la inicialización del cliente de Supabase para el frontend
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Consola del navegador: ayuda a diagnosticar .env
  // No lanzamos error para no romper el build, pero las llamadas fallarán claramente
  // si no están definidas las variables.
  console.warn('Supabase: faltan variables REACT_APP_SUPABASE_URL o REACT_APP_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
