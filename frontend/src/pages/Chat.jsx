import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Grid, Image as ImgIcon, X } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import socketService from "../services/socket";

// Layout Components
import NavRail from "../components/Chat/layout/NavRail";
import ChatSidebar from "../components/Chat/layout/ChatSidebar";
import ChatWindow from "../components/Chat/layout/ChatWindow";

// Modal / Panel Components
import NewChatModal from "../components/NewChatModal";
import ContactSyncGateway from "../components/ContactSyncGateway";
import TaskPanel from "../components/Chat/TaskPanel";
import MobileChatApp from "./MobileChatApp";
import { useVibe } from "../context/VibeContext";

/* ─── helpers ─── */
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
  let datePart = diff === 0 ? "today" : diff === 1 ? "yesterday"
    : diff < 7 ? date.toLocaleDateString("en-US", { weekday: "long" })
    : date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  const timePart = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `Last seen ${datePart} at ${timePart}`;
};

/* ─── Demo data for empty states ─── */
const DEMO_TASKS = [
  { id: 1, title: "Buy birthday cakes",    emoji: "🎂", color: "#F97316" },
  { id: 2, title: "Watering the plant",    emoji: "🌿", color: "#22C55E" },
  { id: 3, title: "Make a salad days",     emoji: "🥗", color: "#EAB308" },
  { id: 4, title: "Pay electricity bills", emoji: "⚡", color: "#F59E0B" },
  { id: 5, title: "Check the weather",     emoji: "🌤️", color: "#3B82F6" },
];
const PHOTO_PLACEHOLDERS = [
  { bg: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", icon: "🖼️" },
  { bg: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)", icon: "📷" },
  { bg: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)", icon: "🌸" },
  { bg: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", icon: "✨" },
];
const TASK_COLORS = ["#F97316","#22C55E","#EAB308","#F59E0B","#3B82F6","#A855F7","#EF4444","#06B6D4"];
const TASK_EMOJIS = ["🎂","🌿","🥗","⚡","🌤️","📝","🎯","🔮"];

/* ── Right Info Panel — matches HYPER reference exactly ── */
const RightSidebarPanel = ({ selectedConversation, getConversationName, getConversationAvatar, isUserOnline, tasks = [], messages = [] }) => {
  if (!selectedConversation) return null;

  const convName     = getConversationName(selectedConversation);
  const convAvatar   = getConversationAvatar(selectedConversation);
  const online       = isUserOnline(selectedConversation);
  const sharedPhotos = messages.filter(m => m.type === 'image' && m.mediaUrl).slice(0, 4);
  const displayTasks = tasks.length > 0 ? tasks : DEMO_TASKS;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'hsl(var(--sv-surface))' }}>
      {/* ── Profile Header ── */}
      <div className="flex flex-col items-center px-4 pt-6 pb-5 flex-shrink-0 border-b" style={{ borderColor: 'hsl(var(--sv-border))' }}>
        {/* Avatar */}
        <div className="relative mb-3">
          <div className="w-[60px] h-[60px] rounded-full overflow-hidden"
            style={{ boxShadow: `0 0 0 3px hsl(var(--sv-accent)/0.35), 0 8px 20px -6px hsl(var(--sv-accent)/0.4)` }}>
            {convAvatar
              ? <img src={convAvatar} alt={convName} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}>
                  {convName?.[0]?.toUpperCase()}
                </div>
            }
          </div>
          {online && (
            <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[2.5px]"
              style={{ borderColor: 'hsl(var(--sv-surface))' }} />
          )}
        </div>

        {/* Name */}
        <h3 className="text-sm font-bold leading-tight text-center" style={{ color: 'hsl(var(--sv-text))' }}>
          {convName}
        </h3>

        {/* Handle */}
        <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'hsl(var(--sv-text-3))' }}>
          @{convName?.toLowerCase().replace(/\s+/g, '')}
        </p>

        {/* Online badge */}
        <div className="flex items-center gap-1.5 mt-2.5 rounded-full px-3 py-[3px]"
          style={{ background: online ? 'rgba(16,185,129,0.12)' : 'hsl(var(--sv-surface-2))' }}>
          <div className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${online ? 'bg-emerald-400' : 'bg-gray-500'}`}
            style={online ? { animation: 'pulse 2s infinite' } : {}} />
          <span className="text-[10px] font-semibold"
            style={{ color: online ? '#34d399' : 'hsl(var(--sv-text-3))' }}>
            {online ? '● Online' : '○ Offline'}
          </span>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">

        {/* TO-DO LISTS */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-black uppercase tracking-[0.12em]"
              style={{ color: 'hsl(var(--sv-text-3))' }}>
              To-Do Lists
            </span>
            <ChevronDown size={12} style={{ color: 'hsl(var(--sv-text-3))' }} />
          </div>

          <div className="flex flex-col gap-[6px]">
            {displayTasks.slice(0, 5).map((task, i) => {
              const bgColor = TASK_COLORS[i % TASK_COLORS.length];
              const emoji   = task.emoji || TASK_EMOJIS[i % TASK_EMOJIS.length];
              return (
                <div key={task._id || task.id || i}
                  className="flex items-center gap-2.5 py-[9px] px-3 rounded-xl cursor-pointer transition-all"
                  style={{ background: 'hsl(var(--sv-surface-2))' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--sv-surface-3))'}
                  onMouseLeave={e => e.currentTarget.style.background = 'hsl(var(--sv-surface-2))'}
                >
                  {/* Colored emoji pill */}
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm"
                    style={{ background: bgColor + '22', border: `1px solid ${bgColor}33` }}>
                    <span>{emoji}</span>
                  </div>
                  <span className={`text-[12px] font-medium flex-1 truncate leading-tight ${task.status === 'completed' ? 'line-through opacity-40' : ''}`}
                    style={{ color: 'hsl(var(--sv-text))' }}>
                    {task.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SHARED PHOTOS */}
        <div className="px-4 pt-4 pb-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-black uppercase tracking-[0.12em]"
              style={{ color: 'hsl(var(--sv-text-3))' }}>
              Shared Photos
            </span>
            <ChevronDown size={12} style={{ color: 'hsl(var(--sv-text-3))' }} />
          </div>

          <div className="grid grid-cols-3 gap-[5px]">
            {sharedPhotos.length > 0
              ? sharedPhotos.slice(0, 5).map((msg, i) => (
                <a key={msg._id} href={msg.mediaUrl} target="_blank" rel="noopener noreferrer"
                  className="aspect-square rounded-xl overflow-hidden hover:scale-105 transition-transform"
                  style={{ display: 'block' }}>
                  <img src={msg.mediaUrl} alt="" className="w-full h-full object-cover" />
                </a>
              ))
              : PHOTO_PLACEHOLDERS.map((ph, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  style={{ background: ph.bg }}>
                  <span className="text-lg opacity-70">{ph.icon}</span>
                </div>
              ))
            }
            {/* "More" tile */}
            <div className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: 'hsl(var(--sv-surface-2))' }}>
              <Grid size={13} style={{ color: 'hsl(var(--sv-text-3))' }} />
              <span className="text-[9px] font-bold" style={{ color: 'hsl(var(--sv-text-3))' }}>More</span>
            </div>
          </div>
        </div>

        {/* GROUP MEMBERS (only for group conversations) */}
        {selectedConversation?.isGroup && (
          <div className="px-4 pb-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'hsl(var(--sv-text-3))' }}>Members</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--sv-surface-2))', color: 'hsl(var(--sv-text-3))' }}>
                {selectedConversation.participants?.length || 0}
              </span>
            </div>
            <div className="flex flex-col gap-[5px]">
              {selectedConversation.participants?.slice(0, 4).map(p => (
                <div key={p._id} className="flex items-center gap-2 py-2 px-3 rounded-xl"
                  style={{ background: 'hsl(var(--sv-surface-2))' }}>
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    {p.avatar
                      ? <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}>
                          {p.name?.[0]?.toUpperCase()}
                        </div>
                    }
                  </div>
                  <span className="text-[11px] font-medium truncate flex-1" style={{ color: 'hsl(var(--sv-text))' }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════ Main Chat Page ═══════════════════════════ */
const Chat = ({ token }) => {
  const {
    conversations, selectedConversation, setSelectedConversation,
    messages, loading, typingUsers,
    sendMessage, sendMediaMessage, createNewConversation,
    handleTyping, handleStopTyping,
    getConversationName, getConversationAvatar, isUserOnline, getLastSeen,
    addReaction, userId,
    incomingCall, activeCall, setActiveCall,
    clearChat, deleteMessage, editMessage, forwardMessage, syncContacts,
    addTask, togglePin, toggleArchive, searchMessages,
    statuses, tasks
  } = useChat();

  const { user, logout, updateProfile, updateSettings, uploadAvatar, updateAppLock } = useAuth();
  const { activeVibe, setActiveVibe, vibes } = useVibe();

  /* ─── State ─── */
  const [showNewChatModal, setShowNewChatModal]     = useState(false);
  const [searchQuery, setSearchQuery]               = useState("");
  const [showEmojiPicker, setShowEmojiPicker]       = useState(false);
  const [replyToMessage, setReplyToMessage]         = useState(null);
  const [uploadPreview, setUploadPreview]           = useState(null);
  const [showTaskPanel, setShowTaskPanel]           = useState(false);
  const [showProfile, setShowProfile]               = useState(false);
  const [showBgPicker, setShowBgPicker]             = useState(false);
  const [showMoreMenu, setShowMoreMenu]             = useState(false);
  const [showClearConfirm, setShowClearConfirm]     = useState(false);
  const [mobileShowSidebar, setMobileShowSidebar]   = useState(true);
  const [recordingDuration, setRecordingDuration]   = useState(0);
  const [isRecording, setIsRecording]               = useState(false);
  const [showInChatSearch, setShowInChatSearch]     = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery]   = useState("");
  const [showArchivedOnly, setShowArchivedOnly]     = useState(false);
  const [isViewOnce, setIsViewOnce]                 = useState(false);
  const [forwardMessageData, setForwardMessageData] = useState(null);
  const [showForwardModal, setShowForwardModal]     = useState(false);
  const [globalSearchMessages, setGlobalSearchMessages] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal]   = useState(false);
  const [activeRailTab, setActiveRailTab]           = useState("chats");

  const messagesEndRef       = useRef(null);
  const fileInputRef         = useRef(null);
  const messageContainerRef  = useRef(null);
  const moreMenuRef          = useRef(null);
  const mediaRecorderRef     = useRef(null);
  const audioChunksRef       = useRef([]);
  const recordingIntervalRef = useRef(null);

  /* ─── Derived ─── */
  const unreadChatsCount = useMemo(() =>
    conversations.reduce((acc, c) => {
      const isArchived = c.archivedBy?.some(id => (id._id || id) === userId);
      return !isArchived ? acc + (c.unreadCount?.[userId] || 0) : acc;
    }, 0), [conversations, userId]);

  const archivedCount    = useMemo(() =>
    conversations.filter(c => c.archivedBy?.includes(userId)).length, [conversations, userId]);

  const unreadCallsCount = useMemo(() => (incomingCall && !activeCall ? 1 : 0), [incomingCall, activeCall]);

  const hasNewStatuses   = useMemo(() => statuses?.some(group =>
    group.user._id !== userId && group.items.some(item => !item.seenBy?.some(s => (s.user._id || s.user) === userId))
  ), [statuses, userId]);

  const filteredConversations = useMemo(() => conversations.filter(c => {
    const matchesSearch = getConversationName(c).toLowerCase().includes(searchQuery.toLowerCase());
    const isArchived    = c.archivedBy?.some(id => id === userId || id._id === userId);
    return showArchivedOnly ? (matchesSearch && isArchived) : (matchesSearch && !isArchived);
  }), [conversations, searchQuery, getConversationName, showArchivedOnly, userId]);

  const messagesWithDates = useMemo(() => {
    const result = [];
    let lastDate = null;
    messages.forEach(msg => {
      const d = fmtDate(msg.timestamp);
      if (d !== lastDate) { result.push({ type: "date", label: d, id: `date-${d}` }); lastDate = d; }
      result.push({ type: "message", ...msg });
    });
    return result;
  }, [messages]);

  /* ─── Effects ─── */
  useEffect(() => {
    if (!selectedConversation && window.innerWidth <= 768) setMobileShowSidebar(true);
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  useEffect(() => {
    const handler = e => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ─── Handlers ─── */
  const handleSend = async (e, content) => {
    e?.preventDefault();
    if (!content?.trim() && !uploadPreview) return;
    if (uploadPreview) {
      const type = uploadPreview.type.startsWith("image/") ? "image"
        : uploadPreview.type.startsWith("video/") ? "video"
        : uploadPreview.type.startsWith("audio/") ? "voice" : "file";
      await sendMediaMessage(uploadPreview.file, type, { isViewOnce });
      setUploadPreview(null);
    } else {
      await sendMessage(content, "text", replyToMessage?.id, { isViewOnce });
    }
    setReplyToMessage(null);
    setIsViewOnce(false);
    handleStopTyping();
  };

  const handleFileSelect = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUploadPreview({ file, preview: ev.target.result, type: file.type, name: file.name });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "voice_message.webm", { type: 'audio/webm' });
        await sendMediaMessage(audioFile, "voice", { duration: Math.floor(recordingDuration) });
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => setRecordingDuration(p => p + 1), 1000);
      socketService.emit("user-recording-voice", { conversationId: selectedConversation._id, userId });
    } catch { alert("Could not access microphone"); }
  };

  const stopRecording = (shouldSend = true) => {
    if (mediaRecorderRef.current && isRecording) {
      if (!shouldSend) audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      socketService.emit("user-stopped-recording-voice", { conversationId: selectedConversation._id });
    }
  };

  const fmtDuration = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  const isTyping = selectedConversation && typingUsers[selectedConversation._id];

  const commonProps = {
    user, userId, token, conversations, selectedConversation, setSelectedConversation,
    messages, loading, typingUsers, isTyping, filteredConversations,
    unreadChatsCount, unreadCallsCount, archivedCount, hasNewStatuses,
    activeRailTab, setActiveRailTab, showArchivedOnly, setShowArchivedOnly,
    searchQuery, setSearchQuery, isSearchingGlobal, globalSearchMessages,
    mobileShowSidebar, setMobileShowSidebar,
    handleSend, handleFileSelect, fileInputRef,
    replyToMessage, setReplyToMessage, uploadPreview, setUploadPreview,
    showEmojiPicker, setShowEmojiPicker, isRecording, startRecording, stopRecording,
    recordingDuration, fmtDuration, getConversationName, getConversationAvatar,
    isUserOnline, getLastSeen, fmtTime, fmtDate, fmtLastSeen,
    togglePin, toggleArchive, addReaction, setShowNewChatModal,
    setShowProfile, showProfile, setActiveCall, activeCall, incomingCall,
    setShowInChatSearch, showInChatSearch, inChatSearchQuery, setInChatSearchQuery,
    setShowMoreMenu, showMoreMenu, moreMenuRef, setShowBgPicker, setShowClearConfirm,
    messagesWithDates, messageContainerRef, messagesEndRef, currentBgCls: "chatbg-default",
    setForwardMessageData, setShowForwardModal, handleScroll: () => {},
    handleNewChat: createNewConversation, handleTyping, handleStopTyping,
    showTaskPanel, setShowTaskPanel, tasks
  };

  return (
    <ContactSyncGateway>
      {/* ── Mobile ── */}
      <div className="md:hidden h-full">
        <MobileChatApp {...commonProps} />
      </div>

      {/* ── Desktop: 4-column HYPER layout ── */}
      <div className="hidden md:flex fixed inset-0" style={{ background: 'hsl(var(--sv-bg))' }}>

        {/* 1. Nav Rail — 68px */}
        <div className="flex-shrink-0 h-full" style={{ width: 68 }}>
          <NavRail {...commonProps} vibes={vibes} activeVibe={activeVibe} setActiveVibe={setActiveVibe} />
        </div>

        {/* 2. Chat Sidebar — 272px */}
        <div className="flex-shrink-0 h-full border-r" style={{ width: 272, borderColor: 'hsl(var(--sv-border))' }}>
          <ChatSidebar {...commonProps} />
        </div>

        {/* 3. Center Chat Window — flexible */}
        <div className="flex-1 h-full min-w-0 border-r" style={{ borderColor: 'hsl(var(--sv-border))' }}>
          <ChatWindow {...commonProps} />
        </div>

        {/* 4. Right Info Panel — 240px, animates in when conv selected */}
        <AnimatePresence>
          {selectedConversation && (
            <motion.div
              key="right-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="flex-shrink-0 h-full overflow-hidden"
            >
              <div style={{ width: 240, height: '100%' }}>
                <RightSidebarPanel
                  selectedConversation={selectedConversation}
                  getConversationName={getConversationName}
                  getConversationAvatar={getConversationAvatar}
                  isUserOnline={isUserOnline}
                  tasks={tasks || []}
                  messages={messages || []}
                  userId={userId}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modals ── */}
      {showNewChatModal && (
        <NewChatModal
          isOpen={showNewChatModal}
          onClose={() => setShowNewChatModal(false)}
          onCreateChat={createNewConversation}
          token={token}
        />
      )}
      <AnimatePresence>
        {showTaskPanel && (
          <TaskPanel isOpen={showTaskPanel} onClose={() => setShowTaskPanel(false)} />
        )}
      </AnimatePresence>
    </ContactSyncGateway>
  );
};

export default Chat;
