import React from 'react';
import { Search } from 'lucide-react';

const CuadroBusquedas = ({ textoBusqueda, manejarCambioBusqueda, placeholder = 'Buscar...', className = '' }) => {
  return (
    <div className={`cuadro-busquedas ${className}`}>
      <div className="input-group">
        <span className="input-group-text bg-white border-0 rounded-pill-start">
          <Search size={18} className="text-secondary" />
        </span>
        <input
          type="search"
          value={textoBusqueda}
          onChange={manejarCambioBusqueda}
          className="form-control rounded-pill border border-1"
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </div>
    </div>
  );
};

export default CuadroBusquedas;
