import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Check, Upload, Palette } from 'lucide-react';

const stockBackgrounds = [
    { id: 'classic', name: 'Classic Doodle', type: 'class', value: 'classic' },
    { id: 'dark', name: 'Premium Dark', type: 'class', value: 'dark' },
    { id: 'glass', name: 'Glassmorphism', type: 'class', value: 'glass' },
    { id: 'solid-1', name: 'Desert Sun', type: 'color', value: '#e2725b' },
    { id: 'solid-2', name: 'Deep Ocean', type: 'color', value: '#1b4d3e' },
    { id: 'solid-3', name: 'Midnight Purple', type: 'color', value: '#2e1a47' },
    { id: 'stock-1', name: 'Nature', type: 'image', value: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop' },
    { id: 'stock-2', name: 'Abstract', type: 'image', value: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop' },
];

const WallpaperModal = ({ isOpen, onClose, currentWallpaper, onSelect, conversationId }) => {
    const fileInputRef = useRef();

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onSelect(conversationId, { type: 'custom-image', value: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-card border border-border/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-border/10 flex items-center justify-between bg-card/50 backdrop-blur-xl">
                        <div>
                            <h2 className="text-xl font-black text-wa-text-primary tracking-tight">Chat Background</h2>
                            <p className="text-sm text-wa-text-secondary font-medium">Personalize this heartbeat</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 scrollbar-custom">
                        {/* Custom Upload Block */}
                        <div className="mb-8">
                            <h3 className="text-[12px] font-black text-wa-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Upload size={14} /> From Gallery
                            </h3>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-32 rounded-3xl border-2 border-dashed border-border/20 hover:border-wa-accent/40 hover:bg-wa-accent/5 transition-all flex flex-col items-center justify-center gap-2 group"
                            >
                                <div className="w-10 h-10 rounded-full bg-wa-accent/10 flex items-center justify-center text-wa-accent group-hover:scale-110 transition-transform">
                                    <ImageIcon size={20} />
                                </div>
                                <span className="text-sm font-bold text-wa-text-primary">Choose your own heartbeat image</span>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                            </button>
                        </div>

                        {/* Stock Options */}
                        <div>
                            <h3 className="text-[12px] font-black text-wa-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Palette size={14} /> Stock Heartbeats
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {stockBackgrounds.map((bg) => {
                                    const isSelected = typeof currentWallpaper === 'string'
                                        ? currentWallpaper === bg.value
                                        : currentWallpaper.id === bg.id;

                                    return (
                                        <button
                                            key={bg.id}
                                            onClick={() => onSelect(conversationId, bg)}
                                            className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${isSelected ? 'border-wa-accent scale-95 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                        >
                                            {bg.type === 'class' && (
                                                <div className={`w-full h-full chat-bg-${bg.value} flex items-center justify-center`}>
                                                    {bg.value === 'classic' && <div className="wallpaper-doodle opacity-20" />}
                                                    <span className="text-[10px] font-black uppercase text-wa-text-secondary">{bg.name}</span>
                                                </div>
                                            )}
                                            {bg.type === 'color' && (
                                                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: bg.value }}>
                                                    <span className="text-[10px] font-black uppercase text-white/50">{bg.name}</span>
                                                </div>
                                            )}
                                            {bg.type === 'image' && (
                                                <div className="w-full h-full relative">
                                                    <img src={bg.value} className="w-full h-full object-cover" alt="" />
                                                    <div className="absolute inset-0 bg-black/20" />
                                                    <span className="absolute bottom-2 left-2 text-[10px] font-black uppercase text-white">{bg.name}</span>
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-wa-accent text-white flex items-center justify-center shadow-lg">
                                                    <Check size={14} strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default WallpaperModal;
