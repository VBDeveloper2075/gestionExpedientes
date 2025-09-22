import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DisposicionesService from '../../services/disposicionesServiceSupabase';
import DocentesService from '../../services/docentesServiceSupabase';
import EscuelasService from '../../services/escuelasServiceSupabase';
import { useAppContext } from '../../context/AppContext';
import Loader from '../common/Loader';

const DisposicionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();  const { loading, setLoading, showError, showSuccess } = useAppContext();
  
  const [docentes, setDocentes] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const [formData, setFormData] = useState({
    numero: '',
    fecha: '',
    dispo: '',
    docente_id: '',
    docentes: [],
    escuela_id: '',
    escuelas: [],
    cargo: '',
    motivo: '',
    enlace: ''
  });

  const isEditMode = Boolean(id);  // Cargar datos necesarios al montar el componente
  useEffect(() => {
    console.log("DisposicionForm - ID param:", id, "isEditMode:", isEditMode);
      const loadData = async () => {
      setLoading(true);
      try {
        // Cargar docentes y escuelas
        const docentesData = await DocentesService.getAll();
        const escuelasData = await EscuelasService.getAll();
        
        // Manejar respuesta de docentes (puede ser array directo o objeto con paginación)
        const docentesArray = Array.isArray(docentesData) ? docentesData : (docentesData.data || []);
        
        // Manejar respuesta de escuelas (puede ser array directo o objeto con paginación)
        const escuelasArray = Array.isArray(escuelasData) ? escuelasData : (escuelasData.data || []);
        
        setDocentes(docentesArray);
        setEscuelas(escuelasArray);
        
        // Si estamos en modo edición, cargar la disposición
        if (isEditMode) {
          console.log("Cargando disposición con ID:", id);
          const disposicionData = await DisposicionesService.getById(id);
          
          console.log("Datos de disposición cargados:", disposicionData);
          
          // Formatear la fecha para el input date
          const fecha = disposicionData.fecha_dispo
            ? new Date(disposicionData.fecha_dispo).toISOString().split('T')[0]
            : '';
          
          // Si tenemos docente_id pero no hay un array de docentes, lo creamos
          let docentesArray = disposicionData.docentes || [];
          if (disposicionData.docente_id && docentesArray.length === 0) {
            docentesArray = [disposicionData.docente_id];
          }
          
          // Si tenemos escuela_id pero no hay un array de escuelas, lo creamos
          let escuelasArray = disposicionData.escuelas || [];
          if (disposicionData.escuela_id && escuelasArray.length === 0) {
            escuelasArray = [disposicionData.escuela_id];
          }
          
          // Usamos los IDs para los selectores
          const docenteId = disposicionData.docente_id || '';
          const escuelaId = disposicionData.escuela_id || '';
          
          console.log("Estableciendo docenteId en el formulario:", docenteId);
          console.log("Estableciendo escuelaId en el formulario:", escuelaId);
          
          setFormData({
            ...disposicionData,
            fecha: fecha,
            docente_id: docenteId,
            docentes: docentesArray,
            escuela_id: escuelaId,
            escuelas: escuelasArray
          });
        }
      } catch (error) {
        showError('Error al cargar datos necesarios');
        console.error(error);
        navigate('/disposiciones');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, isEditMode, navigate, setLoading, showError]);

  // Manejar cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    const errores = [];
    
    if (!formData.numero?.trim()) {
      errores.push('El número de disposición es obligatorio');
    }
    
    if (!formData.fecha) {
      errores.push('La fecha es obligatoria');
    }
      if (!formData.dispo?.trim()) {
      errores.push('La disposición es obligatoria');
    }    
      if (!formData.docente_id && (!formData.docentes || formData.docentes.length === 0)) {
      errores.push('Debe seleccionar un docente');
    }
    
    if (!formData.escuela_id && (!formData.escuelas || formData.escuelas.length === 0)) {
      errores.push('Debe seleccionar una escuela');
    }
    
    if (errores.length > 0) {
      showError(errores.join('. '));
      return;
    }

    setLoading(true);    // Preparar datos para enviar al servidor
    const disposicionData = {
      numero: formData.numero.trim(),
      fecha: formData.fecha,
      dispo: formData.dispo.trim(),
      docente_id: formData.docente_id,
      docentes: formData.docente_id ? [formData.docente_id] : [],  // Convertir docente_id a array de docentes
      escuela_id: formData.escuela_id,
      escuelas: formData.escuela_id ? [formData.escuela_id] : [],  // Convertir escuela_id a array de escuelas
      cargo: formData.cargo || null,
      motivo: formData.motivo || null,
      enlace: formData.enlace || null
    };
    
    console.log('Enviando datos de disposición:', disposicionData);
    
    try {
      if (isEditMode) {
        await DisposicionesService.update(id, disposicionData);
        showSuccess(`Disposición ${formData.numero} actualizada correctamente`);
      } else {
        await DisposicionesService.create(disposicionData);
        showSuccess(`Disposición ${formData.numero} creada correctamente`);
      }
      
      navigate('/disposiciones');
    } catch (error) {
      const action = isEditMode ? 'actualizar' : 'crear';
      const errorMessage = error.response?.data?.error || `Error al ${action} la disposición`;
      console.error('Error completo:', error.response?.data || error);
      showError(errorMessage + (error.response?.data?.detalle ? `: ${error.response.data.detalle}` : ''));
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
        <h2>{isEditMode ? 'Editar Disposición' : 'Nueva Disposición'}</h2>
      </div>
        <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="numero" className="form-label required-field">Número</label>
            <input
              type="text"
              className="form-control"
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="fecha" className="form-label required-field">Fecha</label>
            <input
              type="date"
              className="form-control"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="dispo" className="form-label required-field">Disposición</label>
          <input
            type="text"
            className="form-control"
            id="dispo"
            name="dispo"
            value={formData.dispo || ''}
            onChange={handleChange}
            required
          />
        </div>        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="docente_id" className="form-label required-field">Docente</label>
            <select
              className="form-select"
              id="docente_id"
              name="docente_id"
              value={formData.docente_id || ''}
              onChange={(e) => {
                const value = e.target.value;
                handleChange(e);
                // También actualizamos el array de docentes para mantener compatibilidad
                if (value) {
                  setFormData(prev => ({
                    ...prev,
                    docentes: [value]
                  }));
                } else {
                  setFormData(prev => ({
                    ...prev,
                    docentes: []
                  }));
                }
              }}
              required
            >
              <option value="">-- Seleccione un docente --</option>
              {docentes.map(docente => (
                <option key={docente.id} value={docente.id}>
                  {`${docente.apellido}, ${docente.nombre}`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-md-6">
            <label htmlFor="escuela_id" className="form-label required-field">Escuela</label>
            <select
              className="form-select"
              id="escuela_id"
              name="escuela_id"
              value={formData.escuela_id || ''}
              onChange={(e) => {
                const value = e.target.value;
                handleChange(e);
                // También actualizamos el array de escuelas para mantener compatibilidad
                if (value) {
                  setFormData(prev => ({
                    ...prev,
                    escuelas: [value]
                  }));
                } else {
                  setFormData(prev => ({
                    ...prev,
                    escuelas: []
                  }));
                }
              }}
              required
            >
              <option value="">-- Seleccione una escuela --</option>
              {escuelas.map(escuela => (
                <option key={escuela.id} value={escuela.id}>
                  {`Nº ${escuela.numero || 'S/N'} - ${escuela.nombre}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="cargo" className="form-label">Cargo</label>
          <input
            type="text"
            className="form-control"
            id="cargo"
            name="cargo"
            value={formData.cargo || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="motivo" className="form-label">Motivo</label>
          <textarea
            className="form-control"
            id="motivo"
            name="motivo"
            rows="5"
            value={formData.motivo || ''}
            onChange={handleChange}
          ></textarea>
        </div>
        
        <div className="mb-3">
          <label htmlFor="enlace" className="form-label">Enlace</label>
          <input
            type="text"
            className="form-control"
            id="enlace"
            name="enlace"
            value={formData.enlace || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/disposiciones')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Guardar Cambios' : 'Crear Disposición'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DisposicionForm;
