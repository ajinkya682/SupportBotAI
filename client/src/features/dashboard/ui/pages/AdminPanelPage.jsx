import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Users, Shield, User, Loader2, Inbox } from 'lucide-react';
import { API_URL } from '../../../../shared/services/config';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
        const { data } = await axios.get(`${API_URL}/api/auth/admin/users`, config);
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          <span style={{ color: 'var(--color-on-surface-muted)', fontSize: 'var(--text-sm)' }}>Loading users...</span>
        </div>
      </div>
    );
  }

  const roleBadge = (role) => {
    if (role === 'admin') return <span className="badge badge-primary">{role}</span>;
    if (role === 'agent') return <span className="badge badge-success">{role}</span>;
    return <span className="badge badge-neutral">{role}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', padding: 'var(--space-10) 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-on-surface)' }}>
              Admin Panel
            </h1>
          </div>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-on-surface-muted)' }}>Manage platform users and data.</p>
        </div>

        {/* Users Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-6) var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Users size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-display)', color: 'var(--color-on-surface)' }}>
              Registered Users
            </h2>
            <span className="badge badge-neutral" style={{ marginLeft: 'auto' }}>{users.length} users</span>
          </div>
          <div className="surface-divider" />

          {/* Header Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', padding: 'var(--space-3) var(--space-6)', background: 'var(--color-surface-container-low)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Joined</span>
          </div>

          {/* Data Rows */}
          {users.length === 0 ? (
            <div style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                <Inbox size={20} style={{ color: 'var(--color-on-surface-muted)' }} />
              </div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-on-surface-variant)' }}>No users found</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)', marginTop: 'var(--space-2)' }}>Check back later for registered accounts.</p>
            </div>
          ) : (
            users.map((user, idx) => (
              <div
                key={user._id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr',
                  padding: 'var(--space-4) var(--space-6)',
                  background: idx % 2 === 0 ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-low)',
                  fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)',
                  alignItems: 'center',
                  transition: 'background var(--duration-fast)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232, 239, 254, 0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-low)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className="avatar avatar-sm">{user.name?.charAt(0)?.toUpperCase()}</div>
                  <span style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-on-surface)' }}>{user.name}</span>
                </div>
                <span>{user.email}</span>
                <span>{roleBadge(user.role)}</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
