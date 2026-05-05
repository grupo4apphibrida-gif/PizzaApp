import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalEdicionUsuario = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  usuarioEditar,
  manejoCambioInputEdicion,
  actualizarUsuario,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarUsuario();
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
          Editar Usuario
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
                  value={usuarioEditar.nombre || ""}
                  onChange={manejoCambioInputEdicion}
                  placeholder="Nombre completo"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  name="correo"
                  value={usuarioEditar.correo || ""}
                  disabled
                />
                <Form.Text className="text-muted">
                  El correo no se puede modificar
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Rol *</Form.Label>
                <Form.Select
                  name="rol"
                  value={usuarioEditar.rol || "cliente"}
                  onChange={manejoCambioInputEdicion}
                >
                  <option value="cliente">🍕 Cliente</option>
                  <option value="empleado">👤 Empleado</option>
                  <option value="admin">👑 Administrador</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="activo"
                  value={usuarioEditar.activo ? "true" : "false"}
                  onChange={(e) =>
                    manejoCambioInputEdicion({
                      target: { name: "activo", value: e.target.value === "true" },
                    })
                  }
                >
                  <option value="true">✅ Activo</option>
                  <option value="false">❌ Inactivo</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <hr />
              <small className="text-muted">
                ID: {usuarioEditar.id} | Creado:{" "}
                {usuarioEditar.creado_en
                  ? new Date(usuarioEditar.creado_en).toLocaleDateString()
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
          disabled={!usuarioEditar.nombre?.trim() || deshabilitado}
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionUsuario;