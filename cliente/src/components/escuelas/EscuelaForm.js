import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EscuelasService from '../../services/escuelasServiceSupabase';
import { useAppContext } from '../../context/AppContext';
import Loader from '../common/Loader';

const EscuelaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, setLoading, showError, showSuccess } = useAppContext();
  
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: ''
  });

  const isEditMode = Boolean(id);
  // Cargar los datos de la escuela si estamos en modo edición
  useEffect(() => {
    console.log("EscuelaForm - ID param:", id, "isEditMode:", isEditMode);
    
    if (isEditMode) {
      const loadEscuela = async () => {
        setLoading(true);
        try {
          console.log("Cargando escuela con ID:", id);
          const escuelaData = await EscuelasService.getById(id);
          setFormData(escuelaData);
        } catch (error) {
          showError('Error al cargar los datos de la escuela');
          console.error(error);
          navigate('/escuelas');
        } finally {
          setLoading(false);
        }
      };
      
      loadEscuela();
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
    if (!formData.nombre.trim()) {
      showError('El nombre de la escuela es obligatorio');
      return;
    }

    setLoading(true);
    
    try {
      if (isEditMode) {
        await EscuelasService.update(id, formData);
        showSuccess(`Escuela ${formData.nombre} actualizada correctamente`);
      } else {
        await EscuelasService.create(formData);
        showSuccess(`Escuela ${formData.nombre} creada correctamente`);
      }
      
      navigate('/escuelas');
    } catch (error) {
      const action = isEditMode ? 'actualizar' : 'crear';
      showError(`Error al ${action} la escuela`);
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
        <h2>{isEditMode ? 'Editar Escuela' : 'Nueva Escuela'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
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
        
        <div className="mb-3">
          <label htmlFor="direccion" className="form-label">Dirección</label>
          <input
            type="text"
            className="form-control"
            id="direccion"
            name="direccion"
            value={formData.direccion || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="row mb-3">
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
        </div>
        
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/escuelas')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Guardar Cambios' : 'Crear Escuela'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EscuelaForm;
