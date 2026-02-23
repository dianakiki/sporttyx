import React, { useState } from 'react';
import { X, Bell, Check, Mail } from 'lucide-react';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const mockNotifications = [
    {
        id: 1,
        type: 'ACTIVITY_APPROVED',
        title: 'Активность одобрена',
        message: 'Ваша активность "Утренняя пробежка" была одобрена',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 2,
        type: 'NEW_COMMENT',
        title: 'Новый комментарий',
        message: 'Алексей Иванов прокомментировал вашу активность',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
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

const mockInvitations = [
    {
        id: 1,
        eventName: 'Летний Триатлон 2024',
        invitedByName: 'Администратор',
        invitedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
];

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'notifications' | 'invitations'>('notifications');
    const [notifications, setNotifications] = useState(mockNotifications);

    if (!isOpen) return null;

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

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleAcceptInvitation = (id: number) => {
        alert('Приглашение принято! (Demo режим)');
    };

    const handleDeclineInvitation = (id: number) => {
        alert('Приглашение отклонено! (Demo режим)');
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-slate-900">Уведомления</h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all"
                        >
                            <X className="w-5 h-5 text-slate-700" />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                                activeTab === 'notifications'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <Bell className="w-4 h-4 inline mr-2" />
                            Уведомления
                        </button>
                        <button
                            onClick={() => setActiveTab('invitations')}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                                activeTab === 'invitations'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <Mail className="w-4 h-4 inline mr-2" />
                            Приглашения
                            {mockInvitations.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {mockInvitations.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'notifications' ? (
                        <div>
                            {notifications.filter(n => !n.isRead).length > 0 && (
                                <div className="p-4 border-b border-slate-200">
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                                    >
                                        Отметить все как прочитанные
                                    </button>
                                </div>
                            )}

                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">Нет уведомлений</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            className={`p-4 hover:bg-slate-50 transition-all cursor-pointer ${
                                                !notification.isRead ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    !notification.isRead ? 'bg-blue-100' : 'bg-slate-100'
                                                }`}>
                                                    <Bell className={`w-5 h-5 ${
                                                        !notification.isRead ? 'text-blue-600' : 'text-slate-600'
                                                    }`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-slate-900 text-sm">
                                                            {notification.title}
                                                        </h3>
                                                        {!notification.isRead && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-600 mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            {mockInvitations.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">Нет приглашений</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200">
                                    {mockInvitations.map((invitation) => (
                                        <div key={invitation.id} className="p-4">
                                            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Mail className="w-5 h-5 text-orange-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-slate-900 mb-1">
                                                            {invitation.eventName}
                                                        </h3>
                                                        <p className="text-sm text-slate-600 mb-1">
                                                            Приглашение от: {invitation.invitedByName}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {formatTimeAgo(invitation.invitedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAcceptInvitation(invitation.id)}
                                                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Принять
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeclineInvitation(invitation.id)}
                                                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Отклонить
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
