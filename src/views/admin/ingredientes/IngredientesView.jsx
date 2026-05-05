import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../../../database/supabaseconfig";

import ModalRegistroIngrediente from "../../../components/ingredientes/ModalRegistroIngrediente";
import ModalEdicionIngrediente from "../../../components/ingredientes/ModalEdicionIngrediente";
import ModalEliminacionIngrediente from "../../../components/ingredientes/ModalEliminacionIngrediente";
import TablaIngredientes from "../../../components/ingredientes/TablaIngredientes";
import TarjetasIngredientes from "../../../components/ingredientes/TarjetasIngredientes";

import NotificacionOperacion from "../../../components/NotificacionOperacion";
import CuadroBusquedas from "../../../components/busquedas/CuadroBusquedas";
import Paginacion from "../../../components/Paginacion";

const IngredientesView = () => {
  const [ingredientes, setIngredientes] = useState([]);
  const [ingredientesFiltrados, setIngredientesFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  const [nuevoIngrediente, setNuevoIngrediente] = useState({
    nombre: "",
    unidad: "",
    stock: 0,
    stock_minimo: 0,
    fecha_vencimiento: "",
  });

  const [ingredienteEditar, setIngredienteEditar] = useState({
    id: "",
    nombre: "",
    unidad: "",
    stock: 0,
    stock_minimo: 0,
    fecha_vencimiento: "",
    actualizado_en: "",
  });

  const [ingredienteEliminar, setIngredienteEliminar] = useState(null);

  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "",
  });

  const cargarIngredientes = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("ingredientes")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;
      setIngredientes(data || []);
      setIngredientesFiltrados(data || []);
    } catch (err) {
      console.error("Error al cargar ingredientes:", err);
      setToast({ mostrar: true, mensaje: "Error al cargar ingredientes", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarIngredientes();
  }, []);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setIngredientesFiltrados(ingredientes);
    } else {
      const textoLower = textoBusqueda.toLowerCase();
      const filtrados = ingredientes.filter((ing) => {
        return (
          ing.nombre?.toLowerCase().includes(textoLower) ||
          ing.unidad?.toLowerCase().includes(textoLower)
        );
      });
      setIngredientesFiltrados(filtrados);
    }
    setPaginaActual(1);
  }, [textoBusqueda, ingredientes]);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoIngrediente((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setIngredienteEditar((prev) => ({ ...prev, [name]: value }));
  };

  const abrirModalEdicion = (ingrediente) => {
    setIngredienteEditar({
      id: ingrediente.id,
      nombre: ingrediente.nombre,
      unidad: ingrediente.unidad,
      stock: ingrediente.stock || 0,
      stock_minimo: ingrediente.stock_minimo || 0,
      fecha_vencimiento: ingrediente.fecha_vencimiento || "",
      actualizado_en: ingrediente.actualizado_en,
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (ingrediente) => {
    setIngredienteEliminar(ingrediente);
    setMostrarModalEliminacion(true);
  };

  const agregarIngrediente = async () => {
    try {
      if (!nuevoIngrediente.nombre?.trim()) throw new Error("El nombre es obligatorio");
      if (!nuevoIngrediente.unidad) throw new Error("La unidad es obligatoria");

      const { error } = await supabase.from("ingredientes").insert([{
        nombre: nuevoIngrediente.nombre.trim(),
        unidad: nuevoIngrediente.unidad,
        stock: Number(nuevoIngrediente.stock) || 0,
        stock_minimo: Number(nuevoIngrediente.stock_minimo) || 0,
        fecha_vencimiento: nuevoIngrediente.fecha_vencimiento || null,
      }]);

      if (error) throw error;

      setMostrarModal(false);
      setNuevoIngrediente({ nombre: "", unidad: "", stock: 0, stock_minimo: 0, fecha_vencimiento: "" });
      setToast({ mostrar: true, mensaje: "Ingrediente agregado", tipo: "exito" });
      await cargarIngredientes();
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message, tipo: "error" });
    }
  };

  const actualizarIngrediente = async () => {
    try {
      if (!ingredienteEditar.nombre?.trim()) throw new Error("El nombre es obligatorio");

      const { error } = await supabase
        .from("ingredientes")
        .update({
          nombre: ingredienteEditar.nombre.trim(),
          unidad: ingredienteEditar.unidad,
          stock: Number(ingredienteEditar.stock) || 0,
          stock_minimo: Number(ingredienteEditar.stock_minimo) || 0,
          fecha_vencimiento: ingredienteEditar.fecha_vencimiento || null,
          actualizado_en: new Date(),
        })
        .eq("id", ingredienteEditar.id);

      if (error) throw error;

      setMostrarModalEdicion(false);
      setToast({ mostrar: true, mensaje: "Ingrediente actualizado", tipo: "exito" });
      await cargarIngredientes();
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message, tipo: "error" });
    }
  };

  const eliminarIngrediente = async () => {
    try {
      const { error } = await supabase
        .from("ingredientes")
        .delete()
        .eq("id", ingredienteEliminar.id);

      if (error) throw error;

      setMostrarModalEliminacion(false);
      setToast({ mostrar: true, mensaje: "Ingrediente eliminado", tipo: "exito" });
      await cargarIngredientes();
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message, tipo: "error" });
    }
  };

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const ingredientesPaginados = ingredientesFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="bi bi-box-seam me-2"></i>
            Gestión de Ingredientes
          </h2>
          <p className="text-muted">Administra el inventario de ingredientes</p>
        </div>
        <Button variant="primary" onClick={() => setMostrarModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>Nuevo Ingrediente
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar por nombre o unidad..."
          />
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          {textoBusqueda && ingredientesFiltrados.length === 0 && (
            <Alert variant="info">No se encontraron ingredientes para "{textoBusqueda}"</Alert>
          )}

          {ingredientesFiltrados.length > 0 ? (
            <>
              <div className="d-none d-lg-block">
                <TablaIngredientes
                  ingredientes={ingredientesPaginados}
                  abrirModalEdicion={abrirModalEdicion}
                  abrirModalEliminacion={abrirModalEliminacion}
                />
              </div>
              <div className="d-block d-lg-none">
                <TarjetasIngredientes
                  ingredientes={ingredientesPaginados}
                  abrirModalEdicion={abrirModalEdicion}
                  abrirModalEliminacion={abrirModalEliminacion}
                />
              </div>

              <Paginacion
                registrosPorPagina={registrosPorPagina}
                totalRegistros={ingredientesFiltrados.length}
                paginaActual={paginaActual}
                establecerPaginaActual={setPaginaActual}
                establecerRegistrosPorPagina={setRegistrosPorPagina}
              />
            </>
          ) : (
            <div className="text-center py-5 bg-light rounded-4">
              <i className="bi bi-box-seam fs-1 text-muted"></i>
              <h5 className="mt-3">No hay ingredientes registrados</h5>
            </div>
          )}
        </>
      )}

      <ModalRegistroIngrediente
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoIngrediente={nuevoIngrediente}
        manejoCambioInput={manejoCambioInput}
        agregarIngrediente={agregarIngrediente}
      />

      <ModalEdicionIngrediente
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        ingredienteEditar={ingredienteEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarIngrediente={actualizarIngrediente}
      />

      <ModalEliminacionIngrediente
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarIngrediente={eliminarIngrediente}
        ingrediente={ingredienteEliminar}
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

export default IngredientesView;