import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, UserPlus, LogOut, Camera, Mail, Phone, Edit } from 'lucide-react';
import { Button } from './ui/Button';
import { Notifications } from './Notifications';

interface Participant {
    id: number;
    username: string;
    name: string;
    teamName?: string;
    email?: string;
    phone?: string;
    profileImageUrl?: string;
}

export const ParticipantProfile: React.FC = () => {
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profileImage, setProfileImage] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/participants/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setParticipant(data);
                setProfileImage(data.profileImageUrl || '');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
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
                // Здесь можно добавить загрузку на сервер
                // uploadProfileImage(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
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
                        {/* Profile Image with Upload */}
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

                        {/* Profile Info */}
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

                            {/* Contact Info */}
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

                    <div className="border-t border-slate-200 pt-8">
                        <Button onClick={() => navigate('/edit-profile')} variant="primary" className="w-full">
                            <Edit className="w-5 h-5" />
                            Редактировать профиль
                        </Button>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="mt-6">
                    <Notifications />
                </div>
            </div>
        </div>
    );
};
