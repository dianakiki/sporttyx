import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, MessageCircle, Edit } from 'lucide-react';
import { ReactionPanel } from './ReactionPanel';
import { PhotoCarousel, PhotoModal } from './PhotoCarousel';
import { CommentPreview } from './CommentPreview';

interface Comment {
    id: number;
    participantName: string;
    text: string;
    createdAt: string;
}

interface ActivityCardProps {
    activity: {
        id: number;
        type: string;
        energy: number;
        finalPoints?: number;
        durationMinutes?: number;
        description?: string;
        participantName: string;
        participantId?: number;
        participantAvatarUrl?: string;
        teamName?: string;
        teamId?: number;
        teamAvatarUrl?: string;
        teamBasedCompetition?: boolean;
        eventId?: number;
        eventName?: string;
        photoUrl?: string;
        photoUrls?: string[];
        createdAt: string;
        reactionCounts?: { [key: string]: number };
        userReaction?: string;
        totalReactions?: number;
        commentCount?: number;
        status?: string;
        isBlockedForEditing?: boolean;
        secondsUntilBlocking?: number | null;
    };
    onReact?: (activityId: number, reactionType: string) => void;
    showSocialFeatures?: boolean;
    onEdit?: (activityId: number) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ 
    activity, 
    onReact,
    showSocialFeatures = true,
    onEdit
}) => {
    const navigate = useNavigate();
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [modalPhotoIndex, setModalPhotoIndex] = useState(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [timeUntilBlocking, setTimeUntilBlocking] = useState<string>('');

    const photos = activity.photoUrls && activity.photoUrls.length > 0 
        ? activity.photoUrls 
        : activity.photoUrl 
        ? [activity.photoUrl] 
        : [];

    useEffect(() => {
        if (showSocialFeatures && activity.commentCount && activity.commentCount > 0) {
            fetchLatestComments();
        }
    }, [activity.id, activity.commentCount]);

    useEffect(() => {
        if (activity.secondsUntilBlocking != null && activity.secondsUntilBlocking > 0) {
            const startTime = Date.now();
            const initialSeconds = activity.secondsUntilBlocking;
            
            const updateTimer = () => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const remainingSeconds = Math.max(0, initialSeconds - elapsed);
                
                if (remainingSeconds > 0) {
                    const hours = Math.floor(remainingSeconds / 3600);
                    const minutes = Math.floor((remainingSeconds % 3600) / 60);
                    const secs = remainingSeconds % 60;
                    setTimeUntilBlocking(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
                } else {
                    setTimeUntilBlocking('00:00:00');
                }
            };
            
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        } else {
            setTimeUntilBlocking('');
        }
    }, [activity.secondsUntilBlocking]);

    const fetchLatestComments = async () => {
        setLoadingComments(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/activities/${activity.id}/comments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setComments(data.slice(-3).reverse());
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoadingComments(false);
        }
    };

    const handlePhotoClick = (e: React.MouseEvent, index: number = 0) => {
        e.stopPropagation();
        setModalPhotoIndex(index);
        setShowPhotoModal(true);
    };

    const handleLinkClick = (e: React.MouseEvent, path: string) => {
        e.stopPropagation();
        navigate(path);
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин назад`;
        if (diffHours < 24) return `${diffHours} ч назад`;
        if (diffDays < 7) return `${diffDays} дн назад`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
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
            'Танцы': '💃',
        };
        return emojiMap[type] || '🏃';
    };

    return (
        <div
            onClick={() => navigate(`/activity/${activity.id}`)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
        >
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3 flex-1">
                    {timeUntilBlocking && activity.status === 'PENDING' && !activity.isBlockedForEditing && (
                        <div className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold border border-orange-300">
                            Время до блокировки: {timeUntilBlocking}
                        </div>
                    )}
                    {activity.teamBasedCompetition && activity.teamAvatarUrl ? (
                        <img
                            src={activity.teamAvatarUrl}
                            alt={activity.teamName || 'Team'}
                            className="w-12 h-12 rounded-full object-cover shadow-md"
                        />
                    ) : activity.teamBasedCompetition && activity.teamName ? (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {activity.teamName.charAt(0)}
                        </div>
                    ) : activity.participantAvatarUrl ? (
                        <img
                            src={activity.participantAvatarUrl}
                            alt={activity.participantName}
                            className="w-12 h-12 rounded-full object-cover shadow-md"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {activity.participantName.charAt(0)}
                        </div>
                    )}
                    <div>
                        <div className="font-bold text-slate-900">
                            {activity.teamBasedCompetition && activity.teamName ? (
                                <button
                                    onClick={(e) => handleLinkClick(e, `/team/${activity.teamId}`)}
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    {activity.teamName}
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => handleLinkClick(e, `/profile/${activity.participantId}`)}
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    {activity.participantName}
                                </button>
                            )}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                            <span className="text-lg">{getActivityEmoji(activity.type)}</span>
                            {activity.type}
                            {activity.durationMinutes && (
                                <>
                                    <span>•</span>
                                    <span className="font-medium text-slate-600">{activity.durationMinutes} мин</span>
                                </>
                            )}
                            {activity.eventName && (
                                <>
                                    <span>•</span>
                                    <button
                                        onClick={(e) => handleLinkClick(e, `/event/${activity.eventId}`)}
                                        className="hover:text-blue-600 transition-colors"
                                    >
                                        {activity.eventName}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {activity.status === 'PENDING' && !activity.isBlockedForEditing && onEdit && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(activity.id);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Редактировать активность"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                    )}
                    <div className="text-sm text-slate-400">
                        {formatTimeAgo(activity.createdAt)}
                    </div>
                </div>
            </div>

            {/* Post Image Mosaic */}
            {photos.length > 0 ? (
                <div className="relative">
                    {photos.length === 1 ? (
                        <div 
                            className="relative h-96 cursor-pointer group"
                            onClick={(e) => handlePhotoClick(e, 0)}
                        >
                            <img
                                src={photos[0]}
                                alt="Activity photo"
                                className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                            />
                        </div>
                    ) : photos.length === 2 ? (
                        <div className="grid grid-cols-2 gap-1 h-96">
                            {photos.map((photo, index) => (
                                <div
                                    key={index}
                                    className="relative cursor-pointer group overflow-hidden"
                                    onClick={(e) => handlePhotoClick(e, index)}
                                >
                                    <img
                                        src={photo}
                                        alt={`Photo ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : photos.length === 3 ? (
                        <div className="grid grid-cols-2 gap-1 h-96">
                            <div
                                className="relative cursor-pointer group overflow-hidden row-span-2"
                                onClick={(e) => handlePhotoClick(e, 0)}
                            >
                                <img
                                    src={photos[0]}
                                    alt="Photo 1"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                            </div>
                            {photos.slice(1, 3).map((photo, index) => (
                                <div
                                    key={index + 1}
                                    className="relative cursor-pointer group overflow-hidden"
                                    onClick={(e) => handlePhotoClick(e, index + 1)}
                                >
                                    <img
                                        src={photo}
                                        alt={`Photo ${index + 2}`}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-1 h-96">
                            <div
                                className="relative cursor-pointer group overflow-hidden row-span-2"
                                onClick={(e) => handlePhotoClick(e, 0)}
                            >
                                <img
                                    src={photos[0]}
                                    alt="Photo 1"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                            </div>
                            {photos.slice(1, 3).map((photo, index) => (
                                <div
                                    key={index + 1}
                                    className="relative cursor-pointer group overflow-hidden"
                                    onClick={(e) => handlePhotoClick(e, index + 1)}
                                >
                                    <img
                                        src={photo}
                                        alt={`Photo ${index + 2}`}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    {index === 1 && photos.length > 3 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="text-white text-4xl font-bold">+{photos.length - 3}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Energy Badge on Image */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 z-10">
                        <Trophy className="w-5 h-5" />
                        <span className="font-bold text-lg">{activity.finalPoints ?? activity.energy}</span>
                        <span className="text-sm">баллов</span>
                    </div>
                </div>
            ) : (
                <div className="relative h-64 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-8xl mb-4">{getActivityEmoji(activity.type)}</div>
                        <div className="text-2xl font-bold text-slate-700">{activity.type}</div>
                    </div>
                    {/* Energy Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        <span className="font-bold text-lg">{activity.finalPoints ?? activity.energy}</span>
                        <span className="text-sm">баллов</span>
                    </div>
                </div>
            )}

            {/* Post Footer */}
            {showSocialFeatures && (
                <div className="p-4 space-y-3">
                    {/* Description */}
                    {activity.description && (
                        <div className="text-slate-700 text-sm pb-2 border-b border-slate-100">
                            {activity.description}
                        </div>
                    )}
                    
                    {/* Reaction Panel */}
                    {onReact && (
                        <div className={activity.description ? "" : "pt-2"}>
                            <ReactionPanel
                                activityId={activity.id}
                                reactionCounts={activity.reactionCounts}
                                userReaction={activity.userReaction}
                                onReact={(type) => onReact(activity.id, type)}
                            />
                        </div>
                    )}

                    {/* Comment Preview */}
                    {activity.commentCount !== undefined && activity.commentCount > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                            <CommentPreview
                                comments={comments}
                                totalCount={activity.commentCount}
                                onShowAll={() => navigate(`/activities/${activity.id}`)}
                            />
                        </div>
                    )}

                    {/* Comment Button */}
                    <button
                        onClick={() => navigate(`/activities/${activity.id}`)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">Комментировать</span>
                    </button>
                </div>
            )}

            {/* Photo Modal */}
            {showPhotoModal && photos.length > 0 && (
                <PhotoModal
                    photos={photos}
                    initialIndex={modalPhotoIndex}
                    onClose={() => setShowPhotoModal(false)}
                />
            )}
        </div>
    );
};
