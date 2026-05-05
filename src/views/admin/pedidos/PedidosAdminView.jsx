import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../../../database/supabaseconfig";

import ModalEstadoPedido from "../../../components/pedidos/ModalEstadoPedido";
import TablaPedidos from "../../../components/pedidos/TablaPedidos";
import TarjetasPedidos from "../../../components/pedidos/TarjetasPedidos";

import NotificacionOperacion from "../../../components/NotificacionOperacion";
import CuadroBusquedas from "../../../components/busquedas/CuadroBusquedas";
import Paginacion from "../../../components/Paginacion";

const PedidosAdminView = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);
  const [pedidoActualizar, setPedidoActualizar] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");

  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "",
  });

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("pedidos")
        .select("*, usuarios(nombre)")
        .order("creado_en", { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
      setPedidosFiltrados(data || []);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
      setToast({ mostrar: true, mensaje: "Error al cargar pedidos", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setPedidosFiltrados(pedidos);
    } else {
      const textoLower = textoBusqueda.toLowerCase();
      const filtrados = pedidos.filter((ped) => {
        return (
          ped.id?.toLowerCase().includes(textoLower) ||
          ped.usuarios?.nombre?.toLowerCase().includes(textoLower) ||
          ped.nombre_cliente?.toLowerCase().includes(textoLower) ||
          ped.estado?.toLowerCase().includes(textoLower)
        );
      });
      setPedidosFiltrados(filtrados);
    }
    setPaginaActual(1);
  }, [textoBusqueda, pedidos]);

  const abrirModalEstado = (pedido) => {
    setPedidoActualizar(pedido);
    setNuevoEstado(pedido.estado);
    setMostrarModalEstado(true);
  };

  const actualizarEstadoPedido = async () => {
    try {
      const updates = { estado: nuevoEstado };
      if (nuevoEstado === "entregado") {
        updates.completado_en = new Date();
      }

      const { error } = await supabase
        .from("pedidos")
        .update(updates)
        .eq("id", pedidoActualizar.id);

      if (error) throw error;

      setMostrarModalEstado(false);
      setToast({ mostrar: true, mensaje: `Pedido actualizado a ${nuevoEstado}`, tipo: "exito" });
      await cargarPedidos();
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message, tipo: "error" });
    }
  };

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2><i className="bi bi-cart-check me-2"></i>Gestión de Pedidos</h2>
          <p className="text-muted">Administra y actualiza el estado de los pedidos</p>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar por cliente o ID..."
          />
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          {textoBusqueda && pedidosFiltrados.length === 0 && (
            <Alert variant="info">No se encontraron pedidos para "{textoBusqueda}"</Alert>
          )}

          {pedidosFiltrados.length > 0 ? (
            <>
              <div className="d-none d-lg-block">
                <TablaPedidos
                  pedidos={pedidosPaginados}
                  abrirModalEstado={abrirModalEstado}
                />
              </div>
              <div className="d-block d-lg-none">
                <TarjetasPedidos
                  pedidos={pedidosPaginados}
                  abrirModalEstado={abrirModalEstado}
                />
              </div>

              <Paginacion
                registrosPorPagina={registrosPorPagina}
                totalRegistros={pedidosFiltrados.length}
                paginaActual={paginaActual}
                establecerPaginaActual={setPaginaActual}
                establecerRegistrosPorPagina={setRegistrosPorPagina}
              />
            </>
          ) : (
            <div className="text-center py-5 bg-light rounded-4">
              <i className="bi bi-cart fs-1 text-muted"></i>
              <h5 className="mt-3">No hay pedidos registrados</h5>
            </div>
          )}
        </>
      )}

      <ModalEstadoPedido
        mostrarModalEstado={mostrarModalEstado}
        setMostrarModalEstado={setMostrarModalEstado}
        pedidoActualizar={pedidoActualizar}
        nuevoEstado={nuevoEstado}
        setNuevoEstado={setNuevoEstado}
        actualizarEstadoPedido={actualizarEstadoPedido}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default PedidosAdminView;