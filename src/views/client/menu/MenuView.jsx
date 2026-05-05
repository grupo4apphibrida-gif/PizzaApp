import React from 'react';
import { Pizza, Beer, Cookie, Plus, Search, Filter, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MenuView = ({ 
  products, 
  filteredProducts, 
  category, 
  searchTerm, 
  onCategoryChange, 
  onSearchChange, 
  onOpenProductModal 
}) => {
  const categories = [
    { id: 'all', label: 'Todos', icon: Filter },
    { id: 'pizzas', label: 'Pizzas', icon: Pizza },
    { id: 'bebidas', label: 'Bebidas', icon: Beer },
    { id: 'postres', label: 'Postres', icon: Cookie },
    { id: 'extras', label: 'Extras', icon: Plus }
  ];

  return (
    <div className="col-12 col-lg-8">
      {/* Buscador y filtros */}
      <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="input-group bg-light rounded-pill px-3">
              <span className="input-group-text bg-transparent border-0 text-muted">
                <Search size={18} />
              </span>
              <input 
                type="text" 
                className="form-control bg-transparent border-0 shadow-none py-2" 
                placeholder="Busca tu pizza favorita..." 
                value={searchTerm}
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-2 overflow-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`btn rounded-pill px-4 py-2 fw-bold text-uppercase x-small d-flex align-items-center gap-2 transition-all ${category === cat.id ? 'btn-pizza-primary shadow-sm' : 'btn-light text-muted'}`}
                  onClick={() => onCategoryChange(cat.id)}
                >
                  <cat.icon size={14} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
        <AnimatePresence>
          {filteredProducts.map(product => (
            <motion.div 
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="col"
            >
              <div className="card h-100 premium-card border-0 shadow-sm overflow-hidden group">
                <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                  <img 
                    src={product.imagen_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&h=300&auto=format&fit=crop'} 
                    className="w-100 h-100 object-fit-cover transition-transform duration-500 group-hover:scale-110" 
                    alt={product.nombre} 
                  />
                  <div className="position-absolute top-0 end-0 p-2">
                    <span className="badge bg-white text-dark rounded-pill shadow-sm fw-bold">
                      <Star size={12} className="text-warning me-1 fill-warning" />
                      4.8
                    </span>
                  </div>
                  {!product.disponible && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
                      <span className="badge bg-danger rounded-pill px-4 py-2 fs-6 fw-bold shadow-lg">Agotado</span>
                    </div>
                  )}
                </div>
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-black text-dark mb-0">{product.nombre}</h5>
                    <span className="text-pizza-red fw-black fs-5">C${product.precio}</span>
                  </div>
                  <p className="text-muted small mb-4 flex-grow-1">{product.descripcion}</p>
                  <button 
                    className={`btn btn-pizza-primary w-100 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 ${!product.disponible && 'disabled opacity-50'}`}
                    onClick={() => onOpenProductModal(product)}
                    disabled={!product.disponible}
                  >
                    <Plus size={18} />
                    Personalizar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MenuView;
