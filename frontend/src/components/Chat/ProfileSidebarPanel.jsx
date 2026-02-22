import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Edit2, Copy, Check, User, Info, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from './Avatar';

const ProfileSidebarPanel = () => {
    const { user, updateProfile } = useAuth();
    const [isEditingName, setIsEditingName] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    const handleNameUpdate = async () => {
        if (name.trim() === user?.name) {
            setIsEditingName(false);
            return;
        }
        setSaving(true);
        await updateProfile({ name });
        setSaving(false);
        setIsEditingName(false);
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            await updateProfile({ avatar: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
    };

    return (
        <div className="flex flex-col h-full bg-transparent overflow-y-auto scrollbar-custom">
            <div className="flex flex-col items-center py-10 px-6">
                <div className="relative group mb-8">
                    <Avatar
                        src={user?.avatar}
                        name={user?.name}
                        size={40}
                        className="transition-transform duration-500 group-hover:scale-[1.02] border-4 border-white/5"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-sv-accent text-white flex items-center justify-center shadow-lg border-4 border-[#1a1a1b] hover:scale-110 transition-all"
                    >
                        <Camera size={18} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                </div>

                <div className="w-full space-y-8">
                    {/* Name Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1">Your Name</label>
                        <div className="flex items-center justify-between group">
                            {isEditingName ? (
                                <div className="flex items-center gap-2 w-full">
                                    <input
                                        autoFocus
                                        className="bg-white/5 border-b border-sv-accent focus:outline-none py-1 text-lg font-bold w-full"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
                                    />
                                    <button onClick={handleNameUpdate} className="text-sv-accent">
                                        <Check size={18} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg font-bold text-white tracking-tight">{user?.name}</h3>
                                    <button
                                        onClick={() => setIsEditingName(true)}
                                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/5 rounded-lg transition-all"
                                    >
                                        <Edit2 size={16} className="text-white/40" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1">About</label>
                        <div className="flex items-center justify-between group">
                            <p className="text-sm font-medium text-white/60 italic">~{user?.bio || "Hey there! I am using Samvaad."}</p>
                            <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/5 rounded-lg transition-all">
                                <Edit2 size={16} className="text-white/40" />
                            </button>
                        </div>
                    </div>

                    {/* Phone Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1">Phone</label>
                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <Smartphone size={16} className="text-sv-accent" />
                                <span className="text-sm font-bold text-white/80">{user?.phone || "+91 747 939 6219"}</span>
                            </div>
                            <button
                                onClick={() => copyToClipboard(user?.phone || "+91 747 939 6219")}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all"
                            >
                                <Copy size={16} className="text-white/40" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSidebarPanel;
