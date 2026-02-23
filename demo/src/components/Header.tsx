import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, User, Bell } from 'lucide-react';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const [unreadCount] = useState(3);

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
                            <span className="text-xl font-bold hidden sm:block">SporttyX Demo</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/team/1')}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                        >
                            <Users className="w-5 h-5" />
                            <span className="hidden sm:inline">Моя команда</span>
                        </button>

                        <button
                            className="relative w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all hover:shadow-md"
                            title="Уведомления"
                        >
                            <Bell className="w-6 h-6 text-slate-700" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {unreadCount}
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
                    </div>
                </div>
            </div>
        </header>
    );
};
