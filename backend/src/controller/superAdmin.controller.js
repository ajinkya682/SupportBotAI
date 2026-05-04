import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Business from '../models/business.model.js';
import User from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';

// --- OVERVIEW ---

export const getOverviewStats = async (req, res) => {
    try {
        const totalBusinesses = await Business.countDocuments();
        const freeBusinesses = await Business.countDocuments({ plan: 'free' });
        const proBusinesses = await Business.countDocuments({ plan: 'pro' });
        const totalAgents = await User.countDocuments({ role: 'agent' });
        const totalConversations = await Conversation.countDocuments();
        
        const totalTickets = await Conversation.countDocuments({ 
            status: { $in: ['human_needed', 'in_progress', 'human_resolved'] } 
        });

        const activeConversations = await Conversation.countDocuments({ 
            status: { $in: ['human_needed', 'in_progress'] } 
        });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const conversationsToday = await Conversation.find({ 
            updatedAt: { $gte: startOfDay } 
        });
        
        let messagesSentToday = 0;
        conversationsToday.forEach(conv => {
            messagesSentToday += conv.messages.filter(m => new Date(m.timestamp) >= startOfDay).length;
        });

        res.json({
            success: true,
            stats: {
                totalBusinesses,
                freeBusinesses,
                proBusinesses,
                totalAgents,
                totalConversations,
                totalTickets,
                activeConversations,
                messagesSentToday
            }
        });
    } catch (error) {
        console.error('Error fetching overview stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getOverviewActivity = async (req, res) => {
    try {
        const recentBusinesses = await Business.find().sort({ createdAt: -1 }).limit(10);
        const recentConversations = await Conversation.find().populate('business', 'name').sort({ createdAt: -1 }).limit(10);

        const activities = [];
        recentBusinesses.forEach(b => {
            activities.push({
                id: `bus_${b._id}`,
                type: 'new_business',
                businessName: b.name,
                timestamp: b.createdAt
            });
        });

        recentConversations.forEach(c => {
            const bName = c.business ? c.business.name : 'Unknown Business';
            activities.push({
                id: `conv_${c._id}`,
                type: c.status === 'human_needed' ? 'ticket_created' : (c.status === 'ai_resolved' || c.status === 'human_resolved' ? 'conversation_resolved' : 'new_conversation'),
                businessName: bName,
                timestamp: c.createdAt
            });
        });

        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const limitedActivities = activities.slice(0, 20);

        res.json({ success: true, activities: limitedActivities });
    } catch (error) {
        console.error('Error fetching overview activity:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getOverviewChartData = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const businesses = await Business.find({ createdAt: { $gte: thirtyDaysAgo } }, 'createdAt');
        const conversations = await Conversation.find({ createdAt: { $gte: thirtyDaysAgo } }, 'createdAt');

        const dateMap = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dateMap[dateStr] = { date: dateStr, newBusinesses: 0, newConversations: 0 };
        }

        businesses.forEach(b => {
            const dateStr = new Date(b.createdAt).toISOString().split('T')[0];
            if (dateMap[dateStr]) dateMap[dateStr].newBusinesses++;
        });

        conversations.forEach(c => {
            const dateStr = new Date(c.createdAt).toISOString().split('T')[0];
            if (dateMap[dateStr]) dateMap[dateStr].newConversations++;
        });

        const chartData = Object.values(dateMap);
        res.json({ success: true, chartData });
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- BUSINESS OWNERS ---

export const getBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find().populate('owner', 'name email createdAt');
        
        const results = await Promise.all(businesses.map(async (b) => {
            const agentCount = await User.countDocuments({ role: 'agent', ownerId: b.owner?._id });
            const convCount = await Conversation.countDocuments({ business: b._id });
            const ticketCount = await Conversation.countDocuments({ business: b._id, status: { $in: ['human_needed', 'in_progress', 'human_resolved'] } });
            
            return {
                id: b._id,
                logo: b.appearance?.companyLogo || null,
                name: b.name,
                ownerName: b.owner?.name || 'Unknown',
                ownerEmail: b.owner?.email || 'Unknown',
                plan: b.plan || 'free',
                agentCount,
                convCount,
                ticketCount,
                createdAt: b.createdAt,
                lastActiveAt: b.lastActiveAt || b.createdAt
            };
        }));

        res.json({ success: true, businesses: results });
    } catch (error) {
        console.error('Error fetching businesses:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getBusinessDetails = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id).populate('owner', 'name email');
        if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

        const agents = await User.find({ role: 'agent', ownerId: business.owner?._id }, 'name email status');
        const recentConversations = await Conversation.find({ business: business._id }).sort({ createdAt: -1 }).limit(10);
        
        const subscriptionHistory = [
            { plan: business.plan, date: business.updatedAt || business.createdAt, action: `Upgraded/Downgraded to ${business.plan}` }
        ];

        res.json({
            success: true,
            business: {
                id: business._id,
                name: business.name,
                ownerName: business.owner?.name,
                ownerEmail: business.owner?.email,
                logo: business.appearance?.companyLogo,
                plan: business.plan,
                createdAt: business.createdAt,
                agents,
                recentConversations,
                subscriptionHistory
            }
        });
    } catch (error) {
        console.error('Error fetching business details:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateBusinessPlan = async (req, res) => {
    try {
        const { plan } = req.body;
        const business = await Business.findByIdAndUpdate(req.params.id, { plan }, { new: true });
        if (!business) return res.status(404).json({ success: false, message: 'Business not found' });
        res.json({ success: true, business });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- SUPPORT AGENTS ---

export const getAgents = async (req, res) => {
    try {
        const agents = await User.find({ role: 'agent' }).populate('ownerId', 'name email');
        
        const results = await Promise.all(agents.map(async (agent) => {
            const business = await Business.findOne({ owner: agent.ownerId?._id });
            const activeConvs = await Conversation.countDocuments({ assignedAgentId: agent._id, status: 'in_progress' });
            const totalConvs = await Conversation.countDocuments({ assignedAgentId: agent._id });
            const resolvedTickets = await Conversation.countDocuments({ resolvedBy: agent._id.toString() });

            return {
                id: agent._id,
                name: agent.name,
                email: agent.email,
                businessName: business ? business.name : 'Unknown',
                status: agent.status || 'offline',
                activeConvs,
                totalConvs,
                resolvedTickets,
                createdAt: agent.createdAt
            };
        }));

        res.json({ success: true, agents: results });
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getAgentDetails = async (req, res) => {
    try {
        const agent = await User.findById(req.params.id);
        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

        const history = await Conversation.find({ assignedAgentId: agent._id }).sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, agent, history });
    } catch (error) {
        console.error('Error fetching agent details:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- CONVERSATIONS ---

export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .populate('business', 'name')
            .populate('assignedAgentId', 'name')
            .sort({ createdAt: -1 })
            .limit(1000);

        const results = conversations.map(c => {
            const endTime = c.resolvedAt || (c.status === 'ai_resolved' || c.status === 'human_resolved' ? c.updatedAt : null);
            let duration = null;
            if (endTime) {
                const diffMs = new Date(endTime) - new Date(c.createdAt);
                duration = Math.round(diffMs / 60000); // minutes
            }

            return {
                id: c._id,
                businessName: c.business?.name || 'Unknown',
                sessionId: c.userEmail || c.userName || 'Anonymous',
                messageCount: c.messages.length,
                aiInvolved: c.messages.some(m => m.senderType === 'ai'),
                humanJoined: !!c.assignedAgentId || c.status === 'human_resolved' || c.status === 'human_needed' || c.status === 'in_progress',
                agentName: c.assignedAgentId?.name || null,
                status: c.status,
                startTime: c.createdAt,
                endTime: endTime,
                duration: duration
            };
        });

        res.json({ success: true, conversations: results });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getConversationDetails = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id)
            .populate('business', 'name')
            .populate('assignedAgentId', 'name');
            
        if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
        res.json({ success: true, conversation });
    } catch (error) {
        console.error('Error fetching conversation details:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};