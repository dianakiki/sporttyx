import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ActivityTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ActivityTypeFormData) => Promise<void>;
    editingActivityType?: ActivityTypeFormData | null;
    eventId?: number | null;
}

export interface ActivityTypeFormData {
    id?: number;
    name: string;
    description: string;
    defaultEnergy: number;
    eventId?: number | null;
}

export const ActivityTypeModal: React.FC<ActivityTypeModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingActivityType,
    eventId
}) => {
    const [formData, setFormData] = useState<ActivityTypeFormData>({
        name: '',
        description: '',
        defaultEnergy: 0,
        eventId: eventId || null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editingActivityType) {
            setFormData({
                id: editingActivityType.id,
                name: editingActivityType.name,
                description: editingActivityType.description,
                defaultEnergy: editingActivityType.defaultEnergy,
                eventId: editingActivityType.eventId || eventId || null
            });
        } else {
            setFormData({
                name: '',
                description: '',
                defaultEnergy: 0,
                eventId: eventId || null
            });
        }
        setError(null);
    }, [editingActivityType, eventId, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Произошла ошибка при сохранении');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between rounded-t-3xl">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {editingActivityType ? 'Редактировать тип активности' : 'Создать тип активности'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                        disabled={isSubmitting}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    {error && (
                        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                            <p className="text-red-700 text-sm font-semibold">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Название типа активности *
                        </label>
                        <input
                            type="text"
                            placeholder="Например: Бег, Плавание, Йога"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Описание
                        </label>
                        <textarea
                            placeholder="Краткое описание типа активности"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                            rows={3}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Энергия по умолчанию *
                        </label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.defaultEnergy}
                            onChange={(e) => setFormData({ ...formData, defaultEnergy: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                            required
                            min="0"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Количество энергии, которое будет начисляться за эту активность по умолчанию
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                            disabled={isSubmitting}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Сохранение...' : (editingActivityType ? 'Сохранить изменения' : 'Создать тип активности')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
