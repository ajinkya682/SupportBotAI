import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, Clock, CreditCard, Save, TrendingUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../../../shared/services/config';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editPlan, setEditPlan] = useState('free');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [subsRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/super-admin/subscriptions`, config),
        axios.get(`${API_URL}/api/super-admin/settings`, config)
      ]);

      if (subsRes.data.success) setSubscriptions(subsRes.data.subscriptions);
      if (settingsRes.data.success) setSettings(settingsRes.data.settings);
    } catch (error) {
      console.error("Error fetching subscriptions data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (id) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      await axios.patch(`${API_URL}/api/super-admin/businesses/${id}/plan`, 
        { plan: editPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSubscriptions(subs => subs.map(s => 
        s.id === id ? { ...s, plan: editPlan } : s
      ));
      setEditingId(null);
    } catch (error) {
      console.error("Error updating plan", error);
    }
  };

  const { freeCount, proCount, mrr } = useMemo(() => {
    let free = 0;
    let pro = 0;
    subscriptions.forEach(s => {
      if (s.plan === 'pro') pro++;
      else free++;
    });
    
    const price = settings?.proPlanPrice || 29;
    return { freeCount: free, proCount: pro, mrr: pro * price };
  }, [subscriptions, settings]);

  const pieData = [
    { name: 'Free Plan', value: freeCount, color: 'var(--color-on-surface-muted)' },
    { name: 'Pro Plan', value: proCount, color: 'var(--color-primary)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}>
        {[
          { label: 'Free Accounts', value: freeCount, icon: Users, color: 'var(--color-on-surface-muted)' },
          { label: 'Pro Accounts', value: proCount, icon: CreditCard, color: 'var(--color-primary)' },
          { label: 'Monthly Revenue', value: `$${mrr.toLocaleString()}`, icon: DollarSign, color: 'var(--color-secondary)' }
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="card" style={{ padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-xl)', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>{stat.label}</p>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)' }}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-8)' }}>
        {/* Main Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-surface-container-low)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>Subscription Management</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-container-low)' }}>
                  <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase' }}>Business</th>
                  <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase' }}>Current Plan</th>
                  <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase' }}>Start Date</th>
                  <th style={{ padding: 'var(--space-4) var(--space-6)', textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-on-surface-muted)' }}><Loader2 className="spin" /></td></tr>
                ) : subscriptions.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: 'var(--space-16)', textAlign: 'center', color: 'var(--color-on-surface-muted)' }}>No subscriptions found</td></tr>
                ) : (
                  subscriptions.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--color-surface-container-low)', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                        <div>
                          <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--color-on-surface)' }}>{s.businessName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-on-surface-muted)' }}>{s.ownerEmail}</div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                        {editingId === s.id ? (
                          <select 
                            value={editPlan}
                            onChange={(e) => setEditPlan(e.target.value)}
                            className="input-field"
                            style={{ padding: '4px 8px', fontSize: 'var(--text-xs)', width: '100px' }}
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                          </select>
                        ) : (
                          <span style={{ 
                            padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '10px', fontWeight: 'var(--weight-bold)', textTransform: 'uppercase',
                            background: s.plan === 'pro' ? 'var(--color-primary-light)' : 'var(--color-surface-container-high)',
                            color: s.plan === 'pro' ? 'var(--color-primary)' : 'var(--color-on-surface-muted)'
                          }}>
                            {s.plan}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: 'var(--space-5) var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-muted)' }}>
                        {new Date(s.startDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: 'var(--space-5) var(--space-6)', textAlign: 'right' }}>
                        {editingId === s.id ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm">Cancel</button>
                            <button onClick={() => handleSavePlan(s.id)} className="btn btn-primary btn-sm"><Save size={14} /> Save</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingId(s.id); setEditPlan(s.plan); }} className="btn btn-secondary btn-sm">Edit Plan</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribution Card */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-6)' }}>Plan Distribution</h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ background: 'white', border: '1px solid var(--color-surface-container)', borderRadius: '12px' }} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style>{`
        .table-row-hover:hover { background: var(--color-surface-container-lowest); }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Subscriptions;
