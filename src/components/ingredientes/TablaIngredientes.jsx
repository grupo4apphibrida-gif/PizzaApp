import React from "react";
import { Table, Button, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { Edit, Trash2, Package, AlertTriangle, CheckCircle } from "lucide-react";

const TablaIngredientes = ({
  ingredientes = [],
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const getStockBadge = (stock, stockMinimo) => {
    if (stock <= 0) {
      return <Badge bg="danger" className="px-3 py-2 rounded-pill d-flex align-items-center gap-1"><AlertTriangle size={12} /> Sin stock</Badge>;
    } else if (stock <= stockMinimo) {
      return <Badge bg="warning" className="px-3 py-2 rounded-pill text-dark d-flex align-items-center gap-1"><AlertTriangle size={12} /> Stock bajo</Badge>;
    }
    return <Badge bg="success" className="px-3 py-2 rounded-pill d-flex align-items-center gap-1"><CheckCircle size={12} /> Disponible</Badge>;
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
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="bg-light">
          <tr>
            <th className="py-3 px-4">Nombre</th>
            <th className="py-3 px-4 text-center">Unidad</th>
            <th className="py-3 px-4 text-center">Stock</th>
            <th className="py-3 px-4 text-center">Stock mínimo</th>
            <th className="py-3 px-4 text-center">Estado</th>
            <th className="py-3 px-4 text-center">Vencimiento</th>
            <th className="py-3 px-4 text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ingredientes.map((ing, idx) => (
            <motion.tr
              key={ing.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="ingrediente-row"
            >
              <td className="py-3 px-4 fw-semibold">{ing.nombre}</td>
              <td className="py-3 px-4 text-center">
                <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill">{ing.unidad}</Badge>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="fw-bold">{Number(ing.stock || 0).toFixed(2)}</span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="text-muted">{Number(ing.stock_minimo || 0).toFixed(2)}</span>
              </td>
              <td className="py-3 px-4 text-center">{getStockBadge(ing.stock || 0, ing.stock_minimo || 0)}</td>
              <td className="py-3 px-4 text-center">
                <span className="text-muted small">
                  {ing.fecha_vencimiento ? new Date(ing.fecha_vencimiento).toLocaleDateString() : "N/A"}
                </span>
              </td>
              <td className="py-3 px-4 text-end">
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    className="btn btn-outline-warning rounded-circle p-2"
                    style={{ width: 36, height: 36 }}
                    onClick={() => abrirModalEdicion(ing)}
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-outline-danger rounded-circle p-2"
                    style={{ width: 36, height: 36 }}
                    onClick={() => abrirModalEliminacion(ing)}
                    title="Eliminar"
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
        .ingrediente-row {
          transition: all 0.2s ease;
        }
        .ingrediente-row:hover {
          background: #f8f9fa;
        }
      `}</style>
    </div>
  );
};

export default TablaIngredientes;