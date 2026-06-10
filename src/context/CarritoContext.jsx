import React, { createContext, useContext, useState, useEffect } from 'react';

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrecio, setTotalPrecio] = useState(0);
  const [costoEnvio, setCostoEnvio] = useState(0);

  // Obtener ID del usuario actual
  const getCurrentUserId = () => {
    const usuarioGuardado = localStorage.getItem('usuario-supabase');
    if (usuarioGuardado && usuarioGuardado !== 'null') return usuarioGuardado;
    
    const session = localStorage.getItem('supabase.auth.token');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        const email = parsed?.currentSession?.user?.email || parsed?.user?.email;
        if (email) return email;
      } catch (e) {}
    }
    return 'invitado';
  };

  // Cargar carrito al iniciar
  useEffect(() => {
    const userId = getCurrentUserId();
    const carritoGuardado = localStorage.getItem(`carrito_${userId}`);
    if (carritoGuardado) {
      try {
        const items = JSON.parse(carritoGuardado);
        console.log(`📦 Carrito cargado para ${userId}:`, items);
        setCarrito(items);
        actualizarTotales(items);
      } catch (e) {
        console.error("Error cargando carrito:", e);
      }
    }
  }, []);

  // Guardar carrito cuando cambie
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId && carrito.length >= 0) {
      localStorage.setItem(`carrito_${userId}`, JSON.stringify(carrito));
      actualizarTotales(carrito);
      console.log(`💾 Carrito guardado para ${userId}:`, carrito.length, "items");
    }
  }, [carrito]);

  const actualizarTotales = (items) => {
    const itemsCount = items.reduce((acc, item) => acc + (item.cantidad || 0), 0);
    const precioTotal = items.reduce((acc, item) => acc + ((item.precio || 0) * (item.cantidad || 0)), 0);
    const tieneEnvio = items.some(item => item.tipoEntrega === "envio");
    setTotalItems(itemsCount);
    setTotalPrecio(precioTotal);
    setCostoEnvio(tieneEnvio ? 30 : 0);
  };

  const agregarAlCarrito = (producto) => {
    if (!producto || !producto.id) {
      console.error("Producto inválido:", producto);
      return;
    }

    console.log("🛒 Agregando al carrito:", producto);
    console.log("🆔 ID del producto:", producto.id, "Tipo:", typeof producto.id);

    setCarrito(prev => {
      const productoId = String(producto.id);
      const itemKey = `${productoId}-${producto.tamanio || 'default'}-${producto.tipoEntrega || 'retiro'}`;
      const existe = prev.find(item => item.cartItemId === itemKey);

      if (existe) {
        return prev.map(item =>
          item.cartItemId === itemKey
            ? { ...item, cantidad: (item.cantidad || 0) + (producto.cantidad || 1) }
            : item
        );
      }

      const nuevoItem = {
        ...producto,
        id: productoId,
        cantidad: producto.cantidad || 1,
        cartItemId: itemKey,
        fechaAgregado: new Date().toISOString()
      };
      
      console.log("✅ Nuevo item agregado:", nuevoItem);
      return [...prev, nuevoItem];
    });
  };

  const eliminarDelCarrito = (itemKey) => {
    setCarrito(prev => prev.filter(item => item.cartItemId !== itemKey));
  };

  const actualizarCantidad = (itemKey, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(itemKey);
      return;
    }
    setCarrito(prev =>
      prev.map(item =>
        item.cartItemId === itemKey ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  };

  const vaciarCarrito = () => setCarrito([]);

  return (
    <CarritoContext.Provider value={{
      carrito,
      totalItems,
      totalPrecio,
      costoEnvio,
      totalConEnvio: totalPrecio + costoEnvio,
      agregarAlCarrito,
      eliminarDelCarrito,
      actualizarCantidad,
      vaciarCarrito
    }}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return context;
};