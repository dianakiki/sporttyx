import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy, TrendingUp, Activity as ActivityIcon, List } from 'lucide-react';
import { translateDashboardType } from '../utils/translations';
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
}

interface ActivityFeedProps {
    dashboardTypes?: string[];
    activeDashboard?: string;
    setActiveDashboard?: (dashboard: string) => void;
    eventId?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
    dashboardTypes = [], 
    activeDashboard = 'FEED',
    setActiveDashboard,
    eventId
}) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchActivities(0, true);
    }, [eventId]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
                if (!isLoadingMore && hasMore) {
                    loadMoreActivities();
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoadingMore, hasMore, page]);

    const fetchActivities = async (pageNum: number, reset: boolean = false) => {
        try {
            if (reset) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            
            const token = localStorage.getItem('token');
            const eventParam = eventId ? `&eventId=${eventId}` : '';
            const response = await fetch(`/api/activities/all?page=${pageNum}&size=10${eventParam}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (reset) {
                    setActivities(data);
                } else {
                    setActivities(prev => [...prev, ...data]);
                }
                setHasMore(data.length === 10);
                setPage(pageNum);
            }
        } catch (err) {
            console.error('Error fetching activities:', err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const loadMoreActivities = () => {
        fetchActivities(page + 1, false);
    };

    const handleReaction = async (activityId: number, reactionType: string) => {
        try {
            const token = localStorage.getItem('token');
            const activity = activities.find(a => a.id === activityId);
            
            if (activity?.userReaction === reactionType) {
                await fetch(`/api/activities/${activityId}/reactions`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                
                // Update local state without reloading
                setActivities(prev => prev.map(a => {
                    if (a.id === activityId) {
                        const newReactionCounts = { ...a.reactionCounts };
                        if (newReactionCounts[reactionType]) {
                            newReactionCounts[reactionType]--;
                            if (newReactionCounts[reactionType] === 0) {
                                delete newReactionCounts[reactionType];
                            }
                        }
                        return {
                            ...a,
                            userReaction: undefined,
                            reactionCounts: newReactionCounts,
                            totalReactions: (a.totalReactions || 0) - 1
                        };
                    }
                    return a;
                }));
            } else {
                await fetch(`/api/activities/${activityId}/reactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ reactionType }),
                });
                
                // Update local state without reloading
                setActivities(prev => prev.map(a => {
                    if (a.id === activityId) {
                        const newReactionCounts = { ...a.reactionCounts };
                        
                        // Remove old reaction if exists
                        if (a.userReaction && newReactionCounts[a.userReaction]) {
                            newReactionCounts[a.userReaction]--;
                            if (newReactionCounts[a.userReaction] === 0) {
                                delete newReactionCounts[a.userReaction];
                            }
                        }
                        
                        // Add new reaction
                        newReactionCounts[reactionType] = (newReactionCounts[reactionType] || 0) + 1;
                        
                        return {
                            ...a,
                            userReaction: reactionType,
                            reactionCounts: newReactionCounts,
                            totalReactions: a.userReaction ? a.totalReactions : (a.totalReactions || 0) + 1
                        };
                    }
                    return a;
                }));
            }
        } catch (err) {
            console.error('Error reacting to activity:', err);
        }
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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-blue-600 text-xl">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Лента активностей</h1>
                    <p className="text-slate-600">Смотрите, чем занимаются участники прямо сейчас!</p>
                </div>

                {/* Dashboard Tabs - только если есть dashboardTypes */}
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

                {/* Activity Feed */}
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg">Пока нет активностей</p>
                            <p className="text-slate-400 text-sm mt-2">Будьте первым, кто добавит активность!</p>
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <ActivityCard
                                key={activity.id}
                                activity={activity}
                                onReact={handleReaction}
                                showSocialFeatures={true}
                            />
                        ))
                    )}
                    {isLoadingMore && (
                        <div className="text-center py-8">
                            <div className="text-blue-600">Загрузка...</div>
                        </div>
                    )}
                </div>

                {/* Motivational Footer */}
                {activities.length > 0 && (
                    <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-center text-white">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Присоединяйтесь к движению!</h3>
                        <p className="text-blue-100 mb-4">
                            Уже {activities.length} активностей добавлено сегодня. Не отставайте!
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/add-activity');
                            }}
                            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Добавить свою активность
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
