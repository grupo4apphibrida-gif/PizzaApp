import React, { useState } from "react";
import { Card, Badge, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { Edit, Trash2, Package, AlertTriangle, CheckCircle, Calendar } from "lucide-react";

const TarjetasIngredientes = ({
  ingredientes = [],
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const getStockBadge = (stock, stockMinimo) => {
    if (stock <= 0) return <Badge bg="danger" className="rounded-pill px-3 py-2"><AlertTriangle size={12} className="me-1" /> Sin stock</Badge>;
    if (stock <= stockMinimo) return <Badge bg="warning" className="rounded-pill px-3 py-2 text-dark"><AlertTriangle size={12} className="me-1" /> Stock bajo</Badge>;
    return <Badge bg="success" className="rounded-pill px-3 py-2"><CheckCircle size={12} className="me-1" /> Disponible</Badge>;
  };

  if (!ingredientes || ingredientes.length === 0) {
    return (
      <div className="text-center py-5">
        <Package size={48} className="text-muted mb-3" />
        <p className="text-muted">No hay ingredientes registrados</p>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {ingredientes.map((ing, idx) => (
        <div key={ing.id} className="col-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="fw-bold mb-1">{ing.nombre}</h6>
                    <Badge bg="light" text="dark" className="rounded-pill px-3 py-1 small">{ing.unidad}</Badge>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-warning rounded-circle p-2"
                      style={{ width: 34, height: 34 }}
                      onClick={() => abrirModalEdicion(ing)}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn btn-outline-danger rounded-circle p-2"
                      style={{ width: 34, height: 34 }}
                      onClick={() => abrirModalEliminacion(ing)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="row g-2 mt-2">
                  <div className="col-6">
                    <div className="bg-light rounded-3 p-2 text-center">
                      <small className="text-muted d-block">Stock actual</small>
                      <span className="fw-bold fs-5">{Number(ing.stock || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-light rounded-3 p-2 text-center">
                      <small className="text-muted d-block">Stock mínimo</small>
                      <span className="fw-bold">{Number(ing.stock_minimo || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 d-flex justify-content-between align-items-center">
                  {getStockBadge(ing.stock || 0, ing.stock_minimo || 0)}
                  {ing.fecha_vencimiento && (
                    <small className="text-muted d-flex align-items-center gap-1">
                      <Calendar size={12} />
                      Vence: {new Date(ing.fecha_vencimiento).toLocaleDateString()}
                    </small>
                  )}
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export default TarjetasIngredientes;