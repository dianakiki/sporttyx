import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Users, Upload, X, UserPlus, Search } from 'lucide-react';

interface Participant {
    id: number;
    name: string;
}

export const CreateTeamForm: React.FC = () => {
    const [name, setName] = useState('');
    const [motto, setMotto] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Participant[]>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Размер файла не должен превышать 10 МБ');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
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

        if (!name.trim()) {
            setError('Введите название команды');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            const participantIds = selectedParticipants.map(p => p.id);
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: name.trim(),
                    motto: motto.trim() || null,
                    participantIds: participantIds,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || 'Ошибка создания команды');
                setIsLoading(false);
                return;
            }

            const team = await response.json();
            
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                
                await fetch(`/api/teams/${team.id}/upload-image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });
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
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Создать команду</h1>
                        <p className="text-slate-500">Придумайте название, загрузите фото и пригласите участников</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Фото команды */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Фото команды
                            </label>
                            {imagePreview ? (
                                <div className="relative w-48 h-48 mx-auto">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-2xl shadow-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-12 h-12 text-slate-400 mb-3" />
                                        <p className="mb-2 text-sm text-slate-600 font-medium">
                                            Нажмите для загрузки фото
                                        </p>
                                        <p className="text-xs text-slate-500">PNG, JPG до 10MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Название команды */}
                        <Input
                            label="Название команды *"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Введите название команды"
                            required
                        />

                        {/* Девиз */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Девиз команды (необязательно)
                            </label>
                            <textarea
                                value={motto}
                                onChange={(e) => setMotto(e.target.value)}
                                placeholder="Введите девиз команды..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Поиск и добавление участников */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Пригласить участников (необязательно)
                            </label>
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Начните вводить имя участника..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                    {isSearching && (
                                        <div className="absolute right-3 top-3.5">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}
                                </div>
                                
                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                        {searchResults.map((participant) => (
                                            <button
                                                key={participant.id}
                                                type="button"
                                                onClick={() => addParticipant(participant)}
                                                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-0"
                                            >
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {participant.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-slate-800">{participant.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Выбранные участники */}
                        {selectedParticipants.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Приглашенные участники ({selectedParticipants.length})
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedParticipants.map((participant) => (
                                        <div
                                            key={participant.id}
                                            className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-xl group hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {participant.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-slate-800 font-medium">{participant.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeParticipant(participant.id)}
                                                className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
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
                                className="px-6"
                            >
                                Отмена
                            </Button>
                            <Button type="submit" isLoading={isLoading} className="flex-1">
                                Создать команду
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
