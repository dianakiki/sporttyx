import { User, Team, Activity, LoginResponse } from '../types';

const DELAY = 800; // имитация задержки сети мс

// Mock DB
const MOCK_USER: User = { id: 'u1', name: 'Alex Dev', email: 'test@app.com', teamId: 't1' };
const MOCK_TEAMS: Team[] = [
    { id: 't1', name: 'Cyber Athletics', points: 1250, membersCount: 5 },
    { id: 't2', name: 'Blue Runners', points: 980, membersCount: 3 },
    { id: 't3', name: 'React Lifters', points: 1400, membersCount: 8 },
];

// Helper для задержки
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
    auth: {
        login: async (email: string, password: string): Promise<LoginResponse> => {
            await wait(DELAY);
            if (email === 'test@app.com' && password === '1234') {
                return { token: 'fake-jwt-token', user: MOCK_USER };
            }
            throw new Error('Неверный логин или пароль');
        },
        register: async (data: any): Promise<LoginResponse> => {
            await wait(DELAY);
            return { token: 'new-token', user: { ...MOCK_USER, name: data.name } };
        }
    },

    teams: {
        getAll: async (): Promise<Team[]> => {
            await wait(DELAY);
            return MOCK_TEAMS.sort((a, b) => b.points - a.points);
        },
        create: async (name: string): Promise<Team> => {
            await wait(DELAY);
            return { id: `t${Date.now()}`, name, points: 0, membersCount: 1 };
        },
        getById: async (id: string): Promise<Team | undefined> => {
            await wait(DELAY);
            return MOCK_TEAMS.find(t => t.id === id);
        }
    },

    activities: {
        create: async (data: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> => {
            await wait(DELAY);
            return {
                id: `a${Date.now()}`,
                createdAt: new Date().toISOString(),
                ...data
            };
        },
        getMyActivities: async (): Promise<Activity[]> => {
            await wait(DELAY);
            return [
                { id: 'a1', userId: 'u1', teamId: 't1', type: 'Бег 5км', energy: 300, createdAt: '2023-10-25' },
                { id: 'a2', userId: 'u1', teamId: 't1', type: 'Вело', energy: 150, createdAt: '2023-10-26' },
            ];
        }
    }
};