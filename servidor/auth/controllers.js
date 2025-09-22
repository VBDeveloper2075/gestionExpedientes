const jwt = require('jsonwebtoken');
const { supabase, supabaseAdmin } = require('../config/supabase');

// Nota: Delegamos autenticación a Supabase Auth. Este backend expone endpoints thin-wrapper para login y perfil.

// Registrar nuevo usuario
const register = async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email y password son requeridos'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Solo se permite "admin" o "user"'
      });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, message: 'Servicio de autenticación no configurado' });
    }

    // Crear usuario en Supabase Auth (email + password)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, role }
    });
    if (error) {
      const status = error.status || 500;
      return res.status(status).json({ success: false, message: error.message });
    }

    const user = data.user;

    // Generar token propio firmando datos mínimos (opcional). También podríamos usar el access_token del login.
    const token = jwt.sign(
      { userId: user.id, username, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: { id: user.id, email: user.email, username, role },
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validaciones básicas
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username y password son requeridos'
      });
    }

    // En este sistema, username puede ser un alias para email. Permitimos ambos.
    // Permitir alias sin @: 'admin' y 'usuario' -> mapear a emails de seed
    let emailOrUsername = username;
    if (!emailOrUsername.includes('@')) {
      const adminAlias = (process.env.SEED_ADMIN_USERNAME || 'admin');
      const userAlias = (process.env.SEED_USER_USERNAME || 'usuario');
      if (emailOrUsername === adminAlias) {
        emailOrUsername = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
      } else if (emailOrUsername === userAlias) {
        emailOrUsername = process.env.SEED_USER_EMAIL || 'usuario@example.com';
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailOrUsername,
      password
    });

    if (error) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const { session, user } = data;

    // Generamos nuestro propio JWT para mantener compatibilidad con middleware existente
    const token = jwt.sign(
      { userId: user.id, username: user.user_metadata?.username || user.email, role: user.user_metadata?.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.user_metadata?.username || user.email,
        email: user.email,
        role: user.user_metadata?.role || 'user',
        created_at: user.created_at
      },
      token,
      supabaseAccessToken: session?.access_token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Verificar token y obtener perfil de usuario
const getProfile = async (req, res) => {
  try {
    // El usuario ya está disponible desde el middleware verifyToken (que ahora no consulta MySQL)
    res.json({ success: true, user: req.user });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Verificar si el token es válido
const verifyTokenEndpoint = async (req, res) => {
  try {
    // Si llegamos aquí, el token es válido (verificado por middleware)
    res.json({ success: true, message: 'Token válido', user: req.user });
  } catch (error) {
    console.error('Error en verificación de token:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todos los usuarios (solo para admin)
const getAllUsers = async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, message: 'Operación no disponible (service role no configurado)' });
    }
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    const users = data.users.map(u => ({
      id: u.id,
      username: u.user_metadata?.username || u.email,
      email: u.email,
      role: u.user_metadata?.role || 'user',
      created_at: u.created_at,
      updated_at: u.updated_at
    }));
    res.json({ success: true, users });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  verifyTokenEndpoint,
  getAllUsers
};
