import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../services/config';
import toast from 'react-hot-toast';

export const usePushNotifications = (user) => {
    const [permission, setPermission] = useState(Notification.permission);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [isPromptVisible, setIsPromptVisible] = useState(false);

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const registerServiceWorker = useCallback(async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                return registration;
            } catch (err) {
                console.error('Service Worker registration failed:', err);
                return null;
            }
        }
        return null;
    }, []);

    const subscribeToPush = async (sessionId = null) => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            toast.error('Push notifications are not supported in this browser.');
            return;
        }

        const registration = await registerServiceWorker();
        if (!registration) {
            toast.error('Service worker registration failed.');
            return;
        }

        try {
            // Explicitly request permission first
            let currentPermission = Notification.permission;
            if (currentPermission === 'default') {
                currentPermission = await Notification.requestPermission();
            }

            if (currentPermission === 'denied') {
                toast.error('Notification permission denied. Please enable it in your browser settings.');
                setPermission('denied');
                return;
            }

            const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
            const { data } = await axios.get(`${API_URL}/notifications/vapid-public-key`, config);

            if (!data.publicKey) {
                throw new Error('VAPID public key not found');
            }

            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(data.publicKey)
            };

            const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
            
            // Save to backend
            await axios.post(`${API_URL}/notifications/subscribe`, {
                subscription: pushSubscription,
                sessionId: sessionId,
                browser: navigator.userAgent,
                deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
            }, config);

            setSubscription(pushSubscription);
            setIsSubscribed(true);
            setPermission('granted');
            setIsPromptVisible(false);
            toast.success('Notifications enabled!');
        } catch (err) {
            console.error('Failed to subscribe to push notifications:', err);
            if (err.name === 'NotAllowedError') {
                toast.error('Permission denied or window was closed. Please try again.');
            } else {
                toast.error('Could not enable notifications. Please refresh and try again.');
            }
        }
    };

    const checkSubscription = useCallback(async () => {
        if (!('serviceWorker' in navigator)) return;
        
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        
        setSubscription(sub);
        setIsSubscribed(!!sub);
    }, []);

    useEffect(() => {
        if (user) {
            checkSubscription();
            
            // Show prompt if permission is default and user hasn't seen it recently
            if (Notification.permission === 'default') {
                const lastPrompt = localStorage.getItem('last_push_prompt');
                const threeDays = 3 * 24 * 60 * 60 * 1000;
                if (!lastPrompt || Date.now() - parseInt(lastPrompt) > threeDays) {
                    setTimeout(() => setIsPromptVisible(true), 3000);
                }
            }
        }
    }, [user, checkSubscription]);

    const handleLater = () => {
        localStorage.setItem('last_push_prompt', Date.now().toString());
        setIsPromptVisible(false);
    };

    return {
        permission,
        isSubscribed,
        isPromptVisible,
        subscribeToPush,
        handleLater
    };
};
