import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DisposicionesService from '../../services/disposicionesServiceSupabase';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import Pagination from '../common/Pagination';

const DisposicionesList = () => {
  const [disposiciones, setDisposiciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  });
  const { loading, setLoading, showError, showSuccess } = useAppContext();
  const { isAdmin } = useAuth();
  
  // Función para cargar las disposiciones desde la API con paginación
  const loadDisposiciones = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      console.log(`📡 Cargando disposiciones - Página: ${page}, Búsqueda: "${search}"`);
      const response = await DisposicionesService.getAll(page, 25, search);
      
      console.log('📦 Respuesta completa del servidor:', response);
      
      // Verificar si la respuesta tiene el formato de paginación esperado
      if (response && response.data && Array.isArray(response.data) && response.pagination) {
        // Formato correcto con paginación
        setDisposiciones(response.data);
        setPagination(response.pagination);
        console.log('✅ Disposiciones cargadas con paginación:', response.data.length, 'Total:', response.pagination.total);
      } else if (Array.isArray(response)) {
        // Formato antiguo sin paginación (compatibilidad hacia atrás)
        console.log('⚠️ Respuesta sin paginación, usando formato antiguo');
        setDisposiciones(response);
        setPagination({ 
          page: 1, 
          limit: response.length, 
          total: response.length, 
          totalPages: 1 
        });
      } else {
        console.error('❌ Respuesta inesperada del servidor:', response);
        setDisposiciones([]);
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
        showError('Error al cargar la lista de disposiciones');
      }
      
      setDisposiciones([]);
      setPagination({ page: 1, limit: 25, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [setLoading, showError]);
  
  // Cargar la lista de disposiciones al montar el componente
  useEffect(() => {
    loadDisposiciones(currentPage, searchTerm);
  }, [loadDisposiciones, currentPage]);
  
  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };
  
  // Ejecutar búsqueda cuando cambia el término (con debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDisposiciones(1, searchTerm);
      setCurrentPage(1);
    }, 500); // Debounce de 500ms
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadDisposiciones]);

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
  
  // Función para eliminar una disposición
  const handleDelete = useCallback(async (id, numero) => {
    // Verificar permisos de administrador
    if (!isAdmin()) {
      setShowPermissionModal(true);
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar la disposición ${numero}?`)) {
      setLoading(true);
      try {
        await DisposicionesService.delete(id);
        showSuccess(`Disposición ${numero} eliminada correctamente`);
        // Recargar la página actual después de eliminar
        loadDisposiciones(currentPage, searchTerm);
      } catch (error) {
        showError('Error al eliminar la disposición');
        console.error('❌ Error al eliminar disposición:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [showSuccess, showError, setLoading, loadDisposiciones, currentPage, searchTerm, isAdmin, setShowPermissionModal]);
  
  // Función para formatear la fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  if (loading && disposiciones.length === 0) {
    return <Loader />;
  }

  return (
    <div className="disposiciones-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📋 Lista de Disposiciones</h2>
        {isAdmin() && (
          <Link to="/disposiciones/nueva" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Disposición
          </Link>
        )}
      </div>

      {/* Buscador de disposiciones */}
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
                  placeholder="Filtrar por número, disposición, cargo, motivo o docente..."
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
            📊 Total de disposiciones: {pagination.total} | 
            Página {pagination.page} de {pagination.totalPages}
          </small>
        </div>
      )}

      {disposiciones.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          {searchTerm
            ? `No se encontraron disposiciones con "${searchTerm}". Intenta con otros términos de búsqueda.`
            : 'No hay disposiciones registradas. Puedes crear una nueva usando el botón "Nueva Disposición".'
          }
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead className="table-light">
                <tr>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Disposición</th>
                  <th>Docente</th>
                  <th>Escuela</th>
                  <th>Cargo</th>
                  <th>Motivo</th>
                  <th>Enlace</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {disposiciones.map((disposicion) => (
                  <tr key={disposicion.id}>
                    <td><strong>{disposicion.numero}</strong></td>
                    <td>{formatearFecha(disposicion.fecha_dispo)}</td>
                    <td>{disposicion.dispo || <span className="text-muted">-</span>}</td>
                    <td>{disposicion.docente_nombre || <span className="text-muted">-</span>}</td>
                    <td>{disposicion.escuela_nombre || <span className="text-muted">-</span>}</td>
                    <td>{disposicion.cargo || <span className="text-muted">-</span>}</td>
                    <td>
                      {disposicion.motivo
                        ? disposicion.motivo.length > 50
                          ? `${disposicion.motivo.substring(0, 50)}...`
                          : disposicion.motivo
                        : <span className="text-muted">-</span>}
                    </td>
                    <td>
                      {disposicion.enlace ? (
                        <a 
                          href={disposicion.enlace} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-sm btn-danger"
                          title="Ver documento PDF"
                        >
                          <i className="bi bi-file-earmark-pdf me-1"></i>PDF
                        </a>
                      ) : (
                        <span className="text-muted">Sin enlace</span>
                      )}
                    </td>
                    <td className="action-buttons">
                      <Link to={`/disposiciones/${disposicion.id}`} className="btn btn-sm btn-info me-1" title="Ver detalles">
                        <i className="bi bi-eye"></i>
                      </Link>
                      {isAdmin() && (
                        <>
                          <Link to={`/disposiciones/editar/${disposicion.id}`} className="btn btn-sm btn-warning me-1" title="Editar">
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(disposicion.id, disposicion.numero)}
                            title="Eliminar"
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
                No tienes permisos para <strong>eliminar disposiciones</strong>.
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

export default DisposicionesList;
