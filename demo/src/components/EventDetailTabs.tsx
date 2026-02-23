import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, Clock } from 'lucide-react';
import mockApi from '../api/mockApi';

interface Event {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    maxParticipants: number;
    currentParticipants: number;
    photoUrl?: string;
    status: string;
    bonusPoints: number;
}

export const EventDetailTabs: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        loadEvent();
    }, [eventId]);

    const loadEvent = async () => {
        try {
            const id = parseInt(eventId || '1');
            const eventData = await mockApi.events.getById(id);
            const participantsData = await mockApi.events.getParticipants(id);
            setEvent(eventData);
            setParticipants(participantsData);
        } catch (error) {
            console.error('Error loading event:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!event) return;
        try {
            await mockApi.events.join(event.id);
            setIsRegistered(true);
            setEvent({ ...event, currentParticipants: event.currentParticipants + 1 });
        } catch (error) {
            console.error('Error registering for event:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-slate-600">Загрузка...</div>
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-5xl mx-auto">
                {event.photoUrl && (
                    <div className="mb-6">
                        <img
                            src={event.photoUrl}
                            alt={event.name}
                            className="w-full h-96 object-cover rounded-3xl shadow-xl"
                        />
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">{event.name}</h1>
                    <p className="text-xl text-slate-600 mb-6">{event.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 text-slate-600">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <div>
                                <div className="text-sm text-slate-500">Начало</div>
                                <div className="font-semibold">
                                    {new Date(event.startDate).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-600">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <div>
                                <div className="text-sm text-slate-500">Окончание</div>
                                <div className="font-semibold">
                                    {new Date(event.endDate).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-600">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <div>
                                <div className="text-sm text-slate-500">Место проведения</div>
                                <div className="font-semibold">{event.location}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-600">
                            <Users className="w-5 h-5 text-blue-500" />
                            <div>
                                <div className="text-sm text-slate-500">Участники</div>
                                <div className="font-semibold">
                                    {event.currentParticipants} / {event.maxParticipants}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-600">
                            <Trophy className="w-5 h-5 text-blue-500" />
                            <div>
                                <div className="text-sm text-slate-500">Бонусные баллы</div>
                                <div className="font-semibold text-green-600">+{event.bonusPoints}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleRegister}
                            disabled={isRegistered || event.currentParticipants >= event.maxParticipants}
                            className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${
                                isRegistered
                                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                    : event.currentParticipants >= event.maxParticipants
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl transform hover:-translate-y-0.5'
                            }`}
                        >
                            {isRegistered
                                ? 'Вы зарегистрированы'
                                : event.currentParticipants >= event.maxParticipants
                                ? 'Мест нет'
                                : 'Зарегистрироваться'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Участники</h2>
                    
                    {participants.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600">Пока нет участников</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {participants.map(participant => (
                                <div key={participant.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                                    <img
                                        src={participant.photoUrl || 'https://i.pravatar.cc/150'}
                                        alt={`${participant.firstName} ${participant.lastName}`}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="font-semibold text-slate-900">
                                            {participant.firstName} {participant.lastName}
                                        </div>
                                        <div className="text-sm text-slate-500">{participant.points} баллов</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
