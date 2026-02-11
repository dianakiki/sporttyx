import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../api/api';

interface AuthPageProps {
    onLoginSuccess: (user: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async () => {
        if (!isLogin && !name.trim()) {
            alert('Пожалуйста, введите ваше имя');
            return;
        }
        
        if (!email.trim() || !password.trim()) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        setIsLoading(true);
        try {
            if (isLogin) {
                const res = await api.auth.login(email, password);
                onLoginSuccess(res.user);
            } else {
                const res = await api.auth.register({ username: email, password, name: name.trim() });
                onLoginSuccess(res.user);
            }
        } catch (e: any) {
            alert('Ошибка: ' + (e.response?.data?.message || e.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Вход' : 'Регистрация'}</h1>

                {!isLogin && <Input label="Имя" value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" />}
                <Input label="Username" value={email} onChange={e => setEmail(e.target.value)} placeholder="username" />
                <Input label="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />

                <Button onClick={handleSubmit} isLoading={isLoading}>
                    {isLogin ? 'Войти' : 'Создать аккаунт'}
                </Button>

                <div className="mt-4 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 text-sm hover:underline">
                        {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти'}
                    </button>
                </div>
            </div>
        </div>
    );
};