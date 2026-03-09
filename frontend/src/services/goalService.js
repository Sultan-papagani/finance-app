// src/services/goalService.js

const MOCK_GOALS_DB = [
    {
        id: 1,
        title: "MacBook Pro M3",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000",
        targetAmount: 75000,
        currentAmount: 30000,
        contributors: [
            { name: "Ayberk", amount: 20000, avatarColor: "bg-blue-100 text-blue-600" },
            { name: "Ali", amount: 10000, avatarColor: "bg-green-100 text-green-600" },
        ],
        history: [
            { id: 101, user: "Ayberk", action: "Para Eklendi", amount: 1500, date: "10 Mart 2026", time: "14:30" },
            { id: 102, user: "Ali", action: "Para Eklendi", amount: 5000, date: "05 Mart 2026", time: "09:15" },
            { id: 103, user: "Ayberk", action: "Hedef Oluşturuldu", amount: 18500, date: "01 Mart 2026", time: "20:00" },
        ]
    },
    {
        id: 2,
        title: "Karadağ Yaz Tatili",
        image: "https://images.unsplash.com/photo-1555885234-a169fa138e6e?auto=format&fit=crop&q=80&w=1000",
        targetAmount: 25000,
        currentAmount: 5000,
        contributors: [
            { name: "Ayberk", amount: 5000, avatarColor: "bg-blue-100 text-blue-600" },
        ],
        history: [
            { id: 201, user: "Ayberk", action: "Para Eklendi", amount: 5000, date: "08 Mart 2026", time: "11:20" },
        ]
    }
];

export const fetchGoals = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_GOALS_DB);
        }, 800);
    });
};

export const fetchGoalById = (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const goal = MOCK_GOALS_DB.find(g => g.id === parseInt(id));
            if (goal) resolve(goal);
            else reject(new Error("Hedef bulunamadı"));
        }, 600);
    });
};