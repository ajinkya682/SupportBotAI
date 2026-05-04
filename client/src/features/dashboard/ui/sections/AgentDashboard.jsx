import { useState, useEffect, useMemo } from 'react';
import { 
    MessageSquare, CheckCircle, ArrowRight, User, Check,
    Camera, Circle, Activity, 
    BarChart3, UserCircle, LogOut as LogoutIcon, Zap
} from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { logout, reset } from '../../../auth/state/authSlice';
import Conversations from './Conversations';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import socket from '../../../../shared/services/socket';
import toast from 'react-hot-toast';
import { API_URL } from '../../../../shared/services/config';

export default function AgentDashboard({ user }) {
    const dispatch = useDispatch();
    const [stats, setStats] = useState({ handledToday: 0, resolved: 0, pending: 0 });
    const [conversations, setConversations] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [isProfilePending, setIsProfilePending] = useState(user.status === 'inactive');
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [availability, setAvailability] = useState(user.availability || 'online');
    const [profileData, setProfileData] = useState({
        displayName: user.displayName || user.name || '',
        roleTitle: user.roleTitle || '',
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(user.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`);
    const [business, setBusiness] = useState(null);

    const roomId = user.role === 'agent' ? user.ownerId : user._id;

    useEffect(() => {
        if (isProfilePending) { setIsLoading(false); return; }

        fetchStats();
        fetchConversations();
        fetchBusinessConfig();

        socket.connect();
        socket.emit('join_room', { ownerId: roomId, role: 'agent', userId: user._id });
        socket.emit('agent_status_change', { agentId: user._id, status: 'online', ownerId: roomId });
        setAvailability('online');

        const heartbeatInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                socket.emit('agent_heartbeat', { agentId: user._id });
            }
        }, 30000);

        const handleVisibilityChange = () => {
            const newStatus = document.visibilityState === 'visible' ? 'online' : 'away';
            setConversations(prev => {
                const activeChat = prev.find(c => c.agent === user._id && c.status === 'in_progress');
                if (!activeChat) {
                    socket.emit('agent_status_change', { agentId: user._id, status: newStatus, ownerId: roomId });
                    setAvailability(newStatus);
                }
                return prev;
            });
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        socket.on('agent_assigned', (newConv) => {
            toast.success(`Ticket Assigned: ${newConv.userName || 'Visitor'}`, { icon: '🎫' });
            try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch(e) {}
            setConversations(prev => {
                const exists = prev.find(c => c._id === newConv._id);
                if (exists) return prev.map(c => c._id === newConv._id ? newConv : c);
                return [newConv, ...prev];
            });
            setStats(prev => ({ ...prev, pending: prev.pending + 1 }));
            setNotificationCount(prev => prev + 1);
        });

        socket.on('new_ticket', (newConv) => {
            if (newConv.routingStatus === 'holding') {
                setConversations(prev => {
                    const exists = prev.find(c => c._id === newConv._id);
                    if (exists) return prev.map(c => c._id === newConv._id ? newConv : c);
                    return [newConv, ...prev];
                });
            }
        });

        socket.on('new_message', (data) => {
            setConversations(prev => prev.map(conv => {
                if (conv._id !== data.conversationId) return conv;
                const newMsg = {
                    role: data.senderType === 'user' ? 'user' : 'assistant',
                    content: data.content,
                    timestamp: data.timestamp || new Date(),
                    senderType: data.senderType,
                    senderName: data.senderName,
                    senderAvatar: data.senderAvatar,
                    senderRole: data.senderRole,
                };
                return { ...conv, messages: [...conv.messages, newMsg], updatedAt: new Date() };
            }));
        });

        socket.on('agent_status_changed', ({ agentId, status }) => {
            if (agentId === user._id) setAvailability(status);
        });

        socket.on('agent_joined', (data) => {
            setConversations(prev => prev.map(conv => {
                if (conv._id !== data.conversationId) return conv;
                return { ...conv, agent: data.agent, status: 'in_progress', isAiActive: false, messages: data.messages || conv.messages };
            }));
        });

        socket.on('ticket_resolved', (data) => {
            setConversations(prev => prev.map(conv => {
                if (conv._id !== data.conversationId) return conv;
                return { ...conv, status: 'human_resolved', resolvedAt: data.resolvedAt, updatedAt: data.updatedAt || new Date(), messages: data.messages || conv.messages };
            }));
            if (data.resolvedBy === user._id) {
                setStats(prev => ({ ...prev, resolved: prev.resolved + 1, pending: Math.max(0, prev.pending - 1) }));
                setAvailability('online');
                toast.success('Ticket resolved!');
            }
        });

        socket.on('ai_toggled', (data) => {
            setConversations(prev => prev.map(conv => {
                if (conv._id !== data.conversationId) return conv;
                return { ...conv, isAiActive: data.isAiActive, status: data.status || conv.status };
            }));
        });

        return () => {
            clearInterval(heartbeatInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            socket.off('agent_assigned'); socket.off('new_ticket'); socket.off('new_message');
            socket.off('agent_status_changed'); socket.off('agent_joined'); socket.off('ticket_resolved');
            socket.off('ai_toggled'); socket.disconnect();
        };
    }, [user._id, isProfilePending, roomId]);

    const onLogout = () => {
        socket.emit('agent_status_change', { agentId: user._id, status: 'offline', ownerId: roomId });
        dispatch(logout()); dispatch(reset());
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) { toast.error("Max size 1MB"); return; }
            setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault(); setIsSaving(true);
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const formData = new FormData();
            formData.append('displayName', profileData.displayName);
            formData.append('roleTitle', profileData.roleTitle);
            if (photoFile) formData.append('photo', photoFile);

            const response = await axios.put(`${API_URL}/api/agents/update-profile`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            
            const updatedUser = { ...user, ...response.data.agent };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setIsProfilePending(false); setShowEditProfile(false);
            toast.success("Profile updated!");
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            toast.error("Update failed");
        } finally { setIsSaving(false); }
    };

    const toggleAvailability = async (newStatus) => {
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            await axios.put(`${API_URL}/api/agents/update-availability`, { availability: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailability(newStatus);
            socket.emit('agent_status_change', { agentId: user._id, status: newStatus, ownerId: roomId });
            localStorage.setItem('user', JSON.stringify({ ...user, availability: newStatus }));
        } catch (error) { toast.error("Failed to update status"); }
    };

    const fetchStats = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const response = await axios.get(`${API_URL}/api/agents/stats`, { headers: { Authorization: `Bearer ${token}` } });
            setStats(response.data);
        } catch (error) {}
    };

    const fetchConversations = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const response = await axios.get(`${API_URL}/api/conversations`, { headers: { Authorization: `Bearer ${token}` } });
            setConversations(response.data);
        } catch (error) {} finally { setIsLoading(false); }
    };

    const fetchBusinessConfig = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const res = await axios.get(`${API_URL}/api/business`, { headers: { Authorization: `Bearer ${token}` } });
            setBusiness(res.data);
        } catch (error) {}
    };

    const handleJoinConversation = async (convId) => {
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            await axios.put(`${API_URL}/api/agents/join/${convId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setActiveTab('conversations'); fetchConversations();
        } catch (err) { toast.error("Failed to join"); }
    };

    const chartData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });
        const dailyConv = {}, dailyResolved = {};
        last7Days.forEach(date => { dailyConv[date] = 0; dailyResolved[date] = 0; });
        conversations.forEach(c => {
            const date = new Date(c.createdAt).toISOString().split('T')[0];
            if (dailyConv[date] !== undefined) dailyConv[date]++;
            if (c.status === 'human_resolved') {
                const updatedDate = new Date(c.updatedAt).toISOString().split('T')[0];
                if (dailyResolved[updatedDate] !== undefined) dailyResolved[updatedDate]++;
            }
        });
        return last7Days.map(date => ({ name: date.split('-').slice(1).join('/'), total: dailyConv[date], resolved: dailyResolved[date] }));
    }, [conversations]);

    const liveSessionsCount = conversations.filter(c => c.status === 'in_progress' || c.status === 'human_needed').length;
    const openTickets = conversations.filter(c => c.status === 'human_needed' && !c.agent);

    if (isProfilePending || showEditProfile) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-surface-container-lowest)', padding: 'var(--space-6)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ maxWidth: '480px', width: '100%', padding: 'var(--space-10)', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto var(--space-6)' }}>
                        <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-2xl)', objectFit: 'cover', border: '3px solid var(--color-primary-light)', background: 'white' }} />
                        <label style={{ position: 'absolute', bottom: '-8px', right: '-8px', background: 'var(--color-primary)', color: 'white', width: '32px', height: '32px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
                            <Camera size={16} />
                            <input type="file" hidden onChange={handlePhotoChange} accept="image/*" />
                        </label>
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-extrabold)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>{showEditProfile ? 'Edit Profile' : 'Complete Setup'}</h1>
                    <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>Personalize how customers see you in chat sessions.</p>
                    <form onSubmit={handleProfileSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                        <div className="input-wrapper">
                            <label className="input-label">Display Name</label>
                            <input className="input-field" type="text" value={profileData.displayName} onChange={e => setProfileData({...profileData, displayName: e.target.value})} placeholder="e.g. Alex" required />
                        </div>
                        <div className="input-wrapper">
                            <label className="input-label">Role Title</label>
                            <input className="input-field" type="text" value={profileData.roleTitle} onChange={e => setProfileData({...profileData, roleTitle: e.target.value})} placeholder="e.g. Support Specialist" required />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                            {showEditProfile && <button type="button" className="btn btn-ghost" onClick={() => setShowEditProfile(false)} style={{ flex: 1 }}>Cancel</button>}
                            <button type="submit" className={`btn btn-primary${isSaving ? ' btn-loading' : ''}`} disabled={isSaving} style={{ flex: 2 }}>
                                {!isSaving && (showEditProfile ? "Save Changes" : "Activate Account")}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', background: 'var(--color-surface-container-lowest)', overflow: 'hidden' }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', background: 'var(--color-surface-container-low)', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-surface-container)' }}>
                <div style={{ padding: 'var(--space-8) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                        <div style={{ position: 'relative' }}>
                            <img src={user.profilePhoto || photoPreview} alt="" style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--color-surface-container-low)', background: availability === 'online' ? 'var(--color-secondary)' : availability === 'away' ? '#eab308' : '#94a3b8' }} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.displayName}</h3>
                            <p style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)', margin: 0 }}>Agent Dashboard</p>
                        </div>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3, count: notificationCount },
                            { id: 'conversations', label: 'Live Chats', icon: MessageSquare, count: openTickets.length }
                        ].map(item => (
                            <button 
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); if (item.id === 'overview') setNotificationCount(0); }}
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)', 
                                    border: 'none', background: activeTab === item.id ? 'var(--color-primary-light)' : 'transparent', 
                                    color: activeTab === item.id ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                                    fontWeight: activeTab === item.id ? 'var(--weight-bold)' : 'var(--weight-medium)', 
                                    fontSize: 'var(--text-sm)', cursor: 'pointer', textAlign: 'left', transition: 'all var(--duration-base)'
                                }}
                            >
                                <item.icon size={18} /> {item.label}
                                {item.count > 0 && <span style={{ marginLeft: 'auto', background: item.id === 'conversations' ? 'var(--color-error)' : 'var(--color-primary)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--radius-full)' }}>{item.count}</span>}
                            </button>
                        ))}
                        <button 
                            onClick={() => setShowEditProfile(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)', border: 'none', background: 'transparent', color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)', cursor: 'pointer', marginTop: 'var(--space-2)' }}>
                            <UserCircle size={18} /> Profile Settings
                        </button>
                    </nav>
                </div>

                <div style={{ marginTop: 'auto', padding: 'var(--space-6)', borderTop: '1px solid var(--color-surface-container)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', background: 'var(--color-surface-container-highest)', padding: '4px', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
                        {['online', 'away', 'offline'].map(s => (
                            <button key={s} onClick={() => toggleAvailability(s)} title={s} style={{ flex: 1, border: 'none', background: availability === s ? 'white' : 'transparent', color: availability === s ? (s === 'online' ? 'var(--color-secondary)' : '#94a3b8') : 'var(--color-on-surface-muted)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s', boxShadow: availability === s ? 'var(--shadow-xs)' : 'none' }}>
                                <Circle size={10} fill="currentColor" />
                            </button>
                        ))}
                    </div>
                    <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', border: 'none', background: '#fee2e2', color: '#ef4444', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                        <LogoutIcon size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-10)' }} className="custom-scrollbar">
                {activeTab === 'overview' ? (
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <header style={{ marginBottom: 'var(--space-10)' }}>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-extrabold)', fontSize: 'var(--text-3xl)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-1)' }}>
                                Welcome, <span style={{ color: 'var(--color-primary)' }}>{user.displayName?.split(' ')[0]}</span>
                            </h1>
                            <p style={{ color: 'var(--color-on-surface-variant)' }}>Here's your support activity overview.</p>
                        </header>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
                            {[
                                { label: 'Handled Today', value: stats.handledToday, icon: MessageSquare, color: 'var(--color-primary)' },
                                { label: 'Total Resolved', value: stats.resolved, icon: CheckCircle, color: 'var(--color-secondary)' },
                                { label: 'Live Sessions', value: liveSessionsCount, icon: Activity, color: '#ec4899' }
                            ].map(stat => (
                                <div key={stat.label} className="card" style={{ padding: 'var(--space-6)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase' }}>{stat.label}</span>
                                        <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <stat.icon size={20} />
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)' }}>{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Charts */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
                            <div className="card" style={{ padding: 'var(--space-6)' }}>
                                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-6)' }}>Conversation Volume</h3>
                                <div style={{ height: '240px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--color-on-surface-muted)' }} />
                                            <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--color-on-surface-muted)' }} />
                                            <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--color-surface-container)', borderRadius: '12px' }} />
                                            <Area type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="card" style={{ padding: 'var(--space-6)' }}>
                                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-6)' }}>Resolution Rate</h3>
                                <div style={{ height: '240px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--color-on-surface-muted)' }} />
                                            <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--color-on-surface-muted)' }} />
                                            <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--color-surface-container)', borderRadius: '12px' }} cursor={{ fill: 'var(--color-surface-container-low)' }} />
                                            <Bar dataKey="resolved" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Pending Tickets */}
                        {openTickets.length > 0 && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                                    <Zap size={20} style={{ color: 'var(--color-error)' }} />
                                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Pending Tickets</h2>
                                    <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 'var(--weight-bold)' }}>{openTickets.length} URGENT</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {openTickets.slice(0, 5).map(conv => (
                                        <div key={conv._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)', background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-surface-container)' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'var(--weight-bold)' }}>
                                                {conv.userName?.charAt(0) || 'U'}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                    <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)' }}>{conv.userName || 'Anonymous'}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)' }}>{new Date(conv.updatedAt).toLocaleTimeString()}</span>
                                                </div>
                                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{conv.messages[conv.messages.length - 1]?.content}</p>
                                            </div>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleJoinConversation(conv._id)}>Join Chat</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Conversations
                        conversations={conversations}
                        isAgentView={true}
                        onRefresh={fetchConversations}
                        socket={socket}
                        onConversationsUpdate={setConversations}
                        ownerInfo={business ? { name: business.name, businessLogo: business.appearance?.companyLogo } : null}
                    />
                )}
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-surface-container); border-radius: 10px; }
            `}</style>
        </div>
    );
}
