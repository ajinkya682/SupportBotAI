const Notification = require('../models/Notification');
const Business = require('../models/Business');

// Super Admin: Broadcast to all
exports.broadcastNotification = async (req, res) => {
    try {
        const { subject, message } = req.body;
        
        const notification = new Notification({
            recipientBusinessId: null, // null means broadcast
            subject,
            message,
            sentBy: 'superadmin'
        });
        
        await notification.save();

        // Emit to all connected clients
        if (req.io) {
            req.io.emit('new_notification', {
                id: notification._id,
                subject: notification.subject,
                message: notification.message,
                createdAt: notification.createdAt,
                isBroadcast: true
            });
        }

        res.json({ success: true, notification });
    } catch (error) {
        console.error('Broadcast error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Super Admin: Targeted to specific business
exports.targetedNotification = async (req, res) => {
    try {
        const { businessId, subject, message } = req.body;

        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({ success: false, message: 'Business not found' });
        }

        const notification = new Notification({
            recipientBusinessId: businessId,
            subject,
            message,
            sentBy: 'superadmin'
        });

        await notification.save();

        // Emit to specific business owner room
        if (req.io) {
            req.io.to(business.owner.toString()).emit('new_notification', {
                id: notification._id,
                subject: notification.subject,
                message: notification.message,
                createdAt: notification.createdAt,
                isBroadcast: false
            });
        }

        res.json({ success: true, notification });
    } catch (error) {
        console.error('Targeted notification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Super Admin: Get all notifications history
exports.getNotificationHistory = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('recipientBusinessId', 'name')
            .sort({ createdAt: -1 });
            
        const results = await Promise.all(notifications.map(async (n) => {
            const totalRecipients = n.recipientBusinessId ? 1 : await Business.countDocuments();
            return {
                id: n._id,
                subject: n.subject,
                message: n.message,
                recipient: n.recipientBusinessId ? n.recipientBusinessId.name : 'All Businesses (Broadcast)',
                readCount: n.readBy.length,
                totalRecipients,
                createdAt: n.createdAt
            };
        }));

        res.json({ success: true, history: results });
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Business Owner: Get their notifications
exports.getMyNotifications = async (req, res) => {
    try {
        // Find business for this user (handle agents)
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId });
        
        if (!business) {
            console.warn(`[getMyNotifications] No business found for ownerId: ${ownerId}`);
            return res.status(404).json({ success: false, message: 'Business not found' });
        }

        // Get targeted and broadcast notifications
        const notifications = await Notification.find({
            $or: [
                { recipientBusinessId: business._id },
                { recipientBusinessId: null }
            ]
        }).sort({ createdAt: -1 });

        const formatted = notifications.map(n => ({
            id: n._id,
            subject: n.subject,
            message: n.message,
            createdAt: n.createdAt,
            isRead: n.readBy.includes(business._id)
        }));

        res.json({ success: true, notifications: formatted });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Business Owner: Mark one as read
exports.markAsRead = async (req, res) => {
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ success: false, message: 'Not found' });

        if (!notification.readBy.includes(business._id)) {
            notification.readBy.push(business._id);
            await notification.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Business Owner: Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

        const notifications = await Notification.find({
            $or: [
                { recipientBusinessId: business._id },
                { recipientBusinessId: null }
            ],
            readBy: { $ne: business._id }
        });

        for (let n of notifications) {
            n.readBy.push(business._id);
            await n.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ── PUSH NOTIFICATIONS ────────────────────────────────────────────────────────

const PushSubscription = require('../models/PushSubscription');
const User = require('../models/User');

exports.getVapidPublicKey = (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

exports.subscribe = async (req, res) => {
    try {
        const { subscription, browser, deviceType, sessionId } = req.body;
        const userId = req.user ? req.user._id : null;

        // If it's a guest session, ensure sessionId is provided
        if (!userId && !sessionId) {
            return res.status(400).json({ success: false, message: 'UserId or SessionId required' });
        }

        const query = userId 
            ? { userId, 'subscription.endpoint': subscription.endpoint }
            : { sessionId, 'subscription.endpoint': subscription.endpoint };

        const existing = await PushSubscription.findOne(query);

        if (existing) {
            existing.isActive = true;
            existing.lastActiveAt = Date.now();
            await existing.save();
        } else {
            await PushSubscription.create({
                userId,
                sessionId,
                userRole: req.user ? req.user.role : 'guest',
                subscription,
                browser,
                deviceType
            });
        }

        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.unsubscribe = async (req, res) => {
    try {
        const { endpoint } = req.body;
        await PushSubscription.findOneAndUpdate(
            { 'subscription.endpoint': endpoint },
            { isActive: false }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const { preferences } = req.body;
        await User.findByIdAndUpdate(req.user._id, {
            notificationPreferences: preferences
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
