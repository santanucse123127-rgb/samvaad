import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, ImageIcon, Users, MessageSquare, Phone, CircleDot, Megaphone, Settings
} from "lucide-react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import socketService from "../services/socket";

// Components
import NavRail from "../components/Chat/layout/NavRail";
import ChatSidebar from "../components/Chat/layout/ChatSidebar";
import ChatWindow from "../components/Chat/layout/ChatWindow";
import NewChatModal from "../components/NewChatModal";
import ContactSyncGateway from "../components/ContactSyncGateway";
import EmojiPicker from "../components/Chat/EmojiPicker";
import PollModal from "../components/Chat/PollModal";
import ScheduleModal from "../components/Chat/ScheduleModal";
import CodeModal from "../components/Chat/CodeModal";
import GroupInfoModal from "../components/GroupInfoModal";
import EphemeralModal from "../components/Chat/EphemeralModal";
import WallpaperModal from "../components/Chat/WallpaperModal";
import TimeCapsuleModal from "../components/Chat/TimeCapsuleModal";
import ConvertTaskModal from "../components/Chat/ConvertTaskModal";
import MobileChatApp from "./MobileChatApp";
import Avatar from "../components/Chat/Avatar";
import VibeBackgrounds from "../components/Vibes/VibeBackgrounds";
import MagicEffectManager from "../components/Magic/MagicEffectManager";
import { useVibe } from "../context/VibeContext";

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

const Chat = ({ token }) => {
  const {
    conversations, selectedConversation, setSelectedConversation,
    messages, loading, typingUsers,
    sendMessage, sendMediaMessage, createNewConversation,
    handleTyping, handleStopTyping,
    getConversationName, getConversationAvatar, isUserOnline, getLastSeen,
    addReaction, notification, setNotification,
    userId, setConversationWallpaper,
    incomingCall, activeCall, setActiveCall, respondGroupInvite, groupInvite, setGroupInvite,
    clearChat, deleteMessage, editMessage, forwardMessage, syncContacts,
    addTask, togglePin, toggleArchive, searchMessages, getConversationMedia,
    statuses
  } = useChat();

  const { user, logout, updateProfile, updateSettings, uploadAvatar, updateAppLock } = useAuth();
  const { activeVibe, setActiveVibe, vibes } = useVibe();

  /* ─── State ─── */
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
  const [showProfile, setShowProfile] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showEphemeralModal, setShowEphemeralModal] = useState(false);
  const [showConvertTaskModal, setShowConvertTaskModal] = useState(false);
  const [convertingMessage, setConvertingMessage] = useState(null);
  const [mobileShowSidebar, setMobileShowSidebar] = useState(true);
  const [chatBg, setChatBg] = useState(() => localStorage.getItem("samvaad-chatbg") || "default");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState("");
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const [isViewOnce, setIsViewOnce] = useState(false);
  const [forwardMessageData, setForwardMessageData] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [mediaTab, setMediaTab] = useState("media");
  const [conversationMedia, setConversationMedia] = useState([]);
  const [globalSearchMessages, setGlobalSearchMessages] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [activeRailTab, setActiveRailTab] = useState("chats");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageContainerRef = useRef(null);
  const moreMenuRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  /* ─── Memoized Data ─── */
  const unreadChatsCount = useMemo(() =>
    conversations.reduce((acc, c) => {
      const isArchived = c.archivedBy?.some(id => (id._id || id) === userId);
      return !isArchived ? acc + (c.unreadCount?.[userId] || 0) : acc;
    }, 0), [conversations, userId]);

  const archivedCount = useMemo(() =>
    conversations.filter(c => c.archivedBy?.includes(userId)).length, [conversations, userId]);

  const unreadCallsCount = useMemo(() => (incomingCall && !activeCall ? 1 : 0), [incomingCall, activeCall]);

  const hasNewStatuses = useMemo(() => statuses.some(group =>
    group.user._id !== userId && group.items.some(item => !item.seenBy?.some(s => (s.user._id || s.user) === userId))
  ), [statuses, userId]);

  const filteredConversations = useMemo(() => conversations.filter(c => {
    const matchesSearch = getConversationName(c).toLowerCase().includes(searchQuery.toLowerCase());
    const isArchived = c.archivedBy?.some(id => id === userId || id._id === userId);
    return showArchivedOnly ? (matchesSearch && isArchived) : (matchesSearch && !isArchived);
  }), [conversations, searchQuery, getConversationName, showArchivedOnly, userId]);

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

  /* ─── Effects ─── */
  useEffect(() => {
    if (!selectedConversation && window.innerWidth <= 768) setMobileShowSidebar(true);
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ─── Handlers ─── */
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() && !uploadPreview) return;
    const extraData = { isViewOnce };
    if (uploadPreview) {
      const type = uploadPreview.type.startsWith("image/") ? "image" : uploadPreview.type.startsWith("video/") ? "video" : uploadPreview.type.startsWith("audio/") ? "voice" : "file";
      await sendMediaMessage(uploadPreview.file, type, extraData);
      setUploadPreview(null);
    } else {
      await sendMessage(newMessage, "text", replyToMessage?.id, extraData);
    }
    setNewMessage("");
    setReplyToMessage(null);
    setIsViewOnce(false);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "voice_message.webm", { type: 'audio/webm' });
        await sendMediaMessage(audioFile, "voice", { duration: Math.floor(recordingDuration) });
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => setRecordingDuration(p => p + 1), 1000);
      socketService.emit("user-recording-voice", { conversationId: selectedConversation._id, userId });
    } catch (err) { alert("Could not access microphone"); }
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

  const fmtDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isTyping = selectedConversation && typingUsers[selectedConversation._id];
  const currentBgCls = "chatbg-default"; // Simplified for now

  const commonProps = {
    user, userId, token, conversations, selectedConversation, setSelectedConversation,
    messages, loading, typingUsers, isTyping, filteredConversations,
    unreadChatsCount, unreadCallsCount, archivedCount, hasNewStatuses,
    activeRailTab, setActiveRailTab, showArchivedOnly, setShowArchivedOnly,
    searchQuery, setSearchQuery, isSearchingGlobal, globalSearchMessages,
    mobileShowSidebar, setMobileShowSidebar, newMessage, setNewMessage,
    handleSend, handleInputChange, handleFileSelect, fileInputRef,
    replyToMessage, setReplyToMessage, uploadPreview, setUploadPreview,
    showEmojiPicker, setShowEmojiPicker, isRecording, startRecording, stopRecording,
    recordingDuration, fmtDuration, getConversationName, getConversationAvatar,
    isUserOnline, getLastSeen, fmtTime, fmtDate, fmtLastSeen,
    togglePin, toggleArchive, addReaction, setShowNewChatModal,
    setShowProfile, showProfile, setActiveCall, activeCall, incomingCall,
    setShowInChatSearch, showInChatSearch, inChatSearchQuery, setInChatSearchQuery,
    setShowMoreMenu, showMoreMenu, moreMenuRef, setShowBgPicker, setShowClearConfirm,
    messagesWithDates, messageContainerRef, messagesEndRef, currentBgCls,
    setForwardMessageData, setShowForwardModal, handleScroll: (e) => {}, 
    handleNewChat: createNewConversation,
  };

  return (
    <ContactSyncGateway>
      <div className="md:hidden h-full">
        <MobileChatApp {...commonProps} />
      </div>
      <div className="hidden md:flex h-screen overflow-hidden" style={{ background: 'hsl(var(--sv-bg))' }}>
        <VibeBackgrounds />
        <MagicEffectManager />
        
        <NavRail {...commonProps} vibes={vibes} activeVibe={activeVibe} setActiveVibe={setActiveVibe} />
        <ChatSidebar {...commonProps} />
        <ChatWindow {...commonProps} />
      </div>

      {/* Modals */}
      {showNewChatModal && (
        <NewChatModal 
          isOpen={showNewChatModal} 
          onClose={() => setShowNewChatModal(false)} 
          onCreateChat={createNewConversation}
          token={token}
        />
      )}
      {showEmojiPicker && (
        <div className="fixed bottom-24 left-80 z-[100]">
          <EmojiPicker onSelect={(emoji) => { setNewMessage(p => p + emoji); setShowEmojiPicker(false); }} />
        </div>
      )}
      {/* ... other modals would go here ... */}
    </ContactSyncGateway>
  );
};

export default Chat;