const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const PushNotificationLog = require('../models/PushNotificationLog');
const User = require('../models/User');

// Configure web-push
try {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT || 'mailto:support@supportbotai.com',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
    }
} catch (err) {
    console.error('❌ Failed to set VAPID details:', err.message);
}

/**
 * Send a push notification to a specific user
 * @param {string} userId - ID of the user to notify
 * @param {object} payload - Notification payload { title, body, icon, data, type }
 */
exports.sendNotification = async (userId, payload) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        // Check if in quiet hours
        if (user.notificationPreferences?.quietHours?.enabled) {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const { start, end } = user.notificationPreferences.quietHours;
            
            if (start < end) {
                if (currentTime >= start && currentTime <= end) return;
            } else {
                // Over midnight
                if (currentTime >= start || currentTime <= end) return;
            }
        }

        // Check preference for this type
        // mapping types to preferences
        const typeToPref = {
            'new_ticket': 'newTickets',
            'agent_offline': 'agentOfflineAlerts',
            'resolved': 'conversationResolved',
            'team': 'teamActivity',
            'subscription': 'subscriptionAlerts',
            'report': 'monthlyReports',
            'assigned': 'ticketAssigned',
            'message': 'newMessages',
            'reassigned': 'reassignmentAlerts'
        };

        if (payload.type && typeToPref[payload.type]) {
            if (user.notificationPreferences[typeToPref[payload.type]] === false) return;
        }

        // Rate Limiting: Max 10 pushes per hour per user
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const pushCount = await PushNotificationLog.countDocuments({
            userId,
            sentAt: { $gt: oneHourAgo }
        });

        if (pushCount >= 10 && payload.type !== 'billing' && payload.type !== 'go_online_request') {
            console.warn(`Rate limit reached for user ${userId}. Skipping push.`);
            return;
        }

        const subscriptions = await PushSubscription.find({ userId, isActive: true });
        
        const pushPromises = subscriptions.map(async (sub) => {
            try {
                // Build action buttons based on type
                let actions = [];
                if (payload.type === 'go_online_request') {
                    actions = [
                        { action: 'go_online', title: 'Go Online Now' },
                        { action: 'dismiss', title: 'Dismiss' }
                    ];
                } else if (payload.type === 'new_ticket' || payload.type === 'high_intent') {
                    actions = [
                        { action: 'view_ticket', title: 'View Ticket' }
                    ];
                }

                const notificationPayload = {
                    title: payload.title,
                    body: payload.body,
                    icon: payload.icon || '/icon-192x192.png',
                    badge: '/badge-72x72.png',
                    vibrate: [200, 100, 200],
                    data: {
                        ...payload.data,
                        url: payload.data?.url || '/',
                        type: payload.type,
                        sentAt: new Date()
                    },
                    tag: payload.tag || payload.type,
                    renotify: true,
                    actions: actions,
                    requireInteraction: payload.type === 'go_online_request' || payload.type === 'high_intent'
                };

                await webpush.sendNotification(
                    sub.subscription,
                    JSON.stringify(notificationPayload)
                );

                // Log successful delivery
                await PushNotificationLog.create({
                    userId,
                    type: payload.type,
                    title: payload.title,
                    body: payload.body,
                    data: payload.data,
                    status: 'sent'
                });

            } catch (error) {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    sub.isActive = false;
                    await sub.save();
                }
                
                await PushNotificationLog.create({
                    userId,
                    type: payload.type,
                    title: payload.title,
                    body: payload.body,
                    data: payload.data,
                    status: 'failed',
                    error: error.message
                });
                console.error('Push delivery error:', error);
            }
        });

        await Promise.all(pushPromises);

    } catch (error) {
        console.error('sendNotification error:', error);
    }
};

/**
 * Send a push notification to a guest session
 * @param {string} sessionId - ID of the guest session
 * @param {object} payload - Notification payload
 */
exports.sendToSession = async (sessionId, payload) => {
    try {
        const subscriptions = await PushSubscription.find({ sessionId, isActive: true });
        
        const pushPromises = subscriptions.map(async (sub) => {
            try {
                const notificationPayload = {
                    title: payload.title,
                    body: payload.body,
                    icon: payload.icon || '/icon-192x192.png',
                    badge: '/badge-72x72.png',
                    data: {
                        ...payload.data,
                        url: payload.data?.url || '/',
                        type: payload.type,
                        sentAt: new Date()
                    },
                    tag: payload.tag || payload.type,
                    renotify: true
                };

                await webpush.sendNotification(
                    sub.subscription,
                    JSON.stringify(notificationPayload)
                );
            } catch (error) {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    sub.isActive = false;
                    await sub.save();
                }
            }
        });

        await Promise.all(pushPromises);
    } catch (error) {
        console.error('sendToSession error:', error);
    }
};
