import React, { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { CommentItem } from './CommentItem';

interface Comment {
    id: number;
    activityId: number;
    participantId: number;
    participantName: string;
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

interface CommentSectionProps {
    activityId: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ activityId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [activityId]);

    const fetchComments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/activities/${activityId}/comments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/activities/${activityId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ text: newComment }),
            });

            if (response.ok) {
                const newCommentData = await response.json();
                setComments([...comments, newCommentData]);
                setNewComment('');
            }
        } catch (err) {
            console.error('Error creating comment:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setComments(comments.filter(c => c.id !== commentId));
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    const handleReactToComment = async (commentId: number, reactionType: string) => {
        try {
            const token = localStorage.getItem('token');
            const comment = comments.find(c => c.id === commentId);
            
            if (comment?.userReaction === reactionType) {
                await fetch(`/api/comments/${commentId}/reactions`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } else {
                await fetch(`/api/comments/${commentId}/reactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ reactionType }),
                });
            }
            
            fetchComments();
        } catch (err) {
            console.error('Error reacting to comment:', err);
        }
    };

    return (
        <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <MessageCircle className="w-5 h-5" />
                <span>Комментарии ({comments.length})</span>
            </div>

            <form onSubmit={handleSubmitComment} className="flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Добавьте комментарий..."
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>

            <div className="space-y-3">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        onDelete={handleDeleteComment}
                        onReact={handleReactToComment}
                    />
                ))}
            </div>

            {comments.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                    Пока нет комментариев. Будьте первым!
                </div>
            )}
        </div>
    );
};
