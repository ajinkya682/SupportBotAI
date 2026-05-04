import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, Loader2 } from 'lucide-react';
import axios from 'axios';
import socket from '../../../../shared/services/socket';
import toast from 'react-hot-toast';
import { API_URL } from '../../../../shared/services/config';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeamMembers() {
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState(null);
    const [newAgent, setNewAgent] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        fetchAgents();

        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            const ownerId = userData.role === 'owner' ? userData._id : userData.ownerId;
            
            socket.connect();
            socket.emit('join_room', { ownerId, role: userData.role, userId: userData._id });

            socket.on('agent_status_changed', ({ agentId, status }) => {
                setAgents(prev => prev.map(a => 
                    a._id === agentId ? { ...a, status: status } : a
                ));
            });
        }

        return () => {
            socket.off('agent_status_changed');
        };
    }, []);

    const fetchAgents = async () => {
        try {
            const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
            const response = await axios.get(`${API_URL}/api/agents/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAgents(response.data);
        } catch (error) {
            console.error("Failed to fetch agents", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAgent = async (e) => {
        e.preventDefault();
        setIsAdding(true);
        try {
            const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
            await axios.post(`${API_URL}/api/agents/add`, newAgent, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowAddModal(false);
            setNewAgent({ name: '', email: '', password: '' });
            toast.success("Agent added successfully");
            fetchAgents();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add agent");
        } finally {
            setIsAdding(false);
        }
    };

    const confirmDeleteAgent = async () => {
        if (!agentToDelete) return;
        try {
            const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
            await axios.delete(`${API_URL}/api/agents/${agentToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Agent deleted successfully");
            fetchAgents();
            setAgentToDelete(null);
        } catch (error) {
            toast.error("Failed to delete agent");
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader2 className="spin" size={32} style={{ color: 'var(--color-primary)' }} />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-extrabold)', fontSize: 'var(--text-3xl)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-1)' }}>
                        Team Management
                    </h1>
                    <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>
                        Manage your support agents and monitor their active status.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <UserPlus size={18} /> Add Agent
                </button>
            </div>

            {/* Content Section */}
            <div>
                {agents.length === 0 ? (
                    <div style={{ padding: 'var(--space-16) var(--space-8)', textAlign: 'center', background: 'white', borderRadius: 'var(--radius-2xl)', border: '2px dashed var(--color-surface-container)' }}>
                        <div style={{ width: '64px', height: '64px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)', color: 'var(--color-primary)' }}>
                            <Shield size={32} />
                        </div>
                        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-2)' }}>No support agents yet</h3>
                        <p style={{ color: 'var(--color-on-surface-variant)', maxWidth: '400px', margin: '0 auto var(--space-8)', fontSize: 'var(--text-sm)' }}>
                            Support agents help handle complex customer queries that require a human touch.
                        </p>
                        <button className="btn btn-secondary" onClick={() => setShowAddModal(true)}>Add your first agent</button>
                    </div>
                ) : (
                    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--color-surface-container)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-surface-container-low)' }}>
                                    <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agent</th>
                                    <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                                    <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: 'var(--space-4) var(--space-6)', fontSize: '11px', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Performance</th>
                                    <th style={{ padding: 'var(--space-4) var(--space-6)', textAlign: 'right' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {agents.map((agent) => (
                                    <tr key={agent._id} style={{ borderBottom: '1px solid var(--color-surface-container-low)', transition: 'background var(--duration-base)' }} className="table-row-hover">
                                        <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'var(--weight-bold)', overflow: 'hidden' }}>
                                                        {agent.profilePhoto ? <img src={agent.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : agent.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div style={{ 
                                                        position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white',
                                                        background: agent.status === 'online' ? 'var(--color-secondary)' : 
                                                                   agent.status === 'in_conversation' ? '#3b82f6' :
                                                                   agent.status === 'away' ? '#eab308' : '#ef4444'
                                                    }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--color-on-surface)' }}>{agent.displayName || agent.name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--color-on-surface-muted)' }}>{agent.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontSize: '10px', fontWeight: 'var(--weight-bold)', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', width: 'fit-content', textTransform: 'uppercase' }}>Support Agent</span>
                                                <span style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)' }}>{agent.roleTitle || 'General Support'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: agent.status === 'online' ? 'var(--color-secondary)' : '#ef4444' }} />
                                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', textTransform: 'capitalize', color: 'var(--color-on-surface)' }}>
                                                    {agent.status || 'offline'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--space-5) var(--space-6)' }}>
                                            <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                                                <div>
                                                    <div style={{ fontSize: '10px', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase' }}>Resolved</div>
                                                    <div style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>{agent.stats?.resolved || 0}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '10px', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase' }}>Handled Today</div>
                                                    <div style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>{agent.stats?.handledToday || 0}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--space-5) var(--space-6)', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => setAgentToDelete(agent._id)}
                                                style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', color: 'var(--color-on-surface-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-on-surface-muted)'; }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            style={{ width: '100%', maxWidth: '440px', background: 'white', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-10)', boxShadow: 'var(--shadow-2xl)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-extrabold)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Add New Agent</h2>
                            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>Create a dedicated account for your support staff.</p>
                            
                            <form onSubmit={handleAddAgent} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                                <div className="input-wrapper">
                                    <label className="input-label">Full Name</label>
                                    <input className="input-field" type="text" placeholder="John Doe" required value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} />
                                </div>
                                <div className="input-wrapper">
                                    <label className="input-label">Email Address</label>
                                    <input className="input-field" type="email" placeholder="john@example.com" required value={newAgent.email} onChange={e => setNewAgent({...newAgent, email: e.target.value})} />
                                </div>
                                <div className="input-wrapper">
                                    <label className="input-label">Temporary Password</label>
                                    <input className="input-field" type="password" placeholder="••••••••" required value={newAgent.password} onChange={e => setNewAgent({...newAgent, password: e.target.value})} />
                                </div>
                                
                                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className={`btn btn-primary${isAdding ? ' btn-loading' : ''}`} disabled={isAdding} style={{ flex: 1 }}>
                                        {!isAdding && 'Create Agent'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {agentToDelete && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setAgentToDelete(null)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-10)', textAlign: 'center', boxShadow: 'var(--shadow-2xl)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
                                <Trash2 size={28} />
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-extrabold)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Delete Agent?</h2>
                            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>
                                This action cannot be undone. The agent will lose access to the platform immediately.
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setAgentToDelete(null)} style={{ flex: 1 }}>Cancel</button>
                                <button type="button" className="btn btn-primary" style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444' }} onClick={confirmDeleteAgent}>Delete Agent</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .table-row-hover:hover { background: var(--color-surface-container-low); }
                .spin { animation: spin-anim 0.8s linear infinite; }
                @keyframes spin-anim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
