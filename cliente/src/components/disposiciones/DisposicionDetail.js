import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import DisposicionesService from '../../services/disposicionesServiceSupabase';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import '../../styles/Disposiciones.css';

const DisposicionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, setLoading, showError, showSuccess } = useAppContext();
  const { isAdmin } = useAuth();
  
  const [disposicion, setDisposicion] = useState(null);

  // Cargar los datos de la disposición
  useEffect(() => {
    const loadDisposicion = async () => {
      setLoading(true);
      try {
        const data = await DisposicionesService.getById(id);
        setDisposicion(data);
      } catch (error) {
        showError('Error al cargar los datos de la disposición');
        console.error(error);
        navigate('/disposiciones');
      } finally {
        setLoading(false);
      }
    };
    
    loadDisposicion();
  }, [id, navigate, setLoading, showError]);

  // Función para formatear la fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  // Función para eliminar disposición
  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la disposición ${disposicion.numero}?`)) {
      setLoading(true);
      try {
        await DisposicionesService.delete(id);
        showSuccess(`Disposición ${disposicion.numero} eliminada correctamente`);
        navigate('/disposiciones');
      } catch (error) {
        showError('Error al eliminar la disposición');
        console.error(error);
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!disposicion) {
    return (
      <div className="alert alert-warning">
        La disposición solicitada no existe o ha sido eliminada.
      </div>
    );
  }

  return (
    <div className="disposicion-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Detalles de Disposición</h2>
        <div>
          <Link to="/disposiciones" className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-left me-1"></i>
            Volver
          </Link>
          {isAdmin() && (
            <>
              <Link to={`/disposiciones/editar/${disposicion.id}`} className="btn btn-warning me-2">
                <i className="bi bi-pencil me-1"></i>
                Editar
              </Link>
              <button className="btn btn-danger" onClick={handleDelete}>
                <i className="bi bi-trash me-1"></i>
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">          <div className="row">
            <div className="col-md-6 mb-3">
              <h5 className="text-muted">Número</h5>
              <p className="fs-5">{disposicion.numero}</p>
            </div>
            <div className="col-md-6 mb-3">
              <h5 className="text-muted">Fecha</h5>
              <p className="fs-5">{formatearFecha(disposicion.fecha_dispo)}</p>
            </div>
          </div>

          <div className="mb-3">
            <h5 className="text-muted">Disposición</h5>
            <p>{disposicion.dispo || '-'}</p>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <h5 className="text-muted">Apellido</h5>
              <p>{disposicion.docente_nombre || '-'}</p>
            </div>
            <div className="col-md-6">
              <h5 className="text-muted">Cargo</h5>
              <p>{disposicion.cargo || '-'}</p>
            </div>
          </div>

          {disposicion.motivo && (
            <div className="mb-3">
              <h5 className="text-muted">Motivo</h5>
              <div className="p-3 bg-light rounded">
                <p className="white-space-pre-wrap mb-0">{disposicion.motivo}</p>
              </div>
            </div>
          )}

          {disposicion.enlace && (
            <div className="mb-3">
              <h5 className="text-muted">Enlace</h5>
              <p>
                <a href={disposicion.enlace} target="_blank" rel="noopener noreferrer" className="link-primary">
                  {disposicion.enlace}
                </a>
              </p>
            </div>
          )}

          <div className="row mt-4">
            <div className="col-md-6">
              <h5 className="text-muted">Fecha de Creación</h5>
              <p>{formatearFecha(disposicion.fecha_creacion)}</p>
            </div>
            <div className="col-md-6">
              <h5 className="text-muted">Última Actualización</h5>
              <p>{disposicion.fecha_actualizacion ? formatearFecha(disposicion.fecha_actualizacion) : '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisposicionDetail;
