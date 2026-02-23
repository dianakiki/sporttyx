import React from 'react';
import { Trash2 } from 'lucide-react';
import { ReactionPanel } from './ReactionPanel';

interface Comment {
    id: number;
    activityId: number;
    participantId: number;
    participantName: string;
    participantAvatarUrl?: string;
    text: string;
    mentionedParticipantId?: number;
    mentionedParticipantName?: string;
    reactionCounts?: { [key: string]: number };
    userReaction?: string;
    createdAt: string;
    updatedAt: string;
    canEdit: boolean;
    canDelete: boolean;
}

interface CommentItemProps {
    comment: Comment;
    onDelete: (commentId: number) => void;
    onReact: (commentId: number, reactionType: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, onDelete, onReact }) => {
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
        if (diffDays === 1) return 'вчера';
        if (diffDays < 7) return `${diffDays} дн назад`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    const getAvatarColor = (name: string): string => {
        const colors = [
            'from-blue-500 to-blue-600',
            'from-purple-500 to-purple-600',
            'from-pink-500 to-pink-600',
            'from-green-500 to-green-600',
            'from-orange-500 to-orange-600',
            'from-red-500 to-red-600',
            'from-teal-500 to-teal-600',
            'from-indigo-500 to-indigo-600',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="bg-white rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    {comment.participantAvatarUrl ? (
                        <img
                            src={comment.participantAvatarUrl}
                            alt={comment.participantName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(comment.participantName)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                            {comment.participantName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div className="font-semibold text-slate-900">{comment.participantName}</div>
                        <div className="text-xs text-slate-500">{formatTimeAgo(comment.createdAt)}</div>
                    </div>
                </div>
                {comment.canDelete && (
                    <button
                        onClick={() => onDelete(comment.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <p className="text-slate-700">{comment.text}</p>

            <ReactionPanel
                activityId={comment.activityId}
                reactionCounts={comment.reactionCounts}
                userReaction={comment.userReaction}
                onReact={(type) => onReact(comment.id, type)}
            />
        </div>
    );
};
