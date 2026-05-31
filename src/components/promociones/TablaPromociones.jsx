import React, { useState, useEffect } from "react";
import { Table, Spinner, Button, Badge } from "react-bootstrap";

const TablaPromociones = ({
  promociones = [],
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(!(promociones && promociones.length > 0));
  }, [promociones]);

  const isActiva = (promocion) => {
    if (!promocion.activa) return false;
    if (promocion.fecha_inicio && new Date(promocion.fecha_inicio) > new Date()) return false;
    if (promocion.fecha_fin && new Date(promocion.fecha_fin) < new Date()) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando promociones...</p>
      </div>
    );
  }

  return (
    <Table striped hover responsive className="mb-0">
      <thead className="table-light">
        <tr>
          <th>Imagen</th>
          <th>Título</th>
          <th>Descripción</th>
          <th>Descuento</th>
          <th>Vigencia</th>
          <th>Estado</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {promociones.map((prom) => {
          const activa = isActiva(prom);
          return (
            <tr key={prom.id}>
              <td>
                <img
                  src={prom.imagen_url || 'https://via.placeholder.com/64?text=Promo'}
                  alt={prom.titulo}
                  style={{ width: 64, height: 64, objectFit: 'cover' }}
                  className="rounded-3"
                />
              </td>
              <td className="fw-semibold">{prom.titulo}</td>
              <td className="text-muted small">{prom.descripcion || "Sin descripción"}</td>
              <td className="fw-bold text-success">{prom.descuento}%</td>
              <td className="text-muted small">
                {prom.fecha_inicio ? new Date(prom.fecha_inicio).toLocaleDateString() : "Siempre"}
                {" - "}
                {prom.fecha_fin ? new Date(prom.fecha_fin).toLocaleDateString() : "Siempre"}
              </td>
              <td>
                {activa ? (
                  <Badge bg="success">Activa</Badge>
                ) : (
                  <Badge bg="secondary">Inactiva</Badge>
                )}
              </td>
              <td className="text-center">
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="me-1"
                  onClick={() => abrirModalEdicion(prom)}
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => abrirModalEliminacion(prom)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default TablaPromociones;