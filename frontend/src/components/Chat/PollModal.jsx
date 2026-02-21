import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, BarChart2 } from 'lucide-react';

const PollModal = ({ isOpen, onClose, onSubmit }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [allowMultiple, setAllowMultiple] = useState(false);

    const handleAddOption = () => {
        if (options.length < 10) {
            setOptions([...options, '']);
        }
    };

    const handleRemoveOption = (index) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!question.trim() || options.some(opt => !opt.trim())) return;

        onSubmit({
            question,
            options: options.filter(opt => opt.trim()),
            allowMultiple
        });
        onClose();
        // Reset form
        setQuestion('');
        setOptions(['', '']);
        setAllowMultiple(false);
    };

    if (!isOpen) return null;

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
                                <BarChart2 className="w-5 h-5 text-wa-accent" />
                            </div>
                            <h2 className="text-xl font-bold text-wa-text-primary">Create Poll</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-wa-text-secondary"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-wa-text-primary ml-1 uppercase tracking-wider">
                                Question
                            </label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="What's on your mind?"
                                className="w-full px-5 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-wa-accent focus:ring-1 focus:ring-wa-accent/20 outline-none transition-all font-medium"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-wa-text-primary ml-1 uppercase tracking-wider">
                                Options
                            </label>
                            <div className="space-y-3">
                                {options.map((option, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                            className="flex-1 px-5 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-wa-accent focus:ring-1 focus:ring-wa-accent/20 outline-none transition-all font-medium"
                                        />
                                        {options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(index)}
                                                className="p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {options.length < 10 && (
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="flex items-center gap-2 text-sm text-wa-accent hover:text-wa-accent/80 font-bold px-2 py-2 rounded-xl transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Option
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3 p-1">
                            <button
                                type="button"
                                onClick={() => setAllowMultiple(!allowMultiple)}
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${allowMultiple ? "bg-wa-accent border-wa-accent text-white" : "border-border/50"
                                    }`}
                            >
                                {allowMultiple && <Check className="w-4 h-4" />}
                            </button>
                            <label htmlFor="allowMultiple" className="text-sm font-bold text-wa-text-secondary cursor-pointer" onClick={() => setAllowMultiple(!allowMultiple)}>
                                Allow multiple answers
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-wa-accent text-white font-bold text-lg shadow-xl shadow-wa-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                        >
                            Send Poll
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PollModal;
