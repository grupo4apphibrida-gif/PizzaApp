import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Button, Modal, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import { supabase } from "../../../database/supabaseconfig";
import { useAuth } from "../../../context/AuthContext";
import { Clock, Package, CheckCircle, Truck, XCircle, Pizza, MapPin, CreditCard, Star, MessageCircle, X } from "lucide-react";
import StarsRating from "../../../components/calificaciones/StarsRating";

const MisPedidosView = () => {
  const { user, profile } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [detalles, setDetalles] = useState({});
  const [cargando, setCargando] = useState(true);
  const [expandedPedido, setExpandedPedido] = useState(null);
  
  // Estados para calificaciones
  const [mostrarModalCalificacion, setMostrarModalCalificacion] = useState(false);
  const [productoParaCalificar, setProductoParaCalificar] = useState(null);
  const [pedidoParaCalificar, setPedidoParaCalificar] = useState(null);
  const [puntuacion, setPuntuacion] = useState(0);
  const [titulo, setTitulo] = useState('');
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarPedidos();
  }, [user, profile]);

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      
      const emailCliente = profile?.email || user?.email;
      
      if (!emailCliente) {
        console.log("No hay email de usuario");
        setPedidos([]);
        setCargando(false);
        return;
      }
      
      console.log("📧 Buscando pedidos para email:", emailCliente);
      
      const { data: pedidosData, error: pedidosError } = await supabase
        .from("pedidos")
        .select("*")
        .eq("email_cliente", emailCliente)
        .order("creado_en", { ascending: false });

      if (pedidosError) throw pedidosError;
      
      console.log("✅ Pedidos encontrados:", pedidosData?.length || 0);
      setPedidos(pedidosData || []);
      
      if (pedidosData && pedidosData.length > 0) {
        const detallesMap = {};
        
        for (const pedido of pedidosData) {
          const { data: detallesData, error: detallesError } = await supabase
            .from("detalle_pedido")
            .select("*")
            .eq("pedido_id", pedido.id);
          
          if (!detallesError && detallesData) {
            detallesMap[pedido.id] = detallesData;
          }
        }
        
        setDetalles(detallesMap);
      }
      
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    } finally {
      setCargando(false);
    }
  };

  const verificarCalificacionExistente = async (productoId, pedidoId) => {
    const { data, error } = await supabase
      .from("calificaciones")
      .select("id")
      .eq("producto_id", productoId)
      .eq("pedido_id", pedidoId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error verificando calificación:", error);
    }
    return data !== null;
  };

  const abrirModalCalificacion = async (producto, pedido) => {
    // Verificar si ya calificó este producto en este pedido
    const yaCalificado = await verificarCalificacionExistente(producto.producto_id, pedido.id);
    
    if (yaCalificado) {
      alert("Ya has calificado este producto para este pedido");
      return;
    }
    
    setProductoParaCalificar({
      id: producto.producto_id,
      nombre: `Producto ${producto.producto_id?.substring(0, 8)}`,
      cantidad: producto.cantidad,
      precio: producto.precio
    });
    setPedidoParaCalificar(pedido);
    setPuntuacion(0);
    setTitulo('');
    setComentario('');
    setMostrarModalCalificacion(true);
  };

  const enviarCalificacion = async () => {
    if (puntuacion === 0) {
      alert('Por favor selecciona una puntuación');
      return;
    }

    setEnviando(true);
    try {
      const { error } = await supabase
        .from("calificaciones")
        .insert([{
          usuario_id: user?.id,
          pedido_id: pedidoParaCalificar.id,
          producto_id: productoParaCalificar.id,
          puntuacion: puntuacion,
          titulo: titulo || null,
          comentario: comentario || null,
          visible: true
        }]);

      if (error) throw error;
      
      alert("✅ ¡Gracias por tu calificación!");
      setMostrarModalCalificacion(false);
      
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar calificación: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  const getEstadoConfig = (estado) => {
    const config = {
      pendiente: { variant: "warning", text: "Pendiente", icon: <Clock size={14} />, color: "#ffc107" },
      en_preparacion: { variant: "info", text: "En preparación", icon: <Pizza size={14} />, color: "#17a2b8" },
      entregado: { variant: "success", text: "Entregado", icon: <CheckCircle size={14} />, color: "#28a745" },
      cancelado: { variant: "danger", text: "Cancelado", icon: <XCircle size={14} />, color: "#dc3545" },
    };
    return config[estado] || config.pendiente;
  };

  const getProgressWidth = (estado) => {
    switch(estado) {
      case 'pendiente': return '25%';
      case 'en_preparacion': return '50%';
      case 'entregado': return '100%';
      default: return '25%';
    }
  };

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <Spinner animation="border" variant="danger" size="lg" />
        </motion.div>
        <p className="mt-3 text-muted">Cargando tus pedidos...</p>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container-fluid py-4"
    >
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-danger bg-opacity-10 rounded-circle p-2">
          <Clock size={28} color="#dc3545" />
        </div>
        <h2 className="fw-bold mb-0">Mis Pedidos</h2>
        <Badge bg="danger" className="rounded-pill px-3 py-2">
          {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
        </Badge>
      </div>

      {pedidos.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm" style={{ borderRadius: '24px' }}>
          <Card.Body>
            <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
              <Package size={48} className="text-muted" />
            </div>
            <h4 className="fw-bold mb-2">No tienes pedidos aún</h4>
            <p className="text-muted mb-4">¡Explora nuestro menú y haz tu primer pedido!</p>
            <Button 
              variant="danger" 
              className="rounded-pill px-4 py-2"
              onClick={() => window.location.href = "/cliente/catalogo"}
            >
              <Pizza size={18} className="me-2" />
              Ver Menú
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="row g-4">
          {pedidos.map((pedido, idx) => {
            const estadoConfig = getEstadoConfig(pedido.estado);
            const isExpanded = expandedPedido === pedido.id;
            const pedidoDetalles = detalles[pedido.id] || [];
            const pedidoEntregado = pedido.estado === 'entregado';
            
            return (
              <div key={pedido.id} className="col-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="border-0 shadow-sm" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                    {/* Header del pedido */}
                    <div 
                      className="p-4 border-bottom bg-light"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setExpandedPedido(isExpanded ? null : pedido.id)}
                    >
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                          <h6 className="fw-bold mb-1">
                            Pedido #{pedido.id?.substring(0, 8)}
                          </h6>
                          <small className="text-muted">
                            {new Date(pedido.creado_en).toLocaleDateString()} - {new Date(pedido.creado_en).toLocaleTimeString()}
                          </small>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <Badge 
                            bg={estadoConfig.variant} 
                            className="d-flex align-items-center gap-1 px-3 py-2 rounded-pill"
                          >
                            {estadoConfig.icon}
                            {estadoConfig.text}
                          </Badge>
                          <span className="fw-bold text-danger fs-4">
                            C$ {Number(pedido.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Barra de progreso */}
                      <div className="mt-3">
                        <div className="progress" style={{ height: '6px', borderRadius: '3px' }}>
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: getProgressWidth(pedido.estado),
                              background: 'linear-gradient(90deg, #dc3545, #ff6b6b)'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Detalles del pedido (expandible) */}
                    {isExpanded && (
                      <div className="p-4 bg-white">
                        <Row>
                          <Col md={8}>
                            <h6 className="fw-bold mb-3">📋 Productos:</h6>
                            {pedidoDetalles.length === 0 ? (
                              <p className="text-muted">No hay detalles disponibles</p>
                            ) : (
                              pedidoDetalles.map((detalle, i) => (
                                <div key={i} className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                  <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                      <span className="fw-semibold">
                                        Producto {detalle.producto_id?.substring(0, 8)}
                                      </span>
                                      {detalle.tamanio && (
                                        <Badge bg="light" text="dark" className="rounded-pill">{detalle.tamanio}</Badge>
                                      )}
                                    </div>
                                    <div className="text-muted small">Cantidad: {detalle.cantidad}</div>
                                  </div>
                                  <div className="text-end">
                                    <div className="fw-bold text-danger">
                                      C$ {(detalle.precio * detalle.cantidad).toFixed(2)}
                                    </div>
                                    {pedidoEntregado && (
                                      <button
                                        className="btn btn-sm btn-outline-warning rounded-pill mt-2"
                                        onClick={() => abrirModalCalificacion(detalle, pedido)}
                                      >
                                        <Star size={14} className="me-1" /> Calificar
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </Col>
                          
                          <Col md={4}>
                            <div className="bg-light p-3 rounded-3">
                              <h6 className="fw-bold mb-2">📦 Información del pedido</h6>
                              <hr className="my-2" />
                              <div className="d-flex justify-content-between mb-2">
                                <small className="text-muted">Tipo de entrega:</small>
                                <small className="fw-semibold">
                                  {pedido.tipo_entrega === "envio" ? (
                                    <><Truck size={12} className="me-1" /> Envío a domicilio</>
                                  ) : (
                                    <><Package size={12} className="me-1" /> Retiro en tienda</>
                                  )}
                                </small>
                              </div>
                              {pedido.direccion_envio && (
                                <div className="d-flex justify-content-between mb-2">
                                  <small className="text-muted">Dirección:</small>
                                  <small className="fw-semibold text-truncate" style={{ maxWidth: '180px' }}>
                                    <MapPin size={12} className="me-1" />
                                    {pedido.direccion_envio}
                                  </small>
                                </div>
                              )}
                              {pedido.costo_envio > 0 && (
                                <div className="d-flex justify-content-between mb-2">
                                  <small className="text-muted">Costo envío:</small>
                                  <small className="fw-semibold">C$ {pedido.costo_envio}</small>
                                </div>
                              )}
                              <div className="d-flex justify-content-between">
                                <small className="text-muted">Método de pago:</small>
                                <small className="fw-semibold">
                                  <CreditCard size={12} className="me-1" />
                                  Tarjeta
                                </small>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </Card>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Calificación */}
      <Modal show={mostrarModalCalificacion} onHide={() => setMostrarModalCalificacion(false)} centered size="md" className="calificacion-modal">
        <Modal.Header className="border-0 p-4" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white rounded-circle p-2">
              <Star size={24} color="#dc3545" />
            </div>
            <div>
              <Modal.Title className="fw-bold text-white">
                Calificar {productoParaCalificar?.nombre}
              </Modal.Title>
              <p className="text-white-50 small mb-0">Comparte tu experiencia</p>
            </div>
          </div>
          <button onClick={() => setMostrarModalCalificacion(false)} className="btn-close-white">
            <X size={20} />
          </button>
        </Modal.Header>

        <Modal.Body className="p-4">
          <Form>
            <div className="text-center mb-4">
              <label className="fw-bold mb-2 d-block">¿Cómo calificas este producto?</label>
              <StarsRating rating={puntuacion} onRatingChange={setPuntuacion} size={32} />
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">Título de tu reseña (opcional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Excelente pizza..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="rounded-3"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">Tu comentario (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="¿Qué te pareció? Cuéntanos tu experiencia..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="rounded-3"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0 p-4">
          <Button variant="light" onClick={() => setMostrarModalCalificacion(false)} className="rounded-pill px-4">
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={enviarCalificacion}
            disabled={enviando || puntuacion === 0}
            className="rounded-pill px-4 fw-bold"
          >
            {enviando ? "Enviando..." : "Enviar Calificación"}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .calificacion-modal .modal-content {
          border-radius: 28px;
          overflow: hidden;
          border: none;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .btn-close-white {
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 12px;
          width: 36px;
          height: 36px;
          color: white;
        }
      `}</style>
    </motion.div>
  );
};

export default MisPedidosView;