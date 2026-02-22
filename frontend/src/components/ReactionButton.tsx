import React from 'react';

interface ReactionButtonProps {
    emoji: string;
    type: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({
    emoji,
    type,
    count,
    isActive,
    onClick
}) => {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-500'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent'
            }`}
        >
            <span className="text-lg">{emoji}</span>
            {count > 0 && <span>{count}</span>}
        </button>
    );
};
