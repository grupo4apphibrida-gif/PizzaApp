import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { User, Mail, Phone, Save, X } from "lucide-react";

const ModalEdicionCliente = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  clienteEditar,
  manejoCambioInputEdicion,
  actualizarCliente,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarCliente();
    setDeshabilitado(false);
  };

  if (!clienteEditar) return null;

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      centered
      size="lg"
      className="cliente-modal"
    >
      <Modal.Header className="border-0 p-4" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white rounded-circle p-2">
            <Save size={24} color="#dc3545" />
          </div>
          <div>
            <Modal.Title className="fw-bold text-white">
              Editar Cliente
            </Modal.Title>
            <p className="text-white-50 small mb-0">Modifica los datos del cliente</p>
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
                <div className="input-icon-wrapper">
                  <User size={18} className="input-icon" />
                  <Form.Control
                    type="text"
                    name="nombre_cliente"
                    value={clienteEditar.nombre_cliente}
                    onChange={manejoCambioInputEdicion}
                    className="rounded-3 ps-5"
                  />
                </div>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small">Apellido</Form.Label>
                <div className="input-icon-wrapper">
                  <User size={18} className="input-icon" />
                  <Form.Control
                    type="text"
                    name="apellido_cliente"
                    value={clienteEditar.apellido_cliente}
                    onChange={manejoCambioInputEdicion}
                    className="rounded-3 ps-5"
                  />
                </div>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small">Correo electrónico *</Form.Label>
                <div className="input-icon-wrapper">
                  <Mail size={18} className="input-icon" />
                  <Form.Control
                    type="email"
                    name="email"
                    value={clienteEditar.email}
                    onChange={manejoCambioInputEdicion}
                    className="rounded-3 ps-5"
                  />
                </div>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small">Teléfono</Form.Label>
                <div className="input-icon-wrapper">
                  <Phone size={18} className="input-icon" />
                  <Form.Control
                    type="tel"
                    name="celular"
                    value={clienteEditar.celular}
                    onChange={manejoCambioInputEdicion}
                    className="rounded-3 ps-5"
                  />
                </div>
              </Form.Group>
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
          disabled={!clienteEditar.nombre_cliente?.trim() || !clienteEditar.email?.trim() || deshabilitado}
          className="btn btn-danger rounded-pill px-4 fw-bold"
        >
          Actualizar Cliente
        </motion.button>
      </Modal.Footer>

      <style>{`
        .cliente-modal .modal-content {
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
        .input-icon-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #adb5bd;
          z-index: 1;
        }
      `}</style>
    </Modal>
  );
};

export default ModalEdicionCliente;