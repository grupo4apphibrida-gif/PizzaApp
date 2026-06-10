import React from 'react';
import { ShoppingCart, Trash2, Minus, Plus, Clock, ChevronRight, ClipboardList, Truck, Store } from 'lucide-react';
import { motion } from 'framer-motion';

const PedidosView = ({ 
  cart, 
  orders, 
  total, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  onPlaceOrder,
  getStatusIcon
}) => {
  return (
    <div className="col-12 col-lg-4">
      {/* Carrito de compras */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="card border-0 shadow-sm mb-4 overflow-hidden rounded-4"
        style={{ borderRadius: '24px' }}
      >
        <div className="card-header p-4 text-white border-0" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
              <ShoppingCart size={20} />
              Mi Pedido
            </h5>
            <span className="badge bg-white text-danger rounded-pill px-3 py-2">{cart.length}</span>
          </div>
        </div>
        
        <div className="card-body p-0" style={{ maxHeight: '450px', overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <div className="p-5 text-center">
              <ShoppingCart size={48} className="text-muted mb-3 opacity-50" />
              <p className="fw-bold text-muted mb-0">Tu carrito está vacío</p>
              <small className="text-muted">Agrega productos del menú</small>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {cart.map((item, idx) => (
                <motion.div
                  key={item.cartItemId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="list-group-item p-4 border-bottom"
                >
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <h6 className="fw-bold text-dark mb-1">{item.nombre}</h6>
                      {item.tamanio && (
                        <span className="badge bg-light text-dark rounded-pill">{item.tamanio}</span>
                      )}
                    </div>
                    <button 
                      className="btn btn-link text-danger p-0" 
                      onClick={() => onRemoveFromCart(item.cartItemId)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="d-flex align-items-center gap-3 bg-light rounded-pill px-3 py-1">
                      <button 
                        className="btn btn-link text-danger p-0" 
                        onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                      >
                        <Minus size={18} />
                      </button>
                      <span className="fw-bold text-dark">{item.cantidad}</span>
                      <button 
                        className="btn btn-link text-danger p-0" 
                        onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <span className="fw-bold text-danger fs-5">C${(item.precio * item.cantidad).toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-2">
                    {item.tipoEntrega === "envio" ? (
                      <span className="badge bg-warning text-dark rounded-pill">
                        <Truck size={12} className="me-1" /> Envío a domicilio
                      </span>
                    ) : (
                      <span className="badge bg-success rounded-pill">
                        <Store size={12} className="me-1" /> Retiro en tienda
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="card-footer p-4 bg-white border-top">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted fw-bold">Total estimado</span>
              <span className="fs-2 fw-bold text-danger">C${total.toFixed(2)}</span>
            </div>
            <button 
              className="btn btn-danger w-100 py-3 fw-bold rounded-pill shadow-lg"
              onClick={onPlaceOrder}
            >
              Confirmar Pedido
            </button>
          </div>
        )}
      </motion.div>

      {/* Historial de pedidos recientes */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="card border-0 shadow-sm overflow-hidden rounded-4"
        style={{ borderRadius: '24px' }}
      >
        <div className="card-header p-4 text-white border-0" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
          <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <Clock size={20} />
            Mis Pedidos Recientes
          </h5>
        </div>
        
        <div className="card-body p-0" style={{ maxHeight: '450px', overflowY: 'auto' }}>
          {orders.length === 0 ? (
            <div className="p-5 text-center">
              <ClipboardList size={48} className="text-muted mb-3 opacity-50" />
              <p className="fw-bold text-muted mb-0">No tienes pedidos aún</p>
              <small className="text-muted">Tus pedidos aparecerán aquí</small>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {orders.slice(0, 5).map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="list-group-item p-4 border-bottom"
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="mb-0 fw-bold text-dark">#{order.id?.slice(-8)}</p>
                      <small className="text-muted">
                        {new Date(order.creado_en).toLocaleDateString()} - {new Date(order.creado_en).toLocaleTimeString()}
                      </small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge rounded-pill px-3 py-2 d-flex align-items-center gap-1`}>
                        {getStatusIcon?.(order.estado)}
                        {order.estado === 'pendiente' ? 'Pendiente' : 
                         order.estado === 'en_preparacion' ? 'En Preparación' : 
                         order.estado === 'entregado' ? 'Entregado' : 
                         order.estado === 'cancelado' ? 'Cancelado' : order.estado}
                      </span>
                    </div>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="progress mb-3" style={{ height: '6px', borderRadius: '3px' }}>
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: order.estado === 'pendiente' ? '25%' : 
                               order.estado === 'en_preparacion' ? '50%' : 
                               order.estado === 'entregado' ? '100%' : '25%',
                        background: 'linear-gradient(90deg, #dc3545, #ff6b6b)'
                      }}
                    ></div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-danger">C${order.total?.toFixed(2)}</span>
                    <button className="btn btn-link text-muted p-0 text-decoration-none small fw-bold">
                      Ver Detalles <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PedidosView;