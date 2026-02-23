import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy, ArrowRight } from 'lucide-react';
import mockApi from '../api/mockApi';

interface Event {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    photoUrl?: string;
}

export const HomePage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await mockApi.events.getAll();
            setEvents(data);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-slate-600">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Мероприятия</h1>
                    <p className="text-xl text-slate-600">Выберите мероприятие для участия</p>
                </div>

                {events.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Нет активных мероприятий</h2>
                        <p className="text-slate-600">В данный момент нет доступных мероприятий</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map(event => (
                            <div
                                key={event.id}
                                className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1"
                                onClick={() => navigate(`/event/${event.id}`)}
                            >
                                {event.photoUrl && (
                                    <img 
                                        src={event.photoUrl} 
                                        alt={event.name}
                                        className="w-full h-48 object-cover rounded-2xl mb-4"
                                    />
                                )}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{event.name}</h3>
                                        <p className="text-slate-600 text-sm line-clamp-3">{event.description}</p>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-purple-600 flex-shrink-0 ml-4" />
                                </div>

                                <div className="border-t border-slate-200 pt-4 mt-4">
                                    <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                                        <span>
                                            {new Date(event.startDate).toLocaleDateString('ru-RU')}
                                        </span>
                                        <span>-</span>
                                        <span>
                                            {new Date(event.endDate).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                            {event.status === 'UPCOMING' ? 'Предстоящее' : 'Активное'}
                                        </span>
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                            <Trophy className="w-4 h-4" />
                                            Соревнование
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
