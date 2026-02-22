import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Trash2, Check, Shield } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const EphemeralModal = ({ isOpen, onClose, conversation }) => {
    const { updateEphemeralSettings } = useChat();
    const [enabled, setEnabled] = useState(conversation?.ephemeralSettings?.enabled || false);
    const [duration, setDuration] = useState(conversation?.ephemeralSettings?.duration || 86400);
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const DURATIONS = [
        { label: '24 Hours', value: 86400 },
        { label: '7 Days', value: 604800 },
        { label: '30 Days', value: 2592000 },
        { label: 'Infinite (Off)', value: 0 },
    ];

    const handleSave = async () => {
        setSaving(true);
        const success = await updateEphemeralSettings(conversation._id, {
            enabled: duration > 0,
            duration: duration > 0 ? duration : 86400,
        });
        setSaving(false);
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
                    style={{ background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))' }}
                >
                    <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'hsl(var(--sv-border)/0.5)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-sv-accent/10 flex items-center justify-center text-sv-accent">
                                <Clock size={20} />
                            </div>
                            <span className="font-bold text-lg">Disappearing Messages</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all"><X size={20} /></button>
                    </div>

                    <div className="p-8 flex flex-col gap-6">
                        <div className="p-4 rounded-2xl bg-sv-accent/5 border border-sv-accent/10 flex items-center gap-4">
                            <Shield size={24} className="text-sv-accent flex-shrink-0" />
                            <p className="text-[11px] font-medium leading-relaxed opacity-60">
                                When enabled, new messages sent in this chat will disappear for everyone after the selected time.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Message Timer</p>
                            <div className="grid grid-cols-1 gap-2">
                                {DURATIONS.map(d => (
                                    <button
                                        key={d.value}
                                        onClick={() => setDuration(d.value)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${duration === d.value ? 'bg-sv-accent border-sv-accent text-white shadow-lg shadow-sv-accent/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                    >
                                        <span className="text-sm font-bold">{d.label}</span>
                                        {duration === d.value && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full h-14 rounded-2xl bg-sv-accent text-white font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-sv-accent/20 flex items-center justify-center gap-3"
                        >
                            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Apply Timer'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EphemeralModal;
