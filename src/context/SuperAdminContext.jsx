import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const SuperAdminContext = createContext(null);

export const useSuperAdmin = () => useContext(SuperAdminContext);

export const SuperAdminProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [globalKillSwitch, setGlobalKillSwitch] = useState(() => localStorage.getItem('sa_kill_switch') === 'true');
    const [broadcastMessage, setBroadcastMessage] = useState(() => localStorage.getItem('sa_broadcast_msg') || '');
    const initialized = useRef(false);

    // Persistencia y Sincronización Inter-pestañas
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'sa_kill_switch') {
                setGlobalKillSwitch(e.newValue === 'true');
            }
            if (e.key === 'sa_broadcast_msg') {
                setBroadcastMessage(e.newValue || '');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const updateKillSwitch = (val) => {
        setGlobalKillSwitch(val);
        localStorage.setItem('sa_kill_switch', val);
    };

    const updateBroadcast = (msg) => {
        setBroadcastMessage(msg);
        localStorage.setItem('sa_broadcast_msg', msg);
    };

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const savedToken = localStorage.getItem('sa_token');

        if (!savedToken) {
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, 5000);

        const validateToken = async () => {
            try {
                const url = window.location.hostname === 'localhost' ? 'http://localhost:3001/api/superadmin/me' : '/api/superadmin/me';
                const resp = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${savedToken}`,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                });

                if (resp.ok) {
                    const data = await resp.json();
                    setToken(savedToken);
                    setUser(data.user);
                } else {
                    localStorage.removeItem('sa_token');
                }
            } catch {
                localStorage.removeItem('sa_token');
            } finally {
                clearTimeout(timeout);
                setIsLoading(false);
            }
        };

        validateToken();

        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, []);

    const login = async (email, password) => {
        const url = window.location.hostname === 'localhost' ? 'http://localhost:3001/api/superadmin/login' : '/api/superadmin/login';
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await resp.json();
        if (!resp.ok) {
            throw new Error(data.error || 'Error de autenticación');
        }

        localStorage.setItem('sa_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('sa_token');
        setToken(null);
        setUser(null);
    };

    return (
        <SuperAdminContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token && !!user,
            isLoading,
            login,
            logout,
            globalKillSwitch,
            setGlobalKillSwitch: updateKillSwitch,
            broadcastMessage,
            setBroadcastMessage: updateBroadcast
        }}>
            {children}
        </SuperAdminContext.Provider>
    );
};
