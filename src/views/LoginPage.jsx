import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../database/supabaseconfig';
import { Pizza, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [recuerdame, setRecuerdame] = useState(false);
  const [mostrarResetPassword, setMostrarResetPassword] = useState(false);
  const [emailReset, setEmailReset] = useState('');
  const [resetCargando, setResetCargando] = useState(false);
  const [resetMensaje, setResetMensaje] = useState('');

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

  const manejarResetPassword = async () => {
    if (!emailReset.trim()) {
      setResetMensaje('❌ Por favor ingresa un correo electrónico');
      return;
    }

    setResetCargando(true);
    setResetMensaje('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailReset, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setResetMensaje('❌ Error: ' + error.message);
      } else {
        setResetMensaje('✅ Revisa tu correo para instrucciones de reset');
        setTimeout(() => {
          setMostrarResetPassword(false);
          setEmailReset('');
          setResetMensaje('');
        }, 3000);
      }
    } catch (err) {
      setResetMensaje('❌ Error: No se pudo enviar el correo');
      console.error(err);
    } finally {
      setResetCargando(false);
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
              <button 
                type="button"
                onClick={() => setMostrarResetPassword(true)}
                className="forgot-link"
              >
                ¿Olvidaste tu contraseña?
              </button>
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

          {/* Modal Reset Password */}
          {mostrarResetPassword && (
            <motion.div 
              className="reset-password-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="reset-password-content">
                <h3>Recuperar Contraseña</h3>
                <p>Ingresa tu correo y te enviaremos instrucciones para reset</p>
                
                <input
                  type="email"
                  className="form-input reset-input"
                  placeholder="tu-email@ejemplo.com"
                  value={emailReset}
                  onChange={(e) => setEmailReset(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && manejarResetPassword()}
                />

                {resetMensaje && (
                  <div className={`reset-mensaje ${resetMensaje.includes('✅') ? 'success' : 'error'}`}>
                    {resetMensaje}
                  </div>
                )}

                <div className="reset-buttons">
                  <button
                    onClick={manejarResetPassword}
                    disabled={resetCargando}
                    className="reset-send-btn"
                  >
                    {resetCargando ? 'Enviando...' : 'Enviar Instrucciones'}
                  </button>
                  <button
                    onClick={() => {
                      setMostrarResetPassword(false);
                      setEmailReset('');
                      setResetMensaje('');
                    }}
                    className="reset-cancel-btn"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
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

        /* Reset Password Modal */
        .reset-password-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .reset-password-content {
          background: white;
          border-radius: 20px;
          padding: 32px 28px;
          max-width: 420px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .reset-password-content h3 {
          font-size: 22px;
          font-weight: 700;
          color: #212529;
          margin: 0 0 8px 0;
        }

        .reset-password-content p {
          font-size: 14px;
          color: #6c757d;
          margin: 0 0 20px 0;
        }

        .reset-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #e9ecef;
          border-radius: 16px;
          font-size: 15px;
          margin-bottom: 16px;
          background: white;
          color: #212529;
          transition: all 0.2s;
        }

        .reset-input:focus {
          outline: none;
          border-color: #dc3545;
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        }

        .reset-mensaje {
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          font-size: 14px;
          text-align: center;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .reset-mensaje.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .reset-mensaje.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .reset-buttons {
          display: flex;
          gap: 12px;
        }

        .reset-send-btn,
        .reset-cancel-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-send-btn {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
        }

        .reset-send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(220, 53, 69, 0.3);
        }

        .reset-send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .reset-cancel-btn {
          background: #e9ecef;
          color: #495057;
        }

        .reset-cancel-btn:hover {
          background: #dee2e6;
        }

        /* Forgot link button style */
        .forgot-link {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;