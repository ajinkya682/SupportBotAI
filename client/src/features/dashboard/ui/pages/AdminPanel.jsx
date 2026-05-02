import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Users, Shield, User, Loader2, Inbox, Search, Filter, Mail, Calendar, ChevronRight } from "lucide-react";
import { API_URL } from "../../../../shared/services/config";
import { motion } from "framer-motion";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        };
        const { data } = await axios.get(`${API_URL}/auth/admin/users`, config);
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="admin-loading">
        <Loader2 className="animate-spin" size={48} />
        <p>Loading administration console...</p>
      </div>
    );

  return (
    <div className="animate-fade-in admin-container">
      <header className="admin-header">
        <div className="page-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="admin-icon-wrapper"><Shield size={28} /></div>
            <div>
              <h1>Admin Control Panel</h1>
              <p>Global management of users and platform data.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-stats-row">
        <div className="card stat-mini">
          <span className="label">Total Registered</span>
          <span className="value">{users.length}</span>
        </div>
        <div className="card stat-mini">
          <span className="label">New This Week</span>
          <span className="value" style={{ color: 'var(--primary)' }}>+12</span>
        </div>
        <div className="card stat-mini">
          <span className="label">Active Instances</span>
          <span className="value" style={{ color: '#10b981' }}>{users.filter(u => u.role === 'owner').length}</span>
        </div>
      </div>

      <div className="card user-management-card">
        <div className="list-controls">
          <div className="search-wrapper">
            <Search size={18} />
            <input 
              placeholder="Search users by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary"><Filter size={18} /> Advanced Filter</button>
        </div>

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Identity</th>
                <th>Role / Access</th>
                <th>Registration Date</th>
                <th style={{ textAlign: 'right' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-row">
                    <div className="empty-state-content">
                      <Inbox size={48} />
                      <h4>No users found</h4>
                      <p>Adjust your search or check back later for new registrations.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar-placeholder">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">
                            <Mail size={12} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} />
                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-text btn-sm">
                        Details <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .admin-container { padding-bottom: 60px; }
        .admin-header { margin-bottom: 40px; }
        .admin-icon-wrapper { width: 56px; height: 56px; background: var(--inverse-surface); color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        
        .admin-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }
        .stat-mini { padding: 24px; display: flex; flex-direction: column; gap: 4px; }
        .stat-mini .label { font-size: 0.75rem; font-weight: 700; color: var(--on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-mini .value { font-size: 1.75rem; font-weight: 800; color: var(--on-surface); }
        
        .user-management-card { padding: 0; overflow: hidden; }
        .list-controls { padding: 24px; border-bottom: 1px solid var(--outline-variant); display: flex; justify-content: space-between; gap: 16px; }
        .search-wrapper { flex: 1; display: flex; align-items: center; gap: 12px; background: var(--surface-container-low); padding: 10px 20px; border-radius: 14px; border: 1.5px solid var(--outline-variant); color: var(--outline); }
        .search-wrapper input { background: transparent; border: none; font-size: 0.95rem; flex: 1; padding: 0; color: var(--on-surface); }
        
        .table-wrapper { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { text-align: left; padding: 16px 24px; background: var(--surface-container-low); color: var(--on-surface-variant); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .admin-table td { padding: 20px 24px; border-bottom: 1px solid var(--outline-variant); vertical-align: middle; }
        
        .user-info-cell { display: flex; align-items: center; gap: 16px; }
        .user-avatar-placeholder { width: 44px; height: 44px; border-radius: 12px; background: var(--primary-fixed); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
        .user-name { font-weight: 700; color: var(--on-surface); font-size: 1rem; margin-bottom: 2px; }
        .user-email { font-size: 0.8rem; color: var(--on-surface-variant); display: flex; align-items: center; gap: 6px; }
        
        .role-badge { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; width: fit-content; }
        .role-badge.admin { background: var(--inverse-surface); color: white; }
        .role-badge.owner { background: var(--primary-fixed); color: var(--primary); }
        .role-badge.agent { background: var(--surface-container-high); color: var(--on-surface-variant); }
        
        .date-cell { font-size: 0.85rem; color: var(--on-surface-variant); display: flex; align-items: center; gap: 8px; font-weight: 500; }
        
        .empty-row { padding: 100px 24px; text-align: center; }
        .empty-state-content { display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--on-surface-variant); }
        .empty-state-content h4 { margin-top: 20px; color: var(--on-surface); font-size: 1.2rem; }
        
        .admin-loading { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--on-surface-variant); gap: 24px; }
      `}</style>
    </div>
  );
}
