import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { supabase } from '../../../PizzaApp/src/database/supabaseconfig';
import { Star, User, Calendar, ThumbsUp, MessageCircle } from 'lucide-react';
import StarsRating from './StarsRating';

const CalificacionesProducto = ({ productoId, productoNombre }) => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [promedio, setPromedio] = useState(0);
  const [totalCalificaciones, setTotalCalificaciones] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [distribucion, setDistribucion] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  useEffect(() => {
    cargarCalificaciones();
  }, [productoId]);

  const cargarCalificaciones = async () => {
    try {
      setCargando(true);
      
      // Obtener calificaciones del producto
      const { data, error } = await supabase
        .from("calificaciones")
        .select(`
          *,
          usuarios:usuario_id (email)
        `)
        .eq("producto_id", productoId)
        .eq("visible", true)
        .order("fecha_creacion", { ascending: false });

      if (error) throw error;

      setCalificaciones(data || []);
      
      // Calcular estadísticas
      const total = data?.length || 0;
      let suma = 0;
      const distribucionTemp = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      data?.forEach(cal => {
        suma += cal.puntuacion;
        distribucionTemp[cal.puntuacion]++;
      });
      
      setPromedio(total > 0 ? suma / total : 0);
      setTotalCalificaciones(total);
      setDistribucion(distribucionTemp);
      
    } catch (error) {
      console.error("Error cargando calificaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  const getPorcentaje = (count) => {
    return totalCalificaciones > 0 ? (count / totalCalificaciones) * 100 : 0;
  };

  if (cargando) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="danger" />
        <p className="mt-2">Cargando calificaciones...</p>
      </div>
    );
  }

  return (
    <div className="calificaciones-container">
      {/* Resumen de calificaciones */}
      <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
        <div className="text-center mb-4">
          <h3 className="fw-bold mb-2">{productoNombre}</h3>
          <div className="d-flex justify-content-center align-items-center gap-3">
            <div className="text-center">
              <div className="display-1 fw-bold text-warning">{promedio.toFixed(1)}</div>
              <StarsRating rating={Math.round(promedio)} readonly={true} size={20} />
              <small className="text-muted">{totalCalificaciones} calificaciones</small>
            </div>
          </div>
        </div>

        {/* Barras de distribución */}
        <div className="row g-2">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="col-12">
              <div className="d-flex align-items-center gap-2">
                <div className="d-flex align-items-center" style={{ width: '60px' }}>
                  <span className="fw-bold">{star}</span>
                  <Star size={14} className="ms-1 text-warning" />
                </div>
                <div className="flex-grow-1">
                  <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                    <div 
                      className="progress-bar bg-warning" 
                      style={{ width: `${getPorcentaje(distribucion[star])}%` }}
                    ></div>
                  </div>
                </div>
                <div style={{ width: '50px' }}>
                  <small className="text-muted">{distribucion[star]}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de calificaciones */}
      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <MessageCircle size={20} />
        Comentarios de nuestros más queridos clientes 😊👍
      </h5>
      
      {calificaciones.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <Card.Body>
            <Star size={48} className="text-muted mb-3 opacity-50" />
            <h5>No hay calificaciones aún</h5>
            <p className="text-muted">Sé el primero en calificar este producto</p>
          </Card.Body>
        </Card>
      ) : (
        <div className="row g-3">
          {calificaciones.map((cal, idx) => (
            <motion.div
              key={cal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="col-12"
            >
              <Card className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-light rounded-circle p-2">
                        <User size={20} className="text-muted" />
                      </div>
                      <div>
                        <strong>{cal.usuarios?.email?.split('@')[0] || 'Usuario'}</strong>
                        <div className="d-flex align-items-center gap-2">
                          <StarsRating rating={cal.puntuacion} readonly={true} size={16} />
                          {cal.titulo && <span className="fw-semibold small">"{cal.titulo}"</span>}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-1 text-muted small">
                      <Calendar size={12} />
                      {new Date(cal.fecha_creacion).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="text-muted mt-2 mb-0">{cal.comentario}</p>
                  
                  {cal.respuesta_administrador && (
                    <div className="mt-3 p-3 bg-light rounded-3">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <ThumbsUp size={14} className="text-primary" />
                        <strong className="small">Respuesta del administrador</strong>
                      </div>
                      <p className="mb-0 small">{cal.respuesta_administrador}</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalificacionesProducto;