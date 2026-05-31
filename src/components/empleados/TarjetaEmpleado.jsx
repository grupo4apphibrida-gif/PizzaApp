import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Spinner, Button } from 'react-bootstrap';

const TarjetaEmpleado = ({ empleados, abrirModalEdicion }) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    setCargando(!(empleados && empleados.length > 0));
  }, [empleados]);

  const manejarTeclaEscape = useCallback((e) => {
    if (e.key === 'Escape') setIdTarjetaActiva(null);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', manejarTeclaEscape);
    return () => window.removeEventListener('keydown', manejarTeclaEscape);
  }, [manejarTeclaEscape]);

  if (cargando) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p>Cargando empleados...</p>
      </div>
    );
  }

  return (
    <div>
      {empleados.map((emp) => {
        const activa = idTarjetaActiva === emp.id_empleado;
        return (
          <Card key={emp.id_empleado} className="mb-2 border shadow-sm position-relative" onClick={() => setIdTarjetaActiva(activa ? null : emp.id_empleado)} style={{ cursor: 'pointer' }}>
            <Card.Body className="p-3">
              <Row className="align-items-center">
                <Col xs={8}>
                  <div className="fw-semibold">{emp.nombre_empleado} {emp.apellido_empleado}</div>
                  <small className="text-muted">{emp.email}</small>
                  <div className="mt-1"><span className="badge bg-primary">{emp.tipo_empleado}</span></div>
                </Col>
                <Col xs={4} className="text-end">
                  <small className="text-muted">ID: {emp.id_empleado}</small>
                </Col>
              </Row>
            </Card.Body>
            {activa && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75 rounded" style={{ borderRadius: '8px' }} onClick={(e) => e.stopPropagation()}>
                <Button variant="warning" size="sm" onClick={() => { abrirModalEdicion(emp); setIdTarjetaActiva(null); }}>
                  <i className="bi bi-pencil"></i> Editar
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default TarjetaEmpleado;
