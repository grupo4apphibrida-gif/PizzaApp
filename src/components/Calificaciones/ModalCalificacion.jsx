import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle, AlertCircle, ThumbsUp } from 'lucide-react';
import { supabase } from '../../database/supabaseconfig';
import { useAuth } from '../../context/AuthContext';
import StarsRating from './StarsRating';

const ModalCalificacion = ({ mostrar, onHide, producto, onCalificado }) => {
  const { user, profile } = useAuth();
  const [puntuacion, setPuntuacion] = useState(0);
  const [titulo, setTitulo] = useState('');
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [yaCalificado, setYaCalificado] = useState(false);

  useEffect(() => {
    if (mostrar && producto) {
      setPuntuacion(0);
      setTitulo('');
      setComentario('');
      setError('');
      setSuccess('');
      verificarCalificacionExistente();
    }
  }, [mostrar, producto]);

  const verificarCalificacionExistente = async () => {
    try {
      const usuarioId = user?.id || profile?.id || profile?.email;
      if (!usuarioId || !producto?.id) return;

      const { data, error: err } = await supabase
        .from('calificaciones')
        .select('id')
        .eq('producto_id', String(producto.id))
        .eq('usuario_id', usuarioId)
        .maybeSingle();

      if (err) throw err;
      setYaCalificado(!!data);
    } catch (err) {
      console.error('Error verificando:', err);
    }
  };

  const handleSubmit = async () => {
    if (puntuacion === 0) {
      setError('Por favor selecciona una puntuación');
      return;
    }

    const usuarioId = user?.id || profile?.id || profile?.email;
    if (!usuarioId) {
      setError('Debes iniciar sesión para calificar');
      return;
    }

    setEnviando(true);
    setError('');

    try {
      const nuevaCalificacion = {
        producto_id: String(producto.id),
        puntuacion: puntuacion,
        titulo: titulo?.trim() || null,
        comentario: comentario?.trim() || null,
        visible: true,
        usuario_id: usuarioId,
        fecha_creacion: new Date().toISOString()
      };

      console.log('📝 Enviando calificación:', nuevaCalificacion);

      const { error: insertError } = await supabase
        .from('calificaciones')
        .insert([nuevaCalificacion]);

      if (insertError) throw insertError;

      setSuccess('✅ ¡Gracias por tu calificación!');
      
      setTimeout(() => {
        onHide();
        if (onCalificado) onCalificado();
      }, 1500);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error al enviar calificación');
    } finally {
      setEnviando(false);
    }
  };

  if (!mostrar || !producto) return null;

  // Verificar que el usuario esté autenticado
  if (!user?.email && !profile?.email) {
    return (
      <Modal show={mostrar} onHide={onHide} centered size="md" className="calificacion-modal">
        <Modal.Header className="border-0 p-4" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white rounded-circle p-2">
              <AlertCircle size={24} color="#dc3545" />
            </div>
            <div>
              <Modal.Title className="fw-bold text-white">
                Iniciar sesión requerido
              </Modal.Title>
              <p className="text-white-50 small mb-0">Para dejar reseñas en PizzApp</p>
            </div>
          </div>
          <button onClick={onHide} className="btn-close-white">
            <X size={20} />
          </button>
        </Modal.Header>
        <Modal.Body className="p-4 text-center">
          <p className="text-muted mb-4">
            Debes iniciar sesión para dejar una reseña o calificación en este producto.
          </p>
          <Button 
            variant="danger" 
            className="rounded-pill px-4"
            onClick={() => {
              onHide();
              window.location.href = '/login';
            }}
          >
            Ir al login
          </Button>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={mostrar} onHide={onHide} centered size="md" className="calificacion-modal">
      <Modal.Header className="border-0 p-4" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white rounded-circle p-2">
            <Star size={24} color="#dc3545" />
          </div>
          <div>
            <Modal.Title className="fw-bold text-white">
              Calificar {producto?.nombre}
            </Modal.Title>
            <p className="text-white-50 small mb-0">Comparte tu experiencia</p>
          </div>
        </div>
        <button onClick={onHide} className="btn-close-white">
          <X size={20} />
        </button>
      </Modal.Header>

      <Modal.Body className="p-4">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Alert variant="danger" className="rounded-3">
                <AlertCircle size={16} className="me-2" />
                {error}
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Alert variant="success" className="rounded-3 text-center">
                <CheckCircle size={32} className="mx-auto mb-2" />
                <p className="mb-0 fw-bold">{success}</p>
              </Alert>
            </motion.div>
          )}

          {!yaCalificado && !success && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <Form>
                <div className="text-center mb-4">
                  <label className="fw-bold mb-2 d-block">¿Cómo calificas este producto?</label>
                  <StarsRating rating={puntuacion} onRatingChange={setPuntuacion} size={36} />
                  <small className="text-muted mt-2 d-block">
                    {puntuacion === 0 ? 'Selecciona de 1 a 5 estrellas' : `${puntuacion} estrella${puntuacion !== 1 ? 's' : ''}`}
                  </small>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">Título de tu reseña</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Excelente pizza, muy recomendada..."
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="rounded-3"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">Tu comentario</Form.Label>
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
            </motion.div>
          )}

          {yaCalificado && !success && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center py-4">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                <CheckCircle size={48} className="text-success" />
              </div>
              <h5 className="fw-bold">¡Ya calificaste este producto!</h5>
              <p className="text-muted">Gracias por compartir tu opinión</p>
              <Button variant="outline-danger" className="rounded-pill px-4 mt-2" onClick={onHide}>Cerrar</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        {!yaCalificado && !success && (
          <div className="d-flex gap-3 w-100">
            <Button variant="light" onClick={onHide} className="rounded-pill px-4 flex-grow-1">Cancelar</Button>
            <button
              className={`btn btn-danger rounded-pill px-4 fw-bold flex-grow-1 ${enviando || puntuacion === 0 ? 'opacity-50' : ''}`}
              onClick={handleSubmit}
              disabled={enviando || puntuacion === 0}
            >
              {enviando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Enviando...
                </>
              ) : (
                'Enviar Calificación'
              )}
            </button>
          </div>
        )}
      </Modal.Footer>

      <style>{`
        .calificacion-modal .modal-content {
          border-radius: 32px;
          overflow: hidden;
          border: none;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .btn-close-white {
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 12px;
          width: 36px;
          height: 36px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
          border-width: 0.15em;
        }
      `}</style>
    </Modal>
  );
};

export default ModalCalificacion;