import React, { useState, useEffect } from 'react';
import { Users, Shield, Activity } from 'lucide-react';
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

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'participants' | 'teams' | 'activities'>('participants');
    
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    
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
            </div>
        </div>
    );
};
