import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Trophy, Activity, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';

interface Activity {
    id: number;
    type: string;
    energy: number;
    date: string;
    photoUrl?: string;
    participantName: string;
}

interface Team {
    id: number;
    name: string;
    totalPoints: number;
    activities: Activity[];
    participantCount: number;
}

export const TeamProfile: React.FC = () => {
    const { teamId } = useParams<{ teamId: string }>();
    const [team, setTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTeamProfile();
    }, [teamId]);

    const fetchTeamProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/teams/${teamId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTeam(data);
            }
        } catch (err) {
            console.error('Error fetching team profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-blue-600 text-xl">Загрузка...</div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 mb-4">Команда не найдена</p>
                    <Button onClick={() => navigate('/profile')}>
                        Вернуться в профиль
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Назад
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                <Users className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">{team.name}</h1>
                                <p className="text-slate-500 mt-1">
                                    {team.participantCount} {team.participantCount === 1 ? 'участник' : 'участников'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-4 rounded-xl">
                            <Trophy className="w-8 h-8 text-blue-600" />
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Всего баллов</p>
                                <p className="text-3xl font-bold text-blue-600">{team.totalPoints}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-600" />
                        Активности команды
                    </h2>

                    {team.activities && team.activities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {team.activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {activity.photoUrl && (
                                        <img
                                            src={activity.photoUrl}
                                            alt={activity.type}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-slate-800 text-lg">
                                                    {activity.type}
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    {activity.participantName}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
                                                <span className="text-blue-600 font-bold text-lg">
                                                    {activity.energy}
                                                </span>
                                                <span className="text-blue-600">⚡</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-400">
                                            {new Date(activity.date).toLocaleDateString('ru-RU', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p>У команды пока нет активностей</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
