import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { ModerationActivityCard } from './ModerationActivityCard';

interface ActivityModeration {
    id: number;
    type: string;
    energy: number;
    participantName: string;
    participantId: number;
    teamName: string;
    teamId: number;
    eventName: string;
    eventId: number;
    photoUrls: string[];
    status: string;
    createdAt: string;
}

interface ModerationStats {
    pendingCount: number;
    approvedByMe: number;
    rejectedByMe: number;
}

export const ModerationPanel: React.FC = () => {
    const [activities, setActivities] = useState<ActivityModeration[]>([]);
    const [stats, setStats] = useState<ModerationStats | null>(null);
    const [filters, setFilters] = useState({
        eventId: null as number | null,
        teamId: null as number | null,
        page: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPendingActivities();
        fetchStats();
    }, [filters]);

    const fetchPendingActivities = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: filters.page.toString(),
                size: '20'
            });
            if (filters.eventId) params.append('eventId', filters.eventId.toString());
            if (filters.teamId) params.append('teamId', filters.teamId.toString());

            const response = await fetch(`/api/moderation/activities/pending?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
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

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/moderation/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleApprove = async (activityId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/moderation/activities/${activityId}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setActivities(prev => prev.filter(a => a.id !== activityId));
                fetchStats();
            }
        } catch (err) {
            console.error('Error approving activity:', err);
        }
    };

    const handleReject = async (activityId: number, reason: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/moderation/activities/${activityId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            if (response.ok) {
                setActivities(prev => prev.filter(a => a.id !== activityId));
                fetchStats();
            }
        } catch (err) {
            console.error('Error rejecting activity:', err);
        }
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

                {stats && (
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
                )}

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="bg-white rounded-2xl p-12 text-center">
                            <p className="text-slate-600">Загрузка...</p>
                        </div>
                    ) : activities.length === 0 ? (
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
                            <ModerationActivityCard
                                key={activity.id}
                                activity={activity}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
