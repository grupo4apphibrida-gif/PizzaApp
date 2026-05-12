import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Badge, Form } from "react-bootstrap";
import { supabase } from "../../../database/supabaseconfig";
import { useCarrito } from "../../../context/CarritoContext";
import ModalTamanoPizza from "../../../components/catalogo/ModalTamanoPizza";

const CatalogoCliente = () => {
  const { agregarAlCarrito } = useCarrito();
  const [productos, setProductos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todos");
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [mostrarModalTamano, setMostrarModalTamano] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const normalizarCategoria = (categoria) => categoria?.trim()?.toLowerCase() || "";

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const { data: productosData, error: productosError } = await supabase
        .from("productos")
        .select("*")
        .eq("disponible", true)
        .order("nombre");

      if (productosError) throw productosError;

      const { data: promocionesData, error: promocionesError } = await supabase
        .from("promociones")
        .select("*")
        .eq("activa", true)
        .gte("fecha_fin", new Date().toISOString());

      if (promocionesError) throw promocionesError;

      setProductos(productosData || []);
      setPromociones(promocionesData || []);
    } catch (error) {
      console.error("Error cargando catálogo:", error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerPrecioConPromocion = (producto) => {
    const promocionActiva = promociones.find((p) => p.activa === true);

    if (promocionActiva) {
      const descuento = Number(promocionActiva.descuento);
      const precioOriginal = Number(producto.precio);
      const precioFinal = precioOriginal - (precioOriginal * descuento) / 100;
      return {
        precioFinal: precioFinal.toFixed(2),
        tienePromocion: true,
        descuento,
        precioOriginal: precioOriginal.toFixed(2),
      };
    }

    return {
      precioFinal: producto.precio,
      tienePromocion: false,
      descuento: 0,
    };
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
    const searchMatch =
      nombre.includes(textoBusqueda.toLowerCase()) ||
      descripcion.includes(textoBusqueda.toLowerCase()) ||
      categoria.includes(textoBusqueda.toLowerCase());

    const categoriaMatch =
      categoriaSeleccionada === "todos" ||
      categoria === normalizarCategoria(categoriaSeleccionada);

    return searchMatch && categoriaMatch;
  });

  if (cargando) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p>Cargando nuestro delicioso menú...</p>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <div className="text-center mb-5 py-4 px-3 rounded-4 shadow-sm" style={{ background: 'linear-gradient(135deg, rgba(255,245,245,0.9), rgba(255,255,255,0.8))' }}>
        <h1 className="display-5 fw-bold text-dark">Nuestro Menú</h1>
        <p className="lead text-muted mb-3">Las mejores pizzas de Juigalpa, hechas con amor</p>
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <Badge bg="danger" pill>Fresco</Badge>
          <Badge bg="warning" pill text="dark">Sabor casero</Badge>
          <Badge bg="success" pill>Rápido</Badge>
        </div>
      </div>

      <Row className="mb-4 justify-content-center">
        <Col xs={12} md={10} lg={8} className="mb-3">
          <Form.Control
            type="search"
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Busca tu pizza favorita..."
            className="shadow-sm"
            style={{ minHeight: '50px' }}
          />
        </Col>
      </Row>

      <Row className="mb-4 justify-content-center">
        <Col xs={12} md={10} lg={8} className="d-flex flex-wrap gap-2 justify-content-center">
          <Button
            variant={categoriaSeleccionada === "todos" ? "danger" : "outline-danger"}
            className="rounded-pill px-4 py-2"
            onClick={() => setCategoriaSeleccionada("todos")}
          >
            Todos
          </Button>
          {categoriasUnicas.map((cat) => (
            <Button
              key={cat}
              variant={categoriaSeleccionada === cat ? "danger" : "outline-danger"}
              onClick={() => setCategoriaSeleccionada(cat)}
              className="rounded-pill px-4 py-2"
            >
              {cat}
            </Button>
          ))}
        </Col>
      </Row>

      {promociones.length > 0 && (
        <div className="mb-5">
          <h3 className="text-center mb-3">
            <Badge bg="warning" text="dark">🔥 Promociones Activas 🔥</Badge>
          </h3>
          <Row>
            {promociones.map((promo) => (
              <Col key={promo.id} xs={12} md={6} lg={4} className="mb-3">
                <Card className="border-warning">
                  <Card.Body className="text-center">
                    <i className="bi bi-gift-fill fs-1 text-warning"></i>
                    <h4 className="mt-2">{promo.titulo}</h4>
                    <p>{promo.descripcion}</p>
                    <h3 className="text-danger">{promo.descuento}% OFF</h3>
                    <small>Válido hasta: {new Date(promo.fecha_fin).toLocaleDateString()}</small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      <Row>
        <Col xs={12} className="text-center mb-4">
          <h3 className="fw-bold">Nuestras Especialidades</h3>
          <p className="text-muted">Elige tu favorito y personalízalo al tamaño que quieras</p>
        </Col>
        {productosFiltrados.map((producto) => {
          const { precioFinal, tienePromocion, descuento, precioOriginal } = obtenerPrecioConPromocion(producto);

          return (
            <Col key={producto.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <Card
                className="h-100 shadow producto-card border-0"
                style={{ borderRadius: '24px', cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setProductoSeleccionado({
                    id: producto.id,
                    nombre: producto.nombre,
                    descripcion: producto.descripcion,
                    imagen: producto.imagen_url,
                    precioBase: parseFloat(precioFinal),
                  });
                  setMostrarModalTamano(true);
                }}
              >
                <div className="position-relative overflow-hidden rounded-top" style={{ minHeight: '220px' }}>
                  {producto.imagen_url ? (
                    <Card.Img
                      variant="top"
                      src={producto.imagen_url}
                      style={{ height: "220px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="bg-light d-flex align-items-center justify-content-center"
                      style={{ height: "220px" }}
                    >
                      <i className="bi bi-image fs-1 text-muted"></i>
                    </div>
                  )}
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.45), transparent)' }}
                  />
                  <Badge
                    bg="dark"
                    className="position-absolute top-0 start-0 m-3"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {producto.categoria || 'General'}
                  </Badge>
                </div>

                <Card.Body >
                  <Card.Title className="fw-bold mb-2">{producto.nombre}</Card.Title>
                  <Card.Text className="text-muted small mb-3">
                    {producto.descripcion?.substring(0, 80) || 'Deliciosa pizza disponible ahora.'}
                  </Card.Text>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      {tienePromocion ? (
                        <>
                          <div className="text-muted small text-decoration-line-end">
                            C$ {precioOriginal}
                          </div>
                        </>
                      ) : (
                        <div className="text-black fw-bold  fs-7">C$ {precioFinal}</div>
                      )}
                    </div>
                    {tienePromocion && (
                      <Badge bg="warning" text="dark" className="py-2 px-3 rounded-pill">
                        -{descuento}%
                      </Badge>
                    )}
                  </div>

</Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <style>
        {`
          .producto-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
          }
          .producto-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(254, 0, 0, 0.15);
          }
        `}
      </style>

      {/* Modal para seleccionar tamaño de pizza */}
      {productoSeleccionado && (
        <ModalTamanoPizza
          mostrar={mostrarModalTamano}
          onHide={() => setMostrarModalTamano(false)}
          producto={productoSeleccionado}
          precioBase={productoSeleccionado.precioBase}
          onAgregar={(productoConTamano) => {
            agregarAlCarrito({
              id: productoSeleccionado.id,
              nombre: productoSeleccionado.nombre,
              imagen: productoSeleccionado.imagen,
              ...productoConTamano,
              cantidad: 1,
            });
          }}
        />
      )}
    </Container>
  );
};

export default CatalogoCliente;