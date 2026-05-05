import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionUsuario = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  eliminarUsuario,
  usuario,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await eliminarUsuario();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModalEliminacion}
      onHide={() => setMostrarModalEliminacion(false)}
      backdrop="static"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i>
          Confirmar Eliminación
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          ¿Estás seguro de que deseas eliminar al usuario{" "}
          <strong>{usuario?.nombre}</strong>?
        </p>
        <p className="text-danger small">
          ⚠️ Esta acción eliminará también todos los datos relacionados
          (pedidos, calificaciones, etc.)
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEliminacion(false)}>
          Cancelar
        </Button>

        <Button variant="danger" onClick={handleEliminar} disabled={deshabilitado}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionUsuario;