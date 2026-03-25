const BASE_URL = 'http://localhost:3000';

// Token'ı her seferinde taze olarak localStorage'dan çeken yardımcı fonksiyon
const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = token; // Token varsa direkt ekle
    }
    
    return headers;
};

export const apiGet = async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'GET',
        headers: getHeaders(), // Sadece fonksiyonu çağırdık
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
        headers: getHeaders(), // Burada da aynısı!
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Sunucu hatası: ${res.status}`);
    }
    return res.json();
};

export const apiPost = async (path, data) => {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: getHeaders(), // Token'ı sorunsuz alacak!
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Sunucu hatası: ${res.status}`);
    }
    return res.json();
};