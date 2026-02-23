import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Upload, Image as ImageIcon, X } from 'lucide-react';

const mockActivityTypes = [
    { id: 1, name: 'Бег', defaultEnergy: 50 },
    { id: 2, name: 'Велосипед', defaultEnergy: 100 },
    { id: 3, name: 'Плавание', defaultEnergy: 75 },
    { id: 4, name: 'Йога', defaultEnergy: 30 },
    { id: 5, name: 'Футбол', defaultEnergy: 60 },
    { id: 6, name: 'Баскетбол', defaultEnergy: 60 },
    { id: 7, name: 'Тренажерный зал', defaultEnergy: 45 }
];

const mockParticipants = [
    { id: 1, name: 'Демо Пользователь' },
    { id: 2, name: 'Алексей Иванов' },
    { id: 3, name: 'Мария Петрова' },
    { id: 4, name: 'Максим Сидоров' }
];

export const AddActivityForm: React.FC = () => {
    const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>([1]);
    const [selectedActivityTypeId, setSelectedActivityTypeId] = useState('');
    const [activityTypeSearch, setActivityTypeSearch] = useState('');
    const [showActivityTypeDropdown, setShowActivityTypeDropdown] = useState(false);
    const [energy, setEnergy] = useState('');
    const [description, setDescription] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const toggleParticipant = (participantId: number) => {
        setSelectedParticipantIds(prev => 
            prev.includes(participantId)
                ? prev.filter(id => id !== participantId)
                : [...prev, participantId]
        );
    };

    const toggleAllParticipants = () => {
        if (selectedParticipantIds.length === mockParticipants.length) {
            setSelectedParticipantIds([]);
        } else {
            setSelectedParticipantIds(mockParticipants.map(p => p.id));
        }
    };

    const selectActivityType = (activityType: typeof mockActivityTypes[0]) => {
        setSelectedActivityTypeId(activityType.id.toString());
        setActivityTypeSearch(activityType.name);
        setEnergy(activityType.defaultEnergy.toString());
        setShowActivityTypeDropdown(false);
    };

    const filteredActivityTypes = mockActivityTypes.filter(at =>
        at.name.toLowerCase().includes(activityTypeSearch.toLowerCase())
    );

    const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotoPreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
        e.target.value = '';
    };

    const removePhoto = (index: number) => {
        setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (selectedParticipantIds.length === 0 || !selectedActivityTypeId || !energy) {
            setError('Заполните все обязательные поля');
            return;
        }

        setIsLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        alert('Активность успешно добавлена! (Demo режим)');
        navigate(-1);
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Activity className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Добавить активность</h1>
                        <p className="text-slate-500">Зафиксируйте свою спортивную активность</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Кто участвовал? (выберите участников команды)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={toggleAllParticipants}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        selectedParticipantIds.length === mockParticipants.length
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    Все
                                </button>
                                {mockParticipants.map((participant) => (
                                    <button
                                        key={participant.id}
                                        type="button"
                                        onClick={() => toggleParticipant(participant.id)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            selectedParticipantIds.includes(participant.id)
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {participant.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6 relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Тип активности
                            </label>
                            <input
                                type="text"
                                value={activityTypeSearch}
                                onChange={(e) => {
                                    setActivityTypeSearch(e.target.value);
                                    setShowActivityTypeDropdown(true);
                                }}
                                onFocus={() => setShowActivityTypeDropdown(true)}
                                placeholder="Начните вводить тип активности..."
                                className="w-full px-5 py-4 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm hover:border-slate-300"
                                required
                            />
                            {showActivityTypeDropdown && filteredActivityTypes.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                    {filteredActivityTypes.map((activityType) => (
                                        <button
                                            key={activityType.id}
                                            type="button"
                                            onClick={() => selectActivityType(activityType)}
                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0"
                                        >
                                            <div className="font-medium text-slate-900">{activityType.name}</div>
                                            <div className="text-xs text-blue-600 mt-1">По умолчанию: {activityType.defaultEnergy} баллов</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {energy && (
                            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                <p className="text-sm font-semibold text-blue-900 mb-1">Энергия за активность</p>
                                <p className="text-2xl font-bold text-blue-600">{energy} баллов</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Время активности (минуты)
                            </label>
                            <input
                                type="number"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(e.target.value)}
                                placeholder="Например: 30"
                                min="1"
                                className="w-full px-5 py-4 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm hover:border-slate-300"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Описание активности (необязательно)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Расскажите о своей активности..."
                                rows={3}
                                className="w-full px-5 py-4 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm hover:border-slate-300 resize-none"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Фото (необязательно, можно несколько)
                            </label>
                            
                            {photoPreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                    {photoPreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-40 object-cover rounded-xl border-2 border-slate-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePhotosChange}
                                        className="hidden"
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <p className="text-slate-600 font-medium">
                                            Нажмите для загрузки фото
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            Можно выбрать несколько. PNG, JPG до 10MB
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                {isLoading ? 'Добавление...' : 'Добавить активность'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
