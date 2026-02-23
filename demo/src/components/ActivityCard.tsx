import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, MessageCircle, Heart, Flame, ThumbsUp } from 'lucide-react';

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
    };
    onReact?: (activityId: number, reactionType: string) => void;
    showSocialFeatures?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ 
    activity, 
    onReact,
    showSocialFeatures = true 
}) => {
    const navigate = useNavigate();
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [modalPhotoIndex, setModalPhotoIndex] = useState(0);

    const photos = activity.photoUrls && activity.photoUrls.length > 0 
        ? activity.photoUrls 
        : activity.photoUrl 
        ? [activity.photoUrl] 
        : [];

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
            'RUNNING': '🏃',
            'Плавание': '🏊',
            'SWIMMING': '🏊',
            'Велосипед': '🚴',
            'CYCLING': '🚴',
            'Йога': '🧘',
            'YOGA': '🧘',
            'Футбол': '⚽',
            'FOOTBALL': '⚽',
            'Баскетбол': '🏀',
            'BASKETBALL': '🏀',
            'Теннис': '🎾',
            'TENNIS': '🎾',
            'Волейбол': '🏐',
            'VOLLEYBALL': '🏐',
            'Тренажерный зал': '💪',
            'GYM': '💪',
            'Танцы': '💃',
            'DANCING': '💃',
        };
        return emojiMap[type] || '🏃';
    };

    return (
        <div
            onClick={() => navigate(`/activity/${activity.id}`)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
        >
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
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
                        </div>
                    </div>
                </div>
                <div className="text-sm text-slate-400">
                    {formatTimeAgo(activity.createdAt)}
                </div>
            </div>

            {photos.length > 0 ? (
                <div className="relative">
                    {photos.length === 1 ? (
                        <div className="relative h-96">
                            <img
                                src={photos[0]}
                                alt="Activity photo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-1 h-96">
                            {photos.slice(0, 4).map((photo, index) => (
                                <div key={index} className="relative overflow-hidden">
                                    <img
                                        src={photo}
                                        alt={`Photo ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {index === 3 && photos.length > 4 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="text-white text-4xl font-bold">+{photos.length - 4}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
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
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        <span className="font-bold text-lg">{activity.finalPoints ?? activity.energy}</span>
                        <span className="text-sm">баллов</span>
                    </div>
                </div>
            )}

            {showSocialFeatures && (
                <div className="p-4 space-y-3">
                    {activity.description && (
                        <div className="text-slate-700 text-sm pb-2 border-b border-slate-100">
                            {activity.description}
                        </div>
                    )}
                    
                    <div className="flex items-center gap-4 pt-2">
                        <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Heart className="w-5 h-5" />
                            <span>{activity.reactionCounts?.LIKE || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                            <Flame className="w-5 h-5" />
                            <span>{activity.reactionCounts?.FIRE || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                            <MessageCircle className="w-5 h-5" />
                            <span>{activity.commentCount || 0}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
