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
    timeLimitRequired?: boolean;
    minDurationMinutes?: number | null;
    maxDurationMinutes?: number | null;
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
        eventId: eventId || null,
        timeLimitRequired: false,
        minDurationMinutes: null,
        maxDurationMinutes: null
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
                eventId: editingActivityType.eventId || eventId || null,
                timeLimitRequired: editingActivityType.timeLimitRequired ?? false,
                minDurationMinutes: editingActivityType.minDurationMinutes ?? null,
                maxDurationMinutes: editingActivityType.maxDurationMinutes ?? null
            });
        } else {
            setFormData({
                name: '',
                description: '',
                defaultEnergy: 0,
                eventId: eventId || null,
                timeLimitRequired: false,
                minDurationMinutes: null,
                maxDurationMinutes: null
            });
        }
        setError(null);
    }, [editingActivityType, eventId, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Frontend validation for time limits
        const timeLimitRequired = !!formData.timeLimitRequired;
        const min = formData.minDurationMinutes;
        const max = formData.maxDurationMinutes;

        if (timeLimitRequired) {
            if (min == null && max == null) {
                setError('При включённом ограничении по времени укажите минимальное или максимальное время (хотя бы одно поле).');
                return;
            }
            if (min != null && min < 0) {
                setError('Минимальное время не может быть отрицательным.');
                return;
            }
            if (max != null && max < 0) {
                setError('Максимальное время не может быть отрицательным.');
                return;
            }
            if (min != null && max != null && min > max) {
                setError('Минимальное время не может быть больше максимального.');
                return;
            }
        }

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

                    <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={!!formData.timeLimitRequired}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        timeLimitRequired: e.target.checked,
                                        // when turning off, clear limits on client as well
                                        minDurationMinutes: e.target.checked ? formData.minDurationMinutes : null,
                                        maxDurationMinutes: e.target.checked ? formData.maxDurationMinutes : null,
                                    })
                                }
                                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                disabled={isSubmitting}
                            />
                            <span className="text-sm font-semibold text-slate-700">
                                Ограничение по времени (минуты)
                            </span>
                        </label>

                        {formData.timeLimitRequired && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Минимальное время (мин)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="Например, 10"
                                        value={formData.minDurationMinutes ?? ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                minDurationMinutes: e.target.value === '' ? null : Number(e.target.value),
                                            })
                                        }
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Максимальное время (мин)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="Например, 120"
                                        value={formData.maxDurationMinutes ?? ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                maxDurationMinutes: e.target.value === '' ? null : Number(e.target.value),
                                            })
                                        }
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-slate-500">
                            Если ограничение по времени выключено, минимальное и максимальное время будут проигнорированы.
                            Если включено — должно быть заполнено хотя бы одно поле (минимальное или максимальное время).
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
