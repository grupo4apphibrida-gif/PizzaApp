import React, { useState, useEffect } from "react";
import { Table, Spinner, Button, Badge } from "react-bootstrap";

const TablaPedidos = ({
  pedidos = [],
  abrirModalEstado,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(!(pedidos && pedidos.length > 0));
  }, [pedidos]);

  const getEstadoBadge = (estado) => {
    const config = {
      pendiente: { variant: "secondary", text: "⏳ Pendiente" },
      en_preparacion: { variant: "warning", text: "🍕 Preparación" },
      listo: { variant: "info", text: "✅ Listo" },
      entregado: { variant: "success", text: "🎉 Entregado" },
      cancelado: { variant: "danger", text: "❌ Cancelado" },
    };
    const est = config[estado] || config.pendiente;
    return <Badge bg={est.variant}>{est.text}</Badge>;
  };

  const getPrioridadBadge = (prioridad) => {
    const config = {
      normal: { variant: "secondary", text: "Normal" },
      alta: { variant: "warning", text: "Alta" },
      urgente: { variant: "danger", text: "Urgente" },
    };
    const pri = config[prioridad] || config.normal;
    return <Badge bg={pri.variant}>{pri.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <Table striped hover responsive className="mb-0">
      <thead className="table-light">
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Prioridad</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {pedidos.map((pedido) => (
          <tr key={pedido.id}>
            <td className="text-muted small">{pedido.id.slice(-8)}</td>
            <td>{pedido.usuarios?.nombre || pedido.nombre_cliente || "Anónimo"}</td>
            <td className="fw-bold text-success">C$ {Number(pedido.total || 0).toFixed(2)}</td>
            <td>{getPrioridadBadge(pedido.prioridad)}</td>
            <td>{getEstadoBadge(pedido.estado)}</td>
            <td className="text-muted small">
              {new Date(pedido.creado_en).toLocaleString()}
            </td>
            <td className="text-center">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => abrirModalEstado(pedido)}
              >
                <i className="bi bi-pencil"></i> Estado
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaPedidos;