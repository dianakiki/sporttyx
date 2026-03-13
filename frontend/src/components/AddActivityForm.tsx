import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { DatePicker } from './ui/DatePicker';
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
    event?: {
        id: number;
        name: string;
    };
}

export const AddActivityForm: React.FC = () => {
    const [searchParams] = useSearchParams();
    const eventIdFromUrl = searchParams.get('eventId');
    const editActivityId = searchParams.get('edit');
    const isEditMode = !!editActivityId;
    
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
    const [reportDate, setReportDate] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isTeamBased, setIsTeamBased] = useState(true);
    const [trackActivityDuration, setTrackActivityDuration] = useState(false);
    const [artifactsRequired, setArtifactsRequired] = useState(false);
    const [activityBlockingEnabled, setActivityBlockingEnabled] = useState(false);
    const [activityBlockingDays, setActivityBlockingDays] = useState<number | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize reportDate to today if not set
        if (!reportDate) {
            const today = new Date().toISOString().split('T')[0];
            setReportDate(today);
        }
    }, []);

    useEffect(() => {
        fetchUserTeamAndActivityTypes();
    }, [eventIdFromUrl]);

    useEffect(() => {
        if (isEditMode && editActivityId && activityTypes.length > 0) {
            fetchActivityForEdit(parseInt(editActivityId));
        }
    }, [editActivityId, activityTypes.length]);

    const fetchActivityForEdit = async (activityId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/activities/${activityId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (response.ok) {
                const activity = await response.json();
                
                // Fill form with activity data
                setEnergy(activity.energy?.toString() || '');
                setDescription(activity.description || '');
                setDurationMinutes(activity.durationMinutes?.toString() || '');
                if (activity.reportDate) {
                    setReportDate(activity.reportDate);
                } else {
                    // Default to today's date if not set
                    const today = new Date().toISOString().split('T')[0];
                    setReportDate(today);
                }
                
                // Set activity type
                const activityType = activityTypes.find(at => at.name === activity.type);
                if (activityType) {
                    setSelectedActivityTypeId(activityType.id.toString());
                    setActivityTypeSearch(activityType.name);
                }
                
                // Set team and load participants
                if (activity.teamId) {
                    setSelectedTeamId(activity.teamId.toString());
                    // Fetch team participants will be triggered by useEffect
                    // After participants are loaded, set selected participants
                    setTimeout(() => {
                        // This will be handled after participants are loaded
                    }, 500);
                }
                
                // Load existing photos as previews
                if (activity.photoUrls && activity.photoUrls.length > 0) {
                    setPhotoPreviews(activity.photoUrls);
                } else if (activity.photoUrl) {
                    setPhotoPreviews([activity.photoUrl]);
                }
            } else if (response.status === 401 || response.status === 403) {
                setError('Нет прав на редактирование этой активности');
            } else {
                setError('Активность не найдена или уже одобрена');
            }
        } catch (err) {
            console.error('Error fetching activity for edit:', err);
            setError('Ошибка загрузки активности');
        }
    };

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
            } else {
                // Если нет defaultEnergy, очищаем поле (только для админов)
                if (userRole === 'ADMIN') {
                    setEnergy('');
                }
            }
        }
    }, [selectedActivityTypeId, activityTypes, userRole]);

    const fetchUserTeamAndActivityTypes = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            
            if (!token || !userId) {
                setError('Необходима авторизация');
                return;
            }
            
            // Fetch user role
            try {
                const userResponse = await fetch(`/api/participants/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUserRole(userData.role || null);
                }
            } catch (err) {
                console.error('Error fetching user role:', err);
            }
            
            // Determine which event to use: from URL parameter, or fetch active event
            let targetEventId = eventIdFromUrl;
            
            // If no eventId in URL, fetch active event
            if (!targetEventId) {
                try {
                    // Сначала пытаемся получить отображаемое мероприятие
                    const displayedResponse = await fetch('/api/events/displayed', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (displayedResponse.ok && displayedResponse.status !== 204) {
                        const displayedEvent = await displayedResponse.json();
                        if (displayedEvent && displayedEvent.id) {
                            targetEventId = displayedEvent.id.toString();
                        }
                    } else {
                        // Если нет отображаемого, получаем активные мероприятия
                        const activeResponse = await fetch('/api/events/active', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (activeResponse.ok) {
                            const activeEvents = await activeResponse.json();
                            // Берем первое активное мероприятие
                            if (activeEvents && activeEvents.length > 0 && activeEvents[0].id) {
                                targetEventId = activeEvents[0].id.toString();
                            }
                        }
                    }
                    
                    // Проверяем участие пользователя в активном мероприятии
                    if (targetEventId) {
                        const isParticipantResponse = await fetch(`/api/events/${targetEventId}/is-participant`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (isParticipantResponse.ok) {
                            const isParticipant = await isParticipantResponse.json();
                            if (!isParticipant) {
                                setError('Вы не являетесь участником активного мероприятия');
                                return;
                            }
                        }
                    } else {
                        setError('Нет активных мероприятий');
                        return;
                    }
                } catch (err) {
                    console.error('Error fetching active event:', err);
                    setError('Ошибка при получении активного мероприятия');
                    return;
                }
            }
            
            // If eventId is provided in URL, load event data FIRST to set trackActivityDuration immediately
            if (targetEventId) {
                try {
                    const eventResponse = await fetch(`/api/events/${targetEventId}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    
                    if (eventResponse.ok) {
                        const eventData = await eventResponse.json();
                        setIsTeamBased(eventData.teamBasedCompetition === true);
                        setTrackActivityDuration(eventData.trackActivityDuration || false);
                        setArtifactsRequired(eventData.artifactsRequired || false);
                        setActivityBlockingEnabled(eventData.activityBlockingEnabled || false);
                        setActivityBlockingDays(eventData.activityBlockingDays || null);
                    }
                } catch (err) {
                    console.error('Error fetching event data:', err);
                }
            }
            
            // Fetch user's team and event
            const userResponse = await fetch(`/api/participants/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                
                // If eventId is provided in URL, use it; otherwise use user's eventId
                const eventIdToUse = targetEventId || userData.eventId;
                
                // Set team ID - if eventId is provided, try to find team for that event
                // Otherwise use user's current team
                if (targetEventId) {
                    // Try to find user's team for this specific event
                    // First, get all teams for this event
                    try {
                        const teamsResponse = await fetch(`/api/teams?eventId=${targetEventId}`, {
                            headers: { 'Authorization': `Bearer ${token}` },
                        });
                        if (teamsResponse.ok) {
                            const allTeams = await teamsResponse.json();
                            // Find team where user is a member
                            for (const team of allTeams) {
                                const participantsResponse = await fetch(`/api/teams/${team.id}/participants`, {
                                    headers: { 'Authorization': `Bearer ${token}` },
                                });
                                if (participantsResponse.ok) {
                                    const teamParticipants = await participantsResponse.json();
                                    const userInTeam = teamParticipants.some((p: any) => p.id.toString() === userId);
                                    if (userInTeam) {
                                        setSelectedTeamId(team.id.toString());
                                        break;
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        console.error('Error fetching teams for event:', err);
                        // Fallback to user's current team if available
                        if (userData.teamId) {
                            setSelectedTeamId(userData.teamId.toString());
                        }
                    }
                } else if (userData.teamId) {
                    setSelectedTeamId(userData.teamId.toString());
                }
                
                // Fetch event info (if not already loaded) and activity types in parallel
                if (eventIdToUse) {
                    const promises: Promise<any>[] = [];
                    
                    // Only fetch event if we haven't already loaded it
                    if (!targetEventId) {
                        promises.push(
                            fetch(`/api/events/${eventIdToUse}`, {
                                headers: { 'Authorization': `Bearer ${token}` },
                            }).then(async (res) => {
                                if (res.ok) {
                                    const eventData = await res.json();
                                    setIsTeamBased(eventData.teamBasedCompetition === true);
                                    setTrackActivityDuration(eventData.trackActivityDuration || false);
                                    setArtifactsRequired(eventData.artifactsRequired || false);
                                    setActivityBlockingEnabled(eventData.activityBlockingEnabled || false);
                                    setActivityBlockingDays(eventData.activityBlockingDays || null);
                                }
                            })
                        );
                    }
                    
                    // Always fetch activity types for this specific event
                    promises.push(
                        fetch(`/api/activity-types?eventId=${eventIdToUse}`, {
                            headers: { 'Authorization': `Bearer ${token}` },
                        }).then(async (res) => {
                            if (res.ok) {
                                const typesData = await res.json();
                                // Filter activity types to only those belonging to this event
                                const filteredTypes = typesData.filter((type: ActivityType) => 
                                    !type.event || type.event.id === Number(eventIdToUse)
                                );
                                setActivityTypes(filteredTypes);
                            }
                        })
                    );
                    
                    await Promise.all(promises);
                } else {
                    // If no event found, show error
                    setError('Не удалось определить активное мероприятие');
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
            if (!selectedTeamId) {
                setError('Выберите команду');
                return;
            }
            if (selectedParticipantIds.length === 0) {
                setError('Выберите хотя бы одного участника');
                return;
            }
            if (!selectedActivityTypeId) {
                setError('Выберите тип активности из списка');
                return;
            }
            if (!energy || parseInt(energy) <= 0) {
                setError('Введите количество баллов (энергии)');
                return;
            }
        } else {
            if (!selectedActivityTypeId) {
                setError('Выберите тип активности из списка');
                return;
            }
            if (!energy || parseInt(energy) <= 0) {
                setError('Введите количество баллов (энергии)');
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
                // For individual events, teamId is optional - only send if available
                if (selectedTeamId) {
                    formData.append('teamId', selectedTeamId);
                }
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
            if (reportDate) {
                formData.append('reportDate', reportDate);
            }
            
            // Create new File objects to avoid ERR_UPLOAD_FILE_CHANGED
            photos.forEach((photo) => {
                const newFile = new File([photo], photo.name, { type: photo.type });
                formData.append('photos', newFile);
            });

            const url = isEditMode 
                ? `/api/activities/${editActivityId}`
                : '/api/activities';
            const method = isEditMode ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                navigate(-1);
            } else {
                // Try to extract error message from response
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        setError(errorData.message);
                    } else {
                        const errorText = isEditMode 
                            ? 'Ошибка обновления активности'
                            : 'Ошибка добавления активности';
                        setError(errorText);
                    }
                } catch (parseError) {
                    // If response is not JSON, try to get text
                    try {
                        const errorText = await response.text();
                        if (errorText) {
                            setError(errorText);
                        } else {
                            const errorText = isEditMode 
                                ? 'Ошибка обновления активности'
                                : 'Ошибка добавления активности';
                            setError(errorText);
                        }
                    } catch (textError) {
                        const errorText = isEditMode 
                            ? 'Ошибка обновления активности'
                            : 'Ошибка добавления активности';
                        setError(errorText);
                    }
                }
            }
        } catch (err: any) {
            // Handle network errors or other exceptions
            if (err.message) {
                setError(err.message);
            } else {
                setError('Ошибка подключения к серверу');
            }
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
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">
                            {isEditMode ? 'Редактировать активность' : 'Добавить активность'}
                        </h1>
                        <p className="text-slate-500">
                            {isEditMode ? 'Измените данные активности' : 'Зафиксируйте свою спортивную активность'}
                        </p>
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

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Энергия (баллы) <span className="text-red-500">*</span>
                                {userRole !== 'ADMIN' && (
                                    <span className="text-xs text-slate-500 ml-2">(автоматически из типа активности)</span>
                                )}
                            </label>
                            <input
                                type="number"
                                value={energy}
                                onChange={(e) => {
                                    if (userRole === 'ADMIN') {
                                        setEnergy(e.target.value);
                                    }
                                }}
                                placeholder={userRole === 'ADMIN' ? "Введите количество баллов" : "Выберите тип активности"}
                                min="0"
                                required
                                disabled={userRole !== 'ADMIN'}
                                readOnly={userRole !== 'ADMIN'}
                                className={`w-full px-5 py-4 rounded-xl border-2 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm ${
                                    userRole === 'ADMIN'
                                        ? 'bg-white border-slate-200 focus:border-blue-400 hover:border-slate-300'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed'
                                }`}
                            />
                            {energy && (
                                <p className="text-xs text-slate-500 mt-1">
                                    {(() => {
                                        const energyNum = Number(energy) || 0;
                                        const durationNum = Number(durationMinutes) || 0;
                                        let points = energyNum;
                                        if (trackActivityDuration && durationNum > 0) {
                                            points = Math.floor((energyNum * durationNum) / 60);
                                        }
                                        return `Баллы за эту активность: ${points}`;
                                    })()}
                                </p>
                            )}
                            {!energy && userRole !== 'ADMIN' && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Выберите тип активности, чтобы автоматически установить значение энергии
                                </p>
                            )}
                        </div>

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
                            <DatePicker
                                value={reportDate || new Date().toISOString().split('T')[0]}
                                onChange={(date) => setReportDate(date)}
                                maxDate={new Date().toISOString().split('T')[0]}
                                minDate={(() => {
                                    if (!activityBlockingEnabled || !activityBlockingDays) {
                                        // Если блокировка выключена, можно выбрать любую дату в текущем году, но не позднее текущей
                                        const currentYear = new Date().getFullYear();
                                        return `${currentYear}-01-01`;
                                    }
                                    // Если блокировка включена, ограничиваем выбор
                                    // Для "текущая дата + 1 день": можно выбрать сегодня и вчера (minDate = вчера)
                                    // Для "текущая дата + 2 дня": можно выбрать сегодня, вчера и позавчера (minDate = позавчера)
                                    const today = new Date();
                                    const minDate = new Date(today);
                                    minDate.setDate(today.getDate() - activityBlockingDays);
                                    return minDate.toISOString().split('T')[0];
                                })()}
                                label="Отчетная дата"
                                placeholder="Выберите дату активности"
                                quickButtons={(() => {
                                    if (!activityBlockingEnabled || !activityBlockingDays) {
                                        return undefined;
                                    }
                                    const today = new Date();
                                    const buttons: Array<{ label: string; date: string }> = [];
                                    
                                    // Сегодня
                                    buttons.push({
                                        label: 'За сегодня',
                                        date: today.toISOString().split('T')[0]
                                    });
                                    
                                    // Вчера
                                    if (activityBlockingDays >= 1) {
                                        const yesterday = new Date(today);
                                        yesterday.setDate(today.getDate() - 1);
                                        buttons.push({
                                            label: 'За вчера',
                                            date: yesterday.toISOString().split('T')[0]
                                        });
                                    }
                                    
                                    // Позавчера
                                    if (activityBlockingDays >= 2) {
                                        const dayBeforeYesterday = new Date(today);
                                        dayBeforeYesterday.setDate(today.getDate() - 2);
                                        buttons.push({
                                            label: 'За позавчера',
                                            date: dayBeforeYesterday.toISOString().split('T')[0]
                                        });
                                    }
                                    
                                    return buttons;
                                })()}
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                {activityBlockingEnabled && activityBlockingDays
                                    ? `Выберите дату, за которую вы добавляете активность. Доступны только последние ${activityBlockingDays} дня.`
                                    : 'Выберите дату, за которую вы добавляете активность. По умолчанию - сегодня.'}
                            </p>
                        </div>

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
                                {artifactsRequired ? 'Фото (обязательно, можно несколько)' : 'Фото (необязательно, можно несколько)'}
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
