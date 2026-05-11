import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const FormularioLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card premium-card p-4 p-md-5">
      <div className="text-center mb-4">
        <h1 className="h3 mb-3 fw-bold text-pizza-red">PizzApp</h1>
        <p className="text-muted">Inicia sesión para disfrutar de la mejor pizza</p>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            className="form-control"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-pizza-primary w-100 py-2 mb-3"
          disabled={loading}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="text-center">
        <p className="mb-0">¿No tienes una cuenta? <Link to="/register" className="text-pizza-red fw-bold text-decoration-none">Regístrate</Link></p>
      </div>
    </div>
  );
};

export default FormularioLogin;
