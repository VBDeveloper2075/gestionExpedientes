import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoSad from '../../styles/logoSad.jpg';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(credentials.username, credentials.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Error en login');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '400px',
        maxWidth: '90vw'
      }}>
        {/* Logo y título */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px'
        }}>
          <img 
            src={logoSad} 
            alt="Logo SAD3F" 
            style={{
              width: '130px',
              height: '80px',
              marginBottom: '15px',
              borderRadius: '50px / 35px', 
              objectFit: 'contain'
            }}
          />
          <h1 style={{ 
            color: '#333',
            fontSize: '24px',
            margin: '0'
          }}>
            Archivo Digital - - SAD3F
          </h1>
        </div>
        
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#666',
          fontSize: '18px'
        }}>
          Iniciar Sesión
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Usuario:
            </label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="admin o usuario"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Contraseña:
            </label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {loading ? '🔄 Iniciando...' : '🔑 Iniciar Sesión'}
          </button>
        </form>

        <div style={{ 
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#666'
        }}>
          <strong>Usuarios de prueba:</strong><br/>
          • <strong>admin</strong> / JP3Admin2025!<br/>
          • <strong>usuario</strong> / JP3User2025!
        </div>
      </div>
    </div>
  );
};

export default Login;
