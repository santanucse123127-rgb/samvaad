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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-900/20 to-blue-900/20 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-purple-400" />
                            <h2 className="text-xl font-bold text-white">Send Code Snippet</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 overflow-hidden">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none text-white"
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang} value={lang}>
                                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-h-[200px] mb-4">
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Code
                            </label>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Paste your code here..."
                                className="w-full h-full px-4 py-4 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none text-white font-mono text-sm resize-none scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                                spellCheck="false"
                            />
                        </div>

                        <button
                            type="submit"
                            className="flex-shrink-0 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all active:scale-95"
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
