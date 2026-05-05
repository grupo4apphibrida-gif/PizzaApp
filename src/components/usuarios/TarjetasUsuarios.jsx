import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Badge, Button, Spinner } from "react-bootstrap";

const TarjetasUsuarios = ({
  usuarios = [],
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    setCargando(!(usuarios && usuarios.length > 0));
  }, [usuarios]);

  const manejarTeclaEscape = useCallback((evento) => {
    if (evento.key === "Escape") setIdTarjetaActiva(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", manejarTeclaEscape);
    return () => window.removeEventListener("keydown", manejarTeclaEscape);
  }, [manejarTeclaEscape]);

  const getRolBadge = (rol) => {
    const badges = {
      admin: { variant: "danger", icon: "bi-shield-shaded", text: "Admin" },
      empleado: { variant: "warning", icon: "bi-person-badge", text: "Empleado" },
      cliente: { variant: "success", icon: "bi-person", text: "Cliente" },
    };
    const config = badges[rol] || badges.cliente;
    return (
      <Badge bg={config.variant} pill>
        <i className={config.icon + " me-1"}></i> {config.text}
      </Badge>
    );
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
      {usuarios.map((usuario) => {
        const activa = idTarjetaActiva === usuario.id;

        return (
          <Card
            key={usuario.id}
            className="mb-2 border shadow-sm position-relative"
            onClick={() => alternarTarjetaActiva(usuario.id)}
            style={{ cursor: "pointer" }}
          >
            <Card.Body className="p-3">
              <Row className="align-items-center">
                <Col xs={8}>
                  <div className="fw-semibold">{usuario.nombre}</div>
                  <small className="text-muted">{usuario.correo}</small>
                  <div className="mt-1 d-flex gap-2 align-items-center">
                    {getRolBadge(usuario.rol)}
                    {usuario.activo !== false ? (
                      <Badge bg="success" pill>Activo</Badge>
                    ) : (
                      <Badge bg="secondary" pill>Inactivo</Badge>
                    )}
                  </div>
                </Col>
                <Col xs={4} className="text-end">
                  <small className="text-muted">
                    {usuario.creado_en
                      ? new Date(usuario.creado_en).toLocaleDateString()
                      : ""}
                  </small>
                </Col>
              </Row>
            </Card.Body>

            {/* Overlay de acciones al hacer clic */}
            {activa && (
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                style={{
                  background: "rgba(0,0,0,0.7)",
                  borderRadius: "8px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="d-flex gap-3">
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => {
                      abrirModalEdicion(usuario);
                      setIdTarjetaActiva(null);
                    }}
                  >
                    <i className="bi bi-pencil"></i> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      abrirModalEliminacion(usuario);
                      setIdTarjetaActiva(null);
                    }}
                  >
                    <i className="bi bi-trash"></i> Eliminar
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

export default TarjetasUsuarios;