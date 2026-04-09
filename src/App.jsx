import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Inicio from "./views/Inicio";
import Login from "./views/Login";
import Registro from "./views/Registro";
import Productos from "./views/Productos";
import Carrito from "./views/Carrito";
import Pedidos from "./views/Pedidos";
import RutaProtegida from "./rutas/RutaProtegida";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Ruta Pública: Login */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas Protegidas: Solo accesibles si hay sesión */}
          <Route
            path="/"
            element={
              <RutaProtegida>
                <Inicio />
              </RutaProtegida>
            }
          />
          <Route
            path="/productos"
            element={
              <RutaProtegida>
                <Productos />
              </RutaProtegida>
            }
          />
          <Route
            path="/carrito"
            element={
              <RutaProtegida>
                <Carrito />
              </RutaProtegida>
            }
          />
          <Route
            path="/pedidos"
            element={
              <RutaProtegida>
                <Pedidos />
              </RutaProtegida>
            }
          />
          
          {/* Puedes envolver más rutas aquí igual que Inicio */}
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;