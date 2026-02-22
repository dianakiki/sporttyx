import React, { useState } from 'react';
import { User, Users, Calendar, Trophy, Clock, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';

interface ActivityModeration {
    id: number;
    type: string;
    energy: number;
    participantName: string;
    participantId: number;
    teamName: string;
    teamId: number;
    eventName: string;
    eventId: number;
    photoUrls: string[];
    status: string;
    createdAt: string;
}

interface ModerationActivityCardProps {
    activity: ActivityModeration;
    onApprove: (id: number) => void;
    onReject: (id: number, reason: string) => void;
}

export const ModerationActivityCard: React.FC<ModerationActivityCardProps> = ({
    activity,
    onApprove,
    onReject
}) => {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const handleRejectSubmit = () => {
        if (rejectionReason.trim()) {
            onReject(activity.id, rejectionReason);
            setShowRejectModal(false);
            setRejectionReason('');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="grid md:grid-cols-2 gap-6 p-6">
                    <div className="space-y-4">
                        {activity.photoUrls && activity.photoUrls.length > 0 ? (
                            <div className="relative">
                                <img
                                    src={activity.photoUrls[currentPhotoIndex]}
                                    alt={activity.type}
                                    className="w-full h-64 object-cover rounded-xl"
                                />
                                {activity.photoUrls.length > 1 && (
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                        {activity.photoUrls.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentPhotoIndex(index)}
                                                className={`w-2 h-2 rounded-full transition-all ${
                                                    index === currentPhotoIndex
                                                        ? 'bg-white w-8'
                                                        : 'bg-white/50'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center">
                                <ImageIcon className="w-16 h-16 text-slate-300" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                {activity.type}
                            </h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Участник</p>
                                        <p className="font-semibold text-slate-900">{activity.participantName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Команда</p>
                                        <p className="font-semibold text-slate-900">{activity.teamName}</p>
                                    </div>
                                </div>
                                {activity.eventName && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500">Мероприятие</p>
                                            <p className="font-semibold text-slate-900">{activity.eventName}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Trophy className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Баллы</p>
                                        <p className="text-2xl font-bold text-blue-600">{activity.energy}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Создано</p>
                                        <p className="font-semibold text-slate-900">{formatDate(activity.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className="flex-1 py-3 px-6 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-5 h-5" />
                                Отклонить
                            </button>
                            <button
                                onClick={() => onApprove(activity.id)}
                                className="flex-1 py-3 px-6 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Одобрить
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">
                            Отклонить активность
                        </h3>
                        <p className="text-slate-600 mb-4">
                            Укажите причину отклонения активности:
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-xl mb-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Например: Фото не соответствует типу активности"
                            maxLength={500}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                }}
                                className="flex-1 py-3 px-6 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={!rejectionReason.trim()}
                                className="flex-1 py-3 px-6 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Отклонить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
