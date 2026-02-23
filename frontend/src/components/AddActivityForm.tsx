import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Activity, Upload, Image as ImageIcon } from 'lucide-react';

interface Team {
    id: number;
    name: string;
}

interface Participant {
    id: number;
    name: string;
}

interface ActivityType {
    id: number;
    name: string;
    description?: string;
    defaultEnergy?: number;
}

export const AddActivityForm: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>([]);
    const [selectedActivityTypeId, setSelectedActivityTypeId] = useState('');
    const [activityTypeSearch, setActivityTypeSearch] = useState('');
    const [showActivityTypeDropdown, setShowActivityTypeDropdown] = useState(false);
    const [energy, setEnergy] = useState('');
    const [description, setDescription] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isTeamBased, setIsTeamBased] = useState(true);
    const [trackActivityDuration, setTrackActivityDuration] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserTeamAndActivityTypes();
    }, []);

    useEffect(() => {
        if (selectedTeamId) {
            fetchTeamParticipants(selectedTeamId);
        } else {
            setParticipants([]);
            setSelectedParticipantIds([]);
        }
    }, [selectedTeamId]);

    useEffect(() => {
        if (selectedActivityTypeId) {
            const activityType = activityTypes.find(at => at.id.toString() === selectedActivityTypeId);
            if (activityType?.defaultEnergy) {
                setEnergy(activityType.defaultEnergy.toString());
            }
        }
    }, [selectedActivityTypeId, activityTypes]);

    const fetchUserTeamAndActivityTypes = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            // Fetch user's team and event
            const userResponse = await fetch(`/api/participants/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.teamId) {
                    setSelectedTeamId(userData.teamId.toString());
                }
                
                // Fetch event info to check if it's team-based
                if (userData.eventId) {
                    const eventResponse = await fetch(`/api/events/${userData.eventId}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    
                    if (eventResponse.ok) {
                        const eventData = await eventResponse.json();
                        setIsTeamBased(eventData.teamBasedCompetition !== false);
                        setTrackActivityDuration(eventData.trackActivityDuration || false);
                    }
                    
                    // Fetch activity types for the user's event
                    const typesResponse = await fetch(`/api/activity-types?eventId=${userData.eventId}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    
                    if (typesResponse.ok) {
                        const typesData = await typesResponse.json();
                        setActivityTypes(typesData);
                    }
                } else {
                    // If no event, fetch all activity types (fallback)
                    const typesResponse = await fetch('/api/activity-types', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    
                    if (typesResponse.ok) {
                        const typesData = await typesResponse.json();
                        setActivityTypes(typesData);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const fetchTeamParticipants = async (teamId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/teams/${teamId}/participants`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setParticipants(data);
            }
        } catch (err) {
            console.error('Error fetching participants:', err);
        }
    };

    const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            // Validate file formats
            const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            const invalidFiles = files.filter(file => !allowedFormats.includes(file.type));
            
            if (invalidFiles.length > 0) {
                const invalidNames = invalidFiles.map(f => f.name).join(', ');
                setError(`Неподдерживаемый формат файла: ${invalidNames}. Разрешены только JPG, PNG и GIF.`);
                e.target.value = '';
                return;
            }
            
            const remainingSlots = 10 - photos.length;
            if (remainingSlots <= 0) {
                setError('Максимум 10 фотографий');
                e.target.value = '';
                return;
            }
            
            const filesToAdd = files.slice(0, remainingSlots);
            if (files.length > remainingSlots) {
                setError(`Добавлено ${filesToAdd.length} из ${files.length} фото. Максимум 10 фотографий.`);
            }
            
            setPhotos([...photos, ...filesToAdd]);
            
            // Create previews for new files
            filesToAdd.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotoPreviews(prev => [...prev, reader.result as string]);
                };
                reader.onerror = () => {
                    console.error('Error reading file:', file.name);
                };
                reader.readAsDataURL(file);
            });
        }
        e.target.value = '';
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
        setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
    };

    const toggleParticipant = (participantId: number) => {
        setSelectedParticipantIds(prev => 
            prev.includes(participantId)
                ? prev.filter(id => id !== participantId)
                : [...prev, participantId]
        );
    };

    const toggleAllParticipants = () => {
        if (selectedParticipantIds.length === participants.length) {
            setSelectedParticipantIds([]);
        } else {
            setSelectedParticipantIds(participants.map(p => p.id));
        }
    };

    const selectActivityType = (activityType: ActivityType) => {
        setSelectedActivityTypeId(activityType.id.toString());
        setActivityTypeSearch(activityType.name);
        setShowActivityTypeDropdown(false);
    };

    const filteredActivityTypes = activityTypes.filter(at =>
        at.name.toLowerCase().includes(activityTypeSearch.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Prevent multiple submissions
        if (isLoading) {
            return;
        }

        // Validation based on event type
        if (isTeamBased) {
            if (!selectedTeamId || selectedParticipantIds.length === 0 || !selectedActivityTypeId || !energy) {
                setError('Заполните все обязательные поля');
                return;
            }
        } else {
            if (!selectedActivityTypeId || !energy) {
                setError('Заполните все обязательные поля');
                return;
            }
        }

        // Validate photo count
        if (photos.length > 10) {
            setError('Максимум 10 фотографий');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            const activityType = activityTypes.find(at => at.id.toString() === selectedActivityTypeId);
            
            const formData = new FormData();
            
            if (isTeamBased) {
                // For team-based events: create ONE activity for the team
                // Use current user as the one who logged the activity
                formData.append('teamId', selectedTeamId);
                formData.append('participantId', userId || '');
                // Add all selected participants
                selectedParticipantIds.forEach(id => {
                    formData.append('participantIds', id.toString());
                });
            } else {
                // For individual events: create activity for current user only
                formData.append('teamId', selectedTeamId || '0'); // Some default if no team
                formData.append('participantId', userId || '');
            }
            
            formData.append('type', activityType?.name || '');
            formData.append('energy', energy);
            if (description) {
                formData.append('description', description);
            }
            if (trackActivityDuration && durationMinutes) {
                formData.append('durationMinutes', durationMinutes);
            }
            
            // Create new File objects to avoid ERR_UPLOAD_FILE_CHANGED
            photos.forEach((photo) => {
                const newFile = new File([photo], photo.name, { type: photo.type });
                formData.append('photos', newFile);
            });

            const response = await fetch('/api/activities', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                navigate(-1);
            } else {
                setError('Ошибка добавления активности');
            }
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
                            <Activity className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Добавить активность</h1>
                        <p className="text-slate-500">Зафиксируйте свою спортивную активность</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {isTeamBased && selectedTeamId && participants.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Кто участвовал? (выберите участников команды)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={toggleAllParticipants}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            selectedParticipantIds.length === participants.length
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        Все
                                    </button>
                                    {participants.map((participant) => (
                                        <button
                                            key={participant.id}
                                            type="button"
                                            onClick={() => toggleParticipant(participant.id)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                selectedParticipantIds.includes(participant.id)
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                        >
                                            {participant.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-6 relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Тип активности
                            </label>
                            <input
                                type="text"
                                value={activityTypeSearch}
                                onChange={(e) => {
                                    setActivityTypeSearch(e.target.value);
                                    setShowActivityTypeDropdown(true);
                                }}
                                onFocus={() => setShowActivityTypeDropdown(true)}
                                placeholder="Начните вводить тип активности..."
                                className="w-full px-5 py-4 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm hover:border-slate-300"
                                required
                            />
                            {showActivityTypeDropdown && filteredActivityTypes.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                    {filteredActivityTypes.map((activityType) => (
                                        <button
                                            key={activityType.id}
                                            type="button"
                                            onClick={() => selectActivityType(activityType)}
                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0"
                                        >
                                            <div className="font-medium text-slate-900">{activityType.name}</div>
                                            {activityType.description && (
                                                <div className="text-sm text-slate-500">{activityType.description}</div>
                                            )}
                                            {activityType.defaultEnergy && (
                                                <div className="text-xs text-blue-600 mt-1">По умолчанию: {activityType.defaultEnergy} баллов</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {energy && (
                            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                <p className="text-sm font-semibold text-blue-900 mb-1">Энергия за активность</p>
                                <p className="text-2xl font-bold text-blue-600">{energy} баллов</p>
                            </div>
                        )}

                        {trackActivityDuration && (
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Время активности (минуты)
                                </label>
                                <input
                                    type="number"
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(e.target.value)}
                                    placeholder="Например: 30"
                                    min="1"
                                    className="w-full px-5 py-4 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm hover:border-slate-300"
                                />
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Описание активности (необязательно)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Расскажите о своей активности..."
                                rows={3}
                                className="w-full px-5 py-4 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm hover:border-slate-300 resize-none"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Фото (необязательно, можно несколько)
                            </label>
                            
                            {/* Photo Previews Grid */}
                            {photoPreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                    {photoPreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-40 object-cover rounded-xl border-2 border-slate-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Upload Button */}
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePhotosChange}
                                        className="hidden"
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <p className="text-slate-600 font-medium">
                                            Нажмите для загрузки фото
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            Можно выбрать несколько. PNG, JPG до 10MB
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" isLoading={isLoading}>
                                <Upload className="w-5 h-5" />
                                Добавить активность
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
