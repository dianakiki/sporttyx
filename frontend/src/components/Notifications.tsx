import React, { useState, useEffect } from 'react';
import { Bell, Users, Check, X } from 'lucide-react';
import { Button } from './ui/Button';

interface TeamInvitation {
    id: number;
    teamId: number;
    teamName: string;
    invitedBy: string;
    invitedAt: string;
}

export const Notifications: React.FC = () => {
    const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInvitations();
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
                // Remove invitation from list
                setInvitations(invitations.filter(inv => inv.id !== invitationId));
            }
        } catch (err) {
            console.error('Error declining invitation:', err);
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

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
                <Bell className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-900">Уведомления</h2>
                {invitations.length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {invitations.length}
                    </span>
                )}
            </div>

            {invitations.length > 0 ? (
                <div className="space-y-4">
                    {invitations.map((invitation) => (
                        <div
                            key={invitation.id}
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
