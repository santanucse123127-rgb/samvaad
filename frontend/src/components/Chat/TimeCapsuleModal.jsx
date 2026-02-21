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
                                <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-500">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-sv-text">Digital Time Capsule</h3>
                                    <p className="text-xs text-sv-text-3">Message will be visible but locked</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="sv-icon-btn p-2 rounded-xl"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Presets */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-sv-text-3">Quick Presets</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {presets.map((p) => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => handlePresetSelect(p.value)}
                                            className={`py-3 px-2 rounded-2xl text-xs font-semibold border transition-all ${preset === p.value
                                                    ? "bg-orange-500/10 border-orange-500/50 text-orange-500"
                                                    : "bg-sv-surface-2 border-sv-border text-sv-text-2 hover:border-sv-text-3"
                                                }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Selector */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-wider text-sv-text-3">Custom Unlock Time</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-sv-text-3" size={16} />
                                            <input
                                                type="date"
                                                value={date}
                                                onChange={(e) => { setDate(e.target.value); setPreset(null); }}
                                                className="sv-input py-2.5 pl-10 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-sv-text-3" size={16} />
                                            <input
                                                type="time"
                                                value={time}
                                                onChange={(e) => { setTime(e.target.value); setPreset(null); }}
                                                className="sv-input py-2.5 pl-10 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex gap-3 items-start">
                                <Sparkles size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] leading-relaxed text-sv-text-2">
                                    Recipient will see that you've sent a time capsule, but they won't be able to read the content until the date you specified.
                                </p>
                            </div>

                            {/* Action */}
                            <button
                                type="submit"
                                disabled={!date || !time}
                                className="sv-btn-primary w-full py-4 rounded-2xl gap-3"
                                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 8px 30px -4px rgba(234, 88, 12, 0.4)' }}
                            >
                                Assemble Capsule <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TimeCapsuleModal;
