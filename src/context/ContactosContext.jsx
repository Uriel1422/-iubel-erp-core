import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const ContactosContext = createContext();

export const useContactos = () => {
    return useContext(ContactosContext);
};

export const ContactosProvider = ({ children }) => {
    const [contactos, setContactos] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const loadContactos = async () => {
            const data = await api.get('contactos');
            if (data && Array.isArray(data)) {
                setContactos(data);
            }
            setHasLoaded(true);
        };
        loadContactos();
    }, []);

    useEffect(() => {
        if (hasLoaded) {
            api.save('contactos', contactos);
        }
    }, [contactos, hasLoaded]);

    const agregarContacto = (contacto) => {
        const nuevo = { ...contacto, id: Date.now().toString() };
        setContactos([...contactos, nuevo]);
        return nuevo;
    };

    const editarContacto = (id, data) => {
        setContactos(contactos.map(c => c.id === id ? { ...c, ...data } : c));
    };

    const eliminarContacto = (id) => {
        setContactos(contactos.filter(c => c.id !== id));
    };

    return (
        <ContactosContext.Provider value={{
            contactos,
            agregarContacto,
            editarContacto,
            eliminarContacto
        }}>
            {children}
        </ContactosContext.Provider>
    );
};
