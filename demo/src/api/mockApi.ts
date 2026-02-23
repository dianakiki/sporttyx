import {
  mockUser,
  mockTeams,
  mockActivities,
  mockEvents,
  mockNotifications,
  mockTeamMembers,
  mockActivityTypes
} from '../mockData/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  auth: {
    login: async (username: string, password: string) => {
      await delay(500);
      return {
        token: 'demo-token-12345',
        user: mockUser
      };
    },
    register: async (data: any) => {
      await delay(500);
      return {
        token: 'demo-token-12345',
        user: { ...mockUser, ...data }
      };
    },
    getCurrentUser: async () => {
      await delay(300);
      return mockUser;
    }
  },

  participants: {
    getProfile: async (id: number) => {
      await delay(300);
      return mockUser;
    },
    updateProfile: async (id: number, data: any) => {
      await delay(500);
      return { ...mockUser, ...data };
    },
    getActivities: async (id: number) => {
      await delay(300);
      return mockActivities.filter(a => a.participantId === id);
    }
  },

  teams: {
    getAll: async () => {
      await delay(300);
      return mockTeams;
    },
    getById: async (id: number) => {
      await delay(300);
      return mockTeams.find(t => t.id === id) || mockTeams[0];
    },
    getMembers: async (id: number) => {
      await delay(300);
      return mockTeamMembers;
    },
    create: async (data: any) => {
      await delay(500);
      return {
        id: 99,
        ...data,
        captainId: mockUser.id,
        totalPoints: 0,
        memberCount: 1,
        createdAt: new Date().toISOString()
      };
    },
    update: async (id: number, data: any) => {
      await delay(500);
      const team = mockTeams.find(t => t.id === id) || mockTeams[0];
      return { ...team, ...data };
    },
    join: async (teamId: number) => {
      await delay(500);
      return { success: true, message: 'Успешно присоединились к команде' };
    },
    leave: async (teamId: number) => {
      await delay(500);
      return { success: true, message: 'Вы покинули команду' };
    }
  },

  activities: {
    getAll: async () => {
      await delay(300);
      return mockActivities;
    },
    getById: async (id: number) => {
      await delay(300);
      return mockActivities.find(a => a.id === id) || mockActivities[0];
    },
    create: async (data: any) => {
      await delay(500);
      return {
        id: 99,
        ...data,
        participantId: mockUser.id,
        participant: mockUser,
        status: 'PENDING',
        points: 0,
        reactions: [],
        comments: [],
        createdAt: new Date().toISOString()
      };
    },
    update: async (id: number, data: any) => {
      await delay(500);
      const activity = mockActivities.find(a => a.id === id) || mockActivities[0];
      return { ...activity, ...data };
    },
    delete: async (id: number) => {
      await delay(500);
      return { success: true };
    },
    addReaction: async (id: number, reactionType: string) => {
      await delay(300);
      return {
        id: Math.random(),
        participantId: mockUser.id,
        reactionType
      };
    },
    removeReaction: async (id: number, reactionId: number) => {
      await delay(300);
      return { success: true };
    },
    addComment: async (id: number, text: string) => {
      await delay(500);
      return {
        id: Math.random(),
        participantId: mockUser.id,
        text,
        createdAt: new Date().toISOString(),
        participant: mockUser
      };
    }
  },

  events: {
    getAll: async () => {
      await delay(300);
      return mockEvents;
    },
    getById: async (id: number) => {
      await delay(300);
      return mockEvents.find(e => e.id === id) || mockEvents[0];
    },
    create: async (data: any) => {
      await delay(500);
      return {
        id: 99,
        ...data,
        createdBy: mockUser.id,
        currentParticipants: 0,
        status: 'UPCOMING',
        createdAt: new Date().toISOString()
      };
    },
    join: async (id: number) => {
      await delay(500);
      return { success: true, message: 'Вы зарегистрированы на мероприятие' };
    },
    leave: async (id: number) => {
      await delay(500);
      return { success: true, message: 'Вы отменили регистрацию' };
    },
    getParticipants: async (id: number) => {
      await delay(300);
      return mockTeamMembers.slice(0, 3);
    }
  },

  notifications: {
    getAll: async () => {
      await delay(300);
      return mockNotifications;
    },
    markAsRead: async (id: number) => {
      await delay(300);
      return { success: true };
    },
    markAllAsRead: async () => {
      await delay(300);
      return { success: true };
    }
  },

  activityTypes: {
    getAll: async () => {
      await delay(200);
      return mockActivityTypes;
    }
  },

  admin: {
    getPendingActivities: async () => {
      await delay(300);
      return mockActivities.map(a => ({ ...a, status: 'PENDING' }));
    },
    approveActivity: async (id: number) => {
      await delay(500);
      return { success: true };
    },
    rejectActivity: async (id: number, reason: string) => {
      await delay(500);
      return { success: true };
    },
    getAllUsers: async () => {
      await delay(300);
      return [mockUser, ...mockTeamMembers];
    },
    updateUser: async (id: number, data: any) => {
      await delay(500);
      return { success: true };
    }
  }
};

export default mockApi;
