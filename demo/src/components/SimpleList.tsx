import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Calendar, TrendingUp, Filter, X, Trophy, Activity, List } from 'lucide-react';

interface TeamRanking {
    id: number;
    name: string;
    totalPoints: number;
    participantCount: number;
    rank: number;
}

interface SimpleListProps {
    dashboardTypes?: string[];
    activeDashboard?: string;
    setActiveDashboard?: (dashboard: string) => void;
    eventId?: number;
    teamBasedCompetition?: boolean;
}

type SortOption = 'alphabet' | 'created' | 'participants' | 'points';

const mockTeamRankings: TeamRanking[] = [
    { id: 1, name: "Спортивные Энтузиасты", totalPoints: 5420, participantCount: 8, rank: 1 },
    { id: 2, name: "Бегуны Города", totalPoints: 4890, participantCount: 6, rank: 2 },
    { id: 3, name: "Велосипедисты", totalPoints: 3200, participantCount: 5, rank: 3 }
];

export const SimpleList: React.FC<SimpleListProps> = ({ 
    dashboardTypes = [], 
    activeDashboard = 'SIMPLE_LIST',
    setActiveDashboard,
    eventId,
    teamBasedCompetition = true
}) => {
    const [teams, setTeams] = useState<TeamRanking[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<TeamRanking[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('points');
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadTeams();
    }, []);

    useEffect(() => {
        filterAndSortTeams();
    }, [teams, searchQuery, sortBy]);

    const loadTeams = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setTeams(mockTeamRankings);
        } catch (error) {
            console.error('Error loading teams:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterAndSortTeams = () => {
        let result = [...teams];

        if (searchQuery) {
            result = result.filter(team =>
                team.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        switch (sortBy) {
            case 'alphabet':
                result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
                break;
            case 'created':
                result.sort((a, b) => a.id - b.id);
                break;
            case 'participants':
                result.sort((a, b) => b.participantCount - a.participantCount);
                break;
            case 'points':
                result.sort((a, b) => b.totalPoints - a.totalPoints);
                break;
        }

        setFilteredTeams(result);
    };

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

    const translateDashboardType = (type: string) => {
        const translations: { [key: string]: string } = {
            'RANKING': 'Рейтинг',
            'TRACKER': 'Трекер',
            'FEED': 'Лента',
            'SIMPLE_LIST': 'Список'
        };
        return translations[type] || type;
    };

    const getSortLabel = (option: SortOption) => {
        switch (option) {
            case 'alphabet':
                return 'По алфавиту';
            case 'created':
                return 'По дате создания';
            case 'participants':
                return 'По участникам';
            case 'points':
                return 'По баллам';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-slate-600">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Список команд</h1>
                    <p className="text-slate-600">Поиск и фильтрация команд мероприятия</p>
                </div>

                {dashboardTypes.length > 0 && setActiveDashboard && (
                    <div className="flex gap-4 mb-8 justify-center flex-wrap">
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

                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
                    <div className="mb-8 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Поиск команды..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all font-semibold text-slate-700"
                            >
                                <Filter className="w-4 h-4" />
                                Фильтры
                            </button>
                            <div className="text-sm text-slate-600">
                                Найдено команд: <span className="font-bold text-slate-900">{filteredTeams.length}</span>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                                <p className="text-sm font-semibold text-slate-700 mb-3">Сортировка:</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {(['points', 'alphabet', 'created', 'participants'] as SortOption[]).map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => setSortBy(option)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                sortBy === option
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'bg-white text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            {getSortLabel(option)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {filteredTeams.length > 0 ? (
                        <div className="space-y-3">
                            {filteredTeams.map((team) => (
                                <div
                                    key={team.id}
                                    onClick={() => navigate(`/team/${team.id}`)}
                                    className="group flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-white border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {team.rank}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                                {team.name}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{team.participantCount} участников</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp className="w-4 h-4" />
                                                    <span className="font-semibold text-blue-600">{team.totalPoints} баллов</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 text-slate-400 group-hover:text-blue-600 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-semibold">Команды не найдены</p>
                            <p className="text-sm mt-2">Попробуйте изменить поисковый запрос</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
