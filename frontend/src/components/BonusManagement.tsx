import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Gift, AlertCircle } from 'lucide-react';

interface BonusType {
    id: number;
    name: string;
    description: string;
    pointsAdjustment: number;
    type: 'BONUS' | 'PENALTY';
}

interface BonusManagementProps {
    eventId: number;
}

export const BonusManagement: React.FC<BonusManagementProps> = ({ eventId }) => {
    const [bonusTypes, setBonusTypes] = useState<BonusType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingBonus, setEditingBonus] = useState<BonusType | null>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pointsAdjustment: 0,
        type: 'BONUS' as 'BONUS' | 'PENALTY'
    });

    useEffect(() => {
        if (eventId) {
            fetchBonusTypes();
        }
    }, [eventId]);

    const fetchBonusTypes = async () => {
        if (!eventId) return;
        
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/bonus-types?eventId=${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setBonusTypes(data);
            }
        } catch (err) {
            console.error('Error fetching bonus types:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const url = editingBonus 
            ? `/api/bonus-types/${editingBonus.id}`
            : '/api/bonus-types';
        
        const method = editingBonus ? 'PUT' : 'POST';
        
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    eventId: eventId
                }),
            });

            if (response.ok) {
                fetchBonusTypes();
                resetForm();
            } else {
                alert('Ошибка при сохранении');
            }
        } catch (err) {
            console.error('Error saving bonus type:', err);
            alert('Ошибка при сохранении');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот бонус/штраф?')) return;
        
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/bonus-types/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchBonusTypes();
            }
        } catch (err) {
            console.error('Error deleting bonus type:', err);
        }
    };

    const handleEdit = (bonus: BonusType) => {
        setEditingBonus(bonus);
        setFormData({
            name: bonus.name,
            description: bonus.description,
            pointsAdjustment: bonus.pointsAdjustment,
            type: bonus.type
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            pointsAdjustment: 0,
            type: 'BONUS'
        });
        setEditingBonus(null);
        setShowForm(false);
    };

    const bonuses = bonusTypes.filter(b => b.type === 'BONUS');
    const penalties = bonusTypes.filter(b => b.type === 'PENALTY');

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Бонусы и штрафы</h2>
                
                {/* Add button */}
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full mb-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Добавить бонус/штраф
                    </button>
                )}

                {/* Form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="mb-6 p-6 bg-slate-50 rounded-xl space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {editingBonus ? 'Редактировать' : 'Создать новый'} бонус/штраф
                        </h3>
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Тип
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="BONUS"
                                        checked={formData.type === 'BONUS'}
                                        onChange={(e) => setFormData({ ...formData, type: 'BONUS' })}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm font-medium text-slate-700">🎁 Бонус</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="PENALTY"
                                        checked={formData.type === 'PENALTY'}
                                        onChange={(e) => setFormData({ ...formData, type: 'PENALTY' })}
                                        className="w-4 h-4 text-red-600"
                                    />
                                    <span className="text-sm font-medium text-slate-700">⚠️ Штраф</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Название
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Например: 🌟 За креативность"
                                required
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Описание
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Краткое описание"
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Баллы
                            </label>
                            <input
                                type="number"
                                value={formData.pointsAdjustment}
                                onChange={(e) => setFormData({ ...formData, pointsAdjustment: Number(e.target.value) })}
                                placeholder={formData.type === 'BONUS' ? '10' : '-5'}
                                required
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                {formData.type === 'BONUS' 
                                    ? 'Положительное число для бонуса' 
                                    : 'Отрицательное число для штрафа'}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all"
                            >
                                {editingBonus ? 'Сохранить' : 'Создать'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all"
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                )}

                {/* Lists */}
                {isLoading ? (
                    <div className="text-center py-8 text-slate-500">Загрузка...</div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Bonuses */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Gift className="w-5 h-5 text-green-500" />
                                Бонусы ({bonuses.length})
                            </h3>
                            <div className="space-y-3">
                                {bonuses.length === 0 ? (
                                    <p className="text-slate-500 text-sm">Нет бонусов</p>
                                ) : (
                                    bonuses.map(bonus => (
                                        <div key={bonus.id} className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="font-bold text-slate-900">{bonus.name}</div>
                                                    {bonus.description && (
                                                        <div className="text-sm text-slate-600 mt-1">{bonus.description}</div>
                                                    )}
                                                </div>
                                                <div className="text-xl font-bold text-green-600">
                                                    +{bonus.pointsAdjustment}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => handleEdit(bonus)}
                                                    className="flex-1 px-3 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Изменить
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bonus.id)}
                                                    className="flex-1 px-3 py-2 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Penalties */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                Штрафы ({penalties.length})
                            </h3>
                            <div className="space-y-3">
                                {penalties.length === 0 ? (
                                    <p className="text-slate-500 text-sm">Нет штрафов</p>
                                ) : (
                                    penalties.map(penalty => (
                                        <div key={penalty.id} className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="font-bold text-slate-900">{penalty.name}</div>
                                                    {penalty.description && (
                                                        <div className="text-sm text-slate-600 mt-1">{penalty.description}</div>
                                                    )}
                                                </div>
                                                <div className="text-xl font-bold text-red-600">
                                                    {penalty.pointsAdjustment}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => handleEdit(penalty)}
                                                    className="flex-1 px-3 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Изменить
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(penalty.id)}
                                                    className="flex-1 px-3 py-2 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
