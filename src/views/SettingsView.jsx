import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Sun, Moon, Smartphone, Palette, Type, Bell, Volume2, VolumeX, Check } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

const PROFILE_COLORS = [
  { name: 'Rojo', value: '#dc3545' }, { name: 'Tomate', value: '#e74c3c' },
  { name: 'Naranja', value: '#f39c12' }, { name: 'Verde', value: '#27ae60' },
  { name: 'Azul', value: '#2980b9' }, { name: 'Púrpura', value: '#8e44ad' },
  { name: 'Rosa', value: '#e91e8c' }, { name: 'Gris', value: '#7f8c8d' },
  { name: 'Cyan', value: '#00bcd4' }, { name: 'Ámbar', value: '#ff6f00' },
];

const FONT_SIZES = [
  { label: 'Pequeño', value: '13px' }, { label: 'Normal', value: '16px' },
  { label: 'Grande', value: '18px' }, { label: 'Extra Grande', value: '21px' },
];

const THEMES = [
  { name: 'Claro', value: 'light', icon: <Sun size={20} /> },
  { name: 'Oscuro', value: 'dark', icon: <Moon size={20} /> },
  { name: 'Sistema', value: 'system', icon: <Smartphone size={20} /> },
];

const PROFILE_EMOJIS = ['', '🍕', '🔥', '⭐', '👑', '🎯', '💎', '🚀', '🎪', '🦊'];

const Section = ({ title, icon, children }) => (
  <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 24 }}>
    <Card.Body className="p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div style={{
          background: 'linear-gradient(135deg,#dc3545,#ff6b6b)', color: 'white',
          borderRadius: 14, width: 42, height: 42,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>{icon}</div>
        <h5 className="fw-bold mb-0">{title}</h5>
      </div>
      {children}
    </Card.Body>
  </Card>
);

const SettingsView = () => {
  const { profile } = useAuth();
  const {
    theme, setTheme,
    profileColor, setProfileColor,
    profileLetter, setProfileLetter,
    fontSize, setFontSize,
    notifPedidos, setNotifPedidos,
    notifPromos, setNotifPromos,
    sonido, setSonido,
  } = useSettings();

  const [saved, setSaved] = useState(false);
  const [customLetter, setCustomLetter] = useState(profileLetter && !PROFILE_EMOJIS.includes(profileLetter) ? profileLetter : '');

  const handleSaveLetter = (val) => {
    setProfileLetter(val);
    if (val !== '' && !PROFILE_EMOJIS.includes(val)) setCustomLetter(val);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const displayLetter = profileLetter || profile?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <Container className="py-5" style={{ maxWidth: 760 }}>
      <style>{`
        .theme-btn { border: 2.5px solid #dee2e6; border-radius: 16px; padding: 14px 22px; background: transparent; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: .82rem; font-weight: 600; color: inherit; min-width: 110px; transition: all .2s; }
        .theme-btn.active { border-color: #dc3545; background: rgba(220,53,69,.06); color: #dc3545; }
        .theme-btn:hover:not(.active) { border-color: #dc3545; }
        .color-dot { width: 42px; height: 42px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; transition: all .2s; position: relative; display:flex; align-items:center; justify-content:center; }
        .color-dot.sel { border-color: #1a1a2e; transform: scale(1.18); }
        .avatar-preview { width: 88px; height: 88px; border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; font-weight: 700; color: white; box-shadow: 0 8px 28px rgba(0,0,0,.18); transition: background .3s; flex-shrink: 0; }
        .font-btn { border: 2px solid #dee2e6; border-radius: 12px; padding: 10px 16px; background: transparent; cursor: pointer; transition: all .2s; font-weight: 600; color: inherit; }
        .font-btn.active { border-color: #dc3545; background: rgba(220,53,69,.06); color: #dc3545; }
        .emoji-btn { width: 42px; height: 42px; border: 2px solid #dee2e6; border-radius: 12px; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: all .2s; color: inherit; }
        .emoji-btn.active { border-color: #dc3545; background: rgba(220,53,69,.08); }
        .save-btn { background: linear-gradient(135deg,#dc3545,#c82333); border: none; border-radius: 50px; padding: 14px 44px; color: white; font-weight: 700; font-size: 1rem; transition: all .2s; box-shadow: 0 4px 16px rgba(220,53,69,.3); cursor: pointer; }
        .save-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(220,53,69,.4); }
        .toggle { transform: scale(1.2); accent-color: #dc3545; cursor: pointer; }
      `}</style>

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h2 className="fw-bold mb-1">⚙️ Configuración</h2>
        <p className="text-muted mb-0">Personaliza tu experiencia en PizzApp</p>
      </motion.div>

      {/* APARIENCIA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .05 }}>
        <Section title="Apariencia" icon={<Sun size={20} />}>
          <p className="text-muted small mb-3">Tema de la interfaz</p>
          <div className="d-flex gap-3 flex-wrap">
            {THEMES.map(th => (
              <button key={th.value} className={`theme-btn ${theme === th.value ? 'active' : ''}`} onClick={() => setTheme(th.value)}>
                {th.icon}{th.name}
              </button>
            ))}
          </div>
        </Section>
      </motion.div>

      {/* PERFIL */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}>
        <Section title="Avatar de Perfil" icon={<Palette size={20} />}>
          {/* Preview */}
          <div className="d-flex align-items-center gap-4 mb-4">
            <div className="avatar-preview" style={{ background: profileColor }}>
              {displayLetter}
            </div>
            <div>
              <p className="fw-bold mb-1">{profile?.name || 'Usuario'}</p>
              <p className="text-muted small mb-0">{profile?.email || ''}</p>
            </div>
          </div>

          {/* Color */}
          <p className="fw-semibold small mb-2">Color del fondo</p>
          <div className="d-flex gap-3 flex-wrap mb-4">
            {PROFILE_COLORS.map(c => (
              <div key={c.value} className={`color-dot ${profileColor === c.value ? 'sel' : ''}`} style={{ background: c.value }} onClick={() => setProfileColor(c.value)} title={c.name}>
                {profileColor === c.value && <Check size={16} color="white" />}
              </div>
            ))}
          </div>

          {/* Emoji / Letra */}
          <p className="fw-semibold small mb-2">Icono o letra del avatar</p>
          <div className="d-flex gap-2 flex-wrap mb-3">
            {PROFILE_EMOJIS.map((em, i) => (
              <button key={i} className={`emoji-btn ${profileLetter === em ? 'active' : ''}`} onClick={() => handleSaveLetter(em)} title={em === '' ? 'Letra automática' : em}>
                {em === '' ? (profile?.name?.charAt(0)?.toUpperCase() || 'U') : em}
              </button>
            ))}
          </div>
          <div className="d-flex align-items-center gap-2" style={{ maxWidth: 280 }}>
            <Form.Control
              placeholder="Escribe tu letra o símbolo..."
              value={customLetter}
              maxLength={2}
              onChange={e => setCustomLetter(e.target.value)}
              className="rounded-pill"
            />
            <Button variant="danger" className="rounded-pill px-3 fw-bold" onClick={() => handleSaveLetter(customLetter || '')}>
              Aplicar
            </Button>
          </div>
        </Section>
      </motion.div>

      {/* FUENTE */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}>
        <Section title="Tamaño de Texto" icon={<Type size={20} />}>
          <div className="d-flex gap-3 flex-wrap">
            {FONT_SIZES.map(f => (
              <button key={f.value} className={`font-btn ${fontSize === f.value ? 'active' : ''}`} style={{ fontSize: f.value }} onClick={() => setFontSize(f.value)}>
                Aa — {f.label}
              </button>
            ))}
          </div>
        </Section>
      </motion.div>

      {/* NOTIFICACIONES */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}>
        <Section title="Notificaciones" icon={<Bell size={20} />}>
          {[
            { label: 'Actualizaciones de pedidos', desc: 'Recibe alertas cuando tu pedido cambie de estado', state: notifPedidos, setter: setNotifPedidos },
            { label: 'Promociones y ofertas', desc: 'Entérate de descuentos especiales', state: notifPromos, setter: setNotifPromos },
          ].map(item => (
            <div key={item.label} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
              <div>
                <p className="fw-semibold mb-0 small">{item.label}</p>
                <small className="text-muted">{item.desc}</small>
              </div>
              <input type="checkbox" className="toggle" checked={item.state} onChange={e => item.setter(e.target.checked)} />
            </div>
          ))}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="fw-semibold mb-0 small">Sonido</p>
              <small className="text-muted">Reproducir sonido al recibir alertas</small>
            </div>
            <div className="d-flex align-items-center gap-2">
              {sonido ? <Volume2 size={18} color="#dc3545" /> : <VolumeX size={18} color="#aaa" />}
              <input type="checkbox" className="toggle" checked={sonido} onChange={e => setSonido(e.target.checked)} />
            </div>
          </div>
        </Section>
      </motion.div>

      {/* GUARDAR */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .25 }} className="text-center mt-2 pb-5">
        <button className="save-btn" onClick={handleSave}>
          {saved ? <><Check size={18} className="me-2" />¡Guardado!</> : 'Guardar cambios'}
        </button>
      </motion.div>
    </Container>
  );
};

export default SettingsView;
