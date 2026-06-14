import React from 'react';
import { CheckCircle2, XCircle, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const normalizeEstado = (estado) => String(estado || '').trim().toLowerCase().replace(/\s+/g, '_');

const PedidosActivosView = ({ orders, getStatusIcon, getStatusColor, onStatusChange }) => {
  const pedidosActivos = orders.filter(
    (pedido) => {
      const estado = normalizeEstado(pedido.estado);
      return estado === 'pendiente' || estado === 'en_preparacion';
    }
  );

  return (
    <div className="row row-cols-1 row-cols-lg-2 row-cols-xl-3 g-4">
      <AnimatePresence>
        {pedidosActivos.map((order) => {
          const estado = normalizeEstado(order.estado);

          return (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="col"
            >
              <div className="card h-100 premium-card border-0 shadow-sm overflow-hidden rounded-4">
                <div className={`card-header p-4 border-0 d-flex justify-content-between align-items-center bg-${getStatusColor(estado)} bg-opacity-10`}>
                  <h6 className="mb-0 fw-black text-dark">#{order.id?.slice(0, 8)}</h6>
                  <span className={`badge bg-${getStatusColor(estado)} text-white rounded-pill px-3 py-2 fw-bold text-uppercase x-small shadow-sm d-flex align-items-center gap-1`}>
                    {getStatusIcon(estado)}
                    {estado.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="card-body p-4">
                  <div className="mb-4 d-flex align-items-center gap-3">
                    <div className="bg-light rounded-circle p-2 text-muted fs-4">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="mb-0 fw-bold text-dark">{order.nombre_cliente || 'Cliente'}</p>
                      <small className="text-muted d-flex align-items-center gap-1">
                        <Clock size={12} />
                        {new Date(order.creado_en).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>

                  {order.tipo && (
                    <div className="mb-3">
                      <span className={`badge bg-${order.tipo === 'entrega' ? 'primary' : 'secondary'} text-white rounded-pill px-3 py-1 text-uppercase x-small`}>
                        {order.tipo === 'entrega' ? 'Entrega a domicilio' : 'Mesa'}
                      </span>
                    </div>
                  )}

                  {order.detalle_pedido && order.detalle_pedido.length > 0 && (
                    <div className="mb-4 bg-light rounded-4 p-3">
                      <h6 className="fw-bold text-muted text-uppercase x-small mb-2">🍕 Pedido</h6>
                      {order.detalle_pedido.map((item, i) => (
                        <div key={i} className="d-flex justify-content-between mb-1 align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            {item.imagen_producto && (
                              <img src={item.imagen_producto} style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover' }} alt="" />
                            )}
                            <span className="fw-bold small">{item.nombre_producto}</span>
                            {item.tamanio && <span className="badge bg-secondary rounded-pill x-small">{item.tamanio}</span>}
                            <span className="text-danger fw-bold small">x{item.cantidad}</span>
                          </div>
                          <span className="text-muted small">C${(item.precio * item.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                        <span className="fw-black x-small">TOTAL</span>
                        <span className="fw-black text-danger">C${order.total}</span>
                      </div>
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    {estado === 'pendiente' && (
                      <button
                        className="btn btn-warning w-100 rounded-pill py-2 fw-bold text-uppercase x-small"
                        onClick={() => onStatusChange(order.id, 'en_preparacion')}
                      >
                        Preparar
                      </button>
                    )}
                    {estado === 'en_preparacion' && (
                      <button
                        className="btn btn-info w-100 rounded-pill py-2 fw-bold text-white text-uppercase x-small"
                        onClick={() => onStatusChange(order.id, 'entregado')}
                      >
                        Entregado
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
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default PedidosActivosView;
