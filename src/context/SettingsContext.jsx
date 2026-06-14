import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SettingsContext = createContext();

const LS_KEY = (userId) => `pizzapp_cfg_${userId || 'guest'}`;

const DEFAULTS = {
  theme: 'light',
  profileColor: '#dc3545',
  profileLetter: '',
  fontSize: '16px',
  notifPedidos: true,
  notifPromos: true,
  sonido: true,
};

const loadCfg = (userId) => {
  try {
    const raw = localStorage.getItem(LS_KEY(userId));
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch { return { ...DEFAULTS }; }
};

const saveCfg = (userId, cfg) => {
  try { localStorage.setItem(LS_KEY(userId), JSON.stringify(cfg)); } catch {}
};

const applyTheme = (val) => {
  const dark = val === 'dark' || (val === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
  const body = document.body;
  if (dark) {
    body.style.background = '#0d0d0d';
    body.style.color = '#e0e0e0';
  } else {
    body.style.background = '';
    body.style.color = '';
  }
};

const applyFont = (val) => {
  document.documentElement.style.fontSize = val;
};

export const SettingsProvider = ({ children, userId }) => {
  const [cfg, setCfgState] = useState(() => loadCfg(userId));
  const [notifications, setNotifications] = useState([]);

  // Re-cargar configuración cuando cambia el usuario
  useEffect(() => {
    const loaded = loadCfg(userId);
    setCfgState(loaded);
    applyTheme(loaded.theme);
    applyFont(loaded.fontSize);
  }, [userId]);

  useEffect(() => { applyTheme(cfg.theme); }, [cfg.theme]);
  useEffect(() => { applyFont(cfg.fontSize); }, [cfg.fontSize]);

  const update = useCallback((key, val) => {
    setCfgState(prev => {
      const next = { ...prev, [key]: val };
      saveCfg(userId, next);
      return next;
    });
  }, [userId]);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [{ id: Date.now(), ...notif, read: false }, ...prev].slice(0, 20));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return (
    <SettingsContext.Provider value={{
      theme: cfg.theme, setTheme: (v) => update('theme', v),
      profileColor: cfg.profileColor, setProfileColor: (v) => update('profileColor', v),
      profileLetter: cfg.profileLetter, setProfileLetter: (v) => update('profileLetter', v),
      fontSize: cfg.fontSize, setFontSize: (v) => update('fontSize', v),
      notifPedidos: cfg.notifPedidos, setNotifPedidos: (v) => update('notifPedidos', v),
      notifPromos: cfg.notifPromos, setNotifPromos: (v) => update('notifPromos', v),
      sonido: cfg.sonido, setSonido: (v) => update('sonido', v),
      notifications, addNotification, markAllRead, clearNotifications,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings fuera de SettingsProvider');
  return ctx;
};
