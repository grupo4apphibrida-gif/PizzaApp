import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Navbar, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../database/supabaseconfig";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Simular carga de productos, en realidad desde Supabase
    setProductos([
      { id: 1, nombre: "Pizza Margherita", precio: 10, descripcion: "Tomate, mozzarella, albahaca" },
      { id: 2, nombre: "Pizza Pepperoni", precio: 12, descripcion: "Tomate, mozzarella, pepperoni" },
      { id: 3, nombre: "Pizza Vegetariana", precio: 11, descripcion: "Tomate, mozzarella, verduras" },
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
        <Row className="align-items-center">
          <Col>
            <h2><i className="bi-shop me-2"></i> Menú de Pizzas</h2>
          </Col>
        </Row>
      </Container>
      <Container className="mt-4">
        <Row className="g-4">
          {productos.map((producto) => (
            <Col md={4} key={producto.id} className="mb-4">
              <Card className="card-pizza h-100">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <Card.Title>{producto.nombre}</Card.Title>
                    <Card.Text>{producto.descripcion}</Card.Text>
                  </div>
                  <div>
                    <Card.Text className="fw-bold">${producto.precio}</Card.Text>
                    <Button
                      variant="primary"
                      className="btn-brand w-100"
                      onClick={() => addToCart(producto)}
                    >
                      <i className="bi bi-cart-plus-fill me-2"></i>Agregar al Carrito
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default Productos;