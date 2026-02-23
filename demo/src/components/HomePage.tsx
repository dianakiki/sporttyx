import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy, ArrowRight, Activity, List } from 'lucide-react';
import { TeamTracker } from './TeamTracker';
import { ActivityFeed } from './ActivityFeed';
import { SimpleList } from './SimpleList';

interface Event {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    photoUrl?: string;
    displayOnHomepage?: boolean;
    dashboardTypes?: string[];
    dashboardOrder?: string[];
    teamBasedCompetition?: boolean;
}

const mockDisplayedEvent: Event = {
    id: 1,
    name: "Весенний Марафон 2024",
    description: "Ежегодный марафон для всех желающих",
    startDate: "2024-03-15T09:00:00",
    endDate: "2024-03-15T15:00:00",
    status: "ACTIVE",
    displayOnHomepage: true,
    dashboardTypes: ['RANKING', 'TRACKER', 'FEED', 'SIMPLE_LIST'],
    dashboardOrder: ['RANKING', 'TRACKER', 'FEED', 'SIMPLE_LIST'],
    teamBasedCompetition: true
};

const mockEvents: Event[] = [
    {
        id: 1,
        name: "Весенний Марафон 2024",
        description: "Ежегодный марафон для всех желающих",
        startDate: "2024-03-15T09:00:00",
        endDate: "2024-03-15T15:00:00",
        status: "ACTIVE",
        photoUrl: "https://picsum.photos/seed/event1/800/400",
        dashboardTypes: ['RANKING', 'TRACKER', 'FEED'],
        teamBasedCompetition: true
    },
    {
        id: 2,
        name: "Велогонка по городу",
        description: "Соревнование среди велосипедистов",
        startDate: "2024-04-01T10:00:00",
        endDate: "2024-04-01T14:00:00",
        status: "UPCOMING",
        photoUrl: "https://picsum.photos/seed/event2/800/400",
        dashboardTypes: ['RANKING', 'FEED'],
        teamBasedCompetition: false
    }
];

export const HomePage: React.FC = () => {
    const [displayedEvent, setDisplayedEvent] = useState<Event | null>(null);
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDashboard, setActiveDashboard] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setDisplayedEvent(mockDisplayedEvent);
            const orderedDashboards = mockDisplayedEvent.dashboardOrder || mockDisplayedEvent.dashboardTypes || [];
            if (orderedDashboards.length > 0) {
                setActiveDashboard(orderedDashboards[0]);
            }
        } catch (error) {
            console.error('Error loading events:', error);
            setAllEvents(mockEvents);
        } finally {
            setLoading(false);
        }
    };

    const renderDashboard = () => {
        if (!displayedEvent || !displayedEvent.dashboardTypes?.includes(activeDashboard)) {
            return null;
        }
        
        const orderedDashboards = displayedEvent.dashboardOrder || displayedEvent.dashboardTypes;
        
        switch (activeDashboard) {
            case 'RANKING':
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

    const translateStatus = (status: string) => {
        const translations: { [key: string]: string } = {
            'ACTIVE': 'Активное',
            'UPCOMING': 'Предстоящее',
            'COMPLETED': 'Завершено'
        };
        return translations[status] || status;
    };

    const translateDashboardType = (type: string) => {
        const translations: { [key: string]: string } = {
            'RANKING': 'Рейтинг',
            'TRACKER': 'Трекер',
            'FEED': 'Лента',
            'SIMPLE_LIST': 'Список'
        };
        return translations[type] || type;
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-slate-600">Загрузка...</div>
            </div>
        );
    }

    if (displayedEvent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    {renderDashboard()}
                </div>
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
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            event.status === 'ACTIVE' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {translateStatus(event.status)}
                                        </span>
                                        {event.dashboardTypes?.map(type => (
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
