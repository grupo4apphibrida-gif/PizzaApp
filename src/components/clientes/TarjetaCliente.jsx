import React, { useState } from "react";
import { Card, Badge, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { Edit, Trash2, Mail, Phone, User, CheckCircle, XCircle } from "lucide-react";

const TarjetaCliente = ({
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
    <div className="row g-3">
      {clientes.map((cliente, idx) => (
        <div key={cliente.id_cliente} className="col-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-3">
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
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-warning rounded-circle p-2"
                      style={{ width: 34, height: 34 }}
                      onClick={() => abrirModalEdicion(cliente)}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn btn-outline-danger rounded-circle p-2"
                      style={{ width: 34, height: 34 }}
                      onClick={() => abrirModalEliminacion(cliente)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="row g-2 mt-2">
                  <div className="col-12">
                    <div className="bg-light rounded-3 p-2 d-flex align-items-center gap-2">
                      <Mail size={14} className="text-muted" />
                      <span className="small">{cliente.email || "Email no registrado"}</span>
                    </div>
                  </div>
                  {cliente.celular && (
                    <div className="col-12">
                      <div className="bg-light rounded-3 p-2 d-flex align-items-center gap-2">
                        <Phone size={14} className="text-muted" />
                        <span className="small">{cliente.celular}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 d-flex justify-content-between align-items-center">
                  {cliente.activo !== false ? (
                    <Badge bg="success" className="rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                      <CheckCircle size={12} />
                      Activo
                    </Badge>
                  ) : (
                    <Badge bg="secondary" className="rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                      <XCircle size={12} />
                      Inactivo
                    </Badge>
                  )}
                  <small className="text-muted">
                    Registrado: {cliente.creado_en ? new Date(cliente.creado_en).toLocaleDateString() : "N/A"}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </div>
      ))}

      <style>{`
        .cliente-avatar {
          width: 50px;
          height: 50px;
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

export default TarjetaCliente;