import React from 'react';
import { ChefHat, CheckCircle2, Truck, XCircle, Clock, User, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PedidosActivosView = ({ orders, getStatusIcon, getStatusColor, onStatusChange }) => {
  return (
    <div className="row row-cols-1 row-cols-lg-2 row-cols-xl-3 g-4">
      <AnimatePresence>
        {orders.filter(o => !['entregado', 'cancelado'].includes(o.estado)).map(order => (
          <motion.div 
            key={order.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="col"
          >
            <div className="card h-100 premium-card border-0 shadow-sm overflow-hidden rounded-4">
              {/* Encabezado de la tarjeta con estado */}
              <div className={`card-header p-4 border-0 d-flex justify-content-between align-items-center bg-${getStatusColor(order.estado)} bg-opacity-10`}>
                <h6 className="mb-0 fw-black text-dark">#{order.id.slice(0, 8)}</h6>
                <span className={`badge bg-${getStatusColor(order.estado)} text-white rounded-pill px-3 py-2 fw-bold text-uppercase x-small shadow-sm d-flex align-items-center gap-1`}>
                  {getStatusIcon(order.estado)}
                  {order.estado}
                </span>
              </div>
              
              <div className="card-body p-4">
                {/* Información del cliente */}
                <div className="mb-4 d-flex align-items-center gap-3">
                  <div className="bg-light rounded-circle p-2 text-muted fs-4">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="mb-0 fw-bold text-dark">
                      {order.nombre_cliente || order.usuarios?.nombre || 'Cliente Manual'}
                    </p>
                    <small className="text-muted d-flex align-items-center gap-1">
                      <Clock size={12} />
                      {new Date(order.creado_en).toLocaleTimeString()}
                    </small>
                  </div>
                </div>
                
                {/* Tipo de entrega */}
                {order.tipo && (
                  <div className="mb-3">
                    <span className={`badge bg-${order.tipo === 'entrega' ? 'primary' : 'secondary'} text-white rounded-pill px-3 py-1 text-uppercase x-small`}>
                      {order.tipo === 'entrega' ? 'Entrega a domicilio' : 'Mesa'}
                    </span>
                  </div>
                )}
                
                {/* Items del pedido */}
                {order.detalle_pedido && order.detalle_pedido.length > 0 && (
                  <div className="mb-4 bg-light rounded-4 p-4">
                    <h6 className="fw-bold text-muted text-uppercase x-small mb-3 tracking-widest">Items</h6>
                    {order.detalle_pedido.map(item => (
                      <div key={item.id} className="d-flex justify-content-between mb-2">
                        <span className="text-dark fw-bold">
                          {item.productos?.nombre || 'Producto'} <span className="text-pizza-red">x{item.cantidad}</span>
                        </span>
                        <span className="text-muted small">C${(item.precio * item.cantidad).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between mt-3 pt-3 border-top border-white">
                      <span className="fw-black text-dark">TOTAL</span>
                      <span className="fw-black text-pizza-red fs-5">C${order.total}</span>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="d-flex gap-2">
                  {order.estado === 'pendiente' && (
                    <button 
                      className="btn btn-warning w-100 rounded-pill py-2 fw-bold text-uppercase x-small"
                      onClick={() => onStatusChange(order.id, 'en preparación')}
                    >
                      Preparar
                    </button>
                  )}
                  {order.estado === 'en preparación' && (
                    <button 
                      className="btn btn-info w-100 rounded-pill py-2 fw-bold text-white text-uppercase x-small"
                      onClick={() => onStatusChange(order.id, 'listo')}
                    >
                      Listo
                    </button>
                  )}
                  {order.estado === 'listo' && (
                    <button 
                      className="btn btn-success w-100 rounded-pill py-2 fw-bold text-uppercase x-small"
                      onClick={() => onStatusChange(order.id, 'entregado')}
                    >
                      Entregar
                    </button>
                  )}
                  <button 
                    className="btn btn-outline-danger rounded-pill px-3"
                    onClick={() => onStatusChange(order.id, 'cancelado')}
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PedidosActivosView;
