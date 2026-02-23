import React, { useState } from 'react';
import { User, Shield, Eye } from 'lucide-react';

interface RoleSelectorProps {
    onRoleSelected: () => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onRoleSelected }) => {
    const [selectedRole, setSelectedRole] = useState<string>('');

    const roles = [
        {
            value: 'USER',
            name: 'Пользователь',
            description: 'Обычный участник мероприятий',
            icon: User,
            color: 'from-blue-500 to-blue-600'
        },
        {
            value: 'MODERATOR',
            name: 'Модератор',
            description: 'Модерация активностей участников',
            icon: Eye,
            color: 'from-orange-500 to-orange-600'
        },
        {
            value: 'ADMIN',
            name: 'Администратор',
            description: 'Полный доступ к управлению',
            icon: Shield,
            color: 'from-purple-500 to-purple-600'
        }
    ];

    const handleRoleSelect = (role: string) => {
        localStorage.setItem('userRole', role);
        setSelectedRole(role);
        setTimeout(() => {
            onRoleSelected();
        }, 300);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6 shadow-2xl">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Добро пожаловать в SporttyX Demo
                    </h1>
                    <p className="text-xl text-slate-600">
                        Выберите роль для демонстрации функционала
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                            <button
                                key={role.value}
                                onClick={() => handleRoleSelect(role.value)}
                                className={`bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 ${
                                    selectedRole === role.value ? 'ring-4 ring-blue-500' : ''
                                }`}
                            >
                                <div className={`w-16 h-16 bg-gradient-to-br ${role.color} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                                    {role.name}
                                </h3>
                                <p className="text-slate-600">
                                    {role.description}
                                </p>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        Вы можете изменить роль в любое время, выйдя из системы
                    </p>
                </div>
            </div>
        </div>
    );
};
