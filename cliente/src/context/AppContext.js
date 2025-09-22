import React, { createContext, useState, useContext, useCallback } from 'react';

// Crear el contexto
const AppContext = createContext();

// Proveedor del contexto
export const AppProvider = ({ children }) => {
  // Estados globales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  // Usamos useCallback para evitar re-renders innecesarios
  // Función para mostrar mensajes de éxito temporalmente
  const showSuccess = useCallback((message) => {
    setSuccessMessage(message);
    // Solo configurar el timeout si hay un mensaje (no si es null)
    if (message) {
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  }, []);

  // Función para mostrar errores temporalmente
  const showError = useCallback((errorMessage) => {
    setError(errorMessage);
    // Solo configurar el timeout si hay un mensaje (no si es null)
    if (errorMessage) {
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }, []);

  // Función para establecer el estado de carga
  const setLoadingState = useCallback((state) => {
    setLoading(state);
  }, []);
  
  // Valores que estarán disponibles en el contexto
  const contextValue = {
    loading,
    setLoading: setLoadingState,
    error,
    setError,
    showError,
    successMessage,
    showSuccess,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAppContext = () => {
  return useContext(AppContext);
};

export default AppContext;
