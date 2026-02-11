import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, Trash2, ArrowLeft } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    profileImageUrl: string;
}

export const EditProfile: React.FC = () => {
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState<string>('');
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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
                setUsername(data.username || '');
                setName(data.name || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
                setProfileImage(data.profileImageUrl || '');
            } else {
                // Mock data
                setUsername('ivan');
                setName('Иван Иванов');
                setEmail('ivan@example.com');
                setPhone('+7 (999) 123-45-67');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setName('Иван Иванов');
            setEmail('ivan@example.com');
            setPhone('+7 (999) 123-45-67');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/participants/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    profileImageUrl: profileImage,
                }),
            });

            if (response.ok) {
                navigate('/profile');
            } else {
                setError('Ошибка сохранения профиля');
            }
        } catch (err) {
            setError('Ошибка подключения к серверу');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProfile = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить свой профиль? Это действие необратимо!')) {
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/participants/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                navigate('/login');
            } else {
                setError('Ошибка удаления профиля');
            }
        } catch (err) {
            setError('Ошибка подключения к серверу');
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Назад к профилю
                </button>

                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Редактировать профиль</h1>
                        <p className="text-slate-600">Обновите свои данные</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Profile Image Upload */}
                        <div className="mb-6 flex flex-col items-center">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Фото профиля
                            </label>
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
                        </div>

                        <Input
                            label="Логин"
                            type="text"
                            value={username}
                            onChange={() => {}}
                            placeholder="Логин"
                            disabled
                        />

                        <Input
                            label="Имя"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Введите ваше имя"
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@mail.com"
                        />

                        <Input
                            label="Телефон"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+7 (999) 123-45-67"
                        />

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <Button type="submit" isLoading={isLoading} className="flex-1">
                                <Save className="w-5 h-5" />
                                Сохранить
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => navigate('/profile')}
                                className="flex-1"
                            >
                                Отмена
                            </Button>
                        </div>
                    </form>

                    {/* Delete Profile Button */}
                    <div className="mt-8 pt-8 border-t border-slate-200">
                        <button
                            onClick={handleDeleteProfile}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-all"
                        >
                            <Trash2 className="w-5 h-5" />
                            Удалить профиль
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
