import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalRegistroPromocion = ({
  mostrarModal,
  setMostrarModal,
  nuevaPromocion,
  manejoCambioInput,
  agregarPromocion,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleAgregar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarPromocion();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-tags me-2"></i>
          Nueva Promoción
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
                  value={nuevaPromocion.titulo || ""}
                  onChange={manejoCambioInput}
                  placeholder="Ej: 2x1 en Pizzas"
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
                  value={nuevaPromocion.descuento || ""}
                  onChange={manejoCambioInput}
                  placeholder="Ej: 20"
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
                  value={nuevaPromocion.descripcion || ""}
                  onChange={manejoCambioInput}
                  placeholder="Descripción de la promoción..."
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de inicio</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_inicio"
                  value={nuevaPromocion.fecha_inicio || ""}
                  onChange={manejoCambioInput}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de fin</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_fin"
                  value={nuevaPromocion.fecha_fin || ""}
                  onChange={manejoCambioInput}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Activa"
                  name="activa"
                  checked={nuevaPromocion.activa !== false}
                  onChange={(e) =>
                    manejoCambioInput({
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
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleAgregar}
          disabled={!nuevaPromocion.titulo?.trim() || !nuevaPromocion.descuento || deshabilitado}
        >
          <i className="bi bi-save me-2"></i>
          Guardar Promoción
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroPromocion;