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

    // Persistencia y Sincronización Inter-pestañas y Cloud
    const fetchGlobalSettings = async () => {
        try {
            const url = window.location.hostname === 'localhost' ? 'http://localhost:3001/api/system/settings' : '/api/system/settings';
            const resp = await fetch(url);
            if (resp.ok) {
                const data = await resp.json();
                if (data.killSwitch !== undefined) setGlobalKillSwitch(data.killSwitch);
                if (data.broadcastMessage !== undefined) setBroadcastMessage(data.broadcastMessage);
            }
        } catch (err) {}
    };

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'sa_kill_switch') setGlobalKillSwitch(e.newValue === 'true');
            if (e.key === 'sa_broadcast_msg') setBroadcastMessage(e.newValue || '');
        };

        const interval = setInterval(fetchGlobalSettings, 10000); // Polling cada 10s para máxima respuesta

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', fetchGlobalSettings);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', fetchGlobalSettings);
            clearInterval(interval);
        };
    }, []);

    const updateKillSwitch = async (val) => {
        setGlobalKillSwitch(val);
        try {
            const url = window.location.hostname === 'localhost' ? 'http://localhost:3001/api/superadmin/settings' : '/api/superadmin/settings';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ killSwitch: val })
            });
        } catch (err) {
            console.error('Error syncing kill switch:', err);
        }
    };

    const updateBroadcast = async (msg) => {
        setBroadcastMessage(msg);
        try {
            const url = window.location.hostname === 'localhost' ? 'http://localhost:3001/api/superadmin/settings' : '/api/superadmin/settings';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ broadcastMessage: msg })
            });
        } catch (err) {
            console.error('Error syncing broadcast:', err);
        }
    };

    useEffect(() => {
        // 1. CARGA INMEDIATA DE SETTINGS (No requiere token)
        fetchGlobalSettings();

        // 2. VALIDACIÓN DE TOKEN SA (Si existe)
        const savedToken = localStorage.getItem('sa_token');
        if (savedToken && !initialized.current) {
            initialized.current = true;
            
            const validateToken = async () => {
                try {
                    const url = window.location.hostname === 'localhost' ? 'http://localhost:3001/api/superadmin/me' : '/api/superadmin/me';
                    const resp = await fetch(url, {
                        headers: {
                            'Authorization': `Bearer ${savedToken}`,
                            'Content-Type': 'application/json'
                        }
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
                    setIsLoading(false);
                }
            };
            validateToken();
        } else {
            setIsLoading(false);
        }
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
