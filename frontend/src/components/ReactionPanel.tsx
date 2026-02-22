import React from 'react';
import { ReactionButton } from './ReactionButton';

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
    return (
        <div className="flex gap-2 flex-wrap">
            {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                <ReactionButton
                    key={type}
                    emoji={emoji}
                    type={type}
                    count={reactionCounts[type] || 0}
                    isActive={userReaction === type}
                    onClick={() => onReact(type)}
                />
            ))}
        </div>
    );
};
