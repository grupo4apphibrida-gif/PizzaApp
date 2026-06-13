import React, { useEffect, useState } from 'react';
import { Card, Spinner, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { supabase } from '../../../src/database/supabaseconfig';
import { Star, User, Calendar, MessageCircle } from 'lucide-react';
import StarsRating from './StarsRating';

const CalificacionesProducto = ({ productoId, productoNombre }) => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [promedio, setPromedio] = useState(0);
  const [totalCalificaciones, setTotalCalificaciones] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [distribucion, setDistribucion] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    if (productoId) {
      cargarCalificaciones();
    }
  }, [productoId]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const { data } = await supabase
          .from('clientes')
          .select('id_cliente, nombre_cliente, apellido_cliente, email');
        if (data) setClientes(data);
      } catch (err) {
        console.error("Error fetching clientes:", err);
      }
    };
    fetchClientes();
  }, []);

  const cargarCalificaciones = async () => {
    try {
      setCargando(true);
      setError(null);
      
      console.log("🔄 Cargando calificaciones para producto:", productoId);
      
      const { data, error } = await supabase
        .from("calificaciones")
        .select("*")
        .eq("producto_id", String(productoId))
        .eq("visible", true)
        .order("fecha_creacion", { ascending: false });

      if (error) {
        console.error("❌ Error en consulta:", error);
        throw error;
      }

      console.log("✅ Calificaciones cargadas:", data?.length || 0);
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
      console.error("❌ Error cargando calificaciones:", error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  const getPorcentaje = (count) => {
    return totalCalificaciones > 0 ? (count / totalCalificaciones) * 100 : 0;
  };

  const getRespuestaAdministrador = (cal) => {
    return cal.respuesta_administrador ?? cal.respuesta_admin ?? cal.respuesta_admini;
  };

  const getRespuestaFecha = (cal) => {
    return cal.respuesta_fecha ?? cal.fecha_actualizacion ?? null;
  };

  const getNombreUsuario = (cal) => {
    if (!cal.usuario_id) return 'Anónimo';
    if (cal.usuario_id.includes('@')) {
      return cal.usuario_id.split('@')[0];
    }
    const cliente = clientes.find(c => String(c.id_cliente) === String(cal.usuario_id));
    if (cliente) {
      return `${cliente.nombre_cliente} ${cliente.apellido_cliente || ''}`.trim();
    }
    return `Cliente #${cal.usuario_id}`;
  };

  if (cargando) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="danger" />
        <p className="mt-2 text-muted">Cargando calificaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <div className="bg-danger bg-opacity-10 rounded-3 p-4">
          <p className="text-danger mb-0">Error al cargar calificaciones</p>
          <button 
            className="btn btn-danger btn-sm mt-3 rounded-pill"
            onClick={cargarCalificaciones}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="calificaciones-container p-4">
      {/* Resumen de calificaciones */}
      <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
        <div className="text-center mb-4">
          <h3 className="fw-bold mb-2">{productoNombre}</h3>
          <div className="d-flex justify-content-center align-items-center gap-3">
            <div className="text-center">
              <div className="display-1 fw-bold text-warning">{promedio.toFixed(1)}</div>
              <StarsRating rating={Math.round(promedio)} readonly={true} size={20} />
              <small className="text-muted">{totalCalificaciones} calificación{totalCalificaciones !== 1 ? 'es' : ''}</small>
            </div>
          </div>
        </div>

        {/* Barras de distribución */}
        {totalCalificaciones > 0 && (
          <div className="mt-4">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="d-flex align-items-center gap-2 mb-2">
                <div className="d-flex align-items-center" style={{ width: '50px' }}>
                  <span className="fw-bold">{star}</span>
                  <Star size={14} className="ms-1 text-warning" />
                </div>
                <div className="flex-grow-1">
                  <div className="progress" style={{ height: '8px', borderRadius: '4px', background: '#e9ecef' }}>
                    <div 
                      className="progress-bar bg-warning" 
                      style={{ width: `${getPorcentaje(distribucion[star])}%`, borderRadius: '4px' }}
                    ></div>
                  </div>
                </div>
                <div style={{ width: '40px' }}>
                  <small className="text-muted">{distribucion[star]}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de calificaciones */}
      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <MessageCircle size={18} />
        Comentarios de nuestros más queridos clientes 😊👍
      </h5>
      
      {calificaciones.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm" style={{ borderRadius: '20px' }}>
          <Card.Body>
            <Star size={48} className="text-muted mb-3 opacity-50" />
            <h5>No hay calificaciones aún</h5>
            <p className="text-muted">Sé el primero en calificar este producto</p>
          </Card.Body>
        </Card>
      ) : (
        calificaciones.map((cal, idx) => {
          const respuestaAdmin = getRespuestaAdministrador(cal);
          const fechaCalificacion = cal.fecha_creacion || cal.fecha_actualizacion;
          const respuestaFecha = getRespuestaFecha(cal);

          return (
            <motion.div
              key={cal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card border-0 shadow-sm mb-3"
              style={{ borderRadius: '20px' }}
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <StarsRating rating={cal.puntuacion} readonly={true} size={16} />
                    <div className="mt-2">
                      <strong className="d-block text-dark">{getNombreUsuario(cal)}</strong>
                      {cal.titulo && (
                        <span className="text-muted small">"{cal.titulo}"</span>
                      )}
                    </div>
                  </div>
                  <small className="text-muted d-flex align-items-center gap-1">
                    <Calendar size={12} />
                    {fechaCalificacion ? new Date(fechaCalificacion).toLocaleDateString() : 'Fecha no disponible'}
                  </small>
                </div>

                <p className="text-muted mb-3">
                  {cal.comentario || "Sin comentario"}
                </p>

                {Array.isArray(cal.imagenes) && cal.imagenes.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {cal.imagenes.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Foto de reseña ${index + 1}`}
                        className="rounded-3"
                        style={{ width: 96, height: 96, objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                )}

                {respuestaAdmin && (
                  <div className="mt-3 p-3 bg-light rounded-3 border">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <strong className="small text-secondary">Respuesta del administrador</strong>
                      {respuestaFecha && (
                        <span className="small text-muted">· {new Date(respuestaFecha).toLocaleDateString()}</span>
                      )}
                    </div>
                    <p className="mb-0 small text-dark">{respuestaAdmin}</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default CalificacionesProducto;