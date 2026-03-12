import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Activity as ActivityIcon, Gift, UserCheck, Users, Upload, Search, Edit, Save, Plus, Trash2, UserPlus, X, Bell, Send, Link, Eye, Download } from 'lucide-react';
import { translateDashboardType } from '../utils/translations';
import axiosInstance from '../api/axiosConfig';
import { BonusManagement } from './BonusManagement';
import { ActivityTypeModal, ActivityTypeFormData } from './ActivityTypeModal';
import { NotificationModal } from './NotificationModal';
import EventInvitationManager from './EventInvitationManager';
import EventInvitationStats from './EventInvitationStats';
import ReactMarkdown from 'react-markdown';

interface Event {
    id: number;
    name: string;
    description: string;
    imageUrl?: string;
    startDate: string;
    endDate: string;
    status: string;
    requiresActivityApproval: boolean;
    teamBasedCompetition: boolean;
    trackActivityDuration?: boolean;
    dashboardTypes?: string[];
    dashboardOrder?: string[];
}

interface EventNews {
    id: number;
    content: string;
    createdByName: string;
    createdAt: string;
}

interface Team {
    id: number;
    name: string;
    motto?: string;
}

interface ActivityType {
    id: number;
    name: string;
    description: string;
    defaultEnergy: number;
    timeLimitRequired?: boolean;
    minDurationMinutes?: number | null;
    maxDurationMinutes?: number | null;
}

export const EventDetailTabs: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'settings' | 'activities' | 'bonuses' | 'participants' | 'notifications' | 'invitations'>('settings');
    const [event, setEvent] = useState<Event | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Event>>({});
    const [draggedDashboardIndex, setDraggedDashboardIndex] = useState<number | null>(null);
    const [showActivityTypeModal, setShowActivityTypeModal] = useState(false);
    const [editingActivityType, setEditingActivityType] = useState<ActivityTypeFormData | null>(null);
    const [showStatusWarning, setShowStatusWarning] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
    const [inviteSearchQuery, setInviteSearchQuery] = useState('');
    const [inviteType, setInviteType] = useState('ALL');
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notification, setNotification] = useState({
        title: '',
        message: '',
        recipientType: 'ALL',
        participantIds: [] as number[]
    });
    const [notificationSuccess, setNotificationSuccess] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [notificationTab, setNotificationTab] = useState<'drafts' | 'archive'>('drafts');
    const [drafts, setDrafts] = useState<any[]>([]);
    const [sentNotifications, setSentNotifications] = useState<any[]>([]);
    const [showTeamSettingsModal, setShowTeamSettingsModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
    const [teamParticipants, setTeamParticipants] = useState<any[]>([]);
    const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
    const [availableParticipants, setAvailableParticipants] = useState<any[]>([]);
    const [eventNews, setEventNews] = useState<EventNews[]>([]);
    const [newNewsContent, setNewNewsContent] = useState('');
    const [showDescriptionPreview, setShowDescriptionPreview] = useState(false);
    const [showNewsPreview, setShowNewsPreview] = useState(false);

    useEffect(() => {
        // Get user role from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserRole(user.role);
            } catch (e) {
                console.error('Error parsing user from localStorage:', e);
            }
        }
        
        if (eventId) {
            fetchData();
        }
    }, [eventId]);
    
    const isAdmin = userRole === 'ADMIN';

    useEffect(() => {
        if (eventId && activeTab === 'notifications') {
            fetchAllNotificationData();
        }
    }, [eventId, activeTab]);

    const fetchAllNotificationData = async () => {
        try {
            const [draftsRes, sentRes] = await Promise.all([
                axiosInstance.get(`/notifications/admin/drafts/${eventId}`),
                axiosInstance.get(`/notifications/admin/sent/${eventId}`)
            ]);
            setDrafts(draftsRes.data);
            setSentNotifications(sentRes.data);
        } catch (error) {
            console.error('Error fetching notification data:', error);
        }
    };

    const fetchNotificationData = async () => {
        if (notificationTab === 'drafts') {
            try {
                const response = await axiosInstance.get(`/notifications/admin/drafts/${eventId}`);
                setDrafts(response.data);
            } catch (error) {
                console.error('Error fetching drafts:', error);
            }
        } else if (notificationTab === 'archive') {
            try {
                const response = await axiosInstance.get(`/notifications/admin/sent/${eventId}`);
                setSentNotifications(response.data);
            } catch (error) {
                console.error('Error fetching sent notifications:', error);
            }
        }
    };

    const fetchData = async () => {
        try {
            const [eventRes, teamsRes, activityTypesRes, participantsRes, newsRes] = await Promise.all([
                axiosInstance.get(`/events/${eventId}`),
                axiosInstance.get(`/teams?eventId=${eventId}`),
                axiosInstance.get(`/activity-types?eventId=${eventId}`),
                axiosInstance.get('/admin/participants'),
                axiosInstance.get(`/events/${eventId}/news`)
            ]);

            setEvent(eventRes.data);
            setEditForm(eventRes.data);
            setTeams(teamsRes.data);
            setActivityTypes(activityTypesRes.data);
            setParticipants(participantsRes.data);
            setEventNews(newsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateActivityType = async (data: ActivityTypeFormData) => {
        const activityData = { ...data, eventId: Number(eventId) };
        if (data.id) {
            await axiosInstance.put(`/activity-types/${data.id}`, activityData);
        } else {
            await axiosInstance.post('/activity-types', activityData);
        }
        setEditingActivityType(null);
        fetchData();
    };

    const handleEditActivityType = async (activityType: ActivityType) => {
        try {
            const response = await axiosInstance.get(`/activity-types/${activityType.id}`);
            const fullData = response.data;
            setEditingActivityType({
                id: fullData.id,
                name: fullData.name,
                description: fullData.description || '',
                defaultEnergy: fullData.defaultEnergy,
                eventId: Number(eventId),
                timeLimitRequired: fullData.timeLimitRequired ?? false,
                minDurationMinutes: fullData.minDurationMinutes ?? null,
                maxDurationMinutes: fullData.maxDurationMinutes ?? null
            });
            setShowActivityTypeModal(true);
        } catch (error) {
            console.error('Error loading activity type:', error);
            setEditingActivityType({
                id: activityType.id,
                name: activityType.name,
                description: activityType.description || '',
                defaultEnergy: activityType.defaultEnergy,
                eventId: Number(eventId),
                timeLimitRequired: activityType.timeLimitRequired ?? false,
                minDurationMinutes: activityType.minDurationMinutes ?? null,
                maxDurationMinutes: activityType.maxDurationMinutes ?? null
            });
            setShowActivityTypeModal(true);
        }
    };

    const handleDeleteActivityType = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этот тип активности?')) {
            try {
                await axiosInstance.delete(`/activity-types/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting activity type:', error);
            }
        }
    };

    const handleAddNews = async () => {
        if (!newNewsContent.trim()) {
            alert('Введите текст новости');
            return;
        }

        try {
            await axiosInstance.post(`/events/${eventId}/news`, {
                content: newNewsContent
            });
            setNewNewsContent('');
            await fetchData();
            alert('Новость успешно добавлена!');
        } catch (error) {
            console.error('Error adding news:', error);
            alert('Ошибка при добавлении новости');
        }
    };

    const handleDeleteNews = async (newsId: number) => {
        if (!window.confirm('Удалить эту новость?')) return;

        try {
            await axiosInstance.delete(`/events/news/${newsId}`);
            await fetchData();
            alert('Новость удалена!');
        } catch (error) {
            console.error('Error deleting news:', error);
            alert('Ошибка при удалении новости');
        }
    };

    const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axiosInstance.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const imageUrl = response.data.url || response.data;
            setEditForm({ ...editForm, imageUrl });
            alert('Обложка успешно загружена!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Ошибка при загрузке обложки');
        }
    };

    const handleOpenTeamSettings = async (team: any) => {
        setSelectedTeam(team);
        try {
            const response = await axiosInstance.get(`/teams/${team.id}/participants`);
            setTeamParticipants(response.data);
            setShowTeamSettingsModal(true);
        } catch (error) {
            console.error('Error fetching team participants:', error);
        }
    };

    const handleUpdateTeam = async (teamData: any) => {
        try {
            await axiosInstance.put(`/teams/${selectedTeam.id}`, teamData);
            fetchData();
            alert('Команда успешно обновлена');
        } catch (error) {
            console.error('Error updating team:', error);
            alert('Ошибка при обновлении команды');
        }
    };

    const handleDeleteTeam = async (teamId: number) => {
        if (window.confirm('Вы уверены, что хотите удалить эту команду? Это действие необратимо!')) {
            try {
                await axiosInstance.delete(`/teams/${teamId}`);
                setShowTeamSettingsModal(false);
                fetchData();
                alert('Команда успешно удалена');
            } catch (error) {
                console.error('Error deleting team:', error);
                alert('Ошибка при удалении команды');
            }
        }
    };

    const handleOpenAddParticipant = async () => {
        try {
            const response = await axiosInstance.get('/admin/participants');
            const currentParticipantIds = teamParticipants.map(p => p.id);
            const available = response.data.filter((p: any) => !currentParticipantIds.includes(p.id));
            setAvailableParticipants(available);
            setShowAddParticipantModal(true);
        } catch (error) {
            console.error('Error fetching participants:', error);
        }
    };

    const handleAddParticipantToTeam = async (participantId: number) => {
        try {
            await axiosInstance.post(`/teams/${selectedTeam.id}/add-participant`, { participantId });
            const response = await axiosInstance.get(`/teams/${selectedTeam.id}/participants`);
            setTeamParticipants(response.data);
            setShowAddParticipantModal(false);
            alert('Участник добавлен в команду');
        } catch (error: any) {
            console.error('Error adding participant:', error);
            const errorMessage = error.response?.data?.message || 'Ошибка при добавлении участника';
            alert(errorMessage);
        }
    };

    const handleRemoveParticipant = async (participantId: number) => {
        if (window.confirm('Удалить участника из команды?')) {
            try {
                await axiosInstance.delete(`/teams/${selectedTeam.id}/participants/${participantId}`);
                const response = await axiosInstance.get(`/teams/${selectedTeam.id}/participants`);
                setTeamParticipants(response.data);
                alert('Участник удален из команды');
            } catch (error) {
                console.error('Error removing participant:', error);
                alert('Ошибка при удалении участника');
            }
        }
    };

    if (loading || !event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
                <div className="text-xl text-slate-600">Загрузка...</div>
            </div>
        );
    }

    const handleSaveEvent = async () => {
        try {
            await axiosInstance.put(`/admin/events/${eventId}`, editForm);
            setEvent({ ...event, ...editForm } as Event);
            setIsEditing(false);
        } catch (error: any) {
            console.error('Error saving event:', error);
            const errorMessage = error.response?.data?.message || error.response?.data || 'Ошибка при сохранении мероприятия';
            alert(errorMessage);
        }
    };

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === 'ACTIVE' && event?.status !== 'ACTIVE') {
            setPendingStatus(newStatus);
            setShowStatusWarning(true);
        } else {
            setEditForm({ ...editForm, status: newStatus });
        }
    };

    const confirmStatusChange = () => {
        if (pendingStatus) {
            setEditForm({ ...editForm, status: pendingStatus });
        }
        setShowStatusWarning(false);
        setPendingStatus(null);
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return { label: 'Черновик', icon: '📝', color: 'bg-slate-100 text-slate-700 border-slate-300' };
            case 'ACTIVE':
                return { label: 'Активное', icon: '✅', color: 'bg-green-100 text-green-700 border-green-300' };
            case 'COMPLETED':
                return { label: 'Завершено', icon: '🏁', color: 'bg-blue-100 text-blue-700 border-blue-300' };
            case 'ARCHIVED':
                return { label: 'Архивировано', icon: '📦', color: 'bg-gray-100 text-gray-700 border-gray-300' };
            default:
                return { label: status, icon: '❓', color: 'bg-slate-100 text-slate-700 border-slate-300' };
        }
    };

    const handleDashboardDragStart = (index: number) => {
        setDraggedDashboardIndex(index);
    };

    const handleDashboardDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedDashboardIndex === null || draggedDashboardIndex === index) return;

        const dashboards = [...(editForm.dashboardOrder || [])];
        const draggedItem = dashboards[draggedDashboardIndex];
        dashboards.splice(draggedDashboardIndex, 1);
        dashboards.splice(index, 0, draggedItem);

        setEditForm({ ...editForm, dashboardOrder: dashboards });
        setDraggedDashboardIndex(index);
    };

    const handleDashboardDragEnd = () => {
        setDraggedDashboardIndex(null);
    };
    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleInviteParticipants = async () => {
        if (inviteType === 'SPECIFIC' && selectedParticipants.length === 0) {
            alert('Выберите хотя бы одного участника');
            return;
        }
        
        try {
            let participantIdsToInvite: number[] = [];
            
            if (inviteType === 'ALL') {
                participantIdsToInvite = participants.map(p => p.id);
            } else {
                participantIdsToInvite = selectedParticipants;
            }
            
            await axiosInstance.post('/admin/events/invite', {
                eventId: eventId,
                participantIds: participantIdsToInvite
            });
            
            const count = participantIdsToInvite.length;
            alert(`Приглашения отправлены ${count} участникам!`);
            setShowInviteModal(false);
            setSelectedParticipants([]);
            setInviteSearchQuery('');
            setInviteType('ALL');
            fetchData();
        } catch (error) {
            console.error('Error inviting participants:', error);
            alert('Ошибка при отправке приглашений');
        }
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (notification.recipientType === 'SPECIFIC' && notification.participantIds.length === 0) {
            alert('Выберите хотя бы одного участника');
            return;
        }
        
        try {
            const response = await axiosInstance.post('/notifications/admin/send', {
                eventId: Number(eventId),
                title: notification.title,
                message: notification.message,
                recipientType: notification.recipientType,
                participantIds: notification.recipientType === 'SPECIFIC' ? notification.participantIds : []
            });
            
            setNotificationCount(response.data.count);
            setNotificationSuccess(true);
            
            setTimeout(() => {
                setShowNotificationModal(false);
                setNotificationSuccess(false);
                setNotification({
                    title: '',
                    message: '',
                    recipientType: 'ALL',
                    participantIds: []
                });
            }, 2000);
        } catch (error) {
            console.error('Error sending notifications:', error);
            alert('Ошибка при отправке уведомлений');
        }
    };

    const toggleParticipantSelection = (participantId: number) => {
        setNotification(prev => ({
            ...prev,
            participantIds: prev.participantIds.includes(participantId)
                ? prev.participantIds.filter(id => id !== participantId)
                : [...prev.participantIds, participantId]
        }));
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axiosInstance.get('/activity-types/template', {
                responseType: 'blob',
            });
            
            // Создаем ссылку для скачивания
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'template_activity_types.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Error downloading template:', error);
            alert('Ошибка при скачивании шаблона');
        }
    };

    const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Проверка формата файла
        if (!file.name.toLowerCase().endsWith('.xlsx')) {
            alert('Поддерживается только формат .xlsx');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('eventId', eventId!);

        try {
            const response = await axiosInstance.post('/activity-types/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            const data = response.data;
            if (data.success) {
                const message = data.count > 0 
                    ? `Успешно импортировано ${data.count} типов активностей`
                    : 'Нет новых типов активностей для импорта';
                alert(message);
                fetchData();
            } else {
                alert(data.message || 'Ошибка при загрузке файла');
            }
        } catch (error: any) {
            console.error('Error uploading Excel:', error);
            const errorMessage = error.response?.data?.message || error.response?.data || 'Ошибка при загрузке файла';
            alert(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSaveDraft = async () => {
        try {
            await axiosInstance.post('/notifications/admin/drafts', {
                eventId: Number(eventId),
                title: notification.title,
                message: notification.message,
                recipientType: notification.recipientType,
                participantIds: notification.recipientType === 'SPECIFIC' ? notification.participantIds : []
            });
            alert('Черновик успешно сохранен!');
            setShowNotificationModal(false);
            setNotification({
                title: '',
                message: '',
                recipientType: 'ALL',
                participantIds: []
            });
            fetchAllNotificationData();
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Ошибка при сохранении черновика');
        }
    };

    const handleSendFromDraft = async (draftId: number) => {
        if (!window.confirm('Отправить это уведомление?')) return;
        
        try {
            const response = await axiosInstance.post(`/notifications/admin/templates/${draftId}/send`);
            alert(`Уведомление отправлено ${response.data.sentCount} участникам!`);
            fetchAllNotificationData();
        } catch (error) {
            console.error('Error sending from draft:', error);
            alert('Ошибка при отправке уведомления');
        }
    };

    const handleDeleteDraft = async (draftId: number) => {
        if (!window.confirm('Удалить этот черновик?')) return;
        
        try {
            await axiosInstance.delete(`/notifications/admin/templates/${draftId}`);
            fetchAllNotificationData();
        } catch (error) {
            console.error('Error deleting draft:', error);
            alert('Ошибка при удалении черновика');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64">Загрузка...</div>;
    }

    if (!event) {
        return <div className="flex items-center justify-center h-64">Мероприятие не найдено</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">{event.name}</h1>
                            <p className="text-slate-600">{event.description}</p>
                        </div>
                        {!isAdmin && (
                            <button
                                onClick={() => {
                                    const userId = localStorage.getItem('userId');
                                    navigate(`/event/${eventId}/my-activities/${userId}`);
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                            >
                                <ActivityIcon className="w-5 h-5" />
                                Мои активности
                            </button>
                        )}
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex gap-2 border-b border-slate-200 mt-6">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                activeTab === 'settings'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-slate-600 hover:text-blue-600'
                            }`}
                        >
                            <Settings className="w-5 h-5" />
                            Настройки
                        </button>
                        <button
                            onClick={() => setActiveTab('activities')}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                activeTab === 'activities'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-slate-600 hover:text-blue-600'
                            }`}
                        >
                            <ActivityIcon className="w-5 h-5" />
                            Типы активностей
                        </button>
                        {isAdmin && event.requiresActivityApproval && (
                            <button
                                onClick={() => setActiveTab('bonuses')}
                                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                    activeTab === 'bonuses'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-slate-600 hover:text-blue-600'
                                }`}
                            >
                                <Gift className="w-5 h-5" />
                                Бонусы и штрафы
                            </button>
                        )}
                        {isAdmin && (
                            <button
                                onClick={() => setActiveTab('participants')}
                                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                    activeTab === 'participants'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-slate-600 hover:text-blue-600'
                                }`}
                            >
                                <UserCheck className="w-5 h-5" />
                                {event.teamBasedCompetition ? 'Команды' : 'Участники'}
                            </button>
                        )}
                        {isAdmin && (
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                    activeTab === 'notifications'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-slate-600 hover:text-blue-600'
                                }`}
                            >
                                <Bell className="w-5 h-5" />
                                Уведомления
                            </button>
                        )}
                        {isAdmin && (
                            <button
                                onClick={() => setActiveTab('invitations')}
                                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                                    activeTab === 'invitations'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-slate-600 hover:text-blue-600'
                                }`}
                            >
                                <Link className="w-5 h-5" />
                                Приглашения
                            </button>
                        )}
                    </div>
                </div>

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Настройки мероприятия</h2>
                            <div className="flex items-center gap-3">
                                {!isAdmin && (
                                    <button
                                        onClick={() => navigate(`/add-activity?eventId=${eventId}`)}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Добавить активность
                                    </button>
                                )}
                                {isAdmin && (
                                    <button
                                        onClick={() => {
                                            if (isEditing) {
                                                handleSaveEvent();
                                            } else {
                                                setIsEditing(true);
                                            }
                                        }}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
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
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Название</label>
                                    <input
                                        type="text"
                                        value={editForm.name || ''}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Обложка мероприятия</label>
                                    <div className="space-y-3">
                                        {editForm.imageUrl && (
                                            <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-slate-200">
                                                <img 
                                                    src={editForm.imageUrl} 
                                                    alt="Обложка мероприятия" 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Обложка+мероприятия';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleEventImageUpload}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <p className="text-xs text-slate-500">Рекомендуемый размер: 1200x600px</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-semibold text-slate-700">Описание (Markdown)</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowDescriptionPreview(!showDescriptionPreview)}
                                            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            {showDescriptionPreview ? 'Редактор' : 'Предпросмотр'}
                                        </button>
                                    </div>
                                    {showDescriptionPreview ? (
                                        <div className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 min-h-[120px] prose prose-sm max-w-none">
                                            <ReactMarkdown>{editForm.description || 'Описание отсутствует'}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <textarea
                                            value={editForm.description || ''}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            rows={5}
                                            placeholder="Введите описание мероприятия с поддержкой Markdown..."
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                                        />
                                    )}
                                </div>
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Статус мероприятия</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].map((status) => {
                                            const statusInfo = getStatusInfo(status);
                                            const isSelected = (editForm.status || 'DRAFT') === status;
                                            return (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => handleStatusChange(status)}
                                                    className={`p-4 border-2 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                                                        isSelected
                                                            ? statusInfo.color + ' shadow-lg scale-105'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <span className="text-2xl">{statusInfo.icon}</span>
                                                        <span>{statusInfo.label}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                        <span>⚠️</span>
                                        <span>Может быть только одно активное мероприятие</span>
                                    </p>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-slate-200 rounded-lg hover:border-blue-300 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={editForm.teamBasedCompetition !== false}
                                            onChange={(e) => setEditForm({ ...editForm, teamBasedCompetition: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Командное мероприятие</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-slate-200 rounded-lg hover:border-orange-300 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={editForm.requiresActivityApproval || false}
                                            onChange={(e) => setEditForm({ ...editForm, requiresActivityApproval: e.target.checked })}
                                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Модерация активностей</span>
                                        <span className="text-xs text-slate-500">(активности требуют одобрения модератором)</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-slate-200 rounded-lg hover:border-green-300 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={editForm.trackActivityDuration || false}
                                            onChange={(e) => setEditForm({ ...editForm, trackActivityDuration: e.target.checked })}
                                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Время активности</span>
                                        <span className="text-xs text-slate-500">(указывать продолжительность в минутах)</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Типы дашбордов</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['RANKING', 'TRACKER', 'FEED', 'SIMPLE_LIST'].map(type => (
                                            <label key={type} className="flex items-center gap-2 p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.dashboardTypes?.includes(type)}
                                                    onChange={() => {
                                                        const current = editForm.dashboardTypes || [];
                                                        const updated = current.includes(type)
                                                            ? current.filter(t => t !== type)
                                                            : [...current, type];
                                                        setEditForm({ ...editForm, dashboardTypes: updated, dashboardOrder: updated });
                                                    }}
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {translateDashboardType(type)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {editForm.dashboardOrder && editForm.dashboardOrder.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Порядок отображения дашбордов
                                        </label>
                                        <p className="text-xs text-slate-500 mb-3">Перетащите для изменения порядка</p>
                                        <div className="space-y-2">
                                            {editForm.dashboardOrder.map((type, index) => (
                                                <div
                                                    key={type}
                                                    draggable
                                                    onDragStart={() => handleDashboardDragStart(index)}
                                                    onDragOver={(e) => handleDashboardDragOver(e, index)}
                                                    onDragEnd={handleDashboardDragEnd}
                                                    className={`p-3 border-2 rounded-lg cursor-move transition-all ${
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
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Секция управления новостями */}
                                <div className="border-t-2 border-slate-200 pt-6 mt-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Новости мероприятия</h3>
                                    
                                    {/* Добавление новой новости */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-semibold text-slate-700">Новая новость (Markdown)</label>
                                            <button
                                                type="button"
                                                onClick={() => setShowNewsPreview(!showNewsPreview)}
                                                className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                {showNewsPreview ? 'Редактор' : 'Предпросмотр'}
                                            </button>
                                        </div>
                                        {showNewsPreview ? (
                                            <div className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 min-h-[100px] prose prose-sm max-w-none mb-3">
                                                <ReactMarkdown>{newNewsContent || 'Новость пуста'}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <textarea
                                                value={newNewsContent}
                                                onChange={(e) => setNewNewsContent(e.target.value)}
                                                rows={4}
                                                placeholder="Введите текст новости с поддержкой Markdown..."
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none font-mono text-sm mb-3"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleAddNews}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Добавить новость
                                        </button>
                                    </div>

                                    {/* Список новостей */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-slate-700">Опубликованные новости ({eventNews.length})</h4>
                                        {eventNews.length === 0 ? (
                                            <p className="text-sm text-slate-500 italic">Новостей пока нет</p>
                                        ) : (
                                            eventNews.map((news) => (
                                                <div key={news.id} className="p-4 border-2 border-slate-200 rounded-xl bg-white hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <div className="text-xs text-slate-500 mb-1">
                                                                {news.createdByName} • {new Date(news.createdAt).toLocaleString('ru-RU')}
                                                            </div>
                                                            <div className="prose prose-sm max-w-none">
                                                                <ReactMarkdown>{news.content}</ReactMarkdown>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteNews(news.id)}
                                                            className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-sm font-semibold text-slate-700 mb-1">Статус</div>
                                    <div className="text-lg text-slate-900">
                                        {event.status === 'DRAFT' && '📝 Черновик'}
                                        {event.status === 'ACTIVE' && '✅ Активное'}
                                        {event.status === 'COMPLETED' && '🏁 Завершено'}
                                        {event.status === 'ARCHIVED' && '📦 Архивировано'}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-sm font-semibold text-slate-700 mb-1">Дата начала</div>
                                    <div className="text-lg text-slate-900">
                                        {new Date(event.startDate).toLocaleString('ru-RU')}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-sm font-semibold text-slate-700 mb-1">Дата окончания</div>
                                    <div className="text-lg text-slate-900">
                                        {new Date(event.endDate).toLocaleString('ru-RU')}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-sm font-semibold text-slate-700 mb-1">Тип мероприятия</div>
                                    <div className="text-lg text-slate-900">
                                        {event.teamBasedCompetition ? '🏆 Командное' : '👤 Индивидуальное'}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-sm font-semibold text-slate-700 mb-1">Модерация активностей</div>
                                    <div className="text-lg text-slate-900">
                                        {event.requiresActivityApproval ? '✅ Включена' : '❌ Выключена'}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="text-sm font-semibold text-slate-700 mb-1">Время активности</div>
                                    <div className="text-lg text-slate-900">
                                        {event.trackActivityDuration ? '✅ Включено' : '❌ Выключено'}
                                    </div>
                                </div>
                                {event.dashboardTypes && event.dashboardTypes.length > 0 && (
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <div className="text-sm font-semibold text-slate-700 mb-1">Дашборды</div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {event.dashboardTypes.map(type => (
                                                <span key={type} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                                    {translateDashboardType(type)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Activity Types Tab */}
                {activeTab === 'activities' && (
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">
                                Типы активностей ({activityTypes.length})
                            </h2>
                            <div className="flex gap-3">
                                {!isAdmin && (
                                    <button
                                        onClick={() => navigate(`/add-activity?eventId=${eventId}`)}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Добавить активность
                                    </button>
                                )}
                                {isAdmin && (
                                    <>
                                        <button 
                                            onClick={() => {
                                                setEditingActivityType(null);
                                                setShowActivityTypeModal(true);
                                            }}
                                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Добавить
                                        </button>
                                        <button 
                                            onClick={handleDownloadTemplate}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            Скачать шаблон
                                        </button>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
                                        >
                                            <Upload className="w-5 h-5" />
                                            Загрузить из Excel
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleExcelUpload}
                                            className="hidden"
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="space-y-3">
                            {activityTypes.map(type => (
                                <div key={type.id} className="p-4 border-2 border-slate-200 rounded-xl hover:border-purple-300 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900">{type.name}</div>
                                            {type.description && (
                                                <div className="text-sm text-slate-600 mt-1">{type.description}</div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-xl font-bold text-green-600">
                                                {type.defaultEnergy} баллов
                                            </div>
                                            {isAdmin && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditActivityType(type)}
                                                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all font-semibold"
                                                        title="Редактировать"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteActivityType(type.id)}
                                                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold"
                                                        title="Удалить"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bonuses Tab */}
                {isAdmin && activeTab === 'bonuses' && event.requiresActivityApproval && (
                    <BonusManagement eventId={Number(eventId)} />
                )}

                {/* Participants/Teams Tab */}
                {isAdmin && activeTab === 'participants' && (
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        {event.teamBasedCompetition ? (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Команды ({teams.length})
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setShowInviteModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                                        >
                                            <UserPlus className="w-5 h-5" />
                                            Пригласить
                                        </button>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Поиск команды..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="px-4 py-2 pl-10 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none w-64"
                                            />
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {filteredTeams.map(team => (
                                        <div key={team.id} className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {team.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-slate-900">{team.name}</div>
                                                    {team.motto && (
                                                        <div className="text-sm text-slate-600 mt-1">{team.motto}</div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleOpenTeamSettings(team)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Настройки команды"
                                                >
                                                    <Settings className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-end mb-6">
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        Пригласить
                                    </button>
                                </div>
                                <div className="text-center py-12">
                                    <div className="mb-6">
                                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                                            <UserCheck className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                            Индивидуальное мероприятие
                                        </h3>
                                        <p className="text-slate-600 mb-6">
                                            Это мероприятие не требует создания команд. Просто присоединитесь и начните добавлять активности!
                                        </p>
                                    </div>
                                    <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                                        Присоединиться к мероприятию
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Notifications Tab */}
                {isAdmin && activeTab === 'notifications' && (
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Bell className="w-6 h-6 text-purple-600" />
                                <h3 className="text-2xl font-bold text-slate-900">Уведомления участникам</h3>
                            </div>
                            <button
                                onClick={() => setShowNotificationModal(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                            >
                                <Send className="w-5 h-5" />
                                Отправить уведомление
                            </button>
                        </div>

                        {/* Sub-tabs */}
                        <div className="flex gap-2 border-b border-slate-200 mb-6">
                            <button
                                onClick={() => setNotificationTab('drafts')}
                                className={`px-6 py-3 font-semibold transition-all ${
                                    notificationTab === 'drafts'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-slate-600 hover:text-blue-600'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    Черновики ({drafts.length})
                                </div>
                            </button>
                            <button
                                onClick={() => setNotificationTab('archive')}
                                className={`px-6 py-3 font-semibold transition-all ${
                                    notificationTab === 'archive'
                                        ? 'text-purple-600 border-b-2 border-purple-600'
                                        : 'text-slate-600 hover:text-purple-600'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4" />
                                    Архив ({sentNotifications.length})
                                </div>
                            </button>
                        </div>

                        {/* Drafts Tab Content */}
                        {notificationTab === 'drafts' && (
                            <div className="space-y-3">
                                {drafts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                            <Edit className="w-10 h-10 text-slate-400" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">Нет черновиков</h4>
                                        <p className="text-slate-600">Сохраните черновик при создании уведомления</p>
                                    </div>
                                ) : (
                                    drafts.map((draft) => (
                                        <div key={draft.id} className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-all">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-slate-900">{draft.title}</h5>
                                                    <p className="text-sm text-slate-600 mt-1">{draft.message}</p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                        <span>Кому: {draft.recipientType === 'ALL' ? 'Всем' : draft.recipientType === 'CAPTAINS' ? 'Капитанам' : 'Выбранным'}</span>
                                                        <span>Создано: {new Date(draft.createdAt).toLocaleString('ru-RU')}</span>
                                                        <span>Автор: {draft.createdByName}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        onClick={() => handleSendFromDraft(draft.id)}
                                                        className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all font-semibold flex items-center gap-2"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                        Отправить
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDraft(draft.id)}
                                                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Archive Tab Content */}
                        {notificationTab === 'archive' && (
                            <div className="space-y-3">
                                {sentNotifications.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                            <Bell className="w-10 h-10 text-slate-400" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">Нет отправленных уведомлений</h4>
                                        <p className="text-slate-600">История отправленных уведомлений появится здесь</p>
                                    </div>
                                ) : (
                                    sentNotifications.map((sent) => (
                                        <div key={sent.id} className="p-4 border-2 border-slate-200 rounded-xl bg-slate-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h5 className="font-bold text-slate-900">{sent.title}</h5>
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">
                                                            Отправлено
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 mb-2">{sent.message}</p>
                                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                                        <span>Кому: {sent.recipientType === 'ALL' ? 'Всем' : sent.recipientType === 'CAPTAINS' ? 'Капитанам' : 'Выбранным'}</span>
                                                        <span>Получателей: {sent.sentCount}</span>
                                                        <span>Отправлено: {new Date(sent.sentAt).toLocaleString('ru-RU')}</span>
                                                        <span>Автор: {sent.createdByName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Activity Type Modal */}
                <ActivityTypeModal
                    isOpen={showActivityTypeModal}
                    onClose={() => {
                        setShowActivityTypeModal(false);
                        setEditingActivityType(null);
                    }}
                    onSubmit={handleCreateActivityType}
                    editingActivityType={editingActivityType}
                    eventId={Number(eventId)}
                />

                {/* Status Change Warning Modal */}
                {showStatusWarning && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-200">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 shadow-lg">
                                    <span className="text-4xl">⚠️</span>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Внимание!</h2>
                                <p className="text-slate-600">
                                    Вы собираетесь сделать это мероприятие активным
                                </p>
                            </div>

                            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6">
                                <p className="text-sm text-amber-900 font-medium">
                                    <span className="font-bold">Важно:</span> В системе может быть только одно активное мероприятие. 
                                    Если сейчас есть другое активное мероприятие, оно автоматически должно быть переведено в статус "Черновик" или "Завершено".
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowStatusWarning(false);
                                        setPendingStatus(null);
                                    }}
                                    className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={confirmStatusChange}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                    Продолжить
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Invite Participants Modal */}
                {showInviteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                            <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between rounded-t-3xl flex-shrink-0">
                                <h2 className="text-2xl font-bold text-slate-900">Пригласить участников</h2>
                                <button
                                    onClick={() => {
                                        setShowInviteModal(false);
                                        setSelectedParticipants([]);
                                        setInviteSearchQuery('');
                                        setInviteType('ALL');
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="overflow-y-auto px-2 flex-1" style={{
                                scrollbarGutter: 'stable'
                            }}>
                            <div className="p-8 space-y-6">

                                {/* Recipient Type Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">Кого пригласить</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 transition-all">
                                            <input
                                                type="radio"
                                                name="inviteType"
                                                value="ALL"
                                                checked={inviteType === 'ALL'}
                                                onChange={(e) => {
                                                    setInviteType(e.target.value);
                                                    setSelectedParticipants([]);
                                                }}
                                                className="w-5 h-5 text-blue-600"
                                            />
                                            <div>
                                                <p className="font-semibold text-slate-900">Всех участников мероприятия</p>
                                                <p className="text-sm text-slate-600">Приглашение получат все участники</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 transition-all">
                                            <input
                                                type="radio"
                                                name="inviteType"
                                                value="SPECIFIC"
                                                checked={inviteType === 'SPECIFIC'}
                                                onChange={(e) => setInviteType(e.target.value)}
                                                className="w-5 h-5 text-blue-600"
                                            />
                                            <div>
                                                <p className="font-semibold text-slate-900">Конкретным участникам</p>
                                                <p className="text-sm text-slate-600">Выберите участников из списка ниже</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {inviteType === 'SPECIFIC' && (
                                    <>
                                        {/* Search field */}
                                        <div>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Поиск по имени или username..."
                                                    value={inviteSearchQuery}
                                                    onChange={(e) => setInviteSearchQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm font-semibold text-slate-700">
                                            {inviteSearchQuery 
                                                ? `Найдено: ${participants.filter(p => 
                                                    p.name.toLowerCase().includes(inviteSearchQuery.toLowerCase()) || 
                                                    p.username.toLowerCase().includes(inviteSearchQuery.toLowerCase())
                                                  ).length}`
                                                : `Всего участников: ${participants.length}`
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const filteredParticipants = inviteSearchQuery 
                                                    ? participants.filter(p => 
                                                        p.name.toLowerCase().includes(inviteSearchQuery.toLowerCase()) || 
                                                        p.username.toLowerCase().includes(inviteSearchQuery.toLowerCase())
                                                      )
                                                    : participants;
                                                const allIds = filteredParticipants.map(p => p.id);
                                                setSelectedParticipants(allIds);
                                            }}
                                            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all font-semibold"
                                        >
                                            {inviteSearchQuery ? 'Выбрать найденных' : 'Выбрать всех'}
                                        </button>
                                        {selectedParticipants.length > 0 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedParticipants([])}
                                                    className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all font-semibold"
                                                >
                                                    Очистить
                                                </button>
                                                <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-sm shadow-lg">
                                                    Выбрано: {selectedParticipants.length}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                        {/* Participants list */}
                                        <div className="space-y-2 max-h-96 overflow-y-auto mb-6 pr-2">
                                            {participants.filter(p => 
                                                !inviteSearchQuery || 
                                                p.name.toLowerCase().includes(inviteSearchQuery.toLowerCase()) || 
                                                p.username.toLowerCase().includes(inviteSearchQuery.toLowerCase())
                                            ).length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Users className="w-10 h-10 text-slate-400" />
                                                    </div>
                                                    <p className="text-slate-500 font-medium">Нет доступных участников</p>
                                                </div>
                                            ) : (
                                                participants
                                                    .filter(p => 
                                                        !inviteSearchQuery || 
                                                        p.name.toLowerCase().includes(inviteSearchQuery.toLowerCase()) || 
                                                        p.username.toLowerCase().includes(inviteSearchQuery.toLowerCase())
                                                    )
                                                    .map((participant) => (
                                                    <label
                                                        key={participant.id}
                                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer border-2 ${
                                                            selectedParticipants.includes(participant.id)
                                                                ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-md'
                                                                : 'bg-slate-50 border-transparent hover:border-blue-200 hover:shadow-sm'
                                                        }`}
                                                    >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedParticipants.includes(participant.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedParticipants([...selectedParticipants, participant.id]);
                                                        } else {
                                                            setSelectedParticipants(selectedParticipants.filter(id => id !== participant.id));
                                                        }
                                                    }}
                                                    className="w-5 h-5 text-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                                />
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                    {participant.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 truncate">{participant.name}</p>
                                                    <p className="text-sm text-slate-600">@{participant.username}</p>
                                                </div>
                                                {selectedParticipants.includes(participant.id) && (
                                                    <div className="flex-shrink-0">
                                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </label>
                                            ))
                                        )}
                                    </div>
                                    </>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowInviteModal(false);
                                            setSelectedParticipants([]);
                                            setInviteSearchQuery('');
                                            setInviteType('ALL');
                                        }}
                                        className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        onClick={handleInviteParticipants}
                                        disabled={inviteType === 'SPECIFIC' && selectedParticipants.length === 0}
                                        className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                            inviteType === 'SPECIFIC' && selectedParticipants.length === 0
                                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                                        }`}
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        {inviteType === 'SPECIFIC' 
                                            ? `Отправить приглашения (${selectedParticipants.length})`
                                            : 'Отправить приглашения'
                                        }
                                    </button>
                                </div>
                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notification Modal */}
                <NotificationModal
                    isOpen={showNotificationModal}
                    onClose={() => {
                        setShowNotificationModal(false);
                        setNotificationSuccess(false);
                    }}
                    onSubmit={handleSendNotification}
                    onSaveDraft={handleSaveDraft}
                    notification={notification}
                    setNotification={setNotification}
                    participants={participants}
                    toggleParticipantSelection={toggleParticipantSelection}
                    notificationSuccess={notificationSuccess}
                    notificationCount={notificationCount}
                />

                {/* Team Settings Modal */}
                {showTeamSettingsModal && selectedTeam && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                            <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between rounded-t-3xl flex-shrink-0">
                                <h2 className="text-2xl font-bold text-slate-900">Настройки команды</h2>
                                <button
                                    onClick={() => {
                                        setShowTeamSettingsModal(false);
                                        setSelectedTeam(null);
                                        setTeamParticipants([]);
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="overflow-y-auto px-8 py-6 flex-1">
                                {/* Team Info */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                                            {selectedTeam.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{selectedTeam.name}</h3>
                                            {selectedTeam.motto && (
                                                <p className="text-sm text-slate-600 italic">"{selectedTeam.motto}"</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Team Form */}
                                <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                                    <h4 className="font-semibold text-slate-900 mb-3">Редактировать команду</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Название</label>
                                            <input
                                                type="text"
                                                defaultValue={selectedTeam.name}
                                                onChange={(e) => setSelectedTeam({ ...selectedTeam, name: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Девиз</label>
                                            <input
                                                type="text"
                                                defaultValue={selectedTeam.motto || ''}
                                                onChange={(e) => setSelectedTeam({ ...selectedTeam, motto: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleUpdateTeam({ name: selectedTeam.name, motto: selectedTeam.motto })}
                                            className="w-full px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            Сохранить изменения
                                        </button>
                                    </div>
                                </div>

                                {/* Participants Section */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-slate-900">Участники ({teamParticipants.length})</h4>
                                        <button
                                            onClick={handleOpenAddParticipant}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Добавить
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {teamParticipants.map((participant) => (
                                            <div key={participant.id} className="flex items-center justify-between p-3 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-all">
                                                <div>
                                                    <p className="font-semibold text-slate-900">{participant.name}</p>
                                                    <p className="text-xs text-slate-600">{participant.role}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveParticipant(participant.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Удалить участника"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delete Team Section */}
                                <div className="pt-6 border-t border-slate-200">
                                    <button
                                        onClick={() => handleDeleteTeam(selectedTeam.id)}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Удалить команду
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Participant Modal */}
                {showAddParticipantModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                            <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between rounded-t-3xl flex-shrink-0">
                                <h2 className="text-2xl font-bold text-slate-900">Добавить участника</h2>
                                <button
                                    onClick={() => setShowAddParticipantModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="overflow-y-auto px-8 py-6 flex-1">
                                <div className="space-y-3">
                                    {availableParticipants.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500">Нет доступных участников</p>
                                        </div>
                                    ) : (
                                        availableParticipants.map((participant) => (
                                            <div
                                                key={participant.id}
                                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition-all cursor-pointer"
                                                onClick={() => handleAddParticipantToTeam(participant.id)}
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">{participant.name}</p>
                                                    <p className="text-sm text-slate-600">@{participant.username}</p>
                                                </div>
                                                <Plus className="w-5 h-5 text-blue-600" />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Invitations Tab */}
                {isAdmin && activeTab === 'invitations' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <EventInvitationManager eventId={Number(eventId)} eventName={event.name} />
                        </div>
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <EventInvitationStats eventId={Number(eventId)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
