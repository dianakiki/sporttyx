import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, Users, Medal, ArrowLeft } from 'lucide-react';

interface TeamRanking {
    id: number;
    name: string;
    totalPoints: number;
    participantCount: number;
    rank: number;
}

export const TeamTracker: React.FC = () => {
    const [teams, setTeams] = useState<TeamRanking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ranking' | 'track'>('ranking');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTeamRankings();
    }, []);

    const fetchTeamRankings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/teams/rankings', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTeams(data);
            } else {
                // Мок-данные для демонстрации
                const mockData: TeamRanking[] = [
                    { id: 1, name: 'Команда Чемпионов', totalPoints: 2450, participantCount: 5, rank: 1 },
                    { id: 2, name: 'Спортивные Львы', totalPoints: 2180, participantCount: 6, rank: 2 },
                    { id: 3, name: 'Энергия Победы', totalPoints: 1950, participantCount: 4, rank: 3 },
                    { id: 4, name: 'Быстрые Гепарды', totalPoints: 1720, participantCount: 5, rank: 4 },
                    { id: 5, name: 'Стальные Титаны', totalPoints: 1580, participantCount: 7, rank: 5 },
                    { id: 6, name: 'Огненные Драконы', totalPoints: 1340, participantCount: 4, rank: 6 },
                    { id: 7, name: 'Морские Волки', totalPoints: 1120, participantCount: 5, rank: 7 },
                    { id: 8, name: 'Горные Орлы', totalPoints: 980, participantCount: 3, rank: 8 },
                ];
                setTeams(mockData);
            }
        } catch (err) {
            console.error('Error fetching team rankings:', err);
            // Мок-данные при ошибке
            const mockData: TeamRanking[] = [
                { id: 1, name: 'Команда Чемпионов', totalPoints: 2450, participantCount: 5, rank: 1 },
                { id: 2, name: 'Спортивные Львы', totalPoints: 2180, participantCount: 6, rank: 2 },
                { id: 3, name: 'Энергия Победы', totalPoints: 1950, participantCount: 4, rank: 3 },
                { id: 4, name: 'Быстрые Гепарды', totalPoints: 1720, participantCount: 5, rank: 4 },
                { id: 5, name: 'Стальные Титаны', totalPoints: 1580, participantCount: 7, rank: 5 },
                { id: 6, name: 'Огненные Драконы', totalPoints: 1340, participantCount: 4, rank: 6 },
                { id: 7, name: 'Морские Волки', totalPoints: 1120, participantCount: 5, rank: 7 },
                { id: 8, name: 'Горные Орлы', totalPoints: 980, participantCount: 3, rank: 8 },
            ];
            setTeams(mockData);
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

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6 shadow-xl">
                        <Trophy className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-slate-900 mb-4">Трекер команд</h1>
                    <p className="text-slate-600 text-xl">Сравнительный рейтинг всех команд</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('ranking')}
                        className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
                            activeTab === 'ranking'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                : 'bg-white text-slate-600 hover:bg-slate-50 shadow-md'
                        }`}
                    >
                        📊 Рейтинг
                    </button>
                    <button
                        onClick={() => setActiveTab('track')}
                        className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
                            activeTab === 'track'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                : 'bg-white text-slate-600 hover:bg-slate-50 shadow-md'
                        }`}
                    >
                        🏁 Трекер
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 mb-8">

                    {teams.length > 0 ? (
                        <>
                        {activeTab === 'ranking' ? (
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
                        ) : (
                        /* Track View */
                        <div className="space-y-6">
                            {teams.map((team) => {
                                const position = getTrackPosition(team.totalPoints);
                                return (
                                    <div key={team.id} className="relative">
                                        {/* Team Name */}
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-slate-900 text-lg truncate">
                                                {team.name}
                                            </h3>
                                            <span className="text-sm text-slate-600 font-semibold">
                                                {team.totalPoints} баллов
                                            </span>
                                        </div>
                                        
                                        {/* Track */}
                                        <div className="relative h-8 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 rounded-full border-2 border-slate-200 overflow-visible">
                                            {/* Progress Fill */}
                                            <div 
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-100 to-blue-50 transition-all duration-1000 rounded-full"
                                                style={{ width: `${position}%` }}
                                            />
                                            
                                            {/* Team Icon - Map Pin Style */}
                                            <div 
                                                className="absolute transition-all duration-1000"
                                                style={{ left: `${position}%`, top: '-56px', transform: `translateX(-50%)` }}
                                            >
                                                <div className="flex flex-col items-center">
                                                    {/* Pin Circle */}
                                                    <div className={`relative w-16 h-16 rounded-full ${getTeamColor(team.rank)} flex items-center justify-center text-white font-bold text-xl shadow-xl`}>
                                                        {team.rank === 1 ? (
                                                            <div className="text-3xl">👑</div>
                                                        ) : (
                                                            team.name.charAt(0)
                                                        )}
                                                    </div>
                                                    {/* Pin Tip - connected seamlessly */}
                                                    <div className={`w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent -mt-1 ${team.rank === 1 ? 'border-t-[16px] border-t-yellow-500' : team.rank === 2 ? 'border-t-[16px] border-t-slate-400' : team.rank === 3 ? 'border-t-[16px] border-t-amber-600' : 'border-t-[16px] border-t-blue-500'}`}></div>
                                                </div>
                                            </div>
                                            
                                            {/* Start Flag */}
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xl">
                                                🏁
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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
