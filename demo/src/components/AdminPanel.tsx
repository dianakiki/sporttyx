import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, HelpCircle, Plus, ChevronRight, Edit, Search } from 'lucide-react';

interface EventListItem {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    displayOnHomepage: boolean;
}

interface Participant {
    id: number;
    username: string;
    name: string;
    email: string;
    role: string;
}

const mockEvents: EventListItem[] = [
    {
        id: 1,
        name: 'Весенний Марафон 2024',
        startDate: '2024-03-15T09:00:00',
        endDate: '2024-03-15T15:00:00',
        status: 'ACTIVE',
        displayOnHomepage: true
    },
    {
        id: 2,
        name: 'Велогонка по городу',
        startDate: '2024-04-01T10:00:00',
        endDate: '2024-04-01T14:00:00',
        status: 'UPCOMING',
        displayOnHomepage: false
    }
];

const mockParticipants: Participant[] = [
    { id: 1, username: 'demo_user', name: 'Демо Пользователь', email: 'demo@sporttyx.com', role: 'USER' },
    { id: 2, username: 'runner_pro', name: 'Алексей Иванов', email: 'alex@example.com', role: 'USER' },
    { id: 3, username: 'swimmer_girl', name: 'Мария Петрова', email: 'maria@example.com', role: 'MODERATOR' }
];

export const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'events' | 'users' | 'bug-reports'>('events');
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [events] = useState<EventListItem[]>(mockEvents);
    const [participants] = useState<Participant[]>(mockParticipants);

    const translateStatus = (status: string) => {
        const translations: { [key: string]: string } = {
            'ACTIVE': 'Активное',
            'UPCOMING': 'Предстоящее',
            'DRAFT': 'Черновик',
            'COMPLETED': 'Завершено'
        };
        return translations[status] || status;
    };

    const translateRole = (role: string) => {
        const translations: { [key: string]: string } = {
            'USER': 'Пользователь',
            'MODERATOR': 'Модератор',
            'ADMIN': 'Администратор'
        };
        return translations[role] || role;
    };

    const filteredParticipants = participants.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">
                        Панель администратора
                    </h1>
                    <p className="text-slate-600">
                        Управление мероприятиями и пользователями
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg mb-6">
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                                activeTab === 'events'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-slate-600 hover:text-blue-600'
                            }`}
                        >
                            <Calendar className="w-5 h-5" />
                            Мероприятия
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                                activeTab === 'users'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-slate-600 hover:text-blue-600'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            Пользователи
                        </button>
                        <button
                            onClick={() => setActiveTab('bug-reports')}
                            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                                activeTab === 'bug-reports'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-slate-600 hover:text-blue-600'
                            }`}
                        >
                            <HelpCircle className="w-5 h-5" />
                            Баг-репорты
                        </button>
                    </div>
                </div>

                {activeTab === 'events' && !selectedEventId && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-slate-900">Мероприятия</h2>
                            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all">
                                <Plus className="w-5 h-5" />
                                Создать мероприятие
                            </button>
                        </div>

                        {events.map((event) => (
                            <div
                                key={event.id}
                                onClick={() => setSelectedEventId(event.id)}
                                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{event.name}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                            <span>{new Date(event.startDate).toLocaleDateString('ru-RU')} - {new Date(event.endDate).toLocaleDateString('ru-RU')}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                event.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {translateStatus(event.status)}
                                            </span>
                                            {event.displayOnHomepage && (
                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                                    На главной
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-slate-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Пользователи</h2>
                            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all">
                                <Plus className="w-5 h-5" />
                                Создать пользователя
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Поиск пользователей..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Имя пользователя</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Имя</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Роль</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Действия</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredParticipants.map((participant) => (
                                        <tr key={participant.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-900">{participant.username}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{participant.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{participant.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    participant.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                    participant.role === 'MODERATOR' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {translateRole(participant.role)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1">
                                                    <Edit className="w-4 h-4" />
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

                {activeTab === 'bug-reports' && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Нет баг-репортов</h3>
                        <p className="text-slate-600">Все отчеты о проблемах обработаны</p>
                    </div>
                )}
            </div>
        </div>
    );
};
