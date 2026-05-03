/*
* Service Worker for SupportBotAI Push Notifications
*/

self.addEventListener('push', function(event) {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/logo-circle.png',
            badge: data.badge || '/badge.png',
            data: data.data,
            tag: data.tag || 'general',
            renotify: true,
            actions: data.actions || [],
            vibrate: data.vibrate || [100, 50, 100],
            requireInteraction: data.requireInteraction || false,
            silent: false
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (err) {
        console.error('Push event error:', err);
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'close') return;

    let urlToOpen = event.notification.data.url || '/';
    
    // Append action param if it was a specific action button click
    if (event.action === 'go_online') {
        urlToOpen += (urlToOpen.includes('?') ? '&' : '?') + 'action=go_online';
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            // Check if there is already a window open with this URL
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url.includes(urlToOpen.split('?')[0]) && 'focus' in client) {
                    // Navigate to the specific URL with params if needed
                    if (event.action === 'go_online') {
                        return client.navigate(urlToOpen).then(c => c.focus());
                    }
                    return client.focus();
                }
            }
            // If no window is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
