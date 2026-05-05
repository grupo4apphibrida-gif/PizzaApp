import React from 'react';
import { ClipboardList } from 'lucide-react';

const HistorialView = ({ orders, getStatusColor }) => {
  return (
    <div className="row mt-5 g-4">
      <div className="col-12">
        <div className="bg-white p-4 rounded-4 shadow-sm">
          <h3 className="fw-black mb-4 text-dark fs-4 d-flex align-items-center gap-2">
            <ClipboardList size={24} className="text-pizza-red" />
            Historial de Hoy
          </h3>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light text-muted x-small text-uppercase fw-bold tracking-widest border-0">
                <tr>
                  <th className="py-3 border-0 px-4">Pedido</th>
                  <th className="py-3 border-0 px-4">Cliente</th>
                  <th className="py-3 border-0 px-4 text-center">Estado</th>
                  <th className="py-3 border-0 px-4 text-end">Total</th>
                  <th className="py-3 border-0 px-4 text-end">Hora</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => ['entregado', 'cancelado'].includes(o.estado)).slice(0, 10).map(order => (
                  <tr key={order.id}>
                    <td className="py-4 px-4 fw-bold">#{order.id.slice(0, 8)}</td>
                    <td className="py-4 px-4 text-muted">{order.nombre_cliente || order.usuarios?.nombre || 'Cliente Manual'}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`badge rounded-pill px-3 py-2 text-uppercase x-small shadow-sm bg-${getStatusColor(order.estado)} bg-opacity-10 text-${getStatusColor(order.estado)}`}>
                        {order.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-end fw-black text-pizza-red">C${order.total}</td>
                    <td className="py-4 px-4 text-end text-muted small">{new Date(order.creado_en).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialView;
