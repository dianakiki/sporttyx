import React, { useState } from 'react';
import { X, Key } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';

interface ChangePasswordModalProps {
    userId: number;
    username: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ userId, username, onSuccess, onCancel }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Новые пароли не совпадают');
            return;
        }

        if (newPassword.length < 4) {
            setError('Пароль должен содержать минимум 4 символа');
            return;
        }

        setIsLoading(true);

        try {
            await axiosInstance.post(`/participants/${userId}/change-password`, {
                oldPassword,
                newPassword
            });
            
            onSuccess();
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 400) {
                setError('Неверный текущий пароль');
            } else {
                setError('Ошибка при смене пароля. Попробуйте еще раз.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
                <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Key className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Смена пароля обязательна</h2>
                    </div>
                </div>
                
                <div className="p-8">
                    <p className="text-slate-600 mb-6">
                        Ваш пароль был сброшен администратором. Пожалуйста, установите новый пароль для продолжения работы.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Текущий пароль (ваш логин: {username})
                            </label>
                            <input
                                type="password"
                                placeholder="Введите текущий пароль"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Новый пароль
                            </label>
                            <input
                                type="password"
                                placeholder="Введите новый пароль"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Подтвердите новый пароль
                            </label>
                            <input
                                type="password"
                                placeholder="Повторите новый пароль"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Сохранение...' : 'Сменить пароль'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
