import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Trophy, Calendar, ArrowLeft } from 'lucide-react';
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
    photoUrl?: string;
    photoUrls?: string[];
}

interface Team {
    id: number;
    name: string;
    imageUrl: string;
    totalPoints: number;
    motto?: string;
    rank?: number;
}

const mockTeam: Team = {
    id: 1,
    name: "Спортивные Энтузиасты",
    imageUrl: "https://picsum.photos/seed/team1/400/300",
    totalPoints: 5420,
    motto: "Вместе к вершинам!",
    rank: 1
};

const mockParticipants: Participant[] = [
    { id: 1, name: "Демо Пользователь", role: "Капитан" },
    { id: 2, name: "Алексей Иванов", role: "Участник" },
    { id: 3, name: "Мария Петрова", role: "Участник" },
    { id: 4, name: "Максим Сидоров", role: "Участник" }
];

const mockActivities: Activity[] = [
    {
        id: 1,
        type: 'Бег',
        energy: 52,
        participantName: 'Демо Пользователь',
        photoUrls: ['https://picsum.photos/seed/run1/800/600'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 2,
        type: 'Велосипед',
        energy: 128,
        participantName: 'Алексей Иванов',
        photoUrls: ['https://picsum.photos/seed/bike1/800/600'],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    }
];

export const TeamView: React.FC = () => {
    const navigate = useNavigate();
    const { teamId } = useParams();
    const [team, setTeam] = useState<Team | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTeamMember] = useState(true);

    useEffect(() => {
        loadTeam();
    }, [teamId]);

    const loadTeam = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setTeam(mockTeam);
            setParticipants(mockParticipants);
            setActivities(mockActivities);
        } catch (error) {
            console.error('Error loading team:', error);
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

                <div className="bg-white rounded-3xl shadow-2xl p-10 mb-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-xl mb-6 bg-gradient-to-br from-green-500 to-green-600">
                            <img 
                                src={team.imageUrl} 
                                alt={team.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">{team.name}</h1>
                        
                        {team.motto && (
                            <div className="mb-6 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100">
                                <p className="text-lg font-medium text-green-700 italic text-center">
                                    "{team.motto}"
                                </p>
                            </div>
                        )}
                        
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

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-7 h-7 text-green-600" />
                            Активности
                        </h2>
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <ActivityCard
                                    key={activity.id}
                                    activity={activity}
                                    showSocialFeatures={false}
                                />
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
