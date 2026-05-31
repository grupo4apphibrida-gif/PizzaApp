import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../database/supabaseconfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [permisos, setPermisos] = useState({});
  const [cargando, setCargando] = useState(true);

  const cargarPermisos = async (rol) => {
    if (!rol) return;

    try {
      // Intentar primero con el rol exacto
      let { data, error } = await supabase
        .from('permisos')
        .select('permisos')
        .eq('rol', rol)
        .single();

      // Si no encuentra, intentar con variantes (admin <-> administrador)
      if (error) {
        const rolAlternativo = rol === 'admin' ? 'administrador' : 'admin';
        const { data: dataAlt, error: errorAlt } = await supabase
          .from('permisos')
          .select('permisos')
          .eq('rol', rolAlternativo)
          .single();
        
        if (!errorAlt && dataAlt) {
          data = dataAlt;
          error = null;
        }
      }

      console.log("Permisos cargados para rol:", rol, data, error);

      if (error) {
        console.error("Error al cargar permisos:", error);
        // Si no hay permisos, asumir permisos vacíos
        setPermisos({});
        return;
      }

      setPermisos(data?.permisos || {});
    } catch (err) {
      console.error("Exception en cargarPermisos:", err);
      setPermisos({});
    }
  };

  const login = async (email, password) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      const msg = authError?.message || authError?.error_description || '';
      if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('not confirmed')) {
        throw new Error('Por favor confirma tu correo electrónico. Revisa tu bandeja de entrada.');
      }

      // Fallback: permitir iniciar sesión con PIN desde la tabla empleados
      const { data: empleado, error: empError } = await supabase
        .from('empleados')
        .select('tipo_empleado, pin')
        .eq('email', email)
        .single();

      if (!empError && empleado && empleado.pin === password) {
        localStorage.setItem('usuario-supabase', email);
        setUsuario({ id: null, email, rol: empleado.tipo_empleado });
        await cargarPermisos(empleado.tipo_empleado);
        return { fallback: true, empleado };
      }

      throw authError;
    }

    const { data: empleado, error: empError } = await supabase
      .from('empleados')
      .select('tipo_empleado')
      .eq('email', email)
      .single();

    if (empError || !empleado) {
      console.error("Error obteniendo empleado:", empError);
      throw new Error("No se encontró información del empleado");
    }

    const userId = authData?.user?.id || null;
    localStorage.setItem("usuario-supabase", email);
    
    setUsuario({
      id: userId,
      email,
      rol: empleado.tipo_empleado
    });

    await cargarPermisos(empleado.tipo_empleado);
    return authData;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("usuario-supabase");
    setUsuario(null);
    setPermisos({});
  };

  const profile = usuario
    ? {
        id: usuario.id,
        name: usuario.email,
        role: usuario.rol,
      }
    : null;

  const signOut = logout;

  useEffect(() => {
    const cargarSesionInicial = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (session?.user?.email) {
          const email = session.user.email;
          const userId = session.user.id;

          const { data: empleado, error } = await supabase
            .from('empleados')
            .select('tipo_empleado')
            .eq('email', email)
            .single();

          if (empleado && !error) {
            setUsuario({
              id: userId,
              email,
              rol: empleado.tipo_empleado,
            });
            await cargarPermisos(empleado.tipo_empleado);
          }
        } else {
          const usuarioGuardado = localStorage.getItem("usuario-supabase");
          if (usuarioGuardado) {
            const { data: empleado, error } = await supabase
              .from('empleados')
              .select('tipo_empleado')
              .eq('email', usuarioGuardado)
              .single();

            if (empleado && !error) {
              setUsuario({
                id: null,
                email: usuarioGuardado,
                rol: empleado.tipo_empleado,
              });
              await cargarPermisos(empleado.tipo_empleado);
            } else {
              localStorage.removeItem("usuario-supabase");
            }
          }
        }
      } catch (err) {
        console.error("Error al recuperar sesión:", err);
        localStorage.removeItem("usuario-supabase");
      } finally {
        setCargando(false);
      }
    };

    cargarSesionInicial();
  }, []);

  const tienePermiso = (permiso) => !!permisos[permiso];

  return (
    <AuthContext.Provider value={{
      usuario,
      user: usuario,
      profile,
      permisos,
      tienePermiso,
      login,
      logout,
      signOut,
      cargando
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};