import React, { useState } from 'react';
import { MessageCircle, Send, Trash2 } from 'lucide-react';

interface Comment {
    id: number;
    participantName: string;
    text: string;
    createdAt: string;
}

interface CommentSectionProps {
    activityId: number;
}

const mockComments: Comment[] = [
    {
        id: 1,
        participantName: 'Алексей Иванов',
        text: 'Отличный результат! Продолжай в том же духе!',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 2,
        participantName: 'Мария Петрова',
        text: 'Круто! 🔥',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    }
];

export const CommentSection: React.FC<CommentSectionProps> = ({ activityId }) => {
    const [comments, setComments] = useState<Comment[]>(mockComments);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const comment: Comment = {
            id: Date.now(),
            participantName: 'Демо Пользователь',
            text: newComment,
            createdAt: new Date().toISOString()
        };
        
        setComments([...comments, comment]);
        setNewComment('');
        setIsLoading(false);
    };

    const handleDeleteComment = (commentId: number) => {
        setComments(comments.filter(c => c.id !== commentId));
    };

    return (
        <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-lg">
                <MessageCircle className="w-5 h-5" />
                <span>Комментарии ({comments.length})</span>
            </div>

            <form onSubmit={handleSubmitComment} className="flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Добавьте комментарий..."
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !newComment.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>

            <div className="space-y-3 mt-6">
                {comments.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">Комментариев пока нет</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-white rounded-xl p-4 border-2 border-slate-200 hover:border-blue-200 transition-all">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-slate-900">{comment.participantName}</span>
                                        <span className="text-sm text-slate-500">{formatTimeAgo(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-slate-700">{comment.text}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                                    title="Удалить комментарий"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
