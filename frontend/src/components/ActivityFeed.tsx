import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy, User, Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react';

interface Activity {
    id: number;
    type: string;
    energy: number;
    participantName: string;
    photoUrl?: string;
    createdAt: string;
}

export const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/activities/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }
        } catch (err) {
            console.error('Error fetching activities:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин назад`;
        if (diffHours < 24) return `${diffHours} ч назад`;
        if (diffDays < 7) return `${diffDays} дн назад`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    const getActivityEmoji = (type: string) => {
        const emojiMap: { [key: string]: string } = {
            'Бег': '🏃',
            'Плавание': '🏊',
            'Велосипед': '🚴',
            'Йога': '🧘',
            'Футбол': '⚽',
            'Баскетбол': '🏀',
            'Теннис': '🎾',
            'Волейбол': '🏐',
            'Тренажерный зал': '💪',
            'Танцы': '💃',
        };
        return emojiMap[type] || '🏃';
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

                {/* Stats Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-around">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{activities.length}</div>
                            <div className="text-sm text-slate-600">Активностей</div>
                        </div>
                        <div className="w-px h-12 bg-slate-200"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                                {activities.reduce((sum, a) => sum + a.energy, 0)}
                            </div>
                            <div className="text-sm text-slate-600">Всего баллов</div>
                        </div>
                        <div className="w-px h-12 bg-slate-200"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">
                                {new Set(activities.map(a => a.participantName)).size}
                            </div>
                            <div className="text-sm text-slate-600">Участников</div>
                        </div>
                    </div>
                </div>

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
                            <div
                                key={activity.id}
                                onClick={() => navigate(`/activity/${activity.id}`)}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                            >
                                {/* Post Header */}
                                <div className="p-4 flex items-center justify-between border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {activity.participantName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{activity.participantName}</div>
                                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                                <span className="text-lg">{getActivityEmoji(activity.type)}</span>
                                                {activity.type}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        {formatTimeAgo(activity.createdAt)}
                                    </div>
                                </div>

                                {/* Post Image */}
                                {activity.photoUrl ? (
                                    <div className="relative">
                                        <img
                                            src={activity.photoUrl}
                                            alt={activity.type}
                                            className="w-full h-96 object-cover"
                                        />
                                        {/* Energy Badge on Image */}
                                        <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                                            <Trophy className="w-5 h-5" />
                                            <span className="font-bold text-lg">{activity.energy}</span>
                                            <span className="text-sm">баллов</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative h-64 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-8xl mb-4">{getActivityEmoji(activity.type)}</div>
                                            <div className="text-2xl font-bold text-slate-700">{activity.type}</div>
                                        </div>
                                        {/* Energy Badge */}
                                        <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                                            <Trophy className="w-5 h-5" />
                                            <span className="font-bold text-lg">{activity.energy}</span>
                                            <span className="text-sm">баллов</span>
                                        </div>
                                    </div>
                                )}

                                {/* Post Footer */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between text-slate-600">
                                        <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                                            <Heart className="w-5 h-5" />
                                            <span className="text-sm font-medium">Нравится</span>
                                        </button>
                                        <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                                            <MessageCircle className="w-5 h-5" />
                                            <span className="text-sm font-medium">Комментарий</span>
                                        </button>
                                        <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                                            <Share2 className="w-5 h-5" />
                                            <span className="text-sm font-medium">Поделиться</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
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
