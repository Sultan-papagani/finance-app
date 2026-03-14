import { apiGet, apiPatch } from './api';

export const fetchFinances = () => apiGet('/api/user/finances');

export const fetchGoals = async () => {
    const data = await fetchFinances();
    return data.goals || [];
};

export const fetchGoalById = async (id) => {
    const goals = await fetchGoals();
    const goal = goals.find(g => g.id === parseInt(id));
    if (!goal) throw new Error('Hedef bulunamadı');
    return goal;
};

export const saveGoals = (goals) => apiPatch('/api/user/finances', { goals });

export const fetchPayments = async () => {
    const data = await fetchFinances();
    return data.payments || [];
};

export const savePayments = (payments) => apiPatch('/api/user/finances', { payments });
