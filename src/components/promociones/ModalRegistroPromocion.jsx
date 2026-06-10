import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { Gift, Percent, Calendar, Image as ImageIcon, X, Save, Upload } from "lucide-react";

const ModalRegistroPromocion = ({
  mostrarModal,
  setMostrarModal,
  nuevaPromocion,
  manejoCambioInput,
  manejoCambioImagen,
  agregarPromocion,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
    manejoCambioImagen(e);
  };

  const handleAgregar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarPromocion();
    setPreviewImage(null);
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => {
        setMostrarModal(false);
        setPreviewImage(null);
      }}
      backdrop="static"
      centered
      size="lg"
      className="promocion-modal"
    >
      <Modal.Header className="border-0" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
        <div className="d-flex align-items-center gap-3">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-circle p-2"
          >
            <Gift size={24} color="#dc3545" />
          </motion.div>
          <div>
            <Modal.Title className="fw-bold text-white">Nueva Promoción</Modal.Title>
            <p className="text-white-50 small mb-0">Crea ofertas especiales para tus clientes</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setMostrarModal(false);
            setPreviewImage(null);
          }}
          className="btn-close-white"
        >
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
                  value={nuevaPromocion.titulo || ""}
                  onChange={manejoCambioInput}
                  placeholder="Ej: 2x1 en Pizzas"
                  className="rounded-3"
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
                  value={nuevaPromocion.descuento || ""}
                  onChange={manejoCambioInput}
                  placeholder="Ej: 20"
                  className="rounded-3"
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
                  value={nuevaPromocion.descripcion || ""}
                  onChange={manejoCambioInput}
                  placeholder="Descripción de la promoción..."
                  className="rounded-3"
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
                  value={nuevaPromocion.fecha_inicio || ""}
                  onChange={manejoCambioInput}
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
                  value={nuevaPromocion.fecha_fin || ""}
                  onChange={manejoCambioInput}
                  className="rounded-3"
                  style={{ cursor: 'pointer' }}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  <ImageIcon size={14} className="me-1" />
                  Imagen
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  className="rounded-3"
                />
                <small className="text-muted">Formatos: JPG, PNG, GIF. Máx 2MB</small>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <div className="border rounded-3 p-2 bg-white" style={{ minHeight: '100px' }}>
                {previewImage || nuevaPromocion.imagen_url ? (
                  <img
                    src={previewImage || nuevaPromocion.imagen_url}
                    alt="Vista previa"
                    className="img-fluid rounded-3"
                    style={{ maxHeight: 100, objectFit: 'cover', width: '100%' }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                    <Upload size={24} className="me-2" />
                    <small>Vista previa de la imagen</small>
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
                    checked={nuevaPromocion.activa !== false}
                    onChange={(e) =>
                      manejoCambioInput({
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
        <Button 
          variant="light" 
          onClick={() => {
            setMostrarModal(false);
            setPreviewImage(null);
          }}
          className="rounded-pill px-4"
        >
          Cancelar
        </Button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAgregar}
          disabled={!nuevaPromocion.titulo?.trim() || !nuevaPromocion.descuento || deshabilitado}
          className="btn btn-danger rounded-pill px-4 fw-bold"
        >
          <Save size={16} className="me-2" />
          Guardar Promoción
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

export default ModalRegistroPromocion;