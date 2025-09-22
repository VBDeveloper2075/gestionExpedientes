import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DocentesService from '../../services/docentesServiceSupabase';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import Pagination from '../common/Pagination';

const DocentesList = () => {
  const [docentes, setDocentes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  });
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const { loading, setLoading, showError, showSuccess } = useAppContext();
  const { isAdmin } = useAuth();
  
  // Función para cargar los docentes desde la API con paginación
  const loadDocentes = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      console.log(`📡 Cargando docentes - Página: ${page}, Búsqueda: "${search}"`);
      const response = await DocentesService.getAll(page, 25, search);
      
      console.log('📦 Respuesta completa del servidor:', response);
      
      // Verificar si la respuesta tiene el formato de paginación esperado
      if (response && response.data && Array.isArray(response.data) && response.pagination) {
        // Formato correcto con paginación
        setDocentes(response.data);
        setPagination(response.pagination);
        console.log('✅ Docentes cargados con paginación:', response.data.length, 'Total:', response.pagination.total);
      } else if (Array.isArray(response)) {
        // Formato antiguo sin paginación (compatibilidad hacia atrás)
        console.log('⚠️ Respuesta sin paginación, usando formato antiguo');
        setDocentes(response);
        setPagination({ 
          page: 1, 
          limit: response.length, 
          total: response.length, 
          totalPages: 1 
        });
      } else {
        console.error('❌ Respuesta inesperada del servidor:', response);
        setDocentes([]);
        setPagination({ page: 1, limit: 25, total: 0, totalPages: 0 });
      }
      
    } catch (error) {
      console.error('❌ Error detallado:', error);
      
      // Mensajes de error más específicos
      if (error.message && error.message.includes('Servidor no disponible')) {
        showError('El servidor no está disponible. Contacta al administrador del sistema.');
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        showError('Error de conexión con el servidor. Verifica tu conexión a internet.');
      } else {
        showError('Error al cargar la lista de docentes');
      }
      
      setDocentes([]);
      setPagination({ page: 1, limit: 25, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [setLoading, showError]);
  
  // Cargar la lista de docentes al montar el componente
  useEffect(() => {
    loadDocentes(currentPage, searchTerm);
  }, [loadDocentes, currentPage]);
  
  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };
  
  // Ejecutar búsqueda cuando cambia el término (con debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDocentes(1, searchTerm);
      setCurrentPage(1);
    }, 500); // Debounce de 500ms
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadDocentes]);

  // Limpiar la búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };
  
  // Manejar cambio de página
  const handlePageChange = (page) => {
    console.log(`📄 Cambiando a página ${page}`);
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll al top al cambiar página
  };
  
  // Función para eliminar un docente
  const handleDelete = useCallback(async (id, nombre, apellido) => {
    if (!isAdmin()) {
      setShowPermissionModal(true);
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar al docente ${nombre} ${apellido}?`)) {
      setLoading(true);
      try {
        await DocentesService.delete(id);
        showSuccess(`Docente ${nombre} ${apellido} eliminado correctamente`);
        // Recargar la página actual después de eliminar
        loadDocentes(currentPage, searchTerm);
      } catch (error) {
        showError('Error al eliminar el docente');
        console.error('❌ Error al eliminar docente:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [isAdmin, showSuccess, showError, setLoading, loadDocentes, currentPage, searchTerm]);

  if (loading && docentes.length === 0) {
    return <Loader />;
  }

  return (
    <div className="docentes-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📋 Lista de Docentes</h2>
        {isAdmin() && (
          <Link to="/docentes/nuevo" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Docente
          </Link>
        )}
      </div>
      
      {/* Buscador de docentes */}
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
                  placeholder="Filtrar por nombre, apellido o DNI..."
                  value={searchTerm}
                  onChange={handleSearchChange}
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
      </div>
      
      {/* Información de paginación */}
      {pagination.total > 0 && (
        <div className="mb-3">
          <small className="text-muted">
            📊 Total de docentes: {pagination.total} | 
            Página {pagination.page} de {pagination.totalPages}
          </small>
        </div>
      )}
      
      {docentes.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          {searchTerm 
            ? `No se encontraron docentes con "${searchTerm}". Intenta con otros términos de búsqueda.` 
            : 'No hay docentes registrados. Puedes crear uno nuevo usando el botón "Nuevo Docente".'
          }
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead className="table-light">
                <tr>
                  <th>Apellido</th>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docentes.map((docente) => (
                  <tr key={docente.id}>
                    <td><strong>{docente.apellido}</strong></td>
                    <td>{docente.nombre}</td>
                    <td>{docente.dni}</td>
                    <td>{docente.email || <span className="text-muted">-</span>}</td>
                    <td>{docente.telefono || <span className="text-muted">-</span>}</td>
                    <td className="action-buttons">
                      <Link to={`/docentes/${docente.id}`} className="btn btn-sm btn-info me-1" title="Ver detalles">
                        <i className="bi bi-eye"></i>
                      </Link>
                      {isAdmin() && (
                        <Link to={`/docentes/editar/${docente.id}`} className="btn btn-sm btn-warning me-1" title="Editar">
                          <i className="bi bi-pencil"></i>
                        </Link>
                      )}
                      {isAdmin() && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(docente.id, docente.nombre, docente.apellido)}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Componente de paginación */}
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
          />
        </>
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
                No tienes permisos para <strong>eliminar docentes</strong>.
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

export default DocentesList;
