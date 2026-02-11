import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import { Team } from '../types';
import { Trophy } from 'lucide-react';

export const LeaderboardPage = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.teams.getAll().then(data => {
            setTeams(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Загрузка рейтинга...</div>;

    return (
        <div className="p-4 space-y-3">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-500 fill-yellow-500" /> Таблица лидеров
            </h2>
            {teams.map((team, index) => (
                <div key={team.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="font-bold text-lg w-6 text-center text-slate-400">#{index + 1}</div>
                    <div className="flex-1">
                        <div className="font-bold text-slate-900">{team.name}</div>
                        <div className="text-xs text-slate-500">{team.membersCount} участников</div>
                    </div>
                    <div className="font-bold text-xl text-blue-600">{team.points}</div>
                </div>
            ))}
        </div>
    );
};