import React, { useState, useEffect } from 'react';
import { Heart, Flame, ThumbsUp, MessageCircle, Calendar, MapPin } from 'lucide-react';
import mockApi from '../api/mockApi';

interface Activity {
    id: number;
    participantId: number;
    activityType: string;
    distance: number;
    duration: number;
    date: string;
    description: string;
    photoUrls: string[];
    points: number;
    participant: {
        firstName: string;
        lastName: string;
        photoUrl?: string;
    };
    reactions: any[];
    comments: any[];
}

export const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            const data = await mockApi.activities.getAll();
            setActivities(data);
        } catch (error) {
            console.error('Error loading activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityTypeLabel = (type: string) => {
        const types: { [key: string]: string } = {
            RUNNING: 'Бег',
            CYCLING: 'Велосипед',
            SWIMMING: 'Плавание',
            WALKING: 'Ходьба',
            GYM: 'Тренажерный зал'
        };
        return types[type] || type;
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
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-slate-900 mb-8">Лента активностей</h1>

                <div className="space-y-6">
                    {activities.map(activity => (
                        <div key={activity.id} className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all">
                            <div className="flex items-start gap-4 mb-4">
                                <img
                                    src={activity.participant.photoUrl || 'https://i.pravatar.cc/150'}
                                    alt={`${activity.participant.firstName} ${activity.participant.lastName}`}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900">
                                        {activity.participant.firstName} {activity.participant.lastName}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {new Date(activity.date).toLocaleDateString('ru-RU', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                    {getActivityTypeLabel(activity.activityType)}
                                </span>
                            </div>

                            {activity.description && (
                                <p className="text-slate-700 mb-4">{activity.description}</p>
                            )}

                            <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-2xl">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{activity.distance} км</div>
                                    <div className="text-sm text-slate-500">Дистанция</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{activity.duration} мин</div>
                                    <div className="text-sm text-slate-500">Время</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{activity.points}</div>
                                    <div className="text-sm text-slate-500">Баллы</div>
                                </div>
                            </div>

                            {activity.photoUrls && activity.photoUrls.length > 0 && (
                                <div className="mb-4 grid grid-cols-2 gap-2">
                                    {activity.photoUrls.map((url, idx) => (
                                        <img
                                            key={idx}
                                            src={url}
                                            alt={`Activity photo ${idx + 1}`}
                                            className="w-full h-64 object-cover rounded-2xl"
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                                <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <Heart className="w-5 h-5" />
                                    <span>{activity.reactions.filter(r => r.reactionType === 'LIKE').length}</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                                    <Flame className="w-5 h-5" />
                                    <span>{activity.reactions.filter(r => r.reactionType === 'FIRE').length}</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                                    <MessageCircle className="w-5 h-5" />
                                    <span>{activity.comments.length}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
