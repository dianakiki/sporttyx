import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Camera, Save, Trash2, ArrowLeft, X } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

interface Participant {
    id: number;
    name: string;
    role: string;
}

interface TeamData {
    id: number;
    name: string;
    motto: string;
    imageUrl: string;
    participants: Participant[];
}

export const EditTeam: React.FC = () => {
    const navigate = useNavigate();
    const { teamId } = useParams();
    const [teamImage, setTeamImage] = useState<string>('');
    const [teamName, setTeamName] = useState('');
    const [motto, setMotto] = useState('');
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTeamData();
    }, []);

    const fetchTeamData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/teams/${teamId || '1'}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTeamName(data.name || '');
                setMotto(data.motto || '');
                setTeamImage(data.imageUrl || '');
                setParticipants(data.participants || []);
            } else {
                // Mock data
                setTeamName('Команда Чемпионов');
                setMotto('Вместе к победе! 🏆');
                setTeamImage('https://via.placeholder.com/200x200/3b82f6/ffffff?text=Team');
                setParticipants([
                    { id: 1, name: 'Иван Иванов', role: 'Капитан' },
                    { id: 2, name: 'Мария Петрова', role: 'Участник' },
                    { id: 3, name: 'Алексей Сидоров', role: 'Участник' },
                    { id: 4, name: 'Елена Смирнова', role: 'Участник' },
                ]);
            }
        } catch (err) {
            console.error('Error fetching team:', err);
            setTeamName('Команда Чемпионов');
            setMotto('Вместе к победе! 🏆');
            setParticipants([
                { id: 1, name: 'Иван Иванов', role: 'Капитан' },
                { id: 2, name: 'Мария Петрова', role: 'Участник' },
            ]);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTeamImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRoleChange = (participantId: number, newRole: string) => {
        setParticipants(participants.map(p => 
            p.id === participantId ? { ...p, role: newRole } : p
        ));
    };

    const handleRemoveParticipant = (participantId: number) => {
        if (window.confirm('Удалить участника из команды?')) {
            setParticipants(participants.filter(p => p.id !== participantId));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/teams/${teamId || '1'}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: teamName,
                    motto: motto,
                    imageUrl: teamImage,
                    participants: participants,
                }),
            });

            if (response.ok) {
                navigate('/my-team');
            } else {
                setError('Ошибка сохранения команды');
            }
        } catch (err) {
            setError('Ошибка подключения к серверу');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTeam = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить команду? Это действие необратимо!')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/teams/${teamId || '1'}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                navigate('/');
            } else {
                setError('Ошибка удаления команды');
            }
        } catch (err) {
            setError('Ошибка подключения к серверу');
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/my-team')}
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Назад к команде
                    </button>
                    <button
                        onClick={() => navigate('/my-team')}
                        className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all font-semibold"
                    >
                        Отмена
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Редактировать команду</h1>
                        <p className="text-slate-600">Обновите данные команды</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Team Image Upload */}
                        <div className="mb-6 flex flex-col items-center">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Изображение команды
                            </label>
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl">
                                    {teamImage ? (
                                        <img 
                                            src={teamImage} 
                                            alt="Team" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Users className="w-20 h-20 text-white" />
                                    )}
                                </div>
                                <label 
                                    htmlFor="team-image-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Camera className="w-10 h-10 text-white" />
                                </label>
                                <input
                                    id="team-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <Input
                            label="Название команды"
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Введите название команды"
                            required
                        />

                        <Input
                            label="Девиз команды"
                            type="text"
                            value={motto}
                            onChange={(e) => setMotto(e.target.value)}
                            placeholder="Например: Вместе к победе! 🏆"
                        />

                        {/* Participants Management */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Участники команды
                            </label>
                            <div className="space-y-3">
                                {participants.map((participant) => (
                                    <div key={participant.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900">{participant.name}</p>
                                        </div>
                                        <Select
                                            value={participant.role}
                                            onChange={(value) => handleRoleChange(participant.id, value)}
                                            options={[
                                                { value: 'Капитан', label: 'Капитан' },
                                                { value: 'Участник', label: 'Участник' }
                                            ]}
                                            className="w-40"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveParticipant(participant.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <Button type="submit" isLoading={isLoading} className="w-full">
                            <Save className="w-5 h-5" />
                            Сохранить
                        </Button>
                    </form>

                    {/* Delete Team Button */}
                    <div className="mt-8 pt-8 border-t border-slate-200">
                        <button
                            onClick={handleDeleteTeam}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-all"
                        >
                            <Trash2 className="w-5 h-5" />
                            Удалить команду
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
