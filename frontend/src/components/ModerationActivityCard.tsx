import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, Calendar, Trophy, Clock, CheckCircle, XCircle, Image as ImageIcon, Plus, Minus, X } from 'lucide-react';
import { PhotoCarousel, PhotoModal } from './PhotoCarousel';

interface ParticipantSimple {
    id: number;
    name: string;
    profileImageUrl?: string;
}

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
    participants?: ParticipantSimple[];
    totalTeamParticipants?: number;
}

interface BonusType {
    id: number;
    name: string;
    description: string;
    pointsAdjustment: number;
    type: string;
}

interface ModerationActivityCardProps {
    activity: ActivityModeration;
    bonusTypes: BonusType[];
    onApprove: (id: number, bonusTypeId?: number, comment?: string, penaltyTypeId?: number) => void;
    onReject: (id: number, reason: string, penaltyTypeId?: number) => void;
}

export const ModerationActivityCard: React.FC<ModerationActivityCardProps> = ({
    activity,
    bonusTypes,
    onApprove,
    onReject
}) => {
    const navigate = useNavigate();
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showBonusModal, setShowBonusModal] = useState(false);
    const [showPenaltyModal, setShowPenaltyModal] = useState(false);
    const [selectedBonusTypeId, setSelectedBonusTypeId] = useState<number | undefined>();
    const [selectedPenaltyTypeId, setSelectedPenaltyTypeId] = useState<number | undefined>();
    const [bonusComment, setBonusComment] = useState('');
    const [penaltyComment, setPenaltyComment] = useState('');
    const [approvalComment, setApprovalComment] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    const bonuses = bonusTypes.filter(bt => bt.type === 'BONUS');
    const penalties = bonusTypes.filter(bt => bt.type === 'PENALTY');

    const calculateTotalPoints = () => {
        let total = activity.energy;
        if (selectedBonusTypeId) {
            const bonus = bonuses.find(b => b.id === selectedBonusTypeId);
            if (bonus) total += bonus.pointsAdjustment;
        }
        if (selectedPenaltyTypeId) {
            const penalty = penalties.find(p => p.id === selectedPenaltyTypeId);
            if (penalty) total += penalty.pointsAdjustment;
        }
        return total;
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
                            <div 
                                className="cursor-pointer"
                                onClick={() => setShowPhotoModal(true)}
                            >
                                <PhotoCarousel photos={activity.photoUrls} />
                            </div>
                        ) : (
                            <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center">
                                <ImageIcon className="w-16 h-16 text-slate-300" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">{activity.type}</h3>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-slate-400" />
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500 mb-1">Участники</p>
                                        {activity.participants && activity.participants.length > 0 ? (
                                            activity.participants.length === activity.totalTeamParticipants ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900">Все участники команды</span>
                                                    <span className="text-xs text-slate-500">({activity.totalTeamParticipants})</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {activity.participants.map((participant, index) => (
                                                        <button
                                                            key={participant.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/participant/${participant.id}`);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium"
                                                        >
                                                            {participant.profileImageUrl && (
                                                                <img 
                                                                    src={participant.profileImageUrl} 
                                                                    alt={participant.name}
                                                                    className="w-5 h-5 rounded-full object-cover"
                                                                />
                                                            )}
                                                            {participant.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/participant/${activity.participantId}`);
                                                }}
                                                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                {activity.participantName}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {activity.teamName && (
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-500">Команда</p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/team/${activity.teamId}`);
                                                }}
                                                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                {activity.teamName}
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setShowPenaltyModal(true)}
                                                className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 font-bold flex items-center justify-center transition-all"
                                                title="Добавить штраф"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <div className="flex flex-col items-center min-w-[80px]">
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {calculateTotalPoints()}
                                                </p>
                                                {(selectedBonusTypeId || selectedPenaltyTypeId) && (
                                                    <p className="text-xs text-slate-500 text-center">
                                                        (базовые: {activity.energy}
                                                        {selectedBonusTypeId && (
                                                            <span className="text-green-600"> +{bonuses.find(b => b.id === selectedBonusTypeId)?.pointsAdjustment}</span>
                                                        )}
                                                        {selectedPenaltyTypeId && (
                                                            <span className="text-red-600"> {penalties.find(p => p.id === selectedPenaltyTypeId)?.pointsAdjustment}</span>
                                                        )}
                                                        )
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setShowBonusModal(true)}
                                                className="w-8 h-8 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 font-bold flex items-center justify-center transition-all"
                                                title="Добавить бонус"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
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
                                onClick={() => {
                                    onApprove(activity.id, selectedBonusTypeId, approvalComment, selectedPenaltyTypeId);
                                }}
                                className="flex-1 py-3 px-6 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Одобрить
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showPhotoModal && (
                <PhotoModal
                    photos={activity.photoUrls}
                    initialIndex={0}
                    onClose={() => setShowPhotoModal(false)}
                />
            )}

            {showBonusModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-slate-900">Добавить бонус</h3>
                            <button onClick={() => setShowBonusModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {bonuses.length > 0 ? (
                            <>
                                <p className="text-slate-600 mb-3">Выберите бонус:</p>
                                <div className="space-y-2 mb-4">
                                    {bonuses.map(bonus => (
                                        <button
                                            key={bonus.id}
                                            onClick={() => setSelectedBonusTypeId(bonus.id)}
                                            className={`w-full p-3 border-2 rounded-xl text-left transition-all ${
                                                selectedBonusTypeId === bonus.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                                    <Plus className="w-4 h-4 text-green-600" />
                                                    {bonus.name}
                                                </div>
                                                <span className="text-green-600 font-bold">+{bonus.pointsAdjustment}</span>
                                            </div>
                                            <div className="text-sm text-slate-600">{bonus.description}</div>
                                        </button>
                                    ))}
                                </div>
                                
                                <p className="text-slate-600 mb-2">Комментарий (необязательно):</p>
                                <textarea
                                    value={bonusComment}
                                    onChange={(e) => setBonusComment(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-xl mb-4 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Например: За креативность"
                                    maxLength={500}
                                />
                            </>
                        ) : (
                            <p className="text-slate-500 mb-4">Нет доступных бонусов</p>
                        )}
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowBonusModal(false);
                                    setBonusComment('');
                                }}
                                className="flex-1 py-3 px-6 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={() => {
                                    setShowBonusModal(false);
                                    setBonusComment('');
                                }}
                                disabled={!selectedBonusTypeId}
                                className="flex-1 py-3 px-6 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPenaltyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-slate-900">Добавить штраф</h3>
                            <button onClick={() => setShowPenaltyModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {penalties.length > 0 ? (
                            <>
                                <p className="text-slate-600 mb-3">Выберите штраф:</p>
                                <div className="space-y-2 mb-4">
                                    {penalties.map(penalty => (
                                        <button
                                            key={penalty.id}
                                            onClick={() => setSelectedPenaltyTypeId(penalty.id)}
                                            className={`w-full p-3 border-2 rounded-xl text-left transition-all ${
                                                selectedPenaltyTypeId === penalty.id
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                                    <Minus className="w-4 h-4 text-red-600" />
                                                    {penalty.name}
                                                </div>
                                                <span className="text-red-600 font-bold">{penalty.pointsAdjustment}</span>
                                            </div>
                                            <div className="text-sm text-slate-600">{penalty.description}</div>
                                        </button>
                                    ))}
                                </div>
                                
                                <p className="text-slate-600 mb-2">Комментарий (необязательно):</p>
                                <textarea
                                    value={penaltyComment}
                                    onChange={(e) => setPenaltyComment(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-xl mb-4 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Например: Не справились"
                                    maxLength={500}
                                />
                            </>
                        ) : (
                            <p className="text-slate-500 mb-4">Нет доступных штрафов</p>
                        )}
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPenaltyModal(false);
                                    setPenaltyComment('');
                                }}
                                className="flex-1 py-3 px-6 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={() => {
                                    setShowPenaltyModal(false);
                                    setPenaltyComment('');
                                }}
                                disabled={!selectedPenaltyTypeId}
                                className="flex-1 py-3 px-6 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-slate-900">Отклонить активность</h3>
                            <button onClick={() => setShowRejectModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <p className="text-slate-600 mb-2">Укажите причину отклонения:</p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-xl mb-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Причина отклонения..."
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
                                onClick={() => {
                                    if (rejectionReason.trim()) {
                                        onReject(activity.id, rejectionReason);
                                        setShowRejectModal(false);
                                        setRejectionReason('');
                                    }
                                }}
                                className="flex-1 py-3 px-6 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
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
