import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DocentesList from '../components/docentes/DocentesList';
import DocenteForm from '../components/docentes/DocenteForm';
import DocenteDetail from '../components/docentes/DocenteDetail';

const Docentes = ({ action: propAction }) => {
  const { action: paramAction, id } = useParams();
  
  // Usar action de props o de parámetros URL
  const action = propAction || paramAction;
  
  console.log('🎯 Docentes - propAction:', propAction, 'paramAction:', paramAction, 'action final:', action, 'id:', id);

  // Usamos useMemo para evitar re-renderings innecesarios
  const component = useMemo(() => {
    console.log('🔄 Renderizando componente para action:', action);
    if (action === 'nuevo') {
      return <DocenteForm />;
    } else if (action === 'editar') {
      return <DocenteForm />;
    } else if (action === 'ver') {
      return <DocenteDetail />;
    } else {
      return <DocentesList />;
    }
  }, [action]);
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

export default Docentes;
