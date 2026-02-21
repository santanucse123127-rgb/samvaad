self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/logo192.png',
            badge: '/logo192.png',
            data: data.data,
            vibrate: [100, 50, 100],
            actions: [
                { action: 'open', title: 'Open App' },
                { action: 'close', title: 'Close' }
            ]
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'close') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                        break;
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});
