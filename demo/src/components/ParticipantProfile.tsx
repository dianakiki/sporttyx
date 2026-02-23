import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Mail, Trophy, Activity } from 'lucide-react';
import mockApi from '../api/mockApi';

interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    city: string;
    photoUrl?: string;
    points: number;
}

export const ParticipantProfile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const userData = await mockApi.auth.getCurrentUser();
            const userActivities = await mockApi.participants.getActivities(userData.id);
            setUser(userData);
            setActivities(userActivities);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-slate-600">Загрузка...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-shrink-0">
                            <img
                                src={user.photoUrl || 'https://i.pravatar.cc/300'}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-48 h-48 rounded-3xl object-cover shadow-lg"
                            />
                        </div>

                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">
                                {user.firstName} {user.lastName}
                            </h1>
                            <p className="text-xl text-slate-600 mb-6">@{user.username}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail className="w-5 h-5 text-blue-500" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <MapPin className="w-5 h-5 text-blue-500" />
                                    <span>{user.city}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Calendar className="w-5 h-5 text-blue-500" />
                                    <span>{new Date(user.dateOfBirth).toLocaleDateString('ru-RU')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Trophy className="w-5 h-5 text-blue-500" />
                                    <span className="font-bold text-blue-600">{user.points} баллов</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm opacity-90 mb-1">Всего активностей</div>
                                        <div className="text-3xl font-bold">{activities.length}</div>
                                    </div>
                                    <Activity className="w-12 h-12 opacity-80" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Последние активности</h2>
                    
                    {activities.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600">Пока нет активностей</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activities.slice(0, 5).map(activity => (
                                <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                                    <div className="flex-1">
                                        <div className="font-semibold text-slate-900">{activity.description || 'Активность'}</div>
                                        <div className="text-sm text-slate-500">
                                            {new Date(activity.date).toLocaleDateString('ru-RU')}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-sm text-slate-500">Дистанция</div>
                                            <div className="font-bold text-blue-600">{activity.distance} км</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-slate-500">Баллы</div>
                                            <div className="font-bold text-green-600">{activity.points}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
