import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ExpedientesService from '../../services/expedientesServiceSupabase';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

const ExpedientesList = () => {
  const [expedientes, setExpedientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const { loading, setLoading, showError, showSuccess } = useAppContext();
  const { isAdmin } = useAuth();

  // Cargar la lista de expedientes al montar el componente
  useEffect(() => {
    loadExpedientes();
  }, []);
  // Función para cargar los expedientes desde la API
  const loadExpedientes = async () => {
    try {
      const data = await ExpedientesService.getAll();
      console.log('Expedientes cargados:', data);
      setExpedientes(Array.isArray(data) ? data : []);
    } catch (error) {
      showError('Error al cargar la lista de expedientes');
      console.error(error);
      setExpedientes([]); // Asegurarse de que sea siempre un array
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un expediente
  const handleDelete = async (id, numero) => {
    if (!isAdmin()) {
      setShowPermissionModal(true);
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar el expediente ${numero}?`)) {
      setLoading(true);
      try {
        await ExpedientesService.delete(id);
        showSuccess(`Expediente ${numero} eliminado correctamente`);
        // Recargar la lista
        loadExpedientes();
      } catch (error) {
        showError('Error al eliminar el expediente');
        console.error(error);
        setLoading(false);
      }
    }
  };
  // Función para filtrar los expedientes
  const expedientesFiltrados = expedientes.filter(expediente => {
    const terminoBusqueda = filtro.toLowerCase();
    
    // Buscar en los datos básicos
    const coincideBasico = 
      expediente.numero.toLowerCase().includes(terminoBusqueda) ||
      expediente.asunto.toLowerCase().includes(terminoBusqueda);
      
    // Buscar en docentes (array)
    const coincideDocentes = expediente.docentes && expediente.docentes.some(docente =>
      docente.apellido.toLowerCase().includes(terminoBusqueda) ||
      docente.nombre.toLowerCase().includes(terminoBusqueda)
    );
    
    // Buscar en escuelas (array)
    const coincideEscuelas = expediente.escuelas && expediente.escuelas.some(escuela =>
      escuela.nombre.toLowerCase().includes(terminoBusqueda)
    );
    
    // Buscar en los campos antiguos por compatibilidad
    const coincideAntiguos =
      (expediente.docente_apellido && expediente.docente_apellido.toLowerCase().includes(terminoBusqueda)) ||
      (expediente.docente_nombre && expediente.docente_nombre.toLowerCase().includes(terminoBusqueda)) ||
      (expediente.escuela_nombre && expediente.escuela_nombre.toLowerCase().includes(terminoBusqueda));
      
    return coincideBasico || coincideDocentes || coincideEscuelas || coincideAntiguos;
  });

  // Función para obtener la clase del badge de estado
  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'estado-badge estado-pendiente';
      case 'en_proceso':
        return 'estado-badge estado-en-proceso';
      case 'finalizado':
        return 'estado-badge estado-finalizado';
      default:
        return 'estado-badge';
    }
  };

  // Función para formatear el estado para mostrar
  const formatearEstado = (estado) => {
    switch (estado) {
      case 'en_proceso':
        return 'En Proceso';
      case 'pendiente':
        return 'Pendiente';
      case 'finalizado':
        return 'Finalizado';
      default:
        return estado;
    }
  };

  // Función para formatear la fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="expedientes-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Lista de Expedientes</h2>
        {isAdmin() && (
          <Link to="/expedientes/nuevo" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Expediente
          </Link>
        )}
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por número, asunto, docente o escuela..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
            {filtro && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setFiltro('')}
              >
                <i className="bi bi-x-circle"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {expedientesFiltrados.length === 0 ? (
        <div className="alert alert-info">
          {filtro
            ? 'No se encontraron expedientes que coincidan con tu búsqueda.'
            : 'No hay expedientes registrados. Puedes crear uno nuevo usando el botón "Nuevo Expediente".'}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="table-light">
              <tr>
                <th>Número</th>
                <th>Asunto</th>
                <th>Fecha Recibido</th>
                <th>Notificación</th>
                <th>Resolución</th>
                <th>Docente</th>
                <th>Escuela</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expedientesFiltrados.map((expediente) => (
                <tr key={expediente.id}>
                  <td>{expediente.numero}</td>
                  <td>{expediente.asunto}</td>
                  <td>{formatearFecha(expediente.fecha_recibido)}</td>
                  <td>
                    {expediente.notificacion ? (
                      <a href={expediente.notificacion} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-file-earmark-text me-1"></i>Ver
                      </a>
                    ) : (
                      <span className="text-muted">Sin enlace</span>
                    )}
                  </td>
                  <td>
                    {expediente.resolucion ? (
                      <a href={expediente.resolucion} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-success">
                        <i className="bi bi-file-earmark-text me-1"></i>Ver
                      </a>
                    ) : (
                      <span className="text-muted">Sin enlace</span>
                    )}
                  </td>
                  <td>
                    {expediente.docentes && expediente.docentes.length > 0 ? (
                      <div className="docentes-list">
                        {expediente.docentes.map((docente, index) => (
                          <span key={docente.id} className="badge bg-light text-dark me-1 mb-1">
                            {`${docente.apellido}, ${docente.nombre}`}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {expediente.escuelas && expediente.escuelas.length > 0 ? (
                      <div className="escuelas-list">
                        {expediente.escuelas.map((escuela, index) => (
                          <span key={escuela.id} className="badge bg-light text-dark me-1 mb-1">
                            {escuela.nombre}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="action-buttons">
                    <Link to={`/expedientes/${expediente.id}`} className="btn btn-sm btn-info me-1">
                      <i className="bi bi-eye"></i>
                    </Link>
                    {isAdmin() && (
                      <Link to={`/expedientes/editar/${expediente.id}`} className="btn btn-sm btn-warning me-1">
                        <i className="bi bi-pencil"></i>
                      </Link>
                    )}
                    {isAdmin() && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(expediente.id, expediente.numero)}
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
                No tienes permisos para <strong>eliminar expedientes</strong>.
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

export default ExpedientesList;
