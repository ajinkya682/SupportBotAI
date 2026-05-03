import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Download, ChevronUp, ChevronDown, Calendar, Filter, Loader2, Inbox, MessageSquare, Clock, User, ChevronRight } from 'lucide-react';
import ConversationViewer from '../components/ConversationViewer';
import { API_URL } from '../../../../shared/services/config';
import { motion } from 'framer-motion';

const statusConfig = {
  ai_resolved: { label: 'AI Resolved', color: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' },
  human_resolved: { label: 'Human Resolved', color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: '#fef3e2' },
  human_needed: { label: 'Urgent', color: 'var(--color-error)', bg: 'var(--color-error-light)' },
};

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessFilter, setBusinessFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [handlerFilter, setHandlerFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'startTime', direction: 'desc' });
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => { fetchConversations(); }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const res = await axios.get(`${API_URL}/api/super-admin/conversations`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setConversations(res.data.conversations);
    } catch (error) { console.error("Error fetching conversations", error); }
    finally { setLoading(false); }
  };

  const uniqueBusinesses = useMemo(() => ['All', ...Array.from(new Set(conversations.map(c => c.businessName))).sort()], [conversations]);

  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter(c => {
      const matchesSearch = c.sessionId?.toLowerCase().includes(searchTerm.toLowerCase()) || c.id?.toLowerCase().includes(searchTerm.toLowerCase()) || c.agentName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBusiness = businessFilter === 'All' ? true : c.businessName === businessFilter;
      const matchesStatus = statusFilter === 'All' ? true : c.status === statusFilter;
      let matchesHandler = true;
      if (handlerFilter === 'AI Only') matchesHandler = c.aiInvolved && !c.humanJoined;
      if (handlerFilter === 'Human Involved') matchesHandler = c.humanJoined;
      let matchesDate = true;
      const convDate = new Date(c.startTime).getTime();
      if (dateFrom) matchesDate = matchesDate && convDate >= new Date(dateFrom).getTime();
      if (dateTo) { const toDate = new Date(dateTo); toDate.setDate(toDate.getDate() + 1); matchesDate = matchesDate && convDate < toDate.getTime(); }
      return matchesSearch && matchesBusiness && matchesStatus && matchesHandler && matchesDate;
    });
    filtered.sort((a, b) => {
      let vA = a[sortConfig.key] ?? ''; let vB = b[sortConfig.key] ?? '';
      if (vA < vB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (vA > vB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [conversations, searchTerm, businessFilter, statusFilter, handlerFilter, dateFrom, dateTo, sortConfig]);

  const exportToCSV = () => {
    const headers = ['Conversation ID', 'Business', 'Session/User', 'Messages', 'AI Involved', 'Human Joined', 'Agent Name', 'Status', 'Start Time', 'Duration (mins)'];
    const csvContent = [headers.join(','), ...filteredConversations.map(c => [`"${c.id.substring(0, 8)}"`, `"${c.businessName}"`, `"${c.sessionId}"`, c.messageCount, c.aiInvolved ? 'Yes' : 'No', c.humanJoined ? 'Yes' : 'No', `"${c.agentName || ''}"`, c.status, new Date(c.startTime).toLocaleString(), c.duration || 'N/A'].join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'conversations_history.csv');
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
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)' }}>Global Conversation Log</h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>Audit and monitor all interactions across the platform.</p>
        </div>
        <button className="btn btn-secondary" onClick={exportToCSV}>
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-muted)' }} />
            <input 
              type="text" placeholder="Search by ID, User, or Agent..." 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="input-field" style={{ paddingLeft: '40px', border: 'none', background: 'var(--color-surface-container-low)' }} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-surface-container-low)' }}>
             <Calendar size={16} style={{ color: 'var(--color-on-surface-muted)' }} />
             <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '12px', outline: 'none' }} />
             <span style={{ color: 'var(--color-on-surface-muted)' }}>-</span>
             <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '12px', outline: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <select value={businessFilter} onChange={e => setBusinessFilter(e.target.value)} className="input-field" style={{ width: '180px', border: 'none', background: 'var(--color-surface-container-low)' }}>
            {uniqueBusinesses.map(b => <option key={b} value={b}>{b === 'All' ? 'All Businesses' : b}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field" style={{ width: '160px', border: 'none', background: 'var(--color-surface-container-low)' }}>
            <option value="All">All Statuses</option>
            <option value="ai_resolved">AI Resolved</option>
            <option value="human_resolved">Human Resolved</option>
            <option value="human_needed">Urgent / Needed</option>
            <option value="in_progress">In Progress</option>
          </select>
          <select value={handlerFilter} onChange={e => setHandlerFilter(e.target.value)} className="input-field" style={{ width: '160px', border: 'none', background: 'var(--color-surface-container-low)' }}>
            <option value="All">All Handlers</option>
            <option value="AI Only">AI Only</option>
            <option value="Human Involved">Human Involved</option>
          </select>
        </div>
      </div>

      {/* Conversations Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-container-lowest)', borderBottom: '1px solid var(--color-surface-container-low)' }}>
                {[
                  { key: 'id', label: 'Reference' },
                  { key: 'businessName', label: 'Business' },
                  { key: 'sessionId', label: 'Session' },
                  { key: 'messageCount', label: 'Volume' },
                  { key: 'humanJoined', label: 'Handled By' },
                  { key: 'status', label: 'Status' },
                  { key: 'startTime', label: 'Timestamp' }
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
              {filteredConversations.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 'var(--space-20)', textAlign: 'center' }}>
                    <Inbox size={48} style={{ color: 'var(--color-on-surface-muted)', marginBottom: 'var(--space-4)', opacity: 0.2 }} />
                    <p style={{ color: 'var(--color-on-surface-muted)', fontSize: 'var(--text-sm)' }}>No conversations found for these filters.</p>
                  </td>
                </tr>
              ) : filteredConversations.map((c) => {
                const s = statusConfig[c.status] || statusConfig.in_progress;
                return (
                  <tr 
                    key={c.id} onClick={() => setSelectedConversation(c.id)}
                    style={{ borderBottom: '1px solid var(--color-surface-container-low)', transition: 'background 0.2s', cursor: 'pointer' }}
                    className="conv-row"
                  >
                    <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                      <code style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)', fontWeight: 'bold' }}>#{c.id.substring(0, 8)}</code>
                    </td>
                    <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                      <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>{c.businessName}</span>
                    </td>
                    <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)' }}>
                        <User size={14} style={{ color: 'var(--color-on-surface-muted)' }} /> {c.sessionId}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-container-low)', fontWeight: 'bold', fontSize: '11px' }}>
                        <MessageSquare size={12} /> {c.messageCount}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {c.aiInvolved && <span style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>AI</span>}
                        {c.humanJoined && <span style={{ background: 'var(--color-secondary-light)', color: 'var(--color-secondary)', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>HUMAN</span>}
                        {c.agentName && <span style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)', fontWeight: 'medium' }}>{c.agentName}</span>}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                      <span style={{ 
                        fontSize: '10px', fontWeight: 'bold', padding: '2px 10px', borderRadius: 'var(--radius-full)',
                        background: s.bg, color: s.color, textTransform: 'uppercase'
                      }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>{new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-on-surface-muted)' }}>{new Date(c.startTime).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-5) var(--space-6)', textAlign: 'right' }}>
                      <ChevronRight size={18} style={{ color: 'var(--color-on-surface-muted)' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedConversation && <ConversationViewer conversationId={selectedConversation} onClose={() => setSelectedConversation(null)} />}

      <style>{`
        .conv-row:hover { background: var(--color-surface-container-low) !important; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Conversations;
