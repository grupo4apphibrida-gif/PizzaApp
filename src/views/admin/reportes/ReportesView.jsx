import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { Package, Users, ShoppingBag, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#d32f2f', '#ffc107', '#4caf50', '#2196f3', '#9c27b0'];

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="col-12 col-md-6 col-lg-3"
  >
    <div className="card premium-card border-0 p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className={`p-3 rounded-4 bg-opacity-10 bg-${color} text-${color}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`badge rounded-pill bg-success bg-opacity-10 text-success fw-bold`}>
            +{trend}%
          </span>
        )}
      </div>
      <h3 className="fw-black mb-1">{value}</h3>
      <p className="text-muted small mb-0 text-uppercase tracking-wider fw-bold">{title}</p>
    </div>
  </motion.div>
);

const ReportesView = ({ salesStats, topProducts, totalSales, products, inventory, users }) => {
  return (
    <motion.div 
      key="reportes"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="row g-4"
    >
      <StatCard title="Ventas Totales" value={`C$${totalSales.toLocaleString()}`} icon={DollarSign} color="danger" trend="12" />
      <StatCard title="Productos" value={products.length} icon={ShoppingBag} color="warning" />
      <StatCard title="Stock Bajo" value={inventory.filter(i => i.stock <= i.stock_minimo).length} icon={AlertTriangle} color="danger" />
      <StatCard title="Clientes" value={users.filter(u => u.rol === 'cliente').length} icon={Users} color="primary" />

      <div className="col-12 col-lg-8">
        <div className="card premium-card border-0 p-4 h-100">
          <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <TrendingUp size={20} className="text-pizza-red" />
            Tendencia de Ventas (Últimos 7 días)
          </h5>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={salesStats}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d32f2f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="total" stroke="#d32f2f" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-4">
        <div className="card premium-card border-0 p-4 h-100">
          <h5 className="fw-bold mb-4">Productos más Vendidos</h5>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="small fw-bold">{p.name}</span>
                </div>
                <span className="badge bg-light text-dark rounded-pill">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportesView;
