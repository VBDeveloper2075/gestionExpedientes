import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import EscuelasService from '../../services/escuelasService';
import { useAppContext } from '../../context/AppContext';
import Loader from '../common/Loader';

const EscuelaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [escuela, setEscuela] = useState(null);
  const { loading, setLoading, showError, showSuccess } = useAppContext();

  console.log('🔍 EscuelaDetail montado con ID:', id);

  // Cargar escuela al montar el componente
  useEffect(() => {
    const loadEscuela = async () => {
      if (!id) {
        console.log('❌ No hay ID para cargar');
        return;
      }
      
      console.log('📡 Cargando escuela con ID:', id);
      setLoading(true);
      try {
        const data = await EscuelasService.getById(id);
        console.log('✅ Escuela cargada:', data);
        setEscuela(data);
      } catch (error) {
        console.error('❌ Error al cargar escuela:', error);
        showError('Error al cargar los datos de la escuela');
      } finally {
        setLoading(false);
      }
    };

    loadEscuela();
  }, [id, setLoading, showError]);

  // Función para eliminar escuela
  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la escuela ${escuela.nombre}?`)) {
      setLoading(true);
      try {
        await EscuelasService.delete(id);
        showSuccess(`Escuela ${escuela.nombre} eliminada correctamente`);
        navigate('/escuelas');
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

  if (!escuela) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        No se encontró la escuela solicitada.
        <Link to="/escuelas" className="btn btn-outline-primary ms-3">
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="escuela-detail">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Detalles de la Escuela</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/escuelas">Escuelas</Link>
              </li>
              <li className="breadcrumb-item active">
                {escuela.nombre}
              </li>
            </ol>
          </nav>
        </div>
        <div className="btn-group">
          <Link 
            to={`/escuelas/editar/${escuela.id}`} 
            className="btn btn-warning"
          >
            <i className="bi bi-pencil me-2"></i>
            Editar
          </Link>
          <button 
            onClick={handleDelete}
            className="btn btn-danger"
          >
            <i className="bi bi-trash me-2"></i>
            Eliminar
          </button>
        </div>
      </div>

      {/* Información de la escuela */}
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-building me-2"></i>
                Información de la Escuela
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nombre:</label>
                    <p className="form-control-plaintext">{escuela.nombre}</p>
                  </div>
                </div>
              </div>

              {escuela.direccion && (
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Dirección:</label>
                      <p className="form-control-plaintext">{escuela.direccion}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="row">
                {escuela.telefono && (
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Teléfono:</label>
                      <p className="form-control-plaintext">
                        <a href={`tel:${escuela.telefono}`}>{escuela.telefono}</a>
                      </p>
                    </div>
                  </div>
                )}

                {escuela.email && (
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Email:</label>
                      <p className="form-control-plaintext">
                        <a href={`mailto:${escuela.email}`}>{escuela.email}</a>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {escuela.director && (
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Director:</label>
                      <p className="form-control-plaintext">{escuela.director}</p>
                    </div>
                  </div>
                </div>
              )}

              {escuela.nivel && (
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Nivel:</label>
                      <p className="form-control-plaintext">{escuela.nivel}</p>
                    </div>
                  </div>
                </div>
              )}

              {escuela.tipo && (
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Tipo:</label>
                      <p className="form-control-plaintext">{escuela.tipo}</p>
                    </div>
                  </div>
                </div>
              )}

              {escuela.observaciones && (
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Observaciones:</label>
                      <p className="form-control-plaintext">{escuela.observaciones}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Información Adicional
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">ID:</label>
                <p className="form-control-plaintext">#{escuela.id}</p>
              </div>

              {escuela.codigo && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Código:</label>
                  <p className="form-control-plaintext">{escuela.codigo}</p>
                </div>
              )}

              {escuela.cue && (
                <div className="mb-3">
                  <label className="form-label fw-bold">CUE:</label>
                  <p className="form-control-plaintext">{escuela.cue}</p>
                </div>
              )}

              {escuela.fecha_creacion && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Fecha de Registro:</label>
                  <p className="form-control-plaintext">
                    {new Date(escuela.fecha_creacion).toLocaleDateString('es-AR')}
                  </p>
                </div>
              )}

              {escuela.fecha_actualizacion && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Última Actualización:</label>
                  <p className="form-control-plaintext">
                    {new Date(escuela.fecha_actualizacion).toLocaleDateString('es-AR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="card mt-3">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-gear me-2"></i>
                Acciones
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link 
                  to={`/escuelas/editar/${escuela.id}`} 
                  className="btn btn-warning"
                >
                  <i className="bi bi-pencil me-2"></i>
                  Editar Escuela
                </Link>
                <Link 
                  to="/escuelas" 
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver a la Lista
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscuelaDetail;
