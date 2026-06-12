import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../database/supabaseconfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [permisos, setPermisos] = useState({});
  const [cargando, setCargando] = useState(true);
  const [profile, setProfile] = useState(null);

  const cargarPermisos = async (rol) => {
    if (!rol) return;
    try {
      let { data, error } = await supabase.from('permisos').select('permisos').eq('rol', rol).single();
      if (error && (rol === 'admin' || rol === 'administrador')) {
        const rolAlt = rol === 'admin' ? 'administrador' : 'admin';
        const { data: dataAlt } = await supabase.from('permisos').select('permisos').eq('rol', rolAlt).single();
        if (dataAlt) data = dataAlt;
      }
      if (rol === 'cliente' && (error || !data)) {
        setPermisos({ ver_inicio: true, ver_catalogo: true, ver_pedidos: true, ver_carrito: true, crear_pedidos: true });
        return;
      }
      setPermisos(data?.permisos || {});
    } catch (err) { console.error(err); setPermisos({}); }
  };

  const obtenerOCrearCliente = async (email, nombre = "") => {
    try {
      const { data: existente } = await supabase.from('clientes').select('*').eq('email', email).single();
      if (existente) return existente;
      
      const nuevoCliente = { email, nombre_cliente: nombre || email.split('@')[0], apellido_cliente: "", celular: "", creado_en: new Date().toISOString() };
      const { data: creado } = await supabase.from('clientes').insert([nuevoCliente]).select().single();
      return creado;
    } catch (err) { console.error(err); return null; }
  };

  const login = async (email, password) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (authError) {
        const { data: empleado } = await supabase.from('empleados').select('tipo_empleado, pin, nombre_empleado, apellido_empleado').eq('email', email).single();
        if (empleado && empleado.pin === password) {
          localStorage.setItem('usuario-supabase', email);
          setUsuario({ email, rol: empleado.tipo_empleado });
          setProfile({ name: `${empleado.nombre_empleado} ${empleado.apellido_empleado}`, email, role: empleado.tipo_empleado });
          await cargarPermisos(empleado.tipo_empleado);
          window.dispatchEvent(new Event('storage'));
          return { success: true };
        }
        throw authError;
      }

      const userEmail = authData.user.email;
      const { data: empleado } = await supabase.from('empleados').select('tipo_empleado, nombre_empleado, apellido_empleado').eq('email', userEmail).single();
      
      if (empleado) {
        localStorage.setItem("usuario-supabase", userEmail);
        setUsuario({ id: authData.user.id, email: userEmail, rol: empleado.tipo_empleado });
        setProfile({ name: `${empleado.nombre_empleado} ${empleado.apellido_empleado}`, email: userEmail, role: empleado.tipo_empleado });
        await cargarPermisos(empleado.tipo_empleado);
      } else {
        const cliente = await obtenerOCrearCliente(userEmail);
        localStorage.setItem("usuario-supabase", userEmail);
        setUsuario({ id: cliente?.id_cliente, email: userEmail, rol: "cliente" });
        setProfile({ name: cliente?.nombre_cliente, email: userEmail, role: "cliente" });
        await cargarPermisos("cliente");
      }
      
      window.dispatchEvent(new Event('storage'));
      return { success: true };
    } catch (error) { throw error; }
  };

  const signUp = async (email, password, nombre = '', rol = 'cliente') => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // Crear registro de cliente si corresponde (registro adicional en tabla clientes)
      if (rol === 'cliente') {
        try {
          const nombreCliente = nombre || email.split('@')[0];
          await supabase.from('clientes').insert([{ email, nombre_cliente: nombreCliente, apellido_cliente: '', celular: '', creado_en: new Date().toISOString() }]);
        } catch (err) {
          // No detener el flujo si la inserción secundaria falla
          console.error('Error creando cliente después de signup:', err);
        }
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("usuario-supabase");
    setUsuario(null);
    setProfile(null);
    setPermisos({});
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    const cargarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email;
        const { data: empleado } = await supabase.from('empleados').select('tipo_empleado, nombre_empleado, apellido_empleado').eq('email', email).single();
        if (empleado) {
          setUsuario({ id: session.user.id, email, rol: empleado.tipo_empleado });
          setProfile({ name: `${empleado.nombre_empleado} ${empleado.apellido_empleado}`, email, role: empleado.tipo_empleado });
          await cargarPermisos(empleado.tipo_empleado);
        } else {
          const cliente = await obtenerOCrearCliente(email);
          setUsuario({ id: cliente?.id_cliente, email, rol: "cliente" });
          setProfile({ name: cliente?.nombre_cliente, email, role: "cliente" });
          await cargarPermisos("cliente");
        }
      }
      setCargando(false);
    };
    cargarSesion();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, user: usuario, profile, permisos, tienePermiso: (p) => !!permisos[p], login, logout, signUp, signOut: logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};