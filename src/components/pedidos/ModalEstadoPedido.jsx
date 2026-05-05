import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEstadoPedido = ({
  mostrarModalEstado,
  setMostrarModalEstado,
  pedidoActualizar,
  nuevoEstado,
  setNuevoEstado,
  actualizarEstadoPedido,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarEstadoPedido();
    setDeshabilitado(false);
  };

  const estados = [
    { value: "pendiente", label: "⏳ Pendiente", variant: "secondary" },
    { value: "en_preparacion", label: "🍕 En preparación", variant: "warning" },
    { value: "listo", label: "✅ Listo para entregar", variant: "info" },
    { value: "entregado", label: "🎉 Entregado", variant: "success" },
    { value: "cancelado", label: "❌ Cancelado", variant: "danger" },
  ];

  return (
    <Modal
      show={mostrarModalEstado}
      onHide={() => setMostrarModalEstado(false)}
      backdrop="static"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-truck me-2"></i>
          Actualizar Estado del Pedido
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Pedido: <strong>{pedidoActualizar?.id?.slice(-8)}</strong>
        </p>
        <p>
          Cliente: <strong>{pedidoActualizar?.usuarios?.nombre || pedidoActualizar?.nombre_cliente || "Anónimo"}</strong>
        </p>

        <Form.Group className="mb-3">
          <Form.Label>Estado actual</Form.Label>
          <Form.Select
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
          >
            {estados.map((est) => (
              <option key={est.value} value={est.value}>
                {est.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEstado(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleActualizar} disabled={deshabilitado}>
          Actualizar Estado
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEstadoPedido;