import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ExpedientesList from '../components/expedientes/ExpedientesList';
import ExpedienteForm from '../components/expedientes/ExpedienteForm';
import ExpedienteDetail from '../components/expedientes/ExpedienteDetail';

const Expedientes = ({ action: propAction }) => {
  const { action: paramAction, id } = useParams();
  
  // Usar action de props o de parámetros URL
  const action = propAction || paramAction;

  // Usamos useMemo para evitar re-renderings innecesarios
  const component = useMemo(() => {
    if (action === 'nuevo') {
      return <ExpedienteForm />;
    } else if (action === 'editar') {
      return <ExpedienteForm />;
    } else if (id) {
      // Si hay un ID pero no es editar ni nuevo, mostrar detalle
      return <ExpedienteDetail />;
    } else {
      return <ExpedientesList />;
    }
  }, [action, id]);
  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          {component}
        </div>
      </div>
    </div>
  );
};

export default Expedientes;
