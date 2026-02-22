import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, HelpCircle, Eye, EyeOff, Plus, X, ChevronRight, Trash2, Edit, Search, Key } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import { translateStatus, translateRole, translateDashboardType } from '../utils/translations';

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
}

export const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'events' | 'users'>('events');
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
    
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const [events, setEvents] = useState<EventListItem[]>([]);
    
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
                    const activitiesResponse = await axiosInstance.get('/admin/activity-types');
                    setTeams(teamsResponse.data);
                    setActivityTypes(activitiesResponse.data);
                }
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

    const handleCreateActivityType = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const activityData = { ...newActivityType, eventId: selectedEventId };
            await axiosInstance.post('/admin/activity-types', activityData);
            setNewActivityType({ name: '', description: '', defaultEnergy: 0, eventId: null });
            fetchData();
        } catch (error) {
            console.error('Error creating activity type:', error);
        }
    };

    const handleDeleteActivityType = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этот тип активности?')) {
            try {
                await axiosInstance.delete(`/admin/activity-types/${id}`);
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
                            <div className="flex items-center justify-between">
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
                        </div>

                        {/* Teams and Activities */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Teams */}
                            {selectedEvent?.teamBasedCompetition !== false ? (
                                <div className="bg-white rounded-3xl shadow-xl p-8">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Команды мероприятия</h3>
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
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl shadow-xl p-8">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Команды мероприятия</h3>
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-600 font-semibold mb-2">Индивидуальное мероприятие</p>
                                        <p className="text-slate-500 text-sm">Для этого мероприятия команды не используются</p>
                                    </div>
                                </div>
                            )}

                            {/* Activity Types */}
                            <div className="bg-white rounded-3xl shadow-xl p-8">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">Типы активностей</h3>
                                <form onSubmit={handleCreateActivityType} className="space-y-4 mb-6">
                                    <input
                                        type="text"
                                        placeholder="Название"
                                        value={newActivityType.name}
                                        onChange={(e) => setNewActivityType({ ...newActivityType, name: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Описание"
                                        value={newActivityType.description}
                                        onChange={(e) => setNewActivityType({ ...newActivityType, description: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Энергия по умолчанию"
                                        value={newActivityType.defaultEnergy}
                                        onChange={(e) => setNewActivityType({ ...newActivityType, defaultEnergy: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all"
                                    >
                                        Добавить тип активности
                                    </button>
                                </form>
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
                                                <button
                                                    onClick={() => handleDeleteActivityType(type.id)}
                                                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold"
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Статус</label>
                                    <select
                                        value={newEvent.status}
                                        onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="DRAFT">Черновик</option>
                                        <option value="ACTIVE">Активное</option>
                                        <option value="COMPLETED">Завершено</option>
                                        <option value="CANCELLED">Отменено</option>
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
                                    <select
                                        value={newParticipant.role}
                                        onChange={(e) => setNewParticipant({ ...newParticipant, role: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="USER">Пользователь</option>
                                        <option value="ADMIN">Администратор</option>
                                    </select>
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
            </div>
        </div>
    );
};
