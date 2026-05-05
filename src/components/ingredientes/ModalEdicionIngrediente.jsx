import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalEdicionIngrediente = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  ingredienteEditar,
  manejoCambioInputEdicion,
  actualizarIngrediente,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarIngrediente();
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
          Editar Ingrediente
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={ingredienteEditar.nombre || ""}
                  onChange={manejoCambioInputEdicion}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Unidad *</Form.Label>
                <Form.Select
                  name="unidad"
                  value={ingredienteEditar.unidad || ""}
                  onChange={manejoCambioInputEdicion}
                >
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
                <Form.Label>Stock actual</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="stock"
                  value={ingredienteEditar.stock || 0}
                  onChange={manejoCambioInputEdicion}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stock mínimo</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="stock_minimo"
                  value={ingredienteEditar.stock_minimo || 0}
                  onChange={manejoCambioInputEdicion}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de vencimiento</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_vencimiento"
                  value={ingredienteEditar.fecha_vencimiento || ""}
                  onChange={manejoCambioInputEdicion}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <hr />
              <small className="text-muted">
                Actualizado: {ingredienteEditar.actualizado_en
                  ? new Date(ingredienteEditar.actualizado_en).toLocaleString()
                  : "N/A"}
              </small>
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
          disabled={!ingredienteEditar.nombre?.trim() || !ingredienteEditar.unidad || deshabilitado}
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionIngrediente;