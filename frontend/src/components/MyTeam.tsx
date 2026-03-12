import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trophy, Calendar, UserPlus, Edit } from 'lucide-react';
import { Button } from './ui/Button';
import { ActivityHeatmap } from './ActivityHeatmap';
import { ActivityCard } from './ActivityCard';

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
    participantId?: number;
    photoUrl?: string;
    photoUrls?: string[];
    status?: string;
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
    const [activeEventId, setActiveEventId] = useState<number | null>(null);
    const [isCaptain, setIsCaptain] = useState(false);

    useEffect(() => {
        fetchActiveEvent();
        fetchTeamData();
    }, []);

    const fetchActiveEvent = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Сначала пытаемся получить отображаемое мероприятие
            const displayedResponse = await fetch('/api/events/displayed', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (displayedResponse.ok && displayedResponse.status !== 204) {
                const displayedEvent = await displayedResponse.json();
                if (displayedEvent && displayedEvent.id) {
                    setActiveEventId(displayedEvent.id);
                    return;
                }
            }
            
            // Если нет отображаемого, получаем активные мероприятия
            const activeResponse = await fetch('/api/events/active', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (activeResponse.ok) {
                const activeEvents = await activeResponse.json();
                if (activeEvents && activeEvents.length > 0) {
                    // Берем первое активное мероприятие
                    setActiveEventId(activeEvents[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching active event:', error);
        }
    };

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
                
                // Check if current user is captain
                const currentUserParticipant = teamData.participants?.find(
                    (p: Participant) => p.id.toString() === userId
                );
                const role = currentUserParticipant?.role;
                setIsCaptain(
                    role === 'CAPTAIN' || 
                    role === 'Капитан' || 
                    role === 'КАПИТАН'
                );
            }

            // Fetch activities
            const activitiesResponse = await fetch(`/api/teams/${teamId}/activities`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (activitiesResponse.ok) {
                const activitiesData = await activitiesResponse.json();
                // Sort activities by creation date (newest first)
                const sortedActivities = activitiesData.sort((a: Activity, b: Activity) => {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return dateB - dateA;
                });
                setActivities(sortedActivities);
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
                    <p className="text-xl text-slate-600 mb-6">У вас пока нет команды</p>
                    <Button onClick={() => navigate('/create-team')}>
                        <Plus className="w-5 h-5" />
                        Создать команду
                    </Button>
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
                                onClick={() => {
                                    const url = activeEventId 
                                        ? `/add-activity?eventId=${activeEventId}`
                                        : '/add-activity';
                                    navigate(url);
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Добавить</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <ActivityCard
                                    key={activity.id}
                                    activity={activity}
                                    showSocialFeatures={false}
                                    onEdit={activity.status === 'PENDING' ? ((activityId) => {
                                        const url = activeEventId 
                                            ? `/add-activity?eventId=${activeEventId}&edit=${activityId}`
                                            : `/add-activity?edit=${activityId}`;
                                        navigate(url);
                                    }) : undefined}
                                />
                            ))}
                        </div>

                        {activities.length === 0 && (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl">
                                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 text-lg">Активностей пока нет</p>
                                <Button
                                    onClick={() => {
                                        const url = activeEventId 
                                            ? `/add-activity?eventId=${activeEventId}`
                                            : '/add-activity';
                                        navigate(url);
                                    }}
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
