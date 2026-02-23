import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, Check, X, Trophy } from 'lucide-react';

interface ActivityModeration {
    id: number;
    type: string;
    energy: number;
    participantName: string;
    teamName: string;
    photoUrls: string[];
    createdAt: string;
    description?: string;
}

interface ModerationStats {
    pendingCount: number;
    approvedByMe: number;
    rejectedByMe: number;
}

const mockActivities: ActivityModeration[] = [
    {
        id: 1,
        type: 'Бег',
        energy: 50,
        participantName: 'Иван Петров',
        teamName: 'Бегуны Города',
        photoUrls: ['https://picsum.photos/seed/mod1/800/600'],
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        description: 'Утренняя пробежка 5 км'
    },
    {
        id: 2,
        type: 'Велосипед',
        energy: 100,
        participantName: 'Мария Сидорова',
        teamName: 'Велосипедисты',
        photoUrls: ['https://picsum.photos/seed/mod2/800/600'],
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        description: 'Велопрогулка по парку'
    }
];

const mockStats: ModerationStats = {
    pendingCount: 2,
    approvedByMe: 15,
    rejectedByMe: 3
};

export const ModerationPanel: React.FC = () => {
    const [activities, setActivities] = useState<ActivityModeration[]>(mockActivities);
    const [stats, setStats] = useState<ModerationStats>(mockStats);

    const handleApprove = (activityId: number) => {
        setActivities(prev => prev.filter(a => a.id !== activityId));
        setStats(prev => ({
            ...prev,
            pendingCount: prev.pendingCount - 1,
            approvedByMe: prev.approvedByMe + 1
        }));
    };

    const handleReject = (activityId: number) => {
        const reason = prompt('Укажите причину отклонения:');
        if (reason) {
            setActivities(prev => prev.filter(a => a.id !== activityId));
            setStats(prev => ({
                ...prev,
                pendingCount: prev.pendingCount - 1,
                rejectedByMe: prev.rejectedByMe + 1
            }));
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 60) return `${diffMins} мин назад`;
        if (diffHours < 24) return `${diffHours} ч назад`;
        return date.toLocaleDateString('ru-RU');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">
                        Модерация активностей
                    </h1>
                    <p className="text-slate-600">
                        Проверка и одобрение активностей участников
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm mb-1">На модерации</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pendingCount}</p>
                            </div>
                            <Clock className="w-12 h-12 text-yellow-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm mb-1">Одобрено мной</p>
                                <p className="text-3xl font-bold text-green-600">{stats.approvedByMe}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm mb-1">Отклонено мной</p>
                                <p className="text-3xl font-bold text-red-600">{stats.rejectedByMe}</p>
                            </div>
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Нет активностей на модерации
                            </h3>
                            <p className="text-slate-600">
                                Все активности проверены!
                            </p>
                        </div>
                    ) : (
                        activities.map(activity => (
                            <div key={activity.id} className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {activity.photoUrls && activity.photoUrls.length > 0 && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={activity.photoUrls[0]}
                                                alt="Activity"
                                                className="w-full md:w-64 h-48 object-cover rounded-xl"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                                    {activity.type}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-2">
                                                    <span className="font-semibold">{activity.participantName}</span>
                                                    <span>•</span>
                                                    <span>{activity.teamName}</span>
                                                    <span>•</span>
                                                    <span>{formatTimeAgo(activity.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
                                                <Trophy className="w-5 h-5 text-blue-600" />
                                                <span className="font-bold text-blue-600">{activity.energy}</span>
                                            </div>
                                        </div>

                                        {activity.description && (
                                            <p className="text-slate-700 mb-4 p-3 bg-slate-50 rounded-lg text-sm">
                                                {activity.description}
                                            </p>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApprove(activity.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg transition-all"
                                            >
                                                <Check className="w-5 h-5" />
                                                Одобрить
                                            </button>
                                            <button
                                                onClick={() => handleReject(activity.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg transition-all"
                                            >
                                                <X className="w-5 h-5" />
                                                Отклонить
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
