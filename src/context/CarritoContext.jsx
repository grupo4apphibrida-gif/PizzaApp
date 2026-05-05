import React, { createContext, useContext, useState, useEffect } from "react";

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrecio, setTotalPrecio] = useState(0);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carritoPizzApp");
    if (carritoGuardado) {
      const items = JSON.parse(carritoGuardado);
      setCarrito(items);
      actualizarTotales(items);
    }
  }, []);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("carritoPizzApp", JSON.stringify(carrito));
    actualizarTotales(carrito);
  }, [carrito]);

  const actualizarTotales = (items) => {
    const itemsCount = items.reduce((acc, item) => acc + item.cantidad, 0);
    const precioTotal = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    setTotalItems(itemsCount);
    setTotalPrecio(precioTotal);
  };

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      // Crear ID único incluyendo tamaño si existe
      const itemKey = producto.tamanio 
        ? `${producto.id}-${producto.tamanio}` 
        : producto.id;
      
      const existe = prev.find(item => {
        const existeKey = item.tamanio 
          ? `${item.id}-${item.tamanio}` 
          : item.id;
        return existeKey === itemKey;
      });
      
      if (existe) {
        return prev.map(item => {
          const itemKey = item.tamanio 
            ? `${item.id}-${item.tamanio}` 
            : item.id;
          const productoKey = producto.tamanio 
            ? `${producto.id}-${producto.tamanio}` 
            : producto.id;
          return itemKey === productoKey
            ? { ...item, cantidad: item.cantidad + 1 }
            : item;
        });
      }
      return [...prev, { ...producto, cantidad: 1, cartItemId: itemKey }];
    });
  };

  const eliminarDelCarrito = (itemKey) => {
    setCarrito(prev => prev.filter(item => {
      const key = item.cartItemId || item.id;
      return key !== itemKey;
    }));
  };

  const actualizarCantidad = (itemKey, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(itemKey);
      return;
    }
    setCarrito(prev =>
      prev.map(item => {
        const key = item.cartItemId || item.id;
        return key === itemKey ? { ...item, cantidad: nuevaCantidad } : item;
      })
    );
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  return (
    <CarritoContext.Provider value={{
      carrito,
      totalItems,
      totalPrecio,
      agregarAlCarrito,
      eliminarDelCarrito,
      actualizarCantidad,
      vaciarCarrito
    }}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => useContext(CarritoContext);