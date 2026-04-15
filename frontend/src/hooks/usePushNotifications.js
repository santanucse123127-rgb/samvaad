import { useState, useEffect, useCallback } from 'react';
import { subscribePush } from '../services/chatAPI';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const usePushNotifications = (token) => {
    const [permission, setPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'denied'
    );
    const [isSubscribed, setIsSubscribed] = useState(false);

    const urlBase64ToUint8Array = (base64String) => {
        if (!base64String) return new Uint8Array(0);
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribeUser = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Send subscription to backend
            await subscribePush(subscription, token);

            setIsSubscribed(true);
            console.log('User subscribed to push notifications');
        } catch (error) {
            console.error('Failed to subscribe user:', error);
        }
    }, [token]);

    useEffect(() => {
        if (token && permission === 'granted') {
            subscribeUser();
        }
    }, [token, permission, subscribeUser]);

    const requestPermission = async () => {
        if (typeof Notification === 'undefined') return 'denied';
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
            subscribeUser();
        }
        return result;
    };

    return { permission, isSubscribed, requestPermission };
};
