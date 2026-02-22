import React, { useState, useEffect } from 'react';
import { Users, Calendar, HelpCircle, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';

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
}

interface ActivityType {
    id: number;
    name: string;
    defaultEnergy: number;
}

interface EventListItem {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    displayOnHomepage: boolean;
    dashboardTypes: string[];
}

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'events' | 'users'>('events');
    const [eventSubTab, setEventSubTab] = useState<'info' | 'teams' | 'activities'>('info');
    
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const [events, setEvents] = useState<EventListItem[]>([]);
    
    const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
    
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
        dashboardTypes: [] as string[],
        eventAdminIds: [] as number[]
    });

    useEffect(() => {
        fetchData();
    }, [activeTab, eventSubTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'users') {
                const response = await axiosInstance.get('/admin/participants');
                setParticipants(response.data);
            } else if (activeTab === 'events') {
                const eventsResponse = await axiosInstance.get('/admin/events');
                setEvents(eventsResponse.data);
                
                if (eventSubTab === 'teams') {
                    const teamsResponse = await axiosInstance.get('/admin/teams');
                    setTeams(teamsResponse.data);
                } else if (eventSubTab === 'activities') {
                    const activitiesResponse = await axiosInstance.get('/admin/activity-types');
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
            await axiosInstance.post('/admin/participants', newParticipant);
            setNewParticipant({ username: '', password: '', name: '', email: '', phone: '', role: 'USER' });
            fetchData();
        } catch (error) {
            console.error('Error creating participant:', error);
        }
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
            await axiosInstance.post('/admin/teams', newTeam);
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
            await axiosInstance.post('/admin/activity-types', newActivityType);
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
            await axiosInstance.post('/admin/events', eventData);
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
                dashboardTypes: [],
                eventAdminIds: []
            });
            fetchData();
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    const handleDeleteEvent = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
            try {
                await axiosInstance.delete(`/admin/events/${id}`);
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
        setNewEvent(prev => ({
            ...prev,
            dashboardTypes: prev.dashboardTypes.includes(type)
                ? prev.dashboardTypes.filter(t => t !== type)
                : [...prev.dashboardTypes, type]
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Панель администратора</h1>

                    {/* Main Tabs */}
                    <div className="flex gap-2 border-b border-slate-200 mb-6">
                        <button
                            onClick={() => setActiveTab('events')}
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

                    {/* Event Sub-tabs */}
                    {activeTab === 'events' && (
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setEventSubTab('info')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    eventSubTab === 'info'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Информация
                            </button>
                            <button
                                onClick={() => setEventSubTab('teams')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    eventSubTab === 'teams'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Команды
                            </button>
                            <button
                                onClick={() => setEventSubTab('activities')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                    eventSubTab === 'activities'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Типы активности
                            </button>
                        </div>
                    )}
                </div>

                {/* Users Tab Content */}
                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Добавить пользователя</h2>
                            <form onSubmit={handleCreateParticipant} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Логин"
                                    value={newParticipant.username}
                                    onChange={(e) => setNewParticipant({ ...newParticipant, username: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Пароль"
                                    value={newParticipant.password}
                                    onChange={(e) => setNewParticipant({ ...newParticipant, password: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Имя"
                                    value={newParticipant.name}
                                    onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newParticipant.email}
                                    onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                />
                                <input
                                    type="tel"
                                    placeholder="Телефон"
                                    value={newParticipant.phone}
                                    onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                />
                                <select
                                    value={newParticipant.role}
                                    onChange={(e) => setNewParticipant({ ...newParticipant, role: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                >
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all"
                                >
                                    Добавить пользователя
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Список пользователей</h2>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {participants.map((participant) => (
                                    <div key={participant.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="font-semibold text-slate-900">{participant.name}</p>
                                            <p className="text-sm text-slate-600">@{participant.username}</p>
                                            <p className="text-xs text-purple-600 font-semibold">{participant.role}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteParticipant(participant.id)}
                                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Events Tab - Info Sub-tab */}
                {activeTab === 'events' && eventSubTab === 'info' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Создать мероприятие</h2>
                            <form onSubmit={handleCreateEvent} className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {/* Name */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="text-sm font-semibold text-slate-700">Название мероприятия</label>
                                        <div className="group relative">
                                            <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                Краткое и понятное название вашего мероприятия
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Название мероприятия"
                                        value={newEvent.name}
                                        onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="text-sm font-semibold text-slate-700">Описание</label>
                                    </div>
                                    <textarea
                                        placeholder="Описание"
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        rows={3}
                                    />
                                </div>

                                {/* Dates */}
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

                                {/* Dashboard Types - Multiple Selection */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="text-sm font-semibold text-slate-700">Типы дашбордов</label>
                                        <div className="group relative">
                                            <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-80 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                Выберите один или несколько типов отображения данных для мероприятия
                                            </div>
                                        </div>
                                    </div>
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
                                                    {type === 'SIMPLE_LIST' && 'Простой список'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Display on Homepage */}
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-slate-200 rounded-lg hover:border-purple-300 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={newEvent.displayOnHomepage}
                                            onChange={(e) => setNewEvent({ ...newEvent, displayOnHomepage: e.target.checked })}
                                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Отображать на главной странице</span>
                                        <div className="group relative ml-auto">
                                            <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-80 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                Только одно мероприятие может отображаться на главной. При выборе другое мероприятие автоматически скроется.
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all"
                                >
                                    Создать мероприятие
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Список мероприятий</h2>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {events.map((event) => (
                                    <div key={event.id} className="p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-slate-900">{event.name}</p>
                                                    {event.displayOnHomepage && (
                                                        <Eye className="w-4 h-4 text-purple-600" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1">
                                                    {new Date(event.startDate).toLocaleDateString('ru-RU')} - {new Date(event.endDate).toLocaleDateString('ru-RU')}
                                                </p>
                                                <div className="flex gap-2 mt-2 flex-wrap">
                                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                                                        {event.status}
                                                    </span>
                                                    {event.dashboardTypes.map(type => (
                                                        <span key={type} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                                                            {type}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => handleToggleDisplayOnHomepage(event.id, event.displayOnHomepage)}
                                                className={`px-3 py-1 text-xs rounded-lg transition-all font-semibold ${
                                                    event.displayOnHomepage
                                                        ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                                }`}
                                            >
                                                {event.displayOnHomepage ? (
                                                    <span className="flex items-center gap-1">
                                                        <EyeOff className="w-3 h-3" /> Скрыть
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> Показать
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Events Tab - Teams Sub-tab */}
                {activeTab === 'events' && eventSubTab === 'teams' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Добавить команду</h2>
                            <form onSubmit={handleCreateTeam} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Мероприятие</label>
                                    <select
                                        value={newTeam.eventId || ''}
                                        onChange={(e) => setNewTeam({ ...newTeam, eventId: e.target.value ? Number(e.target.value) : null })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="">Глобальная команда (без мероприятия)</option>
                                        {events.map(event => (
                                            <option key={event.id} value={event.id}>{event.name}</option>
                                        ))}
                                    </select>
                                </div>
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
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Список команд</h2>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {teams.map((team) => (
                                    <div key={team.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="font-semibold text-slate-900">{team.name}</p>
                                            <p className="text-sm text-slate-600">ID: {team.id}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteTeam(team.id)}
                                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Events Tab - Activities Sub-tab */}
                {activeTab === 'events' && eventSubTab === 'activities' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Добавить тип активности</h2>
                            <form onSubmit={handleCreateActivityType} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Мероприятие</label>
                                    <select
                                        value={newActivityType.eventId || ''}
                                        onChange={(e) => setNewActivityType({ ...newActivityType, eventId: e.target.value ? Number(e.target.value) : null })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="">Глобальный тип (для всех мероприятий)</option>
                                        {events.map(event => (
                                            <option key={event.id} value={event.id}>{event.name}</option>
                                        ))}
                                    </select>
                                </div>
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
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Список типов активности</h2>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {activityTypes.map((type) => (
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
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
