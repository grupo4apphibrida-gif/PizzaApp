import React from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, Package, Truck } from 'lucide-react';

const normalizeEstado = (estado) => String(estado || '').trim().toLowerCase().replace(/\s+/g, '_');

const HistorialView = ({ orders, getStatusColor, actualizarEstado }) => {
  // Función para obtener el ícono según el estado
  const getStatusIcon = (estado) => {
    const normalized = normalizeEstado(estado);
    switch (normalized) {
      case 'pendiente': return <Clock size={16} />;
      case 'en_preparacion': return <Package size={16} />;
      case 'entregado': return <CheckCircle size={16} />;
      case 'cancelado': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  // Función para obtener el texto del estado en español
  const getStatusText = (estado) => {
    const normalized = normalizeEstado(estado);
    switch (normalized) {
      case 'pendiente': return 'Pendiente';
      case 'en_preparacion': return 'En Preparación';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  // Ordenar pedidos: primero pendientes, luego en preparación, luego entregados
  const ordenarPedidos = (pedidos) => {
    const orden = { pendiente: 0, en_preparacion: 1, entregado: 2, cancelado: 3 };
    return [...pedidos].sort((a, b) => orden[normalizeEstado(a.estado)] - orden[normalizeEstado(b.estado)]);
  };

  const pedidosOrdenados = ordenarPedidos(orders);

  return (
    <div className="row mt-5 g-4">
      <div className="col-12">
        <div className="bg-white p-4 rounded-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-black mb-0 text-dark fs-4 d-flex align-items-center gap-2">
              <ClipboardList size={24} className="text-danger" />
              Gestión de Cocina
              <span className="badge bg-danger ms-2 rounded-pill">{orders.length} pedidos</span>
            </h3>
            <div className="d-flex gap-2">
              <span className="badge bg-warning rounded-pill px-3 py-2">
                <Clock size={12} className="me-1" /> Pendientes: {orders.filter(o => normalizeEstado(o.estado) === 'pendiente').length}
              </span>
              <span className="badge bg-info rounded-pill px-3 py-2">
                <Package size={12} className="me-1" /> En preparación: {orders.filter(o => normalizeEstado(o.estado) === 'en_preparacion').length}
              </span>
            </div>
          </div>

          {pedidosOrdenados.length === 0 ? (
            <div className="text-center py-5">
              <Package size={48} className="text-muted mb-3 opacity-50" />
              <h5 className="text-muted">No hay pedidos en cocina</h5>
              <p className="text-muted small">Los pedidos aparecerán aquí cuando los clientes realicen un pedido</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 px-4">Pedido</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Productos</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-end">Total</th>
                    <th className="py-3 px-4 text-end">Hora</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosOrdenados.map((order, idx) => (
                    <tr key={order.id} className={normalizeEstado(order.estado) === 'pendiente' ? 'table-warning' : ''}>
                      <td className="py-3 px-4 fw-bold">
                        #{order.id?.slice(-8)}
                        {normalizeEstado(order.estado) === 'pendiente' && (
                          <span className="badge bg-warning ms-2">Nuevo</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="fw-semibold">{order.nombre_cliente || 'Cliente'}</div>
                          <small className="text-muted">{order.email_cliente || 'Sin email'}</small>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {order.detalle_pedido?.slice(0, 2).map((detalle, i) => (
                          <div key={i} className="small">
                            🍕 Producto {detalle.producto_id?.slice(-8)} x{detalle.cantidad}
                          </div>
                        ))}
                        {order.detalle_pedido?.length > 2 && (
                          <small className="text-muted">+{order.detalle_pedido.length - 2} más</small>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 bg-${getStatusColor(order.estado)}`}>
                          {getStatusIcon(order.estado)}
                          {getStatusText(order.estado)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end fw-bold text-danger">
                        C$ {Number(order.total).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-end text-muted small">
                        {new Date(order.creado_en).toLocaleTimeString()}
                        <br />
                        <small>{new Date(order.creado_en).toLocaleDateString()}</small>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {normalizeEstado(order.estado) === 'pendiente' && (
                          <button
                            className="btn btn-sm btn-info text-white me-1"
                            onClick={() => actualizarEstado(order.id, 'en_preparacion')}
                            title="Iniciar preparación"
                          >
                            <Package size={16} /> Preparar
                          </button>
                        )}
                        {normalizeEstado(order.estado) === 'en_preparacion' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => actualizarEstado(order.id, 'entregado')}
                            title="Marcar como entregado"
                          >
                            <CheckCircle size={16} /> Entregar
                          </button>
                        )}
                        {normalizeEstado(order.estado) === 'pendiente' && (
                          <button
                            className="btn btn-sm btn-danger ms-1"
                            onClick={() => actualizarEstado(order.id, 'cancelado')}
                            title="Cancelar pedido"
                          >
                            <XCircle size={16} /> Cancelar
                          </button>
                        )}
                        {normalizeEstado(order.estado) === 'entregado' && (
                          <span className="text-success small">
                            <CheckCircle size={14} /> Completado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorialView;