import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Users, Search, X, UserPlus } from 'lucide-react';

interface Participant {
    id: number;
    name: string;
}

interface Team {
    id: number;
    name: string;
}

export const AddTeamForm: React.FC = () => {
    const [team, setTeam] = useState<Team | null>(null);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Participant[]>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserTeam();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchUserTeam = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (!userId || !token) {
                console.error('No userId or token');
                navigate('/profile');
                return;
            }

            const userResponse = await fetch(`/api/participants/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!userResponse.ok) {
                console.error('Failed to fetch user data');
                navigate('/profile');
                return;
            }

            const userData = await userResponse.json();
            const teamId = userData.teamId;

            if (!teamId) {
                console.log('User has no team');
                navigate('/profile');
                return;
            }

            const teamResponse = await fetch(`/api/teams/${teamId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (teamResponse.ok) {
                const teamData = await teamResponse.json();
                setTeam({ id: teamData.id, name: teamData.name });
            }
        } catch (error) {
            console.error('Error fetching team data:', error);
            navigate('/profile');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/participants/search?query=${encodeURIComponent(searchQuery)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const addParticipant = (participant: Participant) => {
        if (!selectedParticipants.find(p => p.id === participant.id)) {
            setSelectedParticipants([...selectedParticipants, participant]);
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const removeParticipant = (id: number) => {
        setSelectedParticipants(selectedParticipants.filter(p => p.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!team) {
            setError('Команда не найдена');
            return;
        }

        if (selectedParticipants.length === 0) {
            setError('Выберите хотя бы одного участника');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            for (const participant of selectedParticipants) {
                const response = await fetch(`/api/teams/${team.id}/invite`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        participantId: participant.id,
                        message: message,
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    setError(data.message || `Ошибка приглашения ${participant.name}`);
                    setIsLoading(false);
                    return;
                }
            }

            navigate('/my-team');
        } catch (err) {
            setError('Ошибка подключения к серверу');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <UserPlus className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Пригласить в команду</h1>
                        <p className="text-slate-500">Найдите и пригласите участников</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Команда
                            </label>
                            <div className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                                {team ? team.name : 'Загрузка...'}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Сообщение (необязательно)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Напишите сообщение для приглашаемых участников..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Добавить участников
                            </label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Начните вводить имя участника..."
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                    {searchResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                            {searchResults.map((participant) => (
                                                <button
                                                    key={participant.id}
                                                    type="button"
                                                    onClick={() => addParticipant(participant)}
                                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-2"
                                                >
                                                    <UserPlus className="w-4 h-4 text-blue-600" />
                                                    {participant.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {isSearching && (
                                        <div className="absolute right-3 top-3">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {selectedParticipants.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Выбранные участники ({selectedParticipants.length})
                                </label>
                                <div className="space-y-2">
                                    {selectedParticipants.map((participant) => (
                                        <div
                                            key={participant.id}
                                            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg"
                                        >
                                            <span className="text-slate-800 font-medium">{participant.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeParticipant(participant.id)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/my-team')}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" isLoading={isLoading}>
                                Отправить приглашения
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
