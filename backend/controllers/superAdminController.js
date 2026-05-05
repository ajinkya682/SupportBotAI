const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Business = require('../models/Business');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const PlatformConfig = require('../models/PlatformConfig');
const Notification = require('../models/Notification');

// --- AUTHENTICATION ---

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const defaultEmail = process.env.SUPER_ADMIN_EMAIL;
        const defaultPassword = process.env.SUPER_ADMIN_PASSWORD;

        let isValid = false;

        // Check against PlatformConfig if updated password exists
        let config = await PlatformConfig.findOne();
        if (config && config.superAdminPasswordHash) {
            if (email === defaultEmail) {
                isValid = await bcrypt.compare(password, config.superAdminPasswordHash);
            }
        } else {
            // Fallback to .env defaults
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

// --- OVERVIEW ---

const getOverviewStats = async (req, res) => {
    try {
        const totalBusinesses = await Business.countDocuments();
        const freeBusinesses = await Business.countDocuments({ plan: 'free' });
        const proBusinesses = await Business.countDocuments({ plan: 'pro' });
        const totalAgents = await User.countDocuments({ role: 'agent' });
        const totalConversations = await Conversation.countDocuments();
        
        // Define ticket as a conversation that needed human intervention
        const totalTickets = await Conversation.countDocuments({ 
            status: { $in: ['human_needed', 'in_progress', 'human_resolved'] } 
        });

        // Active conversations might be those started recently or not resolved
        const activeConversations = await Conversation.countDocuments({ 
            status: { $in: ['human_needed', 'in_progress'] } 
        });

        // Messages sent today (count conversations updated today, or iterate messages)
        // For simplicity, we count conversations created/updated today
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
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

const getOverviewActivity = async (req, res) => {
    try {
        // Fetch recent businesses
        const recentBusinesses = await Business.find().sort({ createdAt: -1 }).limit(10);
        // Fetch recent conversations
        const recentConversations = await Conversation.find().populate('business', 'name').sort({ createdAt: -1 }).limit(10);

        // Combine and sort events
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
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

const getOverviewChartData = async (req, res) => {
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
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

// --- BUSINESS OWNERS ---

const getBusinesses = async (req, res) => {
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
                lastActiveAt: b.lastActiveAt || b.createdAt,
                isBlocked: b.isBlocked || false
            };
        }));

        res.json({ success: true, businesses: results });
    } catch (error) {
        console.error('Error fetching businesses:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

const getBusinessDetails = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id).populate('owner', 'name email');
        if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

        const agents = await User.find({ role: 'agent', ownerId: business.owner?._id }, 'name email status');
        const recentConversations = await Conversation.find({ business: business._id }).sort({ createdAt: -1 }).limit(10);
        
        // Subscription history is mocked for now as we don't have a Subscriptions collection
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
                subscriptionHistory,
                isBlocked: business.isBlocked || false
            }
        });
    } catch (error) {
        console.error('Error fetching business details:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

const updateBusinessPlan = async (req, res) => {
    try {
        const { plan } = req.body;
        const business = await Business.findByIdAndUpdate(req.params.id, { plan }, { new: true });
        if (!business) return res.status(404).json({ success: false, message: 'Business not found' });
        res.json({ success: true, business });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

// --- SUPPORT AGENTS ---

const getAgents = async (req, res) => {
    try {
        const agents = await User.find({ role: 'agent' }).populate('ownerId', 'name email');
        
        const results = await Promise.all(agents.map(async (agent) => {
            // Find business for this agent's owner
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
                createdAt: agent.createdAt,
                isBlocked: agent.isBlocked || false
            };
        }));

        res.json({ success: true, agents: results });
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

const getAgentDetails = async (req, res) => {
    try {
        const agent = await User.findById(req.params.id);
        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

        const history = await Conversation.find({ assignedAgentId: agent._id }).sort({ createdAt: -1 }).limit(50);
        res.json({ 
            success: true, 
            agent: {
                ...agent.toObject(),
                id: agent._id
            }, 
            history 
        });
    } catch (error) {
        console.error('Error fetching agent details:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

// --- CONVERSATIONS ---

const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .populate('business', 'name')
            .populate('assignedAgentId', 'name')
            .sort({ createdAt: -1 })
            .limit(1000); // Prevent massive payloads

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
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

const getConversationDetails = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id)
            .populate('business', 'name')
            .populate('assignedAgentId', 'name');
            
        if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
        res.json({ success: true, conversation });
    } catch (error) {
        console.error('Error fetching conversation details:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

// --- SUBSCRIPTIONS ---

const getSubscriptions = async (req, res) => {
    try {
        const businesses = await Business.find().populate('owner', 'email');
        const results = businesses.map(b => ({
            id: b._id,
            businessName: b.name,
            ownerEmail: b.owner?.email || 'Unknown',
            plan: b.plan,
            startDate: b.createdAt,
            endDate: null // Not tracked currently
        }));

        res.json({ success: true, subscriptions: results });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

// --- SETTINGS ---

const getPublicConfig = async (req, res) => {
    try {
        let config = await PlatformConfig.findOne();
        if (!config) {
            config = await PlatformConfig.create({});
        }
        res.json({ 
            success: true, 
            config: {
                platformName: config.platformName,
                heroVideoUrl: config.heroVideoUrl
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getSettings = async (req, res) => {
    try {
        let config = await PlatformConfig.findOne();
        if (!config) {
            config = await PlatformConfig.create({});
        }
        res.json({ success: true, settings: config });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

const updateSettings = async (req, res) => {
    try {
        const { platformName, proPlanPrice, freeConversationLimit, proConversationLimit, heroVideoUrl } = req.body;
        let config = await PlatformConfig.findOne();
        if (!config) {
            config = new PlatformConfig();
        }
        config.platformName = platformName;
        config.proPlanPrice = proPlanPrice;
        config.freeConversationLimit = freeConversationLimit;
        config.proConversationLimit = proConversationLimit;
        if (heroVideoUrl) config.heroVideoUrl = heroVideoUrl;
        
        await config.save();
        res.json({ success: true, settings: config });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

const changePassword = async (req, res) => {
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
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

const exportReport = async (req, res) => {
    try {
        const businesses = await Business.find().populate('owner', 'email name');
        const agents = await User.find({ role: 'agent' }).populate('ownerId', 'name');
        const conversations = await Conversation.find().populate('business', 'name');
        const notifications = await Notification.find().sort({ createdAt: -1 });
        const config = await PlatformConfig.findOne() || { platformName: 'SupportBotAI', proPlanPrice: 49 };

        let csv = `--- SUPPORTBOTAI PLATFORM MASTER REPORT ---\n`;
        csv += `Generated At: ${new Date().toLocaleString()}\n\n`;

        // 1. CONTROL CENTER (OVERVIEW)
        csv += `SECTION: CONTROL CENTER (OVERVIEW)\n`;
        csv += `Total Businesses,Pro Accounts,Free Accounts,Total Agents,Total Conversations,Platform Name\n`;
        const proCount = businesses.filter(b => b.plan === 'pro').length;
        csv += `${businesses.length},${proCount},${businesses.length - proCount},${agents.length},${conversations.length},"${config.platformName}"\n\n`;

        // 2. CLIENT ACCOUNTS
        csv += `SECTION: CLIENT ACCOUNTS\n`;
        csv += `Business Name,Owner Name,Owner Email,Plan,Conversations,Created At,Last Active\n`;
        for (const b of businesses) {
            const bConvCount = conversations.filter(c => c.business?.toString() === b._id.toString()).length;
            csv += `"${b.name}","${b.owner?.name || 'N/A'}","${b.owner?.email || 'N/A'}","${b.plan}",${bConvCount},"${new Date(b.createdAt).toLocaleDateString()}","${new Date(b.lastActiveAt || b.createdAt).toLocaleDateString()}"\n`;
        }
        csv += `\n`;

        // 3. AGENT DIRECTORY
        csv += `SECTION: AGENT DIRECTORY\n`;
        csv += `Agent Name,Email,Parent Business,Status,Created At\n`;
        for (const a of agents) {
            const agentBusiness = businesses.find(b => b.owner?.toString() === a.ownerId?._id.toString());
            csv += `"${a.name}","${a.email}","${agentBusiness ? agentBusiness.name : 'N/A'}","${a.status || 'offline'}","${new Date(a.createdAt).toLocaleDateString()}"\n`;
        }
        csv += `\n`;

        // 4. GLOBAL LOGS (RECORDS)
        csv += `SECTION: GLOBAL CONVERSATION LOGS (RECENT 100)\n`;
        csv += `ID,Business,User,Status,Messages,AI Involved,Created At\n`;
        const recentConvs = conversations.slice(0, 100);
        for (const c of recentConvs) {
            const aiInvolved = c.messages.some(m => m.senderType === 'ai') ? 'YES' : 'NO';
            csv += `${c._id},"${c.business?.name || 'Unknown'}","${c.userEmail || 'Anonymous'}","${c.status}",${c.messages.length},${aiInvolved},"${new Date(c.createdAt).toLocaleString()}"\n`;
        }
        csv += `\n`;

        // 5. REVENUE & PLANS
        csv += `SECTION: REVENUE & PLANS\n`;
        csv += `Metric,Value\n`;
        csv += `Pro Plan Price,$${config.proPlanPrice}/mo\n`;
        csv += `Total Pro Subscriptions,${proCount}\n`;
        csv += `Estimated Monthly Revenue,$${proCount * config.proPlanPrice}\n`;
        csv += `Free Plan Limit,${config.freeConversationLimit} convs\n`;
        csv += `\n`;

        // 6. BROADCAST HISTORY
        csv += `SECTION: BROADCAST HISTORY\n`;
        csv += `Subject,Recipient,Total,Read,Date\n`;
        for (const n of notifications) {
            csv += `"${n.subject}","${n.recipient}",${n.totalRecipients},${n.readCount},"${new Date(n.createdAt).toLocaleDateString()}"\n`;
        }
        csv += `\n`;

        // 7. SYSTEM CONFIG
        csv += `SECTION: SYSTEM CONFIGURATION\n`;
        csv += `Parameter,Value\n`;
        csv += `Platform Name,"${config.platformName}"\n`;
        csv += `Pro Price,${config.proPlanPrice}\n`;
        csv += `Free Limit,${config.freeConversationLimit}\n`;
        csv += `Pro Limit,${config.proConversationLimit}\n`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=SupportBotAI_Global_Report.csv');
        res.status(200).send(csv);
    } catch (error) {
        console.error('Error exporting report:', error);
        res.status(500).json({ success: false, message: 'Server error during export' });
    }
};

const exportBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find().populate('owner', 'email name');
        let csv = 'Business ID,Name,Owner,Email,Plan,Created At,Is Blocked\n';
        businesses.forEach(b => {
            csv += `${b._id},"${b.name}","${b.owner?.name || 'N/A'}","${b.owner?.email || 'N/A'}","${b.plan}","${b.createdAt.toLocaleDateString()}",${b.isBlocked}\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=SB_Businesses.csv');
        res.send(csv);
    } catch (error) { res.status(500).json({ success: false }); }
};

const exportAgents = async (req, res) => {
    try {
        const agents = await User.find({ role: 'agent' }).populate('ownerId', 'name');
        let csv = 'Agent ID,Name,Email,Status,Created At,Is Blocked\n';
        agents.forEach(a => {
            csv += `${a._id},"${a.name}","${a.email}","${a.status}","${a.createdAt.toLocaleDateString()}",${a.isBlocked}\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=SB_Agents.csv');
        res.send(csv);
    } catch (error) { res.status(500).json({ success: false }); }
};

const exportConversations = async (req, res) => {
    try {
        const convs = await Conversation.find().populate('business', 'name');
        let csv = 'Conv ID,Business,User,Status,Messages,Date\n';
        convs.forEach(c => {
            csv += `${c._id},"${c.business?.name || 'N/A'}","${c.userEmail || 'Anon'}","${c.status}",${c.messages.length},"${c.createdAt.toLocaleDateString()}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=SB_Conversations.csv');
        res.send(csv);
    } catch (error) { res.status(500).json({ success: false }); }
};

const exportSubscriptions = async (req, res) => {
    try {
        const businesses = await Business.find({ plan: 'pro' }).populate('owner', 'email');
        let csv = 'Business Name,Owner Email,Plan,Price,Subscribed At\n';
        const config = await PlatformConfig.findOne() || { proPlanPrice: 49 };
        businesses.forEach(b => {
            csv += `"${b.name}","${b.owner?.email || 'N/A'}","${b.plan}",$${config.proPlanPrice},"${b.updatedAt.toLocaleDateString()}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=SB_Subscriptions.csv');
        res.send(csv);
    } catch (error) { res.status(500).json({ success: false }); }
};

const exportNotifications = async (req, res) => {
    try {
        const notes = await Notification.find().sort({ createdAt: -1 });
        let csv = 'Subject,Recipient,Total,Read,Date\n';
        notes.forEach(n => {
            csv += `"${n.subject}","${n.recipient}",${n.totalRecipients},${n.readCount},"${n.createdAt.toLocaleDateString()}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=SB_Notifications.csv');
        res.send(csv);
    } catch (error) { res.status(500).json({ success: false }); }
};

const blockBusiness = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);
        if (!business) return res.status(404).json({ success: false, message: 'Business not found' });
        
        const updated = await Business.findByIdAndUpdate(
            req.params.id, 
            { $set: { isBlocked: !business.isBlocked } },
            { new: true }
        );
        
        res.json({ success: true, message: `Business ${updated.isBlocked ? 'blocked' : 'unblocked'}` });
    } catch (error) { 
        console.error('Error blocking business:', error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

const deleteBusiness = async (req, res) => {
    try {
        await Business.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Business removed successfully' });
    } catch (error) { 
        console.error('Error deleting business:', error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

const blockAgent = async (req, res) => {
    try {
        const agent = await User.findById(req.params.id);
        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
        
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { isBlocked: !agent.isBlocked } },
            { new: true }
        );
        
        res.json({ success: true, message: `Agent ${updated.isBlocked ? 'blocked' : 'unblocked'}` });
    } catch (error) { 
        console.error('Error blocking agent:', error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

const deleteAgent = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Agent removed successfully' });
    } catch (error) { 
        console.error('Error deleting agent:', error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

const exportSettings = async (req, res) => {
  try {
    const settings = await PlatformConfig.findOne();
    const csvData = [
      ['Parameter', 'Value'],
      ['Platform Name', settings?.platformName || 'SupportBot AI'],
      ['Pro Plan Price', settings?.proPlanPrice || '49'],
      ['Free Conv Limit', settings?.freeConversationLimit || '100'],
      ['Pro Conv Limit', settings?.proConversationLimit || 'Unlimited'],
      ['Maintenance Mode', settings?.maintenanceMode ? 'ON' : 'OFF']
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=SupportBot_System_Config.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
    login,
    getOverviewStats,
    getOverviewActivity,
    getOverviewChartData,
    getBusinesses,
    getBusinessDetails,
    updateBusinessPlan,
    getAgents,
    getAgentDetails,
    getConversations,
    getConversationDetails,
    getSubscriptions,
    getPublicConfig,
    getSettings,
    updateSettings,
    changePassword,
    exportReport,
    exportBusinesses,
    exportAgents,
    exportConversations,
    exportSubscriptions,
    exportNotifications,
    blockBusiness,
    deleteBusiness,
    blockAgent,
    deleteAgent,
    exportSettings
};
