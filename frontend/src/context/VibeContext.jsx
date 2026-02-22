import React, { createContext, useContext, useState, useEffect } from 'react';

const VibeContext = createContext();

export const VIBES = {
    DEFAULT: {
        id: 'default',
        name: 'Classic Midnight',
        colors: {
            accent: '217 91% 60%',
            bg: '222 47% 8%',
            surface: '222 47% 11%',
        }
    },
    CYBERPUNK: {
        id: 'cyberpunk',
        name: 'Neon Protocol',
        colors: {
            accent: '292 91% 60%',
            bg: '270 50% 5%',
            surface: '270 50% 8%',
        }
    },
    ZEN: {
        id: 'zen',
        name: 'Misty Forest',
        colors: {
            accent: '160 60% 50%',
            bg: '200 20% 10%',
            surface: '200 20% 14%',
        }
    },
    SUNSET: {
        id: 'sunset',
        name: 'Desert Mirage',
        colors: {
            accent: '20 90% 60%',
            bg: '10 40% 8%',
            surface: '10 40% 12%',
        }
    }
};

export const VibeProvider = ({ children }) => {
    const [activeVibe, setActiveVibe] = useState(() => {
        return localStorage.getItem('samvaad-vibe') || 'default';
    });

    useEffect(() => {
        localStorage.setItem('samvaad-vibe', activeVibe);
        document.documentElement.setAttribute('data-vibe', activeVibe);

        // Apply theme colors to CSS variables
        const vibe = Object.values(VIBES).find(v => v.id === activeVibe) || VIBES.DEFAULT;
        const root = document.documentElement;
        root.style.setProperty('--sv-accent', vibe.colors.accent);
        root.style.setProperty('--sv-bg', vibe.colors.bg);
        root.style.setProperty('--sv-surface', vibe.colors.surface);
    }, [activeVibe]);

    return (
        <VibeContext.Provider value={{ activeVibe, setActiveVibe, vibes: Object.values(VIBES) }}>
            {children}
        </VibeContext.Provider>
    );
};

export const useVibe = () => {
    const context = useContext(VibeContext);
    if (!context) throw new Error('useVibe must be used within VibeProvider');
    return context;
};
