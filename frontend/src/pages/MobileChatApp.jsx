import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "../components/Chat/EmojiPicker";
import SettingsScreen from "./SamvaadSettings";

// ─── Icons (inline SVG components) ───────────────────────────────────────────
const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const Icons = {
    status: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>,
    calls: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82 19.79 19.79 0 01.14 1.18C.14.62.57.09 1.17.01A2 2 0 013 2v3a2 2 0 001.44 1.93 2 2 0 002.22-.44l.71-.71a16 16 0 006.85 6.85l-.71.71a2 2 0 00-.44 2.22A2 2 0 0015 18h3a2 2 0 012 1.92z" /></svg>,
    chat: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
    chatOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
    settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
    plus: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
    more: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>,
    back: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>,
    send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" /></svg>,
    mic: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="2" width="6" height="11" rx="3" /><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" /></svg>,
    attach: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>,
    emoji: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></svg>,
    video: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>,
    phone: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82 19.79 19.79 0 01.14 1.18C.14.62.57.09 1.17.01A2 2 0 013 2v3a2 2 0 001.44 1.93 2 2 0 002.22-.44l.71-.71a16 16 0 006.85 6.85l-.71.71a2 2 0 00-.44 2.22A2 2 0 0015 18h3a2 2 0 012 1.92z" /></svg>,
    pin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    check: ({ size = 14, style = {} }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={style}><polyline points="20 6 9 17 4 12" /></svg>,
    checkDouble: ({ size = 16, style = {} }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={style}><polyline points="17 2 7 13 2 8" /><polyline points="22 7 12 18 10 16" /></svg>,
    clock: ({ size = 12, style = {} }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={style}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    notification: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>,
    privacy: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
    theme: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>,
    help: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" /></svg>,
    logout: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>,
    edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    camera: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>,
    circlePlay: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>,
    user: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /></svg>,
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CONVERSATIONS = [
    { id: 1, name: "Larry Machigo", avatar: null, lastMsg: "Ok. Let me check", time: "9:38 AM", unread: 0, online: true, pinned: true, type: "direct" },
    { id: 2, name: "Natalie Nora", avatar: null, lastMsg: "Natalie is typing...", time: "9:22 AM", unread: 2, online: true, typing: true, type: "direct" },
    { id: 3, name: "Jennifer Jones", avatar: null, lastMsg: "🎙 Voice message", time: "Yesterday", unread: 0, online: false, type: "direct" },
    { id: 4, name: "attm1266", avatar: null, lastMsg: "hi", time: "11:20 AM", unread: 0, online: true, type: "direct" },
    { id: 5, name: "Design Team", avatar: null, lastMsg: "Sofia: thanks everyone!", time: "26 May", unread: 3, online: false, type: "group" },
    { id: 6, name: "Haider Lve", avatar: null, lastMsg: "🗣 Sticker", time: "12 Jun", unread: 0, online: false, type: "direct" },
];

const MOCK_MESSAGES = {
    1: [
        { id: 1, content: "Hey 👋", from: "them", time: "9:30 AM", read: true },
        { id: 2, content: "Are you available for a New UI Project", from: "them", time: "9:31 AM", read: true },
        { id: 3, content: "Hello!", from: "me", time: "9:32 AM", read: true },
        { id: 4, content: "yes, have some space for the new task", from: "them", time: "9:33 AM", read: true },
        { id: 5, content: "Cool, should I share the details now?", from: "them", time: "9:34 AM", read: true },
        { id: 6, content: "Yes Sure, please", from: "me", time: "9:35 AM", read: true },
        { id: 7, content: "Great, here is the SOW of the Project", from: "them", time: "9:36 AM", read: true },
        { id: 8, content: "Ok. Let me check", from: "me", time: "9:38 AM", read: true },
    ],
    4: [
        { id: 1, content: "hi", from: "them", time: "11:20 AM", read: true },
    ],
};

// ─── Avatar Component ─────────────────────────────────────────────────────────
const Avatar = ({ name, size = 42, online = false, color, src }) => {
    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    const bg = color || colors[idx];
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
            {online && (
                <div style={{
                    position: "absolute", bottom: 1, right: 1,
                    width: size * 0.28, height: size * 0.28, borderRadius: "50%",
                    background: "#22c55e", border: "2px solid white"
                }} />
            )}
        </div>
    );
};

// ─── Status Page ──────────────────────────────────────────────────────────────
const StatusPage = ({ onBack }) => (
    <div style={{ background: "white", minHeight: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "56px 24px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#1a1a2e" }}>
                <Icons.back />
            </button>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>Status</h2>
        </div>
        <div style={{ padding: "16px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid #f0f0f5" }}>
                <div style={{ position: "relative" }}>
                    <Avatar name="Me" size={52} color="#6366f1" />
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white" }}>
                        <span style={{ color: "white", fontSize: 14, lineHeight: 1 }}>+</span>
                    </div>
                </div>
                <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>My Status</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#888", marginTop: 2 }}>Tap to add status update</p>
                </div>
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1.2, margin: "20px 0 12px" }}>Recent Updates</p>
            {[{ name: "Larry Machigo", time: "9:38 AM" }, { name: "Natalie Nora", time: "9:22 AM" }].map(s => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #f8f8fc" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", padding: 2, background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Avatar name={s.name} size={44} />
                        </div>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>{s.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#888", marginTop: 2 }}>Today at {s.time}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// ─── Calls Page ───────────────────────────────────────────────────────────────
const CallsPage = ({ onBack, conversations }) => (
    <div style={{ background: "white", minHeight: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "56px 24px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#1a1a2e" }}>
                <Icons.back />
            </button>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1a2e" }}>Calls</h2>
        </div>
        <div style={{ padding: "0 16px" }}>
            {conversations.slice(0, 4).map((c, i) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 8px", borderBottom: "1px solid #f8f8fc" }}>
                    <Avatar name={c.name} size={48} online={c.online} />
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: "#1a1a2e" }}>{c.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: i % 2 === 0 ? "#22c55e" : "#ef4444", marginTop: 2 }}>
                            {i % 2 === 0 ? "Incoming call" : "Missed call"} · {c.time}
                        </p>
                    </div>
                    <button style={{ width: 38, height: 38, borderRadius: "50%", background: "#f0f0f8", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6366f1" }}>
                        <Icons.phone />
                    </button>
                </div>
            ))}
        </div>
    </div>
);

const MessageStatus = ({ status, isMe }) => {
    if (!isMe) return null;
    if (status === "sending") return <Icons.clock size={12} style={{ opacity: 0.6, color: "white" }} />;
    if (status === "sent") return <Icons.check size={14} style={{ color: "rgba(255,255,255,0.7)" }} />;
    if (status === "delivered") return <Icons.checkDouble size={14} style={{ color: "rgba(255,255,255,0.7)" }} />;
    if (status === "read") return <Icons.checkDouble size={14} style={{ color: "#38bdf8" }} />;
    return <Icons.check size={14} style={{ color: "rgba(255,255,255,0.7)" }} />; // Default sent
};


// ─── Conversation Page ────────────────────────────────────────────────────────
const ConversationPage = ({
    conv, onBack, messages, input, setInput, onSend, onInputChange,
    isRecording, startRecording, stopRecording, recordingDuration, fmtDuration,
    onClearChat,
    fileInputRef, onFileSelect, uploadPreview, setUploadPreview,
    showEmojiPicker, setShowEmojiPicker, onEmojiSelect,
    replyToMessage, setReplyToMessage
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleMenuClick = (item) => {
        setShowMenu(false);
        if (item === "Clear Chat" && onClearChat) {
            onClearChat(conv.id);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#f5f5fa", position: "relative" }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #5a4fcf, #6d5be0)",
                padding: "48px 16px 16px",
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: "0 2px 20px rgba(90,79,207,0.3)",
                zIndex: 10,
                flexShrink: 0
            }}>
                <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "white", padding: "4px 4px 4px 0" }}>
                    <Icons.back />
                </button>
                <Avatar name={conv.name} size={40} online={conv.online} />
                <div style={{ flex: 1, marginLeft: 6, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1, display: "flex", alignItems: "center", gap: 5 }}>
                        {conv.online && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />}
                        {conv.online ? "Online" : String(conv.lastSeen || "Last seen recently")}
                    </p>
                </div>
                <button style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
                    <Icons.video />
                </button>
                <button style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
                    <Icons.phone />
                </button>
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setShowMenu(p => !p)}
                        style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
                        <Icons.more />
                    </button>
                    {showMenu && (
                        <div style={{ position: "absolute", right: 0, top: 46, background: "white", borderRadius: 14, padding: "6px 0", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", minWidth: 160, zIndex: 100 }}>
                            {["View Profile", "Search", "Mute Notifications", "Clear Chat"].map(item => (
                                <button key={item} onClick={() => handleMenuClick(item)} style={{ display: "block", width: "100%", padding: "11px 18px", background: "none", border: "none", textAlign: "left", fontSize: 14, color: item === "Clear Chat" ? "#ef4444" : "#1a1a2e", cursor: "pointer", fontWeight: 500 }}>
                                    {item}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px" }}>
                {messages.map((item, i) => {
                    if (item.type === "date") return (
                        <div key={item.id} style={{ display: "flex", justifyContent: "center", marginBottom: 16, marginTop: 8 }}>
                            <span style={{ background: "rgba(90,79,207,0.08)", color: "#6366f1", fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase" }}>{item.label}</span>
                        </div>
                    );

                    const msg = item;
                    const isMe = msg.from === "me";
                    return (
                        <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 8, alignItems: "flex-end", gap: 8 }}>
                            {!isMe && <Avatar name={conv.name} size={28} />}
                            <div style={{
                                maxWidth: "72%",
                                background: isMe ? "linear-gradient(135deg, #5a4fcf, #6d5be0)" : "white",
                                borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                padding: msg.type === "image" ? "4px" : "10px 14px",
                                boxShadow: isMe ? "0 2px 12px rgba(90,79,207,0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
                                position: "relative"
                            }}>
                                {msg.replyTo && (
                                    <div style={{ background: isMe ? "rgba(0,0,0,0.15)" : "#f5f5fa", borderRadius: 10, padding: "6px 10px", marginBottom: 6, borderLeft: "3px solid #6366f1" }}>
                                        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#6366f1" }}>{msg.replyTo.name || "User"}</p>
                                        <p style={{ margin: 0, fontSize: 12, color: isMe ? "rgba(255,255,255,0.7)" : "#666", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{msg.replyTo.content}</p>
                                    </div>
                                )}
                                {msg.type === "image" && (
                                    <div style={{ position: "relative" }}>
                                        <img src={msg.mediaUrl} style={{ width: "100%", borderRadius: 14, display: "block" }} alt="" />
                                    </div>
                                )}
                                {msg.content && (
                                    <p style={{ margin: (msg.type === "image" ? "6px 6px 0" : 0), fontSize: 15, color: isMe ? "white" : "#1a1a2e", lineHeight: 1.45 }}>{msg.content}</p>
                                )}
                                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 4, paddingRight: msg.type === "image" ? 6 : 0, paddingBottom: msg.type === "image" ? 4 : 0 }}>
                                    <span style={{ fontSize: 10, color: isMe ? "rgba(255,255,255,0.65)" : "#aaa" }}>{msg.time}</span>
                                    <MessageStatus status={msg.status} isMe={isMe} />
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div style={{ padding: "8px 12px 34px", background: "white", borderTop: "1px solid #f0f0f5", flexShrink: 0, position: "relative" }}>
                {/* Previews (Reply/Upload) */}
                <AnimatePresence>
                    {replyToMessage && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: "#f8f8fc", borderRadius: 16, border: "1px solid #f0f0f5", marginBottom: 8, position: "relative" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase" }}>Replying to {replyToMessage.name || "user"}</p>
                                <p style={{ margin: 0, fontSize: 13, color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{replyToMessage.content}</p>
                            </div>
                            <button onClick={() => setReplyToMessage(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", padding: 4 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </motion.div>
                    )}
                    {uploadPreview && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#f8f8fc", borderRadius: 16, border: "1px solid #f0f0f5", marginBottom: 8 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", background: "#f0f0f5", border: "1px solid #e0e0e5" }}>
                                {uploadPreview.type.startsWith("image/")
                                    ? <img src={uploadPreview.preview} style={{ width: "100%", height: "100%", objectCover: "cover" }} alt="" />
                                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Icons.attach /></div>
                                }
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uploadPreview.name}</p>
                                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase" }}>Ready to send</p>
                            </div>
                            <button onClick={() => setUploadPreview(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", padding: 4 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Emoji Picker */}
                <AnimatePresence>
                    {showEmojiPicker && (
                        <div style={{ position: "absolute", bottom: "100%", left: 12, zIndex: 1000, marginBottom: 12 }}>
                            <EmojiPicker onEmojiSelect={(emoji) => { onEmojiSelect(emoji); setShowEmojiPicker(false); }} />
                        </div>
                    )}
                </AnimatePresence>

                <form onSubmit={onSend} style={{ display: "flex", alignItems: "center", background: "#f5f5fa", borderRadius: 30, padding: "6px 6px 6px 16px", gap: 8 }}>
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ background: "none", border: "none", cursor: "pointer", color: showEmojiPicker ? "#6366f1" : "#aaa", display: "flex", alignItems: "center", transition: "color 0.2s" }}>
                        <Icons.emoji />
                    </button>
                    {isRecording ? (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#ef4444" }}>{fmtDuration(recordingDuration)}</span>
                            <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Recording...</p>
                        </div>
                    ) : (
                        <input
                            value={input}
                            onChange={onInputChange}
                            onFocus={() => {
                                setShowEmojiPicker(false);
                                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
                            }}
                            placeholder="Type a message..."
                            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 15, color: "#1a1a2e", padding: "6px 0" }}
                        />
                    )}

                    {(input?.trim() || uploadPreview) ? (
                        <button type="submit" style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #5a4fcf, #6d5be0)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", flexShrink: 0 }}>
                            <Icons.send />
                        </button>
                    ) : (
                        <>
                            {!isRecording && (
                                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", display: "flex", alignItems: "center" }}>
                                    <Icons.attach />
                                </button>
                            )}

                            {isRecording ? (
                                <button type="button" onClick={() => stopRecording(true)} style={{ width: 40, height: 40, borderRadius: "50%", background: "#ef4444", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", flexShrink: 0 }}>
                                    <Icons.send />
                                </button>
                            ) : (
                                <button type="button" onClick={startRecording} style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #5a4fcf, #6d5be0)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", flexShrink: 0 }}>
                                    <Icons.mic />
                                </button>
                            )}
                        </>
                    )}
                </form>
                <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={onFileSelect} />
            </div>
        </div>
    );
};

// ─── Chat List Page ───────────────────────────────────────────────────────────
const ChatListPage = ({ conversations, onSelectConv }) => {
    const [filter, setFilter] = useState("All Chats");
    const [search, setSearch] = useState("");

    const filtered = conversations.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
        if (filter === "Groups") return c.type === "group" && matchSearch;
        if (filter === "Contacts") return c.type === "direct" && matchSearch;
        return matchSearch;
    });

    return (
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "white" }}>
            {/* Search */}
            <div style={{ padding: "0 20px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", background: "#f5f5fa", borderRadius: 14, padding: "10px 14px", gap: 10 }}>
                    <span style={{ color: "#aaa", display: "flex" }}><Icons.search /></span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search chats..."
                        style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 14, color: "#1a1a2e" }}
                    />
                </div>
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 8, padding: "0 20px 16px", overflowX: "auto", scrollbarWidth: "none" }}>
                {["All Chats", "Groups", "Contacts"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0, transition: "all 0.2s",
                            background: filter === f ? "#6366f1" : "#f5f5fa",
                            color: filter === f ? "white" : "#666",
                        }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Conversations */}
            <div style={{ flex: 1 }}>
                {filtered.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => onSelectConv(conv)}
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: "1px solid #f8f8fc", transition: "background 0.15s" }}
                        onTouchStart={e => e.currentTarget.style.background = "#f8f8fc"}
                        onTouchEnd={e => e.currentTarget.style.background = "transparent"}
                    >
                        <Avatar name={conv.name} size={52} online={conv.online} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>{conv.name}</span>
                                    {conv.pinned && <span style={{ color: "#6366f1" }}><Icons.pin /></span>}
                                </div>
                                <span style={{ fontSize: 12, color: "#aaa", flexShrink: 0 }}>{conv.time}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 13, color: conv.typing ? "#6366f1" : "#888", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontStyle: conv.typing ? "italic" : "normal" }}>
                                    {conv.lastMsg}
                                </span>
                                {conv.unread > 0 && (
                                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <span style={{ fontSize: 11, color: "white", fontWeight: 700 }}>{conv.unread}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// ─── New Chat Modal ───────────────────────────────────────────────────────────
const NewChatModal = ({ onClose, conversations, onSelectConv }) => (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-end" }}>
        <div style={{ background: "white", borderRadius: "24px 24px 0 0", width: "100%", padding: "20px 0", maxHeight: "70%", display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: "0 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>New Chat</h3>
                <button onClick={onClose} style={{ background: "#f5f5fa", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#666" }}>
                    <Icons.plus style={{ transform: 'rotate(45deg)' }} />
                </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
                {conversations.map(conv => (
                    <button key={conv.id} onClick={() => { onSelectConv(conv.original); onClose(); }}
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                        <Avatar name={conv.name} size={46} online={conv.online} />
                        <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: "#1a1a2e" }}>{conv.name}</p>
                            <p style={{ margin: 0, fontSize: 12, color: "#aaa", marginTop: 2 }}>{conv.online ? "Online" : "Offline"}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function MobileChatApp(props) {
    const {
        conversations = [],
        selectedConversation,
        setSelectedConversation,
        messages = [],
        loading,
        newMessage,
        setNewMessage,
        handleSend,
        handleInputChange,
        handleFileSelect,
        fileInputRef,
        isRecording,
        startRecording,
        stopRecording,
        recordingDuration,
        fmtDuration,
        replyToMessage,
        setReplyToMessage,
        uploadPreview,
        setUploadPreview,
        showEmojiPicker,
        setShowEmojiPicker,
        handleEmojiSelect,
        getConversationName,
        getConversationAvatar,
        isUserOnline,
        getLastSeen,
        typingUsers = {},
        userId,
        user,
        logout,
        setActiveCall,
        addReaction,
        setForwardMessageData,
        setShowForwardModal,
        showNewChatModal,
        setShowNewChatModal,
        handleNewChat,
        token,
        clearChat,
        statuses = [],
        incomingCall,
        activeCall,
        fmtLastSeen,
        updateProfile,
        updateSettings,
        uploadAvatar,
        onUserUpdate,
        updateAppLock
    } = props;

    const [page, setPage] = useState("chats"); // chats | status | calls | settings | conversation
    const [activeTab, setActiveTab] = useState("chats");
    const [showMenu, setShowMenu] = useState(false);

    // Sync internal page state with selectedConversation prop
    useEffect(() => {
        if (selectedConversation && page !== "conversation") {
            setPage("conversation");
        } else if (!selectedConversation && page === "conversation") {
            setPage("chats");
        }
    }, [selectedConversation]);

    const navigateTo = (tab) => {
        setActiveTab(tab);
        setPage(tab);
        if (tab !== "conversation") {
            setSelectedConversation(null);
        }
    };

    const openConversation = (conv) => {
        // Pass original object to ensure _id is present for backend calls
        setSelectedConversation(conv);
        setPage("conversation");
    };

    const goBack = () => {
        if (page === "conversation") {
            setSelectedConversation(null);
            setPage(activeTab);
        } else {
            setPage("chats");
            setActiveTab("chats");
        }
    };

    // Map messages to internal format
    const mappedMessages = messages.map(msg => {
        if (msg.type === "date") return msg;
        const isMe = msg.sender === "user" || msg.sender?._id === userId;
        return {
            id: msg._id || msg.id,
            content: msg.content,
            from: isMe ? "me" : "them",
            time: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : msg.time,
            read: msg.readAt || msg.status === 'read',
            status: msg.status,
            type: msg.type || "message",
            mediaUrl: msg.mediaUrl,
            fileName: msg.fileName,
            replyTo: msg.replyTo
        };
    });

    return (
        <div style={{
            width: "100%", maxWidth: 390, height: "100vh", margin: "0 auto",
            background: "white", display: "flex", flexDirection: "column",
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            position: "relative", overflow: "hidden", // Prevent whole page scroll
        }}>
            {/* Status bar spacer */}
            <div style={{ height: 0 }} />

            {/* ── PAGE CONTENT ── */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden", // Nested content handles its own scroll
                paddingBottom: page === "conversation" ? 0 : 90
            }}>

                {/* CHATS PAGE */}
                {page === "chats" && (
                    <>
                        {/* Header */}
                        <div style={{ padding: "56px 20px 0", background: "white" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: 14, color: "#aaa", fontWeight: 500 }}>Hello,</p>
                                    <h1 style={{ margin: "2px 0 0", fontSize: 28, fontWeight: 900, color: "#1a1a2e", letterSpacing: -0.5 }}>{user?.name?.split(' ')[0] || "User"}</h1>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button style={{ width: 40, height: 40, borderRadius: "50%", background: "#f5f5fa", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#555" }}>
                                        <Icons.search />
                                    </button>
                                    <button style={{ width: 40, height: 40, borderRadius: "50%", background: "#f5f5fa", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#555" }}>
                                        <Icons.more />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <ChatListPage
                            conversations={conversations.map(c => ({
                                original: c, // Keep reference to original object for backend calls
                                id: c._id,
                                name: getConversationName(c),
                                avatar: getConversationAvatar(c),
                                lastMsg: c.lastMessage?.content || "No messages",
                                time: c.lastMessage?.timestamp ? new Date(c.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                                unread: c.unreadCount?.[userId] || 0,
                                online: isUserOnline(c),
                                pinned: c.pinnedBy?.some(id => (id._id || id) === userId),
                                type: c.type,
                                typing: !!typingUsers[c._id]
                            }))}
                            onSelectConv={(conv) => openConversation(conv.original)}
                        />
                    </>
                )}

                {/* CONVERSATION PAGE */}
                {page === "conversation" && selectedConversation && (
                    <ConversationPage
                        conv={{
                            id: selectedConversation._id,
                            name: getConversationName(selectedConversation),
                            online: isUserOnline(selectedConversation),
                            avatar: getConversationAvatar(selectedConversation),
                            lastSeen: fmtLastSeen ? fmtLastSeen(getLastSeen(selectedConversation)) : "Last seen recently"
                        }}
                        onClearChat={clearChat}
                        messages={mappedMessages}
                        input={newMessage}
                        setInput={setNewMessage}
                        onSend={handleSend}
                        onBack={goBack}
                        onInputChange={handleInputChange}
                        isRecording={isRecording}
                        startRecording={startRecording}
                        stopRecording={stopRecording}
                        recordingDuration={recordingDuration}
                        fmtDuration={fmtDuration}
                        fileInputRef={fileInputRef}
                        onFileSelect={handleFileSelect}
                        uploadPreview={uploadPreview}
                        setUploadPreview={setUploadPreview}
                        showEmojiPicker={showEmojiPicker}
                        setShowEmojiPicker={setShowEmojiPicker}
                        onEmojiSelect={handleEmojiSelect}
                        replyToMessage={replyToMessage}
                        setReplyToMessage={setReplyToMessage}
                    />
                )}

                {/* STATUS PAGE */}
                {page === "status" && <StatusPage onBack={goBack} />}

                {/* CALLS PAGE */}
                {page === "calls" && <CallsPage onBack={goBack} conversations={conversations.map(c => ({
                    id: c._id,
                    name: getConversationName(c),
                    online: isUserOnline(c),
                    time: "Recent"
                }))} />}

                {/* SETTINGS PAGE */}
                {page === "settings" && (
                    <SettingsScreen
                        onBack={() => { setPage("chats"); setActiveTab("chats"); }}
                        user={user}
                        onLogout={logout}
                        onUserUpdate={onUserUpdate}
                        updateProfile={updateProfile}
                        updateSettings={updateSettings}
                        uploadAvatar={uploadAvatar}
                        updateAppLock={updateAppLock}
                    />
                )}
            </div>

            {/* ── BOTTOM NAV ── */}
            {page !== "conversation" && (
                <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, padding: "0 16px 20px", zIndex: 100, pointerEvents: "none" }}>
                    <div style={{
                        background: "#1e1b38",
                        borderRadius: 36,
                        padding: "10px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 -4px 40px rgba(0,0,0,0.25)",
                        pointerEvents: "all",
                        position: "relative",
                    }}>
                        {/* Left: Status & Calls */}
                        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
                            <button onClick={() => navigateTo("status")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: activeTab === "status" ? "#6366f1" : "rgba(255,255,255,0.4)" }}>
                                <Icons.status />
                                <span style={{ fontSize: 10, fontWeight: 600 }}>Status</span>
                            </button>
                            <button onClick={() => navigateTo("calls")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: activeTab === "calls" ? "#6366f1" : "rgba(255,255,255,0.4)" }}>
                                <Icons.calls />
                                <span style={{ fontSize: 10, fontWeight: 600 }}>Calls</span>
                            </button>
                        </div>

                        {/* Center FAB */}
                        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 14 }}>
                            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#1e1b38", display: "flex", alignItems: "center", justifyContent: "center", padding: 3 }}>
                                <button
                                    onClick={() => setShowNewChatModal(true)}
                                    style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg, #5a4fcf, #7c6fe0)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", boxShadow: "0 4px 20px rgba(90,79,207,0.5)" }}>
                                    <Icons.plus />
                                </button>
                            </div>
                        </div>

                        {/* Right: Chat & Settings */}
                        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
                            <button onClick={() => navigateTo("chats")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: activeTab === "chats" ? "#6366f1" : "rgba(255,255,255,0.4)" }}>
                                {activeTab === "chats" ? <Icons.chat /> : <Icons.chatOut />}
                                <span style={{ fontSize: 10, fontWeight: 600 }}>Chat</span>
                            </button>
                            <button onClick={() => navigateTo("settings")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: activeTab === "settings" ? "#6366f1" : "rgba(255,255,255,0.4)" }}>
                                <Icons.settings />
                                <span style={{ fontSize: 10, fontWeight: 600 }}>Settings</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── New Chat Modal ── */}
            {showNewChatModal && (
                <NewChatModal
                    conversations={conversations.map(c => ({
                        id: c._id,
                        name: getConversationName(c),
                        avatar: getConversationAvatar(c),
                        online: isUserOnline(c)
                    }))}
                    onClose={() => setShowNewChatModal(false)}
                    onSelectConv={openConversation}
                />
            )}
        </div>
    );
}
