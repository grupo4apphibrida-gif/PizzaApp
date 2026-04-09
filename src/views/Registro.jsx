import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

const Registro = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError("Por favor complete todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        alert("Registro exitoso. Revisa tu email para confirmar.");
        navigate("/login");
      }
    } catch (err) {
      setError("Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
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
          <h3 className="text-center mb-4 text-primary">Registrarse</h3>
          
          {error && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingrese su correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirme su contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? "Registrando..." : "Registrarse"}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Registro;