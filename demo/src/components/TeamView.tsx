import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Trophy, TrendingUp, Crown } from 'lucide-react';
import mockApi from '../api/mockApi';

interface Team {
    id: number;
    name: string;
    description: string;
    photoUrl?: string;
    totalPoints: number;
    memberCount: number;
}

interface Member {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    points: number;
    role: string;
}

export const TeamView: React.FC = () => {
    const { teamId } = useParams<{ teamId: string }>();
    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTeam();
    }, [teamId]);

    const loadTeam = async () => {
        try {
            const id = parseInt(teamId || '1');
            const teamData = await mockApi.teams.getById(id);
            const membersData = await mockApi.teams.getMembers(id);
            setTeam(teamData);
            setMembers(membersData);
        } catch (error) {
            console.error('Error loading team:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-slate-600">Загрузка...</div>
            </div>
        );
    }

    if (!team) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        {team.photoUrl && (
                            <div className="flex-shrink-0">
                                <img
                                    src={team.photoUrl}
                                    alt={team.name}
                                    className="w-48 h-48 rounded-3xl object-cover shadow-lg"
                                />
                            </div>
                        )}

                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">{team.name}</h1>
                            <p className="text-xl text-slate-600 mb-6">{team.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <Trophy className="w-8 h-8" />
                                    </div>
                                    <div className="text-3xl font-bold mb-1">{team.totalPoints}</div>
                                    <div className="text-sm opacity-90">Всего баллов</div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <div className="text-3xl font-bold mb-1">{team.memberCount}</div>
                                    <div className="text-sm opacity-90">Участников</div>
                                </div>

                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <TrendingUp className="w-8 h-8" />
                                    </div>
                                    <div className="text-3xl font-bold mb-1">
                                        {Math.round(team.totalPoints / team.memberCount)}
                                    </div>
                                    <div className="text-sm opacity-90">Средний балл</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Участники команды</h2>
                    
                    <div className="space-y-3">
                        {members.map((member, index) => (
                            <div 
                                key={member.id} 
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <img
                                        src={member.photoUrl || 'https://i.pravatar.cc/150'}
                                        alt={`${member.firstName} ${member.lastName}`}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900">
                                                {member.firstName} {member.lastName}
                                            </span>
                                            {member.role === 'CAPTAIN' && (
                                                <Crown className="w-4 h-4 text-yellow-500" />
                                            )}
                                        </div>
                                        {member.role === 'CAPTAIN' && (
                                            <span className="text-sm text-slate-500">Капитан</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">{member.points}</div>
                                    <div className="text-sm text-slate-500">баллов</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
