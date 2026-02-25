import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { UserPlus } from 'lucide-react';

export const RegistrationForm: React.FC = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
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

        if (!name.trim()) {
            setError('Введите ваше имя');
            return;
        }

        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        if (password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, name: name.trim() }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                navigate('/');
            } else {
                const data = await response.json();
                setError(data.message || 'Ошибка регистрации');
            }
        } catch (err) {
            setError('Ошибка подключения к серверу');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl p-10 transform transition-all hover:shadow-3xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6 shadow-lg">
                            <UserPlus className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-3">Регистрация</h1>
                        <p className="text-slate-500 text-lg">Создайте новый аккаунт</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Имя"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ваше имя"
                            required
                        />

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

                        <Input
                            label="Подтвердите пароль"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Повторите пароль"
                            required
                        />

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <Button type="submit" isLoading={isLoading}>
                            Зарегистрироваться
                        </Button>

                        <div className="mt-8 text-center">
                            <span className="text-slate-600 text-base">Уже есть аккаунт? </span>
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-blue-600 font-bold hover:text-blue-700 transition-colors text-base"
                            >
                                Войти
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
