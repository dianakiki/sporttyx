import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy, Activity as ActivityIcon, Activity, List, TrendingUp, ArrowRight } from 'lucide-react';
import { TeamTracker } from './TeamTracker';
import { ActivityFeed } from './ActivityFeed';
import { SimpleList } from './SimpleList';
import axiosInstance from '../api/axiosConfig';
import { translateStatus, translateDashboardType } from '../utils/translations';

interface EventResponse {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    displayOnHomepage: boolean;
    dashboardTypes: string[];
    dashboardOrder?: string[];
    teamBasedCompetition?: boolean;
}

interface EventListItem {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    dashboardTypes: string[];
    dashboardOrder?: string[];
}

export const HomePage: React.FC = () => {
    const [displayedEvent, setDisplayedEvent] = useState<EventResponse | null>(null);
    const [allEvents, setAllEvents] = useState<EventListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDashboard, setActiveDashboard] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchHomepageData();
    }, []);

    const fetchHomepageData = async () => {
        try {
            // Проверяем, есть ли мероприятие для отображения на главной
            const displayedResponse = await axiosInstance.get('/events/displayed');
            
            if (displayedResponse.data) {
                setDisplayedEvent(displayedResponse.data);
                // Устанавливаем первый доступный дашборд как активный
                // dashboardOrder определяет порядок, но отображаем все dashboardTypes
                const orderedDashboards = (displayedResponse.data.dashboardOrder && displayedResponse.data.dashboardOrder.length > 0) 
                    ? displayedResponse.data.dashboardOrder 
                    : displayedResponse.data.dashboardTypes;
                if (orderedDashboards && orderedDashboards.length > 0) {
                    setActiveDashboard(orderedDashboards[0]);
                }
            } else {
                // Если нет отображаемого мероприятия, загружаем все активные
                const eventsResponse = await axiosInstance.get('/events/active');
                setAllEvents(eventsResponse.data);
            }
        } catch (error) {
            console.error('Error fetching homepage data:', error);
            // Если ошибка, загружаем все события
            try {
                const eventsResponse = await axiosInstance.get('/events/active');
                setAllEvents(eventsResponse.data);
            } catch (err) {
                console.error('Error fetching all events:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderDashboard = () => {
        if (!displayedEvent || !displayedEvent.dashboardTypes.includes(activeDashboard)) {
            return null;
        }
        
        // Используем dashboardOrder для порядка вкладок, если он задан
        const orderedDashboards = (displayedEvent.dashboardOrder && displayedEvent.dashboardOrder.length > 0) 
            ? displayedEvent.dashboardOrder 
            : displayedEvent.dashboardTypes;
        
        switch (activeDashboard) {
            case 'RANKING':
                return <TeamTracker 
                    dashboardTypes={orderedDashboards} 
                    activeDashboard={activeDashboard}
                    setActiveDashboard={setActiveDashboard}
                    eventId={displayedEvent.id}
                    teamBasedCompetition={displayedEvent.teamBasedCompetition}
                />;
            case 'TRACKER':
                return <TeamTracker 
                    dashboardTypes={orderedDashboards} 
                    activeDashboard={activeDashboard}
                    setActiveDashboard={setActiveDashboard}
                    eventId={displayedEvent.id}
                    teamBasedCompetition={displayedEvent.teamBasedCompetition}
                />;
            case 'FEED':
                return <ActivityFeed 
                    dashboardTypes={orderedDashboards} 
                    activeDashboard={activeDashboard}
                    setActiveDashboard={setActiveDashboard}
                    eventId={displayedEvent.id}
                />;
            case 'SIMPLE_LIST':
                return <SimpleList 
                    dashboardTypes={orderedDashboards} 
                    activeDashboard={activeDashboard}
                    setActiveDashboard={setActiveDashboard}
                    eventId={displayedEvent.id}
                    teamBasedCompetition={displayedEvent.teamBasedCompetition}
                />;
            default:
                return null;
        }
    };

    const getDashboardIcon = (type: string) => {
        switch (type) {
            case 'RANKING':
                return <Trophy className="w-5 h-5" />;
            case 'TRACKER':
                return <Activity className="w-5 h-5" />;
            case 'FEED':
                return <Calendar className="w-5 h-5" />;
            case 'SIMPLE_LIST':
                return <List className="w-5 h-5" />;
            default:
                return <Trophy className="w-5 h-5" />;
        }
    };

    const getDashboardName = (type: string) => {
        switch (type) {
            case 'RANKING':
                return 'Рейтинг';
            case 'TRACKER':
                return 'Трекер';
            case 'FEED':
                return 'Лента';
            case 'SIMPLE_LIST':
                return 'Список';
            default:
                return type;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-slate-600">Загрузка...</div>
            </div>
        );
    }

    // Если есть отображаемое мероприятие
    if (displayedEvent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                {/* Dashboard Content */}
                <div className="max-w-7xl mx-auto px-6 py-6">
                    {renderDashboard()}
                </div>
            </div>
        );
    }

    // Если нет отображаемого мероприятия - показываем список всех мероприятий
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Мероприятия</h1>
                    <p className="text-xl text-slate-600">Выберите мероприятие для участия</p>
                </div>

                {allEvents.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Нет активных мероприятий</h2>
                        <p className="text-slate-600">В данный момент нет доступных мероприятий</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allEvents.map(event => (
                            <div
                                key={event.id}
                                className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1"
                                onClick={() => navigate(`/event/${event.id}`)}
                            >
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
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            event.status === 'ACTIVE' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {translateStatus(event.status)}
                                        </span>
                                        {event.dashboardTypes.map(type => (
                                            <span key={type} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                                {getDashboardIcon(type)}
                                                {translateDashboardType(type)}
                                            </span>
                                        ))}
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
