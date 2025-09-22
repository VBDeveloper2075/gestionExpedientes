import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para páginas visibles cuando hay muchas páginas
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Ajustar si estamos cerca del final
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // Agregar primera página y puntos suspensivos si es necesario
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      // Agregar páginas del rango
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Agregar puntos suspensivos y última página si es necesario
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage) {
      onPageChange(page);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      {/* Información de registros */}
      <div className="text-muted">
        <i className="bi bi-info-circle me-1"></i>
        Mostrando <strong>{startItem}</strong> a <strong>{endItem}</strong> de <strong>{totalItems}</strong> registros
      </div>
      
      {/* Controles de paginación */}
      <nav aria-label="Paginación de docentes">
        <ul className="pagination mb-0">
          {/* Botón Anterior */}
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <span aria-hidden="true">&laquo;</span>
              <span className="visually-hidden">Anterior</span>
            </button>
          </li>
          
          {/* Números de página */}
          {getPageNumbers().map((page, index) => (
            <li 
              key={index} 
              className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
            >
              <button 
                className="page-link"
                onClick={() => handlePageClick(page)}
                disabled={page === '...'}
                aria-label={page === '...' ? 'Más páginas' : `Página ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            </li>
          ))}
          
          {/* Botón Siguiente */}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Página siguiente"
            >
              <span className="visually-hidden">Siguiente</span>
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
