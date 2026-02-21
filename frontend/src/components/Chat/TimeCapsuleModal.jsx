import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, Lock, Send, Sparkles } from "lucide-react";

const TimeCapsuleModal = ({ isOpen, onClose, onSend }) => {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("12:00");
    const [preset, setPreset] = useState(null);

    const presets = [
        { label: "1 Week", value: "week" },
        { label: "1 Month", value: "month" },
        { label: "1 Year", value: "year" },
    ];

    const handlePresetSelect = (p) => {
        setPreset(p);
        const now = new Date();
        if (p === "week") now.setDate(now.getDate() + 7);
        else if (p === "month") now.setMonth(now.getMonth() + 1);
        else if (p === "year") now.setFullYear(now.getFullYear() + 1);

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        setDate(`${year}-${month}-${day}`);
        setTime(String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0"));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !time) return;
        const unlockDate = new Date(`${date}T${time}`);
        if (unlockDate <= new Date()) {
            alert("Please select a future date and time.");
            return;
        }
        onSend(unlockDate);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-sv-surface shadow-2xl border border-sv-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 pb-4 flex items-center justify-between border-b border-sv-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                    <Lock size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-sv-text tracking-tight">Time Capsule</h3>
                                    <p className="text-[11px] font-medium text-orange-500/80 uppercase tracking-widest">Temporal Vault</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="sv-icon-btn p-2.5 rounded-xl hover:bg-orange-500/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="text-center space-y-2 mb-2">
                                <p className="text-sm font-medium text-sv-text-2">
                                    Seal your current message or file into a digital vault.
                                </p>
                            </div>

                            {/* Presets */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-sv-text-3 px-1">Quick Presets</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {presets.map((p) => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => handlePresetSelect(p.value)}
                                            className={`py-3.5 px-2 rounded-2xl text-[11px] font-bold border transition-all duration-300 ${preset === p.value
                                                    ? "bg-orange-500/10 border-orange-500/60 text-orange-500 shadow-inner"
                                                    : "bg-sv-surface-2 border-sv-border text-sv-text-2 hover:border-orange-500/30 hover:text-sv-text"
                                                }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Selector */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-sv-text-3 px-1">Custom Orbit</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500/50 group-focus-within:text-orange-500 transition-colors" size={16} />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => { setDate(e.target.value); setPreset(null); }}
                                            className="sv-input py-3 pl-11 text-xs font-semibold focus:border-orange-500/50"
                                            required
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500/50 group-focus-within:text-orange-500 transition-colors" size={16} />
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => { setTime(e.target.value); setPreset(null); }}
                                            className="sv-input py-3 pl-11 text-xs font-semibold focus:border-orange-500/50"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex gap-3 items-start backdrop-blur-md">
                                <Sparkles size={16} className="text-orange-500 flex-shrink-0 mt-0.5 animate-pulse" />
                                <p className="text-[11px] leading-relaxed text-sv-text-2 font-medium">
                                    Content will be hidden behind a temporal shield. The recipient will see the lock, but the data stays encrypted until the clock runs out.
                                </p>
                            </div>

                            {/* Action */}
                            <button
                                type="submit"
                                disabled={!date || !time}
                                className="sv-btn-primary w-full py-4.5 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.02] shadow-xl"
                                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 8px 30px -4px rgba(234, 88, 12, 0.4)' }}
                            >
                                Seal Capsule <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TimeCapsuleModal;
