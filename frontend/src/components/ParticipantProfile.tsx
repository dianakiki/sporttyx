import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, UserPlus, LogOut, Camera, Mail, Phone, Edit, Calendar, MapPin, X, Bug, Award } from 'lucide-react';
import { Button } from './ui/Button';
import { BugBountyForm } from './BugBountyForm';

interface Participant {
    id: number;
    username: string;
    name: string;
    teamName?: string;
    email?: string;
    phone?: string;
    profileImageUrl?: string;
}

interface UserEvent {
    id: number;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: string;
}

interface Badge {
    id: number;
    badgeType: string;
    displayName: string;
    description: string;
    awardedAt: string;
    awardedByName?: string;
    reason?: string;
}

export const ParticipantProfile: React.FC = () => {
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profileImage, setProfileImage] = useState<string>('');
    const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
    const [showBugBountyForm, setShowBugBountyForm] = useState(false);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [eventInvitations, setEventInvitations] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
        fetchUserEvents();
        fetchBadges();
        fetchEventInvitations();
    }, []);

    const fetchProfile = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/participants/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setParticipant(data);
                setProfileImage(data.profileImageUrl || '');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                setProfileImage(imageUrl);
                // Здесь можно добавить загрузку на сервер
                // uploadProfileImage(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchUserEvents = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/participants/${userId}/events`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUserEvents(data);
            } else {
                console.error('Failed to fetch events:', response.status);
                setUserEvents([]);
            }
        } catch (err) {
            console.error('Error fetching user events:', err);
            setUserEvents([]);
        }
    };

    const fetchEventInvitations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/participants/event-invitations', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setEventInvitations(data);
            }
        } catch (err) {
            console.error('Error fetching event invitations:', err);
        }
    };

    const handleAcceptInvitation = async (invitationId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/event-invitations/${invitationId}/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                fetchEventInvitations();
                fetchUserEvents();
            }
        } catch (err) {
            console.error('Error accepting invitation:', err);
        }
    };

    const handleDeclineInvitation = async (invitationId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/event-invitations/${invitationId}/decline`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                fetchEventInvitations();
            }
        } catch (err) {
            console.error('Error declining invitation:', err);
        }
    };

    const fetchBadges = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/participants/${userId}/badges`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setBadges(data);
            }
        } catch (err) {
            console.error('Error fetching badges:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-blue-600 text-xl">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                        {/* Profile Image with Upload */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl">
                                {profileImage ? (
                                    <img 
                                        src={profileImage} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-16 h-16 text-white" />
                                )}
                            </div>
                            <label 
                                htmlFor="profile-image-upload"
                                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <Camera className="w-8 h-8 text-white" />
                            </label>
                            <input
                                id="profile-image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-bold text-slate-900 mb-1">
                                {participant?.name || 'Участник'}
                            </h1>
                            <p className="text-slate-500 text-lg mb-3">@{participant?.username}</p>
                            
                            {participant?.teamName && (
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-slate-600">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    <span className="text-lg">{participant.teamName}</span>
                                </div>
                            )}

                            {/* Contact Info */}
                            <div className="space-y-2 mt-4">
                                {participant?.email && (
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">{participant.email}</span>
                                    </div>
                                )}
                                {participant?.phone && (
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600">
                                        <Phone className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">{participant.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Badges Section */}
                    {badges.length > 0 && (
                        <div className="border-t border-slate-200 pt-6 pb-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-yellow-600" />
                                Значки
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {badges.map((badge) => (
                                    <div
                                        key={badge.id}
                                        className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl"
                                        title={badge.reason || badge.description}
                                    >
                                        <div className="text-2xl mb-2">{badge.displayName.split(' ')[0]}</div>
                                        <div className="text-xs font-semibold text-slate-700">
                                            {badge.displayName.split(' ').slice(1).join(' ')}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {new Date(badge.awardedAt).toLocaleDateString('ru-RU')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-slate-200 pt-8 space-y-3">
                        <Button onClick={() => navigate('/edit-profile')} variant="primary" className="w-full">
                            <Edit className="w-5 h-5" />
                            Редактировать профиль
                        </Button>
                        <button
                            onClick={() => setShowBugBountyForm(true)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            <Bug className="w-5 h-5" />
                            Сообщить о баге
                        </button>
                    </div>
                </div>

                {/* Event Invitations Section */}
                {eventInvitations.length > 0 && (
                    <div className="mt-6 bg-white rounded-3xl shadow-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Mail className="w-6 h-6 text-orange-600" />
                            Приглашения в мероприятия
                        </h2>
                        <div className="space-y-4">
                            {eventInvitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="border-2 border-orange-200 bg-orange-50 rounded-2xl p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                                {invitation.eventName}
                                            </h3>
                                            <p className="text-sm text-slate-600 mb-3">
                                                Приглашение от: {invitation.invitedByName || 'Администратор'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(invitation.invitedAt).toLocaleDateString('ru-RU', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAcceptInvitation(invitation.id)}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all"
                                            >
                                                Принять
                                            </button>
                                            <button
                                                onClick={() => handleDeclineInvitation(invitation.id)}
                                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all"
                                            >
                                                Отклонить
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* User Events Section */}
                <div className="mt-6 bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        Мои мероприятия
                    </h2>

                    {userEvents.length > 0 ? (
                        <div className="space-y-4">
                            {userEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="border-2 border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {event.name}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    event.status === 'ACTIVE' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : event.status === 'UPCOMING'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {event.status === 'ACTIVE' ? 'Активно' : event.status === 'UPCOMING' ? 'Скоро' : 'Завершено'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {new Date(event.startDate).toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                    {' - '}
                                                    {new Date(event.endDate).toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>

                                            {event.description && (
                                                <p className="text-slate-700 text-sm bg-slate-50 p-3 rounded-lg mt-2">
                                                    {event.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg">Вы пока не участвуете в мероприятиях</p>
                        </div>
                    )}
                </div>
            </div>


            {/* Bug Bounty Form */}
            <BugBountyForm
                isOpen={showBugBountyForm}
                onClose={() => setShowBugBountyForm(false)}
                onSuccess={fetchBadges}
            />
        </div>
    );
};
