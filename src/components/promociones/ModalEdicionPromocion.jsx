import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalEdicionPromocion = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  promocionEditar,
  manejoCambioInputEdicion,
  manejoCambioImagen,
  actualizarPromocion,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarPromocion();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-pencil-square me-2"></i>
          Editar Promoción
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Título *</Form.Label>
                <Form.Control
                  type="text"
                  name="titulo"
                  value={promocionEditar.titulo || ""}
                  onChange={manejoCambioInputEdicion}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Descuento (%) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="descuento"
                  value={promocionEditar.descuento || ""}
                  onChange={manejoCambioInputEdicion}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="descripcion"
                  value={promocionEditar.descripcion || ""}
                  onChange={manejoCambioInputEdicion}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de inicio</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_inicio"
                  value={promocionEditar.fecha_inicio || ""}
                  onChange={manejoCambioInputEdicion}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de fin</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_fin"
                  value={promocionEditar.fecha_fin || ""}
                  onChange={manejoCambioInputEdicion}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Imagen</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={manejoCambioImagen}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6} className="d-flex align-items-center">
              {promocionEditar.imagen_url ? (
                <img
                  src={promocionEditar.imagen_url}
                  alt="Vista previa"
                  className="img-fluid rounded-3"
                  style={{ maxHeight: 140, objectFit: 'cover', width: '100%' }}
                />
              ) : (
                <div className="border rounded-3 bg-light d-flex align-items-center justify-content-center p-3 text-muted small">
                  Sin imagen seleccionada
                </div>
              )}
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Activa"
                  name="activa"
                  checked={promocionEditar.activa !== false}
                  onChange={(e) =>
                    manejoCambioInputEdicion({
                      target: { name: "activa", value: e.target.checked },
                    })
                  }
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleActualizar}
          disabled={!promocionEditar.titulo?.trim() || !promocionEditar.descuento || deshabilitado}
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionPromocion;