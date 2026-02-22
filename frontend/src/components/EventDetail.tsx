import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Edit, Upload, FileSpreadsheet, X, Save, Users, Activity as ActivityIcon } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import * as XLSX from 'xlsx';
import { translateDashboardType } from '../utils/translations';

interface EventDetail {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    visibility: string;
    requiresActivityApproval: boolean;
    maxTeams: number | null;
    maxParticipants: number | null;
    registrationDeadline?: string;
    pointsMultiplier: number;
    customScoringRules?: string;
    bannerImageUrl?: string;
    logoUrl?: string;
    primaryColor?: string;
    notificationsEnabled: boolean;
    reminderDaysBefore?: number;
    externalEventId?: string;
    webhookUrl?: string;
    displayOnHomepage: boolean;
    dashboardTypes: string[];
    dashboardOrder?: string[];
    teamBasedCompetition?: boolean;
}

interface Team {
    id: number;
    name: string;
}

interface ActivityType {
    id: number;
    name: string;
    description: string;
    defaultEnergy: number;
}

export const EventDetail: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [showExcelUpload, setShowExcelUpload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editForm, setEditForm] = useState<Partial<EventDetail>>({});
    const [uploadStatus, setUploadStatus] = useState<{ show: boolean; success: boolean; message: string }>({ show: false, success: false, message: '' });
    const [draggedDashboardIndex, setDraggedDashboardIndex] = useState<number | null>(null);

    useEffect(() => {
        if (eventId) {
            fetchEventData();
        }
    }, [eventId]);

    const fetchEventData = async () => {
        try {
            const [eventRes, teamsRes, activityTypesRes] = await Promise.all([
                axiosInstance.get(`/events/${eventId}`),
                axiosInstance.get(`/teams?eventId=${eventId}`),
                axiosInstance.get(`/activity-types?eventId=${eventId}`)
            ]);

            setEvent(eventRes.data);
            setEditForm(eventRes.data);
            setTeams(teamsRes.data);
            setActivityTypes(activityTypesRes.data);
        } catch (error) {
            console.error('Error fetching event data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEvent = async () => {
        try {
            const requestData = {
                name: editForm.name,
                description: editForm.description,
                startDate: editForm.startDate,
                endDate: editForm.endDate,
                status: editForm.status,
                visibility: editForm.visibility,
                requiresActivityApproval: editForm.requiresActivityApproval,
                maxTeams: editForm.maxTeams || null,
                maxParticipants: editForm.maxParticipants || null,
                registrationDeadline: editForm.registrationDeadline,
                pointsMultiplier: editForm.pointsMultiplier || 1.0,
                customScoringRules: editForm.customScoringRules,
                bannerImageUrl: editForm.bannerImageUrl,
                logoUrl: editForm.logoUrl,
                primaryColor: editForm.primaryColor,
                notificationsEnabled: editForm.notificationsEnabled,
                reminderDaysBefore: editForm.reminderDaysBefore,
                externalEventId: editForm.externalEventId,
                webhookUrl: editForm.webhookUrl,
                displayOnHomepage: editForm.displayOnHomepage,
                dashboardTypes: editForm.dashboardTypes,
                dashboardOrder: editForm.dashboardOrder || editForm.dashboardTypes,
                teamBasedCompetition: editForm.teamBasedCompetition !== false,
                eventAdminIds: []
            };
            
            await axiosInstance.put(`/admin/events/${eventId}`, requestData);
            setIsEditing(false);
            fetchEventData();
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Ошибка при обновлении мероприятия');
        }
    };

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

            const activitiesToCreate = jsonData.map((row: any) => {
                const energy = row['Балл'] || row['Points'] || row['points'] || row['Баллы'];
                return {
                    name: row['Активность'] || row['Activity'] || row['activity'] || '',
                    description: row['Описание'] || row['Description'] || row['description'] || '',
                    defaultEnergy: typeof energy === 'number' ? energy : parseInt(String(energy || '0')),
                    eventId: parseInt(eventId!)
                };
            }).filter(activity => activity.name && activity.defaultEnergy > 0);

            let successCount = 0;
            let errorCount = 0;

            for (const activity of activitiesToCreate) {
                try {
                    await axiosInstance.post('/admin/activity-types', activity);
                    successCount++;
                } catch (err) {
                    console.error('Error creating activity:', activity.name, err);
                    errorCount++;
                }
            }

            setUploadStatus({
                show: true,
                success: successCount > 0,
                message: `Успешно добавлено: ${successCount} активностей${errorCount > 0 ? `, ошибок: ${errorCount}` : ''}`
            });
            
            setTimeout(() => {
                setUploadStatus({ show: false, success: false, message: '' });
            }, 5000);
            
            setShowExcelUpload(false);
            fetchEventData();
        } catch (error) {
            console.error('Error parsing Excel:', error);
            setUploadStatus({
                show: true,
                success: false,
                message: 'Ошибка при обработке Excel файла. Убедитесь, что файл содержит столбцы: Активность, Описание, Балл'
            });
            setTimeout(() => {
                setUploadStatus({ show: false, success: false, message: '' });
            }, 5000);
        }
    };

    const handleDeleteActivityType = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этот тип активности?')) {
            try {
                await axiosInstance.delete(`/admin/activity-types/${id}`);
                fetchEventData();
            } catch (error) {
                console.error('Error deleting activity type:', error);
            }
        }
    };

    const handleDashboardTypeToggle = (type: string) => {
        setEditForm(prev => {
            const newTypes = prev.dashboardTypes?.includes(type)
                ? prev.dashboardTypes.filter(t => t !== type)
                : [...(prev.dashboardTypes || []), type];
            
            // Обновляем dashboardOrder: удаляем тип если он был убран, добавляем в конец если добавлен
            let newOrder = (prev.dashboardOrder || prev.dashboardTypes || []).filter(t => newTypes.includes(t));
            if (!prev.dashboardTypes?.includes(type) && newTypes.includes(type)) {
                newOrder.push(type);
            }
            
            return {
                ...prev,
                dashboardTypes: newTypes,
                dashboardOrder: newOrder
            };
        });
    };

    const handleDragStart = (index: number) => {
        setDraggedDashboardIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedDashboardIndex === null || draggedDashboardIndex === dropIndex) return;

        const order = editForm.dashboardOrder || editForm.dashboardTypes || [];
        const newOrder = [...order];
        const draggedItem = newOrder[draggedDashboardIndex];
        newOrder.splice(draggedDashboardIndex, 1);
        newOrder.splice(dropIndex, 0, draggedItem);
        setEditForm({ ...editForm, dashboardOrder: newOrder });
        setDraggedDashboardIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedDashboardIndex(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-slate-600">Загрузка...</div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-slate-600">Мероприятие не найдено</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.name || ''}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="text-4xl font-bold text-slate-900 w-full border-2 border-slate-300 rounded-lg px-4 py-2"
                                />
                            ) : (
                                <h1 className="text-4xl font-bold text-slate-900">{event.name}</h1>
                            )}
                            {isEditing ? (
                                <textarea
                                    value={editForm.description || ''}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="text-slate-600 mt-2 w-full border-2 border-slate-300 rounded-lg px-4 py-2"
                                    rows={3}
                                />
                            ) : (
                                <p className="text-slate-600 mt-2">{event.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                if (isEditing) {
                                    handleSaveEvent();
                                } else {
                                    setIsEditing(true);
                                }
                            }}
                            className="ml-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
                        >
                            {isEditing ? (
                                <>
                                    <Save className="w-5 h-5" />
                                    Сохранить
                                </>
                            ) : (
                                <>
                                    <Edit className="w-5 h-5" />
                                    Редактировать
                                </>
                            )}
                        </button>
                    </div>

                    {isEditing && (
                        <div className="space-y-4 mt-6 pt-6 border-t border-slate-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Дата начала</label>
                                    <input
                                        type="datetime-local"
                                        value={editForm.startDate?.slice(0, 16) || ''}
                                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Дата окончания</label>
                                    <input
                                        type="datetime-local"
                                        value={editForm.endDate?.slice(0, 16) || ''}
                                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Типы дашбордов</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['RANKING', 'TRACKER', 'FEED', 'SIMPLE_LIST'].map(type => (
                                        <label key={type} className="flex items-center gap-2 p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={editForm.dashboardTypes?.includes(type)}
                                                onChange={() => handleDashboardTypeToggle(type)}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-semibold text-slate-700">
                                                {translateDashboardType(type)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {editForm.dashboardTypes && editForm.dashboardTypes.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Порядок отображения вкладок
                                        <span className="text-xs text-slate-500 ml-2">(перетащите для изменения порядка)</span>
                                    </label>
                                    <div className="space-y-2 p-4 bg-slate-50 rounded-xl">
                                        {(editForm.dashboardOrder || editForm.dashboardTypes).map((type, index) => (
                                            <div
                                                key={type}
                                                draggable
                                                onDragStart={() => handleDragStart(index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDrop={(e) => handleDrop(e, index)}
                                                onDragEnd={handleDragEnd}
                                                className={`flex items-center justify-between p-3 bg-white rounded-lg border-2 transition-all cursor-move ${
                                                    draggedDashboardIndex === index
                                                        ? 'border-blue-400 bg-blue-50 opacity-50'
                                                        : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                                    </svg>
                                                    <span className="font-semibold text-slate-700">
                                                        {index + 1}. {translateDashboardType(type)}
                                                    </span>
                                                </div>
                                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                </svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-slate-200 rounded-lg hover:border-blue-300 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={editForm.teamBasedCompetition !== false}
                                        onChange={(e) => setEditForm({ ...editForm, teamBasedCompetition: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-semibold text-slate-700">Командное мероприятие</span>
                                    <span className="text-xs text-slate-500">(если выключено - индивидуальное)</span>
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-5 h-5" />
                            <span>{new Date(event.startDate).toLocaleDateString('ru-RU')} - {new Date(event.endDate).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Users className="w-5 h-5" />
                            <span>{teams.length} команд</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <ActivityIcon className="w-5 h-5" />
                            <span>{activityTypes.length} типов активностей</span>
                        </div>
                    </div>
                </div>

                {/* Teams Section */}
                {teams.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Команды мероприятия</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {teams.map((team) => (
                                <div
                                    key={team.id}
                                    onClick={() => navigate(`/team/${team.id}`)}
                                    className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {team.name}
                                            </p>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Activity Types Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Типы активностей</h2>
                        <button
                            onClick={() => setShowExcelUpload(true)}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            Загрузить из Excel
                        </button>
                    </div>

                    <div className="grid gap-3">
                        {activityTypes.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">Нет типов активностей в этом мероприятии</p>
                        ) : (
                            activityTypes.map((type) => (
                                <div key={type.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">{type.name}</p>
                                        {type.description && (
                                            <p className="text-sm text-slate-600 mt-1">{type.description}</p>
                                        )}
                                        <p className="text-sm text-blue-600 mt-1">Баллы: {type.defaultEnergy}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteActivityType(type.id)}
                                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Excel Upload Modal */}
                {showExcelUpload && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Загрузить активности из Excel</h2>
                                <button
                                    onClick={() => setShowExcelUpload(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-slate-600 mb-4">
                                    Загрузите Excel файл со следующими столбцами:
                                </p>
                                <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
                                    <li><strong>Активность</strong> - название активности</li>
                                    <li><strong>Описание</strong> - описание активности (необязательно)</li>
                                    <li><strong>Балл</strong> - количество баллов за активность</li>
                                </ul>
                                <p className="text-sm text-slate-500">
                                    Примечание: Также поддерживаются английские названия столбцов (Activity, Description, Points)
                                </p>
                            </div>

                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleExcelUpload}
                                        className="hidden"
                                    />
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                            <FileSpreadsheet className="w-8 h-8 text-green-600" />
                                        </div>
                                        <p className="text-slate-700 font-semibold">
                                            Нажмите для выбора Excel файла
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Поддерживаются форматы .xlsx и .xls
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Status Notification */}
                {uploadStatus.show && (
                    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
                        <div className={`rounded-2xl shadow-2xl p-6 max-w-md ${
                            uploadStatus.success 
                                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                : 'bg-gradient-to-r from-red-500 to-red-600'
                        }`}>
                            <div className="flex items-center gap-4 text-white">
                                <div className="flex-shrink-0">
                                    {uploadStatus.success ? (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-lg">{uploadStatus.success ? 'Успешно!' : 'Ошибка'}</p>
                                    <p className="text-sm opacity-90">{uploadStatus.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
