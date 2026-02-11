import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Home } from 'lucide-react';

export const DevNavigation: React.FC = () => {
    const navigate = useNavigate();

    const pages = [
        { path: '/register', label: 'Регистрация' },
        { path: '/login', label: 'Вход' },
        { path: '/profile', label: 'Профиль участника' },
        { path: '/add-team', label: 'Добавить команду' },
        { path: '/add-activity', label: 'Добавить активность' },
        { path: '/team/1', label: 'Профиль команды' },
        { path: '/tracker', label: 'Трекер команд' },
    ];

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6 shadow-xl">
                        <Home className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-slate-900 mb-4">Навигация</h1>
                    <p className="text-slate-500 text-xl">Выберите страницу для просмотра</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pages.map((page) => (
                        <button
                            key={page.path}
                            onClick={() => navigate(page.path)}
                            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-left group"
                        >
                            <div className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {page.label}
                            </div>
                            <div className="mt-2 text-sm text-slate-500">
                                {page.path}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
