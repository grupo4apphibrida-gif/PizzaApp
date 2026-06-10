import React, { useState } from "react";
import { Modal, Button, Row, Col, Card, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { 
  Gift, Percent, Calendar, ShoppingCart, 
  Tag, Star, X, Plus, Minus
} from "lucide-react";

const ModalPromocion = ({ mostrar, onHide, promocion, onAgregar }) => {
  const [cantidad, setCantidad] = useState(1);
  const [animating, setAnimating] = useState(false);

  if (!promocion) return null;

  // Precio base de la promoción
  const precioBase = 100;
  const precioFinal = precioBase * (1 - promocion.descuento / 100);
  const ahorro = precioBase - precioFinal;

  const handleAgregar = () => {
    setAnimating(true);
    setTimeout(() => {
      onAgregar(promocion, cantidad);
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
    <Modal 
      show={mostrar} 
      onHide={onHide} 
      centered 
      size="lg"
      className="promocion-modal"
    >
      <Modal.Header className="border-0 p-0">
        <div className="position-relative w-100" style={{ height: '250px', overflow: 'hidden' }}>
          {promocion.imagen_url ? (
            <img 
              src={promocion.imagen_url} 
              alt={promocion.titulo}
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="bg-gradient-warning d-flex align-items-center justify-content-center h-100">
              <Gift size={80} color="#ffc107" />
            </div>
          )}
          <div className="position-absolute top-0 end-0 m-3">
            <button 
              onClick={onHide}
              className="btn-close-modal"
            >
              <X size={20} color="white" />
            </button>
          </div>
          <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))'
          }}>
            <Badge bg="warning" className="mb-2 px-3 py-2 rounded-pill text-dark fw-bold">
              <Percent size={14} className="me-1" />
              {promocion.descuento}% DESCUENTO
            </Badge>
            <h2 className="text-white fw-bold mb-0">{promocion.titulo}</h2>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ background: '#f8f9fa' }}>
        <Row>
          <Col lg={7}>
            <h4 className="fw-bold mb-3">✨ Sobre esta oferta</h4>
            <p className="text-muted mb-4">{promocion.descripcion || "¡Aprovecha esta increíble oferta!"}</p>
            
            <div className="d-flex gap-3 mb-4 flex-wrap">
              {promocion.fecha_fin && (
                <div className="d-flex align-items-center gap-2">
                  <Calendar size={18} className="text-danger" />
                  <div>
                    <div className="small text-muted">Válido hasta</div>
                    <div className="fw-bold small">
                      {new Date(promocion.fecha_fin).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
              <div className="d-flex align-items-center gap-2">
                <Tag size={18} className="text-danger" />
                <div>
                  <div className="small text-muted">Descuento</div>
                  <div className="fw-bold text-danger">{promocion.descuento}% OFF</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-4 border">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Star size={16} color="#ffc107" />
                <strong className="small">¡Oferta por tiempo limitado!</strong>
              </div>
              <p className="small text-muted mb-0">
                Aprovecha este descuento especial antes de que termine. 
                Cantidades limitadas.
              </p>
            </div>
          </Col>

          <Col lg={5}>
            <Card className="border-0 shadow-lg rounded-4" style={{ background: 'white' }}>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div className="text-muted small text-decoration-line-through mb-1">
                    C$ {precioBase.toFixed(2)}
                  </div>
                  <div className="fs-1 fw-bold text-danger">
                    C$ {precioFinal.toFixed(2)}
                  </div>
                  <div className="text-success small">
                    Ahorras C$ {ahorro.toFixed(2)}
                  </div>
                </div>

                {/* Selector de cantidad */}
                <div className="mb-4">
                  <label className="fw-bold small mb-2 d-block text-center">Cantidad:</label>
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="btn-cantidad"
                      onClick={decrementarCantidad}
                    >
                      <Minus size={18} />
                    </motion.button>
                    <span className="fw-bold fs-3" style={{ minWidth: '50px', textAlign: 'center' }}>
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

                {/* Precio total */}
                <div className="text-center mb-3 pt-2 border-top">
                  <div className="small text-muted">Total</div>
                  <div className="fs-3 fw-bold text-danger">
                    C$ {(precioFinal * cantidad).toFixed(2)}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={animating ? { scale: [1, 0.95, 1] } : {}}
                  onClick={handleAgregar}
                  className="btn-agregar-carrito"
                >
                  <ShoppingCart size={18} className="me-2" />
                  Agregar al carrito
                </motion.button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>

      <style>{`
        .promocion-modal .modal-content {
          border-radius: 28px;
          overflow: hidden;
          border: none;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .bg-gradient-warning {
          background: linear-gradient(135deg, #fff5e6, #ffe0b3);
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
          transition: all 0.2s;
        }
        
        .btn-close-modal:hover {
          background: rgba(0,0,0,0.7);
          transform: scale(1.05);
        }
        
        .btn-cantidad {
          width: 44px;
          height: 44px;
          border-radius: 14px;
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
          width: 100%;
          padding: 14px;
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

export default ModalPromocion;