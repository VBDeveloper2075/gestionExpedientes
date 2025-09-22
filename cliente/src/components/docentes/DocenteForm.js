import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DocentesService from '../../services/docentesServiceSupabase';
import { useAppContext } from '../../context/AppContext';
import Loader from '../common/Loader';

const DocenteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, setLoading, showError, showSuccess } = useAppContext();
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: ''
  });

  const isEditMode = Boolean(id);

  // Cargar los datos del docente si estamos en modo edición
  useEffect(() => {
    if (isEditMode) {
      const loadDocente = async () => {
        setLoading(true);
        try {
          const docenteData = await DocentesService.getById(id);
          setFormData(docenteData);
        } catch (error) {
          showError('Error al cargar los datos del docente');
          console.error(error);
          navigate('/docentes');
        } finally {
          setLoading(false);
        }
      };
      
      loadDocente();
    }
  }, [id, isEditMode, navigate, setLoading, showError]);

  // Manejar cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.dni.trim()) {
      showError('Los campos Nombre, Apellido y DNI son obligatorios');
      return;
    }

    setLoading(true);
    
    try {
      if (isEditMode) {
        await DocentesService.update(id, formData);
        showSuccess(`Docente ${formData.nombre} ${formData.apellido} actualizado correctamente`);
      } else {
        await DocentesService.create(formData);
        showSuccess(`Docente ${formData.nombre} ${formData.apellido} creado correctamente`);
      }
      
      navigate('/docentes');
    } catch (error) {
      const action = isEditMode ? 'actualizar' : 'crear';
      showError(`Error al ${action} el docente`);
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
        <h2>{isEditMode ? 'Editar Docente' : 'Nuevo Docente'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="nombre" className="form-label required-field">Nombre</label>
            <input
              type="text"
              className="form-control"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="apellido" className="form-label required-field">Apellido</label>
            <input
              type="text"
              className="form-control"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="dni" className="form-label required-field">DNI</label>
          <input
            type="text"
            className="form-control"
            id="dni"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="telefono" className="form-label">Teléfono</label>
            <input
              type="text"
              className="form-control"
              id="telefono"
              name="telefono"
              value={formData.telefono || ''}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/docentes')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Guardar Cambios' : 'Crear Docente'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocenteForm;
