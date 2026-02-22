import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Camera, Check, User, Mail, Info,
    Eye, Bell, Shield, Smartphone, Globe, Lock, Cake,
    Palette, MessageSquare, ShieldCheck, Key, RefreshCw, Link as LinkIcon, Monitor, Trash2
} from 'lucide-react';
import BarcodeScanner from 'react-qr-barcode-scanner';
import { useAuth } from '../context/AuthContext';
import { useVibe } from '../context/VibeContext';
import { generateKeyPair, getMyPublicKey } from '../utils/crypto';
import { getLinkedDevices, removeDevice, authorizeQrSession } from '../services/deviceAPI';

const SettingsPanel = ({ isOpen, onClose }) => {
    const { user, updateProfile, updateSettings, syncContacts } = useAuth();
    const { activeVibe, setActiveVibe, vibes } = useVibe();

    const [activeTab, setActiveTab] = useState('profile'); // profile, appearance, privacy, security, devices
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [loadingDevices, setLoadingDevices] = useState(false);

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [birthday, setBirthday] = useState(user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    // Settings State
    const [settings, setSettings] = useState(user?.settings || {
        readReceipts: true,
        lastSeenVisibility: 'everyone',
        profilePhotoVisibility: 'everyone',
        notifications: true,
        syncContactsEnabled: false
    });

    const [chatBg, setChatBg] = useState(() => localStorage.getItem("samvaad-chatbg") || "default");
    const [publicKey, setPublicKey] = useState(getMyPublicKey());

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
                setIsEditingProfile(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        const result = await updateProfile({
            name,
            bio,
            birthday,
            avatar: avatarPreview || undefined
        });
        if (result.success) {
            setIsEditingProfile(false);
            setAvatarPreview(null);
        }
        setSavingProfile(false);
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

    const handleBgChange = (bgId) => {
        setChatBg(bgId);
        localStorage.setItem("samvaad-chatbg", bgId);
        // Distribute event for UI update if needed, but Context or re-render is better
        window.dispatchEvent(new CustomEvent('chat-bg-changed', { detail: bgId }));
    };

    const handleRegenerateKeys = async () => {
        if (confirm("Regenerating keys will make your previous encrypted messages unreadable. Continue?")) {
            const newPubKey = await generateKeyPair();
            setPublicKey(newPubKey);
            // Optionally update public key on server
            alert("New E2EE keys generated and stored safely.");
        }
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
                    const newSettings = { ...settings, syncContactsEnabled: true };
                    setSettings(newSettings);
                    await updateSettings(newSettings);
                }
            }
        } catch (err) {
            console.error('Contact selection failed:', err);
        }
    };

    const BG_OPTIONS = [
        { id: "default", label: "Default", cls: "chatbg-default" },
        { id: "gradient", label: "Gradient", cls: "chatbg-gradient" },
        { id: "midnight", label: "Midnight", cls: "chatbg-midnight" },
        { id: "ocean", label: "Ocean", cls: "chatbg-ocean" },
        { id: "forest", label: "Forest", cls: "chatbg-forest" },
        { id: "doodle", label: "Pattern", cls: "chatbg-doodle" },
    ];

    const fetchDevices = async () => {
        setLoadingDevices(true);
        try {
            const res = await getLinkedDevices();
            if (res.success) setLinkedDevices(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoadingDevices(false);
    };

    useEffect(() => {
        if (activeTab === 'devices') {
            fetchDevices();
        }
    }, [activeTab]);

    const handleRemoveDevice = async (deviceId) => {
        if (confirm("Disconnect this device? You will be logged out on that session.")) {
            const res = await removeDevice(deviceId);
            if (res.success) {
                setLinkedDevices(prev => prev.filter(d => d._id !== deviceId));
            }
        }
    };

    const onScan = async (err, result) => {
        if (result) {
            try {
                const data = JSON.parse(result.text);
                if (data.type === 'linking_session' && data.sessionId) {
                    setIsScanning(false);
                    const res = await authorizeQrSession(data.sessionId, {
                        deviceName: `${navigator.platform} Mobile`,
                        deviceType: 'Web/Mobile',
                        browser: navigator.userAgent,
                        os: navigator.platform
                    });
                    if (res.success) {
                        alert("Device linked successfully!");
                        fetchDevices();
                    }
                }
            } catch (err) {
                console.error("Invalid QR code");
            }
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'appearance', label: 'Theme', icon: Palette },
        { id: 'privacy', label: 'Privacy', icon: Eye },
        { id: 'security', label: 'Security', icon: ShieldCheck },
        { id: 'devices', label: 'Linked', icon: LinkIcon },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="fixed top-0 right-0 h-full z-[101] shadow-2xl flex flex-col overflow-hidden"
                        style={{
                            width: 'min(100vw, 450px)',
                            background: 'hsl(var(--sv-surface))',
                            borderLeft: '1px solid hsl(var(--sv-border))'
                        }}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-6 border-b" style={{ borderColor: 'hsl(var(--sv-border) / 0.5)' }}>
                            <div>
                                <h2 className="text-xl font-black tracking-tight" style={{ color: 'hsl(var(--sv-text))' }}>Settings</h2>
                                <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Personalize your experience</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-1 px-4 py-3 bg-black/10 border-b" style={{ borderColor: 'hsl(var(--sv-border) / 0.3)' }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-sv-accent text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <tab.icon size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-custom p-6">
                            <AnimatePresence mode="wait">
                                {activeTab === 'profile' && (
                                    <motion.div
                                        key="profile"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="relative group">
                                                <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 bg-sv-accent/5 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:rounded-2xl"
                                                    style={{ borderColor: 'hsl(var(--sv-accent) / 0.2)' }}>
                                                    {avatarPreview || avatar ? (
                                                        <img src={avatarPreview || avatar} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={60} className="text-sv-accent/20" />
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-sv-accent text-white flex items-center justify-center shadow-xl border-4 border-sv-surface hover:scale-110 active:scale-95 transition-all"
                                                >
                                                    <Camera size={20} />
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                            <div className="mt-6 text-center">
                                                <h3 className="text-2xl font-black" style={{ color: 'hsl(var(--sv-text))' }}>{user?.name}</h3>
                                                <p className="text-xs font-medium opacity-40 flex items-center gap-2 justify-center mt-1">
                                                    <Mail size={12} className="text-sv-accent" /> {user?.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        className="sv-input w-full py-4 px-5 rounded-2xl text-sm font-bold bg-white/5 border-transparent focus:bg-white/10 group-focus-within:border-sv-accent/50 transition-all"
                                                        value={name}
                                                        onChange={(e) => { setName(e.target.value); setIsEditingProfile(true); }}
                                                        placeholder="Your name"
                                                    />
                                                    <User size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-sv-accent" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Birthday</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        className="sv-input w-full py-4 px-5 rounded-2xl text-sm font-bold bg-white/5 border-transparent focus:bg-white/10 transition-all"
                                                        value={birthday}
                                                        onChange={(e) => { setBirthday(e.target.value); setIsEditingProfile(true); }}
                                                    />
                                                    <Cake size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">About Me</label>
                                                <div className="relative">
                                                    <textarea
                                                        className="sv-input w-full py-4 px-5 rounded-2xl text-sm font-bold bg-white/5 border-transparent focus:bg-white/10 transition-all resize-none h-24"
                                                        value={bio}
                                                        onChange={(e) => { setBio(e.target.value); setIsEditingProfile(true); }}
                                                        placeholder="Status..."
                                                    />
                                                    <Info size={16} className="absolute right-5 top-5 text-white/20" />
                                                </div>
                                            </div>

                                            {isEditingProfile && (
                                                <motion.button
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    onClick={handleSaveProfile}
                                                    disabled={savingProfile}
                                                    className="w-full py-5 rounded-[24px] bg-sv-accent text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-sv-accent/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
                                                >
                                                    {savingProfile ? (
                                                        <RefreshCw size={18} className="animate-spin" />
                                                    ) : (
                                                        <><Check size={20} /> Update Profile</>
                                                    )}
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'appearance' && (
                                    <motion.div
                                        key="appearance"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Interface Vibe</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {vibes.map((v) => (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => setActiveVibe(v.id)}
                                                        className={`p-4 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all relative overflow-hidden ${activeVibe === v.id ? 'border-sv-accent bg-sv-accent/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                                                    >
                                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `hsl(${v.colors.accent})`, color: 'white' }}>
                                                            <Palette size={20} />
                                                        </div>
                                                        <span className="text-[11px] font-black uppercase tracking-tighter">{v.name}</span>
                                                        {activeVibe === v.id && (
                                                            <div className="absolute top-2 right-2">
                                                                <Check size={14} className="text-sv-accent" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Chat Wallpaper</h4>
                                            <div className="grid grid-cols-3 gap-2">
                                                {BG_OPTIONS.map((bg) => (
                                                    <button
                                                        key={bg.id}
                                                        onClick={() => handleBgChange(bg.id)}
                                                        className={`relative h-20 rounded-2xl overflow-hidden transition-all group ${chatBg === bg.id ? 'ring-2 ring-sv-accent ring-offset-2 ring-offset-transparent' : 'hover:scale-[1.02]'}`}
                                                    >
                                                        <div className={`absolute inset-0 ${bg.cls}`} />
                                                        <div className="absolute inset-x-0 bottom-0 py-1.5 bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[8px] font-black uppercase tracking-tighter text-white">{bg.label}</span>
                                                        </div>
                                                        {chatBg === bg.id && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-sv-accent/20">
                                                                <Check size={16} className="text-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'privacy' && (
                                    <motion.div
                                        key="privacy"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="p-5 rounded-[28px] bg-white/5 border border-white/5 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner">
                                                        <Shield size={22} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black" style={{ color: 'hsl(var(--sv-text))' }}>Read Receipts</p>
                                                        <p className="text-[11px] font-medium opacity-40 leading-tight">Don't let others know when you read their messages.</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleSetting('readReceipts')}
                                                    className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.readReceipts ? 'bg-sv-accent' : 'bg-white/10'}`}
                                                >
                                                    <motion.div
                                                        className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-lg"
                                                        animate={{ x: settings.readReceipts ? 28 : 0 }}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-5 rounded-[28px] bg-white/5 border border-white/5 space-y-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shadow-inner">
                                                    <Eye size={22} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black" style={{ color: 'hsl(var(--sv-text))' }}>Last Seen Status</p>
                                                    <p className="text-[11px] font-medium opacity-40">Choose who can see your online history.</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['everyone', 'contacts', 'nobody'].map((option) => (
                                                    <button
                                                        key={option}
                                                        onClick={() => changeVisibility('lastSeenVisibility', option)}
                                                        className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${settings.lastSeenVisibility === option
                                                            ? 'bg-sv-accent text-white border-sv-accent shadow-xl shadow-sv-accent/20'
                                                            : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-5 rounded-[28px] bg-white/5 border border-white/5 flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shadow-inner">
                                                    <Bell size={22} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black" style={{ color: 'hsl(var(--sv-text))' }}>Push Notifications</p>
                                                    <p className="text-[11px] font-medium opacity-40 leading-tight">Get alerted for new messages instantly.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleSetting('notifications')}
                                                className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.notifications ? 'bg-sv-accent' : 'bg-white/10'}`}
                                            >
                                                <motion.div
                                                    className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-lg"
                                                    animate={{ x: settings.notifications ? 28 : 0 }}
                                                />
                                            </button>
                                        </div>

                                        <div className="p-5 rounded-[28px] bg-green-500/5 border border-green-500/10 space-y-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center shadow-inner">
                                                    <Smartphone size={22} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-green-500">Device Contact Sync</p>
                                                    <p className="text-[11px] font-medium text-green-500/50 leading-tight">Strict mode: only message people from your contacts.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleSyncDeviceContacts}
                                                className="w-full py-4 rounded-2xl bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all border border-green-500/20 flex items-center justify-center gap-3"
                                            >
                                                <Globe size={16} /> Import System Contacts
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'security' && (
                                    <motion.div
                                        key="security"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="p-6 rounded-[32px] bg-sv-accent/5 border border-sv-accent/10 space-y-6">
                                            <div className="flex flex-col items-center text-center gap-4">
                                                <div className="w-20 h-20 rounded-[30px] bg-sv-accent/20 text-sv-accent flex items-center justify-center animate-pulse">
                                                    <ShieldCheck size={40} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black italic tracking-tighter text-sv-accent">End-to-End Encryption</h3>
                                                    <p className="text-xs font-medium text-white/40 mt-1 max-w-[280px]">Your messages are secured with military-grade ECDH & AES-256 protocols.</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                                                        <Key size={10} className="text-sv-accent" /> Your Identity Public Key
                                                    </label>
                                                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-[10px] break-all opacity-70 leading-relaxed">
                                                        {publicKey ? JSON.stringify(publicKey) : "No key generated yet"}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleRegenerateKeys}
                                                    className="w-full py-4 rounded-2xl bg-white/5 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-3"
                                                >
                                                    <RefreshCw size={14} /> Regenerate Secure Keys
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-5 rounded-[28px] bg-white/5 border border-white/5">
                                            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shadow-inner">
                                                <Lock size={22} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black">Zero-Knowledge Storage</p>
                                                <p className="text-[11px] font-medium opacity-40 leading-tight">Samvaad servers never see your private keys or plain-text messages.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {activeTab === 'devices' && (
                                    <motion.div
                                        key="devices"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex flex-col items-center text-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-[24px] bg-sv-accent/10 text-sv-accent flex items-center justify-center">
                                                <Monitor size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black tracking-tight" style={{ color: 'hsl(var(--sv-text))' }}>Linked Devices</h3>
                                                <p className="text-xs font-medium opacity-40">Manage your active sessions on other devices.</p>
                                            </div>
                                        </div>

                                        {isScanning ? (
                                            <div className="space-y-4">
                                                <div className="relative aspect-square rounded-[32px] overflow-hidden border-4 border-sv-accent/20 bg-black">
                                                    <BarcodeScanner
                                                        onUpdate={onScan}
                                                        width="100%"
                                                        height="100%"
                                                    />
                                                    <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="w-48 h-48 border-2 border-sv-accent rounded-2xl animate-pulse" />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setIsScanning(false)}
                                                    className="w-full py-4 rounded-2xl bg-white/5 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Cancel Scan
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setIsScanning(true)}
                                                    className="w-full py-5 rounded-[24px] bg-sv-accent text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-sv-accent/30 flex items-center justify-center gap-3 active:scale-95 transition-all group"
                                                >
                                                    <Smartphone size={20} className="group-hover:rotate-12 transition-transform" /> Link a Device
                                                </button>

                                                <div className="space-y-3 mt-8">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Active Sessions</h4>
                                                    {loadingDevices ? (
                                                        <div className="py-10 flex flex-col items-center gap-3 opacity-20">
                                                            <RefreshCw size={24} className="animate-spin" />
                                                            <span className="text-[10px] font-bold uppercase">Loading...</span>
                                                        </div>
                                                    ) : linkedDevices.length > 0 ? (
                                                        linkedDevices.map((device) => (
                                                            <div key={device._id} className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-sv-accent transition-colors">
                                                                        {device.deviceType === 'Mobile' ? <Smartphone size={18} /> : <Monitor size={18} />}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-white">{device.deviceName || 'Unknown Device'}</p>
                                                                        <p className="text-[10px] opacity-40 font-medium">{device.os} • {new Date(device.lastActive).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveDevice(device._id)}
                                                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white/20 hover:text-sv-danger hover:bg-sv-danger/10 transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="py-12 flex flex-col items-center text-center gap-4 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                                                            <Monitor size={32} className="opacity-10" />
                                                            <p className="text-[11px] font-medium opacity-30 px-10">No other devices linked. Link your laptop to access Samvaad on the web.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SettingsPanel;
