const Agenda = require('agenda');

const agenda = new Agenda({
    db: { address: process.env.MONGODB_URI, collection: 'agendaJobs' },
    processEvery: '1 minute'
});

// Define job processors
agenda.define('send push notification', async (job) => {
    const { userId, payload } = job.attrs.data;
    const pushService = require('./pushService');
    await pushService.sendNotification(userId, payload);
});

agenda.define('check idle tickets', async () => {
    const Conversation = require('../models/Conversation');
    const pushService = require('./pushService');
    const User = require('../models/User');

    // 10 minutes idle (no message from agent for 10 minutes)
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

    const idleTickets = await Conversation.find({
        status: 'in_progress',
        updatedAt: { $lt: tenMinsAgo }
    }).populate('business').populate('agent');

    for (const ticket of idleTickets) {
        // Notify Agent
        if (ticket.agent) {
            await pushService.sendNotification(ticket.agent._id, {
                type: 'idle_reminder',
                title: '⏳ Waiting Customer',
                body: `${ticket.userName || 'Customer'} has been waiting for 10 mins.`,
                sound: 'reminder',
                data: { url: '/dashboard', conversationId: ticket._id }
            });
        }

        // After 30 mins, notify Owner too
        if (ticket.updatedAt < thirtyMinsAgo && ticket.business.owner) {
            await pushService.sendNotification(ticket.business.owner, {
                type: 'idle_reminder',
                title: '⚠️ Neglected Ticket',
                body: `Ticket for ${ticket.userName || 'Customer'} has no reply for 30 mins!`,
                sound: 'urgent',
                data: { url: '/dashboard', conversationId: ticket._id }
            });
        }
    }
});

agenda.define('monitor go online request', async (job) => {
    const { agentId, ownerId } = job.attrs.data;
    const User = require('../models/User');
    const pushService = require('./pushService');

    const agent = await User.findById(agentId);
    if (!agent) return;

    // If agent is still not online after 30 mins
    if (agent.status !== 'online' && agent.pendingGoOnlineRequest) {
        await pushService.sendNotification(ownerId, {
            type: 'agent_offline',
            title: 'Still Offline — Action Required',
            body: `${agent.name} has not responded to your Go Online request.`,
            sound: 'urgent',
            data: { url: '/dashboard/team', agentId: agent._id }
        });
        
        agent.pendingGoOnlineRequest = false;
        await agent.save();
    }
});

agenda.define('daily summary', async () => {
    const Business = require('../models/Business');
    const Conversation = require('../models/Conversation');
    const pushService = require('./pushService');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const businesses = await Business.find({}).populate('owner');
    
    for (const biz of businesses) {
        if (!biz.owner) continue;

        const ticketsYesterday = await Conversation.countDocuments({
            business: biz._id,
            createdAt: { $gte: yesterday, $lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000) }
        });

        const resolvedYesterday = await Conversation.countDocuments({
            business: biz._id,
            status: 'human_resolved',
            updatedAt: { $gte: yesterday, $lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000) }
        });

        await pushService.sendNotification(biz.owner._id, {
            type: 'report',
            title: '📊 Daily Summary',
            body: `Yesterday: ${ticketsYesterday} tickets received, ${resolvedYesterday} resolved.`,
            sound: 'pop',
            data: { url: '/dashboard/analytics' }
        });
    }
});

agenda.define('check subscription expiry', async () => {
    const Business = require('../models/Business');
    const pushService = require('./pushService');
    const now = new Date();
    
    // Check 7 days, 1 day, and expired
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const expiringSoon = await Business.find({
        plan: 'pro',
        planExpiryDate: { $gt: now, $lte: sevenDaysFromNow }
    }).populate('owner');

    for (const biz of expiringSoon) {
        if (!biz.owner) continue;
        const daysLeft = Math.ceil((biz.planExpiryDate - now) / (1000 * 60 * 60 * 24));
        
        await pushService.sendNotification(biz.owner._id, {
            type: 'subscription',
            title: daysLeft === 1 ? '⚠️ Plan Expires Tomorrow' : 'Plan Expiring Soon',
            body: `Your Pro plan expires in ${daysLeft} days. Renew now to keep your features.`,
            sound: daysLeft === 1 ? 'urgent' : 'reminder',
            data: { url: '/dashboard/settings/billing' }
        });
    }

    const expired = await Business.find({
        plan: 'pro',
        planExpiryDate: { $lte: now }
    }).populate('owner');

    for (const biz of expired) {
        if (!biz.owner) continue;
        await pushService.sendNotification(biz.owner._id, {
            type: 'subscription',
            title: '❌ Plan Expired',
            body: 'Your Pro plan has expired. Features are now locked.',
            sound: 'urgent',
            data: { url: '/dashboard/settings/billing' }
        });
        // We could also demote them to free plan here if desired
    }
});

agenda.on('ready', async () => {
    await agenda.start();
    // Schedule periodic jobs
    await agenda.every('5 minutes', 'check idle tickets');
    await agenda.every('1 day', 'daily summary'); // Runs once a day
    await agenda.every('12 hours', 'check subscription expiry');
    console.log('Agenda background jobs started');
});

module.exports = agenda;
