import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pizza, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [recuerdame, setRecuerdame] = useState(false);

  const navigate = useNavigate();
  const { login, usuario: authUsuario } = useAuth();

  const iniciarSesion = async () => {
    setError(null);
    if (!usuario || !contrasena) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }

    setCargando(true);

    try {
      await login(usuario, contrasena);
      navigate('/');
    } catch (err) {
      console.error(err);
      const mensajeError = err?.message || err?.error?.message || 'Usuario o contraseña incorrectos';
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (authUsuario) {
      navigate('/');
    }
  }, [authUsuario, navigate]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      iniciarSesion();
    }
  };

  return (
    <div className="login-page">
      {/* Fondo decorativo */}
      <div className="login-bg">
        <div className="bg-gradient"></div>
        <div className="bg-image"></div>
      </div>
      
      {/* Contenido principal */}
      <div className="login-container">
        <motion.div 
          className="login-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="login-logo">
            <motion.div 
              className="logo-circle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Pizza size={40} color="#dc3545" />
            </motion.div>
            <h1 className="logo-title" style={{ fontFamily: "'Pacifico', cursive" }}>PizzApp</h1>
            <p className="logo-subtitle">Tu pizzería favorita</p>
          </div>

          {/* Header */}
          <div className="login-header">
            <h2>Bienvenido de vuelta</h2>
            <p>Ingresa tus credenciales para continuar</p>
          </div>

          {/* Formulario */}
          <div className="login-form">
            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span>⚠️ {error}</span>
              </motion.div>
            )}

            {/* Campo Email */}
            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Correo electrónico
              </label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="ejemplo@correo.com"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Contraseña
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={mostrarContrasena ? "text" : "password"}
                  className="form-input"
                  placeholder="Ingresa tu contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                >
                  {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Opciones */}
            <div className="login-options">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={recuerdame}
                  onChange={(e) => setRecuerdame(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="checkbox-text">Recordarme</span>
              </label>
              <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>

            {/* Botón de inicio */}
            <motion.button
              className="login-button"
              onClick={iniciarSesion}
              disabled={cargando}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {cargando ? (
                <>
                  <span className="spinner"></span>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            {/* Enlace a registro */}
            <div className="register-link">
              <p>
                ¿No tienes una cuenta? 
                <a onClick={() => navigate('/register')}>
                  Registrarse <UserPlus size={14} />
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        /* Reset y estilos base */
        .login-page {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Fondo */
        .login-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }

        .bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #96281b 0%, #c0392b 40%, #e74c3c 70%, #ff6b35 100%);
        }

        .bg-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format');
          background-size: cover;
          background-position: center;
          opacity: 0.22;
        }

        /* Contenido */
        .login-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        /* Tarjeta de login */
        .login-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border-radius: 32px;
          padding: 48px 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Logo */
        .login-logo {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-circle {
          background: linear-gradient(135deg, #fff5f5, #ffffff);
          width: 80px;
          height: 80px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 10px 25px -5px rgba(220, 53, 69, 0.2);
        }

        .logo-title {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #dc3545, #ff6b6b);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin: 0;
        }

        .logo-subtitle {
          font-size: 14px;
          color: #6c757d;
          margin: 4px 0 0;
        }

        /* Header */
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 8px;
        }

        .login-header p {
          font-size: 14px;
          color: #6c757d;
          margin: 0;
        }

        /* Formulario */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #495057;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: #adb5bd;
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 1px solid #e9ecef;
          border-radius: 16px;
          font-size: 15px;
          transition: all 0.2s;
          background: white;
          color: #212529;
        }

        .form-input:focus {
          outline: none;
          border-color: #dc3545;
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        }

        .form-input::placeholder {
          color: #adb5bd;
        }

        /* Botón mostrar/ocultar contraseña */
        .password-toggle {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          color: #adb5bd;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #dc3545;
        }

        /* Opciones */
        .login-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        /* Checkbox personalizado */
        .checkbox-container {
          display: flex;
          align-items: center;
          position: relative;
          padding-left: 28px;
          cursor: pointer;
          font-size: 14px;
          color: #6c757d;
          user-select: none;
        }

        .checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark {
          position: absolute;
          top: 0;
          left: 0;
          height: 18px;
          width: 18px;
          background-color: white;
          border: 2px solid #dee2e6;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .checkbox-container:hover input ~ .checkmark {
          border-color: #dc3545;
        }

        .checkbox-container input:checked ~ .checkmark {
          background-color: #dc3545;
          border-color: #dc3545;
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }

        .checkbox-container input:checked ~ .checkmark:after {
          display: block;
        }

        .checkbox-container .checkmark:after {
          left: 5px;
          top: 1px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .checkbox-text {
          margin-left: 4px;
        }

        .forgot-link {
          color: #dc3545;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        /* Mensaje de error */
        .error-message {
          background: #fff5f5;
          border-left: 4px solid #dc3545;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          color: #dc3545;
        }

        /* Botón de inicio */
        .login-button {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          border: none;
          border-radius: 60px;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Spinner de carga */
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Enlace de registro */
        .register-link {
          text-align: center;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
        }

        .register-link p {
          font-size: 14px;
          color: #6c757d;
          margin: 0;
        }

        .register-link a {
          color: #dc3545;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-left: 4px;
          cursor: pointer;
        }

        .register-link a:hover {
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 576px) {
          .login-card {
            padding: 32px 24px;
          }
          
          .logo-circle {
            width: 60px;
            height: 60px;
          }
          
          .logo-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;