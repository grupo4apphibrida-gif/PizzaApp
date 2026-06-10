import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { Package, Plus, AlertCircle, Calendar, Box, X } from "lucide-react";

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
      className="ingrediente-modal"
    >
      <Modal.Header className="border-0 p-4" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
        <div className="d-flex align-items-center gap-3">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-circle p-2"
          >
            <Package size={24} color="#dc3545" />
          </motion.div>
          <div>
            <Modal.Title className="fw-bold text-white">
              Nuevo Ingrediente
            </Modal.Title>
            <p className="text-white-50 small mb-0">Agrega un nuevo ingrediente al inventario</p>
          </div>
        </div>
        <button onClick={() => setMostrarModal(false)} className="btn-close-white">
          <X size={20} />
        </button>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ background: '#f8f9fa' }}>
        <Form>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small">Nombre del ingrediente *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nuevoIngrediente.nombre || ""}
                  onChange={manejoCambioInput}
                  placeholder="Ej: Queso Mozzarella"
                  className="rounded-3"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small">Unidad de medida *</Form.Label>
                <Form.Select
                  name="unidad"
                  value={nuevoIngrediente.unidad || ""}
                  onChange={manejoCambioInput}
                  className="rounded-3"
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
                <Form.Label className="fw-bold small">Stock inicial</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="stock"
                  value={nuevoIngrediente.stock || 0}
                  onChange={manejoCambioInput}
                  className="rounded-3"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small">Stock mínimo (alerta)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="stock_minimo"
                  value={nuevoIngrediente.stock_minimo || 0}
                  onChange={manejoCambioInput}
                  className="rounded-3"
                />
                <Form.Text className="text-muted small">
                  Cuando el stock baje de este valor, se enviará una alerta
                </Form.Text>
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
                  value={nuevoIngrediente.fecha_vencimiento || ""}
                  onChange={manejoCambioInput}
                  className="rounded-3"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0 p-4" style={{ background: '#f8f9fa' }}>
        <Button variant="light" onClick={() => setMostrarModal(false)} className="rounded-pill px-4">
          Cancelar
        </Button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAgregar}
          disabled={!nuevoIngrediente.nombre?.trim() || !nuevoIngrediente.unidad || deshabilitado}
          className="btn btn-danger rounded-pill px-4 fw-bold"
        >
          <Plus size={16} className="me-2" />
          Guardar Ingrediente
        </motion.button>
      </Modal.Footer>

      <style>{`
        .ingrediente-modal .modal-content {
          border-radius: 28px;
          overflow: hidden;
          border: none;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .btn-close-white {
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 12px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
      `}</style>
    </Modal>
  );
};

export default ModalRegistroIngrediente;