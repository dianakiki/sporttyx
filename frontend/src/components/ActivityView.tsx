import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity as ActivityIcon, User, Trophy, Calendar, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { ReactionPanel } from './ReactionPanel';
import { CommentSection } from './CommentSection';
import { PhotoModal } from './PhotoCarousel';

interface Activity {
    id: number;
    type: string;
    energy: number;
    finalPoints?: number;
    photoUrls?: string[];
    createdAt: string;
    participantId: number;
    participantName: string;
    teamId?: number;
    teamName?: string;
    teamBasedCompetition?: boolean;
    reactionCounts?: { [key: string]: number };
    userReaction?: string;
    totalReactions?: number;
    commentCount?: number;
}

export const ActivityView: React.FC = () => {
    const navigate = useNavigate();
    const { activityId } = useParams();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    useEffect(() => {
        fetchActivity();
    }, [activityId]);

    const fetchActivity = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/activities/${activityId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setActivity(data);
            } else {
                // Mock data
                setActivity({
                    id: parseInt(activityId || '1'),
                    type: 'Бег',
                    energy: 150,
                    photoUrls: [
                        'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Running+1',
                        'https://via.placeholder.com/800x600/10b981/ffffff?text=Running+2',
                        'https://via.placeholder.com/600x800/f59e0b/ffffff?text=Running+3'
                    ],
                    createdAt: '2024-02-11T10:30:00',
                    participantId: 1,
                    participantName: 'Иван Иванов',
                    teamId: 1,
                    teamName: 'Команда Чемпионов'
                });
            }
        } catch (err) {
            console.error('Error fetching activity:', err);
            // Mock data on error
            setActivity({
                id: parseInt(activityId || '1'),
                type: 'Бег',
                energy: 150,
                photoUrls: [
                    'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Running+1',
                    'https://via.placeholder.com/800x600/10b981/ffffff?text=Running+2'
                ],
                createdAt: '2024-02-11T10:30:00',
                participantId: 1,
                participantName: 'Иван Иванов',
                teamId: 1,
                teamName: 'Команда Чемпионов'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-blue-600 text-xl">Загрузка...</div>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-600 text-xl">Активность не найдена</div>
            </div>
        );
    }

    const photos = activity.photoUrls || [];
    const hasPhotos = photos.length > 0;
    const hasMultiplePhotos = photos.length > 1;

    const nextPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const handleReaction = async (reactionType: string) => {
        if (!activity) return;
        
        try {
            const token = localStorage.getItem('token');
            
            if (activity.userReaction === reactionType) {
                await fetch(`/api/activities/${activity.id}/reactions`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } else {
                await fetch(`/api/activities/${activity.id}/reactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ reactionType }),
                });
            }
            
            fetchActivity();
        } catch (err) {
            console.error('Error reacting to activity:', err);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Назад к ленте
                </button>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Activity Photos Carousel */}
                    {hasPhotos ? (
                        <div 
                            className="relative w-full h-96 bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden group cursor-pointer"
                            onClick={() => setShowPhotoModal(true)}
                        >
                            <img 
                                src={photos[currentPhotoIndex]} 
                                alt={`${activity.type} ${currentPhotoIndex + 1}`}
                                className="w-full h-full object-contain bg-slate-900"
                            />
                            
                            {/* Navigation Arrows */}
                            {hasMultiplePhotos && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prevPhoto();
                                        }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            nextPhoto();
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        →
                                    </button>
                                    
                                    {/* Photo Counter */}
                                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white text-sm rounded-full">
                                        {currentPhotoIndex + 1} / {photos.length}
                                    </div>
                                </>
                            )}
                            
                            {/* Thumbnail Strip */}
                            {hasMultiplePhotos && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {photos.map((photo, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentPhotoIndex(index);
                                            }}
                                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                                                index === currentPhotoIndex ? 'border-white' : 'border-transparent opacity-60'
                                            } hover:opacity-100 transition-all`}
                                        >
                                            <img 
                                                src={photo} 
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-96 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <ImageIcon className="w-32 h-32 text-white/30" />
                        </div>
                    )}

                    {/* Activity Details */}
                    <div className="p-8 md:p-10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-4 shadow-lg">
                                <ActivityIcon className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">{activity.type}</h1>
                            <p className="text-slate-600">Детали активности</p>
                        </div>

                        {/* Energy Badge */}
                        <div className="flex justify-center mb-8">
                            <div className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl">
                                <div className="flex items-center gap-3">
                                    <Trophy className="w-8 h-8" />
                                    <div>
                                        <p className="text-sm opacity-90">Энергия</p>
                                        <p className="text-3xl font-bold">{activity.finalPoints ?? activity.energy} баллов</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className={`grid grid-cols-1 ${activity.teamBasedCompetition && activity.teamId ? 'md:grid-cols-2' : ''} gap-6 mb-8`}>
                            {/* Participant Card */}
                            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-slate-700">
                                        {activity.teamBasedCompetition ? 'Автор записи' : 'Участник'}
                                    </h3>
                                </div>
                                <p 
                                    className="text-lg font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/participants/${activity.participantId}`)}
                                >
                                    {activity.participantName}
                                </p>
                            </div>

                            {/* Team Card - только для командных мероприятий */}
                            {activity.teamBasedCompetition && activity.teamId && activity.teamName && (
                                <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Trophy className="w-5 h-5 text-blue-600" />
                                        <h3 className="font-bold text-slate-700">Команда</h3>
                                    </div>
                                    <p 
                                        className="text-lg font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/team/${activity.teamId}`)}
                                    >
                                        {activity.teamName}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Date */}
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl border-2 border-blue-100 mb-8">
                            <div className="flex items-center justify-center gap-3">
                                <Calendar className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="text-sm text-slate-600 font-medium">Дата создания</p>
                                    <p className="text-lg font-bold text-slate-900">
                                        {new Date(activity.createdAt).toLocaleDateString('ru-RU', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reactions */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Реакции</h3>
                            <ReactionPanel
                                activityId={activity.id}
                                reactionCounts={activity.reactionCounts}
                                userReaction={activity.userReaction}
                                onReact={handleReaction}
                            />
                        </div>

                        {/* Comments */}
                        <CommentSection activityId={activity.id} />
                    </div>
                </div>
            </div>

            {/* Photo Modal */}
            {showPhotoModal && photos.length > 0 && (
                <PhotoModal
                    photos={photos}
                    initialIndex={currentPhotoIndex}
                    onClose={() => setShowPhotoModal(false)}
                />
            )}
        </div>
    );
};
