export interface User {
    id: string;
    name: string;
    email: string;
    teamId?: string;
}

export interface Team {
    id: string;
    name: string;
    points: number;
    membersCount: number;
    motto?: string;
    imageUrl?: string;
    participants?: any[];
}

export interface Activity {
    id: string;
    userId: string;
    teamId: string;
    type: string;
    energy: number;
    photoUrl?: string;
    createdAt: string;
}

// Типы для ответов API
export interface LoginResponse {
    token: string;
    user: User;
}