import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../../../database/supabaseconfig";

import ModalRegistroPromocion from "../../../components/promociones/ModalRegistroPromocion";
import ModalEdicionPromocion from "../../../components/promociones/ModalEdicionPromocion";
import ModalEliminacionPromocion from "../../../components/promociones/ModalEliminacionPromocion";
import TablaPromociones from "../../../components/promociones/TablaPromociones";
import TarjetasPromociones from "../../../components/promociones/TarjetasPromociones";

import NotificacionOperacion from "../../../components/NotificacionOperacion";
import CuadroBusquedas from "../../../components/busquedas/CuadroBusquedas";
import Paginacion from "../../../components/Paginacion";

const PromocionesView = () => {
  const [promociones, setPromociones] = useState([]);
  const [promocionesFiltrados, setPromocionesFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  const [nuevaPromocion, setNuevaPromocion] = useState({
    titulo: "",
    descripcion: "",
    descuento: "",
    activa: true,
    fecha_inicio: "",
    fecha_fin: "",
    imagen_url: "",
  });

  const [promocionEditar, setPromocionEditar] = useState({
    id: "",
    titulo: "",
    descripcion: "",
    descuento: "",
    activa: true,
    fecha_inicio: "",
    fecha_fin: "",
    imagen_url: "",
  });

  const [promocionEliminar, setPromocionEliminar] = useState(null);

  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "",
  });

  const cargarPromociones = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("promociones")
        .select("*")
        .order("creado_en", { ascending: false });

      if (error) throw error;
      setPromociones(data || []);
      setPromocionesFiltrados(data || []);
    } catch (err) {
      console.error("Error al cargar promociones:", err);
      setToast({ mostrar: true, mensaje: "Error al cargar promociones", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPromociones();
  }, []);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setPromocionesFiltrados(promociones);
    } else {
      const textoLower = textoBusqueda.toLowerCase();
      const filtrados = promociones.filter((prom) => {
        return (
          prom.titulo?.toLowerCase().includes(textoLower) ||
          prom.descripcion?.toLowerCase().includes(textoLower)
        );
      });
      setPromocionesFiltrados(filtrados);
    }
    setPaginaActual(1);
  }, [textoBusqueda, promociones]);

  const manejoCambioInput = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevaPromocion((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value, type, checked } = e.target;
    setPromocionEditar((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImagenPromocion = async ({ target }, editar = false) => {
    const file = target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imagenBase64 = reader.result;
      if (editar) {
        setPromocionEditar((prev) => ({ ...prev, imagen_url: imagenBase64 }));
      } else {
        setNuevaPromocion((prev) => ({ ...prev, imagen_url: imagenBase64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const abrirModalEdicion = (promocion) => {
    setPromocionEditar({
      id: promocion.id,
      titulo: promocion.titulo,
      descripcion: promocion.descripcion || "",
      descuento: promocion.descuento,
      activa: promocion.activa !== false,
      fecha_inicio: promocion.fecha_inicio || "",
      fecha_fin: promocion.fecha_fin || "",
      imagen_url: promocion.imagen_url || "",
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (promocion) => {
    setPromocionEliminar(promocion);
    setMostrarModalEliminacion(true);
  };

  const agregarPromocion = async () => {
    try {
      if (!nuevaPromocion.titulo?.trim()) throw new Error("El título es obligatorio");
      if (!nuevaPromocion.descuento) throw new Error("El descuento es obligatorio");

      const { error } = await supabase.from("promociones").insert([{
        titulo: nuevaPromocion.titulo.trim(),
        descripcion: nuevaPromocion.descripcion?.trim() || null,
        descuento: Number(nuevaPromocion.descuento),
        activa: nuevaPromocion.activa,
        fecha_inicio: nuevaPromocion.fecha_inicio || null,
        fecha_fin: nuevaPromocion.fecha_fin || null,
        imagen_url: nuevaPromocion.imagen_url || null,
      }]);

      if (error) throw error;

      setMostrarModal(false);
      setNuevaPromocion({ titulo: "", descripcion: "", descuento: "", activa: true, fecha_inicio: "", fecha_fin: "", imagen_url: "" });
      setToast({ mostrar: true, mensaje: "Promoción creada", tipo: "exito" });
      await cargarPromociones();
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message, tipo: "error" });
    }
  };

  const actualizarPromocion = async () => {
    try {
      if (!promocionEditar.titulo?.trim()) throw new Error("El título es obligatorio");

      const { error } = await supabase
        .from("promociones")
        .update({
          titulo: promocionEditar.titulo.trim(),
          descripcion: promocionEditar.descripcion?.trim() || null,
          descuento: Number(promocionEditar.descuento),
          activa: promocionEditar.activa,
          fecha_inicio: promocionEditar.fecha_inicio || null,
          fecha_fin: promocionEditar.fecha_fin || null,
          imagen_url: promocionEditar.imagen_url || null,
        })
        .eq("id", promocionEditar.id);

      if (error) throw error;

      setMostrarModalEdicion(false);
      setToast({ mostrar: true, mensaje: "Promoción actualizada", tipo: "exito" });
      await cargarPromociones();
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message, tipo: "error" });
    }
  };

  const eliminarPromocion = async () => {
    try {
      const { error } = await supabase
        .from("promociones")
        .delete()
        .eq("id", promocionEliminar.id);

      if (error) throw error;

      setMostrarModalEliminacion(false);
      setToast({ mostrar: true, mensaje: "Promoción eliminada", tipo: "exito" });
      await cargarPromociones();
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message, tipo: "error" });
    }
  };

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const promocionesPaginados = promocionesFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2><i className="bi bi-tags me-2"></i>Gestión de Promociones</h2>
          <p className="text-muted">Administra ofertas y descuentos</p>
        </div>
        <Button variant="primary" onClick={() => setMostrarModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>Nueva Promoción
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar por título o descripción..."
          />
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          {textoBusqueda && promocionesFiltrados.length === 0 && (
            <Alert variant="info">No se encontraron promociones para "{textoBusqueda}"</Alert>
          )}

          {promocionesFiltrados.length > 0 ? (
            <>
              <div className="d-none d-lg-block">
                <TablaPromociones
                  promociones={promocionesPaginados}
                  abrirModalEdicion={abrirModalEdicion}
                  abrirModalEliminacion={abrirModalEliminacion}
                />
              </div>
              <div className="d-block d-lg-none">
                <TarjetasPromociones
                  promociones={promocionesPaginados}
                  abrirModalEdicion={abrirModalEdicion}
                  abrirModalEliminacion={abrirModalEliminacion}
                />
              </div>

              <Paginacion
                registrosPorPagina={registrosPorPagina}
                totalRegistros={promocionesFiltrados.length}
                paginaActual={paginaActual}
                establecerPaginaActual={setPaginaActual}
                establecerRegistrosPorPagina={setRegistrosPorPagina}
              />
            </>
          ) : (
            <div className="text-center py-5 bg-light rounded-4">
              <i className="bi bi-tags fs-1 text-muted"></i>
              <h5 className="mt-3">No hay promociones registradas</h5>
            </div>
          )}
        </>
      )}

      <ModalRegistroPromocion
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevaPromocion={nuevaPromocion}
        manejoCambioInput={manejoCambioInput}
        manejoCambioImagen={(e) => handleImagenPromocion(e, false)}
        agregarPromocion={agregarPromocion}
      />

      <ModalEdicionPromocion
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        promocionEditar={promocionEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioImagen={(e) => handleImagenPromocion(e, true)}
        actualizarPromocion={actualizarPromocion}
      />

      <ModalEliminacionPromocion
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarPromocion={eliminarPromocion}
        promocion={promocionEliminar}
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

export default PromocionesView;