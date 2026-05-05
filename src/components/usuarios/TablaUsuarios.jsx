import React, { useState, useEffect } from "react";
import { Table, Spinner, Button, Badge } from "react-bootstrap";

const TablaUsuarios = ({
  usuarios = [],
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(!(usuarios && usuarios.length > 0));
  }, [usuarios]);

  const getRolBadge = (rol) => {
    const badges = {
      admin: { variant: "danger", icon: "bi-shield-shaded", text: "Admin" },
      empleado: { variant: "warning", icon: "bi-person-badge", text: "Empleado" },
      cliente: { variant: "success", icon: "bi-person", text: "Cliente" },
    };
    const config = badges[rol] || badges.cliente;
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1" style={{ width: "fit-content" }}>
        <i className={config.icon}></i> {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <Table striped hover responsive className="mb-0">
      <thead className="table-light">
        <tr>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Registro</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario) => (
          <tr key={usuario.id}>
            <td className="fw-semibold">{usuario.nombre}</td>
            <td>{usuario.correo}</td>
            <td>{getRolBadge(usuario.rol)}</td>
            <td>
              {usuario.activo !== false ? (
                <Badge bg="success">Activo</Badge>
              ) : (
                <Badge bg="secondary">Inactivo</Badge>
              )}
            </td>
            <td className="text-muted small">
              {usuario.creado_en
                ? new Date(usuario.creado_en).toLocaleDateString()
                : "N/A"}
            </td>
            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                className="me-1"
                onClick={() => abrirModalEdicion(usuario)}
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => abrirModalEliminacion(usuario)}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaUsuarios;