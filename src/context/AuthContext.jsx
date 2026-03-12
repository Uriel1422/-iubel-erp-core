import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const planFeatures = {
    basico: ['dashboard', 'contactos', 'facturacion'],
    intermedio: [
        'dashboard', 'contactos', 'facturacion', 'inventario',
        'banking', 'caja', 'compras', 'contabilidad'
    ],
    avanzado: 'all'
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [empresa, setEmpresa] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);
    const initialized = useRef(false);

    const refreshAuth = async () => {
        const savedToken = localStorage.getItem('iubel_token');
        if (!savedToken) return;

        try {
            const url = window.location.hostname === 'localhost' ? 'http://localhost:3001/api/auth/me' : '/api/auth/me';
            const resp = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${savedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (resp.ok) {
                const data = await resp.json();
                setUser(data.user);
                setEmpresa(data.empresa);
            }
        } catch (err) {
            console.error('Error refreshing auth:', err);
        }
    };

    const hasAccess = (featureId) => {
        if (!featureId) return true;
        if (!empresa) return false;

        const plan = (empresa.plan || 'basico').toLowerCase().trim();
        const features = empresa.features || {};

        // Debugging (Remove in production)
        // console.log(`Feature check [${featureId}] for plan [${plan}]`);

        // 1. Explicit Feature Toggle (Add-on)
        if (features[featureId] === true) return true;

        // 2. Plan Inheritance
        if (planFeatures.avanzado === 'all' && (plan === 'avanzado' || plan === 'avanzado')) return true;
        if (plan === 'avanzado') return true;

        const allowed = planFeatures[plan] || [];
        const access = allowed.includes(featureId);

        return access;
    };

    useEffect(() => {
        // Only run once on mount
        if (initialized.current) return;
        initialized.current = true;

        const savedToken = localStorage.getItem('iubel_token');

        if (!savedToken) {
            // No token stored → go straight to login
            setIsLoading(false);
            return;
        }

        // Token exists → validate it with a 5-second timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, 5000);

        const validateToken = async () => {
            try {
                const url = window.location.hostname === 'localhost' ? 'http://localhost:3001/api/auth/me' : '/api/auth/me';
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
                    setEmpresa(data.empresa);
                } else {
                    // Token invalid / expired
                    localStorage.removeItem('iubel_token');
                }
            } catch {
                // Network error or timeout → clear token to force re-login
                localStorage.removeItem('iubel_token');
            } finally {
                clearTimeout(timeout);
                setIsLoading(false);
            }
        };

        validateToken();

        // Add focus listener for "real-time" updates
        window.addEventListener('focus', refreshAuth);

        return () => {
            controller.abort();
            clearTimeout(timeout);
            window.removeEventListener('focus', refreshAuth);
        };
    }, []);

    const clearSession = () => {
        localStorage.removeItem('iubel_token');
        // Wipe any residual cached data so next login starts fresh
        const keysToRemove = Object.keys(localStorage).filter(k => k !== 'iubel_token');
        keysToRemove.forEach(k => localStorage.removeItem(k));
        sessionStorage.clear();
        setToken(null);
        setUser(null);
        setEmpresa(null);
        
        // DISABLE BACK BUTTON
        window.history.pushState(null, '', window.location.href);
        window.onpopstate = function() {
            window.history.pushState(null, '', window.location.href);
        };

        // FORCE RELOAD TO CLEAR ALL CONTEXTS STATE FROM IN-MEMORY AND PREVENT BACK BUTTON
        window.location.replace('/login');
    };

    const login = async (empresaNombre, email, password) => {
        const result = await api.authPost('/api/auth/login', { empresaNombre, email, password });
        if (!result.ok) {
            throw new Error(result.data.error || 'Error de autenticación');
        }
        return result.data;
    };

    const register = async (formData) => {
        const result = await api.authPost('/api/auth/register', formData);
        if (!result.ok) {
            throw new Error(result.data.error || 'Error en el registro');
        }
        return result.data;
    };

    const logout = () => {
        clearSession();
    };

    return (
        <AuthContext.Provider value={{
            user,
            empresa,
            token,
            isAuthenticated: !!token && !!user,
            isLoading,
            login,
            register,
            logout,
            refreshAuth,
            hasAccess
        }}>
            {children}
        </AuthContext.Provider>
    );
};
