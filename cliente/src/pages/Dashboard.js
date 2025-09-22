import React from 'react';

const Dashboard = () => {  return (
    <div className="container-fluid py-4">
      <h1 className="page-title">Panel Principal</h1>
      
      <div className="row">        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-folder text-primary fs-1"></i>
              </div>
              <h3 className="card-title">Exp´s</h3>
              <p className="card-text">Gestión de expedientes.</p>              <a href="/expedientes" className="btn btn-outline-primary mt-2">
                <span className="d-block">Ver</span>
                <span className="d-block">expedientes</span>
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-file-text text-success fs-1"></i>
              </div>
              <h3 className="card-title">Dispo´s</h3>              <p className="card-text">de Jerárquicos y 109.</p>              <a href="/disposiciones" className="btn btn-outline-success mt-2">
                <span className="d-block">Ver</span>
                <span className="d-block">disposiciones</span> 
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-person text-info fs-1"></i>
              </div>
              <h3 className="card-title">Docentes</h3>
              <p className="card-text">Legajo - Contacto.</p>              <a href="/docentes" className="btn btn-outline-info mt-2">
                <span className="d-block">Ver</span>
                <span className="d-block">docentes</span>
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-building text-warning fs-1"></i>
              </div>
              <h3 className="card-title">Escuelas</h3>
              <p className="card-text">Datos actualizados.</p>              <a href="/escuelas" className="btn btn-outline-warning mt-2">
                <span className="d-block">Ver</span>
                <span className="d-block">escuelas</span>
              </a>
            </div>
          </div>
        </div>
      </div>      <div className="card mt-4">
        <div className="card-body">
          <h2 className="card-title">Bienvenido al Archivo Digital de la SAD de Tres de Febrero - Buenos Aires</h2>
          <p className="card-text">
            Este sistema te permite administrar expedientes y disposiciones de manera eficiente.
            Utiliza las tarjetas superiores para navegar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
