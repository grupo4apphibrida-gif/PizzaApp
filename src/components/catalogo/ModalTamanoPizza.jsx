import React, { useState } from "react";
import { Modal, Button, Row, Col, Card, Form, Badge } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pizza, Award, Check, ShoppingCart, X,
  MapPin, Store, Truck, Navigation, Home
} from "lucide-react";

const ModalTamanoPizza = ({
  mostrar,
  onHide,
  producto,
  precioBase,
  onAgregar,
  esPromocion = false,
  descuento = 0,
  tituloPromocion = ""
}) => {
  const [tamanioSeleccionado, setTamanioSeleccionado] = useState("6");
  const [animating, setAnimating] = useState(false);
  const [tipoEntrega, setTipoEntrega] = useState("retiro");
  const [direccionEnvio, setDireccionEnvio] = useState("");
  const [referencia, setReferencia] = useState("");

  const tamanos = [
    {
      id: "6",
      nombre: "Pequeña",
      piezas: "6 piezas",
      multiplicador: 1,
      descripcion: "Perfecta para 1-2 personas",
      icono: "🍕",
    },
    {
      id: "8",
      nombre: "Mediana",
      piezas: "8 piezas",
      multiplicador: 1.35,
      descripcion: "Ideal para 2-3 personas",
      icono: "🍕🍕",
      popular: true,
    },
    {
      id: "12",
      nombre: "Grande",
      piezas: "12 piezas",
      multiplicador: 1.8,
      descripcion: "Para grupos de 4-5 personas",
      icono: "🍕🍕🍕",
    },
  ];

  const tamanioActual = tamanos.find((t) => t.id === tamanioSeleccionado);
  const precioOriginal = precioBase * tamanioActual.multiplicador;
  const precioConDescuento = precioOriginal * (1 - descuento / 100);
  const precioFinal = esPromocion ? precioConDescuento : precioOriginal;
  
  const costoEnvio = 30;
  const totalConEnvio = precioFinal + costoEnvio;

  const sugerenciasDirecciones = [
    { icono: "🏠", nombre: "Parque Central de Juigalpa" },
    { icono: "🔄", nombre: "Rotonda de Juigalpa" },
    { icono: "🏘️", nombre: "Barrio San Juan" },
    { icono: "🏡", nombre: "Colonia 14 de Febrero" },
    { icono: "⛪", nombre: "Catedral de Juigalpa" },
  ];

  const handleAgregar = () => {
    setAnimating(true);
    setTimeout(() => {
      onAgregar({
        id: producto.id,
        nombre: producto.nombre,
        imagen: producto.imagen,
        tamanio: tamanioActual.nombre,
        piezas: tamanioActual.piezas,
        precioOriginal: precioOriginal,
        precio: parseFloat(precioFinal),
        descuento: descuento,
        esPromocion: esPromocion,
        tipoEntrega: tipoEntrega,
        direccionEnvio: tipoEntrega === "envio" ? direccionEnvio : null,
        referencia: tipoEntrega === "envio" ? referencia : null,
        costoEnvio: tipoEntrega === "envio" ? costoEnvio : 0,
      });
      onHide();
      setAnimating(false);
      setTipoEntrega("retiro");
      setDireccionEnvio("");
      setReferencia("");
    }, 300);
  };

  return (
    <Modal show={mostrar} onHide={onHide} centered size="lg" className="pizza-modal">
      {/* Header */}
      <Modal.Header className="border-0 p-4" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
        <div className="d-flex align-items-center gap-3">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-circle p-2"
          >
            <Pizza size={24} color="#dc3545" />
          </motion.div>
          <div>
            <Modal.Title className="fw-bold text-white">
              {esPromocion ? `🎉 ${tituloPromocion}` : `Elige el tamaño de tu ${producto?.nombre}`}
            </Modal.Title>
            <p className="text-white-50 mb-0 small">{producto?.descripcion?.substring(0, 60)}</p>
          </div>
        </div>
        <button onClick={onHide} className="btn-close-white">
          <X size={20} />
        </button>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ background: '#f8f9fa' }}>
        {/* ========== SECCIÓN 1: TAMAÑOS ========== */}
        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <Pizza size={18} />
          Selecciona el tamaño
        </h6>
        <Row className="g-3 mb-4">
          {tamanos.map((tamano, index) => (
            <Col key={tamano.id} xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`tamano-card ${tamanioSeleccionado === tamano.id ? 'selected' : ''}`}
                  onClick={() => setTamanioSeleccionado(tamano.id)}
                  style={{
                    cursor: "pointer",
                    borderRadius: "20px",
                    border: tamanioSeleccionado === tamano.id ? "2px solid #dc3545" : "1px solid #e9ecef",
                    background: tamanioSeleccionado === tamano.id ? "linear-gradient(135deg, #fff5f5, #ffffff)" : "white",
                  }}
                >
                  {tamano.popular && (
                    <div className="popular-badge">
                      <Award size={14} />
                      <span>Más pedida</span>
                    </div>
                  )}
                  <Card.Body className="text-center p-3">
                    <div className="fs-2 mb-2">{tamano.icono}</div>
                    <h6 className="fw-bold mb-1">{tamano.nombre}</h6>
                    <p className="text-muted small mb-2">{tamano.piezas}</p>
                    <p className="text-muted small mb-3">{tamano.descripcion}</p>

                    <div className="mt-2 pt-2 border-top">
                      <div className="d-flex justify-content-between align-items-center small mb-1">
                        <span className="text-muted">Precio base</span>
                        <span>C$ {precioBase}</span>
                      </div>
                      {tamano.multiplicador > 1 && (
                        <div className="d-flex justify-content-between align-items-center small mb-1">
                          <span className="text-muted">Incremento</span>
                          <span className="text-success">+{((tamano.multiplicador - 1) * 100).toFixed(0)}%</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between align-items-center mt-2 pt-1 border-top">
                        <span className="fw-bold">Total</span>
                        <span className="fw-bold text-danger">
                          C$ {(precioBase * tamano.multiplicador).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className={`selection-circle ${tamanioSeleccionado === tamano.id ? 'active' : ''}`}>
                        {tamanioSeleccionado === tamano.id && <Check size={16} color="#dc3545" />}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* ========== SECCIÓN 2: ENVÍO / RETIRO ========== */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Truck size={18} />
            ¿Cómo quieres recibir tu pedido?
          </h6>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={`entrega-card ${tipoEntrega === "retiro" ? "selected" : ""}`}
                  onClick={() => setTipoEntrega("retiro")}
                  style={{
                    cursor: "pointer",
                    borderRadius: "16px",
                    border: tipoEntrega === "retiro" ? "2px solid #dc3545" : "1px solid #e9ecef",
                    background: tipoEntrega === "retiro" ? "linear-gradient(135deg, #fff5f5, #ffffff)" : "white",
                  }}
                >
                  <Card.Body className="d-flex align-items-center gap-3 p-3">
                    <div className="entrega-icon bg-success bg-opacity-10 p-2 rounded-3">
                      <Store size={24} color="#28a745" />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-0">Retiro en Tienda</h6>
                      <small className="text-muted">Recoge tu pedido sin costo extra</small>
                      <div className="mt-1">
                        <Badge bg="success" className="rounded-pill">Gratis</Badge>
                      </div>
                    </div>
                    {tipoEntrega === "retiro" && (
                      <div>
                        <Check size={20} color="#dc3545" />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>

            <Col xs={12} md={6}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={`entrega-card ${tipoEntrega === "envio" ? "selected" : ""}`}
                  onClick={() => setTipoEntrega("envio")}
                  style={{
                    cursor: "pointer",
                    borderRadius: "16px",
                    border: tipoEntrega === "envio" ? "2px solid #dc3545" : "1px solid #e9ecef",
                    background: tipoEntrega === "envio" ? "linear-gradient(135deg, #fff5f5, #ffffff)" : "white",
                  }}
                >
                  <Card.Body className="d-flex align-items-center gap-3 p-3">
                    <div className="entrega-icon bg-danger bg-opacity-10 p-2 rounded-3">
                      <Truck size={24} color="#dc3545" />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-0">Envío a Domicilio</h6>
                      <small className="text-muted">Llevamos tu pedido a casa</small>
                      <div className="mt-1">
                        <Badge bg="warning" className="text-dark rounded-pill">+C$ {costoEnvio}</Badge>
                      </div>
                    </div>
                    {tipoEntrega === "envio" && (
                      <div>
                        <Check size={20} color="#dc3545" />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>

        {/* ========== SECCIÓN 3: DIRECCIÓN (solo si es envío) ========== */}
        <AnimatePresence>
          {tipoEntrega === "envio" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <Card className="border-0 shadow-sm" style={{ borderRadius: '20px', background: '#fff5f5' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <MapPin size={18} color="#dc3545" />
                    <h6 className="fw-bold mb-0">¿Dónde recibirás tu pedido?</h6>
                  </div>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Dirección completa *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: Calle Principal #123, Barrio San Juan"
                      value={direccionEnvio}
                      onChange={(e) => setDireccionEnvio(e.target.value)}
                      className="rounded-3"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Referencias (opcional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Cerca del parque, casa de color azul, etc."
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      className="rounded-3"
                    />
                  </Form.Group>

                  {/* ========== SUGERENCIAS RÁPIDAS - CORREGIDO ========== */}
                  <div className="mt-3">
                    <label className="small fw-bold text-muted mb-2 d-flex align-items-center gap-1">
                      <Navigation size={14} />
                      📌 Sugerencias rápidas:
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {sugerenciasDirecciones.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="btn-sugerencia"
                          onClick={() => setDireccionEnvio(sug.nombre)}
                          style={{
                            background: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '20px',
                            padding: '6px 14px',
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dc3545';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = '#dc3545';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f8f9fa';
                            e.currentTarget.style.color = '#212529';
                            e.currentTarget.style.borderColor = '#e9ecef';
                          }}
                        >
                          <span>{sug.icono}</span>
                          <span>{sug.nombre}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-light rounded-3">
                    <small className="text-muted d-flex align-items-center gap-2">
                      <Truck size={14} />
                      Tiempo estimado de entrega: 30-45 minutos
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== SECCIÓN 4: RESUMEN ========== */}
        <motion.div 
          className="mt-3 p-4 rounded-4 summary-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
            border: '1px solid rgba(220, 53, 69, 0.2)',
            borderRadius: '20px',
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-danger bg-opacity-10 rounded-3">
                <Pizza size={24} color="#dc3545" />
              </div>
              <div>
                <h6 className="fw-bold mb-1">Tu selección</h6>
                <p className="text-muted small mb-0">
                  {tamanioActual.nombre} • {tamanioActual.piezas}
                </p>
                <div className="mt-1">
                  {tipoEntrega === "retiro" ? (
                    <Badge bg="success" className="rounded-pill">
                      <Store size={10} className="me-1" />
                      Retiro en tienda
                    </Badge>
                  ) : (
                    <Badge bg="warning" className="text-dark rounded-pill">
                      <Truck size={10} className="me-1" />
                      Envío a domicilio
                    </Badge>
                  )}
                </div>
                {esPromocion && (
                  <Badge bg="warning" className="text-dark rounded-pill mt-1">
                    {tituloPromocion} - {descuento}% OFF
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-end">
              {tipoEntrega === "envio" && (
                <div className="text-muted small mb-1">
                  Subtotal: C$ {precioFinal.toFixed(2)}
                </div>
              )}
              <div className="fs-3 fw-bold text-danger">
                C$ {tipoEntrega === "envio" ? totalConEnvio.toFixed(2) : precioFinal.toFixed(2)}
              </div>
              {tipoEntrega === "envio" && direccionEnvio && (
                <small className="text-muted d-flex align-items-center gap-1 justify-content-end mt-1">
                  <MapPin size={10} />
                  {direccionEnvio.substring(0, 30)}...
                </small>
              )}
            </div>
          </div>
        </motion.div>
      </Modal.Body>

      <Modal.Footer className="border-0 p-4" style={{ background: '#f8f9fa' }}>
        <Button variant="light" onClick={onHide} className="rounded-pill px-4">
          Cancelar
        </Button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={animating ? { scale: [1, 0.95, 1] } : {}}
          onClick={handleAgregar}
          disabled={tipoEntrega === "envio" && !direccionEnvio}
          className="btn btn-danger rounded-pill px-5 py-2 fw-bold"
        >
          <ShoppingCart size={18} className="me-2" />
          Agregar al carrito - C$ {tipoEntrega === "envio" ? totalConEnvio.toFixed(2) : precioFinal.toFixed(2)}
        </motion.button>
      </Modal.Footer>

      <style>{`
        .pizza-modal .modal-content {
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
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.2s;
        }
        
        .btn-close-white:hover {
          background: rgba(255,255,255,0.3);
        }
        
        .tamano-card {
          position: relative;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .tamano-card.selected {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(220, 53, 69, 0.15);
        }
        
        .popular-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: linear-gradient(135deg, #ffc107, #ff9800);
          color: white;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 0.65rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .selection-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid #dc3545;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .selection-circle.active {
          background: rgba(220, 53, 69, 0.1);
        }
        
        .entrega-card {
          transition: all 0.3s ease;
        }
        
        .entrega-card.selected {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(220, 53, 69, 0.1);
        }
        
        .entrega-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .summary-card {
          backdrop-filter: blur(10px);
        }
      `}</style>
    </Modal>
  );
};

export default ModalTamanoPizza;