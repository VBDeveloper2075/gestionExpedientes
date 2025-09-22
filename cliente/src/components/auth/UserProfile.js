import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { user, logout, isAdmin, showUserProfile, setShowUserProfile } = useAuth();

  if (!user || !showUserProfile) return null;

  const handleClose = () => {
    setShowUserProfile(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserProfile(false);
  };

  return (
    <>
      {/* Modal de perfil */}
      <>
        {/* Overlay */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998
          }}
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div
          style={{
            position: 'fixed',
            top: '70px',
            right: '15px',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '1px solid #ddd',
            minWidth: '250px',
            zIndex: 9999,
            maxWidth: '300px'
          }}
        >
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#666',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Cerrar"
          >
            ✕
          </button>

            {/* Contenido del modal */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ fontSize: '16px' }}>👤 {user.username}</strong>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  marginTop: '2px'
                }}>
                  {user.email}
                </div>
              </div>
              
              <div style={{ 
                marginBottom: '15px',
                padding: '8px 12px',
                backgroundColor: isAdmin() ? '#e8f5e8' : '#e8f0ff',
                borderRadius: '4px',
                fontSize: '13px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {isAdmin() ? '🔑 Administrador' : '👁️ Usuario'}
              </div>

              <div style={{ 
                fontSize: '11px', 
                color: '#666',
                marginBottom: '15px',
                lineHeight: '1.4'
              }}>
                <strong>Permisos:</strong><br/>
                {isAdmin() ? (
                  <>• Acceso completo<br/>• Crear/Editar/Eliminar</>
                ) : (
                  <>• Solo lectura<br/>• Ver/Buscar/Exportar</>
                )}
              </div>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🚪 Cerrar Sesión
              </button>
          </div>
        </div>
      </>
    </>
  );
};

export default UserProfile;
