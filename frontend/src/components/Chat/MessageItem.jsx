import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Reply, Trash2, Smile, Check, CheckCheck, Clock, Download, BarChart2, Mic, Forward, Code as CodeIcon } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChat } from "../../context/ChatContext";

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

const MessageItem = ({ message, isOwn, onReply }) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const leaveTimer = useRef(null);
  const { votePoll, addReaction, userId } = useChat();

  const time = message.createdAt || message.timestamp
    ? new Date(message.createdAt || message.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "";

  /* ── Mouse out with small delay so submenu stays accessible ── */
  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => {
      setShowActions(false);
      setShowReactions(false);
    }, 200);
  };
  const handleMouseEnter = () => {
    clearTimeout(leaveTimer.current);
    setShowActions(true);
  };

  /* ── Poll ── */
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

  /* ── Code block ── */
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

  /* ── Bubble content ── */
  const renderContent = () => {
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
    /* text/file/default */
    return (
      <div>
        {message.deleted ? (
          <span className="italic text-xs flex items-center gap-1.5" style={{ color: 'hsl(var(--sv-text-3))' }}>
            <Trash2 size={12} /> This message was deleted
          </span>
        ) : (
          <>
            {message.forwarded && (
              <div className="flex items-center gap-1 text-xs mb-1" style={{ color: 'hsl(var(--sv-text-3))' }}>
                <Forward size={11} /> Forwarded
              </div>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ wordBreak: 'break-word' }}>
              {message.content}
            </p>
          </>
        )}
      </div>
    );
  };

  return (
    <motion.div
      layout
      className={`flex w-full mb-1 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[72%] relative`}>

        {/* ── Hover action bar ── */}
        <div
          className={`relative flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Action buttons (appear on hover) */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.12 }}
                className={`absolute top-0 ${isOwn ? 'right-full mr-2' : 'left-full ml-2'} flex items-center gap-1 z-40`}
              >
                <div className="flex items-center gap-1 rounded-full px-2 py-1.5 shadow-xl"
                  style={{ background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))' }}>
                  {/* Emoji react */}
                  <button onClick={() => setShowReactions(p => !p)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ color: 'hsl(var(--sv-text-2))' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--sv-surface-2))'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Smile size={15} />
                  </button>
                  {/* Reply */}
                  <button onClick={() => onReply && onReply(message)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ color: 'hsl(var(--sv-text-2))' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--sv-surface-2))'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Reply size={15} />
                  </button>
                  {/* Delete (own only) */}
                  {isOwn && (
                    <button className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      style={{ color: 'hsl(var(--sv-danger)/0.7)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--sv-danger)/0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {/* Emoji picker sub-panel */}
                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute bottom-full mb-2 flex items-center gap-1.5 px-3 py-2 rounded-2xl z-50 shadow-2xl"
                      style={{ [isOwn ? 'right' : 'left']: 0, background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))' }}>
                      {EMOJIS.map(emoji => (
                        <motion.button key={emoji} whileHover={{ scale: 1.4 }} whileTap={{ scale: 0.8 }}
                          className="text-xl cursor-pointer"
                          onClick={() => { addReaction(message._id || message.id, emoji); setShowReactions(false); }}>
                          {emoji}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── THE BUBBLE ── */}
          <div className={`relative rounded-2xl px-3.5 py-2.5 shadow-md ${isOwn
            ? 'rounded-br-sm text-white'
            : 'rounded-bl-sm'
            }`}
            style={isOwn
              ? { background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))', boxShadow: '0 4px 16px -4px hsl(var(--sv-accent)/0.35)', maxWidth: '100%' }
              : { background: 'hsl(var(--sv-surface-2))', border: '1px solid hsl(var(--sv-border)/0.6)', color: 'hsl(var(--sv-text))', maxWidth: '100%' }
            }>

            {/* Group sender name (left side only for groups) */}
            {!isOwn && message.name && (
              <p className="text-xs font-semibold mb-1" style={{ color: 'hsl(var(--sv-accent))' }}>{message.name}</p>
            )}

            {/* Reply context */}
            {message.replyTo && (
              <div className="mb-2 px-3 py-2 rounded-xl border-l-2 text-xs cursor-pointer"
                style={{ borderColor: 'hsl(var(--sv-accent))', background: isOwn ? 'rgba(0,0,0,0.15)' : 'hsl(var(--sv-surface-3))', color: isOwn ? 'rgba(255,255,255,0.75)' : 'hsl(var(--sv-text-2))' }}>
                <p className="font-semibold text-[11px] mb-0.5" style={{ color: 'hsl(var(--sv-accent))' }}>
                  {message.replyTo.sender?.name || 'Message'}
                </p>
                <p className="truncate">{message.replyTo.content}</p>
              </div>
            )}

            {/* Main content */}
            {renderContent()}

            {/* Time + tick row */}
            <div className={`flex items-center justify-end gap-1 mt-1.5 select-none`}
              style={{ color: isOwn ? 'rgba(255,255,255,0.55)' : 'hsl(var(--sv-text-3))' }}>
              {message.edited && <span className="text-[10px]">edited</span>}
              <span className="text-[10px] tabular-nums">{time}</span>
              {isOwn && <Ticks status={message.status} />}
            </div>
          </div>
        </div>

        {/* Reactions row */}
        {message.reactions?.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
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