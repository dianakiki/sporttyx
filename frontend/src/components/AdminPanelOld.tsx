import React, { useState, useEffect } from 'react';
import { Users, Shield, Activity, Calendar, Pin, HelpCircle } from 'lucide-react';
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

interface Event {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    visibility: string;
    requiresActivityApproval: boolean;
    maxTeams?: number;
    maxParticipants?: number;
    registrationDeadline?: string;
    pointsMultiplier: number;
    bannerImageUrl?: string;
    logoUrl?: string;
    primaryColor?: string;
    notificationsEnabled: boolean;
    pinnedOnHomepage: boolean;
    dashboardType: string;
    eventAdmins: { id: number; name: string; username: string }[];
}

interface EventListItem {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    pinnedOnHomepage: boolean;
    dashboardType: string;
}

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'participants' | 'teams' | 'activities' | 'events'>('participants');
    
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
        imageUrl: ''
    });
    
    const [newActivityType, setNewActivityType] = useState({
        name: '',
        description: '',
        defaultEnergy: 0
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
        pinnedOnHomepage: false,
        dashboardType: 'RANKING',
        eventAdminIds: [] as number[]
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'participants') {
                const response = await axiosInstance.get('/admin/participants');
                setParticipants(response.data);
            } else if (activeTab === 'teams') {
                const response = await axiosInstance.get('/admin/teams');
                setTeams(response.data);
            } else if (activeTab === 'activities') {
                const response = await axiosInstance.get('/admin/activity-types');
                setActivityTypes(response.data);
            } else if (activeTab === 'events') {
                const response = await axiosInstance.get('/admin/events');
                setEvents(response.data);
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
            setNewTeam({ name: '', motto: '', imageUrl: '' });
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
            setNewActivityType({ name: '', description: '', defaultEnergy: 0 });
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
                pinnedOnHomepage: false,
                dashboardType: 'RANKING',
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

    const handlePinEvent = async (id: number) => {
        try {
            await axiosInstance.post(`/admin/events/${id}/pin`);
            fetchData();
        } catch (error) {
            console.error('Error pinning event:', error);
        }
    };

    const handleUnpinEvent = async (id: number) => {
        try {
            await axiosInstance.post(`/admin/events/${id}/unpin`);
            fetchData();
        } catch (error) {
            console.error('Error unpinning event:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-8 h-8 text-purple-600" />
                        <h1 className="text-3xl font-bold text-slate-900">Панель администратора</h1>
                    </div>

                    <div className="flex gap-2 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('participants')}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                activeTab === 'participants'
                                    ? 'text-purple-600 border-b-2 border-purple-600'
                                    : 'text-slate-600 hover:text-purple-600'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            Пользователи
                        </button>
                        <button
                            onClick={() => setActiveTab('teams')}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                activeTab === 'teams'
                                    ? 'text-purple-600 border-b-2 border-purple-600'
                                    : 'text-slate-600 hover:text-purple-600'
                            }`}
                        >
                            <Shield className="w-5 h-5" />
                            Команды
                        </button>
                        <button
                            onClick={() => setActiveTab('activities')}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                activeTab === 'activities'
                                    ? 'text-purple-600 border-b-2 border-purple-600'
                                    : 'text-slate-600 hover:text-purple-600'
                            }`}
                        >
                            <Activity className="w-5 h-5" />
                            Типы активности
                        </button>
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
                    </div>
                </div>

                {activeTab === 'participants' && (
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

                {activeTab === 'teams' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Добавить команду</h2>
                            <form onSubmit={handleCreateTeam} className="space-y-4">
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
                                <input
                                    type="text"
                                    placeholder="URL изображения"
                                    value={newTeam.imageUrl}
                                    onChange={(e) => setNewTeam({ ...newTeam, imageUrl: e.target.value })}
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

                {activeTab === 'activities' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Добавить тип активности</h2>
                            <form onSubmit={handleCreateActivityType} className="space-y-4">
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

                {activeTab === 'events' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Создать мероприятие</h2>
                            <form onSubmit={handleCreateEvent} className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="text-sm font-semibold text-slate-700">Название мероприятия</label>
                                        <div className="group relative">
                                            <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                Краткое и понятное название вашего мероприятия (например, "Семейное соревнование")
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
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="text-sm font-semibold text-slate-700">Описание</label>
                                        <div className="group relative">
                                            <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                Подробное описание мероприятия, его целей и условий участия
                                            </div>
                                        </div>
                                    </div>
                                    <textarea
                                        placeholder="Описание"
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-sm font-semibold text-slate-700">Дата начала</label>
                                            <div className="group relative">
                                                <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                    Дата и время начала мероприятия. С этого момента участники смогут добавлять активности
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="datetime-local"
                                            value={newEvent.startDate}
                                            onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-sm font-semibold text-slate-700">Дата окончания</label>
                                            <div className="group relative">
                                                <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                    Дата и время окончания мероприятия. После этого момента новые активности не принимаются
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="datetime-local"
                                            value={newEvent.endDate}
                                            onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-sm font-semibold text-slate-700">Статус</label>
                                            <div className="group relative">
                                                <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                    Черновик - подготовка; Активное - идет сейчас; Завершено - закончилось; Архив - скрыто из списка
                                                </div>
                                            </div>
                                        </div>
                                        <select
                                            value={newEvent.status}
                                            onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="DRAFT">Черновик</option>
                                            <option value="ACTIVE">Активное</option>
                                            <option value="COMPLETED">Завершено</option>
                                            <option value="ARCHIVED">Архив</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-sm font-semibold text-slate-700">Видимость</label>
                                            <div className="group relative">
                                                <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                    Публичное - видят все; Приватное - только участники; Скрытое - только администраторы
                                                </div>
                                            </div>
                                        </div>
                                        <select
                                            value={newEvent.visibility}
                                            onChange={(e) => setNewEvent({ ...newEvent, visibility: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="PUBLIC">Публичное</option>
                                            <option value="PRIVATE">Приватное</option>
                                            <option value="HIDDEN">Скрытое</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="text-sm font-semibold text-slate-700">Тип дашборда</label>
                                        <div className="group relative">
                                            <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-80 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                Рейтинг - таблица лидеров; Трекер - календарь активности; Лента - хронология событий; Простой список - таблица с фильтрами
                                            </div>
                                        </div>
                                    </div>
                                    <select
                                        value={newEvent.dashboardType}
                                        onChange={(e) => setNewEvent({ ...newEvent, dashboardType: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="RANKING">Рейтинг</option>
                                        <option value="TRACKER">Трекер</option>
                                        <option value="FEED">Лента</option>
                                        <option value="SIMPLE_LIST">Простой список</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-sm font-semibold text-slate-700">Макс. команд</label>
                                            <div className="group relative">
                                                <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                    Максимальное количество команд, которые могут участвовать. Оставьте пустым для неограниченного количества
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Макс. команд"
                                            value={newEvent.maxTeams}
                                            onChange={(e) => setNewEvent({ ...newEvent, maxTeams: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-sm font-semibold text-slate-700">Макс. участников</label>
                                            <div className="group relative">
                                                <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                    Максимальное количество участников. Оставьте пустым для неограниченного количества
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Макс. участников"
                                            value={newEvent.maxParticipants}
                                            onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="text-sm font-semibold text-slate-700">Множитель баллов</label>
                                        <div className="group relative">
                                            <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-80 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                Коэффициент умножения всех баллов в мероприятии. Например, 1.5 = все баллы увеличиваются в 1.5 раза. По умолчанию 1.0
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="Множитель баллов (например, 1.5)"
                                        value={newEvent.pointsMultiplier}
                                        onChange={(e) => setNewEvent({ ...newEvent, pointsMultiplier: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newEvent.requiresActivityApproval}
                                            onChange={(e) => setNewEvent({ ...newEvent, requiresActivityApproval: e.target.checked })}
                                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Проверка активностей</span>
                                        <div className="group relative">
                                            <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-80 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                Если включено, все активности требуют одобрения администратора перед начислением баллов
                                            </div>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newEvent.notificationsEnabled}
                                            onChange={(e) => setNewEvent({ ...newEvent, notificationsEnabled: e.target.checked })}
                                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Уведомления</span>
                                        <div className="group relative">
                                            <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-80 p-2 bg-slate-800 text-white text-xs rounded-lg z-10">
                                                Отправлять уведомления участникам о начале, окончании и важных событиях мероприятия
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
                                                    {event.pinnedOnHomepage && (
                                                        <Pin className="w-4 h-4 text-purple-600" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1">
                                                    {new Date(event.startDate).toLocaleDateString('ru-RU')} - {new Date(event.endDate).toLocaleDateString('ru-RU')}
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                                                        {event.status}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                                                        {event.dashboardType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            {event.pinnedOnHomepage ? (
                                                <button
                                                    onClick={() => handleUnpinEvent(event.id)}
                                                    className="px-3 py-1 text-xs bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-all font-semibold"
                                                >
                                                    Открепить
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handlePinEvent(event.id)}
                                                    className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-semibold"
                                                >
                                                    Закрепить
                                                </button>
                                            )}
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
            </div>
        </div>
    );
};
