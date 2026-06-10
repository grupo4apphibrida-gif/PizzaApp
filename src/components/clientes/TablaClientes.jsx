import React from "react";
import { Button, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { Edit, Trash2, Mail, Phone, User, CheckCircle, XCircle } from "lucide-react";

const TablaClientes = ({
  clientes = [],
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  if (!clientes || clientes.length === 0) {
    return (
      <div className="text-center py-5">
        <User size={48} className="text-muted mb-3" />
        <p className="text-muted">No hay clientes registrados</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="bg-light">
          <tr>
            <th className="py-3 px-4">Cliente</th>
            <th className="py-3 px-4">Contacto</th>
            <th className="py-3 px-4 text-center">Teléfono</th>
            <th className="py-3 px-4 text-center">Estado</th>
            <th className="py-3 px-4 text-center">Fecha Registro</th>
            <th className="py-3 px-4 text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente, idx) => (
            <motion.tr
              key={cliente.id_cliente}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="cliente-row"
            >
              <td className="py-3 px-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="cliente-avatar">
                    <span className="avatar-initials">
                      {cliente.nombre_cliente?.charAt(0).toUpperCase() || 'C'}
                    </span>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">
                      {cliente.nombre_cliente} {cliente.apellido_cliente || ""}
                    </h6>
                    <small className="text-muted">ID: {cliente.id_cliente}</small>
                  </div>
                </div>
               </td>
              <td className="py-3 px-4">
                <div className="d-flex flex-column gap-1">
                  <div className="d-flex align-items-center gap-2">
                    <Mail size={14} className="text-muted" />
                    <small>{cliente.email || "No registrado"}</small>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                {cliente.celular ? (
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <Phone size={14} className="text-success" />
                    <span>{cliente.celular}</span>
                  </div>
                ) : (
                  <span className="text-muted small">No registrado</span>
                )}
              </td>
              <td className="py-3 px-4 text-center">
                {cliente.activo !== false ? (
                  <Badge bg="success" className="rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1">
                    <CheckCircle size={10} />
                    Activo
                  </Badge>
                ) : (
                  <Badge bg="secondary" className="rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1">
                    <XCircle size={10} />
                    Inactivo
                  </Badge>
                )}
              </td>
              <td className="py-3 px-4 text-center">
                <small className="text-muted">
                  {cliente.creado_en ? new Date(cliente.creado_en).toLocaleDateString() : "N/A"}
                </small>
              </td>
              <td className="py-3 px-4 text-end">
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    className="btn btn-outline-warning rounded-circle p-2"
                    style={{ width: 36, height: 36 }}
                    onClick={() => abrirModalEdicion(cliente)}
                    title="Editar cliente"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-outline-danger rounded-circle p-2"
                    style={{ width: 36, height: 36 }}
                    onClick={() => abrirModalEliminacion(cliente)}
                    title="Eliminar cliente"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .cliente-row {
          transition: all 0.2s ease;
        }
        .cliente-row:hover {
          background: #f8f9fa;
        }
        .cliente-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #dc3545, #ff6b6b);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-initials {
          color: white;
          font-weight: 700;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default TablaClientes;