import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Badge, Modal, Form } from "react-bootstrap";
import { useCarrito } from "../../context/CarritoContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../database/supabaseconfig";
import { 
  ShoppingBag, Trash2, Plus, Minus, Truck, Store, 
  MapPin, Clock, CreditCard, Pizza, CheckCircle, Lock
} from "lucide-react";
import { motion } from "framer-motion";

// Función para validar si un ID es UUID
const isUUID = (id) => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(String(id));
};

const CarritoView = () => {
  const { 
    carrito, 
    totalItems, 
    totalPrecio, 
    costoEnvio, 
    totalConEnvio, 
    actualizarCantidad, 
    eliminarDelCarrito, 
    vaciarCarrito 
  } = useCarrito();
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);
  const [pedidoExitoso, setPedidoExitoso] = useState(false);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [datosTarjeta, setDatosTarjeta] = useState({ 
    nombreTarjeta: "", 
    numeroTarjeta: "", 
    fechaExpiracion: "", 
    cvv: "" 
  });

  const formatearNumeroTarjeta = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatearFechaExpiracion = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    return cleaned;
  };

  const actualizarDatosTarjeta = (campo, valor) => {
    if (campo === "numeroTarjeta") {
      valor = formatearNumeroTarjeta(valor);
      if (valor.length > 19) return;
    }
    if (campo === "fechaExpiracion") {
      valor = formatearFechaExpiracion(valor);
      if (valor.length > 5) return;
    }
    if (campo === "cvv" && valor.length > 3) return;
    setDatosTarjeta(prev => ({ ...prev, [campo]: valor }));
  };

  const validarFormulario = () => {
    if (!datosTarjeta.nombreTarjeta.trim()) {
      alert("Ingresa el nombre en la tarjeta");
      return false;
    }
    if (datosTarjeta.numeroTarjeta.replace(/\s/g, '').length < 16) {
      alert("Número de tarjeta inválido (16 dígitos)");
      return false;
    }
    if (datosTarjeta.fechaExpiracion.length < 5) {
      alert("Fecha de expiración inválida (MM/AA)");
      return false;
    }
    if (datosTarjeta.cvv.length < 3) {
      alert("CVV inválido (3 dígitos)");
      return false;
    }
    return true;
  };

  const handleRealizarPedido = () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }
    setMostrarModalPago(true);
  };

  const procesarPedido = async () => {
    if (!validarFormulario()) return;
    
    setProcesando(true);
    
    try {
      console.log("🚀 Iniciando proceso de pedido...");
      console.log("📦 Carrito:", carrito);
      
      const tipoEntrega = carrito.some(item => item.tipoEntrega === "envio") ? "envio" : "retiro";
      const direccionPrincipal = carrito.find(item => item.tipoEntrega === "envio")?.direccionEnvio || null;

      // Determinar si el ID es UUID o número
      const userId = user?.id;
      const esUUID = isUUID(userId);
      
      console.log("🆔 User ID:", userId);
      console.log("📋 Es UUID:", esUUID);

      // Determinar nombre del cliente
      let nombreCliente = profile?.name || profile?.nombre;
      if (!nombreCliente || nombreCliente.trim() === "" || nombreCliente.includes("null")) {
        nombreCliente = (profile?.email || user?.email || "").split("@")[0];
      }
      if (!nombreCliente || nombreCliente.trim() === "") {
        nombreCliente = "Invitado";
      }

      const pedidoData = {
        total: totalConEnvio,
        estado: "pendiente",
        prioridad: "normal",
        tipo: "cliente",
        nombre_cliente: nombreCliente,
        email_cliente: profile?.email || user?.email || null,
        telefono_cliente: profile?.telefono || null,
        tipo_entrega: tipoEntrega,
        direccion_envio: direccionPrincipal,
        costo_envio: costoEnvio,
        creado_en: new Date().toISOString(),
      };
      
      // Si es UUID, usar usuario_id; si es número, usar cliente_id
      if (esUUID) {
        pedidoData.usuario_id = userId;
      } else if (userId && !isNaN(Number(userId))) {
        pedidoData.cliente_id = Number(userId);
      }

      console.log("📤 Enviando pedido a Supabase:", pedidoData);

      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([pedidoData])
        .select()
        .single();

      if (pedidoError) {
        console.error("❌ Error en pedido:", pedidoError);
        throw new Error(pedidoError.message);
      }

      console.log("✅ Pedido creado exitosamente:", pedido);

      const detalles = carrito.map(item => ({
        pedido_id: pedido.id,
        producto_id: String(item.id),
        cantidad: item.cantidad,
        precio: item.precio,
        tamanio: item.tamanio || null,
        piezas: item.piezas || null,
        tipo_entrega: item.tipoEntrega || "retiro",
        direccion_envio: item.direccionEnvio || null,
        descuento: item.descuento || 0,
        precio_original: item.precioOriginal || item.precio,
        es_promocion: item.esPromocion || false
      }));

      console.log("📤 Enviando detalles del pedido:", detalles);

      const { error: detalleError } = await supabase
        .from("detalle_pedido")
        .insert(detalles);
      
      if (detalleError) {
        console.error("❌ Error en detalles:", detalleError);
        throw new Error(detalleError.message);
      }

      console.log("✅ Todo correcto! Pedido completado con éxito");

      vaciarCarrito();
      setMostrarModalPago(false);
      setPedidoExitoso(true);
      
      setTimeout(() => {
        navigate("/cliente/mis-pedidos");
      }, 2000);

    } catch (error) {
      console.error("❌ Error general en procesarPedido:", error);
      alert(`Error al procesar el pedido: ${error.message}`);
    } finally {
      setProcesando(false);
    }
  };

  if (carrito.length === 0 && !pedidoExitoso) {
    return (
      <Container className="py-5 text-center">
        <ShoppingBag size={64} className="text-muted mb-3" />
        <h3 className="fw-bold mb-3">Tu carrito está vacío</h3>
        <Button variant="danger" className="rounded-pill px-5" onClick={() => navigate("/cliente/catalogo")}>
          <Pizza size={18} className="me-2" /> Ver Menú
        </Button>
      </Container>
    );
  }

  if (pedidoExitoso) {
    return (
      <Container className="py-5 text-center">
        <CheckCircle size={64} className="text-success mb-3" />
        <h3 className="fw-bold text-success">¡Pedido Realizado con Éxito!</h3>
        <p className="text-muted">Redirigiendo a tus pedidos...</p>
        <div className="spinner-border text-danger mt-3" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <ShoppingBag size={28} color="#dc3545" />
        <h2 className="fw-bold mb-0">Mi Carrito</h2>
        <Badge bg="danger" className="rounded-pill">{totalItems} productos</Badge>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '24px' }}>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th style={{ padding: '16px', width: '45%' }}>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map(item => (
                    <tr key={item.cartItemId}>
                      <td style={{ padding: '16px' }}>
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-light rounded-3 d-flex align-items-center justify-content-center" 
                               style={{ width: '60px', height: '60px' }}>
                            {item.imagen ? 
                              <img src={item.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : 
                              <Pizza size={28} className="text-muted" />
                            }
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">{item.nombre}</h6>
                            {item.tamanio && <Badge bg="light" text="dark" className="me-1">{item.tamanio}</Badge>}
                            <div className="mt-1">
                              {item.tipoEntrega === "envio" ? 
                                <Badge bg="warning"><Truck size={10} /> Envío</Badge> : 
                                <Badge bg="success"><Store size={10} /> Retiro</Badge>
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">C$ {Number(item.precio).toFixed(2)}</td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center gap-2">
                          <button className="btn-cantidad" onClick={() => actualizarCantidad(item.cartItemId, item.cantidad - 1)}>
                            <Minus size={14} />
                          </button>
                          <span className="fw-bold" style={{ minWidth: '35px', textAlign: 'center' }}>{item.cantidad}</span>
                          <button className="btn-cantidad" onClick={() => actualizarCantidad(item.cartItemId, item.cantidad + 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="align-middle fw-bold text-danger">
                        C$ {(item.precio * item.cantidad).toFixed(2)}
                      </td>
                      <td>
                        <button className="btn-eliminar" onClick={() => eliminarDelCarrito(item.cartItemId)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <div className="d-flex gap-3">
            <Button variant="outline-danger" className="rounded-pill px-4" onClick={() => navigate("/cliente/catalogo")}>
              <Pizza size={18} className="me-2" /> Seguir comprando
            </Button>
            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={vaciarCarrito}>
              Vaciar carrito
            </Button>
          </div>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '24px' }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">Resumen del Pedido</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>C$ {totalPrecio.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Envío</span>
                {costoEnvio > 0 ? 
                  <span>C$ {costoEnvio.toFixed(2)}</span> : 
                  <span className="text-success">Gratis</span>
                }
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total</strong>
                <strong className="text-danger fs-3">C$ {totalConEnvio.toFixed(2)}</strong>
              </div>
              <Button 
                variant="danger" 
                className="w-100 rounded-pill py-3 fw-bold" 
                onClick={handleRealizarPedido}
              >
                <CreditCard size={18} className="me-2" /> Pagar con Tarjeta
              </Button>
              <div className="bg-light rounded-3 p-3 mt-3">
                <small>⏱ Tiempo estimado: {costoEnvio > 0 ? "30-45 min" : "15-20 min"}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de Pago */}
      <Modal show={mostrarModalPago} onHide={() => setMostrarModalPago(false)} centered>
        <Modal.Header className="bg-danger text-white">
          <Modal.Title>Pago con Tarjeta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre en la tarjeta</Form.Label>
              <Form.Control 
                type="text" 
                value={datosTarjeta.nombreTarjeta} 
                onChange={e => actualizarDatosTarjeta("nombreTarjeta", e.target.value)} 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Número de tarjeta</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="**** **** **** ****" 
                value={datosTarjeta.numeroTarjeta} 
                onChange={e => actualizarDatosTarjeta("numeroTarjeta", e.target.value)} 
              />
            </Form.Group>
            
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Fecha expiración</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="MM/AA" 
                    value={datosTarjeta.fechaExpiracion} 
                    onChange={e => actualizarDatosTarjeta("fechaExpiracion", e.target.value)} 
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>CVV</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="***" 
                    maxLength="3" 
                    value={datosTarjeta.cvv} 
                    onChange={e => actualizarDatosTarjeta("cvv", e.target.value)} 
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="bg-light rounded-3 p-3 mt-3">
              <div className="d-flex justify-content-between">
                <strong>Total a pagar:</strong>
                <strong className="text-danger">C$ {totalConEnvio.toFixed(2)}</strong>
              </div>
            </div>
            <div className="text-center mt-2">
              <small><Lock size={12} /> Pago 100% seguro</small>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setMostrarModalPago(false)}>Cancelar</Button>
          <Button 
            variant="danger" 
            onClick={procesarPedido} 
            disabled={procesando}
          >
            {procesando ? "Procesando..." : `Pagar C$ ${totalConEnvio.toFixed(2)}`}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .btn-cantidad { 
          width: 32px; 
          height: 32px; 
          border-radius: 10px; 
          border: 1px solid #dee2e6; 
          background: white; 
        }
        .btn-cantidad:hover { 
          background: #dc3545; 
          color: white; 
          border-color: #dc3545; 
        }
        .btn-eliminar { 
          background: none; 
          border: none; 
          color: #dc3545; 
          opacity: 0.6; 
        }
        .btn-eliminar:hover { 
          opacity: 1; 
        }
      `}</style>
    </Container>
  );
};

export default CarritoView;