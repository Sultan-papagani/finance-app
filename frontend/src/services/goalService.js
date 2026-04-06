import { apiGet, apiPatch, apiPost } from './api';

export const fetchFinances = () => apiGet('/api/user/finances');

export const fetchGoals = async () => {
    const data = await fetchFinances();
    return data.goals || [];
};

export const fetchGoalById = async (id) => {
    const goals = await fetchGoals();
    const goal = goals.find(g => g.id.toString() === id.toString());
    if (!goal) throw new Error('Hedef bulunamadı');
    return goal;
};

export const saveGoals = (goals) => apiPatch('/api/user/finances', { goals });

export const fetchPayments = async () => {
    const data = await fetchFinances();
    return data.payments || [];
};

export const savePayments = (payments) => apiPatch('/api/user/finances', { payments });

// =======================================================
// --- YENİ EKLENEN KART VE İŞLEM FONKSİYONLARI ---
// =======================================================

// Tüm kartları getirir
export const fetchCards = () => apiGet('/api/cards');

// Yeni bir kart/hesap oluşturur (name ve initialBalance bekler)
export const createCard = (cardData) => apiPost('/api/cards', cardData);

// Karta yeni bir işlem (gelir/gider) ekler
export const addTransaction = (transactionData) => apiPost('/api/transactions', transactionData);

