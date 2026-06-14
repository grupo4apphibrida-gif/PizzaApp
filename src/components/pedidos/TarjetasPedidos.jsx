import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Badge, Button, Spinner } from "react-bootstrap";

const TarjetasPedidos = ({
  pedidos = [],
  abrirModalEstado,
}) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    setCargando(!(pedidos && pedidos.length > 0));
  }, [pedidos]);

  const manejarTeclaEscape = useCallback((evento) => {
    if (evento.key === "Escape") setIdTarjetaActiva(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", manejarTeclaEscape);
    return () => window.removeEventListener("keydown", manejarTeclaEscape);
  }, [manejarTeclaEscape]);

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
      {pedidos.map((pedido) => {
        const activa = idTarjetaActiva === pedido.id;

        return (
          <Card
            key={pedido.id}
            className="mb-2 border shadow-sm position-relative"
            onClick={() => alternarTarjetaActiva(pedido.id)}
            style={{ cursor: "pointer" }}
          >
            <Card.Body className="p-3">
              <Row className="align-items-center">
                <Col xs={8}>
                  <div className="fw-semibold">
                    #{pedido.id.slice(-8)} - {pedido.nombre_cliente || pedido.usuarios?.nombre || "Anónimo"}
                  </div>
                  <div className="mt-1 d-flex gap-2">
                    {getPrioridadBadge(pedido.prioridad)}
                    {getEstadoBadge(pedido.estado)}
                  </div>
                  <small className="text-muted">
                    {new Date(pedido.creado_en).toLocaleString()}
                  </small>
                </Col>
                <Col xs={4} className="text-end">
                  <div className="fw-bold text-success fs-6">
                    C$ {Number(pedido.total || 0).toFixed(2)}
                  </div>
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
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    abrirModalEstado(pedido);
                    setIdTarjetaActiva(null);
                  }}
                >
                  <i className="bi bi-pencil me-1"></i> Cambiar Estado
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default TarjetasPedidos;