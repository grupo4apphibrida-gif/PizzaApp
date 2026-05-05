import React, { useState, useEffect } from "react";
import { Table, Spinner, Button, Badge } from "react-bootstrap";

const TablaIngredientes = ({
  ingredientes = [],
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(!(ingredientes && ingredientes.length > 0));
  }, [ingredientes]);

  const getStockBadge = (stock, stockMinimo) => {
    if (stock <= 0) {
      return <Badge bg="danger">Sin stock</Badge>;
    } else if (stock <= stockMinimo) {
      return <Badge bg="warning">Stock bajo</Badge>;
    }
    return <Badge bg="success">Disponible</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando ingredientes...</p>
      </div>
    );
  }

  return (
    <Table striped hover responsive className="mb-0">
      <thead className="table-light">
        <tr>
          <th>Nombre</th>
          <th>Unidad</th>
          <th>Stock</th>
          <th>Stock mínimo</th>
          <th>Estado</th>
          <th>Vencimiento</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ingredientes.map((ing) => (
          <tr key={ing.id}>
            <td className="fw-semibold">{ing.nombre}</td>
            <td>{ing.unidad}</td>
            <td className="fw-bold">{Number(ing.stock || 0).toFixed(2)}</td>
            <td>{Number(ing.stock_minimo || 0).toFixed(2)}</td>
            <td>{getStockBadge(ing.stock || 0, ing.stock_minimo || 0)}</td>
            <td className="text-muted small">
              {ing.fecha_vencimiento
                ? new Date(ing.fecha_vencimiento).toLocaleDateString()
                : "N/A"}
            </td>
            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                className="me-1"
                onClick={() => abrirModalEdicion(ing)}
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => abrirModalEliminacion(ing)}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaIngredientes;