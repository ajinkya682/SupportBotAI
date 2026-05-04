import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Search, 
  Filter,
  Loader2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "../../../../shared/services/config";
import toast from "react-hot-toast";

export default function TeamMembers() {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', roleTitle: 'Support Agent' });
  const [isInviting, setIsInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const { data } = await axios.get(`${API_URL}/agents`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAgents(data);
    } catch (err) {
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const { data } = await axios.post(`${API_URL}/auth/invite-agent`, inviteData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAgents([...agents, data.agent]);
      setShowInviteModal(false);
      setInviteData({ name: '', email: '', roleTitle: 'Support Agent' });
      toast.success('Invitation sent successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to invite agent');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.delete(`${API_URL}/agents/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAgents(agents.filter(a => a._id !== id));
      toast.success('Team member removed');
    } catch (err) {
      toast.error('Failed to remove team member');
    }
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in team-container">
      <div className="team-header">
        <div className="page-title">
          <h1>Team Management</h1>
          <p>Manage human agents who can take over AI conversations.</p>
        </div>
        <button className="btn btn-primary invite-btn" onClick={() => setShowInviteModal(true)}>
          <UserPlus size={18} /> <span>Invite Member</span>
        </button>
      </div>

      <div className="team-stats-row">
        <div className="card stat-mini">
          <span className="label">Total Agents</span>
          <span className="value">{agents.length}</span>
        </div>
        <div className="card stat-mini">
          <span className="label">Active Now</span>
          <span className="value" style={{ color: '#10b981' }}>{agents.filter(a => a.status === 'online').length || 0}</span>
        </div>
        <div className="card stat-mini">
          <span className="label">Handover Capacity</span>
          <span className="value">{(agents.length * 5)} <span className="desktop-only">chats</span></span>
        </div>
      </div>

      <div className="card team-list-card">
        <div className="list-controls">
          <div className="search-wrapper">
            <Search size={18} />
            <input 
              placeholder="Search team..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary filter-btn"><Filter size={18} /> <span className="desktop-only">Filter</span></button>
        </div>

        {isLoading ? (
          <div className="loading-state-view">
            <Loader2 size={32} className="animate-spin" />
            <p>Loading team members...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="empty-state-view">
            <Users size={40} />
            <h4>No team members found</h4>
            <p>Invite your first agent to start handling complex queries.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-wrapper desktop-only">
              <table className="team-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent) => (
                    <tr key={agent._id}>
                      <td>
                        <div className="member-info">
                          <div className="member-avatar">
                            {agent.profilePhoto ? <img src={agent.profilePhoto} alt="" /> : agent.name.charAt(0)}
                          </div>
                          <div>
                            <div className="member-name">{agent.name}</div>
                            <div className="member-email">{agent.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="role-tag">
                          <Shield size={12} />
                          {agent.roleTitle || 'Support Agent'}
                        </div>
                      </td>
                      <td>
                        <div className={`status-pill ${agent.status || 'offline'}`}>
                          <span className="dot"></span>
                          {agent.status || 'Offline'}
                        </div>
                      </td>
                      <td>
                        <span className="join-date">{new Date(agent.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="icon-btn delete" onClick={() => handleRemove(agent._id)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked View */}
            <div className="mobile-team-list mobile-only">
              {filteredAgents.map((agent) => (
                <div key={agent._id} className="mobile-agent-card">
                  <div className="mobile-agent-header">
                    <div className="member-info">
                      <div className="member-avatar">
                        {agent.profilePhoto ? <img src={agent.profilePhoto} alt="" /> : agent.name.charAt(0)}
                      </div>
                      <div>
                        <div className="member-name">{agent.name}</div>
                        <div className="member-email">{agent.email}</div>
                      </div>
                    </div>
                    <button className="icon-btn delete" onClick={() => handleRemove(agent._id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mobile-agent-footer">
                    <div className="role-tag">
                      <Shield size={12} />
                      {agent.roleTitle || 'Support Agent'}
                    </div>
                    <div className={`status-pill ${agent.status || 'offline'}`}>
                      <span className="dot"></span>
                      {agent.status || 'Offline'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
            <motion.div 
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title-group">
                  <div className="modal-icon"><UserPlus size={20} /></div>
                  <div>
                    <h3>Invite Member</h3>
                    <p>Send an invitation to join your workspace.</p>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setShowInviteModal(false)}><X size={20} /></button>
              </div>

              <form onSubmit={handleInvite}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    placeholder="Agent name"
                    value={inviteData.name}
                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email"
                    placeholder="agent@company.com"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label>Role Title</label>
                  <select 
                    value={inviteData.roleTitle}
                    onChange={(e) => setInviteData({ ...inviteData, roleTitle: e.target.value })}
                  >
                    <option>Support Agent</option>
                    <option>Customer Success</option>
                    <option>Product Manager</option>
                    <option>Admin</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isInviting}>
                    {isInviting ? <Loader2 size={18} className="animate-spin" /> : 'Send Invite'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .team-container { padding-bottom: 40px; }
        .team-header { 
          display: flex; 
          flex-direction: column; 
          gap: 16px; 
          margin-bottom: 24px; 
        }

        @media (min-width: 768px) {
          .team-header { flex-direction: row; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
        }

        .invite-btn { width: 100%; justify-content: center; }
        @media (min-width: 768px) { .invite-btn { width: auto; } }
        
        .team-stats-row { 
          display: flex;
          flex-direction: column;
          gap: 12px; 
          margin-bottom: 24px; 
        }

        @media (min-width: 640px) {
          .team-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
        }

        .stat-mini { padding: 16px; display: flex; flex-direction: column; gap: 4px; }
        @media (min-width: 768px) { .stat-mini { padding: 20px; } }
        .stat-mini .label { font-size: 11px; font-weight: 700; color: var(--on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-mini .value { font-size: 1.5rem; font-weight: 800; color: var(--on-surface); }
        
        .team-list-card { padding: 0; overflow: hidden; }
        .list-controls { padding: 16px; border-bottom: 1px solid var(--outline-variant); display: flex; gap: 12px; align-items: center; }
        @media (min-width: 768px) { .list-controls { padding: 24px; justify-content: space-between; gap: 16px; } }

        .search-wrapper { flex: 1; display: flex; align-items: center; gap: 12px; background: var(--surface-container-low); padding: 8px 12px; border-radius: 12px; border: 1.5px solid var(--outline-variant); color: var(--outline); }
        .search-wrapper input { background: transparent; border: none; font-size: 13px; flex: 1; padding: 0; min-width: 0; }
        .search-wrapper input:focus { outline: none; }
        .filter-btn { padding: 10px; min-width: 44px; justify-content: center; }
        
        /* Desktop Table View */
        .table-wrapper { overflow-x: auto; display: none; }
        @media (min-width: 768px) { .table-wrapper { display: block; } }

        .team-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .team-table th { text-align: left; padding: 16px 24px; background: var(--surface-container-low); color: var(--on-surface-variant); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .team-table td { padding: 16px 24px; border-bottom: 1px solid var(--outline-variant); vertical-align: middle; }
        
        .member-info { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .member-avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--primary-fixed); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; overflow: hidden; flex-shrink: 0; }
        @media (min-width: 768px) { .member-avatar { width: 44px; height: 44px; font-size: 1.1rem; } }

        .member-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .member-name { font-weight: 700; color: var(--on-surface); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .member-email { font-size: 12px; color: var(--on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .role-tag { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--on-surface-variant); background: var(--surface-container-high); padding: 4px 10px; border-radius: 6px; width: fit-content; }
        
        .status-pill { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
        .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-pill.online { color: #10b981; }
        .status-pill.online .dot { background: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.4); }
        .status-pill.offline { color: var(--outline); }
        .status-pill.offline .dot { background: var(--outline); }
        
        .join-date { font-size: 12px; color: var(--on-surface-variant); }
        .icon-btn.delete { color: var(--outline); transition: 0.2s; background: none; border: none; cursor: pointer; padding: 8px; border-radius: 8px; }
        .icon-btn.delete:hover { color: var(--error); background: var(--error-container); }
        
        /* Mobile Stacked View */
        .mobile-team-list { display: flex; flex-direction: column; }
        .mobile-agent-card { padding: 16px; border-bottom: 1px solid var(--outline-variant); display: flex; flex-direction: column; gap: 16px; }
        .mobile-agent-card:last-child { border-bottom: none; }
        .mobile-agent-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .mobile-agent-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px dashed var(--outline-variant); }

        .loading-state-view, .empty-state-view { padding: 40px 16px; text-align: center; color: var(--on-surface-variant); display: flex; flex-direction: column; align-items: center; gap: 12px; }
        @media (min-width: 768px) { .loading-state-view, .empty-state-view { padding: 80px 24px; } }
        .empty-state-view h4 { margin-top: 8px; color: var(--on-surface); font-size: 1rem; }
        .empty-state-view p { font-size: 13px; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; padding: 16px; }
        @media (min-width: 640px) { .modal-overlay { align-items: center; padding: 24px; } }

        .modal-card { background: var(--surface-container-lowest); width: 100%; max-width: 480px; border-radius: 20px; box-shadow: var(--shadow-modal); border: 1px solid var(--outline-variant); padding: 24px; }
        @media (min-width: 640px) { .modal-card { padding: 32px; border-radius: 24px; } }

        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .modal-title-group { display: flex; gap: 12px; align-items: center; }
        .modal-title-group h3 { font-size: 1.1rem; }
        .modal-title-group p { font-size: 13px; color: var(--on-surface-variant); margin-top: 2px; }
        .modal-icon { width: 44px; height: 44px; background: var(--primary-fixed); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .close-btn { background: var(--surface-container-low); border: none; color: var(--outline); padding: 6px; border-radius: 50%; cursor: pointer; transition: 0.2s; }
        .close-btn:hover { background: var(--outline-variant); color: var(--on-surface); }
        
        .modal-footer { display: flex; flex-direction: column-reverse; gap: 12px; margin-top: 32px; }
        @media (min-width: 480px) { .modal-footer { flex-direction: row; } }
        .modal-footer button { flex: 1; height: 44px; }
        
        .desktop-only { display: none; }
        @media (min-width: 768px) { .desktop-only { display: inline; } }
        .mobile-only { display: flex; }
        @media (min-width: 768px) { .mobile-only { display: none; } }
      `}</style>
    </div>
  );
}
