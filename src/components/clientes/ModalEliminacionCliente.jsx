import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

const ModalEliminacionCliente = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  eliminarCliente,
  cliente,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await eliminarCliente();
    setDeshabilitado(false);
  };

  if (!cliente) return null;

  return (
    <Modal
      show={mostrarModalEliminacion}
      onHide={() => setMostrarModalEliminacion(false)}
      backdrop="static"
      centered
      className="cliente-modal"
    >
      <Modal.Header className="border-0 p-4" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white rounded-circle p-2">
            <AlertTriangle size={24} color="#dc3545" />
          </div>
          <div>
            <Modal.Title className="fw-bold text-white">
              Confirmar Eliminación
            </Modal.Title>
            <p className="text-white-50 small mb-0">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <button onClick={() => setMostrarModalEliminacion(false)} className="btn-close-white">
          <X size={20} />
        </button>
      </Modal.Header>

      <Modal.Body className="p-4">
        <div className="text-center py-3">
          <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
            <AlertTriangle size={48} color="#ffc107" />
          </div>
          <h5 className="fw-bold mb-3">¿Estás seguro?</h5>
          <p className="text-muted mb-2">
            ¿Estás seguro de que deseas eliminar al cliente{" "}
            <strong className="text-danger">
              {cliente.nombre_cliente} {cliente.apellido_cliente}
            </strong>
            ?
          </p>
          <div className="alert alert-danger small mt-3">
            ⚠️ Esta acción eliminará permanentemente al cliente del sistema.
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        <Button variant="light" onClick={() => setMostrarModalEliminacion(false)} className="rounded-pill px-4">
          Cancelar
        </Button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleEliminar}
          disabled={deshabilitado}
          className="btn btn-danger rounded-pill px-4 fw-bold"
        >
          <Trash2 size={16} className="me-2" />
          Eliminar Cliente
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
      `}</style>
    </Modal>
  );
};

export default ModalEliminacionCliente;