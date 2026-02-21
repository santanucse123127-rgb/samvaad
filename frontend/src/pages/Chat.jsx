import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Smile, Phone, Video, MoreVertical, Search, X, Plus,
  Trash2, LogOut, Settings, Image as ImageIcon, Users,
  ChevronDown, File, MessageSquare, Check, Clipboard, Lock,
  Mic, StopCircle, Play, Pause,
} from "lucide-react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import NewChatModal from "../components/NewChatModal";
import ContactSyncGateway from "../components/ContactSyncGateway";
import MessageItem from "../components/Chat/MessageItem";
import EmojiPicker from "../components/Chat/EmojiPicker";
import PollModal from "../components/Chat/PollModal";
import ScheduleModal from "../components/Chat/ScheduleModal";
import CodeModal from "../components/Chat/CodeModal";
import GroupInfoModal from "../components/GroupInfoModal";
import TypingIndicator from "../components/Chat/TypingIndicator";
import CallInterface from "../components/Chat/CallInterface";
import ClipboardSync from "../components/Chat/ClipboardSync";
import WallpaperModal from "../components/Chat/WallpaperModal";
import TimeCapsuleModal from "../components/Chat/TimeCapsuleModal";
import MyProfilePanel from "../components/MyProfilePanel";
import { getUsers } from "../services/chatAPI";

/* ───────────────────────── helpers ───────────────────────── */
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "";
const fmtDate = (d) => {
  if (!d) return "";
  const now = new Date(); const date = new Date(d);
  const diff = Math.floor((now - date) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
const fmtLastSeen = (ls) => {
  if (!ls) return "Last seen: unknown";
  const date = new Date(ls);
  const now = new Date();
  const diff = Math.floor((now - date) / 86400000);
  let datePart;
  if (diff === 0) datePart = "today";
  else if (diff === 1) datePart = "yesterday";
  else if (diff < 7) datePart = date.toLocaleDateString("en-US", { weekday: "long" });
  else datePart = date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  const timePart = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `Last seen ${datePart} at ${timePart}`;
};

/* ─── Avatar ─── */
const Avatar = ({ src, name, size = 10, online = false }) => (
  <div className="relative flex-shrink-0" style={{ width: `${size * 4}px`, height: `${size * 4}px` }}>
    <div className="sv-avatar w-full h-full text-base font-bold rounded-full overflow-hidden">
      {src
        ? <img src={src} alt={name} className="w-full h-full object-cover" />
        : <span className="flex items-center justify-center w-full h-full" style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)/0.3), hsl(var(--sv-accent-2)/0.3))' }}>
          {name?.[0]?.toUpperCase()}
        </span>
      }
    </div>
    {online && <span className="sv-online-dot" />}
  </div>
);

/* ─── BG options ─── */
const BG_OPTIONS = [
  { id: "default", label: "Default", cls: "chatbg-default" },
  { id: "gradient", label: "Gradient", cls: "chatbg-gradient" },
  { id: "midnight", label: "Midnight", cls: "chatbg-midnight" },
  { id: "ocean", label: "Ocean", cls: "chatbg-ocean" },
  { id: "forest", label: "Forest", cls: "chatbg-forest" },
  { id: "doodle", label: "Pattern", cls: "chatbg-doodle" },
];

/* ═══════════════════════════ MAIN COMPONENT ═══════════════════════════ */
const Chat = ({ token }) => {
  const {
    conversations, selectedConversation, setSelectedConversation,
    messages, loading, typingUsers, recordingVoice,
    sendMessage, sendMediaMessage, createNewConversation,
    handleTyping, handleStopTyping,
    getConversationName, getConversationAvatar, isUserOnline, getLastSeen,
    addReaction, notification, setNotification,
    userId, conversationWallpapers, setConversationWallpaper,
    setActiveCall, createGroupConversation, groupInvite, setGroupInvite, respondGroupInvite,
  } = useChat();

  const { user, logout } = useAuth();

  /* ─── Local state ─── */
  const [newMessage, setNewMessage] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showTimeCapsuleModal, setShowTimeCapsuleModal] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [mobileShowSidebar, setMobileShowSidebar] = useState(true);
  const [chatBg, setChatBg] = useState(() => localStorage.getItem("samvaad-chatbg") || "default");
  const [, setTick] = useState(0);
  const [showClipboard, setShowClipboard] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageContainerRef = useRef(null);
  const moreMenuRef = useRef(null);
  const sidebarMenuRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  // Force relative-time re-render every minute
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 60000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false);
      if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(e.target)) setShowSidebarMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ─── Derived ─── */
  const filteredConversations = useMemo(() =>
    conversations.filter(c => getConversationName(c).toLowerCase().includes(searchQuery.toLowerCase())),
    [conversations, searchQuery, getConversationName]
  );

  const isTyping = selectedConversation && typingUsers[selectedConversation._id];
  const currentBgCls = BG_OPTIONS.find(b => b.id === chatBg)?.cls || "chatbg-default";

  /* ─── Handlers ─── */
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() && !uploadPreview) return;
    if (uploadPreview) {
      const type = uploadPreview.type.startsWith("image/") ? "image"
        : uploadPreview.type.startsWith("video/") ? "video"
          : uploadPreview.type.startsWith("audio/") ? "voice" : "file";
      await sendMediaMessage(uploadPreview.file, type);
      setUploadPreview(null);
    } else {
      await sendMessage(newMessage, "text", replyToMessage?.id);
    }
    setNewMessage("");
    setReplyToMessage(null);
    handleStopTyping();
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview({ file, preview: ev.target.result, type: file.type, name: file.name });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleNewChat = async (user) => {
    const result = await createNewConversation(user);
    if (result.success) setShowNewChatModal(false);
    return result;
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(p => p + emoji);
    setShowEmojiPicker(false);
  };

  const handleBgChange = (bgId) => {
    setChatBg(bgId);
    localStorage.setItem("samvaad-chatbg", bgId);
    setShowBgPicker(false);
    setShowMoreMenu(false);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 120);
  };

  const handleCreatePoll = async (pollData) => {
    await sendMessage(pollData.question, "poll", null, {
      pollQuestion: pollData.question, pollOptions: pollData.options, allowMultipleAnswers: pollData.allowMultiple
    });
  };

  const handleScheduleMessage = async (date) => {
    if (!newMessage.trim()) return;
    await sendMessage(newMessage, "text", null, { scheduledAt: date });
    setNewMessage("");
  };

  const handleSendCode = async (codeData) => {
    await sendMessage(codeData.code, "code", null, { codeLanguage: codeData.language });
  };

  const handleTimeCapsule = async (unlockDate) => {
    if (!newMessage.trim()) return;
    await sendMessage(newMessage, "text", null, { unlockAt: unlockDate });
    setNewMessage("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "voice_message.webm", { type: 'audio/webm' });

        // Duration in seconds
        const duration = Math.floor(recordingDuration);

        await sendMediaMessage(audioFile, "voice", { duration });

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Notify others via socket
      socketService.emit("user-recording-voice", {
        conversationId: selectedConversation._id,
        userId: userId
      });
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone");
    }
  };

  const stopRecording = (shouldSend = true) => {
    if (mediaRecorderRef.current && isRecording) {
      if (!shouldSend) {
        // Clear chunks if we want to cancel
        audioChunksRef.current = [];
      }
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);

      socketService.emit("user-stopped-recording-voice", {
        conversationId: selectedConversation._id
      });
    }
  };

  const fmtDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    setShowSidebarMenu(false);
    logout();
  };

  /* ─── Message date separators ─── */
  const messagesWithDates = useMemo(() => {
    const result = [];
    let lastDate = null;
    messages.forEach((msg) => {
      const d = fmtDate(msg.timestamp);
      if (d !== lastDate) { result.push({ type: "date", label: d, id: `date-${d}` }); lastDate = d; }
      result.push({ type: "message", ...msg });
    });
    return result;
  }, [messages]);

  /* ══════════════════════════ RENDER ══════════════════════════ */
  return (
    <ContactSyncGateway>
      <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(var(--sv-bg))' }}>

        {/* ── In-app notification toast ── */}
        <AnimatePresence>
          {notification && (
            <motion.div
              className="sv-toast cursor-pointer"
              initial={{ opacity: 0, y: -24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24 }}
              onClick={() => {
                const c = conversations.find(c => c._id === notification.conversationId);
                if (c) { setSelectedConversation(c); setMobileShowSidebar(false); }
                setNotification(null);
              }}>
              <Avatar src={notification.sender?.avatar} name={notification.sender?.name} size={9} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'hsl(var(--sv-text))' }}>{notification.sender?.name}</p>
                <p className="text-xs truncate" style={{ color: 'hsl(var(--sv-text-2))' }}>{notification.content}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); setNotification(null); }} className="sv-icon-btn p-1.5 rounded-lg">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Group invite toast ── */}
        <AnimatePresence>
          {groupInvite && (
            <motion.div
              className="sv-toast"
              style={{ top: notification ? '90px' : '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', maxWidth: '360px', padding: '14px 16px' }}
              initial={{ opacity: 0, y: -24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24 }}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                  style={{ background: 'hsl(var(--sv-accent)/0.15)', color: 'hsl(var(--sv-accent))' }}>
                  {groupInvite.groupAvatar
                    ? <img src={groupInvite.groupAvatar} className="w-full h-full object-cover rounded-xl" alt="" />
                    : groupInvite.groupName?.[0]?.toUpperCase()
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'hsl(var(--sv-text))' }}>Group Invite</p>
                  <p className="text-xs truncate" style={{ color: 'hsl(var(--sv-text-2))' }}>
                    <span style={{ color: 'hsl(var(--sv-accent))' }}>{groupInvite.invitedBy?.name}</span> invited you to <strong>{groupInvite.groupName}</strong>
                  </p>
                </div>
                <button onClick={() => setGroupInvite(null)} className="sv-icon-btn p-1 rounded-lg flex-shrink-0"><X size={13} /></button>
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={async () => { await respondGroupInvite(groupInvite.conversationId, false); }}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold border"
                  style={{ borderColor: 'hsl(var(--sv-border))', color: 'hsl(var(--sv-text-2))' }}>
                  Decline
                </button>
                <button
                  onClick={async () => {
                    const res = await respondGroupInvite(groupInvite.conversationId, true);
                    if (res?.success && res?.data) {
                      setSelectedConversation(res.data);
                      setMobileShowSidebar(false);
                    }
                  }}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'hsl(var(--sv-accent))', color: 'white' }}>
                  Join Group
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile backdrop */}
        <AnimatePresence>
          {mobileShowSidebar && (
            <motion.div
              className="fixed inset-0 bg-black/60 z-[19] md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileShowSidebar(false)}
            />
          )}
        </AnimatePresence>

        <aside
          className={`sv-sidebar z-20 transition-transform duration-300 ease-in-out
          fixed md:relative inset-y-0 left-0 h-full md:h-auto
          ${mobileShowSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center gap-2 px-3 py-3 border-b flex-shrink-0" style={{ borderColor: 'hsl(var(--sv-border) / 0.5)' }}>
            <Avatar src={user?.avatar} name={user?.name} size={9} online />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: 'hsl(var(--sv-text))' }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'hsl(var(--sv-text-2))' }}>{user?.email}</p>
            </div>
            {/* New chat */}
            <button id="new-chat-btn" onClick={() => setShowNewChatModal(true)} title="New chat"
              className="sv-icon-btn w-8 h-8 rounded-xl flex-shrink-0" style={{ background: 'hsl(var(--sv-accent)/0.12)', color: 'hsl(var(--sv-accent))' }}>
              <Plus size={15} />
            </button>
            {/* Clipboard Sync */}
            <button
              id="clipboard-sync-btn"
              onClick={() => { setShowClipboard(p => !p); setShowProfile(false); }}
              title="Clipboard Sync"
              className="sv-icon-btn w-8 h-8 rounded-xl flex-shrink-0"
              style={showClipboard ? { background: 'hsl(var(--sv-accent)/0.12)', color: 'hsl(var(--sv-accent))' } : {}}
            >
              <Clipboard size={15} />
            </button>
            {/* Sidebar 3-dot menu */}
            <div className="relative flex-shrink-0" ref={sidebarMenuRef}>
              <button id="sidebar-menu-btn" onClick={() => setShowSidebarMenu(p => !p)}
                className="sv-icon-btn w-8 h-8 rounded-xl">
                <MoreVertical size={15} />
              </button>
              <AnimatePresence>
                {showSidebarMenu && (
                  <motion.div
                    className="sv-dropdown right-0 top-10"
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}>
                    <button className="sv-dropdown-item" onClick={() => { setShowMyProfile(true); setShowSidebarMenu(false); }}>
                      <Settings size={15} /> Profile & Settings
                    </button>
                    <button className="sv-dropdown-item" onClick={() => { setShowNewChatModal(true); setShowSidebarMenu(false); }}>
                      <MessageSquare size={15} /> New Chat
                    </button>
                    <div className="my-1 h-px" style={{ background: 'hsl(var(--sv-border))' }} />
                    <button className="sv-dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={15} /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search */}
          <div className="px-3 py-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--sv-text-3))' }} />
              <input
                type="text"
                placeholder="Search conversations…"
                className="sv-input pl-8 py-2 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto scrollbar-custom px-2 pb-4">
            {loading && filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(var(--sv-accent))' }} />
                <p className="text-xs" style={{ color: 'hsl(var(--sv-text-3))' }}>Loading chats…</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <MessageSquare size={32} style={{ color: 'hsl(var(--sv-text-3))' }} />
                <p className="text-sm" style={{ color: 'hsl(var(--sv-text-3))' }}>No conversations yet</p>
                <button onClick={() => setShowNewChatModal(true)} className="sv-btn-primary text-xs px-4 py-2">
                  Start a chat
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = selectedConversation?._id === conv._id;
                const convName = getConversationName(conv);
                const convAvatar = getConversationAvatar(conv);
                const online = isUserOnline(conv);
                const unread = conv.unreadCount?.[userId] || 0;
                const lastMsg = conv.lastMessage;

                return (
                  <motion.div
                    key={conv._id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedConversation(conv); setMobileShowSidebar(false); }}
                    className={`sv-conv-item mb-0.5 ${isActive ? "active" : ""}`}
                  >
                    <Avatar src={convAvatar} name={convName} size={11} online={online} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          <span className="font-semibold text-sm truncate" style={{ color: 'hsl(var(--sv-text))' }}>{convName}</span>
                          {conv.type === 'one-on-one' && (
                            <Lock size={10} style={{ color: 'hsl(var(--sv-text-3))' }} title="End-to-end encrypted" />
                          )}
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: 'hsl(var(--sv-text-3))' }}>
                          {lastMsg ? fmtTime(lastMsg.createdAt) : ""}
                        </span>
                      </div>
                      {conv.type !== "group" && (
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] flex items-center gap-1" style={{ color: online ? 'hsl(var(--sv-online))' : 'hsl(var(--sv-text-3))' }}>
                            {online
                              ? <><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'hsl(var(--sv-online))', display: 'inline-block', flexShrink: 0 }} />Online</>
                              : fmtLastSeen(getLastSeen(conv))
                            }
                          </span>
                          {unread > 0 && (
                            <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 flex-shrink-0"
                              style={{ background: 'hsl(var(--sv-accent))', color: 'white', minWidth: '18px', textAlign: 'center' }}>
                              {unread > 99 ? "99+" : unread}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs truncate pr-2" style={{ color: 'hsl(var(--sv-text-3))' }}>
                          {lastMsg ? (lastMsg.type === "image" ? "📷 Photo" : lastMsg.type === "file" ? "📎 File" : lastMsg.content) : "No messages yet"}
                        </p>
                        {conv.type === "group" && unread > 0 && (
                          <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 flex-shrink-0"
                            style={{ background: 'hsl(var(--sv-accent))', color: 'white', minWidth: '18px', textAlign: 'center' }}>
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </aside>

        {/* ═══════ MAIN CHAT AREA ═══════ */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <CallInterface />

          {selectedConversation ? (
            /* Chat column + profile/clipboard panels sit side by side */
            <div className="flex flex-1 min-h-0 overflow-hidden">

              {/* ── Chat column ── */}
              <div className="flex flex-col flex-1 min-w-0 min-h-0">

                {/* Chat Header */}
                <header className="flex items-center gap-2 px-3 md:px-4 py-3 border-b flex-shrink-0 z-10"
                  style={{ background: 'hsl(var(--sv-surface))', borderColor: 'hsl(var(--sv-border) / 0.5)' }}>
                  {/* Mobile: back to sidebar */}
                  <button className="md:hidden sv-icon-btn w-8 h-8 rounded-xl flex-shrink-0" onClick={() => setMobileShowSidebar(true)}>
                    <ChevronDown size={18} className="rotate-90" />
                  </button>

                  <button onClick={() => setShowProfile(p => !p)} className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer group">
                    <Avatar
                      src={getConversationAvatar(selectedConversation)}
                      name={getConversationName(selectedConversation)}
                      size={9}
                      online={isUserOnline(selectedConversation)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm md:text-base truncate" style={{ color: 'hsl(var(--sv-text))' }}>
                          {getConversationName(selectedConversation)}
                        </h3>
                        {selectedConversation.type === 'one-on-one' && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-sv-online/10" title="End-to-end encrypted">
                            <Lock size={10} className="text-sv-online" />
                            <span className="text-[9px] font-bold text-sv-online uppercase tracking-tight">E2EE</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs flex items-center gap-1" style={{ color: 'hsl(var(--sv-text-3))', minHeight: '16px' }}>
                        {isTyping ? (
                          <span className="sv-header-typing-dots">
                            {[0, 1, 2, 3].map(i => (
                              <span key={i} className="sv-typing-dot" style={{ animationDelay: `${i * 0.16}s` }} />
                            ))}
                          </span>
                        ) : selectedConversation.type === "group"
                          ? `${selectedConversation.participants?.length || 0} members`
                          : isUserOnline(selectedConversation) ? "online" : fmtLastSeen(getLastSeen(selectedConversation))
                        }
                      </p>
                    </div>
                  </button>

                  {/* Action buttons */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button id="voice-call-btn" title="Voice call" onClick={() => {
                      const other = selectedConversation?.participants?.find(p => p._id !== userId);
                      setActiveCall({ type: "voice", otherUser: other || selectedConversation });
                    }} className="sv-icon-btn w-8 h-8 md:w-9 md:h-9 rounded-xl">
                      <Phone size={16} />
                    </button>
                    <button id="video-call-btn" title="Video call" onClick={() => {
                      const other = selectedConversation?.participants?.find(p => p._id !== userId);
                      setActiveCall({ type: "video", otherUser: other || selectedConversation });
                    }} className="sv-icon-btn w-8 h-8 md:w-9 md:h-9 rounded-xl">
                      <Video size={16} />
                    </button>

                    {/* 3-dot menu */}
                    <div className="relative" ref={moreMenuRef}>
                      <button id="chat-more-btn" onClick={() => setShowMoreMenu(p => !p)}
                        className="sv-icon-btn w-8 h-8 md:w-9 md:h-9 rounded-xl">
                        <MoreVertical size={16} />
                      </button>
                      <AnimatePresence>
                        {showMoreMenu && (
                          <motion.div
                            className="sv-dropdown right-0 top-10"
                            initial={{ opacity: 0, scale: 0.95, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -8 }}
                            transition={{ duration: 0.15 }}>
                            <button className="sv-dropdown-item" onClick={() => { setShowProfile(p => !p); setShowMoreMenu(false); }}>
                              <Users size={15} /> {showProfile ? "Hide Info" : "View Info"}
                            </button>
                            <button className="sv-dropdown-item" onClick={() => { setShowBgPicker(true); setShowMoreMenu(false); }}>
                              <ImageIcon size={15} /> Change Background
                            </button>
                            {selectedConversation.type === "group" && (
                              <button className="sv-dropdown-item" onClick={() => { setShowGroupInfoModal(true); setShowMoreMenu(false); }}>
                                <Settings size={15} /> Group Settings
                              </button>
                            )}
                            <div className="my-1 h-px" style={{ background: 'hsl(var(--sv-border))' }} />
                            <button className="sv-dropdown-item danger" onClick={() => setShowMoreMenu(false)}>
                              <Trash2 size={15} /> Clear Chat
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </header>

                {/* Messages area */}
                <div
                  ref={messageContainerRef}
                  onScroll={handleScroll}
                  className={`flex-1 overflow-y-auto scrollbar-custom px-3 md:px-4 py-4 flex flex-col gap-1 ${currentBgCls}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center flex-1">
                      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(var(--sv-accent))' }} />
                    </div>
                  ) : (
                    messagesWithDates.map((item) => {
                      if (item.type === "date") return (
                        <div key={item.id} className="flex items-center justify-center my-3">
                          <span className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{ background: 'hsl(var(--sv-surface-2))', color: 'hsl(var(--sv-text-3))', border: '1px solid hsl(var(--sv-border) / 0.5)' }}>
                            {item.label}
                          </span>
                        </div>
                      );
                      return (
                        <MessageItem
                          key={item.id || item._id}
                          message={item}
                          isOwn={item.sender === "user"}
                          onReply={setReplyToMessage}
                          onReact={addReaction}
                          userId={userId}
                        />
                      );
                    })
                  )}
                  <AnimatePresence>
                    {isTyping && <TypingIndicator />}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Scroll to bottom button */}
                <AnimatePresence>
                  {showScrollBottom && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                      className="absolute bottom-24 right-4 md:right-6 w-10 h-10 rounded-full shadow-lg flex items-center justify-center z-10"
                      style={{ background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))', color: 'hsl(var(--sv-accent))' }}>
                      <ChevronDown size={18} />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Reply preview */}
                <AnimatePresence>
                  {replyToMessage && (
                    <motion.div
                      initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
                      className="flex items-center gap-3 px-3 md:px-4 py-2.5 border-t"
                      style={{ background: 'hsl(var(--sv-surface))', borderColor: 'hsl(var(--sv-border) / 0.5)' }}>
                      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: 'hsl(var(--sv-accent))' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--sv-accent))' }}>
                          Replying to {replyToMessage.name || "you"}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'hsl(var(--sv-text-2))' }}>{replyToMessage.content}</p>
                      </div>
                      <button onClick={() => setReplyToMessage(null)} className="sv-icon-btn w-7 h-7 rounded-lg flex-shrink-0">
                        <X size={14} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upload preview */}
                <AnimatePresence>
                  {uploadPreview && (
                    <motion.div
                      initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
                      className="flex items-center gap-3 px-3 md:px-4 py-3 border-t"
                      style={{ background: 'hsl(var(--sv-surface))', borderColor: 'hsl(var(--sv-border) / 0.5)' }}>
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border" style={{ borderColor: 'hsl(var(--sv-border))' }}>
                        {uploadPreview.type.startsWith("image/")
                          ? <img src={uploadPreview.preview} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center" style={{ background: 'hsl(var(--sv-surface-2))' }}>
                            <File size={20} style={{ color: 'hsl(var(--sv-accent))' }} />
                          </div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'hsl(var(--sv-text))' }}>{uploadPreview.name}</p>
                        <p className="text-xs" style={{ color: 'hsl(var(--sv-text-3))' }}>Ready to send</p>
                      </div>
                      <button onClick={() => setUploadPreview(null)} className="sv-icon-btn w-8 h-8 rounded-xl"
                        style={{ color: 'hsl(var(--sv-danger))' }}>
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message Input Footer */}
                <footer className="flex items-center gap-2 px-3 md:px-4 py-3 border-t flex-shrink-0 sv-mobile-safe"
                  style={{ background: 'hsl(var(--sv-surface))', borderColor: 'hsl(var(--sv-border) / 0.5)' }}>

                  {isRecording ? (
                    <div className="flex-1 flex items-center gap-4 bg-sv-accent/10 px-4 py-2 rounded-2xl border border-sv-accent/20">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-medium tabular-nums" style={{ color: 'hsl(var(--sv-text))' }}>
                          Recording... {fmtDuration(recordingDuration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => stopRecording(false)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                          style={{ color: 'hsl(var(--sv-danger))' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => stopRecording(true)}
                          className="sv-btn-primary w-10 h-10 p-0 rounded-xl"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Emoji */}
                      <div className="relative flex-shrink-0">
                        <button id="emoji-btn" onClick={() => setShowEmojiPicker(p => !p)}
                          className={`sv-icon-btn w-9 h-9 rounded-xl`}
                          style={showEmojiPicker ? { color: 'hsl(var(--sv-accent))', background: 'hsl(var(--sv-accent)/0.1)' } : {}}>
                          <Smile size={18} />
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute bottom-full mb-2 left-0 z-50">
                            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                            <div className="fixed inset-0 -z-10" onClick={() => setShowEmojiPicker(false)} />
                          </div>
                        )}
                      </div>

                      {/* Attach */}
                      <div className="relative flex-shrink-0">
                        <button id="attach-btn" onClick={() => setShowAttachMenu(p => !p)}
                          className="sv-icon-btn w-9 h-9 rounded-xl"
                          style={showAttachMenu ? { color: 'hsl(var(--sv-accent))', background: 'hsl(var(--sv-accent)/0.1)' } : {}}>
                          <Plus size={18} />
                        </button>
                        <AnimatePresence>
                          {showAttachMenu && (
                            <motion.div
                              className="sv-dropdown bottom-full mb-2 left-0"
                              initial={{ opacity: 0, scale: 0.9, y: 8 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 8 }}
                              transition={{ duration: 0.15 }}>
                              <button className="sv-dropdown-item" onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }}>
                                <ImageIcon size={15} style={{ color: '#3b82f6' }} /> Media &amp; Files
                              </button>
                              <button className="sv-dropdown-item" onClick={() => { setShowPollModal(true); setShowAttachMenu(false); }}>
                                <Users size={15} style={{ color: '#f59e0b' }} /> Create Poll
                              </button>
                              <button className="sv-dropdown-item" onClick={() => { setShowCodeModal(true); setShowAttachMenu(false); }}>
                                <MessageSquare size={15} style={{ color: '#a78bfa' }} /> Code Block
                              </button>
                              <button className="sv-dropdown-item" onClick={() => { setShowScheduleModal(true); setShowAttachMenu(false); }}>
                                <Settings size={15} style={{ color: '#6ee7b7' }} /> Schedule Message
                              </button>
                              <button className="sv-dropdown-item" onClick={() => { setShowTimeCapsuleModal(true); setShowAttachMenu(false); }}>
                                <Lock size={15} style={{ color: '#f97316' }} /> Time Capsule
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Text input */}
                      <form onSubmit={handleSend} className="flex-1 flex items-center gap-2 min-w-0">
                        <input
                          id="message-input"
                          type="text"
                          value={newMessage}
                          onChange={handleInputChange}
                          placeholder={`Message ${getConversationName(selectedConversation)}…`}
                          className="sv-input flex-1 py-2.5 text-sm min-w-0"
                          autoComplete="off"
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
                        />
                        {newMessage.trim() || uploadPreview ? (
                          <button
                            id="send-btn"
                            type="submit"
                            className="sv-btn-primary w-10 h-10 p-0 rounded-xl flex-shrink-0"
                            style={{ minWidth: '40px' }}>
                            <Send size={16} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="sv-icon-btn w-10 h-10 rounded-xl flex-shrink-0"
                            style={{ background: 'hsl(var(--sv-accent)/0.1)', color: 'hsl(var(--sv-accent))' }}
                          >
                            <Mic size={18} />
                          </button>
                        )}
                      </form>
                    </>
                  )}

                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                </footer>
              </div>{/* end chat column */}

              {/* ── Profile / Info Sidebar ── */}
              <AnimatePresence>
                {showProfile && (
                  <>
                    {/* Mobile backdrop */}
                    <motion.div
                      className="fixed inset-0 bg-black/60 z-[48] md:hidden"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setShowProfile(false)}
                    />
                    <motion.aside
                      className="fixed md:relative right-0 top-0 h-full z-[49] border-l overflow-y-auto scrollbar-custom md:flex-shrink-0"
                      style={{
                        width: 'min(85vw, 280px)',
                        background: 'hsl(var(--sv-surface))',
                        borderColor: 'hsl(var(--sv-border) / 0.5)',
                      }}
                      initial={{ x: '100%', opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: '100%', opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'hsl(var(--sv-border) / 0.5)' }}>
                        <span className="font-semibold text-sm" style={{ color: 'hsl(var(--sv-text))' }}>
                          {selectedConversation.type === "group" ? "Group Info" : "Contact Info"}
                        </span>
                        <button onClick={() => setShowProfile(false)} className="sv-icon-btn w-7 h-7 rounded-lg"><X size={14} /></button>
                      </div>
                      <div className="p-5 flex flex-col items-center gap-3 border-b" style={{ borderColor: 'hsl(var(--sv-border) / 0.5)' }}>
                        <Avatar src={getConversationAvatar(selectedConversation)} name={getConversationName(selectedConversation)} size={18} online={isUserOnline(selectedConversation)} />
                        <div className="text-center">
                          <p className="font-semibold" style={{ color: 'hsl(var(--sv-text))' }}>{getConversationName(selectedConversation)}</p>
                          {selectedConversation.type !== "group" && (
                            <p className="text-xs mt-0.5 flex items-center gap-1.5 justify-center" style={{ color: isUserOnline(selectedConversation) ? 'hsl(var(--sv-online))' : 'hsl(var(--sv-text-3))' }}>
                              {isUserOnline(selectedConversation)
                                ? <><span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'hsl(var(--sv-online))', flexShrink: 0 }} />Online</>
                                : fmtLastSeen(getLastSeen(selectedConversation))}
                            </p>
                          )}
                          {selectedConversation.type === "group" && (
                            <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--sv-text-3))' }}>
                              {selectedConversation.participants?.length} members
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="p-4 space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--sv-text-3))' }}>Actions</p>
                        <button className="sv-dropdown-item w-full rounded-xl" onClick={() => { setShowBgPicker(true); setShowProfile(false); }}>
                          <ImageIcon size={15} /> Change Background
                        </button>
                        {selectedConversation.type === "group" && (
                          <button className="sv-dropdown-item w-full rounded-xl" onClick={() => { setShowGroupInfoModal(true); setShowProfile(false); }}>
                            <Settings size={15} /> Group Settings
                          </button>
                        )}
                        <button className="sv-dropdown-item danger w-full rounded-xl">
                          <Trash2 size={15} /> Clear Chat
                        </button>
                      </div>
                    </motion.aside>
                  </>
                )}
              </AnimatePresence>

            </div>/* end flex-row wrapper */
          ) : (
            /* ── Empty state ── */
            <div className={`flex-1 flex flex-col items-center justify-center text-center px-8 ${currentBgCls}`}>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)/0.2), hsl(var(--sv-accent-2)/0.1))', border: '1px solid hsl(var(--sv-accent)/0.2)' }}>
                <MessageSquare size={36} style={{ color: 'hsl(var(--sv-accent))' }} />
              </motion.div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'hsl(var(--sv-text))' }}>Welcome to Samvaad</h2>
              <p className="text-sm max-w-xs leading-relaxed mb-6" style={{ color: 'hsl(var(--sv-text-2))' }}>
                Select a conversation from the sidebar or start a new chat to begin messaging.
              </p>
              <button id="empty-new-chat-btn" onClick={() => setShowNewChatModal(true)} className="sv-btn-primary">
                <Plus size={16} /> New Conversation
              </button>
            </div>
          )}

          {/* ── Clipboard Sync panel ── */}
          <AnimatePresence>
            {showClipboard && (
              <>
                {/* Mobile backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/60 z-[48] md:hidden"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowClipboard(false)}
                />
                <motion.aside
                  className="fixed md:relative right-0 top-0 h-full z-[49] border-l overflow-hidden flex flex-col md:flex-shrink-0"
                  style={{
                    width: 'min(92vw, 300px)',
                    background: 'hsl(var(--sv-surface))',
                    borderColor: 'hsl(var(--sv-border) / 0.5)',
                  }}
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <ClipboardSync onClose={() => setShowClipboard(false)} />
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </main>

        {/* ═══ Background Picker Modal ═══ */}
        <AnimatePresence>
          {showBgPicker && (
            <motion.div
              className="fixed inset-0 z-[300] flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBgPicker(false)}>
              <motion.div
                className="rounded-2xl p-5 w-full max-w-sm"
                style={{ background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))' }}
                initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold" style={{ color: 'hsl(var(--sv-text))' }}>Chat Background</h3>
                  <button onClick={() => setShowBgPicker(false)} className="sv-icon-btn w-8 h-8 rounded-xl"><X size={15} /></button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {BG_OPTIONS.map((bg) => (
                    <button
                      key={bg.id}
                      id={`bg-${bg.id}`}
                      onClick={() => handleBgChange(bg.id)}
                      className={`relative h-16 md:h-20 rounded-xl overflow-hidden transition-all ${bg.cls} ${chatBg === bg.id ? "" : "hover:opacity-90"}`}
                      style={chatBg === bg.id ? { outline: `2px solid hsl(var(--sv-accent))`, outlineOffset: '2px' } : {}}>
                      <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-medium"
                        style={{ color: 'rgba(255,255,255,0.8)' }}>{bg.label}</span>
                      {chatBg === bg.id && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <Check size={18} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ Modals ═══ */}
        <NewChatModal isOpen={showNewChatModal} onClose={() => setShowNewChatModal(false)} onCreateChat={handleNewChat} token={token} />
        <PollModal isOpen={showPollModal} onClose={() => setShowPollModal(false)} onSubmit={handleCreatePoll} />
        <ScheduleModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} onSubmit={handleScheduleMessage} />
        <CodeModal isOpen={showCodeModal} onClose={() => setShowCodeModal(false)} onSubmit={handleSendCode} />
        <TimeCapsuleModal isOpen={showTimeCapsuleModal} onClose={() => setShowTimeCapsuleModal(false)} onSend={handleTimeCapsule} />
        <GroupInfoModal
          isOpen={showGroupInfoModal}
          onClose={() => setShowGroupInfoModal(false)}
          conversation={selectedConversation}
        />

        <MyProfilePanel
          isOpen={showMyProfile}
          onClose={() => setShowMyProfile(false)}
        />
      </div>
    </ContactSyncGateway>
  );
};

export default Chat;