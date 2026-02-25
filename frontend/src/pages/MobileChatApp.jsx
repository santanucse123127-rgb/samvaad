import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "../components/Chat/EmojiPicker";
import SettingsScreen from "./SamvaadSettings";
import { getContacts, getUsers } from "../services/chatAPI";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  purple: "#5C5CE0", // main vivid purple (chat bg + them bubbles)
  purpleDark: "#4a4ad0", // slightly darker for gradients
  purpleLight: "#6e6ee8", // lighter purple
  white: "#ffffff",
  offWhite: "#f7f7fc",
  text: "#1a1a2e",
  textMuted: "#888",
  green: "#22c55e",
  red: "#ef4444",
  navBg: "#1e1b38",
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Ic = {
  back: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  video: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  ),
  phone: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82 19.79 19.79 0 01.14 1.18A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006.85 6.85l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  more: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  ),
  search: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
      <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
    </svg>
  ),
  mic: () => (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke={T.textMuted}
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
    </svg>
  ),
  attach: () => (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  ),
  emoji: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={T.textMuted}
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
    </svg>
  ),
  refresh: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={T.textMuted}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
  ),
  download: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  file: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.8)"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  plus: () => (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  pin: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill={T.purple}
      stroke="none"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  checkSingle: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#888"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  checkDouble: () => (
    <svg
      width="18"
      height="14"
      viewBox="0 0 28 18"
      fill="none"
      stroke="#888"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <polyline points="2 9 8 15 18 4" />
      <polyline points="10 9 16 15 26 4" />
    </svg>
  ),
  checkDoubleGreen: () => (
    <svg
      width="16"
      height="13"
      viewBox="0 0 28 18"
      fill="none"
      stroke="#22c55e"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <polyline points="2 9 8 15 18 4" />
      <polyline points="10 9 16 15 26 4" />
    </svg>
  ),
  status: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  calls: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82 19.79 19.79 0 01.14 1.18C.14.62.57.09 1.17.01A2 2 0 013 2v3a2 2 0 001.44 1.93 2 2 0 002.22-.44l.71-.71a16 16 0 006.85 6.85l-.71.71a2 2 0 00-.44 2.22A2 2 0 0015 18h3a2 2 0 012 1.92z" />
    </svg>
  ),
  chatFill: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  chatOut: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  settings: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  logout: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  edit: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  camera: () => (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  notification: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  privacy: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  theme: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  help: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
    </svg>
  ),
  user: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  ),
  reply: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 17 4 12 9 7" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  ),
  forward: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 17 20 12 15 7" />
      <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
    </svg>
  ),
  trash: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  contacts: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 42, online = false, src }) => {
  const colors = [
    T.purple,
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
  ];
  const bg = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {src ? (
        <img
          src={src}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
          }}
          alt=""
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${bg}e0, ${bg}90)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.38,
            fontWeight: 700,
            color: "white",
            userSelect: "none",
          }}
        >
          {name?.[0]?.toUpperCase() || "?"}
        </div>
      )}
      {online && (
        <div
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: size * 0.27,
            height: size * 0.27,
            borderRadius: "50%",
            background: T.green,
            border: `2px solid white`,
          }}
        />
      )}
    </div>
  );
};

// ─── Message Status ────────────────────────────────────────────────────────────
const MsgStatus = ({ status }) => {
  if (status === "sending")
    return (
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#888"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  if (status === "sent") return <Ic.checkSingle />;
  if (status === "delivered") return <Ic.checkDouble />;
  if (status === "read") return <Ic.checkDoubleGreen />;
  return <Ic.checkSingle />;
};

const MessageReactions = ({ reactions, isMe }) => {
  if (!reactions || reactions.length === 0) return null;

  // Group reactions by emoji
  const groups = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        position: "absolute",
        bottom: -10,
        [isMe ? "right" : "left"]: 12,
        zIndex: 5,
      }}
    >
      {Object.entries(groups).map(([emoji, count]) => (
        <div
          key={emoji}
          style={{
            background: "white",
            borderRadius: 12,
            padding: "2px 6px",
            display: "flex",
            alignItems: "center",
            gap: 3,
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            border: "1px solid #f0f0f5",
          }}
        >
          <span style={{ fontSize: 13 }}>{emoji}</span>
          {count > 1 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: T.textMuted }}>
              {count}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CONVERSATION PAGE — exact match to reference image
// ══════════════════════════════════════════════════════════════════════════════
const ConversationPage = ({
  conv,
  onBack,
  messages,
  input,
  setInput,
  onSend,
  onInputChange,
  isRecording,
  startRecording,
  stopRecording,
  recordingDuration,
  fmtDuration,
  onClearChat,
  fileInputRef,
  onFileSelect,
  uploadPreview,
  setUploadPreview,
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiSelect,
  onReactionSelect,
  replyToMessage,
  setReplyToMessage,
  editingMessage,
  setEditingMessage,
  onForward,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [activeMsg, setActiveMsg] = useState(null);
  const longPressTimer = useRef(null);

  const handleTouchStart = (msg) => {
    longPressTimer.current = setTimeout(() => {
      setActiveMsg(msg);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: T.purple,
        position: "relative",
      }}
    >
      {/* Long Press Overlay */}
      <AnimatePresence>
        {activeMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveMsg(null)}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            {/* Reaction Bar */}
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{
                background: "white",
                borderRadius: 30,
                padding: "8px 16px",
                display: "flex",
                gap: 12,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                marginBottom: 20,
              }}
            >
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMsg(null);
                    onReactionSelect?.(emoji, activeMsg.id || activeMsg._id);
                  }}
                  style={{
                    fontSize: 24,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "transform 0.1s",
                  }}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = "scale(1.3)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {emoji}
                </button>
              ))}
            </motion.div>

            {/* Menu UI */}
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              style={{
                background: "white",
                borderRadius: 24,
                width: "100%",
                maxWidth: 280,
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
              }}
            >
              {[
                {
                  label: "Reply",
                  icon: <Ic.reply />,
                  action: () => {
                    setReplyToMessage?.(activeMsg);
                    setActiveMsg(null);
                  },
                },
                {
                  label: "Forward",
                  icon: <Ic.forward />,
                  action: () => {
                    onForward?.(activeMsg);
                    setActiveMsg(null);
                  },
                },
                {
                  label: "Edit",
                  icon: <Ic.edit />,
                  show: activeMsg.from === "me",
                  action: () => {
                    setEditingMessage?.(activeMsg);
                    setInput(activeMsg.content);
                    setActiveMsg(null);
                  },
                },
                {
                  label: "Delete",
                  icon: <Ic.trash />,
                  color: T.red,
                  action: () => {
                    onDelete?.(activeMsg.id || activeMsg._id);
                    setActiveMsg(null);
                  },
                },
              ]
                .filter((i) => i.show !== false)
                .map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      item.action();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      width: "100%",
                      padding: "14px 24px",
                      background: "none",
                      border: "none",
                      borderBottom: "1px solid #f0f0f5",
                      cursor: "pointer",
                      color: item.color || T.text,
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ color: item.color || T.purple }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER (white card style matching image) ── */}
      <div
        style={{
          background: "white",
          padding: "48px 16px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderRadius: "0 0 28px 28px",
          boxShadow: "0 4px 24px rgba(92,92,224,0.15)",
          flexShrink: 0,
          zIndex: 10,
          position: "relative",
        }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: T.text,
            padding: "4px 4px 4px 0",
            display: "flex",
          }}
        >
          <Ic.back />
        </button>

        {/* Avatar + Name */}
        <Avatar
          name={conv.name}
          src={conv.avatar}
          size={40}
          online={conv.online}
        />
        <div style={{ flex: 1, marginLeft: 6, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 16,
              color: T.text,
              letterSpacing: -0.2,
            }}
          >
            {conv.name}
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 11,
              color: conv.online ? T.green : T.textMuted,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {conv.online && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: T.green,
                  display: "inline-block",
                }}
              />
            )}
            {conv.online ? "Online" : conv.lastSeen || "Last seen recently"}
          </p>
        </div>

        {/* Action buttons — white circles with border */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1.5px solid #e8e8f0",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: T.text,
            }}
          >
            <Ic.video />
          </button>
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1.5px solid #e8e8f0",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: T.text,
            }}
          >
            <Ic.phone />
          </button>
        </div>

        {/* Overflow menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowMenu((p) => !p)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.textMuted,
              padding: "4px 0 4px 4px",
              display: "flex",
            }}
          >
            <Ic.more />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 44,
                  background: "white",
                  borderRadius: 16,
                  padding: "6px 0",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                  minWidth: 170,
                  zIndex: 200,
                }}
              >
                {[
                  "View Profile",
                  "Search in Chat",
                  "Mute Notifications",
                  "Clear Chat",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setShowMenu(false);
                      if (item === "Clear Chat" && onClearChat)
                        onClearChat(conv.id);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "12px 20px",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      fontSize: 14,
                      fontWeight: 500,
                      color: item === "Clear Chat" ? T.red : T.text,
                      cursor: "pointer",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── MESSAGES AREA ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 16px 12px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Reply preview */}
        <AnimatePresence>
          {replyToMessage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 14,
                padding: "10px 14px",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderLeft: "3px solid white",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.9)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Replying to {replyToMessage.name || "user"}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.7)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {replyToMessage.content}
                </p>
              </div>
              <button
                onClick={() => setReplyToMessage(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.7)",
                  padding: 4,
                  display: "flex",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload preview */}
        <AnimatePresence>
          {uploadPreview && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 14,
                padding: "10px 14px",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {uploadPreview.type?.startsWith("image/") ? (
                  <img
                    src={uploadPreview.preview}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    alt=""
                  />
                ) : (
                  <Ic.file />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "white",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {uploadPreview.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Ready to send
                </p>
              </div>
              <button
                onClick={() => setUploadPreview(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.7)",
                  padding: 4,
                  display: "flex",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message list */}
        {messages.map((item) => {
          // Date separator
          if (item.type === "date")
            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "10px 0",
                }}
              >
                <span
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 14px",
                    borderRadius: 20,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </span>
              </div>
            );

          const isMe = item.from === "me";

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              drag="x"
              dragConstraints={{ left: 0, right: 80 }}
              dragElastic={0.1}
              onDragEnd={(e, info) => {
                if (info.offset.x > 50) {
                  setReplyToMessage?.(item);
                  if (window.navigator.vibrate) window.navigator.vibrate(40);
                }
              }}
              onTouchStart={() => handleTouchStart(item)}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => handleTouchStart(item)}
              onMouseUp={handleTouchEnd}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: item.reactions?.length > 0 ? 18 : 7,
                position: "relative",
              }}
            >
              {/* Swipe indicator */}
              <motion.div
                style={{
                  position: "absolute",
                  left: -40,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "white",
                  opacity: 0,
                }}
                whileDrag={{ opacity: 0.8, x: 20 }}
              >
                <Ic.reply />
              </motion.div>

              <div
                style={{
                  maxWidth: "78%",
                  background: isMe ? "white" : "rgba(255,255,255,0.18)",
                  borderRadius: isMe
                    ? "20px 20px 5px 20px"
                    : "20px 20px 20px 5px",
                  padding: "11px 16px",
                  boxShadow: isMe ? "0 2px 14px rgba(0,0,0,0.10)" : "none",
                  position: "relative",
                }}
              >
                {/* Reply quote */}
                {item.replyTo && (
                  <div
                    style={{
                      background: isMe ? "#f0f0f8" : "rgba(255,255,255,0.15)",
                      borderRadius: 10,
                      padding: "6px 10px",
                      marginBottom: 6,
                      borderLeft: `3px solid ${isMe ? T.purple : "rgba(255,255,255,0.5)"}`,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        fontWeight: 700,
                        color: isMe ? T.purple : "rgba(255,255,255,0.9)",
                      }}
                    >
                      {item.replyTo.name || "User"}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: isMe ? "#666" : "rgba(255,255,255,0.7)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.replyTo.content}
                    </p>
                  </div>
                )}

                {/* Content Logic */}
                {item.type === "file" ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: isMe
                          ? "rgba(92,92,224,0.1)"
                          : "rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ic.file />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 600,
                          color: isMe ? T.text : "white",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.fileName || "File"}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: 11,
                          color: isMe ? T.textMuted : "rgba(255,255,255,0.6)",
                        }}
                      >
                        {item.fileSize || ""}
                      </p>
                    </div>
                    <button
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: isMe ? "#f0f0fa" : "rgba(255,255,255,0.2)",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: isMe ? T.purple : "white",
                      }}
                    >
                      <Ic.download />
                    </button>
                  </div>
                ) : item.type === "image" ? (
                  <div
                    style={{
                      margin: "-5px -10px 4px",
                      borderRadius: 14,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={item.mediaUrl}
                      style={{ width: "100%", display: "block" }}
                      alt=""
                    />
                  </div>
                ) : (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      color: isMe ? T.text : "white",
                      lineHeight: 1.45,
                      fontWeight: 400,
                    }}
                  >
                    {item.content}
                  </p>
                )}

                {/* Timestamp + status */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 3,
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: isMe ? "#b0b0c0" : "rgba(255,255,255,0.55)",
                    }}
                  >
                    {item.time}
                  </span>
                  {isMe && (
                    <div
                      style={{
                        display: "flex",
                        flexShrink: 0,
                        alignItems: "center",
                      }}
                    >
                      <MsgStatus status={item.status} />
                    </div>
                  )}
                </div>

                {/* Reactions */}
                <MessageReactions reactions={item.reactions} isMe={isMe} />
              </div>
            </motion.div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT BAR (white pill at bottom matching image) ── */}
      <div style={{ padding: "8px 16px 36px", flexShrink: 0 }}>
        {/* Emoji picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <div
              style={{
                position: "absolute",
                bottom: "100%",
                left: 16,
                zIndex: 1000,
                marginBottom: 12,
              }}
            >
              <EmojiPicker
                onEmojiSelect={(emoji) => {
                  onEmojiSelect(emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {editingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 14,
                padding: "10px 14px",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderLeft: `3px solid ${T.green}`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.9)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Editing Message
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.7)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {editingMessage.content}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingMessage(null);
                  setInput("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.7)",
                  padding: 4,
                  display: "flex",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={onSend}
          style={{
            display: "flex",
            alignItems: "center",
            background: "white",
            borderRadius: 32,
            padding: "6px 6px 6px 14px",
            gap: 8,
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          }}
        >
          {/* Mic icon on left (matching image) */}
          {!isRecording && !input?.trim() && !uploadPreview && (
            <button
              type="button"
              onClick={startRecording}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
                padding: "2px 2px",
              }}
            >
              <Ic.mic />
            </button>
          )}

          {/* Emoji trigger */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Ic.emoji />
          </button>

          {/* Recording state */}
          {isRecording ? (
            <div
              style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: T.red,
                  animation: "blink 1.2s infinite",
                }}
              />
              <span style={{ fontSize: 14, fontWeight: 700, color: T.red }}>
                {fmtDuration(recordingDuration)}
              </span>
              <span style={{ fontSize: 13, color: T.textMuted }}>
                Recording...
              </span>
            </div>
          ) : (
            <input
              value={input}
              onChange={onInputChange}
              onFocus={() => setShowEmojiPicker(false)}
              placeholder="Ok. Let me check"
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 15,
                color: T.text,
                padding: "8px 0",
              }}
            />
          )}

          {/* Attach button */}
          {!isRecording && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: T.textMuted,
                flexShrink: 0,
              }}
            >
              <Ic.attach />
            </button>
          )}

          {/* Refresh/secondary icon (matching image) */}
          {!isRecording && !input?.trim() && !uploadPreview && (
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Ic.refresh />
            </button>
          )}

          {/* Send OR Stop recording button */}
          {isRecording ? (
            <button
              type="button"
              onClick={() => stopRecording(true)}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: T.red,
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Ic.send />
            </button>
          ) : (
            <button
              type="submit"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: T.purple,
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: `0 4px 16px ${T.purple}50`,
              }}
            >
              <Ic.send />
            </button>
          )}
        </form>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={onFileSelect}
        />
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }`}</style>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CHAT LIST PAGE
// ══════════════════════════════════════════════════════════════════════════════
const ChatListPage = ({ conversations, onSelectConv, externalSearch = "" }) => {
  const [filter, setFilter] = useState("All Chats");

  const filtered = conversations.filter((c) => {
    const matchSearch = c.name
      .toLowerCase()
      .includes(externalSearch.toLowerCase());
    if (filter === "Groups") return c.type === "group" && matchSearch;
    if (filter === "Contacts") return c.type === "direct" && matchSearch;
    return matchSearch;
  });

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "white" }}>
      {/* Filter pills */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "4px 20px 16px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {["All Chats", "Groups", "Contacts"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 18px",
              borderRadius: 22,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0,
              transition: "all 0.18s",
              background: filter === f ? T.purple : "#f3f3fb",
              color: filter === f ? "white" : "#666",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            color: T.textMuted,
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 600 }}>
            No conversations found
          </p>
        </div>
      ) : (
        filtered.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelectConv(conv)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 20px",
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              borderBottom: "1px solid #f5f5fc",
              transition: "background 0.12s",
            }}
            onTouchStart={(e) => (e.currentTarget.style.background = "#f8f8fd")}
            onTouchEnd={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <Avatar
              name={conv.name}
              src={conv.avatar}
              size={52}
              online={conv.online}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span
                    style={{ fontWeight: 700, fontSize: 15, color: T.text }}
                  >
                    {conv.name}
                  </span>
                  {conv.pinned && <Ic.pin />}
                </div>
                <span
                  style={{ fontSize: 11, color: T.textMuted, flexShrink: 0 }}
                >
                  {conv.time}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: conv.typing ? T.purple : T.textMuted,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontStyle: conv.typing ? "italic" : "normal",
                  }}
                >
                  {conv.lastMsg}
                </span>
                {conv.unread > 0 && (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: T.purple,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginLeft: 6,
                    }}
                  >
                    <span
                      style={{ fontSize: 11, color: "white", fontWeight: 700 }}
                    >
                      {conv.unread}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// STATUS PAGE
// ══════════════════════════════════════════════════════════════════════════════
const StatusPage = ({ onBack }) => (
  <div style={{ background: "white", flex: 1, overflowY: "auto" }}>
    <div
      style={{
        padding: "56px 24px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid #f5f5fc",
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: T.text,
        }}
      >
        <Ic.back />
      </button>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>
        Status
      </h2>
    </div>
    <div style={{ padding: "16px 24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 0",
          borderBottom: "1px solid #f5f5fc",
          cursor: "pointer",
        }}
      >
        <div style={{ position: "relative" }}>
          <Avatar name="Me" size={52} />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: T.purple,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid white",
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: 14,
                lineHeight: 1,
                fontWeight: 700,
              }}
            >
              +
            </span>
          </div>
        </div>
        <div>
          <p
            style={{ margin: 0, fontWeight: 700, fontSize: 15, color: T.text }}
          >
            My Status
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textMuted }}>
            Tap to add status update
          </p>
        </div>
      </div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "#c0c0cc",
          textTransform: "uppercase",
          letterSpacing: 1.2,
          margin: "20px 0 12px",
        }}
      >
        Recent Updates
      </p>
      {[
        { name: "Larry Machigo", time: "9:38 AM" },
        { name: "Natalie Nora", time: "9:22 AM" },
      ].map((s) => (
        <div
          key={s.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 0",
            borderBottom: "1px solid #f8f8fc",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              padding: 2,
              background: `linear-gradient(135deg, ${T.purple}, #8b5cf6)`,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Avatar name={s.name} size={44} />
            </div>
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: 14,
                color: T.text,
              }}
            >
              {s.name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textMuted }}>
              Today at {s.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// CALLS PAGE
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// CONTACT PERMISSION MODAL
// ══════════════════════════════════════════════════════════════════════════════
const ContactPermissionModal = ({ onAllow, onDeny }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 2000,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      style={{
        background: "white",
        borderRadius: 32,
        padding: 32,
        width: "100%",
        maxWidth: 340,
        textAlign: "center",
        boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `${T.purple}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          color: T.purple,
        }}
      >
        <Ic.contacts />
      </div>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 900,
          color: T.text,
          margin: "0 0 12px",
          letterSpacing: -0.5,
        }}
      >
        Find Your Friends
      </h2>
      <p
        style={{
          fontSize: 15,
          color: T.textMuted,
          lineHeight: 1.6,
          margin: "0 0 32px",
        }}
      >
        Samvaad is a secure messaging app. Sync your contacts to see who else is
        here and start chatting only with people you know.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={onAllow}
          style={{
            background: T.purple,
            color: "white",
            border: "none",
            borderRadius: 18,
            padding: "16px",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: `0 8px 20px ${T.purple}40`,
          }}
        >
          Sync Contacts
        </button>
        <button
          onClick={onDeny}
          style={{
            background: "#f5f5fa",
            color: T.textMuted,
            border: "none",
            borderRadius: 18,
            padding: "14px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Not Now
        </button>
      </div>
      <p style={{ fontSize: 11, color: "#aaa", marginTop: 24 }}>
        Your contacts are encrypted and we never share them with anyone.
      </p>
    </motion.div>
  </motion.div>
);

const CallsPage = ({ onBack, conversations }) => (
  <div style={{ background: "white", flex: 1, overflowY: "auto" }}>
    <div
      style={{
        padding: "56px 24px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid #f5f5fc",
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: T.text,
        }}
      >
        <Ic.back />
      </button>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>
        Calls
      </h2>
    </div>
    <div style={{ padding: "0 16px" }}>
      {conversations.slice(0, 5).map((c, i) => (
        <div
          key={c.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "13px 8px",
            borderBottom: "1px solid #f8f8fc",
          }}
        >
          <Avatar name={c.name} size={48} online={c.online} />
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: 15,
                color: T.text,
              }}
            >
              {c.name}
            </p>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 12,
                color: i % 2 === 0 ? T.green : T.red,
              }}
            >
              {i % 2 === 0 ? "↙ Incoming" : "↗ Missed"} · {c.time}
            </p>
          </div>
          <button
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: `${T.purple}18`,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: T.purple,
            }}
          >
            <Ic.phone />
          </button>
        </div>
      ))}
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// NEW CHAT MODAL (bottom sheet)
// ══════════════════════════════════════════════════════════════════════════════
const NewChatModal = ({
  onClose,
  conversations,
  allUsers = [],
  onSelectConv,
  userId,
}) => {
  // Combine conversations and all users, removing duplicates and current user
  const existingUserIds = new Set(
    conversations.map((c) => c.userId || c.participantId),
  );
  const uniqueUsers = allUsers.filter((u) => !existingUserIds.has(u._id));

  const displayList = [
    ...conversations,
    ...uniqueUsers.map((u) => ({
      id: u._id,
      userId: u._id,
      name: u.username || u.name,
      avatar: u.avatar,
      online: u.isOnline,
      original: u,
    })),
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "flex-end",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 34 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "white",
            borderRadius: "24px 24px 0 0",
            width: "100%",
            maxHeight: "70%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "20px 20px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              borderBottom: "1px solid #f5f5fc",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                color: T.text,
              }}
            >
              New Chat
            </h3>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#f5f5fa",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#666",
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
            {displayList.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: T.textMuted,
                  padding: "20px",
                }}
              >
                No users available
              </p>
            ) : (
              displayList.map((item) => (
                <button
                  key={item.id || item.userId}
                  onClick={() => {
                    onSelectConv(item.original || item);
                    onClose();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 20px",
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f5f5fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <Avatar
                    name={item.name}
                    src={item.avatar}
                    size={46}
                    online={item.online}
                  />
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: 15,
                        color: T.text,
                      }}
                    >
                      {item.name}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 12,
                        color: item.online ? T.green : T.textMuted,
                      }}
                    >
                      {item.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
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
    syncContacts,
    deleteMessage,
    editMessage,
    forwardMessage,
    statuses = [],
    incomingCall,
    activeCall,
    fmtLastSeen,
    updateProfile,
    updateSettings,
    uploadAvatar,
    onUserUpdate,
    updateAppLock,
  } = props;

  const [page, setPage] = useState("chats");
  const [activeTab, setActiveTab] = useState("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showContactAuth, setShowContactAuth] = useState(false);
  const [dbContacts, setDbContacts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [editingMessage, setEditingMessage] = useState(null);

  // Fetch contacts from database
  useEffect(() => {
    if (token) {
      getContacts(token)
        .then((res) => {
          if (res.contacts) {
            setDbContacts(res.contacts);
            console.log("✅ Loaded contacts from database:", res.contacts);
          }
        })
        .catch((err) => console.error("❌ Failed to fetch contacts:", err));
    }
  }, [token]);

  // Fetch all users from database for new chat
  useEffect(() => {
    if (token) {
      getUsers(token)
        .then((res) => {
          if (res.users) {
            const filteredUsers = res.users.filter((u) => u._id !== userId); // Exclude current user
            setAllUsers(filteredUsers);
            console.log("✅ Loaded all users from database:", filteredUsers);
          }
        })
        .catch((err) => console.error("❌ Failed to fetch users:", err));
    }
  }, [token, userId]);

  // Initial contact check
  useEffect(() => {
    if (
      user &&
      !user.settings?.syncContactsEnabled &&
      !localStorage.getItem("contacts_asked")
    ) {
      setTimeout(() => setShowContactAuth(true), 1500);
    }
  }, [user]);

  const handleSync = async () => {
    localStorage.setItem("contacts_asked", "true");
    try {
      // Fetch contacts from database instead of device
      const res = await getContacts(token);
      if (res.contacts) {
        setDbContacts(res.contacts);
        console.log("✅ Synced contacts from database:", res.contacts);
        await updateSettings?.({ settings: { syncContactsEnabled: true } });
      }
    } catch (err) {
      console.error("❌ Error syncing contacts:", err);
    } finally {
      setShowContactAuth(false);
    }
  };
  useEffect(() => {
    if (selectedConversation && page !== "conversation")
      setPage("conversation");
    else if (!selectedConversation && page === "conversation") setPage("chats");
  }, [selectedConversation]);

  const navigateTo = (tab) => {
    setActiveTab(tab);
    setPage(tab);
    if (tab !== "conversation") setSelectedConversation?.(null);
  };

  const openConversation = (conv) => {
    setSelectedConversation?.(conv);
    setPage("conversation");
  };

  const goBack = () => {
    setSelectedConversation?.(null);
    setPage(activeTab === "conversation" ? "chats" : activeTab);
    setActiveTab((t) => (t === "conversation" ? "chats" : t));
  };

  // Map backend messages → internal format
  const mappedMessages = messages.map((msg) => {
    if (msg.type === "date") return msg;
    const isMe = msg.sender === "user" || msg.sender?._id === userId;
    return {
      id: msg._id || msg.id,
      content: msg.content,
      from: isMe ? "me" : "them",
      time: msg.timestamp
        ? new Date(msg.timestamp).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })
        : msg.time,
      status: msg.status || "sent",
      type: msg.type || "text",
      mediaUrl: msg.mediaUrl,
      fileName: msg.fileName,
      fileSize: msg.fileSize,
      replyTo: msg.replyTo,
      reactions: msg.reactions,
    };
  });

  // Map conversations for the list
  const mappedConvs = conversations.map((c) => ({
    original: c,
    id: c._id,
    name: getConversationName(c),
    avatar: getConversationAvatar(c),
    lastMsg: c.lastMessage
      ? c.lastMessage.type === "image"
        ? "📷 Photo"
        : c.lastMessage.type === "file"
          ? "📎 " + (c.lastMessage.fileName || "File")
          : c.lastMessage.content || ""
      : "No messages yet",
    time: c.lastMessage?.timestamp
      ? new Date(c.lastMessage.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    unread: c.unreadCount?.[userId] || 0,
    online: isUserOnline(c),
    pinned: c.pinnedBy?.some((id) => (id._id || id) === userId),
    type: c.type || "direct",
    typing: !!typingUsers[c._id],
  }));

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 430,
        height: "100vh",
        margin: "0 auto",
        background: "white",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── PAGE CONTENT ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          paddingBottom: page === "conversation" ? 0 : 88,
        }}
      >
        {/* ─── CHATS PAGE ─── */}
        {page === "chats" && (
          <>
            {/* Header */}
            <div style={{ padding: "52px 20px 12px", background: "white" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {isSearchVisible ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      background: "#f5f5fb",
                      borderRadius: 14,
                      padding: "2px 14px",
                      marginRight: 8,
                    }}
                  >
                    <Ic.search />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search chats..."
                      style={{
                        flex: 1,
                        padding: "10px 10px",
                        background: "none",
                        border: "none",
                        outline: "none",
                        fontSize: 15,
                        color: T.text,
                      }}
                    />
                    <button
                      onClick={() => {
                        setIsSearchVisible(false);
                        setSearchQuery("");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: T.textMuted,
                        fontSize: 18,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      onClick={() => navigateTo("settings")}
                      style={{ cursor: "pointer" }}
                    >
                      <Avatar
                        src={user?.avatar}
                        name={user?.name || "U"}
                        size={46}
                      />
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: T.textMuted,
                          fontWeight: 500,
                        }}
                      >
                        Hello,
                      </p>
                      <h1
                        style={{
                          margin: "1px 0 0",
                          fontSize: 23,
                          fontWeight: 900,
                          color: T.text,
                          letterSpacing: -0.5,
                        }}
                      >
                        {user?.name?.split(" ")[0] || "User"}
                      </h1>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, position: "relative" }}>
                  {!isSearchVisible && (
                    <button
                      onClick={() => setIsSearchVisible(true)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#f5f5fb",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: T.text,
                      }}
                    >
                      <Ic.search />
                    </button>
                  )}
                  <button
                    onClick={() => setShowMoreMenu((p) => !p)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#f5f5fb",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: T.text,
                    }}
                  >
                    <Ic.more />
                  </button>

                  <AnimatePresence>
                    {showMoreMenu && (
                      <>
                        <div
                          onClick={() => setShowMoreMenu(false)}
                          style={{ position: "fixed", inset: 0, zIndex: 99 }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          style={{
                            position: "absolute",
                            top: 48,
                            right: 0,
                            background: "white",
                            borderRadius: 16,
                            padding: "8px 0",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                            minWidth: 180,
                            zIndex: 100,
                          }}
                        >
                          {[
                            {
                              label: "Search",
                              action: () => {
                                setIsSearchVisible(true);
                                setShowMoreMenu(false);
                              },
                            },
                            {
                              label: "New Group",
                              action: () => {
                                setShowNewChatModal?.(true);
                                setShowMoreMenu(false);
                              },
                            },
                            {
                              label: "Settings",
                              action: () => {
                                navigateTo("settings");
                                setShowMoreMenu(false);
                              },
                            },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={item.action}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                padding: "12px 20px",
                                background: "none",
                                border: "none",
                                textAlign: "left",
                                fontSize: 14,
                                fontWeight: 500,
                                color: T.text,
                                cursor: "pointer",
                              }}
                            >
                              {item.label}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <ChatListPage
              externalSearch={searchQuery}
              conversations={mappedConvs}
              onSelectConv={(conv) => openConversation(conv.original || conv)}
            />
          </>
        )}

        {/* ─── CONVERSATION PAGE ─── */}
        {page === "conversation" && selectedConversation && (
          <ConversationPage
            conv={{
              id: selectedConversation._id,
              name: getConversationName(selectedConversation),
              online: isUserOnline(selectedConversation),
              avatar: getConversationAvatar(selectedConversation),
              lastSeen: fmtLastSeen
                ? fmtLastSeen(getLastSeen?.(selectedConversation))
                : "Last seen recently",
            }}
            onReactionSelect={(emoji, mid) => addReaction?.(mid, emoji)}
            editingMessage={editingMessage}
            setEditingMessage={setEditingMessage}
            onSend={(e) => {
              if (editingMessage) {
                e?.preventDefault();
                editMessage?.(
                  editingMessage.id || editingMessage._id,
                  newMessage,
                );
                setEditingMessage(null);
                setNewMessage("");
              } else {
                handleSend(e);
              }
            }}
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
            onForward={(msg) => {
              setForwardMessageData?.(msg);
              setShowForwardModal?.(true);
            }}
            onDelete={(id) => deleteMessage?.(id, "me")}
            messages={mappedMessages}
            input={newMessage}
            setInput={setNewMessage}
          />
        )}

        {/* ─── STATUS PAGE ─── */}
        {page === "status" && <StatusPage onBack={goBack} />}

        {/* ─── CALLS PAGE ─── */}
        {page === "calls" && (
          <CallsPage onBack={goBack} conversations={mappedConvs} />
        )}

        {/* ─── SETTINGS PAGE ─── */}
        {page === "settings" && (
          <SettingsScreen
            onBack={() => {
              setPage("chats");
              setActiveTab("chats");
            }}
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

      <AnimatePresence>
        {showContactAuth && (
          <ContactPermissionModal
            onAllow={handleSync}
            onDeny={() => {
              setShowContactAuth(false);
              localStorage.setItem("contacts_asked", "true");
            }}
          />
        )}
      </AnimatePresence>

      {/* ── BOTTOM NAVIGATION BAR ── */}
      {page !== "conversation" && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 430,
            padding: "0 20px 20px",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: T.navBg,
              borderRadius: 40,
              padding: "10px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 8px 40px rgba(30,27,56,0.35)",
              pointerEvents: "all",
              position: "relative",
            }}
          >
            {/* LEFT: Status + Calls */}
            <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
              {[
                { tab: "status", label: "Status", Icon: Ic.status },
                { tab: "calls", label: "Calls", Icon: Ic.calls },
              ].map(({ tab, label, Icon }) => (
                <button
                  key={tab}
                  onClick={() => navigateTo(tab)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color:
                      activeTab === tab ? T.purple : "rgba(255,255,255,0.38)",
                    transition: "color 0.2s",
                  }}
                >
                  <Icon />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: 0.2,
                    }}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>

            {/* CENTER FAB */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: 14,
              }}
            >
              <button
                onClick={() => setShowNewChatModal?.(true)}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${T.purple}, ${T.purpleLight})`,
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: `0 6px 24px ${T.purple}60`,
                }}
              >
                <Ic.plus />
              </button>
            </div>

            {/* RIGHT: Chat + Settings */}
            <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
              {[
                {
                  tab: "chats",
                  label: "Chat",
                  Icon: () =>
                    activeTab === "chats" ? <Ic.chatFill /> : <Ic.chatOut />,
                },
                { tab: "settings", label: "Settings", Icon: Ic.settings },
              ].map(({ tab, label, Icon }) => (
                <button
                  key={tab}
                  onClick={() => navigateTo(tab)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color:
                      activeTab === tab ? T.purple : "rgba(255,255,255,0.38)",
                    transition: "color 0.2s",
                  }}
                >
                  <Icon />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: 0.2,
                    }}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── NEW CHAT MODAL ── */}
      {showNewChatModal && (
        <NewChatModal
          conversations={mappedConvs}
          allUsers={allUsers}
          userId={userId}
          onClose={() => setShowNewChatModal?.(false)}
          onSelectConv={(conv) => {
            openConversation(conv.original || conv);
            setShowNewChatModal?.(false);
          }}
        />
      )}
    </div>
  );
}
