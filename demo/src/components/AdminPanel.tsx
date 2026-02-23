import React, { useState } from 'react';
import { Shield, Calendar, Users, Activity, Settings, Plus } from 'lucide-react';

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'events' | 'users' | 'settings'>('events');

    const mockEvents = [
        { id: 1, name: 'Весенний Марафон 2024', status: 'ACTIVE', participants: 45 },
        { id: 2, name: 'Велогонка по городу', status: 'UPCOMING', participants: 28 }
    ];

    const mockUsers = [
        { id: 1, name: 'Демо Пользователь', role: 'USER', team: 'Спортивные Энтузиасты' },
        { id: 2, name: 'Алексей Иванов', role: 'USER', team: 'Спортивные Энтузиасты' },
        { id: 3, name: 'Мария Петрова', role: 'MODERATOR', team: 'Спортивные Энтузиасты' }
    ];

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900">Панель администратора</h1>
                            <p className="text-slate-600">Управление мероприятиями и пользователями</p>
                        </div>
                    </div>

                    <div className="flex gap-2 border-b border-slate-200">
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
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                activeTab === 'settings'
                                    ? 'text-purple-600 border-b-2 border-purple-600'
                                    : 'text-slate-600 hover:text-purple-600'
                            }`}
                        >
                            <Settings className="w-5 h-5" />
                            Настройки
                        </button>
                    </div>
                </div>

                {activeTab === 'events' && (
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Мероприятия</h2>
                            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                                <Plus className="w-5 h-5" />
                                Создать мероприятие
                            </button>
                        </div>

                        <div className="space-y-4">
                            {mockEvents.map((event) => (
                                <div key={event.id} className="border-2 border-slate-200 rounded-2xl p-6 hover:border-purple-300 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">{event.name}</h3>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    event.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {event.status === 'ACTIVE' ? 'Активное' : 'Предстоящее'}
                                                </span>
                                                <span className="text-slate-600">
                                                    <Users className="w-4 h-4 inline mr-1" />
                                                    {event.participants} участников
                                                </span>
                                            </div>
                                        </div>
                                        <button className="px-6 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-semibold transition-all">
                                            Редактировать
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Пользователи</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Имя</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Роль</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Команда</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockUsers.map((user) => (
                                        <tr key={user.id} className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-900 font-medium">{user.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    user.role === 'MODERATOR' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {user.role === 'MODERATOR' ? 'Модератор' : 'Пользователь'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{user.team}</td>
                                            <td className="px-6 py-4">
                                                <button className="text-purple-600 hover:text-purple-700 font-semibold">
                                                    Редактировать
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Настройки системы</h2>
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-50 rounded-2xl">
                                <h3 className="font-bold text-slate-900 mb-2">Общие настройки</h3>
                                <p className="text-slate-600">Настройки приложения и системы (Demo режим)</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl">
                                <h3 className="font-bold text-slate-900 mb-2">Уведомления</h3>
                                <p className="text-slate-600">Управление уведомлениями пользователей</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl">
                                <h3 className="font-bold text-slate-900 mb-2">Интеграции</h3>
                                <p className="text-slate-600">Настройка внешних интеграций</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
