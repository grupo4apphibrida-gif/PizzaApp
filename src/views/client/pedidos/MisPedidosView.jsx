import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Accordion } from "react-bootstrap";
import { supabase } from "../../../database/supabaseconfig";
import { useAuth } from "../../../context/AuthContext";

const MisPedidosView = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPedidos();
  }, [user]);

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      let query = supabase
        .from("pedidos")
        .select(`
          *,
          detalle_pedido(
            cantidad,
            precio,
            productos(nombre, imagen_url)
          )
        `)
        .order("creado_en", { ascending: false });

      if (user?.id) {
        query = query.eq("usuario_id", user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    } finally {
      setCargando(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      pendiente: { variant: "secondary", text: "⏳ Pendiente", icon: "bi-clock" },
      en_preparacion: { variant: "warning", text: "🍕 En preparación", icon: "bi-egg-fried" },
      listo: { variant: "info", text: "✅ Listo para entregar", icon: "bi-check-circle" },
      entregado: { variant: "success", text: "🎉 Entregado", icon: "bi-truck" },
      cancelado: { variant: "danger", text: "❌ Cancelado", icon: "bi-x-circle" },
    };
    const est = config[estado] || config.pendiente;
    return <Badge bg={est.variant}><i className={`bi ${est.icon} me-1`}></i> {est.text}</Badge>;
  };

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p>Cargando tus pedidos...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        <i className="bi bi-clock-history me-2"></i>
        Mis Pedidos
      </h2>

      {pedidos.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-inbox fs-1 text-muted"></i>
            <h4 className="mt-3">No tienes pedidos aún</h4>
            <p>¡Explora nuestro menú y haz tu primer pedido!</p>
          </Card.Body>
        </Card>
      ) : (
        <Accordion>
          {pedidos.map((pedido, idx) => (
            <Accordion.Item key={pedido.id} eventKey={idx.toString()}>
              <Accordion.Header>
                <div className="d-flex justify-content-between w-100 align-items-center me-3">
                  <div>
                    <strong>Pedido #{pedido.id.slice(-8)}</strong>
                    <span className="mx-3 text-muted">|</span>
                    <small>{new Date(pedido.creado_en).toLocaleDateString()}</small>
                  </div>
                  <div>
                    {getEstadoBadge(pedido.estado)}
                    <span className="ms-3 fw-bold text-success">
                      C$ {Number(pedido.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={8}>
                    <h6>Productos:</h6>
                    {pedido.detalle_pedido?.map((detalle, i) => (
                      <div key={i} className="d-flex justify-content-between mb-2">
                        <div>
                          {detalle.productos?.nombre}
                          <span className="text-muted ms-2">x{detalle.cantidad}</span>
                        </div>
                        <span>C$ {(detalle.precio * detalle.cantidad).toFixed(2)}</span>
                      </div>
                    ))}
                  </Col>
                  <Col md={4}>
                    <div className="bg-light p-3 rounded">
                      <h6>Información del pedido</h6>
                      <hr className="my-2" />
                      <small>
                        <strong>Tipo:</strong> {pedido.tipo || "Cliente"}
                        <br />
                        <strong>Prioridad:</strong> {pedido.prioridad || "Normal"}
                        <br />
                        {pedido.completado_en && (
                          <>
                            <strong>Entregado:</strong> {new Date(pedido.completado_en).toLocaleDateString()}
                          </>
                        )}
                      </small>
                    </div>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Container>
  );
};

export default MisPedidosView;