import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column' 
      }}>
        <div style={{ marginBottom: '20px' }}>🔄</div>
        <div>Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirigir a login y guardar la ubicación intentada
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    // Si requiere admin pero el usuario no es admin
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#fff3cd',
        margin: '20px',
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <h2>🚫 Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
        <p>Se requiere rol de <strong>Administrador</strong>.</p>
        <div style={{ marginTop: '20px' }}>
          <strong>Tu rol actual:</strong> {user?.role === 'user' ? 'Usuario' : user?.role}
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
