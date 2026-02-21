import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, Lock, Send, Sparkles, Cake, MapPin, Hash, UserCheck, Plus } from "lucide-react";

const TimeCapsuleModal = ({ isOpen, onClose, onSend }) => {
    const [activeTab, setActiveTab] = useState("time"); // time, birthday, location, count, online
    const [date, setDate] = useState("");
    const [time, setTime] = useState("12:00");
    const [preset, setPreset] = useState(null);

    const [targetCount, setTargetCount] = useState(100);
    const [location, setLocation] = useState(null); // { lat, lng, address }
    const [loadingLoc, setLoadingLoc] = useState(false);

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

    const getCurrentLocation = () => {
        setLoadingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    address: "Current Location"
                });
                setLoadingLoc(false);
            },
            (err) => {
                alert("Failed to get location. Please enable permissions.");
                setLoadingLoc(false);
            }
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let unlockAt = null;
        let unlockConditions = null;

        if (activeTab === "time") {
            if (!date || !time) return;
            unlockAt = new Date(`${date}T${time}`).toISOString();
            unlockConditions = { type: 'time' };
        } else if (activeTab === "birthday") {
            unlockConditions = { type: 'birthday' };
        } else if (activeTab === "location") {
            if (!location) return alert("Please select a location.");
            unlockConditions = { type: 'location', location };
        } else if (activeTab === "count") {
            unlockConditions = { type: 'count', messageCount: targetCount };
        } else if (activeTab === "online") {
            unlockConditions = { type: 'online' };
        }

        onSend(unlockAt, unlockConditions);
        onClose();
    };

    const tabs = [
        { id: "time", icon: Clock, label: "Time" },
        { id: "birthday", icon: Cake, label: "Birthday" },
        { id: "location", icon: MapPin, label: "Place" },
        { id: "count", icon: Hash, label: "Count" },
        { id: "online", icon: UserCheck, label: "Online" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-sv-surface shadow-2xl border border-sv-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-8 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
                                    <Lock size={26} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-sv-text tracking-tight uppercase">Paradox Vault</h3>
                                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] opacity-80">Quantum Locking System</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="sv-icon-btn p-3 rounded-2xl hover:bg-orange-500/10 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Custom Tabs */}
                        <div className="flex gap-2 px-8 mb-2 overflow-x-auto scrollbar-none">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex flex-col items-center gap-2 min-w-[70px] py-4 rounded-3xl transition-all duration-300 ${activeTab === tab.id
                                        ? "bg-orange-500/15 text-orange-500 border border-orange-500/30"
                                        : "bg-sv-surface-2 text-sv-text-3 border border-transparent hover:border-sv-border"
                                        }`}
                                >
                                    <tab.icon size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="min-h-[140px] flex flex-col justify-center">
                                {activeTab === "time" && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                        <div className="grid grid-cols-3 gap-3">
                                            {presets.map((p) => (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    onClick={() => handlePresetSelect(p.value)}
                                                    className={`py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${preset === p.value
                                                        ? "bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-500/30"
                                                        : "bg-sv-surface-3 border-sv-border text-sv-text-2"
                                                        }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPreset(null); }} className="sv-input py-3.5 px-4 text-xs font-bold" required />
                                            <input type="time" value={time} onChange={(e) => { setTime(e.target.value); setPreset(null); }} className="sv-input py-3.5 px-4 text-xs font-bold" required />
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "birthday" && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 mx-auto">
                                            <Cake size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-black text-sv-text uppercase tracking-tight">The Birthday Box</p>
                                            <p className="text-xs text-sv-text-3 font-medium px-10">This capsule will remain sealed until the recipient's next anniversary of birth. 🎂</p>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "location" && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                        <button
                                            type="button"
                                            onClick={getCurrentLocation}
                                            className="w-full py-5 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center gap-4 text-blue-500 hover:bg-blue-500/20 transition-all font-black uppercase text-xs tracking-widest"
                                        >
                                            {loadingLoc ? "Pinpointing..." : (
                                                <><MapPin size={20} /> {location ? "Location Fixed" : "Lock to Current Place"}</>
                                            )}
                                        </button>
                                        {location && (
                                            <p className="text-[10px] text-center font-bold text-sv-text-2 tracking-widest uppercase italic">
                                                Vault will unlock when they are within 100m of this spot.
                                            </p>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === "count" && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
                                        <div className="flex items-center justify-center gap-6">
                                            <button type="button" onClick={() => setTargetCount(Math.max(10, targetCount - 10))} className="w-12 h-12 rounded-2xl bg-sv-surface-3 flex items-center justify-center text-sv-text hover:bg-sv-border transition-colors"><Hash size={20} /></button>
                                            <div className="text-center">
                                                <span className="text-4xl font-black text-white">{targetCount}</span>
                                                <p className="text-[10px] font-black uppercase text-sv-text-3 tracking-[0.2em] mt-1">Messages</p>
                                            </div>
                                            <button type="button" onClick={() => setTargetCount(targetCount + 10)} className="w-12 h-12 rounded-2xl bg-sv-surface-3 flex items-center justify-center text-sv-text hover:bg-sv-border transition-colors"><Plus size={20} /></button>
                                        </div>
                                        <p className="text-xs text-center font-medium text-sv-text-3 italic px-10">The vault opens after you both exchange another {targetCount} messages.</p>
                                    </motion.div>
                                )}

                                {activeTab === "online" && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mx-auto animate-pulse">
                                            <UserCheck size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-black text-sv-text uppercase tracking-tight">Synchronized Presence</p>
                                            <p className="text-xs text-sv-text-3 font-medium px-10">Unlocks ONLY when both of you are online at the same time. The ultimate real-time reveal! 🔥</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Info Box */}
                            <div className="p-5 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex gap-4 items-start backdrop-blur-md">
                                <Sparkles size={18} className="text-orange-500 flex-shrink-0 mt-0.5 animate-pulse" />
                                <p className="text-[11px] leading-relaxed text-sv-text-2 font-bold uppercase tracking-wide">
                                    Paradox Lock engaged. The contents are shielded from the space-time continuum until conditions are met.
                                </p>
                            </div>

                            {/* Action */}
                            <button
                                type="submit"
                                className="sv-btn-primary w-full py-5 rounded-3xl flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] shadow-2xl active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 12px 40px -6px rgba(234, 88, 12, 0.5)' }}
                            >
                                Seal Paradox <Send size={20} />
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TimeCapsuleModal;
