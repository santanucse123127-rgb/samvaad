import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Reply, Trash2, Smile, Check, CheckCheck, Clock, Download, BarChart2, Mic, Forward, Code as CodeIcon, Lock, Cake, MapPin, Hash, UserCheck, Pencil, ListTodo, Eye, X, Pause, Play } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChat } from "../../context/ChatContext";
import Avatar from "./Avatar";

/* ── Tick indicator ── */
const Ticks = ({ status }) => {
  if (status === 'scheduled') return <Clock size={12} style={{ color: 'hsl(var(--sv-accent))' }} />;
  if (status === 'read') return <CheckCheck size={13} style={{ color: '#34b7f1' }} />;
  if (status === 'delivered') return <CheckCheck size={13} style={{ color: 'rgba(255,255,255,0.45)' }} />;
  /* sent / default */         return <Check size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />;
};

const VoicePlayer = ({ url, duration, isOwn }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(new Audio(url));

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(prev => !prev);
  };

  const fmtTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 py-1 min-w-[200px]">
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
        style={{
          background: isOwn ? 'rgba(255,255,255,0.2)' : 'hsl(var(--sv-accent)/0.15)',
          color: isOwn ? 'white' : 'hsl(var(--sv-accent))'
        }}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
      </button>

      <div className="flex-1">
        <div className="relative h-1.5 w-full bg-black/10 rounded-full overflow-hidden mb-1.5">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${progress}%`,
              background: isOwn ? 'white' : 'hsl(var(--sv-accent))'
            }}
          />
        </div>
        <div className="flex justify-between items-center px-0.5">
          <span className="text-[10px] tabular-nums" style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : 'hsl(var(--sv-text-3))' }}>
            {fmtTime(currentTime)}
          </span>
          <span className="text-[10px] tabular-nums" style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : 'hsl(var(--sv-text-3))' }}>
            {fmtTime(duration || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const MessageItem = ({ message, isOwn, onReply, onForward }) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isViewingOnce, setIsViewingOnce] = useState(false);
  const leaveTimer = useRef(null);
  const { votePoll, addReaction, deleteMessage, editMessage, onlineUsers, userId, markAsRead } = useChat();

  const handleMarkAsViewed = async (id) => {
    try {
      await markAsRead(id);
    } catch (err) { console.error(err); }
  };

  const time = message.createdAt || message.timestamp
    ? new Date(message.createdAt || message.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "";

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => {
      setShowActions(false);
      setShowReactions(false);
      setShowDeleteOptions(false);
    }, 200);
  };
  const handleMouseEnter = () => {
    clearTimeout(leaveTimer.current);
    setShowActions(true);
  };

  const renderPoll = () => {
    const total = message.pollOptions?.reduce((a, o) => a + (o.votes?.length || 0), 0) || 0;
    return (
      <div className="min-w-[240px] max-w-xs py-1">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={16} style={{ color: 'hsl(var(--sv-accent))' }} />
          <p className="font-semibold text-sm" style={{ color: 'hsl(var(--sv-text))' }}>{message.pollQuestion}</p>
        </div>
        <div className="space-y-2">
          {message.pollOptions?.map((opt, idx) => {
            const pct = total > 0 ? Math.round((opt.votes?.length || 0) / total * 100) : 0;
            const voted = opt.votes?.some(v => (v._id || v) === userId);
            return (
              <div key={idx} onClick={() => votePoll(message._id, idx)}
                className="relative rounded-xl overflow-hidden cursor-pointer border transition-all"
                style={{ borderColor: voted ? 'hsl(var(--sv-accent)/0.4)' : 'hsl(var(--sv-border))', background: 'hsl(var(--sv-surface-2))' }}>
                <div className="absolute inset-y-0 left-0 rounded-xl transition-all"
                  style={{ width: `${pct}%`, background: voted ? 'hsl(var(--sv-accent)/0.18)' : 'hsl(var(--sv-surface-3))' }} />
                <div className="relative flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: voted ? 'hsl(var(--sv-accent))' : 'hsl(var(--sv-text-3))', background: voted ? 'hsl(var(--sv-accent))' : 'transparent' }}>
                      {voted && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-medium" style={{ color: voted ? 'hsl(var(--sv-accent))' : 'hsl(var(--sv-text))' }}>{opt.text}</span>
                  </div>
                  <span className="text-xs font-bold ml-2" style={{ color: 'hsl(var(--sv-text-3))' }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs mt-2 text-right" style={{ color: 'hsl(var(--sv-text-3))' }}>{total} vote{total !== 1 ? 's' : ''}</p>
      </div>
    );
  };

  const renderCode = () => (
    <div className="min-w-[260px] max-w-sm rounded-xl overflow-hidden" style={{ background: '#1a1b26', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.6 }} />)}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {message.codeLanguage || 'code'}
          </span>
        </div>
        <button onClick={() => navigator.clipboard.writeText(message.content)}
          className="text-[10px] font-bold uppercase tracking-wider transition-colors hover:text-white"
          style={{ color: 'rgba(255,255,255,0.35)' }}>Copy</button>
      </div>
      <SyntaxHighlighter language={message.codeLanguage || 'javascript'} style={oneDark}
        customStyle={{ margin: 0, padding: '14px', borderRadius: 0, fontSize: '12.5px', backgroundColor: 'transparent', lineHeight: 1.6 }}>
        {message.content}
      </SyntaxHighlighter>
    </div>
  );

  const renderActualContent = () => {
    const conditions = message.unlockConditions;
    let isLocked = false;
    let lockReason = "";
    let LockIconComponent = Lock;

    if (conditions) {
      if (conditions.type === 'time' || !conditions.type) {
        isLocked = message.unlockAt && new Date(message.unlockAt) > new Date();
        lockReason = `Unlocks on ${new Date(message.unlockAt).toLocaleString()}`;
      } else if (conditions.type === 'birthday') {
        isLocked = true;
        lockReason = "Birthday Lock: Unlocks on your special day! 🎂";
        LockIconComponent = Cake;
      } else if (conditions.type === 'location') {
        isLocked = true;
        lockReason = `Location Lock: Reach ${conditions.location?.address || 'the target spot'} 📍`;
        LockIconComponent = MapPin;
      } else if (conditions.type === 'count') {
        isLocked = true;
        lockReason = `Message Lock: Unlocks after ${conditions.messageCount} more messages 💬`;
        LockIconComponent = Hash;
      } else if (conditions.type === 'online') {
        isLocked = true;
        lockReason = "Duo Lock: Unlocks when both are online! ❤️";
        LockIconComponent = UserCheck;
      }
    } else if (message.unlockAt) {
      isLocked = new Date(message.unlockAt) > new Date();
      lockReason = `Unlocks on ${new Date(message.unlockAt).toLocaleString()}`;
    }

    if (message.deleted) {
      return (
        <span className="italic text-xs flex items-center gap-1.5" style={{ color: 'hsl(var(--sv-text-3))' }}>
          <Trash2 size={12} /> This message was deleted
        </span>
      );
    }

    if (isLocked) {
      return (
        <div className="flex flex-col items-center justify-center py-8 px-5 text-center space-y-4 min-w-[240px]">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center relative shadow-2xl overflow-hidden"
            style={{ background: isOwn ? 'rgba(255,255,255,0.15)' : 'hsl(var(--sv-accent)/0.08)', color: isOwn ? 'white' : 'hsl(var(--sv-accent))' }}>
            <LockIconComponent size={28} className="relative z-10" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-[3px] border-dotted opacity-20 scale-125"
              style={{ borderColor: 'currentColor' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-90">{conditions?.type || 'Temporal'} Paradox</p>
            <p className="text-[10px] font-medium opacity-60 leading-relaxed max-w-[180px] mx-auto uppercase tracking-wider">{lockReason}</p>
          </div>
        </div>
      );
    }

    if (message.type === 'poll') return renderPoll();
    if (message.type === 'code') return renderCode();
    if (message.type === 'image' && message.mediaUrl) return (
      <div className="relative group/img max-w-[260px]">
        <img src={message.mediaUrl} alt="media" className="rounded-xl max-w-full h-auto cursor-pointer" onClick={() => window.open(message.mediaUrl, '_blank')} />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-all rounded-xl flex items-center justify-center">
          <button className="p-2 bg-white/20 rounded-full text-white backdrop-blur-sm"><Download size={16} /></button>
        </div>
      </div>
    );
    if (message.type === 'voice') return (
      <VoicePlayer url={message.mediaUrl} duration={message.duration} isOwn={isOwn} />
    );
    if (message.type === 'file') return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-black/10 border border-white/5 min-w-[200px]">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sv-accent">
          <File size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{message.fileName || message.content}</p>
          <p className="text-[10px] opacity-40 uppercase font-black">{message.fileSize ? (message.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'FILE'}</p>
        </div>
        <button onClick={() => window.open(message.mediaUrl, '_blank')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Download size={18} />
        </button>
      </div>
    );

    return (
      <div className="w-full flex-1">
        {isEditing ? (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <textarea
              autoFocus
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-black/20 text-white rounded-xl p-2 text-sm border-none focus:ring-1 focus:ring-white/40 resize-none outline-none"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 transition-colors">Cancel</button>
              <button onClick={async () => { await editMessage(message.id || message._id, editContent); setIsEditing(false); }}
                className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white text-hsl(var(--sv-accent)) hover:bg-white/90 transition-colors" style={{ color: 'hsl(var(--sv-accent))' }}>Save</button>
            </div>
          </div>
        ) : (
          <>
            {message.forwarded && (
              <div className="flex items-center gap-1 text-xs mb-1" style={{ color: 'hsl(var(--sv-text-3))' }}>
                <Forward size={11} /> Forwarded
              </div>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ wordBreak: 'break-word' }}>{message.content}</p>
          </>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (message.isViewOnce && !isOwn && !message.deleted) {
      return (
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center space-y-3 min-w-[200px] cursor-pointer group/vo"
          onClick={() => {
            if (window.confirm("This is a 'View Once' message. It will disappear after you view it. View now?")) {
              setIsViewingOnce(true);
            }
          }}>
          <div className="w-12 h-12 rounded-full bg-sv-accent/10 flex items-center justify-center text-sv-accent group-hover/vo:scale-110 transition-transform">
            <Eye size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider">One-time view</p>
            <p className="text-[10px] opacity-50 uppercase font-black">Tap to reveal</p>
          </div>
        </div>
      );
    }

    if (isViewingOnce) {
      return (
        <div className="relative group/vo-view shadow-2xl overflow-hidden rounded-xl bg-black/40 p-4 border border-white/10 backdrop-blur-3xl">
          <div className="absolute top-2 right-2 z-10">
            <button onClick={(e) => {
              e.stopPropagation();
              setIsViewingOnce(false);
              handleMarkAsViewed(message._id || message.id);
            }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all">
              <X size={16} />
            </button>
          </div>
          <div className="blur-md hover:blur-none transition-all duration-700 p-2"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
            onContextMenu={(e) => e.preventDefault()}>
            {renderActualContent()}
          </div>
          <div className="mt-4 text-[9px] font-black text-center uppercase tracking-[0.3em] text-white/30">
            Disappearing after you close
          </div>
        </div>
      );
    }

    return renderActualContent();
  };

  const senderName = message.sender?.name || message.name || "";
  const senderAvatar = message.sender?.avatar || null;

  /* ── Own message (right-aligned, no avatar) ── */
  if (isOwn) {
    return (
      <motion.div
        layout
        id={`msg-${message.id || message._id}`}
        className="flex w-full mb-2 px-2 justify-end"
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className="flex flex-col items-end max-w-[72%] relative">
          <div
            className="relative flex items-end gap-2 flex-row-reverse"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-0 right-full mr-2 flex items-center gap-1 z-40"
                >
                  <div className="flex items-center gap-1 rounded-full px-2 py-1.5 shadow-xl"
                    style={{ background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))' }}>
                    <button onClick={() => setShowReactions(p => !p)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      style={{ color: 'hsl(var(--sv-text-2))' }}>
                      <Smile size={15} />
                    </button>
                    <button onClick={() => { onForward && onForward(message); setShowActions(false); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      style={{ color: 'hsl(var(--sv-text-2))' }}>
                      <Forward size={14} />
                    </button>
                    {message.type === 'text' && (Date.now() - new Date(message.createdAt || message.timestamp).getTime() < 3600000) && (
                      <button onClick={() => { setIsEditing(true); setEditContent(message.content); setShowActions(false); }}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        style={{ color: 'hsl(var(--sv-text-2))' }}>
                        <Pencil size={14} />
                      </button>
                    )}
                    <button onClick={() => onReply && onReply(message)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      style={{ color: 'hsl(var(--sv-text-2))' }}>
                      <Reply size={15} />
                    </button>
                    <button onClick={() => { window.dispatchEvent(new CustomEvent('open-task-modal', { detail: { message } })); setShowActions(false); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      title="Convert to Task"
                      style={{ color: 'hsl(var(--sv-text-2))' }}>
                      <ListTodo size={14} />
                    </button>
                    <div className="relative">
                      <button onClick={() => setShowDeleteOptions(p => !p)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        style={{ color: 'hsl(var(--sv-danger)/0.7)' }}>
                        <Trash2 size={15} />
                      </button>
                      <AnimatePresence>
                        {showDeleteOptions && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 4 }}
                            className="absolute bottom-full mb-2 flex flex-col min-w-[150px] overflow-hidden rounded-xl shadow-2xl z-50"
                            style={{ right: 0, background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))' }}>
                            <button onClick={() => { deleteMessage(message.id || message._id, 'me'); setShowDeleteOptions(false); }}
                              className="px-4 py-2.5 text-xs text-left transition-colors hover:bg-black/5"
                              style={{ color: 'hsl(var(--sv-text))' }}>Delete for me</button>
                            {(Date.now() - new Date(message.createdAt || message.timestamp).getTime() < 3600000) && (
                              <button onClick={() => { deleteMessage(message.id || message._id, 'everyone'); setShowDeleteOptions(false); }}
                                className="px-4 py-2.5 text-xs text-left transition-colors hover:bg-black/5 border-t"
                                style={{ color: 'hsl(var(--sv-danger))', borderColor: 'hsl(var(--sv-border)/0.5)' }}>Delete for everyone</button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <AnimatePresence>
                    {showReactions && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute bottom-full mb-2 flex items-center gap-1.5 px-3 py-2 rounded-2xl z-50 shadow-2xl"
                        style={{ right: 0, background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))' }}>
                        {EMOJIS.map(emoji => (
                          <motion.button key={emoji} whileHover={{ scale: 1.4 }} whileTap={{ scale: 0.8 }}
                            className="text-xl cursor-pointer"
                            onClick={(e) => {
                              addReaction(message._id || message.id, emoji);
                              setShowReactions(false);
                              window.dispatchEvent(new CustomEvent('magic-burst', { detail: { x: e.clientX, y: e.clientY, type: emoji === '❤️' ? 'heart' : 'standard' } }));
                            }}>
                            {emoji}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative px-3.5 py-2.5 sv-bubble-own rounded-2xl rounded-br-md text-white shadow-[0_10px_24px_-12px_hsl(var(--sv-accent)/0.65)] max-w-full">
              {message.replyTo && (
                <div
                  onClick={() => {
                    const el = document.getElementById(`msg-${message.replyTo._id || message.replyTo.id}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el?.classList.add('sv-highlight-message');
                    setTimeout(() => el?.classList.remove('sv-highlight-message'), 2000);
                  }}
                  className="mb-2 px-3 py-2 rounded-xl border-l-2 text-xs cursor-pointer transition-opacity hover:opacity-80"
                  style={{ borderColor: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.15)', color: 'rgba(255,255,255,0.75)' }}>
                  <p className="font-semibold text-[11px] mb-0.5" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {message.replyTo.sender?.name || 'User'}
                  </p>
                  <p className="truncate">
                    {message.replyTo.type === 'image' ? '📷 Photo' : message.replyTo.type === 'video' ? '🎥 Video' : message.replyTo.type === 'voice' ? '🎤 Voice' : message.replyTo.type === 'file' ? '📁 File' : message.replyTo.type === 'poll' ? '📊 Poll' : message.replyTo.type === 'code' ? '💻 Code' : message.replyTo.content}
                  </p>
                </div>
              )}
              {renderContent()}
              <div className="flex items-center justify-end gap-1 mt-1.5 select-none" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {message.edited && <span className="text-[10px]">edited</span>}
                <span className="text-[10px] tabular-nums">{time}</span>
                <Ticks status={message.status} />
              </div>
            </div>
          </div>
          {message.reactions?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 justify-end">
              {message.reactions.map((r, i) => (
                <motion.div key={i} whileHover={{ y: -2 }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-sm cursor-default"
                  style={{ background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))' }}>
                  <span>{r.emoji}</span>
                  {r.count > 1 && <span className="text-[10px] font-bold" style={{ color: 'hsl(var(--sv-text-2))' }}>{r.count}</span>}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  /* ── Other user's message (left-aligned, with avatar + name header) ── */
  return (
    <motion.div
      layout
      id={`msg-${message.id || message._id}`}
      className="flex w-full mb-3 px-2 justify-start gap-3"
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Sender Avatar */}
      <div className="flex-shrink-0 self-end">
        <Avatar src={senderAvatar} name={senderName} size={9} />
      </div>

      {/* Content: name+time header + bubble */}
      <div className="flex flex-col items-start max-w-[72%]">
        {/* Sender name + timestamp */}
        {senderName && (
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <span className="text-xs font-semibold" style={{ color: 'hsl(var(--sv-text))' }}>{senderName}</span>
            <span className="text-[10px] tabular-nums" style={{ color: 'hsl(var(--sv-text-3))' }}>{time}</span>
          </div>
        )}

        <div
          className="relative flex items-end gap-2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.12 }}
                className="absolute top-0 left-full ml-2 flex items-center gap-1 z-40"
              >
                <div className="flex items-center gap-1 rounded-full px-2 py-1.5 shadow-xl"
                  style={{ background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))' }}>
                  <button onClick={() => setShowReactions(p => !p)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ color: 'hsl(var(--sv-text-2))' }}>
                    <Smile size={15} />
                  </button>
                  <button onClick={() => { onForward && onForward(message); setShowActions(false); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ color: 'hsl(var(--sv-text-2))' }}>
                    <Forward size={14} />
                  </button>
                  <button onClick={() => onReply && onReply(message)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ color: 'hsl(var(--sv-text-2))' }}>
                    <Reply size={15} />
                  </button>
                  <button onClick={() => { window.dispatchEvent(new CustomEvent('open-task-modal', { detail: { message } })); setShowActions(false); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    title="Convert to Task"
                    style={{ color: 'hsl(var(--sv-text-2))' }}>
                    <ListTodo size={14} />
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowDeleteOptions(p => !p)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      style={{ color: 'hsl(var(--sv-danger)/0.7)' }}>
                      <Trash2 size={15} />
                    </button>
                    <AnimatePresence>
                      {showDeleteOptions && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 4 }}
                          className="absolute bottom-full mb-2 flex flex-col min-w-[150px] overflow-hidden rounded-xl shadow-2xl z-50"
                          style={{ left: 0, background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))' }}>
                          <button onClick={() => { deleteMessage(message.id || message._id, 'me'); setShowDeleteOptions(false); }}
                            className="px-4 py-2.5 text-xs text-left transition-colors hover:bg-white/5"
                            style={{ color: 'hsl(var(--sv-text))' }}>Delete for me</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute bottom-full mb-2 flex items-center gap-1.5 px-3 py-2 rounded-2xl z-50 shadow-2xl"
                      style={{ left: 0, background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))' }}>
                      {EMOJIS.map(emoji => (
                        <motion.button key={emoji} whileHover={{ scale: 1.4 }} whileTap={{ scale: 0.8 }}
                          className="text-xl cursor-pointer"
                          onClick={(e) => {
                            addReaction(message._id || message.id, emoji);
                            setShowReactions(false);
                            window.dispatchEvent(new CustomEvent('magic-burst', { detail: { x: e.clientX, y: e.clientY, type: emoji === '❤️' ? 'heart' : 'standard' } }));
                          }}>
                          {emoji}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative px-3.5 py-2.5 sv-bubble-other rounded-2xl rounded-bl-md max-w-full"
            style={{ color: 'hsl(var(--sv-text))' }}>
            {message.replyTo && (
              <div
                onClick={() => {
                  const el = document.getElementById(`msg-${message.replyTo._id || message.replyTo.id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el?.classList.add('sv-highlight-message');
                  setTimeout(() => el?.classList.remove('sv-highlight-message'), 2000);
                }}
                className="mb-2 px-3 py-2 rounded-xl border-l-2 text-xs cursor-pointer transition-opacity hover:opacity-80"
                style={{ borderColor: 'hsl(var(--sv-accent))', background: 'hsl(var(--sv-surface-3))', color: 'hsl(var(--sv-text-2))' }}>
                <p className="font-semibold text-[11px] mb-0.5" style={{ color: 'hsl(var(--sv-accent))' }}>
                  {message.replyTo.sender?.name || 'User'}
                </p>
                <p className="truncate">
                  {message.replyTo.type === 'image' ? '📷 Photo' : message.replyTo.type === 'video' ? '🎥 Video' : message.replyTo.type === 'voice' ? '🎤 Voice' : message.replyTo.type === 'file' ? '📁 File' : message.replyTo.type === 'poll' ? '📊 Poll' : message.replyTo.type === 'code' ? '💻 Code' : message.replyTo.content}
                </p>
              </div>
            )}
            {renderContent()}
            {!senderName && (
              <div className="flex items-center justify-end gap-1 mt-1.5 select-none" style={{ color: 'hsl(var(--sv-text-3))' }}>
                {message.edited && <span className="text-[10px]">edited</span>}
                <span className="text-[10px] tabular-nums">{time}</span>
              </div>
            )}
          </div>
        </div>

        {message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 justify-start">
            {message.reactions.map((r, i) => (
              <motion.div key={i} whileHover={{ y: -2 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-sm cursor-default"
                style={{ background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))' }}>
                <span>{r.emoji}</span>
                {r.count > 1 && <span className="text-[10px] font-bold" style={{ color: 'hsl(var(--sv-text-2))' }}>{r.count}</span>}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageItem;
