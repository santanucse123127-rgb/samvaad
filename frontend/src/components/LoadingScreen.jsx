import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Lock, Shield, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const LoadingScreen = () => {
    const [activeStage, setActiveStage] = useState(0);
    const stages = [
        { text: "INITIATING SECURE CHANNEL", icon: Lock },
        { text: "ESTABLISHING NEURAL LINK", icon: Zap },
        { text: "SYNCHRONIZING VOID CACHE", icon: Shield },
        { text: "WELCOME TO SAMVAAD", icon: MessageCircle }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStage((prev) => (prev + 1) % stages.length);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#060a0d] overflow-hidden">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
      `}</style>

            {/* Background Effects matching Index.jsx */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'radial-gradient(rgba(0,230,118,0.06) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Glow Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
                style={{ background: 'radial-gradient(circle, #00e676, transparent 70%)' }}
            />

            {/* Central Content */}
            <div className="relative flex flex-col items-center">
                {/* Logo Animation */}
                <div className="relative mb-12">
                    <motion.div
                        animate={{
                            rotate: 360,
                            borderRadius: ["30%", "50%", "30%"]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border-t-2 border-r-2 border-[#00e676]/30 absolute -inset-4"
                    />
                    <motion.div
                        animate={{
                            rotate: -360,
                            borderRadius: ["50%", "30%", "50%"]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border-b-2 border-l-2 border-[#00e676]/20 absolute -inset-4"
                    />

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#00e676] to-[#00c853] flex items-center justify-center shadow-[0_0_40px_rgba(0,230,118,0.3)] relative z-10"
                    >
                        <MessageCircle size={44} color="#050e07" fill="#050e07" />
                    </motion.div>

                    {/* Scanning Line */}
                    <motion.div
                        animate={{
                            top: ["-20%", "120%"],
                            opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-[-20%] right-[-20%] h-[2px] bg-gradient-to-r from-transparent via-[#00e676] to-transparent z-20 shadow-[0_0_15px_#00e676]"
                    />
                </div>

                {/* Text Area */}
                <div className="h-16 flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStage}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="flex items-center gap-3">
                                {(() => {
                                    const Icon = stages[activeStage].icon;
                                    return <Icon size={16} className="text-[#00e676]" />;
                                })()}
                                <span
                                    className="text-xs font-black tracking-[0.3em] uppercase text-[#00e676]/80"
                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                >
                                    {stages[activeStage].text}
                                </span>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Digital Progress Bar */}
                    <div className="w-48 h-[2px] bg-white/5 rounded-full mt-6 overflow-hidden relative">
                        <motion.div
                            animate={{
                                left: ["-100%", "100%"]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#00e676] to-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * 100 + "%",
                            y: Math.random() * 100 + "%",
                            opacity: 0
                        }}
                        animate={{
                            y: [null, "-20%"],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: i * 0.5
                        }}
                        className="text-[10px] text-[#00e676] font-mono"
                    >
                        {Math.random().toString(16).substring(2, 8).toUpperCase()}
                    </motion.div>
                ))}
            </div>

            {/* Branding */}
            <div className="absolute bottom-12 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.5em] text-white/20 uppercase">Samvaad Protocol v2.0.4</span>
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1 h-1 rounded-full bg-[#00e676]"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
