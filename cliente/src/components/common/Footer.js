import React from 'react';
import '../../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer bg-light">
      <div className="container text-center py-3">
        <p className="mb-0">
              Archivo Digital 
            - Administración de Documentos - SAD3F - <br />&copy; Verito {currentYear} 
        </p>
      </div>
    </footer>
  );
};

export default Footer;
