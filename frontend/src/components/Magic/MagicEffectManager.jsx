import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

const MagicEffectManager = () => {
    useEffect(() => {
        const handleMagicBurst = (e) => {
            const { x, y, type } = e.detail;

            const defaults = {
                spread: 360,
                ticks: 50,
                gravity: 0,
                decay: 0.94,
                startVelocity: 30,
                shapes: ['circle'],
                colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
            };

            if (type === 'heart') {
                confetti({
                    ...defaults,
                    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
                    particleCount: 15,
                    scalar: 1,
                    shapes: ['heart'],
                    colors: ['#ff0000', '#ff6666', '#ffb3b3']
                });
            } else if (type === 'celebration') {
                // Full screen burst
                const count = 200;
                const celebrate = () => {
                    confetti({
                        particleCount: count,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                };
                celebrate();
            } else {
                // Standard burst
                confetti({
                    ...defaults,
                    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
                    particleCount: 20,
                });
            }
        };

        window.addEventListener('magic-burst', handleMagicBurst);
        return () => window.removeEventListener('magic-burst', handleMagicBurst);
    }, []);

    return null;
};

// Extends canvas-confetti with a custom heart shape
const registerHeart = () => {
    const heart = confetti.shapeFromPath({
        path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
    });
    // We can't easily register shapes globally in standard confetti without more config, 
    // but we can pass it if supported or use emojis.
};

export default MagicEffectManager;
