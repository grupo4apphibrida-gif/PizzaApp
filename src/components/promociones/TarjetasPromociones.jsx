import React from "react";
import { Card, Button, Badge } from "react-bootstrap";

const TarjetasPromociones = ({ promociones = [], abrirModalEdicion, abrirModalEliminacion }) => {
  const isActiva = (promocion) => {
    if (!promocion.activa) return false;
    if (promocion.fecha_inicio && new Date(promocion.fecha_inicio) > new Date()) return false;
    if (promocion.fecha_fin && new Date(promocion.fecha_fin) < new Date()) return false;
    return true;
  };

  return (
    <div className="d-flex flex-column gap-3">
      {promociones.map((promocion) => (
        <Card key={promocion.id} className="shadow-sm border-0">
          {promocion.imagen_url ? (
            <Card.Img
              variant="top"
              src={promocion.imagen_url}
              style={{ height: 180, objectFit: 'cover' }}
              className="rounded-top"
            />
          ) : (
            <div className="bg-light rounded-top d-flex align-items-center justify-content-center" style={{ height: 180 }}>
              <span className="text-muted">Sin imagen de promoción</span>
            </div>
          )}
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <Card.Title className="mb-2">{promocion.titulo}</Card.Title>
                <Card.Text className="text-muted small mb-1">{promocion.descripcion || "Sin descripción"}</Card.Text>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <Badge bg={isActiva(promocion) ? "success" : "secondary"}>
                    {isActiva(promocion) ? "Activa" : "Inactiva"}
                  </Badge>
                  <Badge bg="info">{promocion.descuento}%</Badge>
                </div>
              </div>
              <div className="text-end">
                <small className="text-muted">
                  {promocion.fecha_inicio ? new Date(promocion.fecha_inicio).toLocaleDateString() : "Siempre"}
                  <br />
                  {promocion.fecha_fin ? new Date(promocion.fecha_fin).toLocaleDateString() : "Siempre"}
                </small>
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline-warning" size="sm" onClick={() => abrirModalEdicion(promocion)}>
                Editar
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => abrirModalEliminacion(promocion)}>
                Eliminar
              </Button>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default TarjetasPromociones;
