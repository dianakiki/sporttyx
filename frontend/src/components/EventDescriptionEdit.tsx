import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Eye } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import ReactMarkdown from 'react-markdown';

interface EventDescriptionEditProps {
    eventId: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface EventNews {
    id: number;
    content: string;
    createdByName: string;
    createdAt: string;
}

export const EventDescriptionEdit: React.FC<EventDescriptionEditProps> = ({
    eventId,
    isOpen,
    onClose,
    onSuccess
}) => {
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [news, setNews] = useState<EventNews[]>([]);
    const [newNewsContent, setNewNewsContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showNewsPreview, setShowNewsPreview] = useState(false);

    useEffect(() => {
        if (isOpen && eventId) {
            fetchEventData();
        }
    }, [isOpen, eventId]);

    const fetchEventData = async () => {
        try {
            const [eventRes, newsRes] = await Promise.all([
                axiosInstance.get(`/events/${eventId}`),
                axiosInstance.get(`/events/${eventId}/news`)
            ]);
            setDescription(eventRes.data.description || '');
            setImageUrl(eventRes.data.imageUrl || '');
            setNews(newsRes.data);
        } catch (error) {
            console.error('Error fetching event data:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await axiosInstance.put(`/admin/events/${eventId}`, {
                description,
                imageUrl
            });
            alert('Описание успешно обновлено!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Ошибка при обновлении описания');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNews = async () => {
        if (!newNewsContent.trim()) {
            alert('Введите текст новости');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post(`/events/${eventId}/news`, {
                content: newNewsContent
            });
            setNewNewsContent('');
            await fetchEventData();
            alert('Новость успешно добавлена!');
        } catch (error) {
            console.error('Error adding news:', error);
            alert('Ошибка при добавлении новости');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNews = async (newsId: number) => {
        if (!window.confirm('Удалить эту новость?')) return;

        setLoading(true);
        try {
            await axiosInstance.delete(`/events/news/${newsId}`);
            await fetchEventData();
            alert('Новость удалена');
        } catch (error) {
            console.error('Error deleting news:', error);
            alert('Ошибка при удалении новости');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Редактирование описания мероприятия</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-600" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            URL картинки мероприятия
                        </label>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        />
                        {imageUrl && (
                            <div className="mt-3 rounded-xl overflow-hidden">
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-slate-700">
                                Описание мероприятия (Markdown)
                            </label>
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                {showPreview ? 'Редактор' : 'Предпросмотр'}
                            </button>
                        </div>
                        
                        {showPreview ? (
                            <div className="w-full min-h-[200px] px-4 py-3 border-2 border-slate-200 rounded-xl prose prose-slate max-w-none">
                                <ReactMarkdown>{description || '*Нет описания*'}</ReactMarkdown>
                            </div>
                        ) : (
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={8}
                                placeholder="Введите описание мероприятия. Поддерживается Markdown: **жирный**, *курсив*, # заголовки, - списки"
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                            />
                        )}
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Новости мероприятия</h3>
                        
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Добавить новость (Markdown)
                                </label>
                                <button
                                    onClick={() => setShowNewsPreview(!showNewsPreview)}
                                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    {showNewsPreview ? 'Редактор' : 'Предпросмотр'}
                                </button>
                            </div>
                            
                            {showNewsPreview ? (
                                <div className="w-full min-h-[100px] px-4 py-3 border-2 border-slate-200 rounded-xl prose prose-slate max-w-none mb-2">
                                    <ReactMarkdown>{newNewsContent || '*Нет текста*'}</ReactMarkdown>
                                </div>
                            ) : (
                                <textarea
                                    value={newNewsContent}
                                    onChange={(e) => setNewNewsContent(e.target.value)}
                                    rows={4}
                                    placeholder="Введите текст новости. Поддерживается Markdown"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none font-mono text-sm mb-2"
                                />
                            )}
                            
                            <button
                                onClick={handleAddNews}
                                disabled={loading || !newNewsContent.trim()}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-5 h-5" />
                                Добавить новость
                            </button>
                        </div>

                        {news.length > 0 && (
                            <div className="space-y-3 mt-4">
                                <h4 className="text-sm font-semibold text-slate-700">Существующие новости:</h4>
                                {news.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border-2 border-slate-200 rounded-xl p-4"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <div className="font-semibold text-slate-900 text-sm">
                                                    {item.createdByName}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {new Date(item.createdAt).toLocaleString('ru-RU')}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteNews(item.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="prose prose-sm prose-slate max-w-none text-slate-700">
                                            <ReactMarkdown>{item.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5" />
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};
