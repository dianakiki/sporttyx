import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, Edit, Calendar, MapPin, Mail, Phone, Camera, Award } from 'lucide-react';

interface Participant {
    id: number;
    username: string;
    name: string;
    teamName?: string;
    email?: string;
    phone?: string;
    profileImageUrl?: string;
}

interface UserEvent {
    id: number;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: string;
}

const mockParticipant: Participant = {
    id: 1,
    username: "demo_user",
    name: "Демо Пользователь",
    teamName: "Спортивные Энтузиасты",
    email: "demo@sporttyx.com",
    phone: "+7 (999) 123-45-67",
    profileImageUrl: "https://i.pravatar.cc/300?img=1"
};

const mockUserEvents: UserEvent[] = [
    {
        id: 1,
        name: "Весенний Марафон 2024",
        description: "Ежегодный марафон для всех желающих",
        startDate: "2024-03-15T09:00:00",
        endDate: "2024-03-15T15:00:00",
        status: "ACTIVE"
    }
];

export const ParticipantProfile: React.FC = () => {
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profileImage, setProfileImage] = useState<string>('');
    const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setParticipant(mockParticipant);
            setProfileImage(mockParticipant.profileImageUrl || '');
            setUserEvents(mockUserEvents);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                setProfileImage(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-blue-600 text-xl">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl">
                                {profileImage ? (
                                    <img 
                                        src={profileImage} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-16 h-16 text-white" />
                                )}
                            </div>
                            <label 
                                htmlFor="profile-image-upload"
                                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <Camera className="w-8 h-8 text-white" />
                            </label>
                            <input
                                id="profile-image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-bold text-slate-900 mb-1">
                                {participant?.name || 'Участник'}
                            </h1>
                            <p className="text-slate-500 text-lg mb-3">@{participant?.username}</p>
                            
                            {participant?.teamName && (
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-slate-600">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    <span className="text-lg">{participant.teamName}</span>
                                </div>
                            )}

                            <div className="space-y-2 mt-4">
                                {participant?.email && (
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">{participant.email}</span>
                                    </div>
                                )}
                                {participant?.phone && (
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600">
                                        <Phone className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">{participant.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-8 space-y-3">
                        <button 
                            onClick={() => navigate('/edit-profile')} 
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            <Edit className="w-5 h-5" />
                            Редактировать профиль
                        </button>
                    </div>
                </div>

                <div className="mt-6 bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        Мои мероприятия
                    </h2>

                    {userEvents.length > 0 ? (
                        <div className="space-y-4">
                            {userEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="border-2 border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {event.name}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    event.status === 'ACTIVE' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : event.status === 'UPCOMING'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {event.status === 'ACTIVE' ? 'Активно' : event.status === 'UPCOMING' ? 'Скоро' : 'Завершено'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {new Date(event.startDate).toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                    {' - '}
                                                    {new Date(event.endDate).toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>

                                            {event.description && (
                                                <p className="text-slate-700 text-sm bg-slate-50 p-3 rounded-lg mt-2">
                                                    {event.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg">Вы пока не участвуете в мероприятиях</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
