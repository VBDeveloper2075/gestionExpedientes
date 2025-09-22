import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExpedientesService from '../../services/expedientesServiceSupabase';
import DocentesService from '../../services/docentesServiceSupabase';
import EscuelasService from '../../services/escuelasServiceSupabase';
import { useAppContext } from '../../context/AppContext';
import Loader from '../common/Loader';
import Select from 'react-select';

const ExpedienteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, setLoading, showError, showSuccess } = useAppContext();
  
  const [docentesOptions, setDocentesOptions] = useState([]);
  const [escuelasOptions, setEscuelasOptions] = useState([]);
  const [formData, setFormData] = useState({
    numero: '',
    asunto: '',
    fecha_recibido: '',
    notificacion: '',
    resolucion: '',
    pase: '',
    docente_id: '', // Mantenemos por compatibilidad
    escuela_id: '', // Mantenemos por compatibilidad
    docentes: [], // Array para selección múltiple
    escuelas: [], // Array para selección múltiple
    observaciones: ''
  });

  const isEditMode = Boolean(id);  // Cargar datos necesarios al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar docentes y escuelas
        const [docentesData, escuelasData] = await Promise.all([
          DocentesService.getAll(),
          EscuelasService.getAll()
        ]);
        
        // Manejar respuesta de docentes (puede ser array directo o objeto con paginación)
        const docentesArray = Array.isArray(docentesData) ? docentesData : (docentesData.data || []);
        
        // Convertir los datos en opciones para react-select
        const docentesOpts = docentesArray.map(docente => ({
          value: docente.id,
          label: `${docente.apellido}, ${docente.nombre}`
        }));
        
        // Manejar respuesta de escuelas (puede ser array directo o objeto con paginación)
        const escuelasArray = Array.isArray(escuelasData) ? escuelasData : (escuelasData.data || []);
        
        const escuelasOpts = escuelasArray.map(escuela => ({
          value: escuela.id,
          label: escuela.nombre
        }));
        
        setDocentesOptions(docentesOpts);
        setEscuelasOptions(escuelasOpts);
        
        // Si estamos en modo edición, cargar el expediente
        if (isEditMode) {
          try {
            const expedienteData = await ExpedientesService.getById(id);
            
            // Formatear la fecha para el input date
            const fechaRecibido = expedienteData.fecha_recibido
              ? new Date(expedienteData.fecha_recibido).toISOString().split('T')[0]
              : '';
              
            // Preparamos los arrays de docentes y escuelas para react-select
            const docentesSeleccionados = expedienteData.docentes?.map(docente => ({
              value: docente.id,
              label: `${docente.apellido}, ${docente.nombre}`
            })) || [];
            
            const escuelasSeleccionadas = expedienteData.escuelas?.map(escuela => ({
              value: escuela.id,
              label: escuela.nombre
            })) || [];
              
            setFormData({
              numero: expedienteData.numero || '',
              asunto: expedienteData.asunto || '',
              fecha_recibido: fechaRecibido,
              notificacion: expedienteData.notificacion || '',
              resolucion: expedienteData.resolucion || '',
              pase: expedienteData.pase || '',
              docente_id: expedienteData.docente_id || '', // Mantenemos por compatibilidad
              escuela_id: expedienteData.escuela_id || '', // Mantenemos por compatibilidad
              docentes: docentesSeleccionados,
              escuelas: escuelasSeleccionadas,
              observaciones: expedienteData.observaciones || ''
            });
          } catch (expedienteError) {
            console.error('Error al cargar el expediente:', expedienteError);
            showError(`No se pudo cargar el expediente. ${expedienteError.message}`);
            // No redirigimos automáticamente para evitar ciclos
          }
        }
      } catch (error) {
        showError('Error al cargar datos necesarios');
        console.error(error);
        // No redirigimos automáticamente para evitar ciclos
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);  // Manejar cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Para los campos select, convertir valores vacíos a null o cadena vacía según corresponda
    const newValue = (name === 'docente_id' || name === 'escuela_id') && value === '' 
      ? null 
      : value;
      
    setFormData({
      ...formData,
      [name]: newValue
    });
  };
  
  // Manejar cambios en los selects múltiples de react-select
  const handleSelectChange = (selectedOptions, { name }) => {
    setFormData({
      ...formData,
      [name]: selectedOptions || []
    });
  };  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Iniciando envío del formulario');
    console.log('Formulario completo:', formData);
      // Validaciones básicas
    if (!formData.numero.trim() || !formData.asunto.trim() || !formData.fecha_recibido) {
      showError('Número, asunto y fecha de recepción son obligatorios');
      return;
    }
    
    // Validación básica de URL para los enlaces (si se proporcionan)
    const validateUrl = (url) => {
      if (!url) return true;
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    };
    
    if (formData.notificacion && !validateUrl(formData.notificacion)) {
      showError('El enlace de notificación no es una URL válida');
      return;
    }
    
    if (formData.resolucion && !validateUrl(formData.resolucion)) {
      showError('El enlace de resolución no es una URL válida');
      return;
    }    setLoading(true);
      try {
      // Preparar datos para enviar al servidor
      const docentesArray = Array.isArray(formData.docentes) ? formData.docentes.map(doc => doc.value) : [];
      const escuelasArray = Array.isArray(formData.escuelas) ? formData.escuelas.map(esc => esc.value) : [];
      
      console.log('Docentes seleccionados:', formData.docentes);
      console.log('Escuelas seleccionadas:', formData.escuelas);
      console.log('Arrays a enviar - docentes:', docentesArray, 'escuelas:', escuelasArray);
        // Formatear fecha correctamente
      let fechaFormateada = formData.fecha_recibido;
      try {
        if (formData.fecha_recibido) {
          const fechaObj = new Date(formData.fecha_recibido);
          if (!isNaN(fechaObj.getTime())) {
            fechaFormateada = fechaObj.toISOString().split('T')[0];
            console.log('Fecha formateada para envío:', fechaFormateada);
          }
        }
      } catch (error) {
        console.error('Error al formatear la fecha:', error);
      }

      const expedienteToSend = {
        numero: formData.numero.trim(),
        asunto: formData.asunto.trim(),
        fecha_recibido: fechaFormateada,
        notificacion: formData.notificacion || null,
        resolucion: formData.resolucion || null,
        pase: formData.pase || null,        docente_id: formData.docente_id || null, // Mantenemos para compatibilidad
        escuela_id: formData.escuela_id || null, // Mantenemos para compatibilidad
        observaciones: formData.observaciones || null,
        // Verificar y procesar los arrays antes de enviar
        docentes: Array.isArray(docentesArray) ? docentesArray : [],
        escuelas: Array.isArray(escuelasArray) ? escuelasArray : []
      };
      
      console.log('Datos a enviar al servidor:', JSON.stringify(expedienteToSend, null, 2));
        if (isEditMode) {
        await ExpedientesService.update(id, expedienteToSend);
        showSuccess(`Expediente ${formData.numero} actualizado correctamente`);
      } else {
        const nuevoExpediente = await ExpedientesService.create(expedienteToSend);
        console.log('Expediente creado:', nuevoExpediente);
        showSuccess(`Expediente ${formData.numero} creado correctamente`);
      }
      
      // Usar reemplazar para forzar una recarga completa
      navigate('/expedientes', { replace: true });
    } catch (error) {
      const action = isEditMode ? 'actualizar' : 'crear';
      showError(`Error al ${action} el expediente`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

    if (loading) {
      return <Loader />;
    }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{isEditMode ? 'Editar Expediente' : 'Nuevo Expediente'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="numero" className="form-label required-field">Número de Expediente</label>
            <input
              type="text"
              className="form-control"
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              required
            />
          </div>          <div className="col-md-6">
            <label htmlFor="fecha_recibido" className="form-label required-field">Fecha de Recepción</label>
            <input
              type="date"
              className="form-control"
              id="fecha_recibido"
              name="fecha_recibido"
              value={formData.fecha_recibido}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="asunto" className="form-label required-field">Asunto</label>
          <input
            type="text"
            className="form-control"
            id="asunto"
            name="asunto"
            value={formData.asunto}
            onChange={handleChange}
            required
          />
        </div>
          <div className="row mb-3">          <div className="col-md-4">
            <div className="mb-3">
              <label htmlFor="notificacion" className="form-label">Enlace de Notificación</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-link-45deg"></i></span>              <input
                type="text"
                className="form-control"
                id="notificacion"
                name="notificacion"
                placeholder="URL de Google Drive para notificación"
                value={formData.notificacion || ''}
                onChange={handleChange}
              />
              </div>
              <small className="text-muted">Ingrese el enlace al archivo de Google Drive</small>
            </div>
            <div className="mb-3">
              <label htmlFor="resolucion" className="form-label">Enlace de Resolución</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-link-45deg"></i></span>              <input
                type="text"
                className="form-control"
                id="resolucion"
                name="resolucion"
                placeholder="URL de Google Drive para resolución"
                value={formData.resolucion || ''}
                onChange={handleChange}
              />
              </div>
              <small className="text-muted">Ingrese el enlace al archivo de Google Drive</small>
            </div>
            <div className="mb-3">
              <label htmlFor="pase" className="form-label">Pase a</label>
              <input
                type="text"
                className="form-control"
                id="pase"
                name="pase"
                value={formData.pase || ''}
                onChange={handleChange}
              />
            </div>
          </div>          <div className="col-md-4">
            <label htmlFor="docentes" className="form-label">Docentes</label>
            <Select
              id="docentes"
              name="docentes"
              isMulti
              options={docentesOptions}
              value={formData.docentes}
              onChange={(selected) => handleSelectChange(selected, { name: 'docentes' })}
              placeholder="-- Seleccione docentes --"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="escuelas" className="form-label">Escuelas</label>
            <Select
              id="escuelas"
              name="escuelas"
              isMulti
              options={escuelasOptions}
              value={formData.escuelas}
              onChange={(selected) => handleSelectChange(selected, { name: 'escuelas' })}
              placeholder="-- Seleccione escuelas --"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="observaciones" className="form-label">Observaciones</label>          <textarea
            className="form-control"
            id="observaciones"
            name="observaciones"
            rows="3"
            value={formData.observaciones || ''}
            onChange={handleChange}
          ></textarea>
        </div>
        
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/expedientes')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Guardar Cambios' : 'Crear Expediente'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpedienteForm;
