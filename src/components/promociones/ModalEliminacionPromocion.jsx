import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionPromocion = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  eliminarPromocion,
  promocion,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await eliminarPromocion();
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
          ¿Estás seguro de que deseas eliminar la promoción{" "}
          <strong>{promocion?.titulo}</strong>?
        </p>
        <p className="text-danger small">
          ⚠️ Esta acción eliminará la relación con productos asociados.
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

export default ModalEliminacionPromocion;