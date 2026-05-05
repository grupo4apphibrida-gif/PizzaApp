import React, { useState, useEffect } from "react";
import { Table, Spinner, Button, Badge, Image } from "react-bootstrap";

const TablaProductos = ({ productos = [], abrirModalEdicion, abrirModalEliminacion }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(!(productos && productos.length > 0));
  }, [productos]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando productos...</p>
      </div>
    );
  }

  return (
    <Table striped hover responsive size="sm" className="mb-0">
      <thead className="table-light">
        <tr>
          <th>ID</th>
          <th>Imagen</th>
          <th>Nombre</th>
          <th className="d-none d-md-table-cell">Descripción</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Estado</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((producto) => {
          const categoriaNombre = producto.categoria || "Sin categoría";

          return (
            <tr key={producto.id}>
              <td className="text-muted small">{producto.id}</td>
              <td>
                {producto.imagen_url ? (
                  <Image
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    rounded
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center rounded"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <i className="bi bi-image text-muted fs-4"></i>
                  </div>
                )}
              </td>
              <td className="fw-semibold">{producto.nombre}</td>
              <td className="d-none d-md-table-cell text-muted small">
                {producto.descripcion?.substring(0, 50) || "Sin descripción"}
                {producto.descripcion?.length > 50 ? "..." : ""}
              </td>
              <td>
                <Badge bg="info" className="text-uppercase">
                  {categoriaNombre}
                </Badge>
              </td>
              <td className="fw-semibold text-success">
                C$ {Number(producto.precio || 0).toFixed(2)}
              </td>
              <td>
                {producto.disponible !== false ? (
                  <Badge bg="success">Disponible</Badge>
                ) : (
                  <Badge bg="secondary">Agotado</Badge>
                )}
              </td>
              <td className="text-center">
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="me-1"
                  onClick={() => abrirModalEdicion(producto)}
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => abrirModalEliminacion(producto)}
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

export default TablaProductos;