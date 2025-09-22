import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import EscuelasList from '../components/escuelas/EscuelasList';
import EscuelaForm from '../components/escuelas/EscuelaForm';
import EscuelaDetail from '../components/escuelas/EscuelaDetail';

const Escuelas = ({ action: propAction }) => {
  const { action: paramAction, id } = useParams();
  
  // Usar action de props o de parámetros URL
  const action = propAction || paramAction;
  
  console.log('🎯 Escuelas - propAction:', propAction, 'paramAction:', paramAction, 'action final:', action, 'id:', id);

  // Usamos useMemo para evitar re-renderings innecesarios
  const component = useMemo(() => {
    console.log('🔄 Renderizando componente para action:', action);
    if (action === 'nueva') {
      return <EscuelaForm />;
    } else if (action === 'editar') {
      return <EscuelaForm />;
    } else if (action === 'ver') {
      return <EscuelaDetail />;
    } else {
      return <EscuelasList />;
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

export default Escuelas;
