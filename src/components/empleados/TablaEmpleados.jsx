import React, { useState, useEffect } from 'react';
import { Table, Spinner, Button } from 'react-bootstrap';

const TablaEmpleados = ({ empleados, abrirModalEdicion }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(!(empleados && empleados.length > 0));
  }, [empleados]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p>Cargando empleados...</p>
      </div>
    );
  }

  return (
    <Table striped hover responsive>
      <thead className="table-light">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Email</th>
          <th>Celular</th>
          <th>PIN</th>
          <th>Rol</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {empleados.map((emp) => (
          <tr key={emp.id_empleado}>
            <td className="text-muted small">{emp.id_empleado}</td>
            <td className="fw-semibold">{emp.nombre_empleado}</td>
            <td>{emp.apellido_empleado}</td>
            <td>{emp.email}</td>
            <td>{emp.celular || '-'}</td>
            <td>{emp.pin || '-'}</td>
            <td><span className="badge bg-primary">{emp.tipo_empleado}</span></td>
            <td className="text-center">
              <Button variant="outline-warning" size="sm" onClick={() => abrirModalEdicion(emp)}>
                <i className="bi bi-pencil"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaEmpleados;
