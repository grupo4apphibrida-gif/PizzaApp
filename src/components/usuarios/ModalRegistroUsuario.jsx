import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalRegistroUsuario = ({
  mostrarModal,
  setMostrarModal,
  nuevoUsuario,
  manejoCambioInput,
  agregarUsuario,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleAgregar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarUsuario();
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
          <i className="bi bi-person-plus-fill me-2"></i>
          Nuevo Usuario
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre completo *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nuevoUsuario.nombre || ""}
                  onChange={manejoCambioInput}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Correo electrónico *</Form.Label>
                <Form.Control
                  type="email"
                  name="correo"
                  value={nuevoUsuario.correo || ""}
                  onChange={manejoCambioInput}
                  placeholder="ejemplo@correo.com"
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contraseña temporal *</Form.Label>
                <Form.Control
                  type="text"
                  name="password"
                  value={nuevoUsuario.password || ""}
                  onChange={manejoCambioInput}
                  placeholder="Generar o escribir"
                />
                <Form.Text className="text-muted">
                  El usuario deberá cambiar su contraseña al iniciar sesión
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Rol *</Form.Label>
                <Form.Select
                  name="rol"
                  value={nuevoUsuario.rol || "empleado"}
                  onChange={manejoCambioInput}
                >
                  <option value="empleado">👤 Empleado</option>
                  <option value="admin">👑 Administrador</option>
                  <option value="cliente">🍕 Cliente</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Los clientes normalmente se registran solos
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Activo"
                  name="activo"
                  checked={nuevoUsuario.activo !== false}
                  onChange={(e) =>
                    manejoCambioInput({
                      target: { name: "activo", value: e.target.checked },
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
          disabled={
            !nuevoUsuario.nombre?.trim() ||
            !nuevoUsuario.correo?.trim() ||
            !nuevoUsuario.password?.trim() ||
            deshabilitado
          }
        >
          <i className="bi bi-save me-2"></i>
          Guardar Usuario
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroUsuario;