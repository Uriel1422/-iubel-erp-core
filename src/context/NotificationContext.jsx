import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const loadNotifications = async () => {
            const data = await api.get('notifications');
            if (data && Array.isArray(data) && data.length > 0) {
                setNotifications(data);
            } else {
                const defaultNotifs = [
                    { id: '1', title: '¡Bienvenido!', message: 'Gracias por usar Iubel ERP. El sistema está listo.', type: 'info', read: false, date: new Date().toISOString() }
                ];
                setNotifications(defaultNotifs);
                await api.save('notifications', defaultNotifs);
            }
        };
        loadNotifications();
    }, []);

    useEffect(() => {
        if (notifications.length > 0) {
            api.save('notifications', notifications);
        }
    }, [notifications]);

    const addNotification = (title, message, type = 'info') => {
        const nueva = {
            id: Date.now().toString(),
            title,
            message,
            type,
            read: false,
            date: new Date().toISOString()
        };
        setNotifications(prev => [nueva, ...prev]);
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            markAsRead,
            clearAll,
            unreadCount
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
