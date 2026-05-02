import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Business from '../models/business.model.js';
import User from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';
import PlatformConfig from '../models/platform.model.js';
import Notification from '../models/notification.model.js';


/**
 * @desc    Super Admin Login with PlatformConfig fallback
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const defaultEmail = process.env.SUPER_ADMIN_EMAIL;
        const defaultPassword = process.env.SUPER_ADMIN_PASSWORD;

        let isValid = false;

        const config = await PlatformConfig.findOne({}, 'superAdminPasswordHash').lean();
        
        if (config && config.superAdminPasswordHash) {
            if (email === defaultEmail) {
                isValid = await bcrypt.compare(password, config.superAdminPasswordHash);
            }
        } else {
            if (email === defaultEmail && password === defaultPassword) {
                isValid = true;
            }
        }

        if (isValid) {
            const token = jwt.sign(
                { role: 'superadmin', email },
                process.env.SUPER_ADMIN_JWT_SECRET,
                { expiresIn: '7d' }
            );
            res.json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: 'Invalid super admin credentials' });
        }
    } catch (error) {
        console.error('Super admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

/**
 * @desc    Get dashboard statistics with parallel query execution
 */
export const getOverviewStats = async (req, res) => {
    try {
        const [
            totalBusinesses,
            freeBusinesses,
            proBusinesses,
            totalAgents,
            totalConversations,
            totalTickets,
            activeConversations
        ] = await Promise.all([
            Business.countDocuments(),
            Business.countDocuments({ plan: 'free' }),
            Business.countDocuments({ plan: 'pro' }),
            User.countDocuments({ role: 'agent' }),
            Conversation.countDocuments(),
            Conversation.countDocuments({ 
                status: { $in: ['human_needed', 'in_progress', 'human_resolved'] } 
            }),
            Conversation.countDocuments({ 
                status: { $in: ['human_needed', 'in_progress'] } 
            })
        ]);

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const conversationsToday = await Conversation.find({ 
            updatedAt: { $gte: startOfDay } 
        }, 'messages').lean();
        
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

/**
 * @desc    Fetch and sort recent activities across businesses and conversations
 */
export const getOverviewActivity = async (req, res) => {
    try {
        const [recentBusinesses, recentConversations] = await Promise.all([
            Business.find().sort({ createdAt: -1 }).limit(10).lean(),
            Conversation.find().populate('business', 'name').sort({ createdAt: -1 }).limit(10).lean()
        ]);

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
                type: c.status === 'human_needed' ? 'ticket_created' : 
                     (c.status === 'ai_resolved' || c.status === 'human_resolved' ? 'conversation_resolved' : 'new_conversation'),
                businessName: bName,
                timestamp: c.createdAt
            });
        });

        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json({ success: true, activities: activities.slice(0, 20) });
    } catch (error) {
        console.error('Error fetching overview activity:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Generate chronological chart data for the last 30 days
 */
export const getOverviewChartData = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [businesses, conversations] = await Promise.all([
            Business.find({ createdAt: { $gte: thirtyDaysAgo } }, 'createdAt').lean(),
            Conversation.find({ createdAt: { $gte: thirtyDaysAgo } }, 'createdAt').lean()
        ]);

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

        res.json({ success: true, chartData: Object.values(dateMap) });
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    List all businesses with aggregated metrics
 */
export const getBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find()
            .populate('owner', 'name email createdAt')
            .lean();
        
        const results = await Promise.all(businesses.map(async (b) => {
            const [agentCount, convCount, ticketCount] = await Promise.all([
                User.countDocuments({ role: 'agent', ownerId: b.owner?._id }),
                Conversation.countDocuments({ business: b._id }),
                Conversation.countDocuments({ 
                    business: b._id, 
                    status: { $in: ['human_needed', 'in_progress', 'human_resolved'] } 
                })
            ]);
            
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
        const business = await Business.findById(req.params.id).populate('owner', 'name email').lean();
        if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

        const [agents, recentConversations] = await Promise.all([
            User.find({ role: 'agent', ownerId: business.owner?._id }, 'name email status').lean(),
            Conversation.find({ business: business._id }).sort({ createdAt: -1 }).limit(10).lean()
        ]);
        
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

export const getAgents = async (req, res) => {
    try {
        const agents = await User.find({ role: 'agent' }).populate('ownerId', 'name email').lean();
        
        const results = await Promise.all(agents.map(async (agent) => {
            const [business, activeConvs, totalConvs, resolvedTickets] = await Promise.all([
                Business.findOne({ owner: agent.ownerId?._id }, 'name').lean(),
                Conversation.countDocuments({ assignedAgentId: agent._id, status: 'in_progress' }),
                Conversation.countDocuments({ assignedAgentId: agent._id }),
                Conversation.countDocuments({ resolvedBy: agent._id.toString() })
            ]);

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
        const agent = await User.findById(req.params.id).lean();
        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

        const history = await Conversation.find({ assignedAgentId: agent._id }).sort({ createdAt: -1 }).limit(50).lean();
        res.json({ success: true, agent, history });
    } catch (error) {
        console.error('Error fetching agent details:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .populate('business', 'name')
            .populate('assignedAgentId', 'name')
            .sort({ createdAt: -1 })
            .limit(1000)
            .lean();

        const results = conversations.map(c => {
            const endTime = c.resolvedAt || (['ai_resolved', 'human_resolved'].includes(c.status) ? c.updatedAt : null);
            let duration = null;
            if (endTime) {
                const diffMs = new Date(endTime) - new Date(c.createdAt);
                duration = Math.round(diffMs / 60000); 
            }

            return {
                id: c._id,
                businessName: c.business?.name || 'Unknown',
                sessionId: c.userEmail || c.userName || 'Anonymous',
                messageCount: c.messages.length,
                aiInvolved: c.messages.some(m => m.senderType === 'ai'),
                humanJoined: !!c.assignedAgentId || ['human_resolved', 'human_needed', 'in_progress'].includes(c.status),
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
            .populate('assignedAgentId', 'name')
            .lean();
            
        if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
        res.json({ success: true, conversation });
    } catch (error) {
        console.error('Error fetching conversation details:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getSubscriptions = async (req, res) => {
    try {
        const businesses = await Business.find().populate('owner', 'email').lean();
        const results = businesses.map(b => ({
            id: b._id,
            businessName: b.name,
            ownerEmail: b.owner?.email || 'Unknown',
            plan: b.plan,
            startDate: b.createdAt,
            endDate: null 
        }));

        res.json({ success: true, subscriptions: results });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getSettings = async (req, res) => {
    try {
        let config = await PlatformConfig.findOne().lean();
        if (!config) {
            config = await PlatformConfig.create({});
        }
        res.json({ success: true, settings: config });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const { platformName, proPlanPrice, freeConversationLimit, proConversationLimit } = req.body;
        
        const config = await PlatformConfig.findOneAndUpdate(
            {}, 
            { platformName, proPlanPrice, freeConversationLimit, proConversationLimit },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, settings: config });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const defaultPassword = process.env.SUPER_ADMIN_PASSWORD;

        let config = await PlatformConfig.findOne();
        if (!config) config = new PlatformConfig();

        let isValid = false;
        if (config.superAdminPasswordHash) {
            isValid = await bcrypt.compare(currentPassword, config.superAdminPasswordHash);
        } else {
            isValid = (currentPassword === defaultPassword);
        }

        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        config.superAdminPasswordHash = await bcrypt.hash(newPassword, salt);
        await config.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};