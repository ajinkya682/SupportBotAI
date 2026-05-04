import Notification from '../models/notification.model.js';
import Business from '../models/business.model.js';

export const broadcastNotification = async (req, res) => {
    try {
        const { subject, message } = req.body;
        
        const notification = await Notification.create({
            recipientBusinessId: null, // null means broadcast
            subject,
            message,
            sentBy: 'superadmin'
        });

        if (req.io) {
            req.io.emit('new_notification', {
                id: notification._id,
                subject,
                message,
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

export const targetedNotification = async (req, res) => {
    try {
        const { businessId, subject, message } = req.body;

        const business = await Business.findById(businessId).lean();
        if (!business) {
            return res.status(404).json({ success: false, message: 'Business not found' });
        }

        const notification = await Notification.create({
            recipientBusinessId: businessId,
            subject,
            message,
            sentBy: 'superadmin'
        });

        if (req.io) {
            req.io.to(business.owner.toString()).emit('new_notification', {
                id: notification._id,
                subject,
                message,
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

export const getNotificationHistory = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('recipientBusinessId', 'name')
            .sort({ createdAt: -1 })
            .lean();
            
        const totalRecipientsBase = await Business.countDocuments();

        const results = notifications.map((n) => ({
            id: n._id,
            subject: n.subject,
            message: n.message,
            recipient: n.recipientBusinessId ? n.recipientBusinessId.name : 'All Businesses (Broadcast)',
            readCount: n.readBy?.length || 0,
            totalRecipients: n.recipientBusinessId ? 1 : totalRecipientsBase,
            createdAt: n.createdAt
        }));

        res.json({ success: true, history: results });
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getMyNotifications = async (req, res) => {
    try {
        const business = await Business.findOne({ owner: req.user._id }).lean();
        if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

        const notifications = await Notification.find({
            $or: [
                { recipientBusinessId: business._id },
                { recipientBusinessId: null }
            ]
        }).sort({ createdAt: -1 }).lean();

        const formatted = notifications.map(n => ({
            id: n._id,
            subject: n.subject,
            message: n.message,
            createdAt: n.createdAt,
            isRead: n.readBy?.some(id => id.toString() === business._id.toString())
        }));

        res.json({ success: true, notifications: formatted });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const business = await Business.findOne({ owner: req.user._id }).lean();
        if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { readBy: business._id } },
            { new: true }
        );

        if (!notification) return res.status(404).json({ success: false, message: 'Not found' });

        res.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const business = await Business.findOne({ owner: req.user._id }).lean();
        if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

        await Notification.updateMany(
            {
                $or: [
                    { recipientBusinessId: business._id },
                    { recipientBusinessId: null }
                ],
                readBy: { $ne: business._id }
            },
            { $addToSet: { readBy: business._id } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};