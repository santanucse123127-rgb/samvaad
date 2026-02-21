import { motion } from 'framer-motion';

const DOT_COUNT = 4;

const TypingIndicator = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex items-end gap-0 self-start"
            style={{ marginBottom: '2px' }}
        >
            {/* Bubble */}
            <div
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 18px',
                    borderRadius: '20px',
                    borderBottomLeftRadius: '4px',
                    background: 'hsl(var(--sv-bubble-other))',
                    border: '1px solid hsl(var(--sv-border) / 0.5)',
                    boxShadow: '0 2px 12px -2px rgba(0,0,0,0.25)',
                }}
            >
                {Array.from({ length: DOT_COUNT }, (_, i) => (
                    <motion.span
                        key={i}
                        style={{
                            display: 'block',
                            width: i === 2 ? '9px' : '7px',
                            height: i === 2 ? '9px' : '7px',
                            borderRadius: '50%',
                            background: i === 2
                                ? 'hsl(var(--sv-accent))'
                                : 'hsl(var(--sv-text-3))',
                            boxShadow: i === 2
                                ? '0 0 8px hsl(var(--sv-accent) / 0.6)'
                                : 'none',
                            flexShrink: 0,
                        }}
                        animate={{
                            y: [0, -7, 0],
                            opacity: [0.45, 1, 0.45],
                            scale: [1, 1.25, 1],
                        }}
                        transition={{
                            duration: 1.1,
                            repeat: Infinity,
                            delay: i * 0.18,
                            ease: [0.45, 0, 0.55, 1],
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default TypingIndicator;
