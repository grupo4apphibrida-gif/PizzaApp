import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { Gift, Percent, Calendar, Image as ImageIcon, X, Save } from "lucide-react";

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

  if (!promocionEditar) return null;

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      centered
      size="lg"
      className="promocion-modal"
    >
      <Modal.Header className="border-0" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white rounded-circle p-2">
            <Gift size={24} color="#dc3545" />
          </div>
          <div>
            <Modal.Title className="fw-bold text-white">Editar Promoción</Modal.Title>
            <p className="text-white-50 small mb-0">Modifica los datos de la oferta</p>
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
                <Form.Label className="fw-bold">
                  <Gift size={14} className="me-1" />
                  Título *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="titulo"
                  value={promocionEditar.titulo || ""}
                  onChange={manejoCambioInputEdicion}
                  className="rounded-3"
                  placeholder="Ej: 2x1 en Pizzas"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  <Percent size={14} className="me-1" />
                  Descuento (%) *
                </Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="descuento"
                  value={promocionEditar.descuento || ""}
                  onChange={manejoCambioInputEdicion}
                  className="rounded-3"
                  placeholder="Ej: 20"
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="descripcion"
                  value={promocionEditar.descripcion || ""}
                  onChange={manejoCambioInputEdicion}
                  className="rounded-3"
                  placeholder="Describe tu promoción..."
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold d-flex align-items-center gap-2">
                  <Calendar size={14} />
                  Fecha de inicio
                </Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_inicio"
                  value={promocionEditar.fecha_inicio || ""}
                  onChange={manejoCambioInputEdicion}
                  className="rounded-3"
                  style={{ cursor: 'pointer' }}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold d-flex align-items-center gap-2">
                  <Calendar size={14} />
                  Fecha de fin
                </Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_fin"
                  value={promocionEditar.fecha_fin || ""}
                  onChange={manejoCambioInputEdicion}
                  className="rounded-3"
                  style={{ cursor: 'pointer' }}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  <ImageIcon size={14} className="me-1" />
                  Nueva Imagen
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={manejoCambioImagen}
                  className="rounded-3"
                />
                <small className="text-muted">Formatos: JPG, PNG, GIF. Máx 2MB</small>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <div className="border rounded-3 p-2 bg-white" style={{ minHeight: '100px' }}>
                {promocionEditar.imagen_url ? (
                  <img
                    src={promocionEditar.imagen_url}
                    alt="Vista previa"
                    className="img-fluid rounded-3"
                    style={{ maxHeight: 100, objectFit: 'cover', width: '100%' }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                    <ImageIcon size={24} className="me-2" />
                    <small>Sin imagen</small>
                  </div>
                )}
              </div>
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3">
                <div className="bg-white p-3 rounded-3 border">
                  <Form.Check
                    type="switch"
                    label="Activa"
                    name="activa"
                    checked={promocionEditar.activa === true}
                    onChange={(e) =>
                      manejoCambioInputEdicion({
                        target: { name: "activa", value: e.target.checked },
                      })
                    }
                    className="fw-bold"
                  />
                  <small className="text-muted">Si está activa, aparecerá en el catálogo</small>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0 p-3" style={{ background: '#f8f9fa' }}>
        <Button variant="light" onClick={() => setMostrarModalEdicion(false)} className="rounded-pill px-4">
          Cancelar
        </Button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleActualizar}
          disabled={!promocionEditar.titulo?.trim() || !promocionEditar.descuento || deshabilitado}
          className="btn btn-danger rounded-pill px-4 fw-bold"
        >
          <Save size={16} className="me-2" />
          Actualizar
        </motion.button>
      </Modal.Footer>

      <style>{`
        .promocion-modal .modal-content {
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
        input[type="date"] {
          cursor: pointer;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.3);
        }
      `}</style>
    </Modal>
  );
};

export default ModalEdicionPromocion;