const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
// Accept common aliases from existing envs
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLIC_ANON_KEY || process.env.SUPABASE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL) {
  console.warn('⚠️ SUPABASE_URL no está configurado. Defínelo en el archivo .env del servidor.');
}

if (!SUPABASE_ANON_KEY) {
  console.warn('⚠️ SUPABASE_ANON_KEY no está configurado. Usando SUPABASE_SERVICE_ROLE_KEY para inicializar el cliente único.');
}

// Prefer service role key when available on the server
const clientKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, clientKey);

// Cliente admin (service role) para validar tokens y administración de usuarios
let supabaseAdmin = null;
if (SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
} else {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY no está configurado. Algunas operaciones admin no estarán disponibles.');
}

module.exports = { supabase, supabaseAdmin };
