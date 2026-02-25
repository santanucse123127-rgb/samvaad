import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Reusable Icons ────────────────────────────────────────────────────────────
const Ico = {
    back: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>,
    user: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    bell: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
    lock: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
    sun: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>,
    help: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" /></svg>,
    logout: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>,
    edit: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    camera: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>,
    chevron: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c0c0cc" strokeWidth="2.2"><polyline points="9 18 15 12 9 6" /></svg>,
    check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
    eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    eyeOff: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg>,
    shield: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    smartphone: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
    trash: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>,
    spinner: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" /><path d="M21 12a9 9 0 00-9-9" /></svg>,
    key: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>,
};

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange, disabled }) => (
    <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        style={{
            width: 46, height: 26, borderRadius: 13,
            background: value ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#e5e7eb",
            border: "none", cursor: disabled ? "default" : "pointer",
            position: "relative", transition: "background 0.25s", flexShrink: 0,
            opacity: disabled ? 0.5 : 1,
        }}>
        <div style={{
            position: "absolute", top: 3,
            left: value ? 23 : 3,
            width: 20, height: 20, borderRadius: "50%",
            background: "white", transition: "left 0.25s",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
        }} />
    </button>
);

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Av = ({ src, name, size = 42 }) => {
    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
    const bg = colors[(name?.charCodeAt(0) || 0) % colors.length];
    return (
        <div style={{ position: "relative", flexShrink: 0 }}>
            {src ? (
                <img src={src} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block", border: "1px solid rgba(0,0,0,0.05)" }} alt="" />
            ) : (
                <div style={{
                    width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${bg}dd, ${bg}99)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: size * 0.38, fontWeight: 700, color: "white", userSelect: "none"
                }}>
                    {name?.[0]?.toUpperCase() || "?"}
                </div>
            )}
        </div>
    );
};

// ─── Sub-page wrapper ──────────────────────────────────────────────────────────
const SubPage = ({ title, onBack, children }) => (
    <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        style={{ position: "absolute", inset: 0, background: "white", overflowY: "auto", zIndex: 10 }}>
        <div style={{ padding: "52px 20px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #f0f0f5", background: "white", position: "sticky", top: 0, zIndex: 5 }}>
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#1a1a2e", padding: "4px 6px 4px 0", display: "flex" }}>
                <Ico.back />
            </button>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a2e", letterSpacing: -0.3 }}>{title}</h2>
        </div>
        <div style={{ padding: "20px 20px 100px" }}>{children}</div>
    </motion.div>
);

// ─── Row Item ──────────────────────────────────────────────────────────────────
const Row = ({ label, desc, right, onClick, danger }) => (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid #f8f8fc", cursor: onClick ? "pointer" : "default" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: danger ? "#ef4444" : "#1a1a2e" }}>{label}</p>
            {desc && <p style={{ margin: "3px 0 0", fontSize: 12, color: "#a0a0b0", lineHeight: 1.4 }}>{desc}</p>}
        </div>
        {right}
    </div>
);

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHead = ({ label }) => (
    <p style={{ margin: "22px 0 8px", fontSize: 11, fontWeight: 800, color: "#b0b0c0", textTransform: "uppercase", letterSpacing: 1.1 }}>{label}</p>
);

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, visible }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                style={{ position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", background: "#1a1a2e", color: "white", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                {msg}
            </motion.div>
        )}
    </AnimatePresence>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function MobileSettingsContent({ onBack, user, onLogout, onUserUpdate, updateProfile, updateSettings, uploadAvatar, updateAppLock }) {
    const [sub, setSub] = useState(null); // null | "profile" | "privacy" | "notifications" | "appearance" | "security" | "account"
    const [toast, setToast] = useState({ visible: false, msg: "" });
    const [localUser, setLocalUser] = useState(user || {});

    // Sync if parent user prop changes
    useEffect(() => { if (user) setLocalUser(user); }, [user]);

    const showToast = (msg) => {
        setToast({ visible: true, msg });
        setTimeout(() => setToast({ visible: false, msg: "" }), 2500);
    };

    // ── Update profile (name, bio) ──
    const saveProfile = async (data) => {
        const res = await updateProfile(data);
        if (res.success) {
            showToast("Profile updated ✓");
            return true;
        }
        return false;
    };

    // ── Update avatar ──
    const saveAvatar = async (file) => {
        const formData = new FormData();
        formData.append("avatar", file);
        const res = await uploadAvatar(formData);
        if (res.success) {
            showToast("Avatar updated ✓");
        }
    };

    // ── Update settings (privacy toggles, notifications, etc.) ──
    const saveSetting = async (key, value) => {
        const res = await updateSettings({ [key]: value });
        if (res.success) {
            // Updated via context
        }
    };

    const mainItems = [
        { icon: <Ico.user />, label: "Profile", desc: "Name, bio, avatar", color: "#6366f1", sub: "profile" },
        { icon: <Ico.bell />, label: "Notifications", desc: "Tones, alerts, previews", color: "#f59e0b", sub: "notifications" },
        { icon: <Ico.lock />, label: "Privacy", desc: "Last seen, read receipts", color: "#10b981", sub: "privacy" },
        { icon: <Ico.sun />, label: "Appearance", desc: "Theme, wallpaper", color: "#8b5cf6", sub: "appearance" },
        { icon: <Ico.shield />, label: "Security", desc: "App lock, two-step verification", color: "#3b82f6", sub: "security" },
        { icon: <Ico.smartphone />, label: "Account", desc: "Phone, linked devices", color: "#ec4899", sub: "account" },
        { icon: <Ico.help />, label: "Help", desc: "Help center, contact us", color: "#64748b", sub: "help" },
    ];

    return (
        <div style={{ position: "relative", height: "100%", overflow: "hidden", background: "white" }}>
            {/* ── MAIN SETTINGS LIST ── */}
            <div style={{ height: "100%", overflowY: "auto", paddingBottom: 100 }}>
                {/* Header */}
                <div style={{ padding: "52px 20px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #f0f0f5" }}>
                    <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#1a1a2e", padding: "4px 6px 4px 0", display: "flex" }}>
                        <Ico.back />
                    </button>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#1a1a2e", letterSpacing: -0.5 }}>Settings</h2>
                </div>

                {/* Profile Card */}
                <div
                    onClick={() => setSub("profile")}
                    style={{ margin: "16px 16px 4px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 22, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: "0 8px 32px rgba(99,102,241,0.25)" }}>
                    <div style={{ position: "absolute", top: -24, right: -24, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
                    <div style={{ position: "absolute", bottom: -16, left: -10, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                    <Av src={localUser.avatar} name={localUser.name} size={60} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: 19, color: "white", letterSpacing: -0.3 }}>{localUser.name || "User"}</p>
                        <p style={{ margin: "3px 0 0", fontSize: 13, color: "rgba(255,255,255,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{localUser.bio || "Tap to edit profile"}</p>
                    </div>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                        <Ico.edit />
                    </div>
                </div>

                {/* Menu Items */}
                <div style={{ padding: "8px 16px" }}>
                    {mainItems.map((item, i) => (
                        <div key={i} onClick={() => setSub(item.sub)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 4px", borderBottom: i < mainItems.length - 1 ? "1px solid #f5f5fa" : "none", cursor: "pointer" }}>
                            <div style={{ width: 42, height: 42, borderRadius: 13, background: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: item.color, flexShrink: 0 }}>
                                {item.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: "#1a1a2e" }}>{item.label}</p>
                                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#a0a0b0" }}>{item.desc}</p>
                            </div>
                            <Ico.chevron />
                        </div>
                    ))}

                    {/* Log Out */}
                    <div onClick={() => { if (window.confirm("Log out of your account?")) onLogout(); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 4px", marginTop: 8, cursor: "pointer", borderTop: "1px solid #f5f5fa" }}>
                        <div style={{ width: 42, height: 42, borderRadius: 13, background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0 }}>
                            <Ico.logout />
                        </div>
                        <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: "#ef4444" }}>Log Out</p>
                    </div>
                </div>
            </div>

            {/* ── SUB-PAGES (animated overlay) ── */}
            <AnimatePresence>
                {sub === "profile" && (
                    <ProfileSubPage key="profile" onBack={() => setSub(null)} user={localUser} onSave={saveProfile} onSaveAvatar={saveAvatar} showToast={showToast} />
                )}
                {sub === "notifications" && (
                    <NotificationsSubPage key="notifications" onBack={() => setSub(null)} settings={localUser.settings || {}} onSave={saveSetting} showToast={showToast} />
                )}
                {sub === "privacy" && (
                    <PrivacySubPage key="privacy" onBack={() => setSub(null)} settings={localUser.settings || {}} onSave={saveSetting} showToast={showToast} />
                )}
                {sub === "appearance" && (
                    <AppearanceSubPage key="appearance" onBack={() => setSub(null)} settings={localUser.settings || {}} onSave={saveSetting} showToast={showToast} />
                )}
                {sub === "security" && (
                    <SecuritySubPage key="security" onBack={() => setSub(null)} user={localUser} onSave={saveSetting} showToast={showToast} updateAppLock={updateAppLock} />
                )}
                {sub === "account" && (
                    <AccountSubPage key="account" onBack={() => setSub(null)} user={localUser} showToast={showToast} />
                )}
                {sub === "help" && (
                    <HelpSubPage key="help" onBack={() => setSub(null)} />
                )}
            </AnimatePresence>

            <Toast msg={toast.msg} visible={toast.visible} />

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ══════════════════════════════════════════════════════════
// PROFILE SUB-PAGE
// ══════════════════════════════════════════════════════════
function ProfileSubPage({ onBack, user, onSave, onSaveAvatar, showToast }) {
    const [name, setName] = useState(user.name || "");
    const [bio, setBio] = useState(user.bio || "");
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const handleSave = async () => {
        if (!name.trim()) return showToast("Name cannot be empty");
        setSaving(true);
        const ok = await onSave({ name: name.trim(), bio: bio.trim() });
        setSaving(false);
        if (ok) onBack();
    };

    const handleAvatar = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return showToast("Image too large (max 5MB)");

        // Show local preview immediately for UX
        const reader = new FileReader();
        reader.onload = (ev) => {
            // Optional: local preview state if needed, but we'll wait for upload
        };
        reader.readAsDataURL(file);

        setUploading(true);
        onSaveAvatar(file).finally(() => setUploading(false));
        e.target.value = "";
    };

    return (
        <SubPage title="Edit Profile" onBack={onBack}>
            {/* Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
                <div style={{ position: "relative" }}>
                    <Av src={user.avatar} name={user.name} size={100} />
                    <button
                        onClick={() => fileRef.current?.click()}
                        style={{ position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "3px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
                        {uploading ? <Ico.spinner /> : <Ico.camera />}
                    </button>
                    <input type="file" ref={fileRef} accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />
                </div>
                <p style={{ margin: "10px 0 0", fontSize: 13, color: "#6366f1", fontWeight: 700 }}>Change photo</p>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#b0b0c0", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Name</label>
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={50}
                    placeholder="Your name"
                    style={{ width: "100%", padding: "14px 16px", background: "#f7f7fb", border: "1.5px solid transparent", borderRadius: 14, fontSize: 15, color: "#1a1a2e", outline: "none", boxSizing: "border-box", transition: "border 0.2s" }}
                    onFocus={e => e.target.style.borderColor = "#6366f1"}
                    onBlur={e => e.target.style.borderColor = "transparent"}
                />
                <p style={{ margin: "4px 0 0 4px", fontSize: 11, color: "#c0c0cc" }}>{name.length}/50</p>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#b0b0c0", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Bio</label>
                <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    maxLength={150}
                    placeholder="Something about yourself..."
                    rows={4}
                    style={{ width: "100%", padding: "14px 16px", background: "#f7f7fb", border: "1.5px solid transparent", borderRadius: 14, fontSize: 15, color: "#1a1a2e", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.5, transition: "border 0.2s" }}
                    onFocus={e => e.target.style.borderColor = "#6366f1"}
                    onBlur={e => e.target.style.borderColor = "transparent"}
                />
                <p style={{ margin: "4px 0 0 4px", fontSize: 11, color: "#c0c0cc" }}>{bio.length}/150</p>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                style={{ width: "100%", padding: "16px", background: saving ? "#c0c0cc" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 16, color: "white", fontWeight: 800, fontSize: 16, cursor: saving ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "0.2s" }}>
                {saving ? <><Ico.spinner /> Saving...</> : "Save Changes"}
            </button>
        </SubPage>
    );
}

// ══════════════════════════════════════════════════════════
// NOTIFICATIONS SUB-PAGE
// ══════════════════════════════════════════════════════════
function NotificationsSubPage({ onBack, settings, onSave, showToast }) {
    const [local, setLocal] = useState({ ...settings });
    const [saving, setSaving] = useState({});

    useEffect(() => { setLocal({ ...settings }); }, [settings]);

    const toggle = async (key) => {
        const val = !local[key];
        setLocal(p => ({ ...p, [key]: val }));
        setSaving(p => ({ ...p, [key]: true }));
        await onSave(key, val);
        setSaving(p => ({ ...p, [key]: false }));
    };

    const rows = [
        { key: "notifications", label: "Message Notifications", desc: "Show notifications for new messages" },
        { key: "soundEnabled", label: "Notification Sound", desc: "Play a sound for incoming messages" },
        { key: "notificationTones", label: "Conversation Tones", desc: "Play sounds when sending messages" },
        { key: "highPriority", label: "High Priority", desc: "Show message previews at top of screen" },
        { key: "reactionNotifications", label: "Reaction Alerts", desc: "Notify when someone reacts to your message" },
        { key: "groupNotifications", label: "Group Notifications", desc: "Notifications for group messages" },
    ];

    return (
        <SubPage title="Notifications" onBack={onBack}>
            <SectionHead label="Message Alerts" />
            {rows.map(r => (
                <Row key={r.key} label={r.label} desc={r.desc}
                    right={<Toggle value={!!local[r.key]} onChange={() => toggle(r.key)} disabled={saving[r.key]} />}
                />
            ))}
        </SubPage>
    );
}

// ══════════════════════════════════════════════════════════
// PRIVACY SUB-PAGE
// ══════════════════════════════════════════════════════════
function PrivacySubPage({ onBack, settings, onSave, showToast }) {
    const [local, setLocal] = useState({ ...settings });
    const [saving, setSaving] = useState({});

    useEffect(() => { setLocal({ ...settings }); }, [settings]);

    const toggle = async (key) => {
        const val = !local[key];
        setLocal(p => ({ ...p, [key]: val }));
        setSaving(p => ({ ...p, [key]: true }));
        await onSave(key, val);
        setSaving(p => ({ ...p, [key]: false }));
    };

    const select = async (key, val) => {
        setLocal(p => ({ ...p, [key]: val }));
        await onSave(key, val);
        showToast("Saved ✓");
    };

    const visibilityOptions = ["everyone", "contacts", "nobody"];

    return (
        <SubPage title="Privacy" onBack={onBack}>
            <SectionHead label="Who Can See" />

            {/* Last Seen */}
            <div style={{ paddingBottom: 16, borderBottom: "1px solid #f8f8fc", marginBottom: 4 }}>
                <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: 15, color: "#1a1a2e" }}>Last Seen & Online</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {visibilityOptions.map(opt => (
                        <button key={opt} onClick={() => select("lastSeenVisibility", opt)}
                            style={{ padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: local.lastSeenVisibility === opt ? "#6366f1" : "#f5f5fa", color: local.lastSeenVisibility === opt ? "white" : "#666", transition: "0.2s", textTransform: "capitalize" }}>
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Profile Photo Visibility */}
            <div style={{ paddingBottom: 16, borderBottom: "1px solid #f8f8fc", marginBottom: 4 }}>
                <p style={{ margin: "12px 0 10px", fontWeight: 600, fontSize: 15, color: "#1a1a2e" }}>Profile Photo</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {visibilityOptions.map(opt => (
                        <button key={opt} onClick={() => select("profilePhotoVisibility", opt)}
                            style={{ padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: local.profilePhotoVisibility === opt ? "#6366f1" : "#f5f5fa", color: local.profilePhotoVisibility === opt ? "white" : "#666", transition: "0.2s", textTransform: "capitalize" }}>
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <SectionHead label="Messages" />
            <Row label="Read Receipts" desc="Show blue ticks when you've read messages. Turning this off also hides read receipts from others."
                right={<Toggle value={!!local.readReceipts} onChange={() => toggle("readReceipts")} disabled={saving.readReceipts} />}
            />
            <Row label="Sync Contacts" desc="Allow the app to sync your phone contacts to find friends."
                right={<Toggle value={!!local.syncContactsEnabled} onChange={() => toggle("syncContactsEnabled")} disabled={saving.syncContactsEnabled} />}
            />
        </SubPage>
    );
}

// ══════════════════════════════════════════════════════════
// APPEARANCE SUB-PAGE
// ══════════════════════════════════════════════════════════
function AppearanceSubPage({ onBack, settings, onSave, showToast }) {
    // Currently uses settings prop directly for selection indicators
    const themes = [
        { id: "light", label: "Light", bg: "#f9fafb", fg: "#1a1a2e" },
        { id: "dark", label: "Dark", bg: "#1a1a2e", fg: "white" },
        { id: "purple", label: "Purple", bg: "#2d1b69", fg: "white" },
    ];

    const wallpapers = [
        { id: "default", color: "#f5f5fa", label: "Default" },
        { id: "indigo", color: "linear-gradient(135deg,#6366f1,#8b5cf6)", label: "Indigo" },
        { id: "emerald", color: "linear-gradient(135deg,#10b981,#34d399)", label: "Emerald" },
        { id: "rose", color: "linear-gradient(135deg,#ec4899,#f43f5e)", label: "Rose" },
        { id: "amber", color: "linear-gradient(135deg,#f59e0b,#fbbf24)", label: "Amber" },
        { id: "sky", color: "linear-gradient(135deg,#3b82f6,#38bdf8)", label: "Sky" },
        { id: "midnight", color: "linear-gradient(135deg,#0f172a,#1e293b)", label: "Night" },
        { id: "peach", color: "linear-gradient(135deg,#fda4af,#fb7185)", label: "Peach" },
        { id: "forest", color: "linear-gradient(135deg,#166534,#15803d)", label: "Forest" },
    ];

    const selectTheme = async (id) => {
        await onSave("theme", id);
        showToast(`Theme set to ${id} ✓`);
    };

    const selectWallpaper = async (id) => {
        await onSave("wallpaper", id);
        showToast("Wallpaper updated ✓");
    };

    return (
        <SubPage title="Appearance" onBack={onBack}>
            <SectionHead label="Theme" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
                {themes.map(t => (
                    <button key={t.id} onClick={() => selectTheme(t.id)}
                        style={{ padding: "18px 0", borderRadius: 16, border: settings.theme === t.id ? "2.5px solid #6366f1" : "1.5px solid #f0f0f5", background: t.bg, color: t.fg, fontWeight: 700, fontSize: 13, cursor: "pointer", position: "relative", transition: "0.2s" }}>
                        {settings.theme === t.id && (
                            <div style={{ position: "absolute", top: 6, right: 6, color: "#6366f1" }}><Ico.check /></div>
                        )}
                        {t.label}
                    </button>
                ))}
            </div>

            <SectionHead label="Chat Wallpaper" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {wallpapers.map(w => (
                    <button key={w.id} onClick={() => selectWallpaper(w.id)}
                        style={{ height: 80, borderRadius: 14, border: settings.wallpaper === w.id ? "3px solid #6366f1" : "1.5px solid #f0f0f5", background: w.color, cursor: "pointer", position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 6px", overflow: "hidden" }}>
                        {settings.wallpaper === w.id && (
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}><Ico.check /></div>
                        )}
                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.9)", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>{w.label}</span>
                    </button>
                ))}
            </div>

            <SectionHead label="Font Size" />
            <div style={{ background: "#f7f7fb", borderRadius: 16, padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    {["Small", "Medium", "Large"].map(s => (
                        <button key={s} onClick={() => { onSave("fontSize", s.toLowerCase()); showToast(`Font: ${s} ✓`); }}
                            style={{ flex: 1, margin: "0 4px", padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: settings.fontSize === s.toLowerCase() ? "#6366f1" : "white", color: settings.fontSize === s.toLowerCase() ? "white" : "#666", transition: "0.2s" }}>
                            {s}
                        </button>
                    ))}
                </div>
                <p style={{ margin: 0, fontSize: settings.fontSize === "large" ? 17 : settings.fontSize === "small" ? 13 : 15, color: "#555", textAlign: "center" }}>Preview text</p>
            </div>
        </SubPage>
    );
}

// ══════════════════════════════════════════════════════════
// SECURITY SUB-PAGE
// ══════════════════════════════════════════════════════════
function SecuritySubPage({ onBack, user, onSave, showToast, updateAppLock }) {
    const [appLockEnabled, setAppLockEnabled] = useState(user?.appLock?.enabled || false);
    const [biometricEnabled, setBiometricEnabled] = useState(user?.appLock?.biometricEnabled || false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [savingPin, setSavingPin] = useState(false);
    const [show2FA, setShow2FA] = useState(false);

    const toggleAppLock = async () => {
        if (!appLockEnabled) {
            setShowPinModal(true);
        } else {
            const res = await updateAppLock({ enabled: false });
            if (res.success) {
                setAppLockEnabled(false);
                showToast("App lock disabled");
            }
        }
    };

    const savePin = async () => {
        if (pin.length < 4) return showToast("PIN must be at least 4 digits");
        if (pin !== confirmPin) return showToast("PINs don't match");
        setSavingPin(true);
        const res = await updateAppLock({ enabled: true, pin });
        setSavingPin(false);
        if (res.success) {
            setAppLockEnabled(true);
            setShowPinModal(false);
            setPin(""); setConfirmPin("");
            showToast("App lock enabled ✓");
        } else showToast("Failed to set PIN");
    };

    const toggleBiometric = async () => {
        const val = !biometricEnabled;
        const res = await updateAppLock({ biometricEnabled: val });
        if (res.success) {
            setBiometricEnabled(val);
            showToast(val ? "Biometric enabled ✓" : "Biometric disabled");
        }
    };

    return (
        <SubPage title="Security" onBack={onBack}>
            <SectionHead label="App Lock" />
            <Row label="App Lock" desc="Require PIN to open the app"
                right={<Toggle value={appLockEnabled} onChange={toggleAppLock} />}
            />
            {appLockEnabled && (
                <Row label="Biometric Unlock" desc="Use fingerprint or face to unlock"
                    right={<Toggle value={biometricEnabled} onChange={toggleBiometric} />}
                />
            )}
            {appLockEnabled && (
                <Row label="Change PIN" desc="Update your app lock PIN" onClick={() => setShowPinModal(true)}
                    right={<Ico.chevron />}
                />
            )}

            <SectionHead label="Two-Step Verification" />
            <Row label="Two-Step Verification" desc="Add a PIN that is required when registering your number again"
                onClick={() => setShow2FA(true)}
                right={<Ico.chevron />}
            />

            <SectionHead label="Sessions" />
            <Row label="Linked Devices" desc={`${user?.linkedDevices?.length || 0} linked device(s)`}
                right={<Ico.chevron />}
            />

            {/* PIN Modal */}
            <AnimatePresence>
                {showPinModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 340, damping: 34 }}
                            style={{ background: "white", borderRadius: "24px 24px 0 0", width: "100%", padding: "24px 24px 48px" }}>
                            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>Set App Lock PIN</h3>
                            <label style={{ fontSize: 12, fontWeight: 800, color: "#b0b0c0", textTransform: "uppercase", letterSpacing: 0.8 }}>Enter PIN (4–6 digits)</label>
                            <input
                                type="password" inputMode="numeric" maxLength={6}
                                value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                                placeholder="••••"
                                style={{ display: "block", width: "100%", marginTop: 8, marginBottom: 16, padding: "14px 16px", background: "#f7f7fb", border: "1.5px solid transparent", borderRadius: 14, fontSize: 20, letterSpacing: 8, color: "#1a1a2e", outline: "none", boxSizing: "border-box", textAlign: "center" }}
                                onFocus={e => e.target.style.borderColor = "#6366f1"}
                                onBlur={e => e.target.style.borderColor = "transparent"}
                            />
                            <label style={{ fontSize: 12, fontWeight: 800, color: "#b0b0c0", textTransform: "uppercase", letterSpacing: 0.8 }}>Confirm PIN</label>
                            <input
                                type="password" inputMode="numeric" maxLength={6}
                                value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                                placeholder="••••"
                                style={{ display: "block", width: "100%", marginTop: 8, marginBottom: 20, padding: "14px 16px", background: "#f7f7fb", border: "1.5px solid transparent", borderRadius: 14, fontSize: 20, letterSpacing: 8, color: "#1a1a2e", outline: "none", boxSizing: "border-box", textAlign: "center" }}
                                onFocus={e => e.target.style.borderColor = "#6366f1"}
                                onBlur={e => e.target.style.borderColor = "transparent"}
                            />
                            <div style={{ display: "flex", gap: 12 }}>
                                <button onClick={() => { setShowPinModal(false); setPin(""); setConfirmPin(""); }}
                                    style={{ flex: 1, padding: "14px", background: "#f5f5fa", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, color: "#666", cursor: "pointer" }}>
                                    Cancel
                                </button>
                                <button onClick={savePin} disabled={savingPin}
                                    style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                    {savingPin ? <><Ico.spinner /> Saving</> : "Set PIN"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </SubPage>
    );
}

// ══════════════════════════════════════════════════════════
// ACCOUNT SUB-PAGE
// ══════════════════════════════════════════════════════════
function AccountSubPage({ onBack, user, showToast }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    return (
        <SubPage title="Account" onBack={onBack}>
            <SectionHead label="Your Info" />
            <Row label="Name" desc={user.name} right={<Ico.chevron />} />
            <Row label="Email" desc={user.email || "Not set"} right={<Ico.chevron />} />
            <Row label="Phone" desc={user.phone || "Not set"} right={<Ico.chevron />} />

            <SectionHead label="Linked Devices" />
            {(user.linkedDevices?.length > 0) ? (
                user.linkedDevices.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f8f8fc" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f0f0f8", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
                            <Ico.smartphone />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>{d.deviceName || d.deviceType || "Unknown Device"}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#a0a0b0" }}>{d.browser} · {d.os}</p>
                            <p style={{ margin: "1px 0 0", fontSize: 11, color: "#c0c0cc" }}>{d.lastActive ? new Date(d.lastActive).toLocaleDateString() : ""}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p style={{ fontSize: 13, color: "#b0b0c0", padding: "12px 0" }}>No linked devices</p>
            )}

            <SectionHead label="Danger Zone" />
            <div onClick={() => setShowDeleteConfirm(true)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", cursor: "pointer" }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                    <Ico.trash />
                </div>
                <div>
                    <p style={{ margin: 0, fontWeight: 650, fontSize: 15, color: "#ef4444" }}>Delete Account</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#a0a0b0" }}>Permanently delete your account and all data</p>
                </div>
            </div>

            {/* Delete Confirm */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: "white", borderRadius: 24, padding: 28, width: "100%", maxWidth: 340, textAlign: "center" }}>
                            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#ef4444" }}>
                                <Ico.trash />
                            </div>
                            <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>Delete Account?</h3>
                            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#888", lineHeight: 1.5 }}>This will permanently delete your account, all messages, and data. This cannot be undone.</p>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button onClick={() => setShowDeleteConfirm(false)}
                                    style={{ flex: 1, padding: "13px", background: "#f5f5fa", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, color: "#666", cursor: "pointer" }}>
                                    Cancel
                                </button>
                                <button onClick={() => { showToast("Feature coming soon"); setShowDeleteConfirm(false); }}
                                    style={{ flex: 1, padding: "13px", background: "#ef4444", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, color: "white", cursor: "pointer" }}>
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </SubPage>
    );
}

// ══════════════════════════════════════════════════════════
// HELP SUB-PAGE
// ══════════════════════════════════════════════════════════
function HelpSubPage({ onBack }) {
    const faqs = [
        { q: "How do I send a voice message?", a: "Hold the microphone button in the chat input to record a voice message. Release to send." },
        { q: "How do I delete a message?", a: "Long press on any message to see options including delete, reply, and forward." },
        { q: "How do I create a group?", a: "Tap the + button in the bottom nav, then select 'New Group' to create a group chat." },
        { q: "How do I mute a conversation?", a: "Swipe left on a conversation in the chat list and tap the mute option." },
        { q: "Are my messages encrypted?", a: "Yes, all messages are end-to-end encrypted for your privacy and security." },
    ];
    const [open, setOpen] = useState(null);

    return (
        <SubPage title="Help" onBack={onBack}>
            <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 18, padding: "20px", marginBottom: 24, textAlign: "center" }}>
                <p style={{ margin: 0, color: "white", fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>Need more help? Contact our support team at <strong>support@samvaad.app</strong></p>
            </div>

            <SectionHead label="Frequently Asked Questions" />
            {faqs.map((faq, i) => (
                <div key={i} style={{ borderBottom: "1px solid #f5f5fa" }}>
                    <button onClick={() => setOpen(open === i ? null : i)}
                        style={{ width: "100%", background: "none", border: "none", padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}>
                        <span style={{ fontWeight: 650, fontSize: 15, color: "#1a1a2e", flex: 1, paddingRight: 12 }}>{faq.q}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0b0c0" strokeWidth="2.5" style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                    <AnimatePresence>
                        {open === i && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                                <p style={{ margin: "0 0 14px", fontSize: 14, color: "#666", lineHeight: 1.6, paddingRight: 12 }}>{faq.a}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </SubPage>
    );
}