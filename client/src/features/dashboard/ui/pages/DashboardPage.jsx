import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getBusiness, updateBusiness } from '../../state/businessSlice';
import { getConversations } from '../../state/conversationSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';
import socket from '../../../../shared/services/socket';
import toast from 'react-hot-toast';
import { API_URL } from '../../../../shared/services/config';
import DashboardLayout from '../layout/DashboardLayout';

import Sidebar from '../components/Sidebar';
import Overview from '../sections/Overview';
import Conversations from '../sections/Conversations';
import Training from '../sections/Training';
import Appearance from '../sections/Appearance';
import Integration from '../sections/Integration';
import Analytics from '../sections/Analytics';
import Settings from '../sections/Settings';
import TeamMembers from '../sections/TeamMembers';
import AgentDashboard from '../sections/AgentDashboard';
import NotificationBell from '../components/NotificationBell';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { business, isLoading: businessLoading } = useSelector((state) => state.business);
  const { conversations: reduxConversations, isLoading: convLoading } = useSelector((state) => state.conversations);
  const { user } = useSelector((state) => state.auth);

  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', supportEmail: '', knowledge: '', faqs: [], allowedDomains: [],
    appearance: { themeColor: '#6366f1', botName: '', welcomeMessage: 'Hi there! How can I help you today?', placeholderText: 'Type your message...' }
  });

  useEffect(() => {
    if (user?.role === 'agent') return;
    dispatch(getBusiness());
    dispatch(getConversations());
  }, [dispatch, user?.role]);

  useEffect(() => {
    if (reduxConversations.length > 0 && conversations.length === 0) {
      setConversations(reduxConversations);
    }
  }, [reduxConversations]);

  useEffect(() => {
    if (!user?._id || user?.role === 'agent') return;
    socket.connect();
    socket.emit('join_room', { ownerId: user._id, role: 'owner' });
    socket.on('new_ticket', (newConv) => {
      toast.success(`🎫 New support ticket from ${newConv.userName || 'Anonymous'}`);
      setConversations(prev => { const exists = prev.find(c => c._id === newConv._id); if (exists) return prev.map(c => c._id === newConv._id ? newConv : c); return [newConv, ...prev]; });
    });
    socket.on('new_ticket_holding', (data) => { toast(`⏳ Ticket for ${data.conversationId} is in holding: ${data.reason}`, { icon: '⏳' }); });
    socket.on('new_message', (data) => {
      setConversations(prev => prev.map(conv => {
        if (conv._id !== data.conversationId) return conv;
        const newMsg = { role: data.senderType === 'user' ? 'user' : 'assistant', content: data.content, timestamp: data.timestamp || new Date(), senderType: data.senderType, senderName: data.senderName, senderAvatar: data.senderAvatar, senderRole: data.senderRole, sender: { name: data.senderName, profilePhoto: data.senderAvatar, userType: data.senderType } };
        const last = conv.messages[conv.messages.length - 1];
        if (last && last.content === data.content) return conv;
        return { ...conv, messages: [...conv.messages, newMsg], updatedAt: new Date() };
      }));
    });
    socket.on('update_conversation', (updated) => { setConversations(prev => { const exists = prev.find(c => c._id === updated._id); if (exists) return prev.map(c => c._id === updated._id ? updated : c); return [updated, ...prev]; }); });
    socket.on('agent_joined', (data) => { setConversations(prev => prev.map(conv => { if (conv._id !== data.conversationId) return conv; return { ...conv, agent: data.agent, status: 'in_progress', isAiActive: false }; })); toast(`👤 Agent ${data.agent?.displayName} joined a conversation`); });
    socket.on('ticket_resolved', (data) => {
      setConversations(prev => prev.map(conv => { if (conv._id !== data.conversationId) return conv; return { ...conv, status: 'human_resolved', resolvedByName: data.resolvedByName, resolvedByType: data.resolvedByType, resolvedAt: data.resolvedAt, updatedAt: data.updatedAt || new Date(), messages: data.messages || conv.messages }; }));
      const label = data.resolvedByType === 'agent' ? `Agent ${data.resolvedByName}` : 'Business Owner';
      toast.success(`✅ Ticket solved by ${label}`, { duration: 4000, icon: '🎉' });
      try { new Audio('/success.mp3').play().catch(() => {}); } catch(e) {}
    });
    socket.on('ai_toggled', (data) => { setConversations(prev => prev.map(conv => { if (conv._id !== data.conversationId) return conv; return { ...conv, isAiActive: data.isAiActive, status: data.status || conv.status }; })); toast(`🤖 AI Assistant ${data.isAiActive ? 'resumed' : 'paused'}`); });
    return () => { socket.off('new_ticket'); socket.off('new_message'); socket.off('update_conversation'); socket.off('agent_joined'); socket.off('ticket_resolved'); socket.off('ai_toggled'); socket.disconnect(); };
  }, [user?._id]);

  const [hasInitializedForm, setHasInitializedForm] = useState(false);
  useEffect(() => {
    if (business && !hasInitializedForm) {
      setFormData({ name: business.name || '', supportEmail: business.supportEmail || '', knowledge: business.knowledge || '', faqs: business.faqs || [], allowedDomains: business.allowedDomains || [], appearance: business.appearance || { themeColor: '#6366f1', botName: business.name || 'AI Assistant', welcomeMessage: 'Hi there! How can I help you today?', placeholderText: 'Type your message...' } });
      setHasInitializedForm(true);
    }
  }, [business, hasInitializedForm]);

  const onSave = async (e) => {
    if (e) e.preventDefault();
    try {
      await dispatch(updateBusiness(formData)).unwrap();
      setHasInitializedForm(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      toast.error("Failed to save changes: " + (err.message || "Unknown error"));
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const userObj = JSON.parse(localStorage.getItem('user'));
      const token = userObj?.token;
      await axios.post(`${API_URL}/api/conversations/upgrade`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Plan upgraded successfully to PRO! 🚀");
      dispatch(getBusiness());
      setShowUpgradeModal(false);
    } catch (err) {
      toast.error("Upgrade failed. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const renderContent = () => {
    if ((convLoading && conversations.length === 0) || (businessLoading && !business)) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', gap: 'var(--space-3)', color: 'var(--color-on-surface-muted)' }}>
          <Loader2 size={20} className="animate-spin" /> Loading your dashboard...
        </div>
      );
    }
    switch (activeTab) {
      case 'overview': return <Overview business={business} conversations={conversations} setActiveTab={setActiveTab} setSelectedConversationId={setSelectedConversationId} onUpgrade={() => setShowUpgradeModal(true)} />;
      case 'conversations': return <Conversations conversations={conversations} initialSelectedId={selectedConversationId} setSelectedConversationId={setSelectedConversationId} onConversationsUpdate={setConversations} socket={socket} ownerInfo={user ? { name: user.name, avatar: user.profilePhoto, businessLogo: business?.appearance?.companyLogo } : null} />;
      case 'training': return <Training formData={formData} setFormData={setFormData} onSave={onSave} isLoading={businessLoading} business={business} onUpgrade={() => setShowUpgradeModal(true)} />;
      case 'analytics': return <Analytics conversations={conversations} business={business} onUpgrade={() => setShowUpgradeModal(true)} />;
      case 'appearance': return <Appearance formData={formData} setFormData={setFormData} onSave={onSave} isLoading={businessLoading} business={business} onUpgrade={() => setShowUpgradeModal(true)} />;
      case 'integration': return <Integration business={business} onSave={onSave} isLoading={businessLoading} onUpgrade={() => setShowUpgradeModal(true)} />;
      case 'settings': return <Settings formData={formData} setFormData={setFormData} onSave={onSave} isLoading={businessLoading} />;
      case 'team': return <TeamMembers />;
      default: return <Overview business={business} conversations={conversations} />;
    }
  };

  if (user?.role === 'agent') return <AgentDashboard user={user} />;

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      business={business}
      onUpgrade={() => setShowUpgradeModal(true)}
      showUpgradeModal={showUpgradeModal}
      setShowUpgradeModal={setShowUpgradeModal}
      isUpgrading={isUpgrading}
      handleUpgrade={handleUpgrade}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
