import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Clock, Users, UserPlus, UserCheck, Activity as ActivityIcon } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import ReactMarkdown from 'react-markdown';
import { ActivityCard } from './ActivityCard';

interface Event {
    id: number;
    name: string;
    description: string;
    imageUrl?: string;
    startDate: string;
    endDate: string;
    status: string;
    teamBasedCompetition?: boolean;
}

interface EventNews {
    id: number;
    content: string;
    createdByName: string;
    createdByUsername: string;
    createdAt: string;
}

interface ActivityType {
    id: number;
    name: string;
    description: string;
    defaultEnergy: number;
}

export const EventCard: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [news, setNews] = useState<EventNews[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const [isParticipant, setIsParticipant] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [userActivities, setUserActivities] = useState<any[]>([]);
    const [isCaptain, setIsCaptain] = useState(false);
    const [activeEventId, setActiveEventId] = useState<number | null>(null);

    useEffect(() => {
        if (eventId) {
            console.log('EventCard: Fetching data for eventId:', eventId);
            fetchEventData();
            fetchActiveEvent();
        }
    }, [eventId]);

    // Refresh activities when returning to page (e.g., after editing)
    useEffect(() => {
        const handleFocus = () => {
            if (isParticipant && eventId) {
                fetchUserActivities();
            }
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [isParticipant, eventId]);

    const fetchEventData = async () => {
        try {
            console.log('EventCard: Starting to fetch event data...');
            const [eventRes, newsRes, activityTypesRes] = await Promise.all([
                axiosInstance.get(`/events/${eventId}`),
                axiosInstance.get(`/events/${eventId}/news`),
                axiosInstance.get(`/activity-types?eventId=${eventId}`)
            ]);
            setEvent(eventRes.data);
            setNews(newsRes.data);
            setActivityTypes(activityTypesRes.data || []);
            console.log('EventCard: Basic event data loaded');
            
            // Проверяем участие отдельно, чтобы не блокировать загрузку страницы
            try {
                const token = localStorage.getItem('token');
                console.log('EventCard: Checking participant status, token exists:', !!token);
                if (!token) {
                    // Если нет токена, пользователь точно не участник
                    console.log('EventCard: No token, setting isParticipant to false');
                    setIsParticipant(false);
                } else {
                    console.log('EventCard: Making request to /events/' + eventId + '/is-participant');
                    const isParticipantRes = await axiosInstance.get(`/events/${eventId}/is-participant`);
                    console.log('EventCard: Participant status response:', isParticipantRes.data);
                    setIsParticipant(isParticipantRes.data || false);
                    console.log('EventCard: Set isParticipant to:', isParticipantRes.data || false);
                }
            } catch (error: any) {
                console.error('EventCard: Error checking participant status:', error);
                console.error('EventCard: Error details:', error.response?.data, error.response?.status);
                // Если ошибка авторизации или любая другая, считаем что не участник
                setIsParticipant(false);
                console.log('EventCard: Set isParticipant to false due to error');
            }
        } catch (error) {
            console.error('EventCard: Error fetching event data:', error);
        } finally {
            setLoading(false);
            console.log('EventCard: Finished loading');
        }
    };

    const fetchActiveEvent = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const displayedResponse = await fetch('/api/events/displayed', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (displayedResponse.ok && displayedResponse.status !== 204) {
                const displayedEvent = await displayedResponse.json();
                if (displayedEvent && displayedEvent.id) {
                    setActiveEventId(displayedEvent.id);
                    return;
                }
            }
            
            const activeResponse = await fetch('/api/events/active', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (activeResponse.ok) {
                const activeEvents = await activeResponse.json();
                if (activeEvents && activeEvents.length > 0) {
                    setActiveEventId(activeEvents[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching active event:', error);
        }
    };

    const fetchUserActivities = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            if (!userId || !eventId || !token) return;

            const response = await fetch(`/api/participants/${userId}/events/${eventId}/activities`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const activities = await response.json();
                // Sort by creation date (newest first)
                const sortedActivities = activities.sort((a: any, b: any) => {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return dateB - dateA;
                });
                // Debug: log activity data to check blocking fields
                console.log('User activities loaded:', sortedActivities.map((a: any) => ({
                    id: a.id,
                    status: a.status,
                    isBlockedForEditing: a.isBlockedForEditing,
                    secondsUntilBlocking: a.secondsUntilBlocking
                })));
                setUserActivities(sortedActivities);
            }
        } catch (error) {
            console.error('Error fetching user activities:', error);
        }
    };

    const checkCaptainRole = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            if (!userId || !token) return;

            const userResponse = await fetch(`/api/participants/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                const teamId = userData.teamId;

                if (teamId) {
                    const teamResponse = await fetch(`/api/teams/${teamId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (teamResponse.ok) {
                        const teamData = await teamResponse.json();
                        const currentUserParticipant = teamData.participants?.find(
                            (p: any) => p.id.toString() === userId
                        );
                        const role = currentUserParticipant?.role;
                        setIsCaptain(
                            role === 'CAPTAIN' || 
                            role === 'Капитан' || 
                            role === 'КАПИТАН'
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error checking captain role:', error);
        }
    };

    useEffect(() => {
        if (isParticipant && eventId) {
            fetchUserActivities();
            checkCaptainRole();
        }
    }, [isParticipant, eventId]);

    const handleJoinEvent = async () => {
        if (!eventId) return;
        setJoining(true);
        try {
            await axiosInstance.post(`/events/${eventId}/join`);
            setIsParticipant(true);
            fetchUserActivities();
            checkCaptainRole();
            alert('Вы успешно присоединились к мероприятию!');
        } catch (error: any) {
            console.error('Error joining event:', error);
            if (error.response?.status === 400) {
                alert('Вы уже являетесь участником этого мероприятия');
            } else {
                alert('Ошибка при присоединении к мероприятию');
            }
        } finally {
            setJoining(false);
        }
    };

    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'DRAFT': 'Черновик',
            'ACTIVE': 'Активно',
            'COMPLETED': 'Завершено',
            'CANCELLED': 'Отменено'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colorMap: { [key: string]: string } = {
            'DRAFT': 'bg-slate-500',
            'ACTIVE': 'bg-green-500',
            'COMPLETED': 'bg-blue-500',
            'CANCELLED': 'bg-red-500'
        };
        return colorMap[status] || 'bg-slate-500';
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
                        <div className="flex items-start justify-between mb-4">
                            <h1 className="text-4xl font-bold text-slate-900">{event.name}</h1>
                            <span className={`px-4 py-2 rounded-full text-white text-sm font-semibold ${getStatusColor(event.status)}`}>
                                {getStatusLabel(event.status)}
                            </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-6 text-slate-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">Дата начала:</span>
                                <span>{formatDate(event.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">Дата окончания:</span>
                                <span>{formatDate(event.endDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-600" />
                                <span className="font-medium">Тип мероприятия:</span>
                                <span>{event.teamBasedCompetition ? 'Командное' : 'Индивидуальное'}</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            {isParticipant ? (
                                <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl font-semibold border-2 border-green-300">
                                    <UserCheck className="w-5 h-5" />
                                    Участник
                                </div>
                            ) : (
                                <button
                                    onClick={handleJoinEvent}
                                    disabled={joining}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    {joining ? 'Присоединение...' : 'Присоединиться'}
                                </button>
                            )}
                        </div>

                        {event.description && (
                            <div className="prose prose-slate max-w-none mb-6">
                                <ReactMarkdown>{event.description}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>

                {activityTypes.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ActivityIcon className="w-6 h-6 text-purple-600" />
                            Типы активностей
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activityTypes.map((type) => (
                                <div
                                    key={type.id}
                                    className="border-2 border-slate-200 rounded-2xl p-5 hover:border-purple-300 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-slate-900">{type.name}</h3>
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                            {type.defaultEnergy} баллов
                                        </span>
                                    </div>
                                    {type.description && (
                                        <p className="text-slate-600 text-sm">{type.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isParticipant && userActivities.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ActivityIcon className="w-6 h-6 text-blue-600" />
                            Мои активности
                        </h2>
                        <div className="space-y-4">
                            {userActivities.map((activity) => (
                                <ActivityCard
                                    key={activity.id}
                                    activity={activity}
                                    showSocialFeatures={true}
                                    onEdit={activity.status === 'PENDING' && activity.isBlockedForEditing !== true ? ((activityId) => {
                                        const url = activeEventId 
                                            ? `/add-activity?eventId=${activeEventId}&edit=${activityId}`
                                            : `/add-activity?edit=${activityId}`;
                                        navigate(url);
                                    }) : undefined}
                                />
                            ))}
                        </div>
                    </div>
                )}

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
