import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

const defaultSettings = {
    empresa: {
        nombre: 'Iubel Business Group SRL',
        rnc: '131-45678-9',
        telefono: '809-555-1234',
        email: 'info@iubel.com.do',
        direccion: 'Av. Winston Churchill, Santo Domingo, RD',
        moneda: 'DOP',
        logo: '', // Placeholder for URL
    },
    preferencias: {
        modoOscuro: false,
        notificacionesEmail: true,
        idioma: 'es'
    }
};

export const SettingsProvider = ({ children }) => {
    const { empresa } = useAuth();
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        const loadSettings = async () => {
            const data = await api.get('settings');
            if (data && !Array.isArray(data) && Object.keys(data).length > 0) {
                setSettings(data);
            } else if (empresa) {
                // Si la tabla de settings está vacía, inicializar con los datos reales de registro
                const initial = {
                    ...defaultSettings,
                    empresa: {
                        ...defaultSettings.empresa,
                        nombre: empresa.nombre || 'Mi Empresa',
                        rnc: empresa.rnc || '',
                        email: empresa.email || ''
                    }
                };
                setSettings(initial);
                await api.save('settings', initial);
            }
        };
        // Cargar settings una vez que la autenticación o inicialización ocurra
        loadSettings();
    }, [empresa]);

    const updateEmpresa = (data) => {
        setSettings(prev => {
            const updated = { ...prev, empresa: { ...prev.empresa, ...data } };
            api.save('settings', updated);
            return updated;
        });
    };

    const toggleDarkMode = () => {
        setSettings(prev => {
            const updated = { ...prev, preferencias: { ...prev.preferencias, modoOscuro: !prev.preferencias.modoOscuro } };
            api.save('settings', updated);
            return updated;
        });
    };

    return (
        <SettingsContext.Provider value={{
            settings,
            updateEmpresa,
            toggleDarkMode
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
