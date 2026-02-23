import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, User, LogOut, BarChart3, Plus, Shield, Bell } from 'lucide-react';
import { TeamSelectionModal } from './TeamSelectionModal';
import { NotificationsModal } from './NotificationsModal';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [userTeamId, setUserTeamId] = useState<number | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [moderationEnabled, setModerationEnabled] = useState(false);
    const [hasJoinedEvent, setHasJoinedEvent] = useState(false);
    const [isTeamBasedEvent, setIsTeamBasedEvent] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserRole(user.role);
                
                // Check if moderation is enabled for moderators/admins
                if (user.role === 'MODERATOR' || user.role === 'ADMIN') {
                    checkModerationEnabled();
                }
            } catch (e) {
                console.error('Error parsing user from localStorage:', e);
            }
        }

        const fetchUserTeam = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const token = localStorage.getItem('token');
                console.log('Fetching team for userId:', userId);
                if (!userId || !token) {
                    console.log('No userId or token, skipping fetch');
                    return;
                }

                const response = await fetch(`/api/participants/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('User data from API:', data);
                    console.log('teamId from response:', data.teamId);
                    if (data.teamId) {
                        setUserTeamId(data.teamId);
                        console.log('Set userTeamId to:', data.teamId);
                    } else {
                        console.log('No teamId in response, user not in team');
                        setUserTeamId(null);
                    }
                    if (data.role) {
                        setUserRole(data.role);
                    }
                }

                // Check if user has joined any events
                const eventsResponse = await fetch(`/api/participants/${userId}/events`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                
                if (eventsResponse.ok) {
                    const events = await eventsResponse.json();
                    setHasJoinedEvent(events.length > 0);
                    
                    // Check if any of the events is team-based
                    const hasTeamEvent = events.some((event: any) => event.teamBasedCompetition);
                    setIsTeamBasedEvent(hasTeamEvent);
                }
            } catch (err) {
                console.error('Error fetching user team:', err);
            }
        };

        fetchUserTeam();
        fetchUnreadCount();
        
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            if (!userId || !token) return;

            const [notificationsRes, invitationsRes] = await Promise.all([
                fetch('/api/notifications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`/api/participants/${userId}/invitations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            let count = 0;
            if (notificationsRes.ok) {
                const notifications = await notificationsRes.json();
                count += notifications.filter((n: any) => !n.isRead).length;
            }
            if (invitationsRes.ok) {
                const invitations = await invitationsRes.json();
                count += invitations.length;
            }
            setUnreadCount(count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    const checkModerationEnabled = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/moderation/enabled', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const enabled = await response.json();
                setModerationEnabled(enabled);
            }
        } catch (err) {
            console.error('Error checking moderation status:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    const handleMyTeamClick = () => {
        console.log('My Team clicked, userTeamId:', userTeamId);
        if (userTeamId) {
            console.log('Navigating to my team');
            navigate('/my-team');
        } else {
            console.log('No team, opening modal');
            setIsModalOpen(true);
        }
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-slate-900 hover:text-blue-600 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                                <Home className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold hidden sm:block">DiaEvent</span>
                        </button>

                        {hasJoinedEvent && (
                            <button
                                onClick={() => navigate('/add-activity')}
                                className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-semibold transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden md:inline">Добавить активность</span>
                            </button>
                        )}

                        {userRole === 'ADMIN' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="flex items-center gap-2 px-4 py-2.5 text-purple-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl font-semibold transition-all"
                            >
                                <Shield className="w-5 h-5" />
                                <span className="hidden md:inline">Администрирование</span>
                            </button>
                        )}

                        {(userRole === 'MODERATOR' || userRole === 'ADMIN') && moderationEnabled && (
                            <button
                                onClick={() => navigate('/moderation')}
                                className="flex items-center gap-2 px-4 py-2.5 text-orange-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl font-semibold transition-all"
                            >
                                <Shield className="w-5 h-5" />
                                <span className="hidden md:inline">Модерация</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {hasJoinedEvent && isTeamBasedEvent && (
                            <button
                                onClick={handleMyTeamClick}
                                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                            >
                                <Users className="w-5 h-5" />
                                <span className="hidden sm:inline">Моя команда</span>
                            </button>
                        )}

                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all hover:shadow-md"
                            title="Уведомления"
                        >
                            <Bell className="w-6 h-6 text-slate-700" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => navigate('/profile')}
                            className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all hover:shadow-md"
                            title="Профиль"
                        >
                            <User className="w-6 h-6 text-slate-700" />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-12 h-12 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-all hover:shadow-md"
                            title="Выход"
                        >
                            <LogOut className="w-6 h-6 text-red-600" />
                        </button>
                    </div>
                </div>
            </div>
            
            <TeamSelectionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
            
            <NotificationsModal
                isOpen={isNotificationsOpen}
                onClose={() => {
                    setIsNotificationsOpen(false);
                    fetchUnreadCount();
                }}
            />
        </header>
    );
};
