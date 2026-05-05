import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Table, Image } from "react-bootstrap";
import { useCarrito } from "../../context/CarritoContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../database/supabaseconfig";

const CarritoView = () => {
  const { carrito, totalItems, totalPrecio, actualizarCantidad, eliminarDelCarrito, vaciarCarrito } = useCarrito();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);

  const realizarPedido = async () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    setProcesando(true);
    try {
      // 1. Crear el pedido
      const pedidoData = {
        total: totalPrecio,
        estado: "pendiente",
        prioridad: "normal",
        tipo: "cliente",
        nombre_cliente: profile?.nombre || "Invitado",
      };

      if (user?.id) {
        pedidoData.usuario_id = user.id;
      }

      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert(pedidoData)
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // 2. Crear los detalles del pedido
      const detalles = carrito.map(item => ({
        pedido_id: pedido.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio: item.precio
      }));

      const { error: detalleError } = await supabase
        .from("detalle_pedido")
        .insert(detalles);

      if (detalleError) throw detalleError;

      // 3. Vaciar carrito
      vaciarCarrito();

      alert("✅ ¡Pedido realizado con éxito!");
      navigate("/cliente/mis-pedidos");
    } catch (error) {
      console.error("Error al realizar pedido:", error);
      alert("Error al realizar el pedido. Intenta de nuevo.");
    } finally {
      setProcesando(false);
    }
  };

  if (carrito.length === 0) {
    return (
      <Container className="py-5 text-center">
        <i className="bi bi-cart-x fs-1 text-muted"></i>
        <h3 className="mt-3">Tu carrito está vacío</h3>
        <p>¡Agrega algunas pizzas deliciosas!</p>
        <Button variant="danger" onClick={() => navigate("/cliente/catalogo")}>
          Ver Menú
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        <i className="bi bi-cart-fill me-2"></i>
        Tu Carrito ({totalItems} {totalItems === 1 ? "producto" : "productos"})
      </h2>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map(item => (
                    <tr key={item.cartItemId || item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {item.imagen ? (
                            <Image src={item.imagen} width="50" height="50" rounded />
                          ) : (
                            <div className="bg-light rounded" style={{ width: "50px", height: "50px" }}>
                              <i className="bi bi-image text-muted"></i>
                            </div>
                          )}
                          <div>
                            <span className="fw-semibold d-block">{item.nombre}</span>
                            {item.tamanio && (
                              <small className="text-muted">
                                {item.tamanio} ({item.piezas})
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>C$ {Number(item.precio).toFixed(2)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => actualizarCantidad(item.cartItemId || item.id, item.cantidad - 1)}
                          >
                            -
                          </Button>
                          <span className="fw-bold" style={{ minWidth: "30px", textAlign: "center" }}>
                            {item.cantidad}
                          </span>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => actualizarCantidad(item.cartItemId || item.id, item.cantidad + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="fw-bold">C$ {(item.precio * item.cantidad).toFixed(2)}</td>
                      <td>
                        <Button
                          variant="link"
                          className="text-danger"
                          onClick={() => eliminarDelCarrito(item.cartItemId || item.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Resumen del Pedido</h5>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>C$ {totalPrecio.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Envío:</span>
                <span className="text-success">Gratis</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="text-danger fs-5">C$ {totalPrecio.toFixed(2)}</strong>
              </div>
              <Button
                variant="danger"
                className="w-100 mb-2"
                onClick={realizarPedido}
                disabled={procesando}
              >
                {procesando ? "Procesando..." : "Confirmar Pedido"}
              </Button>
              <Button variant="outline-secondary" className="w-100" onClick={vaciarCarrito}>
                Vaciar Carrito
              </Button>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-3">
            <Card.Body>
              <h6><i className="bi bi-info-circle me-1"></i> Información</h6>
              <small className="text-muted">
                El pedido se procesará en aproximadamente 20-30 minutos.
                Recibirás notificaciones sobre el estado de tu pedido.
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CarritoView;