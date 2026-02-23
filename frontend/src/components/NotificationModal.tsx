import React, { useState, useMemo } from 'react';
import { X, Send, CheckCircle, Search, UserX, Save, Users } from 'lucide-react';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onSaveDraft?: () => void;
    notification: {
        title: string;
        message: string;
        recipientType: string;
        participantIds: number[];
    };
    setNotification: React.Dispatch<React.SetStateAction<{
        title: string;
        message: string;
        recipientType: string;
        participantIds: number[];
    }>>;
    participants: any[];
    toggleParticipantSelection: (id: number) => void;
    notificationSuccess: boolean;
    notificationCount: number;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onSaveDraft,
    notification,
    setNotification,
    participants,
    toggleParticipantSelection,
    notificationSuccess,
    notificationCount
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredParticipants = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return participants.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.username.toLowerCase().includes(query)
        );
    }, [searchQuery, participants]);

    const selectedParticipants = useMemo(() => {
        return participants.filter(p => notification.participantIds.includes(p.id));
    }, [participants, notification.participantIds]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between rounded-t-3xl flex-shrink-0">
                    <h2 className="text-2xl font-bold text-slate-900">Отправить уведомление</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="overflow-y-auto px-2 flex-1" style={{
                    scrollbarGutter: 'stable'
                }}>
                
                {notificationSuccess ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Уведомления отправлены!</h3>
                        <p className="text-slate-600">
                            Успешно отправлено {notificationCount} уведомлений
                        </p>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Заголовок</label>
                            <input
                                type="text"
                                placeholder="Заголовок уведомления"
                                value={notification.title}
                                onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Текст уведомления</label>
                            <textarea
                                placeholder="Введите текст уведомления..."
                                value={notification.message}
                                onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                rows={5}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Кому отправить</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all">
                                    <input
                                        type="radio"
                                        name="recipientType"
                                        value="ALL"
                                        checked={notification.recipientType === 'ALL'}
                                        onChange={(e) => setNotification({ ...notification, recipientType: e.target.value, participantIds: [] })}
                                        className="w-5 h-5 text-purple-600"
                                    />
                                    <div>
                                        <p className="font-semibold text-slate-900">Всем участникам мероприятия</p>
                                        <p className="text-sm text-slate-600">Уведомление получат все участники</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all">
                                    <input
                                        type="radio"
                                        name="recipientType"
                                        value="CAPTAINS"
                                        checked={notification.recipientType === 'CAPTAINS'}
                                        onChange={(e) => setNotification({ ...notification, recipientType: e.target.value, participantIds: [] })}
                                        className="w-5 h-5 text-purple-600"
                                    />
                                    <div>
                                        <p className="font-semibold text-slate-900">Только капитанам команд</p>
                                        <p className="text-sm text-slate-600">Уведомление получат капитаны всех команд</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all">
                                    <input
                                        type="radio"
                                        name="recipientType"
                                        value="SPECIFIC"
                                        checked={notification.recipientType === 'SPECIFIC'}
                                        onChange={(e) => setNotification({ ...notification, recipientType: e.target.value })}
                                        className="w-5 h-5 text-purple-600"
                                    />
                                    <div>
                                        <p className="font-semibold text-slate-900">Конкретным участникам</p>
                                        <p className="text-sm text-slate-600">Выберите участников из списка ниже</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {notification.recipientType === 'SPECIFIC' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Поиск участников
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Введите имя или username..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                    {searchQuery && filteredParticipants.length > 0 && (
                                        <div className="mt-2 max-h-48 overflow-y-auto border-2 border-slate-200 rounded-xl p-2 pr-1 space-y-1" style={{
                                            scrollbarGutter: 'stable'
                                        }}>
                                            {filteredParticipants.map((participant) => (
                                                <div
                                                    key={participant.id}
                                                    onClick={() => {
                                                        toggleParticipantSelection(participant.id);
                                                        setSearchQuery('');
                                                    }}
                                                    className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg cursor-pointer transition-all mr-1"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{participant.name}</p>
                                                        <p className="text-sm text-slate-600">@{participant.username}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {searchQuery && filteredParticipants.length === 0 && (
                                        <div className="mt-2 p-4 text-center text-slate-500 border-2 border-slate-200 rounded-xl">
                                            Участники не найдены
                                        </div>
                                    )}
                                </div>

                                {selectedParticipants.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Выбранные участники ({selectedParticipants.length})
                                        </label>
                                        <div className="border-2 border-purple-200 bg-purple-50 rounded-xl p-3 space-y-2">
                                            {selectedParticipants.map((participant) => (
                                                <div
                                                    key={participant.id}
                                                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{participant.name}</p>
                                                        <p className="text-sm text-slate-600">@{participant.username}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleParticipantSelection(participant.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Удалить"
                                                    >
                                                        <UserX className="w-5 h-5 text-red-500" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                            >
                                Отмена
                            </button>
                            {onSaveDraft && (
                                <button
                                    type="button"
                                    onClick={onSaveDraft}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    Сохранить черновик
                                </button>
                            )}
                            <button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                Отправить
                            </button>
                        </div>
                    </form>
                )}
                </div>
            </div>
        </div>
    );
};
