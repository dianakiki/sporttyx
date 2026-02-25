import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Clock } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import ReactMarkdown from 'react-markdown';

interface Event {
    id: number;
    name: string;
    description: string;
    imageUrl?: string;
    startDate: string;
    endDate: string;
    status: string;
}

interface EventNews {
    id: number;
    content: string;
    createdByName: string;
    createdByUsername: string;
    createdAt: string;
}

export const EventCard: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [news, setNews] = useState<EventNews[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (eventId) {
            fetchEventData();
        }
    }, [eventId]);

    const fetchEventData = async () => {
        try {
            const [eventRes, newsRes] = await Promise.all([
                axiosInstance.get(`/events/${eventId}`),
                axiosInstance.get(`/events/${eventId}/news`)
            ]);
            setEvent(eventRes.data);
            setNews(newsRes.data);
        } catch (error) {
            console.error('Error fetching event data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
                <div className="text-xl text-slate-600">Загрузка...</div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
                <div className="text-xl text-slate-600">Мероприятие не найдено</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Назад
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
                    {event.imageUrl && (
                        <div className="w-full h-64 md:h-96 overflow-hidden">
                            <img
                                src={event.imageUrl}
                                alt={event.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    
                    <div className="p-8">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">{event.name}</h1>
                        
                        <div className="flex items-center gap-4 mb-6 text-slate-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                            </div>
                        </div>

                        {event.description && (
                            <div className="prose prose-slate max-w-none mb-6">
                                <ReactMarkdown>{event.description}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Новости мероприятия</h2>
                    
                    {news.length > 0 ? (
                        <div className="space-y-4">
                            {news.map((item) => (
                                <div
                                    key={item.id}
                                    className="border-2 border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                                                {item.createdByName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">{item.createdByName}</div>
                                                <div className="text-xs text-slate-500">@{item.createdByUsername}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            {formatDateTime(item.createdAt)}
                                        </div>
                                    </div>
                                    
                                    <div className="prose prose-slate max-w-none text-slate-700">
                                        <ReactMarkdown>{item.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg">Пока нет новостей</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
