const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  verifyTokenEndpoint,
  getAllUsers
} = require('./controllers');
const { verifyToken, requireAdmin } = require('./middleware');

// Rutas públicas (sin autenticación)
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas (requieren autenticación)
router.get('/me', verifyToken, getProfile);
router.get('/verify', verifyToken, verifyTokenEndpoint);

// Rutas de administrador
router.get('/users', verifyToken, requireAdmin, getAllUsers);

// Ruta de información sobre autenticación
router.get('/info', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de autenticación JP3',
    endpoints: {
      public: [
        'POST /auth/login - Iniciar sesión',
        'POST /auth/register - Registrar usuario (admin puede crear admin)',
        'GET /auth/info - Información del sistema'
      ],
      protected: [
        'GET /auth/me - Obtener perfil del usuario autenticado',
        'GET /auth/verify - Verificar validez del token'
      ],
      admin: [
        'GET /auth/users - Listar todos los usuarios'
      ]
    },
    tokenFormat: 'Authorization: Bearer <token>',
    tokenExpiry: '7 días'
  });
});

module.exports = router;
