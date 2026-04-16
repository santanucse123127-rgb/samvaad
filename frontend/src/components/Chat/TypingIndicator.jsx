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
            <div
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    borderBottomLeftRadius: '4px',
                }}
            >
               <span className="text-[#10B981] text-[13px] font-medium tracking-wide motion-safe:animate-pulse">Typing..</span>
            </div>
        </motion.div>
    );
};

export default TypingIndicator;
