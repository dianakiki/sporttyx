import React, { useState, useEffect } from 'react';
import { Bell, Users, Check, X, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';

interface TeamInvitation {
    id: number;
    teamId: number;
    teamName: string;
    invitedBy: string;
    invitedAt: string;
}

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    activityId?: number;
    activityType?: string;
}

export const Notifications: React.FC = () => {
    const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvitations();
        fetchNotifications();
    }, []);

    const fetchInvitations = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/participants/${userId}/invitations`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setInvitations(data);
            }
        } catch (err) {
            console.error('Error fetching invitations:', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = async (invitationId: number, teamId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/invitations/${invitationId}/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Remove invitation from list
                setInvitations(invitations.filter(inv => inv.id !== invitationId));
                // Optionally redirect to team page or show success message
            }
        } catch (err) {
            console.error('Error accepting invitation:', err);
        }
    };

    const handleDecline = async (invitationId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/invitations/${invitationId}/decline`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setInvitations(invitations.filter(inv => inv.id !== invitationId));
            }
        } catch (err) {
            console.error('Error declining invitation:', err);
        }
    };

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setNotifications(notifications.map(n => 
                    n.id === notificationId ? { ...n, isRead: true } : n
                ));
            }
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const handleDeleteNotification = async (notificationId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setNotifications(notifications.filter(n => n.id !== notificationId));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }
        if (notification.activityId) {
            navigate(`/activity/${notification.activityId}`);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-slate-900">Уведомления</h2>
                </div>
                <p className="text-slate-500">Загрузка...</p>
            </div>
        );
    }

    const totalUnread = invitations.length + notifications.filter(n => !n.isRead).length;
    const hasAnyNotifications = invitations.length > 0 || notifications.length > 0;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
                <Bell className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-900">Уведомления</h2>
                {totalUnread > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {totalUnread}
                    </span>
                )}
            </div>

            {hasAnyNotifications ? (
                <div className="space-y-4">
                    {/* Activity Moderation Notifications */}
                    {notifications.map((notification) => {
                        const isApproved = notification.type === 'ACTIVITY_APPROVED';
                        const isRejected = notification.type === 'ACTIVITY_REJECTED';
                        
                        return (
                            <div
                                key={`notif-${notification.id}`}
                                className={`p-4 border-2 rounded-xl transition-all ${
                                    notification.isRead 
                                        ? 'bg-slate-50 border-slate-200' 
                                        : isApproved 
                                            ? 'bg-green-50 border-green-200' 
                                            : 'bg-red-50 border-red-200'
                                } ${
                                    notification.activityId ? 'cursor-pointer hover:shadow-md' : ''
                                }`}
                                onClick={() => notification.activityId && handleNotificationClick(notification)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {isApproved ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : isRejected ? (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            ) : (
                                                <Bell className="w-5 h-5 text-blue-600" />
                                            )}
                                            <h3 className="font-bold text-slate-900">
                                                {notification.title}
                                            </h3>
                                            {!notification.isRead && (
                                                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                                                    Новое
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-700 mb-1 whitespace-pre-line">
                                            {notification.message}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {new Date(notification.createdAt).toLocaleDateString('ru-RU', {
                                                day: 'numeric',
                                                month: 'long',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteNotification(notification.id);
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Удалить"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Team Invitations */}
                    {invitations.map((invitation) => (
                        <div
                            key={`inv-${invitation.id}`}
                            className="p-4 bg-blue-50 border-2 border-blue-100 rounded-xl hover:border-blue-200 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <h3 className="font-bold text-slate-900">
                                            Приглашение в команду
                                        </h3>
                                    </div>
                                    <p className="text-slate-700 mb-1">
                                        <span className="font-semibold">{invitation.invitedBy}</span> приглашает вас в команду{' '}
                                        <span className="font-semibold text-blue-600">{invitation.teamName}</span>
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {new Date(invitation.invitedAt).toLocaleDateString('ru-RU', {
                                            day: 'numeric',
                                            month: 'long',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(invitation.id, invitation.teamId)}
                                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                                        title="Принять"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDecline(invitation.id)}
                                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                                        title="Отклонить"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Нет новых уведомлений</p>
                </div>
            )}
        </div>
    );
};
