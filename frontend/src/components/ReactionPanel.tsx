import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface ReactionPanelProps {
    activityId: number;
    reactionCounts?: { [key: string]: number };
    userReaction?: string;
    onReact: (type: string) => void;
}

const REACTION_EMOJIS: { [key: string]: string } = {
    LIKE: '❤️',
    FIRE: '🔥',
    STRONG: '💪',
    CLAP: '👏',
    LOVE: '😍'
};

export const ReactionPanel: React.FC<ReactionPanelProps> = ({
    activityId,
    reactionCounts = {},
    userReaction,
    onReact
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    // Get active reactions sorted by count
    const activeReactions = Object.entries(reactionCounts || {})
        .filter(([_, count]) => count && count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => ({ type, count, emoji: REACTION_EMOJIS[type] }))
        .filter(r => r.emoji); // Filter out reactions without emoji mapping

    return (
        <div className="flex gap-2 flex-wrap items-center relative">
            {activeReactions.map(({ type, count, emoji }) => (
                <button
                    key={type}
                    onClick={(e) => {
                        e.stopPropagation();
                        onReact(type);
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        userReaction === type
                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    <span className="text-base">{emoji}</span>
                    <span>{count}</span>
                </button>
            ))}
            
            <div className="relative" ref={pickerRef}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowPicker(!showPicker);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                    <Plus className="w-4 h-4" />
                </button>
                
                {showPicker && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 flex gap-1 z-50">
                        {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                            <button
                                key={type}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReact(type);
                                    setShowPicker(false);
                                }}
                                className={`w-10 h-10 rounded-xl text-2xl hover:bg-slate-100 transition-all flex items-center justify-center ${
                                    userReaction === type ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                                }`}
                                title={type}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
