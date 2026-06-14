import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Badge, Form, InputGroup, Modal } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../database/supabaseconfig";
import { useCarrito } from "../../../context/CarritoContext";
import { useAuth } from "../../../context/AuthContext";
import ModalTamanoPizza from "../../../components/catalogo/ModalTamanoPizza";
import ModalPromocion from "../../../components/catalogo/ModalPromocion";
import ModalPromocionPizza from "../../../components/catalogo/ModalPromocionPizza";
import StarsRating from "../../../components/Calificaciones/StarsRating";
import CalificacionesProducto from "../../../components/Calificaciones/CalificacionesProducto";
import ModalCalificacion from "../../../components/Calificaciones/ModalCalificacion";
import { 
  Search, Pizza, Flame, ShoppingCart, Gift, Percent, Calendar, 
  Tag, AlertCircle, Star, MessageCircle, X
} from "lucide-react";

const CatalogoCliente = () => {
  const { agregarAlCarrito } = useCarrito();
  const { user, profile } = useAuth();
  const [productos, setProductos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todos");
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [mostrarModalTamano, setMostrarModalTamano] = useState(false);
  const [mostrarModalPromocion, setMostrarModalPromocion] = useState(false);
  const [mostrarModalPromocionPizza, setMostrarModalPromocionPizza] = useState(false);
  const [mostrarModalCalificaciones, setMostrarModalCalificaciones] = useState(false);
  const [mostrarModalCalificar, setMostrarModalCalificar] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productoParaCalificaciones, setProductoParaCalificaciones] = useState(null);
  const [productoParaCalificar, setProductoParaCalificar] = useState(null);
  const [promocionSeleccionada, setPromocionSeleccionada] = useState(null);
  const [promocionPizzaSeleccionada, setPromocionPizzaSeleccionada] = useState(null);
  const [productoPizzaSeleccionado, setProductoPizzaSeleccionado] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [calificaciones, setCalificaciones] = useState({});

  const normalizarCategoria = (categoria) => categoria?.trim()?.toLowerCase() || "";

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      
      console.log("🔄 Cargando datos...");
      
      // Cargar productos
      const { data: productosData, error: productosError } = await supabase
        .from("productos")
        .select("*")
        .eq("disponible", true)
        .order("nombre");

      if (productosError) throw productosError;
      
      console.log("✅ Productos cargados:", productosData?.length || 0);
      console.log("📦 IDs de productos (UUIDs):", productosData?.map(p => ({ id: p.id, nombre: p.nombre })));
      setProductos(productosData || []);

      // Cargar promedios de calificaciones
      const { data: calificacionesData, error: califError } = await supabase
        .from("calificaciones")
        .select("producto_id, puntuacion")
        .eq("visible", true);

      if (!califError && calificacionesData) {
        const promedios = {};
        const conteos = {};
        calificacionesData.forEach(cal => {
          const id = String(cal.producto_id);
          if (!promedios[id]) {
            promedios[id] = 0;
            conteos[id] = 0;
          }
          promedios[id] += cal.puntuacion;
          conteos[id]++;
        });
        
        const promediosFinal = {};
        Object.keys(promedios).forEach(id => {
          promediosFinal[id] = (promedios[id] / conteos[id]).toFixed(1);
        });
        setCalificaciones(promediosFinal);
      }

      // Cargar promociones activas
      const { data: promocionesData, error: promocionesError } = await supabase
        .from("promociones")
        .select("*")
        .eq("activa", true)
        .order("creado_en", { ascending: false });

      if (promocionesError) throw promocionesError;
      
      setPromociones(promocionesData || []);
      
    } catch (error) {
      console.error("❌ Error cargando catálogo:", error);
      setError("Error al cargar los datos. Por favor, recarga la página.");
    } finally {
      setCargando(false);
    }
  };

  const verCalificaciones = (producto) => {
    setProductoParaCalificaciones(producto);
    setMostrarModalCalificaciones(true);
  };

  const abrirModalCalificar = (producto, e) => {
    e.stopPropagation();
    setProductoParaCalificar(producto);
    setMostrarModalCalificar(true);
  };

  const actualizarCalificaciones = () => {
    cargarDatos();
  };

  const esPromocionPizza = (promocion) => {
    const titulo = promocion.titulo?.toLowerCase() || "";
    return titulo.includes("pizza") || titulo.includes("2x1") || titulo.includes("pizzas");
  };

  const categoriasUnicas = Array.from(
    new Map(
      productos
        .filter((p) => p.categoria)
        .map((p) => [normalizarCategoria(p.categoria), p.categoria.trim()])
    ).values()
  );

  const productosFiltrados = productos.filter((p) => {
    const nombre = p.nombre?.toLowerCase() || "";
    const descripcion = p.descripcion?.toLowerCase() || "";
    const categoria = normalizarCategoria(p.categoria);
    const searchMatch = nombre.includes(textoBusqueda.toLowerCase()) || 
                       descripcion.includes(textoBusqueda.toLowerCase());
    const categoriaMatch = categoriaSeleccionada === "todos" || 
                          categoria === normalizarCategoria(categoriaSeleccionada);
    return searchMatch && categoriaMatch;
  });

  const promocionesFiltradas = promociones.filter((p) => {
    const titulo = p.titulo?.toLowerCase() || "";
    const descripcion = p.descripcion?.toLowerCase() || "";
    return titulo.includes(textoBusqueda.toLowerCase()) || 
           descripcion.includes(textoBusqueda.toLowerCase());
  });

  const handleProductoClick = (producto) => {
    setProductoSeleccionado({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      imagen: producto.imagen_url,
      precioBase: parseFloat(producto.precio),
    });
    setMostrarModalTamano(true);
  };

  const handlePromocionClick = (promocion) => {
    if (esPromocionPizza(promocion)) {
      const productoRelacionado = productos.find(p => 
        p.nombre?.toLowerCase().includes("pizza")
      ) || productos[0];
      
      if (productoRelacionado) {
        setProductoPizzaSeleccionado(productoRelacionado);
        setPromocionPizzaSeleccionada(promocion);
        setMostrarModalPromocionPizza(true);
      }
    } else {
      setPromocionSeleccionada(promocion);
      setMostrarModalPromocion(true);
    }
  };

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Pizza size={48} color="#dc3545" />
          </motion.div>
          <p className="mt-3 text-muted">Cargando nuestro delicioso menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="text-center p-4 bg-danger bg-opacity-10 rounded-4">
          <AlertCircle size={48} color="#dc3545" className="mb-3" />
          <h4 className="text-danger">Error al cargar los datos</h4>
          <p className="text-muted">{error}</p>
          <Button variant="danger" onClick={cargarDatos} className="rounded-pill px-4">
            Intentar de nuevo
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-5 py-5 px-3"
        style={{
          background: 'linear-gradient(135deg, #96281b 0%, #c0392b 45%, #e74c3c 75%, #ff6b35 100%)',
          borderRadius: '36px',
          boxShadow: '0 24px 60px rgba(192, 57, 43, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -30, width: 250, height: 250, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="bg-white rounded-circle d-inline-flex p-3 mb-4"
          style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
        >
          <Pizza size={52} color="#c0392b" />
        </motion.div>
        <h1 className="display-4 fw-bold text-white" style={{ fontFamily: "'Pacifico', cursive", textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
          Nuestro Menú
        </h1>
        <p className="lead mb-4" style={{ color: 'rgba(255,255,255,0.85)' }}>Las mejores pizzas de Juigalpa, hechas con amor 🧡</p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <span className="badge bg-white px-4 py-2 rounded-pill fw-bold" style={{ color: '#c0392b', fontSize: '0.82rem' }}>🔥 Horno de leña</span>
          <span className="badge px-4 py-2 rounded-pill fw-bold" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.82rem' }}>⭐ Ingredientes frescos</span>
          <span className="badge px-4 py-2 rounded-pill fw-bold" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.82rem' }}>⚡ Entrega rápida</span>
        </div>
      </motion.div>

      {/* Búsqueda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-5"
      >
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <InputGroup className="shadow-sm" style={{ borderRadius: '60px', overflow: 'hidden' }}>
              <InputGroup.Text style={{ background: 'white', border: 'none' }}>
                <Search size={20} color="#6c757d" />
              </InputGroup.Text>
              <Form.Control
                type="search"
                value={textoBusqueda}
                onChange={(e) => setTextoBusqueda(e.target.value)}
                placeholder="Busca tu pizza o promoción favorita..."
                style={{ border: 'none', padding: '12px 0' }}
              />
            </InputGroup>
          </Col>
        </Row>

        <Row className="justify-content-center mt-4">
          <Col xs={12} md={10} lg={8}>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <button
                className={`btn rounded-pill px-4 py-2 ${categoriaSeleccionada === "todos" ? "btn-danger" : "btn-outline-danger"}`}
                onClick={() => setCategoriaSeleccionada("todos")}
              >
                Todos
              </button>
              {categoriasUnicas.map((cat) => (
                <button
                  key={cat}
                  className={`btn rounded-pill px-4 py-2 ${categoriaSeleccionada === cat ? "btn-danger" : "btn-outline-danger"}`}
                  onClick={() => setCategoriaSeleccionada(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Col>
        </Row>
      </motion.div>

      {/* Sección de Promociones */}
      <AnimatePresence>
        {promocionesFiltradas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-5"
          >
            <div className="text-center mb-4">
              <Flame size={32} color="#ffc107" className="d-inline-block me-2" />
              <h2 className="d-inline-block fw-bold">🔥 Promociones Activas</h2>
              <p className="text-muted">¡Aprovecha estas ofertas especiales!</p>
            </div>
            <Row>
              {promocionesFiltradas.map((promo, idx) => (
                <Col key={promo.id} xs={12} sm={6} lg={4} className="mb-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -8 }}
                    onMouseEnter={() => setHoveredItem(promo.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Card
                      className="h-100 border-0 shadow-lg promocion-card"
                      style={{ 
                        borderRadius: '24px', 
                        cursor: 'pointer', 
                        overflow: 'hidden',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => handlePromocionClick(promo)}
                    >
                      <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                        {promo.imagen_url ? (
                          <motion.img
                            src={promo.imagen_url}
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                            animate={{ scale: hoveredItem === promo.id ? 1.1 : 1 }}
                            transition={{ duration: 0.3 }}
                            alt={promo.titulo}
                          />
                        ) : (
                          <div className="bg-gradient-warning d-flex align-items-center justify-content-center h-100">
                            {esPromocionPizza(promo) ? <Pizza size={64} color="#ffc107" /> : <Gift size={64} color="#ffc107" />}
                          </div>
                        )}
                        <div className="position-absolute top-0 start-0 m-3">
                          <Badge bg="warning" className="px-3 py-2 rounded-pill text-dark fw-bold">
                            <Percent size={14} className="me-1" />
                            {promo.descuento}% OFF
                          </Badge>
                        </div>
                        {esPromocionPizza(promo) && (
                          <div className="position-absolute top-0 end-0 m-3">
                            <Badge bg="danger" className="px-2 py-2 rounded-pill">
                              <Pizza size={12} className="me-1" />
                              Pizza
                            </Badge>
                          </div>
                        )}
                      </div>

                      <Card.Body className="p-4 text-center">
                        <h4 className="fw-bold mb-2">{promo.titulo}</h4>
                        <p className="text-muted small mb-3">{promo.descripcion || "Sin descripción"}</p>
                        
                        {promo.fecha_fin && (
                          <div className="d-flex justify-content-center align-items-center gap-2 text-muted small mb-3">
                            <Calendar size={14} />
                            <span>Válido hasta: {new Date(promo.fecha_fin).toLocaleDateString()}</span>
                          </div>
                        )}

                        <Button 
                          variant="danger" 
                          className="rounded-pill w-100 py-2 fw-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePromocionClick(promo);
                          }}
                        >
                          <ShoppingCart size={18} className="me-2" />
                          {esPromocionPizza(promo) ? "Aplicar oferta" : "Aprovechar oferta"}
                        </Button>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje si no hay promociones */}
      {promociones.length === 0 && !cargando && (
        <div className="text-center mb-5 p-4 bg-light rounded-4">
          <Gift size={48} color="#ffc107" className="mb-3" />
          <h4>No hay promociones activas en este momento</h4>
          <p className="text-muted">¡Vuelve pronto para ofertas especiales!</p>
        </div>
      )}

      {/* Productos Regulares */}
      <div className="mb-4">
        <div className="text-center mb-4">
          <h2 className="fw-bold">🍕 Nuestras Especialidades</h2>
          <p className="text-muted">Elige tu favorito y personalízalo al tamaño que quieras</p>
        </div>
        <Row>
          {productosFiltrados.length === 0 && (
            <div className="text-center py-5">
              <Pizza size={48} color="#dee2e6" />
              <p className="mt-3 text-muted">No se encontraron productos</p>
            </div>
          )}
          {productosFiltrados.map((producto, idx) => (
            <Col key={producto.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                onMouseEnter={() => setHoveredItem(producto.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Card
                  className="h-100 border-0 shadow-sm producto-card"
                  style={{ borderRadius: '24px', cursor: 'pointer', overflow: 'hidden' }}
                  onClick={() => handleProductoClick(producto)}
                >
                  <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                    {producto.imagen_url ? (
                      <motion.img
                        src={producto.imagen_url}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                        animate={{ scale: hoveredItem === producto.id ? 1.05 : 1 }}
                        transition={{ duration: 0.3 }}
                        alt={producto.nombre}
                      />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center h-100">
                        <Pizza size={48} color="#dee2e6" />
                      </div>
                    )}
                    <div className="position-absolute top-0 start-0 m-3">
                      <Badge bg="dark" className="px-3 py-2 rounded-pill">
                        {producto.categoria || 'General'}
                      </Badge>
                    </div>
                  </div>

                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="fw-bold mb-0">{producto.nombre}</Card.Title>
                      <button 
                        className="btn btn-link text-warning p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          verCalificaciones(producto);
                        }}
                        title="Ver calificaciones"
                      >
                        <Star size={18} fill={calificaciones[producto.id] ? "#ffc107" : "none"} />
                      </button>
                    </div>
                    
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <StarsRating rating={calificaciones[producto.id] ? Math.round(calificaciones[producto.id]) : 0} readonly={true} size={14} />
                      {calificaciones[producto.id] && (
                        <small className="text-muted">{calificaciones[producto.id]} ★</small>
                      )}
                      <button 
                        className="btn btn-link text-muted p-0 small"
                        onClick={(e) => {
                          e.stopPropagation();
                          verCalificaciones(producto);
                        }}
                      >
                        <MessageCircle size={12} className="me-1" />Ver reseñas
                      </button>
                    </div>
                    
                    <Card.Text className="text-muted small mb-3" style={{ minHeight: '40px' }}>
                      {producto.descripcion?.substring(0, 60)}...
                    </Card.Text>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="fw-bold fs-5 text-danger">
                        C$ {producto.precio}
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="bg-warning rounded-circle d-flex align-items-center justify-content-center border-0"
                          style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                          onClick={(e) => abrirModalCalificar(producto, e)}
                          title="Calificar producto"
                        >
                          <Star size={20} color="#fff" />
                        </button>
                        <div
                          className="bg-danger rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductoClick(producto);
                          }}
                        >
                          <ShoppingCart size={20} color="white" />
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </div>

      <style>{`
        .producto-card, .promocion-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .producto-card:hover, .promocion-card:hover {
          box-shadow: 0 15px 35px rgba(220, 53, 69, 0.15) !important;
        }
        .bg-gradient-warning {
          background: linear-gradient(135deg, #fff5e6, #ffe0b3);
        }
      `}</style>

      {/* Modales */}
      {productoSeleccionado && (
        <ModalTamanoPizza
          mostrar={mostrarModalTamano}
          onHide={() => {
            setMostrarModalTamano(false);
            setProductoSeleccionado(null);
          }}
          producto={productoSeleccionado}
          precioBase={productoSeleccionado.precioBase}
          esPromocion={productoSeleccionado.esPromocion || false}
          descuento={productoSeleccionado.descuento || 0}
          tituloPromocion={productoSeleccionado.tituloPromocion || ""}
          onAgregar={(item) => {
            agregarAlCarrito(item);
            setMostrarModalTamano(false);
            setProductoSeleccionado(null);
          }}
        />
      )}

      {promocionSeleccionada && (
        <ModalPromocion
          mostrar={mostrarModalPromocion}
          onHide={() => {
            setMostrarModalPromocion(false);
            setPromocionSeleccionada(null);
          }}
          promocion={promocionSeleccionada}
          onAgregar={(promo, cantidad) => {
            agregarAlCarrito({
              id: promo.id,
              nombre: promo.titulo,
              descripcion: promo.descripcion,
              imagen: promo.imagen_url,
              precio: 100 * (1 - promo.descuento / 100),
              precioOriginal: 100,
              descuento: promo.descuento,
              esPromocion: true,
              cantidad: cantidad,
              tipoEntrega: "retiro",
            });
            setMostrarModalPromocion(false);
            setPromocionSeleccionada(null);
          }}
        />
      )}

      {/* Modal de Promoción de Pizza */}
      {promocionPizzaSeleccionada && productoPizzaSeleccionado && (
        <ModalPromocionPizza
          mostrar={mostrarModalPromocionPizza}
          onHide={() => {
            setMostrarModalPromocionPizza(false);
            setPromocionPizzaSeleccionada(null);
            setProductoPizzaSeleccionado(null);
          }}
          promocion={promocionPizzaSeleccionada}
          producto={productoPizzaSeleccionado}
          onAgregar={(item) => {
            agregarAlCarrito(item);
            setMostrarModalPromocionPizza(false);
            setPromocionPizzaSeleccionada(null);
            setProductoPizzaSeleccionado(null);
          }}
        />
      )}

      {/* Modal de Ver Calificaciones */}
      {productoParaCalificaciones && (
        <Modal show={mostrarModalCalificaciones} onHide={() => setMostrarModalCalificaciones(false)} size="lg" centered className="calificaciones-modal">
          <Modal.Header className="border-0 p-4" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white rounded-circle p-2">
                <Star size={24} color="#dc3545" />
              </div>
              <div>
                <Modal.Title className="fw-bold text-white">
                  Calificaciones de {productoParaCalificaciones.nombre}
                </Modal.Title>
                <p className="text-white-50 small mb-0">Comentarios de nuestros más queridos clientes 😊👍</p>
              </div>
            </div>
            <button onClick={() => setMostrarModalCalificaciones(false)} className="btn-close-white">
              <X size={20} />
            </button>
          </Modal.Header>
          <Modal.Body className="p-0">
            <CalificacionesProducto 
              productoId={productoParaCalificaciones.id}
              productoNombre={productoParaCalificaciones.nombre}
            />
          </Modal.Body>
        </Modal>
      )}

      {/* Modal de Calificar Producto */}
      {productoParaCalificar && (
        <ModalCalificacion
          mostrar={mostrarModalCalificar}
          onHide={() => setMostrarModalCalificar(false)}
          producto={productoParaCalificar}
          onCalificado={actualizarCalificaciones}
        />
      )}

      <style>{`
        .calificaciones-modal .modal-content {
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
    </Container>
  );
};

export default CatalogoCliente;