import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Trophy, Calendar, ArrowLeft } from 'lucide-react';
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

export const TeamView: React.FC = () => {
    const navigate = useNavigate();
    const { teamId } = useParams();
    const [team, setTeam] = useState<Team | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [heatmapData, setHeatmapData] = useState<ActivityHeatmapData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTeamMember, setIsTeamMember] = useState(false);

    useEffect(() => {
        fetchTeamData();
    }, [teamId]);

    const fetchTeamData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            
            // Fetch team info
            const teamResponse = await fetch(`/api/teams/${teamId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (teamResponse.ok) {
                const teamData = await teamResponse.json();
                setTeam(teamData);
                setParticipants(teamData.participants || []);
                
                // Check if current user is a team member
                const userId = localStorage.getItem('userId');
                if (userId && teamData.participants) {
                    const isMember = teamData.participants.some((p: Participant) => p.id === parseInt(userId));
                    setIsTeamMember(isMember);
                }
            } else {
                // Mock data
                setTeam({
                    id: parseInt(teamId || '1'),
                    name: 'Спортивные Львы',
                    imageUrl: 'https://via.placeholder.com/200x200/10b981/ffffff?text=Team',
                    totalPoints: 2180,
                    motto: 'Сила в единстве! 💪',
                    rank: 2
                });

                setParticipants([
                    { id: 5, name: 'Мария Петрова', role: 'Капитан' },
                    { id: 6, name: 'Сергей Иванов', role: 'Участник' },
                    { id: 7, name: 'Анна Смирнова', role: 'Участник' },
                    { id: 8, name: 'Дмитрий Козлов', role: 'Участник' },
                    { id: 9, name: 'Елена Волкова', role: 'Участник' },
                    { id: 10, name: 'Игорь Соколов', role: 'Участник' },
                ]);
            }

            // Fetch activities
            const activitiesResponse = await fetch(`/api/teams/${teamId}/activities`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (activitiesResponse.ok) {
                const activitiesData = await activitiesResponse.json();
                setActivities(activitiesData);
            } else {
                // Mock activities
                setActivities([
                    { id: 10, type: 'Плавание', energy: 200, createdAt: '2024-02-11T10:00:00', participantName: 'Мария Петрова', photoUrl: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Swimming' },
                    { id: 11, type: 'Велосипед', energy: 180, createdAt: '2024-02-10T14:30:00', participantName: 'Сергей Иванов', photoUrl: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Cycling' },
                    { id: 12, type: 'Йога', energy: 100, createdAt: '2024-02-10T09:00:00', participantName: 'Анна Смирнова' },
                    { id: 13, type: 'Бег', energy: 150, createdAt: '2024-02-09T07:00:00', participantName: 'Дмитрий Козлов', photoUrl: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Running' },
                ]);
            }

            // Fetch activity heatmap
            const heatmapResponse = await fetch(`/api/teams/${teamId}/activity-heatmap`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (heatmapResponse.ok) {
                const heatmapData = await heatmapResponse.json();
                setHeatmapData(heatmapData);
            }
        } catch (err) {
            console.error('Error fetching team:', err);
            // Mock data on error
            setTeam({
                id: parseInt(teamId || '1'),
                name: 'Спортивные Львы',
                imageUrl: 'https://via.placeholder.com/200x200/10b981/ffffff?text=Team',
                totalPoints: 2180,
                motto: 'Сила в единстве! 💪',
                rank: 2
            });
            setParticipants([
                { id: 5, name: 'Мария Петрова', role: 'Капитан' },
                { id: 6, name: 'Сергей Иванов', role: 'Участник' }
            ]);
            setActivities([
                { id: 10, type: 'Плавание', energy: 200, createdAt: '2024-02-11T10:00:00', participantName: 'Мария Петрова', photoUrl: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Swimming' }
            ]);
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
                <div className="text-slate-600 text-xl">Команда не найдена</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Назад
                </button>

                {/* Team Header */}
                <div className="bg-white rounded-3xl shadow-2xl p-10 mb-8">
                    <div className="flex flex-col items-center mb-8">
                        {/* Team Image */}
                        <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-xl mb-6 bg-gradient-to-br from-green-500 to-green-600">
                            <img 
                                src={team.imageUrl} 
                                alt={team.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        {/* Team Name */}
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">{team.name}</h1>
                        
                        {/* Motto */}
                        {team.motto && (
                            <div className="mb-6 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100">
                                <p className="text-lg font-medium text-green-700 italic text-center">
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
                            <div className="flex items-center gap-2 px-6 py-2 bg-green-50 rounded-2xl">
                                <Trophy className="w-6 h-6 text-green-600" />
                                <span className="text-xl font-bold text-green-600">{team.totalPoints} баллов</span>
                            </div>
                        </div>
                        
                        {/* Action Buttons - Only for Team Members */}
                        {isTeamMember && (
                            <div className="mt-6 flex flex-wrap gap-3 justify-center">
                                <button
                                    onClick={() => navigate('/add-activity')}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                    Добавить активность
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Participants Table */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Users className="w-7 h-7 text-green-600" />
                            Участники ({participants.length})
                        </h2>
                        <div className="bg-slate-50 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Имя</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Роль</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map((participant) => (
                                        <tr key={participant.id} className="border-t border-slate-200 hover:bg-white transition-colors">
                                            <td className="px-6 py-4 text-slate-900 font-medium">{participant.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    participant.role === 'Капитан' 
                                                        ? 'bg-green-100 text-green-700' 
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
                    </div>

                    {/* Activity Heatmap */}
                    <div className="mb-8">
                        <ActivityHeatmap activities={heatmapData} />
                    </div>

                    {/* Activities Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-7 h-7 text-green-600" />
                            Активности
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    onClick={() => navigate(`/activity/${activity.id}`)}
                                    className="bg-white rounded-2xl border-2 border-slate-200 hover:border-green-300 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
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
                                        <div className="w-full h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                            <Calendar className="w-16 h-16 text-green-300" />
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
                                                <div className="text-2xl font-bold text-green-600">
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
