import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface CreateEventInvitationRequest {
  eventId: number;
  description?: string;
  maxUses?: number;
  expiresAt?: string;
}

export interface EventInvitationResponse {
  id: number;
  eventId: number;
  eventName: string;
  invitationToken: string;
  invitationUrl: string;
  description?: string;
  maxUses?: number;
  timesUsed: number;
  expiresAt?: string;
  isActive: boolean;
  isExpired: boolean;
  isMaxedOut: boolean;
  createdByName: string;
  createdAt: string;
}

export interface EventInvitationUsageResponse {
  id: number;
  invitationId: number;
  invitationDescription?: string;
  participantId: number;
  participantName: string;
  participantUsername: string;
  ipAddress?: string;
  usedAt: string;
}

export interface EventInvitationStatsResponse {
  eventId: number;
  eventName: string;
  totalInvitations: number;
  activeInvitations: number;
  totalRegistrations: number;
  registrationsByDay: { [key: string]: number };
  invitations: EventInvitationResponse[];
  recentUsages: EventInvitationUsageResponse[];
}

export interface RegisterWithInvitationRequest {
  invitationToken: string;
  username: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const eventInvitationApi = {
  createInvitation: async (request: CreateEventInvitationRequest): Promise<EventInvitationResponse> => {
    const response = await axios.post(`${API_URL}/admin/event-invitations`, request, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateInvitation: async (id: number, request: CreateEventInvitationRequest): Promise<EventInvitationResponse> => {
    const response = await axios.put(`${API_URL}/admin/event-invitations/${id}`, request, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  deactivateInvitation: async (id: number): Promise<void> => {
    await axios.post(`${API_URL}/admin/event-invitations/${id}/deactivate`, {}, {
      headers: getAuthHeader(),
    });
  },

  activateInvitation: async (id: number): Promise<void> => {
    await axios.post(`${API_URL}/admin/event-invitations/${id}/activate`, {}, {
      headers: getAuthHeader(),
    });
  },

  deleteInvitation: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/admin/event-invitations/${id}`, {
      headers: getAuthHeader(),
    });
  },

  getEventInvitations: async (eventId: number): Promise<EventInvitationResponse[]> => {
    const response = await axios.get(`${API_URL}/admin/events/${eventId}/invitations`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getEventInvitationStats: async (eventId: number): Promise<EventInvitationStatsResponse> => {
    const response = await axios.get(`${API_URL}/admin/events/${eventId}/invitation-stats`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getInvitationUsages: async (id: number): Promise<EventInvitationUsageResponse[]> => {
    const response = await axios.get(`${API_URL}/admin/event-invitations/${id}/usages`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getInvitationByToken: async (token: string): Promise<EventInvitationResponse> => {
    const response = await axios.get(`${API_URL}/public/invitation/${token}`);
    return response.data;
  },

  registerWithInvitation: async (request: RegisterWithInvitationRequest): Promise<any> => {
    const response = await axios.post(`${API_URL}/public/register-with-invitation`, request);
    return response.data;
  },
};
