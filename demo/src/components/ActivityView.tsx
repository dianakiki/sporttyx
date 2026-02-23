import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity as ActivityIcon, User, Trophy, Calendar, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactionPanel } from './ReactionPanel';
import { CommentSection } from './CommentSection';

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
    description?: string;
    durationMinutes?: number;
}

const mockActivity: Activity = {
    id: 1,
    type: 'Бег',
    energy: 52,
    photoUrls: ['https://picsum.photos/seed/run1/800/600', 'https://picsum.photos/seed/run2/800/600'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    participantId: 1,
    participantName: 'Демо Пользователь',
    teamId: 1,
    teamName: 'Спортивные Энтузиасты',
    teamBasedCompetition: true,
    reactionCounts: { LIKE: 5, FIRE: 3, STRONG: 2 },
    description: 'Утренняя пробежка в парке',
    durationMinutes: 32
};

export const ActivityView: React.FC = () => {
    const navigate = useNavigate();
    const { activityId } = useParams();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
        fetchActivity();
    }, [activityId]);

    const fetchActivity = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setActivity(mockActivity);
        } catch (err) {
            console.error('Error fetching activity:', err);
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
        
        const newReactionCounts = { ...activity.reactionCounts };
        
        if (activity.userReaction === reactionType) {
            if (newReactionCounts[reactionType]) {
                newReactionCounts[reactionType]--;
            }
            setActivity({ ...activity, reactionCounts: newReactionCounts, userReaction: undefined });
        } else {
            if (activity.userReaction && newReactionCounts[activity.userReaction]) {
                newReactionCounts[activity.userReaction]--;
            }
            newReactionCounts[reactionType] = (newReactionCounts[reactionType] || 0) + 1;
            setActivity({ ...activity, reactionCounts: newReactionCounts, userReaction: reactionType });
        }
    };

    const getActivityEmoji = (type: string) => {
        const emojiMap: { [key: string]: string } = {
            'Бег': '🏃',
            'Плавание': '🏊',
            'Велосипед': '🚴',
            'Йога': '🧘',
            'Футбол': '⚽',
            'Баскетбол': '🏀',
            'Теннис': '🎾',
            'Волейбол': '🏐',
            'Тренажерный зал': '💪',
        };
        return emojiMap[type] || '🏃';
    };

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors font-semibold"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Назад
                </button>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {hasPhotos ? (
                        <div className="relative w-full h-96 bg-slate-900 overflow-hidden group">
                            <img 
                                src={photos[currentPhotoIndex]} 
                                alt={`${activity.type} ${currentPhotoIndex + 1}`}
                                className="w-full h-full object-contain"
                            />
                            
                            {hasMultiplePhotos && (
                                <>
                                    <button
                                        onClick={prevPhoto}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextPhoto}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                    
                                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white text-sm rounded-full">
                                        {currentPhotoIndex + 1} / {photos.length}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-96 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-9xl mb-4">{getActivityEmoji(activity.type)}</div>
                                <div className="text-2xl font-bold text-slate-700">{activity.type}</div>
                            </div>
                        </div>
                    )}

                    <div className="p-8 md:p-10">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-4 shadow-lg">
                                <ActivityIcon className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">{activity.type}</h1>
                            {activity.description && (
                                <p className="text-lg text-slate-600">{activity.description}</p>
                            )}
                        </div>

                        <div className="flex justify-center mb-8">
                            <div className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl">
                                <div className="flex items-center gap-3">
                                    <Trophy className="w-8 h-8" />
                                    <div>
                                        <p className="text-sm opacity-90">Энергия</p>
                                        <p className="text-3xl font-bold">{activity.finalPoints ?? activity.energy} баллов</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`grid grid-cols-1 ${activity.teamBasedCompetition && activity.teamId ? 'md:grid-cols-2' : ''} gap-6 mb-8`}>
                            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-slate-700">
                                        {activity.teamBasedCompetition ? 'Автор записи' : 'Участник'}
                                    </h3>
                                </div>
                                <p 
                                    className="text-lg font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/profile/${activity.participantId}`)}
                                >
                                    {activity.participantName}
                                </p>
                            </div>

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

                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Реакции</h3>
                            <ReactionPanel
                                activityId={activity.id}
                                reactionCounts={activity.reactionCounts}
                                userReaction={activity.userReaction}
                                onReact={handleReaction}
                            />
                        </div>

                        <CommentSection activityId={activity.id} />
                    </div>
                </div>
            </div>
        </div>
    );
};
