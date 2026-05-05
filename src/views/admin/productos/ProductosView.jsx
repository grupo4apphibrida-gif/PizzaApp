import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../../../database/supabaseconfig";

import ModalRegistroProducto from "../../../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../../../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../../../components/productos/ModalEliminacionProducto";
import TarjetasProductos from "../../../components/productos/TarjetasProductos";
import TablaProductos from "../../../components/productos/TablaProductos";

import NotificacionOperacion from "../../../components/NotificacionOperacion";
import CuadroBusquedas from "../../../components/busquedas/CuadroBusquedas";
import Paginacion from "../../../components/Paginacion";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(5);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    disponible: true,
    archivo: null,
  });

  const [productoEditar, setProductoEditar] = useState({
    id: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    imagen_url: "",
    disponible: true,
    archivo: null,
  });

  const [productoEliminar, setProductoEliminar] = useState(null);

  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "",
  });

  const cargarProductos = async () => {
    try {
      setCargando(true);

      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;

      setProductos(data || []);
      setProductosFiltrados(data || []);
    } catch (err) {
      console.error("Error al cargar productos:", err);

      setToast({
        mostrar: true,
        mensaje: "Error al cargar productos",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  // ✅ MANEJADOR CORREGIDO (soporta checkbox)
  const manejoCambioInput = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoProducto((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const manejoCambioArchivo = (e) => {
    const archivo = e.target.files[0];

    if (archivo && archivo.type.startsWith("image/")) {
      setNuevoProducto((prev) => ({
        ...prev,
        archivo,
      }));
    } else {
      alert("Selecciona una imagen válida");
    }
  };

  // ✅ MANEJADOR CORREGIDO (soporta checkbox)
  const manejoCambioInputEdicion = (e) => {
    const { name, value, type, checked } = e.target;
    setProductoEditar((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const manejoCambioArchivoEdicion = (e) => {
    const archivo = e.target.files[0];

    if (archivo && archivo.type.startsWith("image/")) {
      setProductoEditar((prev) => ({
        ...prev,
        archivo,
      }));
    } else {
      alert("Selecciona una imagen válida");
    }
  };

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  const abrirModalEdicion = (producto) => {
    setProductoEditar({
      id: producto.id,
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      categoria: producto.categoria || "",
      precio: producto.precio || "",
      imagen_url: producto.imagen_url || "",
      disponible: producto.disponible !== false,
      archivo: null,
    });

    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (producto) => {
    setProductoEliminar(producto);
    setMostrarModalEliminacion(true);
  };

  // ✅ AGREGAR PRODUCTO CON disponible
  const agregarProducto = async () => {
    try {
      if (!nuevoProducto.nombre.trim() || !nuevoProducto.precio || !nuevoProducto.archivo) {
        setToast({
          mostrar: true,
          mensaje: "Completa nombre, precio e imagen",
          tipo: "advertencia",
        });
        return;
      }

      const precioVenta = Number(nuevoProducto.precio);

      if (Number.isNaN(precioVenta)) {
        throw new Error("El precio no es válido.");
      }

      const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes_productos")
        .upload(nombreArchivo, nuevoProducto.archivo);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("imagenes_productos")
        .getPublicUrl(nombreArchivo);

      const nuevoProductoInsertar = {
        nombre: nuevoProducto.nombre.trim(),
        descripcion: nuevoProducto.descripcion.trim() || null,
        categoria: nuevoProducto.categoria.trim() || null,
        precio: precioVenta,
        imagen_url: urlData.publicUrl,
        disponible: nuevoProducto.disponible,
      };

      const { error } = await supabase.from("productos").insert([nuevoProductoInsertar]);

      if (error) throw error;

      setNuevoProducto({
        nombre: "",
        descripcion: "",
        categoria: "",
        precio: "",
        disponible: true,
        archivo: null,
      });

      setMostrarModal(false);

      setToast({
        mostrar: true,
        mensaje: "Producto registrado correctamente",
        tipo: "exito",
      });

      await cargarProductos();
    } catch (err) {
      console.error("Error al agregar producto:", err);

      setToast({
        mostrar: true,
        mensaje: err?.message || "Error al registrar producto",
        tipo: "error",
      });
    }
  };

  // ✅ ACTUALIZAR PRODUCTO CON disponible
  const actualizarProducto = async () => {
    try {
      if (
        !productoEditar.nombre.trim() ||
        !productoEditar.categoria ||
        !productoEditar.precio
      ) {
        setToast({
          mostrar: true,
          mensaje: "Completa nombre, categoría y precio",
          tipo: "advertencia",
        });
        return;
      }

      let urlImagen = productoEditar.imagen_url;

      if (productoEditar.archivo) {
        const nombreArchivo = `${Date.now()}_${productoEditar.archivo.name}`;

        const { error: uploadError } = await supabase.storage
          .from("imagenes_productos")
          .upload(nombreArchivo, productoEditar.archivo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("imagenes_productos")
          .getPublicUrl(nombreArchivo);

        urlImagen = urlData.publicUrl;
      }

      const productoActualizar = {
        nombre: productoEditar.nombre.trim(),
        descripcion: productoEditar.descripcion.trim() || null,
        categoria: productoEditar.categoria.trim() || null,
        precio: Number(productoEditar.precio),
        imagen_url: urlImagen,
        disponible: productoEditar.disponible,
      };

      const { error } = await supabase
        .from("productos")
        .update(productoActualizar)
        .eq("id", productoEditar.id);

      if (error) throw error;

      setMostrarModalEdicion(false);

      setToast({
        mostrar: true,
        mensaje: "Producto actualizado correctamente",
        tipo: "exito",
      });

      await cargarProductos();
    } catch (err) {
      console.error("Error al actualizar producto:", err);

      setToast({
        mostrar: true,
        mensaje: err?.message || "Error al actualizar producto",
        tipo: "error",
      });
    }
  };

  const eliminarProducto = async () => {
    try {
      if (!productoEliminar?.id) {
        throw new Error("No se seleccionó ningún producto.");
      }

      const { error } = await supabase
        .from("productos")
        .delete()
        .eq("id", productoEliminar.id);

      if (error) throw error;

      setMostrarModalEliminacion(false);
      setProductoEliminar(null);

      setToast({
        mostrar: true,
        mensaje: "Producto eliminado correctamente",
        tipo: "exito",
      });

      await cargarProductos();
    } catch (err) {
      console.error("Error al eliminar producto:", err);

      setToast({
        mostrar: true,
        mensaje: err?.message || "Error al eliminar producto",
        tipo: "error",
      });
    }
  };

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setProductosFiltrados(productos);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();

      const filtrados = productos.filter((prod) => {
        const nombre = prod.nombre?.toLowerCase() || "";
        const descripcion = prod.descripcion?.toLowerCase() || "";
        const precio = prod.precio?.toString() || "";
        const categoria = prod.categoria?.toLowerCase() || "";

        return (
          nombre.includes(textoLower) ||
          descripcion.includes(textoLower) ||
          precio.includes(textoLower) ||
          categoria.includes(textoLower)
        );
      });

      setProductosFiltrados(filtrados);
    }

    setPaginaActual(1);
  }, [textoBusqueda, productos]);

  useEffect(() => {
    cargarProductos();
  }, []);

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;

  const productosPaginados = productosFiltrados.slice(
    indicePrimerRegistro,
    indiceUltimoRegistro
  );

  return (
    <Container className="mt-5">
      <div className="product-header-card mb-4 p-4 shadow-sm rounded-4 bg-white border">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <span className="badge bg-primary bg-opacity-10 text-primary mb-2">
              <i className="bi bi-bag-fill me-2"></i>Productos
            </span>

            <h2 className="mb-1">Gestión de Productos</h2>

            <p className="text-muted mb-1">
              Registra, filtra y visualiza tus productos con su imagen y categoría.
            </p>

            <small className="text-secondary">
              {productosFiltrados.length}{" "}
              {productosFiltrados.length === 1 ? "producto" : "productos"}{" "}
              disponibles
            </small>
          </div>

          <Button
            variant="primary"
            className="px-4 py-2"
            onClick={() => setMostrarModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Producto
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre, descripción o precio..."
          />
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {textoBusqueda.trim() && productosFiltrados.length === 0 && (
            <Row className="mb-4">
              <Col>
                <Alert variant="info" className="text-center">
                  No se encontraron productos que coincidan con "{textoBusqueda}".
                </Alert>
              </Col>
            </Row>
          )}

          {productosFiltrados.length > 0 ? (
            <>
              <Row>
                <Col xs={12} className="d-none d-lg-block">
                  <div className="product-table-card mb-4 p-4 shadow-sm rounded-4 bg-white border">
                    <TablaProductos
                      productos={productosPaginados}
                      abrirModalEdicion={abrirModalEdicion}
                      abrirModalEliminacion={abrirModalEliminacion}
                    />
                  </div>
                </Col>

                <Col xs={12} className="d-block d-lg-none">
                  <div className="product-table-card mb-4 p-0">
                    <TarjetasProductos
                      productos={productosPaginados}
                      abrirModalEdicion={abrirModalEdicion}
                      abrirModalEliminacion={abrirModalEliminacion}
                    />
                  </div>
                </Col>
              </Row>

              <Paginacion
                registrosPorPagina={registrosPorPagina}
                totalRegistros={productosFiltrados.length}
                paginaActual={paginaActual}
                establecerPaginaActual={setPaginaActual}
                establecerRegistrosPorPagina={setRegistrosPorPagina}
              />
            </>
          ) : (
            <Row className="justify-content-center">
              <Col lg={8} className="text-center py-5">
                <div className="bg-light rounded-4 p-4">
                  <h5 className="mb-3">No hay productos registrados</h5>
                  <p className="text-muted mb-0">
                    Haz clic en "Nuevo Producto" para agregar productos.
                  </p>
                </div>
              </Col>
            </Row>
          )}
        </>
      )}

      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarProducto={agregarProducto}
      />

      <ModalEdicionProducto
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        productoEditar={productoEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoEdicion={manejoCambioArchivoEdicion}
        actualizarProducto={actualizarProducto}
      />

      <ModalEliminacionProducto
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarProducto={eliminarProducto}
        producto={productoEliminar}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() =>
          setToast({
            ...toast,
            mostrar: false,
          })
        }
      />
    </Container>
  );
};

export default Productos;