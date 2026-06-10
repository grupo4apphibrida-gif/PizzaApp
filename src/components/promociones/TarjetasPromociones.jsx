import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { Edit, Trash2, Eye, EyeOff, Calendar, Tag, Percent, Pizza } from "lucide-react";

const TarjetasPromociones = ({ promociones = [], abrirModalEdicion, abrirModalEliminacion }) => {
  const isActiva = (promocion) => {
    if (!promocion.activa) return false;
    if (promocion.fecha_inicio && new Date(promocion.fecha_inicio) > new Date()) return false;
    if (promocion.fecha_fin && new Date(promocion.fecha_fin) < new Date()) return false;
    return true;
  };

  const esPromocionPizza = (promocion) => {
    return promocion.titulo?.toLowerCase().includes("pizza") || 
           promocion.titulo?.toLowerCase().includes("2x1") ||
           promocion.titulo?.toLowerCase().includes("pizzas");
  };

  return (
    <div className="row g-4">
      {promociones.map((promocion, idx) => {
        const activa = isActiva(promocion);
        const esPizza = esPromocionPizza(promocion);
        
        return (
          <div key={promocion.id} className="col-12 col-sm-6 col-lg-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-100 border-0 shadow-sm promocion-tarjeta">
                <div className="position-relative">
                  {promocion.imagen_url ? (
                    <Card.Img
                      variant="top"
                      src={promocion.imagen_url}
                      className="promocion-imagen"
                      style={{ height: 180, objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="bg-gradient-warning d-flex align-items-center justify-content-center" style={{ height: 180, borderRadius: '16px 16px 0 0' }}>
                      {esPizza ? <Pizza size={48} color="#ffc107" /> : <Percent size={48} color="#ffc107" />}
                    </div>
                  )}
                  <div className="position-absolute top-0 end-0 m-3">
                    <Badge bg={activa ? "success" : "secondary"} className="px-3 py-2 rounded-pill">
                      {activa ? <Eye size={12} className="me-1" /> : <EyeOff size={12} className="me-1" />}
                      {activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <div className="position-absolute bottom-0 start-0 m-3">
                    <Badge bg="warning" className="text-dark px-3 py-2 rounded-pill">
                      <Tag size={12} className="me-1" />
                      {promocion.descuento}% OFF
                    </Badge>
                  </div>
                  {esPizza && (
                    <div className="position-absolute top-0 start-0 m-3">
                      <Badge bg="danger" className="px-2 py-1 rounded-pill">
                        <Pizza size={10} className="me-1" />
                        Pizza
                      </Badge>
                    </div>
                  )}
                </div>

                <Card.Body>
                  <Card.Title className="fw-bold mb-2">{promocion.titulo}</Card.Title>
                  <Card.Text className="text-muted small mb-3">
                    {promocion.descripcion || "Sin descripción"}
                  </Card.Text>
                  
                  <div className="d-flex align-items-center gap-3 mb-3 text-muted small flex-wrap">
                    {promocion.fecha_inicio && (
                      <div className="d-flex align-items-center gap-1">
                        <Calendar size={12} />
                        <span>Inicio: {new Date(promocion.fecha_inicio).toLocaleDateString()}</span>
                      </div>
                    )}
                    {promocion.fecha_fin && (
                      <div className="d-flex align-items-center gap-1">
                        <Calendar size={12} />
                        <span>Fin: {new Date(promocion.fecha_fin).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-warning" 
                      size="sm" 
                      onClick={() => abrirModalEdicion(promocion)}
                      className="flex-grow-1 rounded-pill"
                    >
                      <Edit size={14} className="me-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => abrirModalEliminacion(promocion)}
                      className="flex-grow-1 rounded-pill"
                    >
                      <Trash2 size={14} className="me-1" />
                      Eliminar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </div>
        );
      })}

      <style>{`
        .promocion-tarjeta {
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .promocion-tarjeta:hover {
          box-shadow: 0 10px 30px rgba(220, 53, 69, 0.15) !important;
        }
        .promocion-imagen {
          transition: transform 0.3s ease;
        }
        .promocion-tarjeta:hover .promocion-imagen {
          transform: scale(1.05);
        }
        .bg-gradient-warning {
          background: linear-gradient(135deg, #fff5e6, #ffe0b3);
        }
      `}</style>
    </div>
  );
};

export default TarjetasPromociones;