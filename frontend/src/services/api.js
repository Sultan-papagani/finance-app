const BASE_URL = 'http://localhost:3000';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: token } : {};
};

export const apiGet = async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Sunucu hatası: ${res.status}`);
    }
    return res.json();
};

export const apiPatch = async (path, data) => {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Sunucu hatası: ${res.status}`);
    }
    return res.json();
};
