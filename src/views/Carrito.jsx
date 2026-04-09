import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, ListGroup, Navbar, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../database/supabaseconfig";

const Carrito = () => {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
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

  const handleCheckout = () => {
    // Simular checkout, en realidad procesar pago y guardar orden en Supabase
    alert("Pedido realizado con éxito!");
    clearCart();
    navigate("/");
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
            <h2><i className="bi-cart-fill me-2"></i> Carrito de Compras</h2>
          </Col>
        </Row>
      </Container>
      <Container className="mt-4">
        <Row>
          <Col>
            <Card className="dashboard-panel">
              <Card.Body>
                {cart.length === 0 ? (
                  <p className="mb-0">El carrito está vacío.</p>
                ) : (
                  <>
                    <ListGroup variant="flush" className="cart-list">
                      {cart.map((item) => (
                        <ListGroup.Item key={item.id}>
                          <Row className="align-items-center gx-2">
                            <Col xs={12} md={4} className="mb-2 mb-md-0">
                              <strong>{item.nombre}</strong>
                            </Col>
                            <Col xs={6} md={2}>${item.precio}</Col>
                            <Col xs={6} md={2} className="d-flex align-items-center gap-2">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="btn-circle"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <i className="bi bi-dash-lg"></i>
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="btn-circle"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <i className="bi bi-plus-lg"></i>
                              </Button>
                            </Col>
                            <Col xs={6} md={2}>${item.precio * item.quantity}</Col>
                            <Col xs={6} md={2} className="text-end">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <i className="bi bi-trash-fill"></i>
                              </Button>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                    <hr />
                    <Row className="align-items-center">
                      <Col>
                        <strong>Total: ${total}</strong>
                      </Col>
                      <Col className="text-md-end mt-3 mt-md-0">
                        <Button variant="success" className="btn-brand cart-button me-2" onClick={handleCheckout}>
                          <i className="bi bi-credit-card-fill me-2"></i>Pagar
                        </Button>
                        <Button variant="outline-secondary" className="cart-button" onClick={clearCart}>
                          Vaciar Carrito
                        </Button>
                      </Col>
                    </Row>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Carrito;