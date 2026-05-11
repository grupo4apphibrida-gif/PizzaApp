import React from 'react';
import { ShoppingCart, Trash2, Minus, Plus, Clock, ChevronRight, ClipboardList } from 'lucide-react';

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
      <div className="card premium-card border-0 shadow-sm mb-4 overflow-hidden rounded-4">
        <div className="card-header bg-pizza-gradient p-4 text-white border-0 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-black d-flex align-items-center gap-2">
            <ShoppingCart /> Mi Pedido
          </h5>
          <span className="badge bg-white text-pizza-red rounded-circle px-2 py-1">{cart.length}</span>
        </div>
        <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <div className="p-5 text-center text-muted opacity-50">
              <ShoppingCart size={48} className="mb-3 mx-auto" />
              <p className="fw-bold mb-0">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {cart.map(item => (
                <div key={item.id} className="list-group-item p-4 border-light">
                  <div className="d-flex justify-content-between mb-2">
                    <h6 className="fw-bold text-dark mb-0">{item.name}</h6>
                    <button className="btn btn-link text-danger p-0" onClick={() => onRemoveFromCart(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <small className="text-muted d-block mb-3">
                    {item.pizzaSize} {item.cheeseBorder && '+ Borde Queso'}
                    {item.extraIngredients.length > 0 && ` + ${item.extraIngredients.join(', ')}`}
                  </small>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3 bg-light rounded-pill px-3 py-1">
                      <button className="btn btn-link text-pizza-red p-0" onClick={() => onUpdateQuantity(item.id, -1)}><Minus size={18} /></button>
                      <span className="fw-black text-dark">{item.quantity}</span>
                      <button className="btn btn-link text-pizza-red p-0" onClick={() => onUpdateQuantity(item.id, 1)}><Plus size={18} /></button>
                    </div>
                    <span className="fw-black text-pizza-red">C${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="card-footer p-4 bg-white border-top border-light">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted fw-bold text-uppercase x-small">Total estimado</span>
              <span className="fs-3 fw-black text-pizza-red">C${total.toFixed(2)}</span>
            </div>
            <button className="btn btn-pizza-primary w-100 py-3 fs-5 fw-black shadow-lg rounded-3" onClick={onPlaceOrder}>
              Confirmar Pedido
            </button>
          </div>
        )}
      </div>

      {/* Pedidos activos */}
      <div className="card premium-card border-0 shadow-sm overflow-hidden rounded-4">
        <div className="card-header bg-dark p-4 text-white border-0">
          <h5 className="mb-0 fw-black d-flex align-items-center gap-2">
            <Clock /> Mis Pedidos
          </h5>
        </div>
        <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {orders.length === 0 ? (
            <div className="p-5 text-center text-muted opacity-50">
              <ClipboardList size={48} className="mb-3 mx-auto" />
              <p className="fw-bold mb-0">No tienes pedidos activos</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {orders.map(order => (
                <div key={order.id} className="list-group-item p-4 border-light">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="mb-0 fw-bold text-dark">#{order.id.slice(0, 8)}</p>
                      <small className="text-muted">{new Date(order.created_at).toLocaleString()}</small>
                    </div>
                    <span className={`badge rounded-pill px-3 py-2 text-uppercase x-small d-flex align-items-center gap-1 badge-status-${order.status}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                  {/* Barra de progreso */}
                  <div className="progress mb-3" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar bg-pizza-gradient" 
                      style={{ 
                        width: order.status === 'pendiente' ? '25%' : 
                               order.status === 'en preparación' ? '50%' : 
                               order.status === 'listo' ? '75%' : '100%' 
                      }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-black text-dark">C${order.total}</span>
                    <button className="btn btn-link text-muted p-0 text-decoration-none x-small fw-bold">Ver Detalles <ChevronRight size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PedidosView;
