const express = require('express');
const cors = require('cors');
const path = require('path');
// MySQL deshabilitado: migrado a Supabase para auth y datos
const { verifyToken } = require('./auth/middleware');
require('dotenv').config();

const app = express();
// Puerto por defecto 5000 (alineado con cliente en desarrollo); se puede sobreescribir por ENV
const PORT = Number(process.env.PORT) || 5000;

// Configuración CORS - permitir same-origin en producción y orígenes dev en desarrollo
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = isProd
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

const corsOptions = {
  origin: allowedOrigins.length > 0 ? allowedOrigins : true, // si no se define FRONTEND_URL, permitir cualquier origen
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
// Responder preflight explícitamente (Express 5 no admite '*')
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas públicas de autenticación
app.use('/auth', require('./auth/routes'));

// Rutas protegidas (requieren autenticación)
app.use('/api/docentes', verifyToken, require('./routes/docentes'));
app.use('/api/escuelas', verifyToken, require('./routes/escuelas'));
app.use('/api/expedientes', verifyToken, require('./routes/expedientes'));
app.use('/api/disposiciones', verifyToken, require('./routes/disposiciones'));

// Health endpoint for monitoring and readiness checks
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    version: process.env.API_VERSION || 'v1',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- Static files (React build) ---
// Serve static assets from /public if present (Docker copies client build here)
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// SPA fallback: return index.html for non-API routes so React Router works
// Express 5 (path-to-regexp v6) no longer supports '*' string patterns.
// Use a regex that excludes /api and /auth prefixes.
const spaCatchAll = /^(?!\/(api|auth)(\/|$)).*/;
app.get(spaCatchAll, (req, res, next) => {
  res.sendFile(path.join(publicDir, 'index.html'), (err) => {
    if (err) next();
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
  // Nota: conexión a MySQL omitida; ahora utilizamos Supabase.
});

// Manejo graceful de cierre del servidor
process.on('SIGTERM', () => {
  console.log('🔄 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 Cerrando servidor...');
  process.exit(0);
});
