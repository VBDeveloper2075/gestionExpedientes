import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DocentesService from '../../services/docentesService';
import { useAppContext } from '../../context/AppContext';
import Loader from '../common/Loader';

const DocenteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [docente, setDocente] = useState(null);
  const { loading, setLoading, showError, showSuccess } = useAppContext();

  console.log('🔍 DocenteDetail montado con ID:', id);

  // Cargar docente al montar el componente
  useEffect(() => {
    const loadDocente = async () => {
      if (!id) {
        console.log('❌ No hay ID para cargar');
        return;
      }
      
      console.log('📡 Cargando docente con ID:', id);
      setLoading(true);
      try {
        const data = await DocentesService.getById(id);
        console.log('✅ Docente cargado:', data);
        setDocente(data);
      } catch (error) {
        console.error('❌ Error al cargar docente:', error);
        showError('Error al cargar los datos del docente');
      } finally {
        setLoading(false);
      }
    };

    loadDocente();
  }, [id, setLoading, showError]);

  // Función para eliminar docente
  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al docente ${docente.apellido}, ${docente.nombre}?`)) {
      setLoading(true);
      try {
        await DocentesService.delete(id);
        showSuccess(`Docente ${docente.apellido}, ${docente.nombre} eliminado correctamente`);
        navigate('/docentes');
      } catch (error) {
        showError('Error al eliminar el docente');
        console.error(error);
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!docente) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        No se encontró el docente solicitado.
        <Link to="/docentes" className="btn btn-outline-primary ms-3">
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="docente-detail">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Detalles del Docente</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/docentes">Docentes</Link>
              </li>
              <li className="breadcrumb-item active">
                {docente.apellido}, {docente.nombre}
              </li>
            </ol>
          </nav>
        </div>
        <div className="btn-group">
          <Link 
            to={`/docentes/editar/${docente.id}`} 
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

      {/* Información del docente */}
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-person me-2"></i>
                Información Personal
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nombre:</label>
                    <p className="form-control-plaintext">{docente.nombre}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Apellido:</label>
                    <p className="form-control-plaintext">{docente.apellido}</p>
                  </div>
                </div>
              </div>

              {docente.dni && (
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">DNI:</label>
                      <p className="form-control-plaintext">{docente.dni}</p>
                    </div>
                  </div>
                </div>
              )}

              {docente.email && (
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Email:</label>
                      <p className="form-control-plaintext">
                        <a href={`mailto:${docente.email}`}>{docente.email}</a>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {docente.telefono && (
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Teléfono:</label>
                      <p className="form-control-plaintext">
                        <a href={`tel:${docente.telefono}`}>{docente.telefono}</a>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {docente.direccion && (
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Dirección:</label>
                      <p className="form-control-plaintext">{docente.direccion}</p>
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
                <p className="form-control-plaintext">#{docente.id}</p>
              </div>

              {docente.fecha_creacion && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Fecha de Registro:</label>
                  <p className="form-control-plaintext">
                    {new Date(docente.fecha_creacion).toLocaleDateString('es-AR')}
                  </p>
                </div>
              )}

              {docente.fecha_actualizacion && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Última Actualización:</label>
                  <p className="form-control-plaintext">
                    {new Date(docente.fecha_actualizacion).toLocaleDateString('es-AR')}
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
                  to={`/docentes/editar/${docente.id}`} 
                  className="btn btn-warning"
                >
                  <i className="bi bi-pencil me-2"></i>
                  Editar Docente
                </Link>
                <Link 
                  to="/docentes" 
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

export default DocenteDetail;
