import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Activity as ActivityIcon, List } from 'lucide-react';
import { ActivityCard } from './ActivityCard';

interface Activity {
    id: number;
    type: string;
    energy: number;
    participantName: string;
    photoUrl?: string;
    photoUrls?: string[];
    createdAt: string;
    reactionCounts?: { [key: string]: number };
    userReaction?: string;
    totalReactions?: number;
    commentCount?: number;
    description?: string;
    participantId?: number;
    participantAvatarUrl?: string;
    teamName?: string;
    teamId?: number;
}

interface ActivityFeedProps {
    dashboardTypes?: string[];
    activeDashboard?: string;
    setActiveDashboard?: (dashboard: string) => void;
    eventId?: number;
}

const mockActivities: Activity[] = [
    {
        id: 1,
        type: 'Бег',
        energy: 52,
        participantName: 'Демо Пользователь',
        participantId: 1,
        participantAvatarUrl: 'https://i.pravatar.cc/150?img=1',
        teamName: 'Спортивные Энтузиасты',
        teamId: 1,
        description: 'Утренняя пробежка в парке',
        photoUrls: ['https://picsum.photos/seed/run1/800/600'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        reactionCounts: { LIKE: 5, FIRE: 3 },
        commentCount: 2
    },
    {
        id: 2,
        type: 'Велосипед',
        energy: 128,
        participantName: 'Алексей Иванов',
        participantId: 2,
        participantAvatarUrl: 'https://i.pravatar.cc/150?img=2',
        teamName: 'Спортивные Энтузиасты',
        teamId: 1,
        description: 'Велопрогулка по набережной',
        photoUrls: ['https://picsum.photos/seed/bike1/800/600', 'https://picsum.photos/seed/bike2/800/600'],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        reactionCounts: { LIKE: 8, FIRE: 2 },
        commentCount: 1
    },
    {
        id: 3,
        type: 'Плавание',
        energy: 75,
        participantName: 'Мария Петрова',
        participantId: 3,
        participantAvatarUrl: 'https://i.pravatar.cc/150?img=5',
        teamName: 'Спортивные Энтузиасты',
        teamId: 1,
        description: 'Плавание в бассейне',
        photoUrls: ['https://picsum.photos/seed/swim1/800/600'],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        reactionCounts: { LIKE: 3 },
        commentCount: 0
    }
];

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
    dashboardTypes = [], 
    activeDashboard = 'FEED',
    setActiveDashboard,
    eventId
}) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, [eventId]);

    const loadActivities = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setActivities(mockActivities);
        } catch (error) {
            console.error('Error loading activities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReaction = async (activityId: number, reactionType: string) => {
        console.log('Reaction:', activityId, reactionType);
    };

    const getDashboardIcon = (type: string) => {
        switch (type) {
            case 'RANKING':
                return <Trophy className="w-5 h-5" />;
            case 'TRACKER':
                return <ActivityIcon className="w-5 h-5" />;
            case 'FEED':
                return <Calendar className="w-5 h-5" />;
            case 'SIMPLE_LIST':
                return <List className="w-5 h-5" />;
            default:
                return <Trophy className="w-5 h-5" />;
        }
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-slate-600">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Лента активностей</h1>
                </div>

                {dashboardTypes.length > 0 && setActiveDashboard && (
                    <div className="flex gap-4 mb-8 justify-center">
                        {dashboardTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveDashboard(type)}
                                className={`flex items-center gap-2 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
                                    activeDashboard === type
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                        : 'bg-white text-slate-600 hover:bg-slate-50 shadow-md'
                                }`}
                            >
                                {getDashboardIcon(type)}
                                {translateDashboardType(type)}
                            </button>
                        ))}
                    </div>
                )}

                <div className="space-y-6">
                    {activities.map((activity) => (
                        <ActivityCard
                            key={activity.id}
                            activity={{
                                ...activity,
                                teamBasedCompetition: true
                            }}
                            onReact={handleReaction}
                            showSocialFeatures={true}
                        />
                    ))}
                </div>

                {activities.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-3xl shadow-xl">
                        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg">Активностей пока нет</p>
                    </div>
                )}
            </div>
        </div>
    );
};
