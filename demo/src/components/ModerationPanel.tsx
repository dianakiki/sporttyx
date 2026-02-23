import React, { useState } from 'react';
import { Eye, Check, X, AlertCircle } from 'lucide-react';

export const ModerationPanel: React.FC = () => {
    const [activities, setActivities] = useState([
        {
            id: 1,
            participantName: 'Иван Петров',
            teamName: 'Бегуны Города',
            type: 'Бег',
            energy: 50,
            description: 'Утренняя пробежка 5 км',
            photoUrls: ['https://picsum.photos/seed/mod1/400/300'],
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            status: 'PENDING'
        },
        {
            id: 2,
            participantName: 'Мария Сидорова',
            teamName: 'Велосипедисты',
            type: 'Велосипед',
            energy: 100,
            description: 'Велопрогулка по парку',
            photoUrls: ['https://picsum.photos/seed/mod2/400/300'],
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            status: 'PENDING'
        }
    ]);

    const handleApprove = (id: number) => {
        setActivities(prev => prev.filter(a => a.id !== id));
        alert('Активность одобрена! (Demo режим)');
    };

    const handleReject = (id: number) => {
        const reason = prompt('Укажите причину отклонения:');
        if (reason) {
            setActivities(prev => prev.filter(a => a.id !== id));
            alert('Активность отклонена! (Demo режим)');
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
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Eye className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900">Панель модерации</h1>
                            <p className="text-slate-600">Проверка и одобрение активностей</p>
                        </div>
                    </div>
                </div>

                {activities.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Нет активностей на модерации</h2>
                        <p className="text-slate-600">Все активности проверены</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {activities.map((activity) => (
                            <div key={activity.id} className="bg-white rounded-3xl shadow-xl p-8">
                                <div className="flex items-start gap-6">
                                    {activity.photoUrls && activity.photoUrls.length > 0 && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={activity.photoUrls[0]}
                                                alt="Activity"
                                                className="w-64 h-48 object-cover rounded-2xl"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                                    {activity.type}
                                                </h3>
                                                <div className="flex items-center gap-4 text-slate-600 mb-2">
                                                    <span className="font-semibold">{activity.participantName}</span>
                                                    <span>•</span>
                                                    <span>{activity.teamName}</span>
                                                    <span>•</span>
                                                    <span>{formatTimeAgo(activity.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-bold">
                                                {activity.energy} баллов
                                            </div>
                                        </div>

                                        {activity.description && (
                                            <p className="text-slate-700 mb-6 p-4 bg-slate-50 rounded-xl">
                                                {activity.description}
                                            </p>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApprove(activity.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                            >
                                                <Check className="w-5 h-5" />
                                                Одобрить
                                            </button>
                                            <button
                                                onClick={() => handleReject(activity.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                            >
                                                <X className="w-5 h-5" />
                                                Отклонить
                                            </button>
                                        </div>
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
