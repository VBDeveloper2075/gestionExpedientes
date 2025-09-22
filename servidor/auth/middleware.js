const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

// Middleware para verificar JWT token
const verifyToken = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido. Formato: Bearer <token>'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Enriquecer desde Supabase si hay service role; si no, usa datos del token
    let userInfo = {
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };

    if (supabaseAdmin && decoded.userId) {
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(decoded.userId);
      if (!error && data?.user) {
        userInfo = {
          id: data.user.id,
          username: data.user.user_metadata?.username || data.user.email,
          email: data.user.email,
          role: data.user.user_metadata?.role || 'user',
          created_at: data.user.created_at
        };
      }
    }

    req.user = userInfo;
    next();

  } catch (error) {
    console.error('Error en verificación de token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar roles específicos
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (req.user.role !== requiredRole && requiredRole !== 'any') {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere rol: ${requiredRole}`
      });
    }

    next();
  };
};

// Middleware para verificar si es admin
const requireAdmin = (req, res, next) => {
  checkRole('admin')(req, res, next);
};

// Middleware que permite tanto admin como user
const requireAuth = (req, res, next) => {
  checkRole('any')(req, res, next);
};

module.exports = {
  verifyToken,
  checkRole,
  requireAdmin,
  requireAuth
};
