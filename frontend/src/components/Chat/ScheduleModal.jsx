import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock } from 'lucide-react';

const ScheduleModal = ({ isOpen, onClose, onSubmit }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !time) return;

        const scheduledDate = new Date(`${date}T${time}`);
        if (scheduledDate <= new Date()) {
            alert('Please select a future time');
            return;
        }

        onSubmit(scheduledDate);
        onClose();
        setDate('');
        setTime('');
    };

    if (!isOpen) return null;

    // Get min date (today)
    const minDate = new Date().toISOString().split('T')[0];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <motion.div
                    className="bg-card border border-border/50 rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                >
                    <div className="p-6 border-b border-border/50 flex items-center justify-between bg-wa-accent/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-wa-accent/10 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-wa-accent" />
                            </div>
                            <h2 className="text-xl font-bold text-wa-text-primary">Schedule Message</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-wa-text-secondary"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-wa-text-primary ml-1 uppercase tracking-wider">
                                    Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        min={minDate}
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-wa-accent focus:ring-1 focus:ring-wa-accent/20 outline-none transition-all font-medium appearance-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-wa-text-primary ml-1 uppercase tracking-wider">
                                    Time
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wa-text-secondary pr-1" />
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full pl-12 pr-5 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-wa-accent focus:ring-1 focus:ring-wa-accent/20 outline-none transition-all font-medium appearance-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-wa-accent text-white font-bold text-lg shadow-xl shadow-wa-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                        >
                            Schedule Send
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ScheduleModal;
