import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette, Eye, ShieldCheck, Link as LinkIcon,
    Monitor, Smartphone, ChevronRight, Lock,
    Bell, Globe, RefreshCw, Trash2, Key, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVibe } from '../../context/VibeContext';
import { getLinkedDevices, removeDevice } from '../../services/deviceAPI';
import { generateKeyPair, getMyPublicKey } from '../../utils/crypto';

const SettingsSidebarPanel = () => {
    const { user, updateSettings, syncContacts, logout, updateAppLock } = useAuth();
    const { activeVibe, setActiveVibe, vibes } = useVibe();
    const [activeSection, setActiveSection] = useState('menu'); // menu, theme, privacy, security, devices
    const [linkedDevices, setLinkedDevices] = useState([]);
    const [loadingDevices, setLoadingDevices] = useState(false);

    // Local copy of settings for toggles
    const [settings, setSettings] = useState(user?.settings || {
        readReceipts: true,
        lastSeenVisibility: 'everyone',
        notifications: true,
        syncContactsEnabled: false
    });

    useEffect(() => {
        if (user?.settings) setSettings(user.settings);
    }, [user?.settings]);

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

    const fetchDevices = async () => {
        setLoadingDevices(true);
        try {
            const res = await getLinkedDevices();
            if (res.success) setLinkedDevices(res.data);
        } catch (err) { console.error(err); }
        setLoadingDevices(false);
    };

    useEffect(() => {
        if (activeSection === 'devices') fetchDevices();
    }, [activeSection]);

    const handleRemoveDevice = async (deviceId) => {
        if (confirm("Disconnect this device?")) {
            const res = await removeDevice(deviceId);
            if (res.success) {
                setLinkedDevices(prev => prev.filter(d => d._id !== deviceId));
            }
        }
    };

    const menuItems = [
        { id: 'theme', label: 'Theme & Appearance', icon: Palette, color: 'text-purple-400' },
        { id: 'privacy', label: 'Privacy', icon: Eye, color: 'text-blue-400' },
        { id: 'security', label: 'Security & E2EE', icon: ShieldCheck, color: 'text-green-400' },
        { id: 'devices', label: 'Linked Devices', icon: LinkIcon, color: 'text-orange-400' },
    ];

    const BG_OPTIONS = [
        { id: "default", label: "Default", cls: "chatbg-default" },
        { id: "gradient", label: "Gradient", cls: "chatbg-gradient" },
        { id: "midnight", label: "Midnight", cls: "chatbg-midnight" },
        { id: "ocean", label: "Ocean", cls: "chatbg-ocean" },
        { id: "forest", label: "Forest", cls: "chatbg-forest" },
        { id: "doodle", label: "Pattern", cls: "chatbg-doodle" },
    ];

    const currentChatBg = localStorage.getItem("samvaad-chatbg") || "default";

    const handleBgChange = (bgId) => {
        localStorage.setItem("samvaad-chatbg", bgId);
        window.dispatchEvent(new CustomEvent('chat-bg-changed', { detail: bgId }));
    };

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            <AnimatePresence mode="wait">
                {activeSection === 'menu' ? (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col p-4 space-y-2 mt-4"
                    >
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                        <item.icon size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-white/80">{item.label}</span>
                                </div>
                                <ChevronRight size={18} className="text-white/20" />
                            </button>
                        ))}

                        <div className="h-px bg-white/5 my-6" />

                        <button
                            onClick={logout}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <Trash2 size={20} />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">Logout Session</span>
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col h-full"
                    >
                        {/* Sub-header */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
                            <button
                                onClick={() => setActiveSection('menu')}
                                className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
                            >
                                <ChevronRight size={20} className="rotate-180" />
                            </button>
                            <h3 className="text-sm font-black uppercase tracking-widest">
                                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-custom p-6">
                            {/* Theme Section */}
                            {activeSection === 'theme' && (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Vibe Filter</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {vibes.map(v => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => setActiveVibe(v.id)}
                                                    className={`p-4 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${activeVibe === v.id ? 'border-sv-accent bg-sv-accent/10' : 'border-white/5 bg-white/5'}`}
                                                >
                                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `hsl(${v.colors.accent})`, color: 'white' }}>
                                                        <Palette size={20} />
                                                    </div>
                                                    <span className="text-[11px] font-black uppercase tracking-tighter">{v.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Wallpaper</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {BG_OPTIONS.map(bg => (
                                                <button
                                                    key={bg.id}
                                                    onClick={() => handleBgChange(bg.id)}
                                                    className={`h-16 rounded-xl overflow-hidden relative transition-all ${currentChatBg === bg.id ? 'ring-2 ring-sv-accent' : ''}`}
                                                >
                                                    <div className={`absolute inset-0 ${bg.cls}`} />
                                                    {currentChatBg === bg.id && <div className="absolute inset-0 flex items-center justify-center bg-sv-accent/20"><Check size={14} className="text-white" /></div>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Privacy Section */}
                            {activeSection === 'privacy' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div>
                                            <p className="text-sm font-bold">Read Receipts</p>
                                            <p className="text-[11px] text-white/40">Don't show when you read messages.</p>
                                        </div>
                                        <button
                                            onClick={() => toggleSetting('readReceipts')}
                                            className={`w-12 h-6 rounded-full relative transition-all ${settings.readReceipts ? 'bg-sv-accent' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${settings.readReceipts ? 'translate-x-6' : ''}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div>
                                            <p className="text-sm font-bold">Notifications</p>
                                            <p className="text-[11px] text-white/40">Push alerts for new messages.</p>
                                        </div>
                                        <button
                                            onClick={() => toggleSetting('notifications')}
                                            className={`w-12 h-6 rounded-full relative transition-all ${settings.notifications ? 'bg-sv-accent' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${settings.notifications ? 'translate-x-6' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Security Section */}
                            {activeSection === 'security' && (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-sv-accent/5 border border-sv-accent/10 flex flex-col items-center text-center gap-4">
                                        <div className="w-16 h-16 rounded-3xl bg-sv-accent/20 flex items-center justify-center text-sv-accent">
                                            <Lock size={32} />
                                        </div>
                                        <h4 className="text-lg font-black italic tracking-tighter text-sv-accent">Secure Messaging</h4>
                                        <p className="text-xs text-white/40">Your account is secured with End-to-End Encryption.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">App Lock</p>
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 transition-all">
                                            <div className="flex items-center gap-3">
                                                <Key size={18} className="text-sv-accent" />
                                                <span className="text-sm font-bold">App Lock (PIN)</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (!user?.appLock?.enabled) {
                                                        const pin = prompt("Enter a 6-digit PIN:");
                                                        if (pin && pin.length === 6) {
                                                            updateAppLock({ enabled: true, pin });
                                                        } else if (pin) {
                                                            alert("PIN must be 6 digits");
                                                        }
                                                    } else {
                                                        updateAppLock({ enabled: false });
                                                    }
                                                }}
                                                className={`w-12 h-6 rounded-full relative transition-all ${user?.appLock?.enabled ? 'bg-sv-accent' : 'bg-white/10'}`}
                                            >
                                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${user?.appLock?.enabled ? 'translate-x-6' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <button className="w-full py-4 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                        <RefreshCw size={14} /> Regenerate E2EE Keys
                                    </button>
                                </div>
                            )}

                            {/* Devices Section */}
                            {activeSection === 'devices' && (
                                <div className="space-y-4">
                                    {loadingDevices ? (
                                        <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-sv-accent" /></div>
                                    ) : linkedDevices.length > 0 ? (
                                        linkedDevices.map(device => (
                                            <div key={device._id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    {device.deviceType === 'Mobile' ? <Smartphone size={18} className="text-white/40" /> : <Monitor size={18} className="text-white/40" />}
                                                    <div>
                                                        <p className="text-xs font-bold">{device.deviceName}</p>
                                                        <p className="text-[10px] text-white/30">{device.os}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleRemoveDevice(device._id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-xl transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-xs text-white/20 py-20">No other active sessions.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SettingsSidebarPanel;
