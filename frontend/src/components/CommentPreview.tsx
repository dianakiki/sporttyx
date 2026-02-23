import React from 'react';

interface Comment {
    id: number;
    participantName: string;
    participantAvatarUrl?: string;
    text: string;
    createdAt: string;
}

interface CommentPreviewProps {
    comments: Comment[];
    totalCount: number;
    onShowAll: () => void;
}

const getInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
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

export const CommentPreview: React.FC<CommentPreviewProps> = ({ comments, totalCount, onShowAll }) => {
    const displayComments = comments.slice(0, 3);

    if (displayComments.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            {displayComments.map((comment) => (
                <div key={comment.id} className="flex gap-2 items-start">
                    {comment.participantAvatarUrl ? (
                        <img
                            src={comment.participantAvatarUrl}
                            alt={comment.participantName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(comment.participantName)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                            {getInitial(comment.participantName)}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-slate-900 text-sm">{comment.participantName}</span>
                        </div>
                        <p className="text-slate-700 text-sm line-clamp-2">{comment.text}</p>
                    </div>
                </div>
            ))}
            
            {totalCount > 3 && (
                <button
                    onClick={onShowAll}
                    className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors"
                >
                    Показать все {totalCount} комментариев
                </button>
            )}
        </div>
    );
};
