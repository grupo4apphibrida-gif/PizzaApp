import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, ListGroup, Navbar, Nav, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Simular carga de pedidos, en realidad desde Supabase
    setPedidos([
      { id: 1, fecha: "2024-04-09", total: 22, items: ["Pizza Margherita", "Pizza Pepperoni"] },
      { id: 2, fecha: "2024-04-08", total: 11, items: ["Pizza Vegetariana"] },
    ]);
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
        <Row className="align-items-center justify-content-between">
          <Col>
            <h2><i className="bi-receipt me-2"></i> Historial de Pedidos</h2>
          </Col>
        </Row>
      </Container>
      <Container className="mt-4">
        <Row>
          <Col>
            {pedidos.length === 0 ? (
              <p>No tienes pedidos aún.</p>
            ) : (
              pedidos.map((pedido) => (
                <Card key={pedido.id} className="order-card mb-3">
                  <Card.Body>
                    <Card.Title>Pedido #{pedido.id}</Card.Title>
                    <Card.Text>Fecha: {pedido.fecha}</Card.Text>
                    <Card.Text>Total: ${pedido.total}</Card.Text>
                    <Card.Text>Items: {pedido.items.join(", ")}</Card.Text>
                  </Card.Body>
                </Card>
              ))
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Pedidos;