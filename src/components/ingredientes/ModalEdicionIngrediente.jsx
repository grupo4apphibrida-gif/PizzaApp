import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { Package, Save, Calendar, Box, X, Edit3 } from "lucide-react";

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

  if (!ingredienteEditar) return null;

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      centered
      size="lg"
      className="ingrediente-modal"
    >
      <Modal.Header className="border-0 p-4" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white rounded-circle p-2">
            <Edit3 size={24} color="#dc3545" />
          </div>
          <div>
            <Modal.Title className="fw-bold text-white">
              Editar Ingrediente
            </Modal.Title>
            <p className="text-white-50 small mb-0">Modifica los datos del ingrediente</p>
          </div>
        </div>
        <button onClick={() => setMostrarModalEdicion(false)} className="btn-close-white">
          <X size={20} />
        </button>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ background: '#f8f9fa' }}>
        <Form>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small">Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={ingredienteEditar.nombre || ""}
                  onChange={manejoCambioInputEdicion}
                  className="rounded-3"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small">Unidad *</Form.Label>
                <Form.Select
                  name="unidad"
                  value={ingredienteEditar.unidad || ""}
                  onChange={manejoCambioInputEdicion}
                  className="rounded-3"
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
                <Form.Label className="fw-bold small">Stock actual</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="stock"
                  value={ingredienteEditar.stock || 0}
                  onChange={manejoCambioInputEdicion}
                  className="rounded-3"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small">Stock mínimo</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="stock_minimo"
                  value={ingredienteEditar.stock_minimo || 0}
                  onChange={manejoCambioInputEdicion}
                  className="rounded-3"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small d-flex align-items-center gap-2">
                  <Calendar size={14} />
                  Fecha de vencimiento
                </Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_vencimiento"
                  value={ingredienteEditar.fecha_vencimiento || ""}
                  onChange={manejoCambioInputEdicion}
                  className="rounded-3"
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <div className="bg-light p-3 rounded-3">
                <small className="text-muted d-flex align-items-center gap-2">
                  <Box size={14} />
                  Última actualización: {ingredienteEditar.actualizado_en
                    ? new Date(ingredienteEditar.actualizado_en).toLocaleString()
                    : "Nunca"}
                </small>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0 p-4" style={{ background: '#f8f9fa' }}>
        <Button variant="light" onClick={() => setMostrarModalEdicion(false)} className="rounded-pill px-4">
          Cancelar
        </Button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleActualizar}
          disabled={!ingredienteEditar.nombre?.trim() || !ingredienteEditar.unidad || deshabilitado}
          className="btn btn-danger rounded-pill px-4 fw-bold"
        >
          <Save size={16} className="me-2" />
          Actualizar
        </motion.button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionIngrediente;