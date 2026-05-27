import { motion } from 'framer-motion';

const TypingIndicator = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 py-2.5 px-4 rounded-2xl self-start"
            style={{
                background: 'hsl(var(--sv-surface-3))',
                border: '1px solid hsl(var(--sv-border))',
                borderBottomLeftRadius: 4,
            }}
        >
            <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut"
                        }}
                        style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "hsl(var(--sv-accent))",
                            opacity: 0.6,
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default TypingIndicator;
