import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { user, logout, showUserProfile, setShowUserProfile } = useAuth();
  
  // Verifica si la ruta actual está activa
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <strong>Archivo Digital</strong> - - SAD3F
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/expedientes')}`} to="/expedientes">
                Expedientes
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/disposiciones')}`} to="/disposiciones">
                Disposiciones
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/docentes')}`} to="/docentes">
                Docentes
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/escuelas')}`} to="/escuelas">
                Escuelas
              </Link>
            </li>
            
            {/* Separador y perfil de usuario */}
            <li className="nav-item dropdown ms-3">
              <button 
                className="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center gap-2" 
                type="button"
                onClick={toggleUserProfile}
                style={{ 
                  border: 'none', 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  minWidth: '140px'
                }}
              >
                <i className="fas fa-user-circle"></i>
                <span className="d-none d-md-inline">
                  {user?.username || 'Usuario'}
                </span>
                <small className="badge bg-secondary ms-1">
                  {user?.role === 'admin' ? 'Admin' : 'User'}
                </small>
              </button>
            </li>
            
            <li className="nav-item ms-2">
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={logout}
                title="Cerrar Sesión"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span className="d-none d-md-inline ms-1">Salir</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
