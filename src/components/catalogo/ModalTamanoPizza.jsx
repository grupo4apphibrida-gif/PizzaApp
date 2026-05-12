import React, { useState } from "react";
import { Modal, Button, Row, Col, Card } from "react-bootstrap";
import { motion } from "framer-motion";

const ModalTamanoPizza = ({
  mostrar,
  onHide,
  producto,
  precioBase,
  onAgregar,
}) => {
  const [tamanioSeleccionado, setTamanioSeleccionado] = useState("6");

  // Definir tamaños y sus multiplicadores de precio
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
  const precioFinal = (precioBase * tamanioActual.multiplicador).toFixed(2);

  const handleAgregar = () => {
    onAgregar({
      tamanio: tamanioActual.nombre,
      piezas: tamanioActual.piezas,
      precioOriginal: precioBase,
      precio: parseFloat(precioFinal),
    });
    onHide();
  };

  return (
    <Modal show={mostrar} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0 bg-light">
        <Modal.Title className="fw-bold text-dark">
           Elige el tamaño de tu {producto?.nombre}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <p className="text-muted mb-4">
          {producto?.descripcion}
        </p>

        <Row className="g-3">
          {tamanos.map((tamano) => (
            <Col key={tamano.id} xs={12} md={4} className="mb-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer border-2 transition-all ${
                    tamanioSeleccionado === tamano.id
                      ? "border-black shadow-lg bg-dark-light"
                      : "border-light"
                  }`}
                  onClick={() => setTamanioSeleccionado(tamano.id)}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      tamanioSeleccionado === tamano.id
                        ? "#dedcdcff"
                        : "white",
                  }}
                >
                  <Card.Body className="text-center">
                    <div className="fs-3 mb-2">{tamano.icono}</div>
                    <h5 className="fw-bold text-dark">{tamano.nombre}</h5>
                    <p className="text-muted small mb-2">{tamano.piezas}</p>
                    <p className="text-muted small mb-3">{tamano.descripcion}</p>

                    {/* Cálculo dinámico del precio */}
                    <div className="border-top pt-2">
                      {tamanioSeleccionado === tamano.id && (
                        <div className="mb-2">
                          {tamano.multiplicador > 1 && (
                            <small className="text-success fw-bold">
                              +{((tamano.multiplicador - 1) * 100).toFixed(0)}%
                            </small>
                          )}
                        </div>
                      )}
                      <div className="fw-bold text-dark fs-6">
                        C$ {(precioBase * tamano.multiplicador).toFixed(2)}
                      </div>
                    </div>

                    {/* Radio button visual */}
                    <div className="mt-2">
                      <div
                        className={`rounded-circle border-2 mx-auto ${
                          tamanioSeleccionado === tamano.id
                            ? "border-danger bg-danger"
                            : "border-light"
                        }`}
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* Resumen */}
        <div className="mt-4 p-3 bg-light rounded-3 border border-grey">
          <Row className="align-items-center">
            <Col>
              <div className="fw-bold text-dark">
                {tamanioActual.nombre} ({tamanioActual.piezas})
              </div>
              <small className="text-muted">{tamanioActual.descripcion}</small>
            </Col>
            <Col className="text-end">
              <div className="fs-4 fw-bold text-dark">
                C$ {precioFinal}
              </div>
              {tamanioActual.multiplicador > 1 && (
                <small className="text-muted">
                  +{((tamanioActual.multiplicador - 1) * 100).toFixed(0)}% del precio base
                </small>
              )}
            </Col>
          </Row>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 p-3">
        <Button variant="outline-secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button
          variant="success"
          onClick={handleAgregar}
          className="fw-bold px-4"
        >
          <i className="bi bi-cart-plus me-2"></i>
          Agregar al carrito - C$ {precioFinal}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalTamanoPizza;
