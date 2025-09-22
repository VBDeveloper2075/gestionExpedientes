import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import '../../styles/Alerts.css';

const Alert = ({ type, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Función para manejar la transición de salida
  const handleClose = () => {
    setIsVisible(false);
    // Esperamos a que termine la animación antes de eliminar el componente
    setTimeout(() => {
      onClose();
    }, 300); // 300ms es la duración de la animación
  };
  
  // Auto-cierre después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const alertClass = `alert alert-${type} alert-dismissible fade ${isVisible ? 'show' : ''}`;
  
  return (
    <div className={alertClass} role="alert">
      {message}
      <button 
        type="button" 
        className="btn-close" 
        onClick={handleClose} 
        aria-label="Close"
      ></button>
    </div>
  );
};

const Alerts = () => {
  const { error, successMessage, showError, showSuccess } = useAppContext();

  return (
    <div className="alerts-container">
      {error && (
        <Alert 
          type="danger" 
          message={error} 
          onClose={() => showError(null)} 
        />
      )}
      
      {successMessage && (
        <Alert 
          type="success" 
          message={successMessage} 
          onClose={() => showSuccess(null)} 
        />
      )}
    </div>
  );
};

export default Alerts;
