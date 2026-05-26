import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    // 1. Initial Load: Fetch history from MongoDB
    const fetchNotifications = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/notifications');
            const data = await res.json();
            // Format DB `_id` to `id` and `createdAt` to `time` for the UI
            const formattedData = data.map(n => ({
                id: n._id,
                type: n.type,
                title: n.title,
                message: n.message,
                time: new Date(n.createdAt),
                read: n.read
            }));
            setNotifications(formattedData);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // 2. Real-time Socket Connection
    useEffect(() => {
        const socket = io('http://localhost:5001');

        socket.on('newIncident', async (incident) => {
            const newNotifPayload = {
                type: incident.source === 'UiPath Bot' || incident.source === 'uipath-google-drive' ? 'bot' : 'incident',
                title: 'New Incident Logged',
                message: `Ticket ${incident.ticketId} was created via ${incident.source}.`
            };

            try {
                // Save it permanently to the database
                const res = await fetch('http://localhost:5001/api/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newNotifPayload)
                });

                const savedDbNotif = await res.json();

                // Instantly show it in the UI
                const newUiNotif = {
                    id: savedDbNotif._id,
                    type: savedDbNotif.type,
                    title: savedDbNotif.title,
                    message: savedDbNotif.message,
                    time: new Date(savedDbNotif.createdAt),
                    read: savedDbNotif.read
                };

                setNotifications(prev => [newUiNotif, ...prev]);
            } catch (err) {
                console.error("Failed to save notification:", err);
            }
        });

        return () => socket.disconnect();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    // 3. Database Sync Methods
    const markAsRead = async (id) => {
        try {
            await fetch(`http://localhost:5001/api/notifications/${id}/read`, { method: 'PUT' });
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) { console.error("Error marking read", err); }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('http://localhost:5001/api/notifications/read-all', { method: 'PUT' });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) { console.error("Error marking all read", err); }
    };

    const clearAll = async () => {
        try {
            await fetch('http://localhost:5001/api/notifications', { method: 'DELETE' });
            setNotifications([]);
        } catch (err) { console.error("Error clearing notifications", err); }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);