import React from 'react';
import { Modal, Form, Button, Row, Col, Badge } from 'react-bootstrap';

const ModalEdicionPermisos = ({
  mostrar,
  setMostrar,
  rolEditar,
  setRolEditar,
  guardarCambios
}) => {
  const actualizarSwitch = (permisoKey, valor) => {
    setRolEditar(prev => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [permisoKey]: valor
      }
    }));
  };

  if (!rolEditar) return null;

  const permisosAgrupados = {
    "Visualización": Object.keys(rolEditar.permisos || {}).filter(k => k.startsWith('ver_')),
    "Creación": Object.keys(rolEditar.permisos || {}).filter(k => k.startsWith('crear_')),
    "Edición": Object.keys(rolEditar.permisos || {}).filter(k => k.startsWith('editar_')),
    "Eliminación": Object.keys(rolEditar.permisos || {}).filter(k => k.startsWith('eliminar_')),
    "Otros": Object.keys(rolEditar.permisos || {}).filter(k =>
      !k.startsWith('ver_') && !k.startsWith('crear_') &&
      !k.startsWith('editar_') && !k.startsWith('eliminar_')
    )
  };

  return (
    <Modal show={mostrar} onHide={() => setMostrar(false)} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Editar Permisos - <Badge bg="primary">{rolEditar.rol}</Badge>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-3">{rolEditar.descripcion}</p>

        {Object.entries(permisosAgrupados).map(([categoria, listaPermisos]) => (
          listaPermisos.length > 0 && (
            <div key={categoria} className="mb-4">
              <h6 className="border-bottom pb-2 mb-3">{categoria}</h6>
              <Row>
                {listaPermisos.map((key) => (
                  <Col md={6} key={key} className="mb-2">
                    <Form.Check
                      type="switch"
                      id={`permiso-${key}`}
                      label={key.replace(/_/g, ' ').toUpperCase()}
                      checked={!!rolEditar.permisos[key]}
                      onChange={(e) => actualizarSwitch(key, e.target.checked)}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )
        ))}

        {Object.keys(rolEditar.permisos || {}).length === 0 && (
          <p className="text-center text-muted">No hay permisos definidos para este rol.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrar(false)}>
          Cancelar
        </Button>
        <Button variant="success" onClick={guardarCambios}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionPermisos;
