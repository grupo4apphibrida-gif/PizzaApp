import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pizza, User, Mail, Lock, Eye, EyeOff, ArrowRight, UserCheck, Phone, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  
  const { registrarCliente, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!name || !email || !password) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);

    try {
      // Usar la función de registro de cliente
      if (registrarCliente) {
        await registrarCliente(email, password, name, lastName, phone);
      } else {
        await signUp(email, password, name, 'cliente');
      }
      
      setSuccess('✅ ¡Registro exitoso! Revisa tu correo para verificar la cuenta.');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al registrarse. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      {/* Fondo decorativo */}
      <div className="register-background">
        <div className="bg-gradient"></div>
        <div className="bg-image"></div>
      </div>
      
      {/* Contenido principal */}
      <div className="register-content">
        <motion.div 
          className="register-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="register-logo">
            <motion.div 
              className="logo-circle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Pizza size={40} color="#dc3545" />
            </motion.div>
            <h1 className="logo-title">PizzApp</h1>
            <p className="logo-subtitle">Crea tu cuenta</p>
          </div>

          {/* Header */}
          <div className="register-header">
            <h2>Bienvenido a PizzApp</h2>
            <p>Regístrate para disfrutar de nuestras deliciosas pizzas</p>
          </div>

          {/* Formulario */}
          <form className="register-form" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span>⚠️ {error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                className="success-message"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <CheckCircle size={18} />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Nombre y Apellido */}
            <div className="row-fields">
              <div className="form-group half">
                <label className="form-label">
                  <User size={16} />
                  Nombre *
                </label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Juan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group half">
                <label className="form-label">
                  <User size={16} />
                  Apellido
                </label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Pérez"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Correo electrónico *
              </label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="form-group">
              <label className="form-label">
                <Phone size={16} />
                Teléfono
              </label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+505 8888 1111"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="row-fields">
              <div className="form-group half">
                <label className="form-label">
                  <Lock size={16} />
                  Contraseña *
                </label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                  >
                    {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group half">
                <label className="form-label">
                  <Lock size={16} />
                  Confirmar contraseña *
                </label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={mostrarConfirmPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                  >
                    {mostrarConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Términos y condiciones */}
            <div className="terms-checkbox">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="checkbox-text">
                  Acepto los <a href="#">términos y condiciones</a> y la <a href="#">política de privacidad</a>
                </span>
              </label>
            </div>

            {/* Botón de registro */}
            <motion.button
              type="submit"
              className="register-button"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta
                  <UserCheck size={18} />
                </>
              )}
            </motion.button>

            {/* Enlace a login */}
            <div className="login-link">
              <p>
                ¿Ya tienes una cuenta? 
                <Link to="/login">
                  Inicia Sesión <ArrowRight size={14} />
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      <style>{`
        /* Reset y estilos base */
        .register-page-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow-y: auto;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Fondo */
        .register-background {
          position: fixed;
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          opacity: 0.1;
        }

        /* Contenido */
        .register-content {
          position: relative;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
        }

        /* Tarjeta de registro */
        .register-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border-radius: 32px;
          padding: 48px 40px;
          width: 100%;
          max-width: 580px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Logo */
        .register-logo {
          text-align: center;
          margin-bottom: 28px;
        }

        .logo-circle {
          background: linear-gradient(135deg, #fff5f5, #ffffff);
          width: 70px;
          height: 70px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          box-shadow: 0 10px 25px -5px rgba(220, 53, 69, 0.2);
        }

        .logo-title {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #dc3545, #ff6b6b);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin: 0;
        }

        .logo-subtitle {
          font-size: 13px;
          color: #6c757d;
          margin: 4px 0 0;
        }

        /* Header */
        .register-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .register-header h2 {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 6px;
        }

        .register-header p {
          font-size: 13px;
          color: #6c757d;
          margin: 0;
        }

        /* Formulario */
        .register-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .row-fields {
          display: flex;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .form-group.half {
          flex: 1;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
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
          left: 14px;
          color: #adb5bd;
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border: 1px solid #e9ecef;
          border-radius: 14px;
          font-size: 14px;
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
          right: 14px;
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

        /* Términos y condiciones */
        .terms-checkbox {
          margin: 4px 0;
        }

        /* Checkbox personalizado */
        .checkbox-container {
          display: flex;
          align-items: flex-start;
          position: relative;
          padding-left: 28px;
          cursor: pointer;
          font-size: 12px;
          color: #6c757d;
          user-select: none;
          gap: 8px;
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
          line-height: 1.4;
        }

        .checkbox-text a {
          color: #dc3545;
          text-decoration: none;
        }

        .checkbox-text a:hover {
          text-decoration: underline;
        }

        /* Mensajes */
        .error-message {
          background: #fff5f5;
          border-left: 4px solid #dc3545;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          color: #dc3545;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .success-message {
          background: #e8f5e9;
          border-left: 4px solid #28a745;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          color: #28a745;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Botón de registro */
        .register-button {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          border: none;
          border-radius: 60px;
          padding: 12px 24px;
          font-size: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .register-button:disabled {
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

        /* Enlace a login */
        .login-link {
          text-align: center;
          padding-top: 14px;
          border-top: 1px solid #e9ecef;
        }

        .login-link p {
          font-size: 13px;
          color: #6c757d;
          margin: 0;
        }

        .login-link a {
          color: #dc3545;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-left: 4px;
        }

        .login-link a:hover {
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 576px) {
          .register-card {
            padding: 28px 20px;
          }
          
          .row-fields {
            flex-direction: column;
            gap: 12px;
          }
          
          .logo-circle {
            width: 55px;
            height: 55px;
          }
          
          .logo-title {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;