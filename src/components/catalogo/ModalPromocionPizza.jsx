import React, { useState } from "react";
import { Modal, Button, Row, Col, Card, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { 
  Pizza, Percent, Calendar, ShoppingCart, 
  Tag, Star, X, Plus, Minus, Check
} from "lucide-react";

const ModalPromocionPizza = ({ mostrar, onHide, promocion, producto, onAgregar }) => {
  const [tamanioSeleccionado, setTamanioSeleccionado] = useState("6");
  const [cantidad, setCantidad] = useState(1);
  const [animating, setAnimating] = useState(false);

  // Definir tamaños de pizza
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
  const precioBaseProducto = producto?.precio || 350;
  const precioOriginal = precioBaseProducto * tamanioActual.multiplicador;
  const precioConDescuento = precioOriginal * (1 - (promocion?.descuento || 0) / 100);
  const ahorro = precioOriginal - precioConDescuento;

  const handleAgregar = () => {
    setAnimating(true);
    setTimeout(() => {
      onAgregar({
        id: producto.id,
        nombre: producto.nombre,
        titulo: producto.nombre,
        descripcion: `${promocion.titulo} - ${tamanioActual.nombre}`,
        tamanio: tamanioActual.nombre,
        piezas: tamanioActual.piezas,
        precio: precioConDescuento,
        precioOriginal: precioOriginal,
        precioBase: producto.precio,
        descuento: promocion.descuento,
        esPromocion: true,
        esPromocionPizza: true,
        cantidad: cantidad,
        imagen: producto.imagen_url,
        imagen_url: producto.imagen_url,
        tipoEntrega: "retiro",
        promocionId: promocion.id,
        promocionTitulo: promocion.titulo,
      });
      onHide();
      setAnimating(false);
      setCantidad(1);
    }, 300);
  };

  const incrementarCantidad = () => {
    setCantidad(prev => prev + 1);
  };

  const decrementarCantidad = () => {
    setCantidad(prev => Math.max(1, prev - 1));
  };

  return (
    <Modal show={mostrar} onHide={onHide} centered size="lg" className="promocion-pizza-modal">
      <Modal.Header className="border-0 p-0">
        <div className="position-relative w-100" style={{ height: '200px', overflow: 'hidden' }}>
          {producto?.imagen_url ? (
            <img 
              src={producto.imagen_url} 
              alt={producto.nombre}
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="bg-gradient-danger d-flex align-items-center justify-content-center h-100">
              <Pizza size={80} color="#dc3545" />
            </div>
          )}
          <div className="position-absolute top-0 end-0 m-3">
            <button onClick={onHide} className="btn-close-modal">
              <X size={20} color="white" />
            </button>
          </div>
          <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))'
          }}>
            <Badge bg="warning" className="mb-2 px-3 py-2 rounded-pill text-dark fw-bold">
              <Percent size={14} className="me-1" />
              {promocion?.descuento}% DESCUENTO - {promocion?.titulo}
            </Badge>
            <h2 className="text-white fw-bold mb-0">{producto?.nombre}</h2>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ background: '#f8f9fa' }}>
        {/* Selector de tamaño - MISMO QUE EL MODAL ORIGINAL */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3 text-center">🍕 Elige el tamaño de tu pizza</h5>
          <Row className="g-3">
            {tamanos.map((tamano) => (
              <Col key={tamano.id} xs={12} md={4}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
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
                        <Star size={14} />
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
                          <span>C$ {precioBaseProducto}</span>
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
                            C$ {(precioBaseProducto * tamano.multiplicador).toFixed(2)}
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
        </div>

        {/* Resumen con descuento aplicado */}
        <div className="mt-3 p-4 rounded-4" style={{ background: 'white', border: '1px solid rgba(220, 53, 69, 0.2)' }}>
          <h6 className="fw-bold mb-3">📋 Resumen de tu pedido</h6>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center gap-2">
                <Pizza size={20} color="#dc3545" />
                <div>
                  <div className="fw-bold">{producto?.nombre}</div>
                  <small className="text-muted">{tamanioActual.nombre} • {tamanioActual.piezas}</small>
                </div>
              </div>
              <div className="mt-2">
                <Badge bg="warning" className="text-dark">
                  {promocion?.titulo} - {promocion?.descuento}% OFF
                </Badge>
              </div>
            </Col>
            <Col className="text-end">
              <div className="text-muted small text-decoration-line-through">
                C$ {(precioOriginal * cantidad).toFixed(2)}
              </div>
              <div className="fs-3 fw-bold text-danger">
                C$ {(precioConDescuento * cantidad).toFixed(2)}
              </div>
              <small className="text-success">
                Ahorras C$ {(ahorro * cantidad).toFixed(2)}
              </small>
            </Col>
          </Row>
        </div>

        {/* Selector de cantidad */}
        <div className="mt-4 d-flex align-items-center justify-content-between">
          <div>
            <label className="fw-bold small mb-0">Cantidad:</label>
          </div>
          <div className="d-flex align-items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="btn-cantidad"
              onClick={decrementarCantidad}
            >
              <Minus size={18} />
            </motion.button>
            <span className="fw-bold fs-4" style={{ minWidth: '40px', textAlign: 'center' }}>
              {cantidad}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="btn-cantidad"
              onClick={incrementarCantidad}
            >
              <Plus size={18} />
            </motion.button>
          </div>
        </div>
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
          className="btn-agregar-carrito"
        >
          <ShoppingCart size={18} className="me-2" />
          Agregar al carrito - C$ {(precioConDescuento * cantidad).toFixed(2)}
        </motion.button>
      </Modal.Footer>

      <style>{`
        .promocion-pizza-modal .modal-content {
          border-radius: 28px;
          overflow: hidden;
          border: none;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .bg-gradient-danger {
          background: linear-gradient(135deg, #dc3545, #ff6b6b);
        }
        
        .btn-close-modal {
          background: rgba(0,0,0,0.5);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(5px);
        }
        
        .tamano-card {
          transition: all 0.3s ease;
          position: relative;
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
        
        .btn-cantidad {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid #dee2e6;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .btn-cantidad:hover {
          background: #f8f9fa;
          border-color: #dc3545;
          color: #dc3545;
        }
        
        .btn-agregar-carrito {
          padding: 12px 28px;
          border: none;
          border-radius: 60px;
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .btn-agregar-carrito:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
        }
      `}</style>
    </Modal>
  );
};

export default ModalPromocionPizza;