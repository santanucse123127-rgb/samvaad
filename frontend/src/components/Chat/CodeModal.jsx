import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, Terminal } from 'lucide-react';

const LANGUAGES = [
    'javascript',
    'python',
    'java',
    'cpp',
    'csharp',
    'html',
    'css',
    'typescript',
    'sql',
    'json',
    'markdown'
];

const CodeModal = ({ isOpen, onClose, onSubmit }) => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        onSubmit({ code, language });
        onClose();
        setCode('');
        setLanguage('javascript');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <motion.div
                    className="bg-card border border-border/50 rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                >
                    <div className="p-5 border-b border-border/50 flex items-center justify-between bg-wa-accent/5 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-wa-accent/10 flex items-center justify-center">
                                <Terminal className="w-5 h-5 text-wa-accent" />
                            </div>
                            <h2 className="text-xl font-bold text-wa-text-primary">Send Code Snippet</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-wa-text-secondary"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 overflow-hidden">
                        <div className="mb-6 space-y-2">
                            <label className="text-sm font-bold text-wa-text-primary ml-1 uppercase tracking-wider">
                                Language
                            </label>
                            <div className="relative">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-5 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:border-wa-accent focus:ring-1 focus:ring-wa-accent/20 outline-none transition-all font-medium appearance-none cursor-pointer"
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang} value={lang}>
                                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-wa-text-secondary">
                                    <Code size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[300px] mb-6 space-y-2 flex flex-col">
                            <label className="text-sm font-bold text-wa-text-primary ml-1 uppercase tracking-wider">
                                Code
                            </label>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Paste your code here..."
                                className="flex-1 w-full px-5 py-5 rounded-2xl bg-muted/50 border border-border/50 focus:border-wa-accent focus:ring-1 focus:ring-wa-accent/20 outline-none text-wa-text-primary font-mono text-sm resize-none scrollbar-custom"
                                spellCheck="false"
                            />
                        </div>

                        <button
                            type="submit"
                            className="flex-shrink-0 w-full py-4 rounded-2xl bg-wa-accent text-white font-bold text-lg shadow-xl shadow-wa-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Send Code
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CodeModal;
