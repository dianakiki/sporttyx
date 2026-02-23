import React, { useState } from 'react';
import { Bug, Send, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface BugBountyFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const BugBountyForm: React.FC<BugBountyFormProps> = ({ isOpen, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/bug-reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description }),
            });

            if (response.ok) {
                setSuccess(true);
                setTitle('');
                setDescription('');
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                    if (onSuccess) onSuccess();
                }, 2000);
            } else {
                setError('Ошибка при отправке баг-репорта');
            }
        } catch (err) {
            setError('Ошибка подключения к серверу');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                            <Bug className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Bug Bounty</h2>
                            <p className="text-slate-600 text-sm">Помогите нам улучшить систему</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {success ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bug className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Спасибо!</h3>
                        <p className="text-slate-600">Ваш баг-репорт успешно отправлен</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <Input
                                label="Заголовок"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Краткое описание проблемы"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Описание проблемы
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Подробно опишите обнаруженную проблему, шаги для её воспроизведения и ожидаемое поведение..."
                                required
                                rows={6}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                            />
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-6">
                            <p className="text-sm text-orange-800">
                                <strong>💡 Совет:</strong> Чем подробнее вы опишете проблему, тем быстрее мы сможем её исправить. 
                                За полезные баг-репорты вы можете получить специальные значки!
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isSubmitting}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                            >
                                <Send className="w-5 h-5" />
                                Отправить
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
};
