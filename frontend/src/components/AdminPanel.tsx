import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, HelpCircle, Eye, EyeOff, Plus, X, ChevronRight, Trash2, Edit, Search, Key, Bug, CheckCircle, XCircle, Clock, Award, UserPlus, Bell, Send } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import { translateStatus, translateRole, translateDashboardType } from '../utils/translations';
import { Select } from './ui/Select';
import { ActivityTypeModal, ActivityTypeFormData } from './ActivityTypeModal';

interface Participant {
    id: number;
    username: string;
    name: string;
    email: string;
    phone: string;
    role: string;
}

interface Team {
    id: number;
    name: string;
    event?: { id: number; name: string };
}

interface ActivityType {
    id: number;
    name: string;
    defaultEnergy: number;
    event?: { id: number; name: string };
}

interface EventListItem {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    displayOnHomepage: boolean;
    dashboardTypes: string[];
    dashboardOrder?: string[];
    teamBasedCompetition?: boolean;
    requiresActivityApproval?: boolean;
}

export const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'events' | 'users' | 'bug-reports'>('events');
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEventId, setEditingEventId] = useState<number | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
    const [draggedDashboardIndex, setDraggedDashboardIndex] = useState<number | null>(null);
    const [showActivityTypeModal, setShowActivityTypeModal] = useState(false);
    const [editingActivityType, setEditingActivityType] = useState<ActivityTypeFormData | null>(null);
    
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const [events, setEvents] = useState<EventListItem[]>([]);
    const [bugReports, setBugReports] = useState<any[]>([]);
    const [bugSearchQuery, setBugSearchQuery] = useState('');
    const [bugStatusFilter, setBugStatusFilter] = useState<string>('ALL');
    const [bugSortBy, setBugSortBy] = useState<'newest' | 'oldest'>('newest');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEventId, setInviteEventId] = useState<number | null>(null);
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notification, setNotification] = useState({
        title: '',
        message: '',
        recipientType: 'ALL',
        participantIds: [] as number[]
    });
    const [notificationSuccess, setNotificationSuccess] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [eventDetailTab, setEventDetailTab] = useState<'settings' | 'teams' | 'activities' | 'notifications'>('settings');
    
    const [newParticipant, setNewParticipant] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        phone: '',
        role: 'USER'
    });
    
    const [newTeam, setNewTeam] = useState({
        name: '',
        motto: '',
        imageUrl: '',
        eventId: null as number | null
    });
    
    const [newActivityType, setNewActivityType] = useState({
        name: '',
        description: '',
        defaultEnergy: 0,
        eventId: null as number | null
    });
    
    const [newEvent, setNewEvent] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'DRAFT',
        visibility: 'PUBLIC',
        requiresActivityApproval: false,
        artifactsRequired: false,
        activityBlockingEnabled: false,
        activityBlockingDays: 1,
        maxTeams: '',
        maxParticipants: '',
        pointsMultiplier: '1.0',
        notificationsEnabled: true,
        displayOnHomepage: false,
        teamBasedCompetition: true,
        dashboardTypes: [] as string[],
        dashboardOrder: [] as string[],
        eventAdminIds: [] as number[]
    });

    useEffect(() => {
        fetchData();
    }, [activeTab, selectedEventId]);

    const fetchData = async () => {
        try {
            if (activeTab === 'users') {
                const response = await axiosInstance.get('/admin/participants');
                setParticipants(response.data);
            } else if (activeTab === 'events') {
                const eventsResponse = await axiosInstance.get('/admin/events');
                setEvents(eventsResponse.data);
                
                if (selectedEventId) {
                    // Загружаем команды и типы активностей для выбранного мероприятия
                    const teamsResponse = await axiosInstance.get('/admin/teams');
                    const activitiesResponse = await axiosInstance.get('/api/activity-types');
                    const participantsResponse = await axiosInstance.get('/admin/participants');
                    setTeams(teamsResponse.data);
                    setActivityTypes(activitiesResponse.data);
                    setParticipants(participantsResponse.data);
                }
            } else if (activeTab === 'bug-reports') {
                const response = await axiosInstance.get('/admin/bug-reports');
                setBugReports(response.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleCreateParticipant = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUserId) {
                await axiosInstance.put(`/admin/participants/${editingUserId}`, newParticipant);
            } else {
                await axiosInstance.post('/admin/participants', newParticipant);
            }
            setNewParticipant({ username: '', password: '', name: '', email: '', phone: '', role: 'USER' });
            setShowUserModal(false);
            setEditingUserId(null);
            fetchData();
        } catch (error) {
            console.error('Error creating/updating participant:', error);
        }
    };

    const handleEditParticipant = (participant: Participant) => {
        setEditingUserId(participant.id);
        setNewParticipant({
            username: participant.username,
            password: '',
            name: participant.name,
            email: participant.email || '',
            phone: participant.phone || '',
            role: participant.role
        });
        setShowUserModal(true);
    };

    const handleResetPassword = async (id: number) => {
        setResetPasswordUserId(id);
        setShowResetPasswordModal(true);
    };

    const confirmResetPassword = async () => {
        if (resetPasswordUserId) {
            try {
                await axiosInstance.post(`/admin/participants/${resetPasswordUserId}/reset-password`);
                setResetPasswordSuccess(true);
            } catch (error) {
                console.error('Error resetting password:', error);
            }
        }
    };

    const closeResetPasswordModal = () => {
        setShowResetPasswordModal(false);
        setResetPasswordSuccess(false);
        setResetPasswordUserId(null);
    };

    const handleDeleteParticipant = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                await axiosInstance.delete(`/admin/participants/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting participant:', error);
            }
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const teamData = { ...newTeam, eventId: selectedEventId };
            await axiosInstance.post('/admin/teams', teamData);
            setNewTeam({ name: '', motto: '', imageUrl: '', eventId: null });
            fetchData();
        } catch (error) {
            console.error('Error creating team:', error);
        }
    };

    const handleDeleteTeam = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить эту команду?')) {
            try {
                await axiosInstance.delete(`/admin/teams/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting team:', error);
            }
        }
    };

    const handleCreateActivityType = async (data: ActivityTypeFormData) => {
        const activityData = { ...data, eventId: selectedEventId };
        if (data.id) {
            await axiosInstance.put(`/activity-types/${data.id}`, activityData);
        } else {
            await axiosInstance.post('/activity-types', activityData);
        }
        setEditingActivityType(null);
        fetchData();
    };

    const handleEditActivityType = async (activityType: ActivityType) => {
        try {
            const response = await axiosInstance.get(`/activity-types/${activityType.id}`);
            const fullData = response.data;
            setEditingActivityType({
                id: fullData.id,
                name: fullData.name,
                description: fullData.description || '',
                defaultEnergy: fullData.defaultEnergy,
                eventId: selectedEventId
            });
            setShowActivityTypeModal(true);
        } catch (error) {
            console.error('Error loading activity type:', error);
            setEditingActivityType({
                id: activityType.id,
                name: activityType.name,
                description: '',
                defaultEnergy: activityType.defaultEnergy,
                eventId: selectedEventId
            });
            setShowActivityTypeModal(true);
        }
    };

    const handleDeleteActivityType = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этот тип активности?')) {
            try {
                await axiosInstance.delete(`/activity-types/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting activity type:', error);
            }
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const eventData = {
                ...newEvent,
                maxTeams: newEvent.maxTeams ? parseInt(newEvent.maxTeams) : null,
                maxParticipants: newEvent.maxParticipants ? parseInt(newEvent.maxParticipants) : null,
                pointsMultiplier: parseFloat(newEvent.pointsMultiplier),
                activityBlockingDays: newEvent.activityBlockingEnabled ? newEvent.activityBlockingDays : null,
            };
            
            if (editingEventId) {
                await axiosInstance.put(`/admin/events/${editingEventId}`, eventData);
            } else {
                await axiosInstance.post('/admin/events', eventData);
            }
            
            setNewEvent({
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                status: 'DRAFT',
                visibility: 'PUBLIC',
                requiresActivityApproval: false,
                artifactsRequired: false,
                activityBlockingEnabled: false,
                activityBlockingDays: 1,
                maxTeams: '',
                maxParticipants: '',
                pointsMultiplier: '1.0',
                notificationsEnabled: true,
                displayOnHomepage: false,
                teamBasedCompetition: true,
                dashboardTypes: [],
                dashboardOrder: [],
                eventAdminIds: []
            });
            setShowEventModal(false);
            setEditingEventId(null);
            fetchData();
        } catch (error) {
            console.error('Error creating/updating event:', error);
        }
    };

    const handleDeleteEvent = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
            try {
                await axiosInstance.delete(`/admin/events/${id}`);
                if (selectedEventId === id) {
                    setSelectedEventId(null);
                }
                fetchData();
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    };

    const handleToggleDisplayOnHomepage = async (id: number, currentState: boolean) => {
        try {
            if (currentState) {
                await axiosInstance.post(`/admin/events/${id}/hide`);
            } else {
                await axiosInstance.post(`/admin/events/${id}/display`);
            }
            fetchData();
        } catch (error) {
            console.error('Error toggling display on homepage:', error);
        }
    };

    const handleDashboardTypeToggle = (type: string) => {
        setNewEvent(prev => {
            const newTypes = prev.dashboardTypes.includes(type)
                ? prev.dashboardTypes.filter(t => t !== type)
                : [...prev.dashboardTypes, type];
            
            // Обновляем dashboardOrder: удаляем тип если он был убран, добавляем в конец если добавлен
            let newOrder = prev.dashboardOrder.filter(t => newTypes.includes(t));
            if (!prev.dashboardTypes.includes(type) && newTypes.includes(type)) {
                newOrder.push(type);
            }
            
            return {
                ...prev,
                dashboardTypes: newTypes,
                dashboardOrder: newOrder
            };
        });
    };

    const moveDashboardUp = (index: number) => {
        if (index === 0) return;
        setNewEvent(prev => {
            const newOrder = [...prev.dashboardOrder];
            [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
            return { ...prev, dashboardOrder: newOrder };
        });
    };

    const moveDashboardDown = (index: number) => {
        setNewEvent(prev => {
            if (index === prev.dashboardOrder.length - 1) return prev;
            const newOrder = [...prev.dashboardOrder];
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
            return { ...prev, dashboardOrder: newOrder };
        });
    };

    const handleDragStart = (index: number) => {
        setDraggedDashboardIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedDashboardIndex === null || draggedDashboardIndex === dropIndex) return;

        setNewEvent(prev => {
            const newOrder = [...prev.dashboardOrder];
            const draggedItem = newOrder[draggedDashboardIndex];
            newOrder.splice(draggedDashboardIndex, 1);
            newOrder.splice(dropIndex, 0, draggedItem);
            return { ...prev, dashboardOrder: newOrder };
        });
        setDraggedDashboardIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedDashboardIndex(null);
    };

    const handleInviteParticipants = async () => {
        if (!inviteEventId || selectedParticipants.length === 0) {
            alert('Выберите хотя бы одного участника');
            return;
        }
        
        try {
            await axiosInstance.post('/admin/events/invite', {
                eventId: inviteEventId,
                participantIds: selectedParticipants
            });
            setShowInviteModal(false);
            setSelectedParticipants([]);
            setInviteEventId(null);
            alert('Приглашения успешно отправлены!');
        } catch (error) {
            console.error('Error inviting participants:', error);
            alert('Ошибка при отправке приглашений');
        }
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEventId) return;
        
        if (notification.recipientType === 'SPECIFIC' && notification.participantIds.length === 0) {
            alert('Выберите хотя бы одного участника');
            return;
        }
        
        try {
            const response = await axiosInstance.post('/notifications/admin/send', {
                eventId: selectedEventId,
                title: notification.title,
                message: notification.message,
                recipientType: notification.recipientType,
                participantIds: notification.recipientType === 'SPECIFIC' ? notification.participantIds : []
            });
            
            setNotificationCount(response.data.count);
            setNotificationSuccess(true);
            
            setTimeout(() => {
                setShowNotificationModal(false);
                setNotificationSuccess(false);
                setNotification({
                    title: '',
                    message: '',
                    recipientType: 'ALL',
                    participantIds: []
                });
            }, 2000);
        } catch (error) {
            console.error('Error sending notifications:', error);
            alert('Ошибка при отправке уведомлений');
        }
    };

    const toggleParticipantSelection = (participantId: number) => {
        setNotification(prev => ({
            ...prev,
            participantIds: prev.participantIds.includes(participantId)
                ? prev.participantIds.filter(id => id !== participantId)
                : [...prev.participantIds, participantId]
        }));
    };

    const handleEditEvent = async (event: EventListItem) => {
        setEditingEventId(event.id);
        
        // Загружаем полную информацию о мероприятии
        try {
            const response = await axiosInstance.get(`/events/${event.id}`);
            const fullEvent = response.data;
            
            setNewEvent({
                name: fullEvent.name,
                description: fullEvent.description || '',
                startDate: fullEvent.startDate,
                endDate: fullEvent.endDate,
                status: fullEvent.status,
                visibility: fullEvent.visibility || 'PUBLIC',
                requiresActivityApproval: fullEvent.requiresActivityApproval || false,
                artifactsRequired: fullEvent.artifactsRequired || false,
                activityBlockingEnabled: fullEvent.activityBlockingEnabled || false,
                activityBlockingDays: fullEvent.activityBlockingDays || 1,
                maxTeams: fullEvent.maxTeams?.toString() || '',
                maxParticipants: fullEvent.maxParticipants?.toString() || '',
                pointsMultiplier: fullEvent.pointsMultiplier?.toString() || '1.0',
                notificationsEnabled: fullEvent.notificationsEnabled !== false,
                displayOnHomepage: fullEvent.displayOnHomepage || false,
                teamBasedCompetition: fullEvent.teamBasedCompetition !== false,
                dashboardTypes: fullEvent.dashboardTypes || [],
                dashboardOrder: (fullEvent.dashboardOrder && fullEvent.dashboardOrder.length > 0) 
                    ? fullEvent.dashboardOrder 
                    : (fullEvent.dashboardTypes || []),
                eventAdminIds: []
            });
        } catch (error) {
            console.error('Error loading event details:', error);
            // Fallback к базовым данным
            setNewEvent({
                name: event.name,
                description: '',
                startDate: event.startDate,
                endDate: event.endDate,
                status: event.status,
                visibility: 'PUBLIC',
                requiresActivityApproval: false,
                artifactsRequired: false,
                activityBlockingEnabled: false,
                activityBlockingDays: 1,
                maxTeams: '',
                maxParticipants: '',
                pointsMultiplier: '1.0',
                notificationsEnabled: true,
                displayOnHomepage: event.displayOnHomepage,
                teamBasedCompetition: event.teamBasedCompetition !== false,
                dashboardTypes: event.dashboardTypes,
                dashboardOrder: event.dashboardTypes,
                eventAdminIds: []
            });
        }
        
        setShowEventModal(true);
    };

    const selectedEvent = events.find(e => e.id === selectedEventId);
    const eventTeams = teams.filter(t => t.event?.id === selectedEventId);
    const eventActivityTypes = activityTypes.filter(a => a.event?.id === selectedEventId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Панель администратора</h1>

                    {/* Main Tabs */}
                    <div className="flex gap-2 border-b border-slate-200 mb-6">
                        <button
                            onClick={() => { setActiveTab('events'); setSelectedEventId(null); }}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                activeTab === 'events'
                                    ? 'text-purple-600 border-b-2 border-purple-600'
                                    : 'text-slate-600 hover:text-purple-600'
                            }`}
                        >
                            <Calendar className="w-5 h-5" />
                            Мероприятия
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                activeTab === 'users'
                                    ? 'text-purple-600 border-b-2 border-purple-600'
                                    : 'text-slate-600 hover:text-purple-600'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            Пользователи
                        </button>
                        <button
                            onClick={() => setActiveTab('bug-reports')}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                activeTab === 'bug-reports'
                                    ? 'text-purple-600 border-b-2 border-purple-600'
                                    : 'text-slate-600 hover:text-purple-600'
                            }`}
                        >
                            <Bug className="w-5 h-5" />
                            Bug Reports
                        </button>
                    </div>
                </div>

                {/* Users Tab Content */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Пользователи</h2>
                            <button
                                onClick={() => {
                                    setEditingUserId(null);
                                    setNewParticipant({ username: '', password: '', name: '', email: '', phone: '', role: 'USER' });
                                    setShowUserModal(true);
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
                            >
                                <Plus className="w-5 h-5" />
                                Добавить пользователя
                            </button>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Поиск по имени или логину..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Users List */}
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {participants
                                .filter(p => 
                                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    p.username.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((participant) => (
                                    <div key={participant.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                                        <div>
                                            <p className="font-semibold text-slate-900">{participant.name}</p>
                                            <p className="text-sm text-slate-600">@{participant.username}</p>
                                            {participant.email && <p className="text-xs text-slate-500">{participant.email}</p>}
                                            <p className="text-xs text-purple-600 font-semibold mt-1">{translateRole(participant.role)}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditParticipant(participant)}
                                                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all font-semibold"
                                                title="Редактировать"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(participant.id)}
                                                className="px-4 py-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-all font-semibold"
                                                title="Сбросить пароль"
                                            >
                                                <Key className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteParticipant(participant.id)}
                                                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold"
                                                title="Удалить"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Events Tab Content */}
                {activeTab === 'events' && !selectedEventId && (
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Мероприятия</h2>
                            <button
                                onClick={() => setShowEventModal(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
                            >
                                <Plus className="w-5 h-5" />
                                Добавить мероприятие
                            </button>
                        </div>

                        <div className="space-y-3">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className="p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer group"
                                    onClick={() => navigate(`/event/${event.id}`)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-slate-900">{event.name}</h3>
                                                {event.displayOnHomepage && (
                                                    <Eye className="w-5 h-5 text-purple-600" />
                                                )}
                                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                                            </div>
                                            <p className="text-sm text-slate-600 mb-3">
                                                {new Date(event.startDate).toLocaleDateString('ru-RU')} - {new Date(event.endDate).toLocaleDateString('ru-RU')}
                                            </p>
                                            <div className="flex gap-2 flex-wrap">
                                                <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                                                    {translateStatus(event.status)}
                                                </span>
                                                {event.dashboardTypes.map(type => (
                                                    <span key={type} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                                                        {translateDashboardType(type)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleToggleDisplayOnHomepage(event.id, event.displayOnHomepage)}
                                                className={`px-4 py-2 text-sm rounded-lg transition-all font-semibold ${
                                                    event.displayOnHomepage
                                                        ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                                }`}
                                            >
                                                {event.displayOnHomepage ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Event Detail View */}
                {activeTab === 'events' && selectedEventId && selectedEvent && (
                    <div>
                        {/* Event Header */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                            <button
                                onClick={() => setSelectedEventId(null)}
                                className="text-purple-600 hover:text-purple-700 font-semibold mb-4 flex items-center gap-2"
                            >
                                ← Назад к списку
                            </button>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedEvent.name}</h2>
                                    <p className="text-slate-600">
                                        {new Date(selectedEvent.startDate).toLocaleDateString('ru-RU')} - {new Date(selectedEvent.endDate).toLocaleDateString('ru-RU')}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {selectedEvent.dashboardTypes.map(type => (
                                        <span key={type} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                                            {translateDashboardType(type)}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Event Detail Tabs */}
                            <div className="flex gap-2 border-b border-slate-200">
                                <button
                                    onClick={() => setEventDetailTab('settings')}
                                    className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                        eventDetailTab === 'settings'
                                            ? 'text-purple-600 border-b-2 border-purple-600'
                                            : 'text-slate-600 hover:text-purple-600'
                                    }`}
                                >
                                    <Edit className="w-5 h-5" />
                                    Настройки
                                </button>
                                <button
                                    onClick={() => setEventDetailTab('teams')}
                                    className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                        eventDetailTab === 'teams'
                                            ? 'text-purple-600 border-b-2 border-purple-600'
                                            : 'text-slate-600 hover:text-purple-600'
                                    }`}
                                >
                                    <Users className="w-5 h-5" />
                                    Команды
                                </button>
                                <button
                                    onClick={() => setEventDetailTab('activities')}
                                    className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                        eventDetailTab === 'activities'
                                            ? 'text-purple-600 border-b-2 border-purple-600'
                                            : 'text-slate-600 hover:text-purple-600'
                                    }`}
                                >
                                    <Calendar className="w-5 h-5" />
                                    Типы активностей
                                </button>
                                <button
                                    onClick={() => setEventDetailTab('notifications')}
                                    className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                        eventDetailTab === 'notifications'
                                            ? 'text-purple-600 border-b-2 border-purple-600'
                                            : 'text-slate-600 hover:text-purple-600'
                                    }`}
                                >
                                    <Bell className="w-5 h-5" />
                                    Уведомления
                                </button>
                            </div>
                        </div>

                        {/* Settings Tab */}
                        {eventDetailTab === 'settings' && (
                            <div className="bg-white rounded-3xl shadow-xl p-8">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">Настройки мероприятия</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <div className="text-sm font-semibold text-slate-700 mb-1">Статус</div>
                                        <div className="text-lg text-slate-900">
                                            {selectedEvent.status === 'DRAFT' && '📝 Черновик'}
                                            {selectedEvent.status === 'SOON' && '⏰ Скоро'}
                                            {selectedEvent.status === 'ACTIVE' && '✅ Активное'}
                                            {selectedEvent.status === 'COMPLETED' && '🏁 Завершено'}
                                            {selectedEvent.status === 'ARCHIVED' && '📦 Архивировано'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <div className="text-sm font-semibold text-slate-700 mb-1">Дата начала</div>
                                        <div className="text-lg text-slate-900">
                                            {new Date(selectedEvent.startDate).toLocaleString('ru-RU')}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <div className="text-sm font-semibold text-slate-700 mb-1">Дата окончания</div>
                                        <div className="text-lg text-slate-900">
                                            {new Date(selectedEvent.endDate).toLocaleString('ru-RU')}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <div className="text-sm font-semibold text-slate-700 mb-1">Тип мероприятия</div>
                                        <div className="text-lg text-slate-900">
                                            {selectedEvent.teamBasedCompetition ? '🏆 Командное' : '👤 Индивидуальное'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <div className="text-sm font-semibold text-slate-700 mb-1">Модерация активностей</div>
                                        <div className="text-lg text-slate-900">
                                            {selectedEvent.requiresActivityApproval ? '✅ Включена' : '❌ Выключена'}
                                        </div>
                                    </div>
                                    {selectedEvent.dashboardTypes && selectedEvent.dashboardTypes.length > 0 && (
                                        <div className="p-4 bg-slate-50 rounded-xl">
                                            <div className="text-sm font-semibold text-slate-700 mb-2">Дашборды</div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedEvent.dashboardTypes.map(type => (
                                                    <span key={type} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                                        {translateDashboardType(type)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="pt-4">
                                        <button
                                            onClick={() => navigate(`/event/${selectedEventId}`)}
                                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Edit className="w-5 h-5" />
                                            Редактировать настройки
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Teams Tab */}
                        {eventDetailTab === 'teams' && (
                            <div className="bg-white rounded-3xl shadow-xl p-8">
                                {selectedEvent?.teamBasedCompetition !== false ? (
                                    <>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl font-bold text-slate-900">Команды мероприятия</h3>
                                            <button
                                                onClick={() => {
                                                    setInviteEventId(selectedEventId);
                                                    setShowInviteModal(true);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                                            >
                                                <UserPlus className="w-5 h-5" />
                                                Пригласить
                                            </button>
                                        </div>
                                    <form onSubmit={handleCreateTeam} className="space-y-4 mb-6">
                                        <input
                                            type="text"
                                            placeholder="Название команды"
                                            value={newTeam.name}
                                            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Девиз"
                                            value={newTeam.motto}
                                            onChange={(e) => setNewTeam({ ...newTeam, motto: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all"
                                        >
                                            Добавить команду
                                        </button>
                                    </form>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                        {eventTeams.length === 0 ? (
                                            <p className="text-slate-500 text-center py-8">Нет команд в этом мероприятии</p>
                                        ) : (
                                            eventTeams.map((team) => (
                                                <div key={team.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{team.name}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteTeam(team.id)}
                                                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold"
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Команды мероприятия</h3>
                                        <div className="text-center py-12">
                                            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-600 font-semibold mb-2">Индивидуальное мероприятие</p>
                                            <p className="text-slate-500 text-sm">Для этого мероприятия команды не используются</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Activity Types Tab */}
                        {eventDetailTab === 'activities' && (
                            <div className="bg-white rounded-3xl shadow-xl p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-slate-900">Типы активностей</h3>
                                    <button
                                        onClick={() => {
                                            setEditingActivityType(null);
                                            setShowActivityTypeModal(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Добавить
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {eventActivityTypes.length === 0 ? (
                                        <p className="text-slate-500 text-center py-8">Нет типов активностей в этом мероприятии</p>
                                    ) : (
                                        eventActivityTypes.map((type) => (
                                            <div key={type.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div>
                                                    <p className="font-semibold text-slate-900">{type.name}</p>
                                                    <p className="text-sm text-slate-600">Энергия: {type.defaultEnergy}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditActivityType(type)}
                                                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all font-semibold"
                                                        title="Редактировать"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteActivityType(type.id)}
                                                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold"
                                                        title="Удалить"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {eventDetailTab === 'notifications' && (
                            <div className="bg-white rounded-3xl shadow-xl p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-6 h-6 text-purple-600" />
                                        <h3 className="text-2xl font-bold text-slate-900">Уведомления участникам</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowNotificationModal(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                                    >
                                        <Send className="w-5 h-5" />
                                        Отправить уведомление
                                    </button>
                                </div>
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
                                        <Bell className="w-10 h-10 text-white" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Отправка уведомлений</h4>
                                    <p className="text-slate-600 max-w-md mx-auto">
                                        Отправляйте уведомления всем участникам мероприятия, только капитанам команд или конкретным участникам.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Event Creation Modal */}
                {showEventModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between rounded-t-3xl">
                                <h2 className="text-2xl font-bold text-slate-900">{editingEventId ? 'Редактировать мероприятие' : 'Создать мероприятие'}</h2>
                                <button
                                    onClick={() => {
                                        setShowEventModal(false);
                                        setEditingEventId(null);
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateEvent} className="p-8 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Название мероприятия</label>
                                    <input
                                        type="text"
                                        placeholder="Название мероприятия"
                                        value={newEvent.name}
                                        onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Описание</label>
                                    <textarea
                                        placeholder="Описание"
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Статус мероприятия</label>
                                    <select
                                        value={newEvent.status}
                                        onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="DRAFT">Черновик</option>
                                        <option value="SOON">Скоро</option>
                                        <option value="ACTIVE">Активное</option>
                                        <option value="COMPLETED">Завершено</option>
                                        <option value="ARCHIVED">Архивировано</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Дата начала</label>
                                        <input
                                            type="datetime-local"
                                            value={newEvent.startDate}
                                            onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Дата окончания</label>
                                        <input
                                            type="datetime-local"
                                            value={newEvent.endDate}
                                            onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Типы дашбордов</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['RANKING', 'TRACKER', 'FEED', 'SIMPLE_LIST'].map(type => (
                                            <label key={type} className="flex items-center gap-2 p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-purple-300 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={newEvent.dashboardTypes.includes(type)}
                                                    onChange={() => handleDashboardTypeToggle(type)}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                                />
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {type === 'RANKING' && 'Рейтинг'}
                                                    {type === 'TRACKER' && 'Трекер'}
                                                    {type === 'FEED' && 'Лента'}
                                                    {type === 'SIMPLE_LIST' && 'Список'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {newEvent.dashboardOrder.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Порядок отображения вкладок
                                            <span className="text-xs text-slate-500 ml-2">(перетащите для изменения порядка)</span>
                                        </label>
                                        <div className="space-y-2 p-4 bg-slate-50 rounded-xl">
                                            {newEvent.dashboardOrder.map((type, index) => (
                                                <div
                                                    key={type}
                                                    draggable
                                                    onDragStart={() => handleDragStart(index)}
                                                    onDragOver={(e) => handleDragOver(e, index)}
                                                    onDrop={(e) => handleDrop(e, index)}
                                                    onDragEnd={handleDragEnd}
                                                    className={`flex items-center justify-between p-3 bg-white rounded-lg border-2 transition-all cursor-move ${
                                                        draggedDashboardIndex === index
                                                            ? 'border-purple-400 bg-purple-50 opacity-50'
                                                            : 'border-slate-200 hover:border-purple-300 hover:shadow-md'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                                        </svg>
                                                        <span className="font-semibold text-slate-700">
                                                            {index + 1}. {type === 'RANKING' && 'Рейтинг'}
                                                            {type === 'TRACKER' && 'Трекер'}
                                                            {type === 'FEED' && 'Лента'}
                                                            {type === 'SIMPLE_LIST' && 'Список'}
                                                        </span>
                                                    </div>
                                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                    </svg>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-slate-200 rounded-lg hover:border-purple-300 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={newEvent.teamBasedCompetition}
                                            onChange={(e) => setNewEvent({ ...newEvent, teamBasedCompetition: e.target.checked })}
                                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Командное мероприятие</span>
                                        <span className="text-xs text-slate-500">(если выключено - индивидуальное)</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-slate-200 rounded-lg hover:border-orange-300 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={newEvent.requiresActivityApproval}
                                            onChange={(e) => setNewEvent({ ...newEvent, requiresActivityApproval: e.target.checked })}
                                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Модерация активностей</span>
                                        <span className="text-xs text-slate-500">(активности требуют одобрения модератором)</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-slate-200 rounded-lg hover:border-blue-300 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={newEvent.artifactsRequired}
                                            onChange={(e) => setNewEvent({ ...newEvent, artifactsRequired: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Необходимость приложения артефактов</span>
                                        <span className="text-xs text-slate-500">(фото обязательно для подтверждения активности)</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-slate-200 rounded-lg hover:border-red-300 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={newEvent.activityBlockingEnabled}
                                            onChange={(e) => setNewEvent({ ...newEvent, activityBlockingEnabled: e.target.checked, activityBlockingDays: e.target.checked ? newEvent.activityBlockingDays : 1 })}
                                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Блокирование активностей</span>
                                        <span className="text-xs text-slate-500">(ограничение добавления активностей по дате)</span>
                                    </label>
                                </div>

                                {newEvent.activityBlockingEnabled && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Блокирование активности через
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                                newEvent.activityBlockingDays === 1
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-slate-200 hover:border-red-300'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="activityBlockingDays"
                                                    value="1"
                                                    checked={newEvent.activityBlockingDays === 1}
                                                    onChange={(e) => setNewEvent({ ...newEvent, activityBlockingDays: 1 })}
                                                    className="w-4 h-4 text-red-600"
                                                />
                                                <span className="text-sm font-semibold text-slate-700">Текущая дата + 1 день</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                                newEvent.activityBlockingDays === 2
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-slate-200 hover:border-red-300'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="activityBlockingDays"
                                                    value="2"
                                                    checked={newEvent.activityBlockingDays === 2}
                                                    onChange={(e) => setNewEvent({ ...newEvent, activityBlockingDays: 2 })}
                                                    className="w-4 h-4 text-red-600"
                                                />
                                                <span className="text-sm font-semibold text-slate-700">Текущая дата + 2 дня</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEventModal(false);
                                            setEditingEventId(null);
                                        }}
                                        className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all"
                                    >
                                        {editingEventId ? 'Сохранить изменения' : 'Создать мероприятие'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* User Creation/Edit Modal */}
                {showUserModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between rounded-t-3xl">
                                <h2 className="text-2xl font-bold text-slate-900">{editingUserId ? 'Редактировать пользователя' : 'Добавить пользователя'}</h2>
                                <button
                                    onClick={() => {
                                        setShowUserModal(false);
                                        setEditingUserId(null);
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateParticipant} className="p-8 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Логин</label>
                                    <input
                                        type="text"
                                        placeholder="Логин"
                                        value={newParticipant.username}
                                        onChange={(e) => setNewParticipant({ ...newParticipant, username: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        required
                                        disabled={!!editingUserId}
                                    />
                                </div>

                                {!editingUserId && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Пароль</label>
                                        <input
                                            type="password"
                                            placeholder="Пароль"
                                            value={newParticipant.password}
                                            onChange={(e) => setNewParticipant({ ...newParticipant, password: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Имя</label>
                                    <input
                                        type="text"
                                        placeholder="Имя"
                                        value={newParticipant.name}
                                        onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={newParticipant.email}
                                        onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Телефон</label>
                                    <input
                                        type="tel"
                                        placeholder="Телефон"
                                        value={newParticipant.phone}
                                        onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Роль</label>
                                    <Select
                                        value={newParticipant.role}
                                        onChange={(value) => setNewParticipant({ ...newParticipant, role: value })}
                                        options={[
                                            { value: 'USER', label: 'Пользователь' },
                                            { value: 'MODERATOR', label: 'Модератор' },
                                            { value: 'ADMIN', label: 'Администратор' }
                                        ]}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUserModal(false);
                                            setEditingUserId(null);
                                        }}
                                        className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all"
                                    >
                                        {editingUserId ? 'Сохранить изменения' : 'Добавить пользователя'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Reset Password Modal */}
                {showResetPasswordModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                            {!resetPasswordSuccess ? (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                                            <Key className="w-8 h-8 text-yellow-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Сброс пароля</h2>
                                        <p className="text-slate-600">
                                            Вы уверены, что хотите сбросить пароль этого пользователя?
                                        </p>
                                        <p className="text-sm text-slate-500 mt-2">
                                            Новый пароль будет равен логину пользователя. При следующем входе пользователь должен будет установить новый пароль.
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={closeResetPasswordModal}
                                            className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            onClick={confirmResetPassword}
                                            className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all"
                                        >
                                            Сбросить пароль
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Пароль сброшен</h2>
                                        <p className="text-slate-600">
                                            Пароль успешно сброшен. Пользователь может войти, используя свой логин в качестве пароля.
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeResetPasswordModal}
                                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all"
                                    >
                                        Закрыть
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Activity Type Modal */}
                <ActivityTypeModal
                    isOpen={showActivityTypeModal}
                    onClose={() => {
                        setShowActivityTypeModal(false);
                        setEditingActivityType(null);
                    }}
                    onSubmit={handleCreateActivityType}
                    editingActivityType={editingActivityType}
                    eventId={selectedEventId}
                />

                {/* Invite Participants Modal */}
                {showInviteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fadeIn">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transform transition-all animate-slideUp">
                            {/* Header with gradient */}
                            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                            <UserPlus className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Пригласить участников</h2>
                                            <p className="text-blue-100 text-sm">в мероприятие</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowInviteModal(false);
                                            setSelectedParticipants([]);
                                            setInviteEventId(null);
                                        }}
                                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all text-white"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                {/* Info banner */}
                                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-900 mb-1">
                                                Как это работает?
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                Выбранные участники получат уведомление и смогут принять или отклонить приглашение. 
                                                После принятия они смогут создавать команды и добавлять активности.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm font-semibold text-slate-700">
                                            Всего участников: {participants.length}
                                        </span>
                                    </div>
                                    {selectedParticipants.length > 0 && (
                                        <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-sm shadow-lg">
                                            Выбрано: {selectedParticipants.length}
                                        </div>
                                    )}
                                </div>

                                {/* Participants list */}
                                <div className="space-y-2 max-h-96 overflow-y-auto mb-6 pr-2">
                                    {participants.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Users className="w-10 h-10 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 font-medium">Нет доступных участников</p>
                                        </div>
                                    ) : (
                                        participants.map((participant) => (
                                            <label
                                                key={participant.id}
                                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer border-2 ${
                                                    selectedParticipants.includes(participant.id)
                                                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-md'
                                                        : 'bg-slate-50 border-transparent hover:border-blue-200 hover:shadow-sm'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedParticipants.includes(participant.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedParticipants([...selectedParticipants, participant.id]);
                                                        } else {
                                                            setSelectedParticipants(selectedParticipants.filter(id => id !== participant.id));
                                                        }
                                                    }}
                                                    className="w-5 h-5 text-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                                />
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                    {participant.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 truncate">{participant.name}</p>
                                                    <p className="text-sm text-slate-600">@{participant.username}</p>
                                                </div>
                                                {selectedParticipants.includes(participant.id) && (
                                                    <div className="flex-shrink-0">
                                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </label>
                                        ))
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowInviteModal(false);
                                            setSelectedParticipants([]);
                                            setInviteEventId(null);
                                        }}
                                        className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-400 transition-all"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        onClick={handleInviteParticipants}
                                        disabled={selectedParticipants.length === 0}
                                        className={`flex-1 px-6 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                                            selectedParticipants.length === 0
                                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white'
                                        }`}
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        Отправить приглашения ({selectedParticipants.length})
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bug Reports Tab Content */}
                {activeTab === 'bug-reports' && (
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Bug Reports</h2>
                        
                        {/* Search and Filters */}
                        <div className="mb-6 space-y-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Поиск по номеру, заголовку или описанию..."
                                    value={bugSearchQuery}
                                    onChange={(e) => setBugSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                                />
                            </div>
                            
                            {/* Filters Row */}
                            <div className="flex gap-3 flex-wrap">
                                {/* Status Filter */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setBugStatusFilter('ALL')}
                                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                                            bugStatusFilter === 'ALL'
                                                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        Все
                                    </button>
                                    <button
                                        onClick={() => setBugStatusFilter('PENDING')}
                                        className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                                            bugStatusFilter === 'PENDING'
                                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                                                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                                        }`}
                                    >
                                        <Clock className="w-4 h-4" />
                                        Ожидает
                                    </button>
                                    <button
                                        onClick={() => setBugStatusFilter('IN_PROGRESS')}
                                        className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                                            bugStatusFilter === 'IN_PROGRESS'
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                        }`}
                                    >
                                        <Bug className="w-4 h-4" />
                                        В работе
                                    </button>
                                    <button
                                        onClick={() => setBugStatusFilter('RESOLVED')}
                                        className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                                            bugStatusFilter === 'RESOLVED'
                                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                        }`}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Решено
                                    </button>
                                    <button
                                        onClick={() => setBugStatusFilter('REJECTED')}
                                        className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                                            bugStatusFilter === 'REJECTED'
                                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                                        }`}
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Отклонено
                                    </button>
                                </div>
                                
                                {/* Sort By */}
                                <div className="ml-auto flex gap-2">
                                    <button
                                        onClick={() => setBugSortBy('newest')}
                                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                                            bugSortBy === 'newest'
                                                ? 'bg-slate-800 text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        Новые
                                    </button>
                                    <button
                                        onClick={() => setBugSortBy('oldest')}
                                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                                            bugSortBy === 'oldest'
                                                ? 'bg-slate-800 text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        Старые
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {bugReports.length > 0 ? (
                            <div className="space-y-4">
                                {bugReports
                                    .filter(report => {
                                        // Search filter
                                        const searchLower = bugSearchQuery.toLowerCase();
                                        const matchesSearch = !bugSearchQuery || 
                                            (report.bugNumber && report.bugNumber.toLowerCase().includes(searchLower)) ||
                                            report.title.toLowerCase().includes(searchLower) ||
                                            report.description.toLowerCase().includes(searchLower);
                                        
                                        // Status filter
                                        const matchesStatus = bugStatusFilter === 'ALL' || report.status === bugStatusFilter;
                                        
                                        return matchesSearch && matchesStatus;
                                    })
                                    .sort((a, b) => {
                                        const dateA = new Date(a.createdAt).getTime();
                                        const dateB = new Date(b.createdAt).getTime();
                                        return bugSortBy === 'newest' ? dateB - dateA : dateA - dateB;
                                    })
                                    .map((report) => (
                                    <div
                                        key={report.id}
                                        className={`border-2 rounded-2xl p-6 ${
                                            report.status === 'PENDING' 
                                                ? 'border-orange-200 bg-orange-50' 
                                                : report.status === 'RESOLVED'
                                                ? 'border-green-200 bg-green-50'
                                                : report.status === 'IN_PROGRESS'
                                                ? 'border-blue-200 bg-blue-50'
                                                : 'border-red-200 bg-red-50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    {report.status === 'PENDING' && <Clock className="w-5 h-5 text-orange-600" />}
                                                    {report.status === 'RESOLVED' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                                    {report.status === 'REJECTED' && <XCircle className="w-5 h-5 text-red-600" />}
                                                    {report.status === 'IN_PROGRESS' && <Bug className="w-5 h-5 text-blue-600" />}
                                                    {report.bugNumber && (
                                                        <span className="px-3 py-1 bg-slate-800 text-white rounded-lg text-xs font-mono font-bold">
                                                            {report.bugNumber}
                                                        </span>
                                                    )}
                                                    <h3 className="text-lg font-bold text-slate-900">{report.title}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        report.status === 'PENDING' ? 'bg-orange-200 text-orange-800' :
                                                        report.status === 'RESOLVED' ? 'bg-green-200 text-green-800' :
                                                        report.status === 'IN_PROGRESS' ? 'bg-blue-200 text-blue-800' :
                                                        'bg-red-200 text-red-800'
                                                    }`}>
                                                        {report.status}
                                                    </span>
                                                </div>
                                                <p className="text-slate-700 mb-3 whitespace-pre-line">{report.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                                    <span>От: <strong>{report.participantName}</strong></span>
                                                    <span>•</span>
                                                    <span>{new Date(report.createdAt).toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}</span>
                                                    {report.badgeAwarded && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1 text-yellow-600">
                                                                <Award className="w-4 h-4" />
                                                                Значок выдан
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                {report.adminNotes && (
                                                    <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                                                        <p className="text-sm text-slate-600"><strong>Заметки админа:</strong> {report.adminNotes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <select
                                                value={report.status}
                                                onChange={async (e) => {
                                                    try {
                                                        await axiosInstance.put(`/admin/bug-reports/${report.id}`, null, {
                                                            params: {
                                                                status: e.target.value,
                                                                adminNotes: report.adminNotes || '',
                                                                awardBadge: false
                                                            }
                                                        });
                                                        fetchData();
                                                    } catch (error) {
                                                        console.error('Error updating bug report:', error);
                                                    }
                                                }}
                                                className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                            >
                                                <option value="PENDING">PENDING</option>
                                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                                <option value="RESOLVED">RESOLVED</option>
                                                <option value="REJECTED">REJECTED</option>
                                            </select>
                                            
                                            {report.status === 'RESOLVED' && !report.badgeAwarded && (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await axiosInstance.put(`/admin/bug-reports/${report.id}`, null, {
                                                                params: {
                                                                    status: 'RESOLVED',
                                                                    adminNotes: report.adminNotes || '',
                                                                    awardBadge: true
                                                                }
                                                            });
                                                            fetchData();
                                                        } catch (error) {
                                                            console.error('Error awarding badge:', error);
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                                                >
                                                    <Award className="w-4 h-4" />
                                                    Выдать значок
                                                </button>
                                            )}
                                            
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Удалить этот баг-репорт?')) {
                                                        try {
                                                            await axiosInstance.delete(`/admin/bug-reports/${report.id}`);
                                                            fetchData();
                                                        } catch (error) {
                                                            console.error('Error deleting bug report:', error);
                                                        }
                                                    }
                                                }}
                                                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Bug className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 text-lg">Нет баг-репортов</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Notification Modal */}
                {showNotificationModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between rounded-t-3xl">
                                <h2 className="text-2xl font-bold text-slate-900">Отправить уведомление</h2>
                                <button
                                    onClick={() => {
                                        setShowNotificationModal(false);
                                        setNotificationSuccess(false);
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            {notificationSuccess ? (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Уведомления отправлены!</h3>
                                    <p className="text-slate-600">
                                        Успешно отправлено {notificationCount} уведомлений
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSendNotification} className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Заголовок</label>
                                        <input
                                            type="text"
                                            placeholder="Заголовок уведомления"
                                            value={notification.title}
                                            onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Текст уведомления</label>
                                        <textarea
                                            placeholder="Введите текст уведомления..."
                                            value={notification.message}
                                            onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                            rows={5}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">Кому отправить</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all">
                                                <input
                                                    type="radio"
                                                    name="recipientType"
                                                    value="ALL"
                                                    checked={notification.recipientType === 'ALL'}
                                                    onChange={(e) => setNotification({ ...notification, recipientType: e.target.value, participantIds: [] })}
                                                    className="w-5 h-5 text-purple-600"
                                                />
                                                <div>
                                                    <p className="font-semibold text-slate-900">Всем участникам мероприятия</p>
                                                    <p className="text-sm text-slate-600">Уведомление получат все участники</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all">
                                                <input
                                                    type="radio"
                                                    name="recipientType"
                                                    value="CAPTAINS"
                                                    checked={notification.recipientType === 'CAPTAINS'}
                                                    onChange={(e) => setNotification({ ...notification, recipientType: e.target.value, participantIds: [] })}
                                                    className="w-5 h-5 text-purple-600"
                                                />
                                                <div>
                                                    <p className="font-semibold text-slate-900">Только капитанам команд</p>
                                                    <p className="text-sm text-slate-600">Уведомление получат капитаны всех команд</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all">
                                                <input
                                                    type="radio"
                                                    name="recipientType"
                                                    value="SPECIFIC"
                                                    checked={notification.recipientType === 'SPECIFIC'}
                                                    onChange={(e) => setNotification({ ...notification, recipientType: e.target.value })}
                                                    className="w-5 h-5 text-purple-600"
                                                />
                                                <div>
                                                    <p className="font-semibold text-slate-900">Конкретным участникам</p>
                                                    <p className="text-sm text-slate-600">Выберите участников из списка ниже</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {notification.recipientType === 'SPECIFIC' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                Выберите участников ({notification.participantIds.length} выбрано)
                                            </label>
                                            <div className="max-h-64 overflow-y-auto border-2 border-slate-200 rounded-xl p-3 space-y-2">
                                                {participants.map((participant) => (
                                                    <label
                                                        key={participant.id}
                                                        className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-all"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={notification.participantIds.includes(participant.id)}
                                                            onChange={() => toggleParticipantSelection(participant.id)}
                                                            className="w-5 h-5 text-purple-600 rounded"
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{participant.name}</p>
                                                            <p className="text-sm text-slate-600">@{participant.username}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNotificationModal(false);
                                                setNotificationSuccess(false);
                                            }}
                                            className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Send className="w-5 h-5" />
                                            Отправить
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
