import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ExpedientesService from '../../services/expedientesServiceSupabase';
import DocentesService from '../../services/docentesServiceSupabase';
import EscuelasService from '../../services/escuelasServiceSupabase';
import { useAppContext } from '../../context/AppContext';
import Loader from '../common/Loader';
import Select from 'react-select';

const ExpedienteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, setLoading, showError, showSuccess } = useAppContext();
  
  const [expediente, setExpediente] = useState(null);
  const [docentesOptions, setDocentesOptions] = useState([]);
  const [escuelasOptions, setEscuelasOptions] = useState([]);
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [selectedEscuela, setSelectedEscuela] = useState(null);
  
  // Cargar expediente y opciones al montar el componente
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Cargar expediente, docentes y escuelas en paralelo
        const [expedienteData, docentesData, escuelasData] = await Promise.all([
          ExpedientesService.getById(id),
          DocentesService.getAll(),
          EscuelasService.getAll()
        ]);
        
        setExpediente(expedienteData);
        
        // Manejar respuesta de docentes (puede ser array directo o objeto con paginación)
        const docentesArray = Array.isArray(docentesData) ? docentesData : (docentesData.data || []);
        
        // Convertir docentes a opciones para react-select
        const docentesOpts = docentesArray
          .filter(docente => !expedienteData.docentes.some(d => d.id === docente.id)) // Excluir docentes ya asociados
          .map(docente => ({
            value: docente.id,
            label: `${docente.apellido}, ${docente.nombre}`
          }));
        setDocentesOptions(docentesOpts);
        
        // Manejar respuesta de escuelas (puede ser array directo o objeto con paginación)
        const escuelasArray = Array.isArray(escuelasData) ? escuelasData : (escuelasData.data || []);
        
        // Convertir escuelas a opciones para react-select
        const escuelasOpts = escuelasArray
          .filter(escuela => !expedienteData.escuelas.some(e => e.id === escuela.id)) // Excluir escuelas ya asociadas
          .map(escuela => ({
            value: escuela.id,
            label: escuela.nombre
          }));
        setEscuelasOptions(escuelasOpts);
      } catch (error) {
        showError('Error al cargar los datos del expediente');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  // Formatear fecha
  const formatearFecha = (fecha) => {
    return fecha ? new Date(fecha).toLocaleDateString() : '';
  };
  
  // Asociar nuevo docente al expediente
  const handleAsociarDocente = async () => {
    if (!selectedDocente) return;
    
    setLoading(true);
    try {
      // Aquí iría la llamada a la API para asociar el docente
      // Por ahora simulamos la actualización localmente
      const updatedExpediente = { ...expediente };
      const docente = {
        id: selectedDocente.value,
        nombre: selectedDocente.label.split(', ')[1],
        apellido: selectedDocente.label.split(', ')[0]
      };
      
      updatedExpediente.docentes = [...expediente.docentes, docente];
      setExpediente(updatedExpediente);
      
      // Eliminar la opción seleccionada
      setDocentesOptions(docentesOptions.filter(opt => opt.value !== selectedDocente.value));
      setSelectedDocente(null);
      
      showSuccess('Docente asociado correctamente');
    } catch (error) {
      showError('Error al asociar el docente');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Asociar nueva escuela al expediente
  const handleAsociarEscuela = async () => {
    if (!selectedEscuela) return;
    
    setLoading(true);
    try {
      // Aquí iría la llamada a la API para asociar la escuela
      // Por ahora simulamos la actualización localmente
      const updatedExpediente = { ...expediente };
      const escuela = {
        id: selectedEscuela.value,
        nombre: selectedEscuela.label
      };
      
      updatedExpediente.escuelas = [...expediente.escuelas, escuela];
      setExpediente(updatedExpediente);
      
      // Eliminar la opción seleccionada
      setEscuelasOptions(escuelasOptions.filter(opt => opt.value !== selectedEscuela.value));
      setSelectedEscuela(null);
      
      showSuccess('Escuela asociada correctamente');
    } catch (error) {
      showError('Error al asociar la escuela');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Desasociar docente del expediente
  const handleDesasociarDocente = async (docenteId) => {
    if (!window.confirm('¿Estás seguro de que deseas desasociar este docente?')) return;
    
    setLoading(true);
    try {
      // Aquí iría la llamada a la API para desasociar el docente
      // Por ahora simulamos la actualización localmente
      const docenteEliminado = expediente.docentes.find(d => d.id === docenteId);
      
      const updatedExpediente = { ...expediente };
      updatedExpediente.docentes = expediente.docentes.filter(d => d.id !== docenteId);
      setExpediente(updatedExpediente);
      
      // Agregar el docente nuevamente a las opciones
      if (docenteEliminado) {
        setDocentesOptions([
          ...docentesOptions,
          {
            value: docenteEliminado.id,
            label: `${docenteEliminado.apellido}, ${docenteEliminado.nombre}`
          }
        ]);
      }
      
      showSuccess('Docente desasociado correctamente');
    } catch (error) {
      showError('Error al desasociar el docente');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Desasociar escuela del expediente
  const handleDesasociarEscuela = async (escuelaId) => {
    if (!window.confirm('¿Estás seguro de que deseas desasociar esta escuela?')) return;
    
    setLoading(true);
    try {
      // Aquí iría la llamada a la API para desasociar la escuela
      // Por ahora simulamos la actualización localmente
      const escuelaEliminada = expediente.escuelas.find(e => e.id === escuelaId);
      
      const updatedExpediente = { ...expediente };
      updatedExpediente.escuelas = expediente.escuelas.filter(e => e.id !== escuelaId);
      setExpediente(updatedExpediente);
      
      // Agregar la escuela nuevamente a las opciones
      if (escuelaEliminada) {
        setEscuelasOptions([
          ...escuelasOptions,
          {
            value: escuelaEliminada.id,
            label: escuelaEliminada.nombre
          }
        ]);
      }
      
      showSuccess('Escuela desasociada correctamente');
    } catch (error) {
      showError('Error al desasociar la escuela');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <Loader />;
  }
  
  if (!expediente) {
    return (
      <div className="alert alert-warning">
        No se encontró el expediente solicitado o está cargando.
      </div>
    );
  }
  
  return (
    <div className="expediente-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Detalles del Expediente: {expediente.numero}</h2>
        <div>
          <Link to={`/expedientes/editar/${id}`} className="btn btn-warning me-2">
            <i className="bi bi-pencil me-1"></i>
            Editar
          </Link>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/expedientes')}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Volver
          </button>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h5>Información Básica</h5>
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <th scope="row">Número:</th>
                    <td>{expediente.numero}</td>
                  </tr>
                  <tr>
                    <th scope="row">Asunto:</th>
                    <td>{expediente.asunto}</td>
                  </tr>
                  <tr>
                    <th scope="row">Fecha de Recepción:</th>
                    <td>{formatearFecha(expediente.fecha_recibido)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Pase:</th>
                    <td>{expediente.pase || '-'}</td>
                  </tr>
                  <tr>
                    <th scope="row">Observaciones:</th>
                    <td>{expediente.observaciones || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h5>Enlaces</h5>
              <div className="d-flex flex-column gap-2 mb-3">
                <div>
                  <strong>Notificación:</strong>{' '}
                  {expediente.notificacion ? (
                    <a href={expediente.notificacion} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-file-earmark-text me-1"></i>Ver
                    </a>
                  ) : (
                    <span className="text-muted">No disponible</span>
                  )}
                </div>
                <div>
                  <strong>Resolución:</strong>{' '}
                  {expediente.resolucion ? (
                    <a href={expediente.resolucion} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-success">
                      <i className="bi bi-file-earmark-text me-1"></i>Ver
                    </a>
                  ) : (
                    <span className="text-muted">No disponible</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Docentes Asociados</h5>
              <span className="badge bg-primary">{expediente.docentes.length}</span>
            </div>
            <div className="card-body">              {expediente.docentes.length > 0 ? (
                <div className="docentes-asociados-list" style={{maxHeight: '250px', overflowY: 'auto'}}>
                  <ul className="list-group">
                    {expediente.docentes.map(docente => (
                      <li key={docente.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span className="docente-nombre">{`${docente.apellido}, ${docente.nombre}`}</span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDesasociarDocente(docente.id)}
                          title="Desasociar docente"
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted">No hay docentes asociados a este expediente.</p>
              )}
              
              <div className="mt-3">
                <div className="input-group">
                  <Select
                    id="new-docente"
                    options={docentesOptions}
                    value={selectedDocente}
                    onChange={setSelectedDocente}
                    placeholder="Seleccionar docente..."
                    className="react-select-container flex-grow-1"
                    classNamePrefix="react-select"
                    isClearable
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleAsociarDocente}
                    disabled={!selectedDocente}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Asociar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Escuelas Asociadas</h5>
              <span className="badge bg-primary">{expediente.escuelas.length}</span>
            </div>
            <div className="card-body">              {expediente.escuelas.length > 0 ? (
                <div className="escuelas-asociadas-list" style={{maxHeight: '250px', overflowY: 'auto'}}>
                  <ul className="list-group">
                    {expediente.escuelas.map(escuela => (
                      <li key={escuela.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span className="escuela-nombre">{escuela.nombre}</span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDesasociarEscuela(escuela.id)}
                          title="Desasociar escuela"
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted">No hay escuelas asociadas a este expediente.</p>
              )}
              
              <div className="mt-3">
                <div className="input-group">
                  <Select
                    id="new-escuela"
                    options={escuelasOptions}
                    value={selectedEscuela}
                    onChange={setSelectedEscuela}
                    placeholder="Seleccionar escuela..."
                    className="react-select-container flex-grow-1"
                    classNamePrefix="react-select"
                    isClearable
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleAsociarEscuela}
                    disabled={!selectedEscuela}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Asociar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpedienteDetail;