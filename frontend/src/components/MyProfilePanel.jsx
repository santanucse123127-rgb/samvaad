import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Camera, Check, User, Mail, Info,
    Eye, Bell, Shield, Smartphone, Globe, Lock, Cake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MyProfilePanel = ({ isOpen, onClose }) => {
    const { user, updateProfile, updateSettings, syncContacts } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [birthday, setBirthday] = useState(user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState(user?.settings || {
        readReceipts: true,
        lastSeenVisibility: 'everyone',
        profilePhotoVisibility: 'everyone',
        notifications: true,
        syncContactsEnabled: false
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setBio(user.bio || '');
            setBirthday(user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '');
            setAvatar(user.avatar || '');
            setSettings(user.settings || {
                readReceipts: true,
                lastSeenVisibility: 'everyone',
                profilePhotoVisibility: 'everyone',
                notifications: true,
                syncContactsEnabled: false
            });
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        const result = await updateProfile({
            name,
            bio,
            birthday,
            avatar: avatarPreview || undefined
        });
        if (result.success) {
            setIsEditing(false);
            setAvatarPreview(null);
        }
        setSaving(false);
    };

    const toggleSetting = async (key) => {
        const newVal = !settings[key];
        const newSettings = { ...settings, [key]: newVal };
        setSettings(newSettings);
        await updateSettings(newSettings);
    };

    const changeVisibility = async (key, val) => {
        const newSettings = { ...settings, [key]: val };
        setSettings(newSettings);
        await updateSettings(newSettings);
    };

    const handleSyncDeviceContacts = async () => {
        if (!('contacts' in navigator && 'ContactsManager' in window)) {
            alert('Contact sync is only supported on mobile browsers (Chrome/Android).');
            return;
        }

        try {
            const props = ['name', 'email', 'tel'];
            const opts = { multiple: true };
            const contacts = await navigator.contacts.select(props, opts);

            if (contacts.length > 0) {
                const result = await syncContacts(contacts);
                if (result.success) {
                    // Update sync setting to true automatically
                    const newSettings = { ...settings, syncContactsEnabled: true };
                    setSettings(newSettings);
                    await updateSettings(newSettings);
                }
            }
        } catch (err) {
            console.error('Contact selection failed:', err);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="fixed top-0 right-0 h-full z-[101] shadow-2xl border-l flex flex-col"
                        style={{
                            width: 'min(95vw, 400px)',
                            background: 'hsl(var(--sv-surface))',
                            borderColor: 'hsl(var(--sv-border))'
                        }}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'hsl(var(--sv-border) / 0.5)' }}>
                            <h2 className="text-xl font-bold" style={{ color: 'hsl(var(--sv-text))' }}>My Profile</h2>
                            <button
                                onClick={onClose}
                                className="sv-icon-btn w-9 h-9 rounded-xl transition-transform active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-custom pb-8 px-6 pt-6">
                            {/* Profile Image Section */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 bg-wa-accent/5 flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-[1.02]"
                                        style={{ borderColor: 'hsl(var(--sv-accent) / 0.2)' }}>
                                        {avatarPreview || avatar ? (
                                            <img src={avatarPreview || avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={60} className="text-wa-accent/20" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-wa-accent text-white flex items-center justify-center shadow-lg border-4 border-wa-surface hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <Camera size={18} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="mt-4 text-center">
                                    <h3 className="text-lg font-bold" style={{ color: 'hsl(var(--sv-text))' }}>{user?.name}</h3>
                                    <p className="text-sm" style={{ color: 'hsl(var(--sv-text-3))' }}>{user?.email}</p>
                                </div>
                            </div>

                            {/* Editable Fields */}
                            <div className="space-y-6 mb-10">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black tracking-widest uppercase text-wa-text-secondary px-1 flex items-center gap-2">
                                        <User size={12} className="text-wa-accent" /> Full Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="sv-input w-full py-3.5 px-4 pr-12 text-sm font-medium"
                                            value={name}
                                            onChange={(e) => { setName(e.target.value); setIsEditing(true); }}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black tracking-widest uppercase text-wa-text-secondary px-1 flex items-center gap-2">
                                        <Cake size={12} className="text-wa-accent" /> Birthday
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            className="sv-input w-full py-3.5 px-4 text-sm font-medium"
                                            value={birthday}
                                            onChange={(e) => { setBirthday(e.target.value); setIsEditing(true); }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black tracking-widest uppercase text-wa-text-secondary px-1 flex items-center gap-2">
                                        <Info size={12} className="text-wa-accent" /> About / Bio
                                    </label>
                                    <textarea
                                        className="sv-input w-full py-3 px-4 text-sm font-medium resize-none leading-relaxed"
                                        rows={3}
                                        value={bio}
                                        onChange={(e) => { setBio(e.target.value); setIsEditing(true); }}
                                        placeholder="Tell something about yourself..."
                                    />
                                </div>

                                <AnimatePresence>
                                    {(isEditing || avatarPreview) && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="w-full py-4 rounded-2xl bg-wa-accent text-white font-bold shadow-lg shadow-wa-accent/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><Check size={18} /> Save Profile Changes</>
                                            )}
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Settings Section */}
                            <div className="space-y-6 pt-6 border-t" style={{ borderColor: 'hsl(var(--sv-border) / 0.5)' }}>
                                <h4 className="text-xs font-black tracking-widest uppercase text-wa-text-secondary mb-4 px-1">Settings & Privacy</h4>

                                {/* Read Receipts */}
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-wa-surface-2/5 border border-wa-border/30 hover:bg-wa-surface-2/10 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Lock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: 'hsl(var(--sv-text))' }}>Read Receipts</p>
                                            <p className="text-[11px] font-medium" style={{ color: 'hsl(var(--sv-text-3))' }}>If turned off, you won't see read receipts from others.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting('readReceipts')}
                                        className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${settings.readReceipts ? 'bg-wa-accent' : 'bg-gray-300'}`}
                                    >
                                        <motion.div
                                            className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                            animate={{ x: settings.readReceipts ? 24 : 0 }}
                                        />
                                    </button>
                                </div>

                                {/* Last Seen Visibility */}
                                <div className="p-4 rounded-2xl bg-wa-surface-2/5 border border-wa-border/30">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                            <Eye size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: 'hsl(var(--sv-text))' }}>Last Seen Visibility</p>
                                            <p className="text-[11px] font-medium" style={{ color: 'hsl(var(--sv-text-3))' }}>Who can see when you were last online.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['everyone', 'contacts', 'nobody'].map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => changeVisibility('lastSeenVisibility', option)}
                                                className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${settings.lastSeenVisibility === option
                                                    ? 'bg-wa-accent text-white border-wa-accent shadow-md shadow-wa-accent/20'
                                                    : 'bg-wa-surface-3 border-wa-border text-wa-text-secondary hover:border-wa-accent/40'
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-wa-surface-2/5 border border-wa-border/30 hover:bg-wa-surface-2/10 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Bell size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: 'hsl(var(--sv-text))' }}>Notifications</p>
                                            <p className="text-[11px] font-medium" style={{ color: 'hsl(var(--sv-text-3))' }}>Enable or disable message notifications.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting('notifications')}
                                        className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${settings.notifications ? 'bg-wa-accent' : 'bg-gray-300'}`}
                                    >
                                        <motion.div
                                            className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                            animate={{ x: settings.notifications ? 24 : 0 }}
                                        />
                                    </button>
                                </div>

                                {/* Sync Device Contacts */}
                                <div className="p-4 rounded-2xl bg-wa-surface-2/5 border border-wa-border/30 hover:bg-wa-surface-2/10 transition-colors group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Smartphone size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold" style={{ color: 'hsl(var(--sv-text))' }}>Sync Device Contacts</p>
                                                <p className="text-[11px] font-medium" style={{ color: 'hsl(var(--sv-text-3))' }}>Only message people from your phone.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleSetting('syncContactsEnabled')}
                                            className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${settings.syncContactsEnabled ? 'bg-wa-accent' : 'bg-gray-300'}`}
                                        >
                                            <motion.div
                                                className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                                animate={{ x: settings.syncContactsEnabled ? 24 : 0 }}
                                            />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSyncDeviceContacts}
                                        className="w-full py-2.5 rounded-xl border border-wa-accent/30 text-wa-accent text-xs font-bold hover:bg-wa-accent/5 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Globe size={14} /> Import from Device
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MyProfilePanel;
