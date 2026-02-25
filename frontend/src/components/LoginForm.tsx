import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { LogIn, Key } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import { ChangePasswordModal } from './ChangePasswordModal';

export const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResetButton, setShowResetButton] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [tempUserData, setTempUserData] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Проверяем, нужна ли смена пароля
                if (data.passwordResetRequired) {
                    setTempUserData(data);
                    setShowChangePasswordModal(true);
                } else {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('user', JSON.stringify({
                        userId: data.userId,
                        username: data.username,
                        name: data.name,
                        role: data.role
                    }));
                    navigate('/');
                }
            } else {
                setError('Неверный логин или пароль');
                setShowResetButton(true);
            }
        } catch (err) {
            setError('Ошибка подключения к серверу');
            setShowResetButton(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!username) {
            setError('Введите логин для сброса пароля');
            return;
        }

        try {
            // Сначала нужно получить ID пользователя по username
            const participantsResponse = await axiosInstance.get('/admin/participants');
            const participant = participantsResponse.data.find((p: any) => p.username === username);
            
            if (!participant) {
                setError('Пользователь не найден');
                return;
            }

            await axiosInstance.post(`/admin/participants/${participant.id}/reset-password`);
            setError('');
            setShowResetButton(false);
            alert('Пароль сброшен! Теперь вы можете войти используя ваш логин в качестве пароля. При входе система попросит установить новый пароль.');
        } catch (err) {
            setError('Ошибка при сбросе пароля');
        }
    };

    const handlePasswordChangeSuccess = () => {
        // После успешной смены пароля сохраняем данные и переходим на главную
        if (tempUserData) {
            localStorage.setItem('token', tempUserData.token);
            localStorage.setItem('userId', tempUserData.userId);
            localStorage.setItem('user', JSON.stringify({
                userId: tempUserData.userId,
                username: tempUserData.username,
                name: tempUserData.name,
                role: tempUserData.role
            }));
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl p-10 transform transition-all hover:shadow-3xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6 shadow-lg">
                            <LogIn className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-3">Вход</h1>
                        <p className="text-slate-500 text-lg">Войдите в свой аккаунт</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Логин"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Введите логин"
                            required
                        />

                        <Input
                            label="Пароль"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                            required
                        />

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {showResetButton && (
                            <button
                                type="button"
                                onClick={handleResetPassword}
                                className="w-full mb-4 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl font-semibold hover:bg-yellow-200 transition-all border-2 border-yellow-300"
                            >
                                <Key className="w-5 h-5" />
                                Сбросить пароль
                            </button>
                        )}

                        <Button type="submit" isLoading={isLoading}>
                            Войти
                        </Button>

                        <div className="mt-8 text-center">
                            <span className="text-slate-600 text-base">Нет аккаунта? </span>
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="text-blue-600 font-bold hover:text-blue-700 transition-colors text-base"
                            >
                                Зарегистрироваться
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showChangePasswordModal && tempUserData && (
                <ChangePasswordModal
                    userId={tempUserData.userId}
                    username={tempUserData.username}
                    onSuccess={handlePasswordChangeSuccess}
                    onCancel={() => {
                        setShowChangePasswordModal(false);
                        setTempUserData(null);
                    }}
                />
            )}
        </div>
    );
};
