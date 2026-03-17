import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const planFeatures = {
    // 🏪 Iubel Pyme: Negocios Locales / Startups
    pyme: [
        'dashboard', 'core_facturacion', 'core_caja', 'core_contactos', 
        'core_inventario', 'enterprise_reportes'
    ],
    // 🏢 Iubel Corporate: Grandes Industrias / Corporaciones
    corporate: [
        'dashboard', 'core_facturacion', 'core_caja', 'core_contactos', 
        'core_inventario', 'core_compras', 'core_contabilidad', 
        'core_banca', 'core_fiscal', 'enterprise_reportes', 
        'enterprise_rrhh', 'enterprise_activos', 'enterprise_auditoria', 
        'ai_copilot'
    ],
    // 🤝 Iubel Cooperativa: Entidades de Ahorro y Crédito
    cooperativa: [
        'dashboard', 'core_facturacion', 'core_caja', 'core_contactos', 
        'core_inventario', 'core_compras', 'core_contabilidad', 
        'core_banca', 'core_fiscal', 'core_prestamos', 'core_socios',
        'enterprise_reportes', 'enterprise_rrhh', 'enterprise_activos', 
        'enterprise_auditoria', 'ai_copilot', 'fintech_sovereign'
    ],
    // 🏦 Iubel Bank & Fintech (VIP): Entidades Financieras Elite
    fintech: 'all'
};


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [empresa, setEmpresa] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);
    const initialized = useRef(false);

    const refreshAuth = async () => {
        const savedToken = sessionStorage.getItem('iubel_token');
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

        const plan = (empresa.plan || 'pyme').toLowerCase().trim();
        const features = empresa.features || {};

        // 0. Sovereign Global Access (VIP Upgrade)
        if (featureId === 'sovereign') return true;

        // 1. PRIORIDAD ABSOLUTA: Explicit Feature Toggle (SuperAdmin Control)
        if (features[featureId] !== undefined) {
            return !!features[featureId];
        }

        // 2. FALLBACK: Plan Inheritance
        if (planFeatures.fintech === 'all' && plan === 'fintech') return true;
        if (plan === 'fintech') return true;

        const allowed = planFeatures[plan] || planFeatures.pyme || [];
        return allowed.includes(featureId);
    };

    useEffect(() => {
        // Only run once on mount
        if (initialized.current) return;
        initialized.current = true;

        const savedToken = sessionStorage.getItem('iubel_token');

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
                    sessionStorage.removeItem('iubel_token');
                }
            } catch {
                // Network error or timeout → clear token to force re-login
                sessionStorage.removeItem('iubel_token');
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
        sessionStorage.removeItem('iubel_token');
        // Wipe any residual cached data so next login starts fresh
        const keysToRemove = Object.keys(sessionStorage).filter(k => k !== 'iubel_token');
        keysToRemove.forEach(k => sessionStorage.removeItem(k));
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
        
        // ACTUALIZACIÓN INMEDIATA DEL ESTADO (ELITE SYNC)
        const { token: newToken, user: newUser, empresa: newEmpresa } = result.data;
        sessionStorage.setItem('iubel_token', newToken);
        setToken(newToken);
        setUser(newUser);
        setEmpresa(newEmpresa);
        
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
