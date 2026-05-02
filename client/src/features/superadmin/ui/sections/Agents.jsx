import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Download, ChevronUp, ChevronDown, User, Loader2, Inbox, Users, ShieldCheck, Mail, Building, Clock } from 'lucide-react';
import { API_URL } from '../../../../shared/services/config';
import { motion } from 'framer-motion';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [businessFilter, setBusinessFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const res = await axios.get(`${API_URL}/api/super-admin/agents`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setAgents(res.data.agents);
    } catch (error) { console.error("Error fetching agents", error); }
    finally { setLoading(false); }
  };

  const uniqueBusinesses = useMemo(() => ['All', ...Array.from(new Set(agents.map(a => a.businessName))).sort()], [agents]);

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const filteredAgents = useMemo(() => {
    let filtered = agents.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' ? true : a.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesBusiness = businessFilter === 'All' ? true : a.businessName === businessFilter;
      return matchesSearch && matchesStatus && matchesBusiness;
    });
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [agents, searchTerm, statusFilter, businessFilter, sortConfig]);

  const exportToCSV = () => {
    const headers = ['Agent Name', 'Email', 'Business', 'Status', 'Active Conversations', 'Total Conversations', 'Joined Date'];
    const csvContent = [headers.join(','), ...filteredAgents.map(a => [`"${a.name}"`, `"${a.email}"`, `"${a.businessName}"`, a.status, a.activeConvs, a.totalConvs, new Date(a.createdAt).toLocaleDateString()].join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'support_agents.csv');
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-20)' }}>
        <Loader2 className="spin" size={32} style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)' }}>Support Agents</h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>Monitor and manage all support personnel across the ecosystem.</p>
        </div>
        <button className="btn btn-secondary" onClick={exportToCSV}>
          <Download size={18} /> Export List
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-muted)' }} />
          <input 
            type="text" placeholder="Search by agent name or email..." 
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="input-field" style={{ paddingLeft: '40px', border: 'none', background: 'var(--color-surface-container-low)' }} 
          />
        </div>
        <select 
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="input-field" style={{ width: '160px', border: 'none', background: 'var(--color-surface-container-low)' }}
        >
          <option value="All">All Statuses</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
        <select 
          value={businessFilter} onChange={e => setBusinessFilter(e.target.value)}
          className="input-field" style={{ width: '200px', border: 'none', background: 'var(--color-surface-container-low)' }}
        >
          {uniqueBusinesses.map(b => <option key={b} value={b}>{b === 'All' ? 'All Businesses' : b}</option>)}
        </select>
      </div>

      {/* Agents Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-container-lowest)', borderBottom: '1px solid var(--color-surface-container-low)' }}>
                {[
                  { key: 'name', label: 'Agent' },
                  { key: 'businessName', label: 'Business' },
                  { key: 'status', label: 'Presence' },
                  { key: 'activeConvs', label: 'Workload' },
                  { key: 'totalConvs', label: 'Performance' },
                  { key: 'createdAt', label: 'Joined' }
                ].map(col => (
                  <th 
                    key={col.key} onClick={() => handleSort(col.key)}
                    style={{ padding: 'var(--space-5) var(--space-6)', textAlign: 'left', fontSize: '11px', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {col.label}
                      {sortConfig.key === col.key && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 'var(--space-20)', textAlign: 'center' }}>
                    <Inbox size={48} style={{ color: 'var(--color-on-surface-muted)', marginBottom: 'var(--space-4)', opacity: 0.2 }} />
                    <p style={{ color: 'var(--color-on-surface-muted)', fontSize: 'var(--text-sm)' }}>No support agents found matching your filters.</p>
                  </td>
                </tr>
              ) : filteredAgents.map((a) => (
                <tr 
                  key={a.id}
                  style={{ borderBottom: '1px solid var(--color-surface-container-low)', transition: 'background 0.2s' }}
                  className="agent-row"
                >
                  <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)' }}>
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>{a.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)' }}>{a.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>
                      <Building size={14} style={{ color: 'var(--color-on-surface-muted)' }} /> {a.businessName}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.status === 'online' ? 'var(--color-secondary)' : 'var(--color-on-surface-muted)', boxShadow: a.status === 'online' ? '0 0 8px var(--color-secondary)' : 'none' }} />
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: a.status === 'online' ? 'var(--color-secondary)' : 'var(--color-on-surface-muted)', textTransform: 'uppercase' }}>{a.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-container-low)', fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
                      <Activity size={14} style={{ color: 'var(--color-primary)' }} /> {a.activeConvs}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>{a.totalConvs} chats</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)' }}>{a.totalTickets} tickets resolved</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-5) var(--space-6)', fontSize: '11px', color: 'var(--color-on-surface-muted)', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .agent-row:hover { background: var(--color-surface-container-low) !important; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Agents;
