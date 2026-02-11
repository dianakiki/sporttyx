import axiosInstance from './axiosConfig';
import { User, Team, Activity, LoginResponse } from '../types';

export const api = {
  auth: {
    login: async (username: string, password: string): Promise<LoginResponse> => {
      const response = await axiosInstance.post('/auth/login', { username, password });
      const { token, userId, username: user, name } = response.data;
      
      localStorage.setItem('token', token);
      
      const userData: User = {
        id: userId.toString(),
        name: name,
        email: username,
        teamId: undefined
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { token, user: userData };
    },

    register: async (data: { username: string; password: string; name: string }): Promise<LoginResponse> => {
      const response = await axiosInstance.post('/auth/register', data);
      const { token, userId, username, name } = response.data;
      
      localStorage.setItem('token', token);
      
      const userData: User = {
        id: userId.toString(),
        name: name,
        email: username,
        teamId: undefined
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { token, user: userData };
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  participants: {
    getById: async (id: number) => {
      const response = await axiosInstance.get(`/participants/${id}`);
      return response.data;
    },

    update: async (id: number, data: any) => {
      const response = await axiosInstance.put(`/participants/${id}`, data);
      return response.data;
    },

    delete: async (id: number) => {
      await axiosInstance.delete(`/participants/${id}`);
    },

    search: async (query: string) => {
      const response = await axiosInstance.get(`/participants/search`, {
        params: { query }
      });
      return response.data;
    },

    getInvitations: async (participantId: number) => {
      const response = await axiosInstance.get(`/participants/${participantId}/invitations`);
      return response.data;
    }
  },

  teams: {
    getAll: async (): Promise<Team[]> => {
      const response = await axiosInstance.get('/teams');
      return response.data.map((team: any) => ({
        id: team.id.toString(),
        name: team.name,
        points: 0,
        membersCount: 0
      }));
    },

    getById: async (id: string): Promise<Team | undefined> => {
      try {
        const response = await axiosInstance.get(`/teams/${id}`);
        const data = response.data;
        return {
          id: data.id.toString(),
          name: data.name,
          points: data.totalPoints || 0,
          membersCount: data.participants?.length || 0,
          motto: data.motto,
          imageUrl: data.imageUrl,
          participants: data.participants
        };
      } catch (error) {
        return undefined;
      }
    },

    create: async (data: { name: string; motto?: string; participantIds?: number[] }): Promise<Team> => {
      const response = await axiosInstance.post('/teams', data);
      return {
        id: response.data.id.toString(),
        name: response.data.name,
        points: 0,
        membersCount: 1
      };
    },

    update: async (id: number, data: any) => {
      const response = await axiosInstance.put(`/teams/${id}`, data);
      return response.data;
    },

    delete: async (id: number) => {
      await axiosInstance.delete(`/teams/${id}`);
    },

    leave: async (teamId: number) => {
      const response = await axiosInstance.post(`/teams/${teamId}/leave`);
      return response.data;
    },

    getParticipants: async (teamId: number) => {
      const response = await axiosInstance.get(`/teams/${teamId}/participants`);
      return response.data;
    },

    getRankings: async () => {
      const response = await axiosInstance.get('/teams/rankings');
      return response.data;
    },

    invite: async (teamId: number, participantId: number) => {
      const response = await axiosInstance.post(`/teams/${teamId}/invite`, { participantId });
      return response.data;
    }
  },

  activities: {
    getTeamActivities: async (teamId: string): Promise<Activity[]> => {
      const response = await axiosInstance.get(`/teams/${teamId}/activities`);
      return response.data.map((activity: any) => ({
        id: activity.id.toString(),
        userId: activity.participantId?.toString() || '',
        teamId: teamId,
        type: activity.type,
        energy: activity.energy,
        createdAt: activity.createdAt,
        photoUrl: activity.photoUrl,
        participantName: activity.participantName
      }));
    },

    create: async (data: {
      teamId: number;
      participantId: number;
      type: string;
      energy: number;
      photo?: File;
    }): Promise<Activity> => {
      const formData = new FormData();
      formData.append('teamId', data.teamId.toString());
      formData.append('participantId', data.participantId.toString());
      formData.append('type', data.type);
      formData.append('energy', data.energy.toString());
      
      if (data.photo) {
        formData.append('photo', data.photo);
      }

      const response = await axiosInstance.post('/activities', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        id: response.data.id.toString(),
        userId: data.participantId.toString(),
        teamId: data.teamId.toString(),
        type: response.data.type,
        energy: response.data.energy,
        createdAt: response.data.createdAt
      };
    },

    getMyActivities: async (): Promise<Activity[]> => {
      return [];
    }
  },

  invitations: {
    accept: async (invitationId: number) => {
      const response = await axiosInstance.post(`/invitations/${invitationId}/accept`);
      return response.data;
    },

    decline: async (invitationId: number) => {
      const response = await axiosInstance.post(`/invitations/${invitationId}/decline`);
      return response.data;
    }
  }
};
