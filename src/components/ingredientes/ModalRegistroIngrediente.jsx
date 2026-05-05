import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalRegistroIngrediente = ({
  mostrarModal,
  setMostrarModal,
  nuevoIngrediente,
  manejoCambioInput,
  agregarIngrediente,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleAgregar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarIngrediente();
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
          <i className="bi bi-box-seam me-2"></i>
          Nuevo Ingrediente
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del ingrediente *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nuevoIngrediente.nombre || ""}
                  onChange={manejoCambioInput}
                  placeholder="Ej: Queso Mozzarella"
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Unidad de medida *</Form.Label>
                <Form.Select
                  name="unidad"
                  value={nuevoIngrediente.unidad || ""}
                  onChange={manejoCambioInput}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="g">Gramos (g)</option>
                  <option value="l">Litros (l)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="unidad">Unidades</option>
                  <option value="pieza">Piezas</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stock inicial</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="stock"
                  value={nuevoIngrediente.stock || 0}
                  onChange={manejoCambioInput}
                  placeholder="0"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stock mínimo (alerta)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="stock_minimo"
                  value={nuevoIngrediente.stock_minimo || 0}
                  onChange={manejoCambioInput}
                  placeholder="Ej: 5"
                />
                <Form.Text className="text-muted">
                  Cuando el stock baje de este valor, se enviará una alerta
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de vencimiento</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_vencimiento"
                  value={nuevoIngrediente.fecha_vencimiento || ""}
                  onChange={manejoCambioInput}
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
          disabled={!nuevoIngrediente.nombre?.trim() || !nuevoIngrediente.unidad || deshabilitado}
        >
          <i className="bi bi-save me-2"></i>
          Guardar Ingrediente
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroIngrediente;