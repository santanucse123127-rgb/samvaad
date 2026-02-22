import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Delete, Fingerprint } from 'lucide-react';
import axios from 'axios';

const LockScreen = ({ onVerify, token }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleVerify = async (enteredPin) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/users/app-lock/verify`, { pin: enteredPin }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                onVerify();
            } else {
                throw new Error();
            }
        } catch (err) {
            setError(true);
            setTimeout(() => {
                setPin('');
                setError(false);
            }, 1000);
        }
        setLoading(false);
    };

    const handleKey = (key) => {
        if (loading || pin.length >= 6) return;
        const newPin = pin + key;
        setPin(newPin);
        if (newPin.length === 6) {
            handleVerify(newPin);
        }
    };

    const handleDelete = () => {
        if (loading) return;
        setPin(prev => prev.slice(0, -1));
    };

    return (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#0a0a0b] text-white overflow-hidden select-none">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-12"
            >
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        animate={error ? { x: [-10, 10, -10, 10, 0], color: '#ef4444' } : {}}
                        className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-sv-accent mb-4 border border-white/5"
                    >
                        <Lock size={40} className={error ? 'text-red-500' : ''} />
                    </motion.div>
                    <h2 className="text-2xl font-black italic tracking-tighter">Samvaad Locked</h2>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Enter security PIN</p>
                </div>

                <div className="flex gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-sv-accent border-sv-accent scale-125' : 'border-white/10'}`}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <button
                            key={n}
                            onClick={() => handleKey(n.toString())}
                            className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 active:bg-sv-accent/20 active:text-sv-accent text-xl font-bold transition-all active:scale-90 flex items-center justify-center border border-transparent hover:border-white/10"
                        >
                            {n}
                        </button>
                    ))}
                    <div className="w-16 h-16 flex items-center justify-center">
                        <Fingerprint size={24} className="text-white/10" />
                    </div>
                    <button
                        onClick={() => handleKey('0')}
                        className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 active:bg-sv-accent/20 active:text-sv-accent text-xl font-bold transition-all active:scale-90 flex items-center justify-center border border-transparent hover:border-white/10"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 active:bg-red-500/20 active:text-red-500 text-xl font-bold transition-all active:scale-90 flex items-center justify-center border border-transparent hover:border-white/10"
                    >
                        <Delete size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LockScreen;
