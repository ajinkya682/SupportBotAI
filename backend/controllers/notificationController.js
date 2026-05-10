const Notification = require('../models/Notification');
const Business = require('../models/Business');
const User = require('../models/User');

// ── SUPER ADMIN ACTIONS ──────────────────────────────────────────────────────

// Super Admin: Broadcast to ALL Business Owners
exports.broadcastToOwners = async (req, res) => {
    try {
        const { subject, message } = req.body;
        
        const notification = new Notification({
            senderId: req.user._id,
            senderRole: 'superadmin',
            recipientId: null, // Broadcast
            recipientRole: 'owner',
            subject,
            message,
            isBroadcast: true
        });
        
        await notification.save();

        // Emit to the 'role_owner' room
        if (req.io) {
            req.io.to('role_owner').emit('new_notification', {
                id: notification._id,
                subject: notification.subject,
                message: notification.message,
                createdAt: notification.createdAt,
                isBroadcast: true,
                senderRole: 'superadmin'
            });
        }

        res.json({ success: true, notification });
    } catch (error) {
        console.error('Super Admin Broadcast error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Super Admin: Targeted to specific Business Owner
exports.targetedToOwner = async (req, res) => {
    try {
        const { businessId, subject, message } = req.body;

        const business = await Business.findById(businessId).populate('owner');
        if (!business || !business.owner) {
            return res.status(404).json({ success: false, message: 'Business or Owner not found' });
        }

        const notification = new Notification({
            senderId: req.user._id,
            senderRole: 'superadmin',
            recipientId: business.owner._id,
            recipientRole: 'owner',
            businessId: business._id,
            subject,
            message,
            isBroadcast: false
        });

        await notification.save();

        // Emit to the specific owner's private room
        if (req.io) {
            req.io.to(`user_${business.owner._id}`).emit('new_notification', {
                id: notification._id,
                subject: notification.subject,
                message: notification.message,
                createdAt: notification.createdAt,
                isBroadcast: false,
                senderRole: 'superadmin'
            });
        }

        res.json({ success: true, notification });
    } catch (error) {
        console.error('Super Admin Targeted error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ── BUSINESS OWNER ACTIONS ───────────────────────────────────────────────────

// Business Owner: Send to their own agents (Broadcast or Targeted)
exports.sendToAgents = async (req, res) => {
    try {
        const { recipientId, subject, message, isBroadcast } = req.body;
        const ownerId = req.user._id;

        // Verify business context
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ success: false, message: 'Business context not found' });

        const notificationData = {
            senderId: ownerId,
            senderRole: 'owner',
            recipientRole: 'agent',
            businessId: business._id,
            subject,
            message,
            isBroadcast: !!isBroadcast
        };

        if (!isBroadcast && recipientId) {
            // Targeted agent
            const agent = await User.findOne({ _id: recipientId, ownerId: ownerId, role: 'agent' });
            if (!agent) return res.status(404).json({ success: false, message: 'Agent not found in your team' });
            notificationData.recipientId = agent._id;
        } else {
            // Broadcast to all their agents
            notificationData.recipientId = null;
            notificationData.isBroadcast = true;
        }

        const notification = new Notification(notificationData);
        await notification.save();

        // Emit via Socket
        if (req.io) {
            if (notification.isBroadcast) {
                // Emit to the business-specific agent room
                req.io.to(`business_${ownerId}_agents`).emit('new_notification', {
                    id: notification._id,
                    subject: notification.subject,
                    message: notification.message,
                    createdAt: notification.createdAt,
                    isBroadcast: true,
                    senderRole: 'owner'
                });
            } else {
                // Emit to specific agent's private room
                req.io.to(`user_${recipientId}`).emit('new_notification', {
                    id: notification._id,
                    subject: notification.subject,
                    message: notification.message,
                    createdAt: notification.createdAt,
                    isBroadcast: false,
                    senderRole: 'owner'
                });
            }
        }

        res.json({ success: true, notification });
    } catch (error) {
        console.error('Owner to Agent notification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ── SHARED CONSUMPTION ACTIONS ────────────────────────────────────────────────

// Get user's own notifications (Strict Visibility)
exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        
        let query = {};

        if (role === 'owner') {
            // Owners see: 
            // 1. Broadcasts where recipientRole is 'owner'
            // 2. Targeted messages where recipientId is their ID
            query = {
                $or: [
                    { isBroadcast: true, recipientRole: 'owner' },
                    { recipientId: userId }
                ]
            };
        } else if (role === 'agent') {
            // Agents see:
            // 1. Broadcasts where recipientRole is 'agent' AND businessId matches their owner's business
            // 2. Targeted messages where recipientId is their ID
            const ownerId = req.user.ownerId;
            const business = await Business.findOne({ owner: ownerId });
            
            if (!business) return res.json({ success: true, notifications: [] });

            query = {
                $or: [
                    { isBroadcast: true, recipientRole: 'agent', businessId: business._id },
                    { recipientId: userId }
                ]
            };
        } else {
            // Super Admin or others
            return res.json({ success: true, notifications: [] });
        }

        const notifications = await Notification.find(query).sort({ createdAt: -1 });

        const formatted = notifications.map(n => ({
            id: n._id,
            subject: n.subject,
            message: n.message,
            createdAt: n.createdAt,
            isRead: n.readBy.includes(userId),
            senderRole: n.senderRole,
            isBroadcast: n.isBroadcast
        }));

        res.json({ success: true, notifications: formatted });
    } catch (error) {
        console.error('Fetch my notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Mark one as read
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ success: false, message: 'Not found' });

        if (!notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
            await notification.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        
        // Use same query as getMyNotifications
        let query = {};
        if (role === 'owner') {
            query = { $or: [{ isBroadcast: true, recipientRole: 'owner' }, { recipientId: userId }] };
        } else if (role === 'agent') {
            const business = await Business.findOne({ owner: req.user.ownerId });
            if (!business) return res.json({ success: true });
            query = { $or: [{ isBroadcast: true, recipientRole: 'agent', businessId: business._id }, { recipientId: userId }] };
        } else return res.json({ success: true });

        query.readBy = { $ne: userId };

        const notifications = await Notification.find(query);
        for (let n of notifications) {
            n.readBy.push(userId);
            await n.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ── UTILITIES & HISTORY ──────────────────────────────────────────────────────

exports.getNotificationHistory = async (req, res) => {
    try {
        // Super Admin viewing global history
        const notifications = await Notification.find()
            .populate('recipientId', 'name email')
            .populate('businessId', 'name')
            .sort({ createdAt: -1 });
            
        const results = notifications.map(n => ({
            id: n._id,
            subject: n.subject,
            message: n.message,
            recipient: n.isBroadcast 
                ? `All ${n.recipientRole}s ${n.businessId ? `of ${n.businessId.name}` : '(Global)'}`
                : n.recipientId?.name || 'Unknown User',
            readCount: n.readBy.length,
            createdAt: n.createdAt,
            senderRole: n.senderRole
        }));

        res.json({ success: true, history: results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ── PUSH NOTIFICATIONS (UNCHANGED) ───────────────────────────────────────────

const PushSubscription = require('../models/PushSubscription');

exports.getVapidPublicKey = (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

exports.subscribe = async (req, res) => {
    try {
        const { subscription, browser, deviceType, sessionId } = req.body;
        const userId = req.user ? req.user._id : null;
        if (!userId && !sessionId) return res.status(400).json({ success: false, message: 'UserId or SessionId required' });
        const query = userId ? { userId, 'subscription.endpoint': subscription.endpoint } : { sessionId, 'subscription.endpoint': subscription.endpoint };
        const existing = await PushSubscription.findOne(query);
        if (existing) { existing.isActive = true; existing.lastActiveAt = Date.now(); await existing.save(); }
        else { await PushSubscription.create({ userId, sessionId, userRole: req.user ? req.user.role : 'guest', subscription, browser, deviceType }); }
        res.status(201).json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.unsubscribe = async (req, res) => {
    try {
        const { endpoint } = req.body;
        await PushSubscription.findOneAndUpdate({ 'subscription.endpoint': endpoint }, { isActive: false });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updatePreferences = async (req, res) => {
    try {
        const { preferences } = req.body;
        await User.findByIdAndUpdate(req.user._id, { notificationPreferences: preferences });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.testPush = async (req, res) => {
    try {
        const pushService = require('../utils/pushService');
        await pushService.sendNotification(req.user._id, {
            type: 'team',
            title: '🚀 SupportBotAI Push Active',
            body: 'Congratulations! Your device is now correctly configured to receive real-time alerts.',
            sound: 'team',
            data: { url: '/dashboard' }
        });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
