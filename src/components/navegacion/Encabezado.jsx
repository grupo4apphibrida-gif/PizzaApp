import React from "react";
import { useCarrito } from "../../context/CarritoContext";
import { Pizza, ShoppingCart, ClipboardList, Box, Users, Tag, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Encabezado = () => {
  const { totalItems } = useCarrito();
  const navigate = useNavigate();

  const menuItems = [
    { nombre: "Menú", ruta: "/", icono: <Pizza size={18} /> },
    { nombre: "Carrito", ruta: "/cliente/carrito", icono: <ShoppingCart size={18} /> },
    { nombre: "Mis Pedidos", ruta: "/cliente/mis-pedidos", icono: <ClipboardList size={18} /> },
    { nombre: "Reportes", ruta: "/admin/reportes", icono: <BarChart3 size={18} /> },
    { nombre: "Productos", ruta: "/admin/productos", icono: <Box size={18} /> },
    { nombre: "Usuarios", ruta: "/admin/usuarios", icono: <Users size={18} /> },
    { nombre: "Ingredientes", ruta: "/admin/ingredientes", icono: <Tag size={18} /> },
    { nombre: "Promociones", ruta: "/admin/promociones", icono: <Tag size={18} /> },
    { nombre: "Pedidos", ruta: "/admin/pedidos", icono: <ClipboardList size={18} /> },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-pizza sticky-top shadow-sm py-3 px-4 mb-4 rounded-4 mx-3 mt-3">
      <div className="container-fluid">
        <motion.a 
          whileHover={{ scale: 1.05 }}
          className="navbar-brand fw-black text-pizza-red fs-3 d-flex align-items-center gap-2" 
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          <Pizza size={32} /> PizzApp
        </motion.a>
        
        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Menú cliente */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-bold">
            {menuItems.map((item, idx) => (
              <li key={idx} className="nav-item px-2">
                <a 
                  className="nav-link d-flex align-items-center gap-2" 
                  href={item.ruta}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.ruta);
                  }}
                >
                  {item.icono} {item.nombre}
                </a>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Botón del carrito */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="btn btn-outline-danger rounded-circle p-2 position-relative"
              onClick={() => navigate('/cliente/carrito')}
              title="Carrito"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span 
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '0.7rem' }}
                >
                  {totalItems}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Encabezado;