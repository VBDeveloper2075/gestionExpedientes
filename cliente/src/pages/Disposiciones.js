import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DisposicionesList from '../components/disposiciones/DisposicionesList';
import DisposicionForm from '../components/disposiciones/DisposicionForm';
import DisposicionDetail from '../components/disposiciones/DisposicionDetail';

const Disposiciones = ({ action: propAction }) => {
  const { action: paramAction, id } = useParams();
  
  // Usar action de props o de parámetros URL
  const action = propAction || paramAction;

  // Usamos useMemo para evitar re-renderings innecesarios
  const component = useMemo(() => {
    if (action === 'nueva') {
      return <DisposicionForm />;
    } else if (action === 'editar') {
      return <DisposicionForm />;
    } else if (action === 'ver' || id) {
      return <DisposicionDetail />;
    } else {
      return <DisposicionesList />;
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

export default Disposiciones;
