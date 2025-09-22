import React from 'react';
import '../../styles/Loader.css';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );
};

export default Loader;
