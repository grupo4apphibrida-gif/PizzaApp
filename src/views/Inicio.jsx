import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Navbar, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";

const Inicio = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("usuario-supabase");
    navigate("/login");
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="navbar-custom">
        <Container>
          <Navbar.Brand>PizzaApp</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/productos">Menú</Nav.Link>
            <Nav.Link as={Link} to="/carrito">Carrito</Nav.Link>
            <Nav.Link as={Link} to="/pedidos">Pedidos</Nav.Link>
          </Nav>
          <Nav>
            <Navbar.Text>Hola, {user?.email}</Navbar.Text>
            <Button variant="outline-light" onClick={handleLogout} className="ms-2">Cerrar Sesión</Button>
          </Nav>
        </Container>
      </Navbar>
      <Container className="page-hero mt-3">
        <Row className="align-items-center justify-content-center">
          <Col lg={8}>
            <h2><i className="bi-house-fill me-2"></i> Inicio</h2>
            <p>Bienvenido a PizzaApp. Explora nuestro menú y realiza tu pedido.</p>
            <Button as={Link} to="/productos" className="btn-brand hero-button">
              <i className="bi bi-basket3 me-2"></i>Ver Menú
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Inicio;