import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EscuelasService from '../../services/escuelasServiceSupabase';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

const EscuelasList = () => {
  const [escuelas, setEscuelas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allEscuelas, setAllEscuelas] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const { loading, setLoading, showError, showSuccess } = useAppContext();
  const { isAdmin } = useAuth();

  // Cargar la lista de escuelas al montar el componente
  useEffect(() => {
    loadEscuelas();
  }, []);
  
  // Efecto para filtrar escuelas cuando cambia el término de búsqueda
  useEffect(() => {
    filterEscuelas();
  }, [searchTerm]);
  
  // Función para cargar las escuelas desde la API
  const loadEscuelas = async () => {
    setLoading(true);
    try {
      const data = await EscuelasService.getAll();
      // Manejar respuesta (puede ser array directo o objeto con paginación)
      const escuelasArray = Array.isArray(data) ? data : (data.data || []);
      
      setAllEscuelas(escuelasArray); // Guardamos todas las escuelas
      setEscuelas(escuelasArray);    // Inicialmente mostramos todas
    } catch (error) {
      showError('Error al cargar la lista de escuelas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrar escuelas localmente según el término de búsqueda
  const filterEscuelas = () => {
    if (!searchTerm.trim()) {
      setEscuelas(allEscuelas);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const filtered = allEscuelas.filter(escuela => 
      escuela.nombre.toLowerCase().includes(term) || 
      (escuela.direccion && escuela.direccion.toLowerCase().includes(term)) || 
      (escuela.email && escuela.email.toLowerCase().includes(term))
    );
    
    setEscuelas(filtered);
  };
  
  // Limpiar la búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Función para eliminar una escuela
  const handleDelete = async (id, nombre) => {
    // Verificar permisos de administrador
    if (!isAdmin()) {
      setShowPermissionModal(true);
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar la escuela ${nombre}?`)) {
      setLoading(true);
      try {
        await EscuelasService.delete(id);
        showSuccess(`Escuela ${nombre} eliminada correctamente`);
        // Recargar la lista
        loadEscuelas();
      } catch (error) {
        showError('Error al eliminar la escuela');
        console.error(error);
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="escuelas-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Lista de Escuelas</h2>
        {isAdmin() && (
          <Link to="/escuelas/nueva" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Escuela
          </Link>
        )}
      </div>

      {/* Buscador de escuelas */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filtrar por nombre, dirección o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={clearSearch}
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>      {escuelas.length === 0 ? (
        <div className="alert alert-info">
          {searchTerm 
            ? 'No se encontraron escuelas con los criterios de búsqueda.' 
            : 'No hay escuelas registradas. Puedes crear una nueva usando el botón "Nueva Escuela".'
          }
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {escuelas.map((escuela) => (
                <tr key={escuela.id}>
                  <td>{escuela.nombre}</td>
                  <td>{escuela.direccion || '-'}</td>
                  <td>{escuela.telefono || '-'}</td>
                  <td>{escuela.email || '-'}</td>
                  <td className="action-buttons">
                    <Link to={`/escuelas/${escuela.id}`} className="btn btn-sm btn-info me-1">
                      <i className="bi bi-eye"></i>
                    </Link>
                    {isAdmin() && (
                      <>
                        <Link to={`/escuelas/editar/${escuela.id}`} className="btn btn-sm btn-warning me-1">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(escuela.id, escuela.nombre)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de permisos */}
      {showPermissionModal && (
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
            onClick={() => setShowPermissionModal(false)}
          />
          
          {/* Modal */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '1px solid #ddd',
              minWidth: '400px',
              maxWidth: '500px',
              zIndex: 9999,
              textAlign: 'center'
            }}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setShowPermissionModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
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
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '20px',
                color: '#ff6b6b'
              }}>
                🚫
              </div>
              
              <h3 style={{ 
                color: '#333', 
                marginBottom: '15px',
                fontWeight: 'bold'
              }}>
                Acceso Denegado
              </h3>
              
              <p style={{ 
                color: '#666', 
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                No tienes permisos para <strong>eliminar escuelas</strong>.
                <br />
                Esta acción requiere permisos de <strong>Administrador</strong>.
              </p>

              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                <strong>Tu rol actual:</strong> Usuario (solo lectura)
                <br />
                <strong>Permisos disponibles:</strong> Ver, buscar y exportar datos
              </div>

              <button
                onClick={() => setShowPermissionModal(false)}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  minWidth: '100px'
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EscuelasList;
