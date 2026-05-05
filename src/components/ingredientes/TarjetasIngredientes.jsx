import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Badge, Button, Spinner } from "react-bootstrap";

const TarjetasIngredientes = ({
  ingredientes = [],
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    setCargando(!(ingredientes && ingredientes.length > 0));
  }, [ingredientes]);

  const manejarTeclaEscape = useCallback((evento) => {
    if (evento.key === "Escape") setIdTarjetaActiva(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", manejarTeclaEscape);
    return () => window.removeEventListener("keydown", manejarTeclaEscape);
  }, [manejarTeclaEscape]);

  const getStockBadge = (stock, stockMinimo) => {
    if (stock <= 0) return <Badge bg="danger">Sin stock</Badge>;
    if (stock <= stockMinimo) return <Badge bg="warning">Stock bajo</Badge>;
    return <Badge bg="success">Disponible</Badge>;
  };

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
      {ingredientes.map((ing) => {
        const activa = idTarjetaActiva === ing.id;

        return (
          <Card
            key={ing.id}
            className="mb-2 border shadow-sm position-relative"
            onClick={() => alternarTarjetaActiva(ing.id)}
            style={{ cursor: "pointer" }}
          >
            <Card.Body className="p-3">
              <Row className="align-items-center">
                <Col xs={7}>
                  <div className="fw-semibold">{ing.nombre}</div>
                  <small className="text-muted">Unidad: {ing.unidad}</small>
                  <div className="mt-1">{getStockBadge(ing.stock || 0, ing.stock_minimo || 0)}</div>
                </Col>
                <Col xs={5} className="text-end">
                  <div className="fw-bold fs-5">{Number(ing.stock || 0).toFixed(2)}</div>
                  <small className="text-muted">Stock actual</small>
                  {ing.fecha_vencimiento && (
                    <div className="text-muted small mt-1">
                      Vence: {new Date(ing.fecha_vencimiento).toLocaleDateString()}
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>

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
                      abrirModalEdicion(ing);
                      setIdTarjetaActiva(null);
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      abrirModalEliminacion(ing);
                      setIdTarjetaActiva(null);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default TarjetasIngredientes;