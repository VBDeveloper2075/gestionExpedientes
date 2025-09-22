// Configuración de la API
// Producción: SIEMPRE usa ruta relativa "/api" para evitar CORS y dominios externos
// Desarrollo: permite sobrescribir con REACT_APP_API_URL; si no, usa backend local
const isProd = process.env.NODE_ENV === 'production';
const baseDev = (process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/$/, '')
  : 'http://localhost:5000');

const API_URL = isProd ? '/api' : `${baseDev}/api`;

export default API_URL;
