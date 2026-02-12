import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trophy, Calendar, UserPlus, LogOut, Edit } from 'lucide-react';
import { Button } from './ui/Button';
import { ActivityHeatmap } from './ActivityHeatmap';

interface Participant {
    id: number;
    name: string;
    role: string;
}

interface Activity {
    id: number;
    type: string;
    energy: number;
    createdAt: string;
    participantName: string;
    photoUrl?: string;
}

interface Team {
    id: number;
    name: string;
    imageUrl: string;
    totalPoints: number;
    motto?: string;
    rank?: number;
}

interface ActivityHeatmapData {
    date: string;
    count: number;
}

export const MyTeam: React.FC = () => {
    const navigate = useNavigate();
    const [team, setTeam] = useState<Team | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [heatmapData, setHeatmapData] = useState<ActivityHeatmapData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTeamData();
    }, []);

    const fetchTeamData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (!userId || !token) {
                console.error('No userId or token');
                return;
            }

            // Get user's team ID
            const userResponse = await fetch(`/api/participants/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!userResponse.ok) {
                console.error('Failed to fetch user data');
                return;
            }

            const userData = await userResponse.json();
            const teamId = userData.teamId;

            if (!teamId) {
                console.log('User has no team');
                return;
            }

            // Fetch team info
            const teamResponse = await fetch(`/api/teams/${teamId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (teamResponse.ok) {
                const teamData = await teamResponse.json();
                setTeam(teamData);
                setParticipants(teamData.participants || []);
            }

            // Fetch activities
            const activitiesResponse = await fetch(`/api/teams/${teamId}/activities`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (activitiesResponse.ok) {
                const activitiesData = await activitiesResponse.json();
                setActivities(activitiesData);
            }

            // Fetch activity heatmap
            const heatmapResponse = await fetch(`/api/teams/${teamId}/activity-heatmap`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (heatmapResponse.ok) {
                const heatmapData = await heatmapResponse.json();
                setHeatmapData(heatmapData);
            }

        } catch (error) {
            console.error('Error fetching team data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-slate-600">Загрузка...</div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-xl text-slate-600">Команда не найдена</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* Заголовок с изображением и названием команды */}
                <div className="bg-white rounded-3xl shadow-2xl p-10 mb-8">
                    <div className="flex flex-col items-center mb-8">
                        {/* Team Image */}
                        <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-xl mb-6 bg-gradient-to-br from-blue-500 to-blue-600">
                            <img 
                                src={team.imageUrl} 
                                alt={team.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        {/* Team Name with Edit Button */}
                        <div className="flex items-center gap-3 mb-4">
                            <h1 className="text-4xl font-bold text-slate-900">{team.name}</h1>
                            <button
                                onClick={() => navigate('/edit-team')}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                title="Редактировать команду"
                            >
                                <Edit className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {/* Motto */}
                        {team.motto && (
                            <div className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl border-2 border-blue-100">
                                <p className="text-lg font-medium text-blue-700 italic text-center">
                                    "{team.motto}"
                                </p>
                            </div>
                        )}
                        
                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            {team.rank && (
                                <div className={`px-6 py-2 rounded-2xl font-bold text-xl ${
                                    team.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                                    team.rank === 2 ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-white' :
                                    team.rank === 3 ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' :
                                    'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                } shadow-lg`}>
                                    {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : ''} {team.rank} место
                                </div>
                            )}
                            <div className="flex items-center gap-2 px-6 py-2 bg-blue-50 rounded-2xl">
                                <Trophy className="w-6 h-6 text-blue-600" />
                                <span className="text-xl font-bold text-blue-600">{team.totalPoints} баллов</span>
                            </div>
                        </div>
                    </div>

                    {/* Таблица участников */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Users className="w-7 h-7 text-blue-600" />
                            Участники
                        </h2>
                        <div className="bg-slate-50 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Имя</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Роль</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map((participant, index) => (
                                        <tr 
                                            key={participant.id}
                                            className={`${
                                                index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                                            } hover:bg-blue-50 transition-colors`}
                                        >
                                            <td className="px-6 py-4 text-slate-900 font-medium">
                                                {participant.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                                                    participant.role === 'Капитан' 
                                                        ? 'bg-blue-100 text-blue-700' 
                                                        : 'bg-slate-200 text-slate-700'
                                                }`}>
                                                    {participant.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Invite to Team Button */}
                        <div className="mt-6">
                            <Button 
                                onClick={() => navigate('/add-team')} 
                                variant="outline"
                                className="w-full"
                            >
                                <UserPlus className="w-5 h-5" />
                                Пригласить в команду
                            </Button>
                        </div>
                    </div>

                    {/* Activity Heatmap */}
                    <div className="mb-8">
                        <ActivityHeatmap activities={heatmapData} />
                    </div>

                    {/* Секция активностей */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Calendar className="w-7 h-7 text-blue-600" />
                                Активности
                            </h2>
                            <button
                                onClick={() => navigate('/add-activity')}
                                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Добавить</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    onClick={() => navigate(`/activity/${activity.id}`)}
                                    className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                                >
                                    {/* Activity Photo */}
                                    {activity.photoUrl ? (
                                        <div className="w-full h-48 overflow-hidden bg-slate-100">
                                            <img 
                                                src={activity.photoUrl} 
                                                alt={activity.type}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center">
                                            <Calendar className="w-16 h-16 text-blue-300" />
                                        </div>
                                    )}
                                    
                                    {/* Activity Info */}
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">{activity.type}</h3>
                                                <p className="text-sm text-slate-600">{activity.participantName}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {activity.energy}
                                                </div>
                                                <div className="text-xs text-slate-500">баллов</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                            {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Дата не указана'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {activities.length === 0 && (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl">
                                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 text-lg">Активностей пока нет</p>
                                <Button
                                    onClick={() => navigate('/add-activity')}
                                    className="w-auto mt-4"
                                >
                                    Добавить первую активность
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Leave Team Button - subtle and faded */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => {
                            if (window.confirm('Вы уверены, что хотите покинуть команду?')) {
                                // Handle leave team logic
                                console.log('Leave team');
                            }
                        }}
                        className="text-sm text-slate-400 hover:text-red-500 transition-colors underline"
                    >
                        Покинуть команду
                    </button>
                </div>
            </div>
        </div>
    );
};
