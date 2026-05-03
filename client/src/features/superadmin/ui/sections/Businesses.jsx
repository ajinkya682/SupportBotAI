import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Download, ChevronUp, ChevronDown, MoreVertical, Loader2, Inbox, Building2, Mail, Calendar, ShieldCheck, ChevronRight } from 'lucide-react';
import BusinessDetailModal from '../components/BusinessDetailModal';
import { API_URL } from '../../../../shared/services/config';
import { motion, AnimatePresence } from 'framer-motion';

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => { fetchBusinesses(); }, []);

  const fetchBusinesses = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const res = await axios.get(`${API_URL}/api/super-admin/businesses`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setBusinesses(res.data.businesses);
    } catch (error) {
      console.error("Error fetching businesses", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const filteredAndSortedBusinesses = useMemo(() => {
    let filtered = businesses.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = planFilter === 'All' ? true : b.plan.toLowerCase() === planFilter.toLowerCase();
      return matchesSearch && matchesPlan;
    });
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [businesses, searchTerm, planFilter, sortConfig]);

  const exportToCSV = () => {
    const headers = ['Business Name', 'Owner Name', 'Owner Email', 'Plan', 'Agents', 'Conversations', 'Tickets', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedBusinesses.map(b => [
        `"${b.name}"`, `"${b.ownerName}"`, `"${b.ownerEmail}"`,
        b.plan, b.agentCount, b.convCount, b.ticketCount,
        new Date(b.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'business_owners.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)' }}>Business Directory</h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>Manage all platform business accounts and ownership details.</p>
        </div>
        <button className="btn btn-secondary" onClick={exportToCSV}>
          <Download size={18} /> Export Directory
        </button>
      </div>

      {/* Toolbar */}
      <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-muted)' }} />
          <input 
            type="text" placeholder="Search by name or email..." 
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="input-field" style={{ paddingLeft: '40px', border: 'none', background: 'var(--color-surface-container-low)' }} 
          />
        </div>
        <select 
          value={planFilter} onChange={e => setPlanFilter(e.target.value)}
          className="input-field" style={{ width: '160px', border: 'none', background: 'var(--color-surface-container-low)' }}
        >
          <option value="All">All Plans</option>
          <option value="free">Free Tier</option>
          <option value="pro">Pro Tier</option>
        </select>
      </div>

      {/* Directory Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-container-lowest)', borderBottom: '1px solid var(--color-surface-container-low)' }}>
                {[
                  { key: 'name', label: 'Business' },
                  { key: 'ownerEmail', label: 'Owner Details' },
                  { key: 'plan', label: 'Service Plan' },
                  { key: 'agentCount', label: 'Team Size' },
                  { key: 'convCount', label: 'Activity' },
                  { key: 'createdAt', label: 'Join Date' }
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
                <th style={{ padding: 'var(--space-5) var(--space-6)', textAlign: 'right' }} />
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 'var(--space-20)', textAlign: 'center' }}>
                    <Inbox size={48} style={{ color: 'var(--color-on-surface-muted)', marginBottom: 'var(--space-4)', opacity: 0.2 }} />
                    <p style={{ color: 'var(--color-on-surface-muted)', fontSize: 'var(--text-sm)' }}>No businesses found matching your criteria.</p>
                  </td>
                </tr>
              ) : filteredAndSortedBusinesses.map((b) => (
                <tr 
                  key={b.id} onClick={() => setSelectedBusiness(b.id)}
                  style={{ borderBottom: '1px solid var(--color-surface-container-low)', transition: 'background 0.2s', cursor: 'pointer' }}
                  className="directory-row"
                >
                  <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {b.logo ? <img src={b.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 size={20} style={{ color: 'var(--color-primary)' }} />}
                      </div>
                      <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>{b.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)' }}>{b.ownerName}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)' }}>{b.ownerEmail}</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                    <span style={{ 
                      fontSize: '10px', fontWeight: 'bold', padding: '2px 10px', borderRadius: 'var(--radius-full)',
                      background: b.plan === 'pro' ? 'var(--color-secondary-light)' : 'var(--color-surface-container-low)',
                      color: b.plan === 'pro' ? 'var(--color-secondary)' : 'var(--color-on-surface-muted)',
                      textTransform: 'uppercase'
                    }}>
                      {b.plan}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-sm)' }}>
                      <Users size={14} style={{ color: 'var(--color-on-surface-muted)' }} /> {b.agentCount}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>{b.convCount} chats</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)' }}>{b.ticketCount} tickets</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-5) var(--space-6)', fontSize: '11px', color: 'var(--color-on-surface-muted)', fontWeight: 'bold' }}>
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 'var(--space-5) var(--space-6)', textAlign: 'right' }}>
                    <ChevronRight size={18} style={{ color: 'var(--color-on-surface-muted)' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBusiness && (
        <BusinessDetailModal businessId={selectedBusiness} onClose={() => setSelectedBusiness(null)} onPlanChange={fetchBusinesses} />
      )}

      <style>{`
        .directory-row:hover { background: var(--color-surface-container-low) !important; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Businesses;
