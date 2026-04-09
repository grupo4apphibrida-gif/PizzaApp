
import React from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

const FormularioLogin = ({ 
  usuario, 
  contrasena, 
  error, 
  setUsuario, 
  setContrasena, 
  iniciarSesion 
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    await iniciarSesion();
  };

  return (
    <Card 
      style={{ 
        width: "420px", 
        maxWidth: "100%", 
        boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
        borderRadius: "16px",
        border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(255,255,255,0.92)",
      }}
    >
      <Card.Body className="p-4">
        <h3 className="text-center mb-4 text-primary">Iniciar Sesión</h3>
        
        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Campo Usuario (Correo) */}
          <Form.Group className="mb-3">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingrese su correo"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </Form.Group>

          {/* Campo Contraseña */}
          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingrese su contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </Form.Group>

          {/* Botón Iniciar Sesión */}
          <Button 
            type="submit"
            variant="primary" 
            className="w-100 mt-3 py-2 fw-bold"
          >
            Iniciar Sesión
          </Button>
        </Form>

        <div className="text-center mt-3">
          <p>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FormularioLogin;