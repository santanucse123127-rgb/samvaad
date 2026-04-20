import { motion } from 'framer-motion';

const TypingIndicator = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2 py-2 px-3 self-start"
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
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "hsl(var(--sv-online))",
                        }}
                    />
                ))}
            </div>
            <span className="text-[12px] font-bold uppercase tracking-widest text-black/30 ml-2">Typing</span>
        </motion.div>
    );
};

export default TypingIndicator;
