import React, { useMemo } from 'react';
import { useVibe } from '../../context/VibeContext';

const Star = ({ style }) => (
    <div className="stars" style={style} />
);

const Sparkle = ({ style }) => (
    <div className="sparkle" style={style} />
);

const VibeBackgrounds = () => {
    const { activeVibe } = useVibe();

    const sparkles = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            style: {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                '--d': `${Math.random() * 10 + 5}s`,
                animationDelay: `${Math.random() * 5}s`
            }
        }));
    }, []);

    if (activeVibe === 'default') return null;

    return (
        <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden vibe-${activeVibe}`}>
            {activeVibe === 'midnight' && <Star />}

            {activeVibe === 'cyberpunk' && (
                <>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,0,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,0,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                    <div className="scanline" />
                </>
            )}

            {activeVibe === 'zen' && (
                <div className="absolute inset-0">
                    {sparkles.map(s => <Sparkle key={s.id} style={s.style} />)}
                </div>
            )}

            {activeVibe === 'sunset' && (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-purple-900/10" />
            )}
        </div>
    );
};

export default VibeBackgrounds;
