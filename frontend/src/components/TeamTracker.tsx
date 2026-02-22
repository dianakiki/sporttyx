import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, Users, Medal, ArrowLeft, Activity, Calendar, List, User } from 'lucide-react';
import { translateDashboardType } from '../utils/translations';

interface TeamRanking {
    id: number;
    name: string;
    totalPoints: number;
    participantCount: number;
    rank: number;
    currentStreak?: number;
    activeDays?: number;
    last14Days?: boolean[];
}

interface ParticipantRanking {
    id: number;
    name: string;
    username: string;
    totalPoints: number;
    rank: number;
    profileImageUrl?: string;
}

interface TeamTrackerProps {
    dashboardTypes?: string[];
    activeDashboard?: string;
    setActiveDashboard?: (dashboard: string) => void;
    eventId?: number;
    teamBasedCompetition?: boolean;
}

export const TeamTracker: React.FC<TeamTrackerProps> = ({ 
    dashboardTypes = [], 
    activeDashboard = 'RANKING',
    setActiveDashboard,
    eventId,
    teamBasedCompetition = true
}) => {
    const [teams, setTeams] = useState<TeamRanking[]>([]);
    const [participants, setParticipants] = useState<ParticipantRanking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTeamRankings();
    }, [eventId, teamBasedCompetition, activeDashboard]);

    const fetchTeamRankings = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!teamBasedCompetition && eventId) {
                // Загружаем индивидуальный рейтинг
                const response = await fetch(`/api/participants/rankings?eventId=${eventId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setParticipants(data);
                }
            } else {
                // Для трекера загружаем статистику регулярности, для остальных - обычный рейтинг
                const endpoint = activeDashboard === 'TRACKER' 
                    ? '/api/teams/regularity-stats' 
                    : '/api/teams/rankings';
                    
                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setTeams(data);
                }
            }
        } catch (err) {
            console.error('Error fetching rankings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getMedalIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Medal className="w-8 h-8 text-yellow-500" />;
            case 2:
                return <Medal className="w-8 h-8 text-slate-400" />;
            case 3:
                return <Medal className="w-8 h-8 text-amber-600" />;
            default:
                return null;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'from-yellow-50 to-yellow-100 border-yellow-200';
            case 2:
                return 'from-slate-50 to-slate-100 border-slate-200';
            case 3:
                return 'from-amber-50 to-amber-100 border-amber-200';
            default:
                return 'from-white to-slate-50 border-slate-200';
        }
    };

    const getTrackPosition = (points: number) => {
        if (teams.length === 0) return 0;
        const maxPoints = teams[0]?.totalPoints || 1;
        // Лидер на 85% дорожки, остальные пропорционально
        return Math.min((points / maxPoints) * 85, 85);
    };

    const getTeamColor = (rank: number) => {
        if (rank === 1) return 'bg-yellow-500 border-yellow-600'; // Gold
        if (rank === 2) return 'bg-slate-400 border-slate-500';   // Silver
        if (rank === 3) return 'bg-amber-600 border-amber-700';   // Bronze
        return 'bg-blue-500 border-blue-600'; // All others - blue
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-blue-600 text-xl">Загрузка...</div>
            </div>
        );
    }

    const getDashboardIcon = (type: string) => {
        switch (type) {
            case 'RANKING':
                return <Trophy className="w-5 h-5" />;
            case 'TRACKER':
                return <Activity className="w-5 h-5" />;
            case 'FEED':
                return <Calendar className="w-5 h-5" />;
            case 'SIMPLE_LIST':
                return <List className="w-5 h-5" />;
            default:
                return <Trophy className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">
                        {teamBasedCompetition ? 'Трекер команд' : 'Рейтинг участников'}
                    </h1>
                </div>

                {/* Dashboard Tabs - только если есть dashboardTypes */}
                {dashboardTypes.length > 0 && setActiveDashboard && (
                    <div className="flex gap-4 mb-8 justify-center">
                        {dashboardTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveDashboard(type)}
                                className={`flex items-center gap-2 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
                                    activeDashboard === type
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                        : 'bg-white text-slate-600 hover:bg-slate-50 shadow-md'
                                }`}
                            >
                                {getDashboardIcon(type)}
                                {translateDashboardType(type)}
                            </button>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 mb-8">

                    {!teamBasedCompetition && participants.length > 0 ? (
                        /* Individual Rankings */
                        <div className="space-y-5">
                            {participants.map((participant) => (
                                <div
                                    key={participant.id}
                                    onClick={() => navigate(`/participant/${participant.id}`)}
                                    className={`relative bg-gradient-to-r ${getRankColor(participant.rank)} border-2 rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-2 hover:scale-[1.02]`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-16 text-center">
                                            {participant.rank <= 3 ? (
                                                getMedalIcon(participant.rank)
                                            ) : (
                                                <div className="text-3xl font-bold text-slate-400">
                                                    {participant.rank}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">
                                                {participant.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <User className="w-4 h-4" />
                                                <span className="text-sm">@{participant.username}</span>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 text-right">
                                            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="text-sm text-slate-600 font-medium">Баллы</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {participant.totalPoints}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {participant.rank === 1 && (
                                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                            Лидер
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : teams.length > 0 ? (
                        <>
                        {activeDashboard === 'TRACKER' ? (
                        /* Regularity View - Рейтинг регулярности */
                        <div className="space-y-6">
                            {teams.map((team) => {
                                const streak = team.currentStreak || 0;
                                const activeDays = team.activeDays || 0;
                                const last14Days = team.last14Days || Array(14).fill(false);
                                const avgPointsPerDay = activeDays > 0 ? Math.round(team.totalPoints / activeDays) : 0;
                                
                                return (
                                    <div key={team.id} className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-2xl p-6 hover:shadow-xl transition-all">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full ${getTeamColor(team.rank)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                                    {team.rank === 1 ? '👑' : team.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg">{team.name}</h3>
                                                    <p className="text-sm text-slate-500">{team.participantCount} участников</p>
                                                </div>
                                            </div>
                                            
                                            {/* Streak Badge */}
                                            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg">
                                                <span className="text-2xl">🔥</span>
                                                <div className="text-right">
                                                    <p className="text-xs font-semibold opacity-90">Серия</p>
                                                    <p className="text-xl font-bold">{streak} дн</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            <div className="bg-white rounded-xl p-3 text-center border border-slate-200">
                                                <p className="text-2xl font-bold text-blue-600">{activeDays}</p>
                                                <p className="text-xs text-slate-600 font-semibold">Активных дней</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-3 text-center border border-slate-200">
                                                <p className="text-2xl font-bold text-green-600">{team.totalPoints}</p>
                                                <p className="text-xs text-slate-600 font-semibold">Всего баллов</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-3 text-center border border-slate-200">
                                                <p className="text-2xl font-bold text-purple-600">{avgPointsPerDay}</p>
                                                <p className="text-xs text-slate-600 font-semibold">Баллов/день</p>
                                            </div>
                                        </div>
                                        
                                        {/* Activity Calendar - Last 14 days */}
                                        <div>
                                            <p className="text-xs text-slate-600 font-semibold mb-2">Последние 14 дней</p>
                                            <div className="flex gap-1.5">
                                                {last14Days.map((hasActivity, index) => {
                                                    const isToday = index === last14Days.length - 1;
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`flex-1 h-12 rounded-lg transition-all ${
                                                                hasActivity
                                                                    ? 'bg-gradient-to-br from-green-400 to-green-500 shadow-md hover:scale-110'
                                                                    : 'bg-slate-100 hover:bg-slate-200'
                                                            } ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                                            title={`День ${index + 1}${isToday ? ' (Сегодня)' : ''}`}
                                                        >
                                                            {hasActivity && (
                                                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                                                                    ✓
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        
                                        {/* Motivation Message */}
                                        {streak >= 7 && (
                                            <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                                                <span className="text-2xl">⭐</span>
                                                <p className="text-sm font-semibold text-orange-800">
                                                    Отличная серия! Продолжайте в том же духе!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        ) : (
                        /* Regular Ranking View */
                        <div className="space-y-5">
                            {teams.map((team, index) => (
                                <div
                                    key={team.id}
                                    onClick={() => navigate(`/team/${team.id}`)}
                                    className={`relative bg-gradient-to-r ${getRankColor(team.rank)} border-2 rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-2 hover:scale-[1.02]`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-16 text-center">
                                            {team.rank <= 3 ? (
                                                getMedalIcon(team.rank)
                                            ) : (
                                                <div className="text-3xl font-bold text-slate-400">
                                                    {team.rank}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">
                                                {team.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Users className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {team.participantCount} {team.participantCount === 1 ? 'участник' : 'участников'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 text-right">
                                            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="text-sm text-slate-600 font-medium">Баллы</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {team.totalPoints}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {team.rank === 1 && (
                                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                            Лидер
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        )}
                        </>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p>Пока нет команд в рейтинге</p>
                        </div>
                    )}
                </div>

                {teams.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-3xl p-8 border-2 border-blue-100 shadow-lg">
                        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-7 h-7 text-blue-600" />
                            Статистика
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                                <p className="text-sm font-semibold text-slate-600 mb-2">Всего команд</p>
                                <p className="text-4xl font-bold text-blue-600">{teams.length}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                                <p className="text-sm font-semibold text-slate-600 mb-2">Лучший результат</p>
                                <p className="text-4xl font-bold text-blue-600">
                                    {teams[0]?.totalPoints || 0}
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                                <p className="text-sm font-semibold text-slate-600 mb-2">Средний балл</p>
                                <p className="text-4xl font-bold text-blue-600">
                                    {teams.length > 0
                                        ? Math.round(
                                              teams.reduce((sum, t) => sum + t.totalPoints, 0) / teams.length
                                          )
                                        : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
