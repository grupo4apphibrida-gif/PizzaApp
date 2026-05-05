import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Badge, Button, Spinner } from "react-bootstrap";

const TarjetasProductos = ({ productos = [], abrirModalEdicion, abrirModalEliminacion }) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    setCargando(!(productos && productos.length > 0));
  }, [productos]);

  const manejarTeclaEscape = useCallback((evento) => {
    if (evento.key === "Escape") setIdTarjetaActiva(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", manejarTeclaEscape);
    return () => window.removeEventListener("keydown", manejarTeclaEscape);
  }, [manejarTeclaEscape]);

  const alternarTarjetaActiva = (id) => {
    setIdTarjetaActiva((prev) => (prev === id ? null : id));
  };

  if (cargando) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      {productos.map((producto) => {
        const activa = idTarjetaActiva === producto.id;
        const categoriaNombre = producto.categoria || "Sin categoría";

        return (
          <Card
            key={producto.id}
            className="mb-2 border shadow-sm position-relative"
            onClick={() => alternarTarjetaActiva(producto.id)}
            style={{ cursor: "pointer" }}
          >
            <Card.Body className="p-3">
              <Row className="align-items-center">
                <Col xs={3}>
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  ) : (
                    <div
                      className="bg-light d-flex align-items-center justify-content-center rounded"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="bi bi-image text-muted fs-3"></i>
                    </div>
                  )}
                </Col>
                <Col xs={6}>
                  <div className="fw-semibold">{producto.nombre}</div>
                  <Badge bg="info" className="mt-1">
                    {categoriaNombre}
                  </Badge>
                  <div className="text-muted small mt-1">
                    {producto.descripcion?.substring(0, 40)}...
                  </div>
                </Col>
                <Col xs={3} className="text-end">
                  <div className="fw-bold text-success">
                    C$ {Number(producto.precio || 0).toFixed(2)}
                  </div>
                  {producto.disponible !== false ? (
                    <Badge bg="success" className="mt-1">
                      Disponible
                    </Badge>
                  ) : (
                    <Badge bg="secondary" className="mt-1">
                      Agotado
                    </Badge>
                  )}
                </Col>
              </Row>

              {activa && (
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{
                    background: "rgba(0,0,0,0.7)",
                    borderRadius: "8px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => {
                        abrirModalEdicion(producto);
                        setIdTarjetaActiva(null);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        abrirModalEliminacion(producto);
                        setIdTarjetaActiva(null);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default TarjetasProductos;