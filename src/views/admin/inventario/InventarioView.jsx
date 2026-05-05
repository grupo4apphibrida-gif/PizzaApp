import React from 'react';
import { Package, AlertTriangle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const InventarioView = ({ inventory, onUpdateStock }) => {
  return (
    <motion.div 
      key="inventario"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="row g-4"
    >
      <div className="col-12">
        <div className="bg-white p-4 rounded-4 shadow-sm">
          <h3 className="fw-black mb-4 text-dark fs-4">Control de Inventario</h3>
          <div className="row g-4">
            {inventory.map(item => (
              <div key={item.id} className="col-12 col-md-6 col-xl-4">
                <div className={`card border-0 p-4 rounded-4 shadow-sm ${item.stock <= item.stock_minimo ? 'bg-danger bg-opacity-10 border border-danger' : 'bg-white'}`}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">{item.nombre || 'Ingrediente'}</h6>
                    <span className="badge bg-light text-dark rounded-pill">{item.unidad || 'Unidad'}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-end">
                    <div>
                      <p className="text-muted x-small text-uppercase mb-1 fw-bold">Stock Actual</p>
                      <h2 className={`fw-black mb-0 ${item.stock <= item.stock_minimo ? 'text-danger' : 'text-dark'}`}>{item.stock}</h2>
                    </div>
                    <button 
                      className="btn btn-dark rounded-pill px-3 py-1 x-small fw-bold d-flex align-items-center gap-2"
                      onClick={() => onUpdateStock(item.id, item.stock)}
                    >
                      <RefreshCcw size={14} />
                      Actualizar
                    </button>
                  </div>
                  {item.stock <= item.stock_minimo && (
                    <div className="mt-3 text-danger x-small fw-bold d-flex align-items-center gap-1">
                      <AlertTriangle size={14} />
                      Stock bajo (Mín: {item.stock_minimo})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InventarioView;
