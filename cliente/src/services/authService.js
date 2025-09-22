import axios from 'axios';

// Base de la API para endpoints de auth
// Producción: SIEMPRE relativa (mismo dominio) para evitar CORS
// Desarrollo: permite REACT_APP_API_URL; si no, backend local
const isProd = process.env.NODE_ENV === 'production';
const baseDev = (process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/$/, '')
  : 'http://localhost:5000');

const API_BASE_URL = isProd ? '' : baseDev;

// Configurar interceptor para agregar token automáticamente
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jp3_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('jp3_token');
      localStorage.removeItem('jp3_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const AuthService = {
  // Login
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });
      
      if (response.data.success && response.data.token) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('jp3_token', response.data.token);
        localStorage.setItem('jp3_user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Error en login'
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error de conexión'
      };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('jp3_token');
    localStorage.removeItem('jp3_user');
    window.location.href = '/login';
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('jp3_token');
    const user = localStorage.getItem('jp3_user');
    return !!(token && user);
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('jp3_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  },

  // Verificar si es admin
  isAdmin: () => {
    const user = AuthService.getCurrentUser();
    return user?.role === 'admin';
  },

  // Verificar si es user
  isUser: () => {
    const user = AuthService.getCurrentUser();
    return user?.role === 'user';
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('jp3_token');
  },

  // Verificar token con el servidor
  verifyToken: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/verify`);
      return response.data.success;
    } catch (error) {
      return false;
    }
  }
};

export default AuthService;
