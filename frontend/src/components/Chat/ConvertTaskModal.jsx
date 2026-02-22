import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Type, AlignLeft, AlertCircle } from "lucide-react";
import { useState } from "react";

const ConvertTaskModal = ({ isOpen, onClose, message, onSubmit }) => {
    const [title, setTitle] = useState(message?.content?.substring(0, 50) || "");
    const [description, setDescription] = useState(message?.content || "");
    const [deadline, setDeadline] = useState("");
    const [priority, setPriority] = useState("medium");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            title,
            description,
            deadline,
            priority,
            messageId: message?._id || message?.id,
            conversationId: message?.conversationId
        });
        onClose();
    };

    const handleGoogleCalendar = () => {
        if (!deadline) {
            alert("Please set a deadline first to sync with Google Calendar");
            return;
        }
        const start = new Date(deadline).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const end = new Date(new Date(deadline).getTime() + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&dates=${start}/${end}`;
        window.open(url, '_blank');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                    style={{ background: 'hsl(var(--sv-surface))', border: '1px solid hsl(var(--sv-border))' }}
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b" style={{ borderColor: 'hsl(var(--sv-border) / 0.5)' }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: 'hsl(var(--sv-text))' }}>Convert to Task</h3>
                                    <p className="text-xs" style={{ color: 'hsl(var(--sv-text-3))' }}>Set details for your new task</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="sv-icon-btn w-8 h-8 rounded-xl"><X size={16} /></button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'hsl(var(--sv-text-3))' }}>
                                <Type size={12} /> Task Title
                            </label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="sv-input"
                                placeholder="What needs to be done?"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'hsl(var(--sv-text-3))' }}>
                                <AlignLeft size={12} /> Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="sv-input min-h-[100px] py-3 resize-none"
                                placeholder="Additional notes..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'hsl(var(--sv-text-3))' }}>
                                    <Calendar size={12} /> Deadline
                                </label>
                                <input
                                    type="datetime-local"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="sv-input"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'hsl(var(--sv-text-3))' }}>
                                    Priority
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="sv-input appearance-none"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <button type="submit" className="sv-btn-primary w-full py-3.5">
                                Create In-App Task
                            </button>
                            <button
                                type="button"
                                onClick={handleGoogleCalendar}
                                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-white/5 border border-white/10"
                                style={{ color: 'hsl(var(--sv-text))' }}
                            >
                                <img src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png" className="w-4 h-4" alt="GCal" />
                                Sync to Google Calendar
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ConvertTaskModal;
