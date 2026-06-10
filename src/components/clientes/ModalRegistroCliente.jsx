import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { User, Mail, Phone, UserPlus, X } from "lucide-react";

const ModalRegistroCliente = ({
  mostrarModal,
  setMostrarModal,
  nuevoCliente,
  manejoCambioInput,
  agregarCliente,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarCliente();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      centered
      size="lg"
      className="cliente-modal"
    >
      <Modal.Header className="border-0 p-4" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
        <div className="d-flex align-items-center gap-3">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-circle p-2"
          >
            <UserPlus size={24} color="#dc3545" />
          </motion.div>
          <div>
            <Modal.Title className="fw-bold text-white">
              Nuevo Cliente
            </Modal.Title>
            <p className="text-white-50 small mb-0">Registra un nuevo cliente en el sistema</p>
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
                <Form.Label className="fw-bold small">Nombre *</Form.Label>
                <div className="input-icon-wrapper">
                  <User size={18} className="input-icon" />
                  <Form.Control
                    type="text"
                    name="nombre_cliente"
                    value={nuevoCliente.nombre_cliente}
                    onChange={manejoCambioInput}
                    placeholder="Ingresa el nombre"
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
                    value={nuevoCliente.apellido_cliente}
                    onChange={manejoCambioInput}
                    placeholder="Ingresa el apellido"
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
                    value={nuevoCliente.email}
                    onChange={manejoCambioInput}
                    placeholder="ejemplo@correo.com"
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
                    value={nuevoCliente.celular}
                    onChange={manejoCambioInput}
                    placeholder="Ej: 505 8888 1111"
                    className="rounded-3 ps-5"
                  />
                </div>
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
          onClick={handleRegistrar}
          disabled={!nuevoCliente.nombre_cliente.trim() || !nuevoCliente.email.trim() || deshabilitado}
          className="btn btn-danger rounded-pill px-4 fw-bold"
        >
          Guardar Cliente
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

export default ModalRegistroCliente;