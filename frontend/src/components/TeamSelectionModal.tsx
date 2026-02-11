import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, X } from 'lucide-react';

interface TeamSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TeamSelectionModal: React.FC<TeamSelectionModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleCreateTeam = () => {
        onClose();
        navigate('/add-team');
    };

    const handleJoinTeam = () => {
        onClose();
        navigate('/my-team');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
                >
                    <X className="w-6 h-6 text-slate-600" />
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-4 shadow-lg">
                        <Users className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Создать команду</h2>
                    <p className="text-slate-600">У вас пока нет команды. Создайте новую!</p>
                </div>

                <button
                    onClick={handleCreateTeam}
                    className="w-full p-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-left group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <UserPlus className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">Создать команду</h3>
                            <p className="text-sm text-blue-100">Создайте новую команду и пригласите участников</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};
