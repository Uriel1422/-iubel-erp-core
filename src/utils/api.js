const isLocal = window.location.hostname === 'localhost';
const BASE_URL = isLocal ? 'http://localhost:3001/api' : '/api';

const getToken = () => localStorage.getItem('iubel_token');

const authHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

export const api = {
    get: async (entity) => {
        try {
            const resp = await fetch(`${BASE_URL}/${entity}`, {
                headers: authHeaders()
            });
            if (resp.status === 401) return [];
            return await resp.json();
        } catch (e) {
            console.error(`Error GET ${entity}:`, e);
            return [];
        }
    },
    save: async (entity, data) => {
        try {
            const resp = await fetch(`${BASE_URL}/${entity}`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(data)
            });
            if (resp.status === 401) return { success: false, error: 'unauthorized' };
            return await resp.json();
        } catch (e) {
            console.error(`Error POST ${entity}:`, e);
            return { success: false };
        }
    },
    post: async (path, data) => {
        try {
            const isExternal = path.startsWith('http');
            const url = isExternal ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
            const resp = await fetch(url, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(data)
            });
            const json = await resp.json();
            return { ok: resp.ok, status: resp.status, ...json };
        } catch (e) {
            console.error(`Error POST ${path}:`, e);
            return { ok: false, error: e.message };
        }
    },
    update: async (entity, id, data) => {
        try {
            const resp = await fetch(`${BASE_URL}/${entity}/${id}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(data)
            });
            return await resp.json();
        } catch (e) {
            console.error(`Error PUT ${entity}:`, e);
            return { success: false };
        }
    },
    delete: async (entity, id) => {
        try {
            const resp = await fetch(`${BASE_URL}/${entity}/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            return await resp.json();
        } catch (e) {
            console.error(`Error DELETE ${entity}:`, e);
            return { success: false };
        }
    },
    // Auth-specific calls
    authPost: async (path, data) => {
        const url = isLocal ? `http://localhost:3001${path}` : path;
        try {
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await resp.json();
            return { ok: resp.ok, status: resp.status, data: json };
        } catch (e) {
            return { ok: false, status: 500, data: { error: e.message } };
        }
    },
    authGet: async (path) => {
        const url = isLocal ? `http://localhost:3001${path}` : path;
        try {
            const resp = await fetch(url, {
                headers: authHeaders()
            });
            const json = await resp.json();
            return { ok: resp.ok, status: resp.status, data: json };
        } catch (e) {
            return { ok: false, status: 500, data: { error: e.message } };
        }
    }
};
