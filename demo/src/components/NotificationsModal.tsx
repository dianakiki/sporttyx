import React, { useState } from 'react';
import { X, Bell, Check, Users, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    activityId?: number;
}

interface TeamInvitation {
    id: number;
    teamId: number;
    teamName: string;
    invitedBy: string;
    invitedAt: string;
}

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const mockNotifications: Notification[] = [
    {
        id: 1,
        type: 'ACTIVITY_APPROVED',
        title: 'Активность одобрена',
        message: 'Ваша активность "Утренняя пробежка" была одобрена',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        activityId: 1
    },
    {
        id: 2,
        type: 'NEW_COMMENT',
        title: 'Новый комментарий',
        message: 'Алексей Иванов прокомментировал вашу активность',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        activityId: 1
    },
    {
        id: 3,
        type: 'EVENT_REMINDER',
        title: 'Напоминание о мероприятии',
        message: 'Напоминание: "Весенний Марафон 2024" начнется через 3 дня',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
];

const mockInvitations: TeamInvitation[] = [
    {
        id: 1,
        teamId: 2,
        teamName: 'Бегуны Города',
        invitedBy: 'Администратор',
        invitedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
];

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [invitations, setInvitations] = useState<TeamInvitation[]>(mockInvitations);

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleDeleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        if (notification.activityId) {
            onClose();
            navigate(`/activity/${notification.activityId}`);
        }
    };

    const handleAcceptInvitation = (id: number, teamId: number) => {
        setInvitations(prev => prev.filter(inv => inv.id !== id));
        alert('Приглашение принято! (Demo режим)');
    };

    const handleDeclineInvitation = (id: number) => {
        setInvitations(prev => prev.filter(inv => inv.id !== id));
    };

    if (!isOpen) return null;

    const totalUnread = invitations.length + notifications.filter(n => !n.isRead).length;
    const hasAnyNotifications = invitations.length > 0 || notifications.length > 0;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
            <div className="fixed top-20 right-6 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">Уведомления</h2>
                            {totalUnread > 0 && (
                                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                    {totalUnread}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {hasAnyNotifications ? (
                        <div className="space-y-4">
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
                                                    : 'bg-blue-50 border-blue-200'
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
                                                    <h3 className="font-bold text-slate-900 text-sm">
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.isRead && (
                                                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                                                            Новое
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-700 mb-1 text-sm whitespace-pre-line">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-slate-500">
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

                            {invitations.map((invitation) => (
                                <div
                                    key={`inv-${invitation.id}`}
                                    className="p-4 bg-blue-50 border-2 border-blue-100 rounded-xl hover:border-blue-200 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-5 h-5 text-blue-600" />
                                                <h3 className="font-bold text-slate-900 text-sm">
                                                    Приглашение в команду
                                                </h3>
                                            </div>
                                            <p className="text-slate-700 mb-1 text-sm">
                                                <span className="font-semibold">{invitation.invitedBy}</span> приглашает вас в команду{' '}
                                                <span className="font-semibold text-blue-600">{invitation.teamName}</span>
                                            </p>
                                            <p className="text-xs text-slate-500">
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
                                                onClick={() => handleAcceptInvitation(invitation.id, invitation.teamId)}
                                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                                                title="Принять"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeclineInvitation(invitation.id)}
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
            </div>
        </>
    );
};
