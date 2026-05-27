import React, { useState, useEffect, useRef } from "react";
import { Smile, Plus, Send, Mic, File, X, Reply, Camera, Paperclip } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import EmojiPicker from "../EmojiPicker";

const ChatInput = ({
  replyToMessage,
  setReplyToMessage,
  uploadPreview,
  setUploadPreview,
  showEmojiPicker,
  setShowEmojiPicker,
  handleSend,
  fileInputRef,
  handleFileSelect,
  isRecording,
  startRecording,
  stopRecording,
  recordingDuration,
  fmtDuration,
  handleTyping,
  handleStopTyping,
}) => {
  const [localMessage, setLocalMessage] = useState("");
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const onInputChange = (e) => {
    const val = e.target.value;
    setLocalMessage(val);
    handleTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const onSubmit = (e) => {
    e?.preventDefault();
    if (!localMessage.trim() && !uploadPreview) return;
    handleSend(e, localMessage);
    setLocalMessage("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    handleStopTyping();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <div
      className="px-4 md:px-5 pb-4 md:pb-5 pt-3 flex-shrink-0"
      style={{ background: 'hsl(var(--sv-surface-2))', borderTop: '1px solid hsl(var(--sv-border))' }}
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        {/* Reply / Upload preview */}
        <AnimatePresence>
          {replyToMessage && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ background: 'hsl(var(--sv-surface-3))', borderColor: 'hsl(var(--sv-accent)/0.3)', borderLeft: '3px solid hsl(var(--sv-accent))' }}
            >
              <Reply size={14} style={{ color: 'hsl(var(--sv-accent))' }} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'hsl(var(--sv-accent))' }}>
                  Replying to {replyToMessage.name || replyToMessage.sender?.name || 'user'}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'hsl(var(--sv-text-2))' }}>{replyToMessage.content}</p>
              </div>
              <button
                onClick={() => setReplyToMessage(null)}
                className="p-1 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'hsl(var(--sv-text-3))' }}
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
          {uploadPreview && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ background: 'hsl(var(--sv-surface-3))', borderColor: 'hsl(var(--sv-border))' }}
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden border" style={{ borderColor: 'hsl(var(--sv-border))' }}>
                {uploadPreview.type.startsWith("image/")
                  ? <img src={uploadPreview.preview} className="w-full h-full object-cover" alt="preview" />
                  : <div className="w-full h-full flex items-center justify-center" style={{ background: 'hsl(var(--sv-surface-2))' }}>
                      <File size={16} style={{ color: 'hsl(var(--sv-text-3))' }} />
                    </div>
                }
              </div>
              <div className="flex-1 truncate">
                <p className="text-xs font-semibold truncate" style={{ color: 'hsl(var(--sv-text))' }}>{uploadPreview.name}</p>
                <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color: 'hsl(var(--sv-text-3))' }}>Ready to upload</p>
              </div>
              <button
                onClick={() => setUploadPreview(null)}
                className="p-1 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'hsl(var(--sv-text-3))' }}
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Row */}
        <div
          className="flex items-center gap-2 rounded-2xl px-3 py-2 relative transition-all"
          style={{
            background: 'hsl(var(--sv-surface-3))',
            border: '1px solid hsl(var(--sv-border))',
          }}
          onFocus={() => {}}
        >
          {/* Attach */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
            style={{ color: 'hsl(var(--sv-text-3))', background: 'hsl(var(--sv-surface-2))' }}
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>

          {/* Text input / recording */}
          <form onSubmit={onSubmit} className="flex-1 flex items-center gap-2 min-w-0">
            {isRecording ? (
              <div className="flex-1 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-bold tabular-nums" style={{ color: '#f87171' }}>
                  {fmtDuration(recordingDuration)}
                </span>
                <span className="text-xs" style={{ color: 'hsl(var(--sv-text-3))' }}>Recording…</span>
              </div>
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={localMessage}
                onChange={onInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type something..."
                className="flex-1 bg-transparent border-none outline-none text-sm py-2 font-medium placeholder:font-normal"
                style={{
                  color: 'hsl(var(--sv-text))',
                  caretColor: 'hsl(var(--sv-accent))',
                }}
              />
            )}

            {/* Emoji */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                color: showEmojiPicker ? 'hsl(var(--sv-accent))' : 'hsl(var(--sv-text-3))',
                background: showEmojiPicker ? 'hsl(var(--sv-accent)/0.15)' : 'transparent',
              }}
            >
              <Smile size={19} />
            </button>

            {/* Send / Record / Stop */}
            {isRecording ? (
              <button
                type="button"
                onClick={() => stopRecording(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-all hover:scale-110"
                style={{ background: '#ef4444' }}
              >
                <Send size={16} />
              </button>
            ) : (localMessage.trim() || uploadPreview) ? (
              <button
                type="submit"
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-all hover:scale-110 active:scale-95"
                style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))', boxShadow: '0 4px 16px -4px hsl(var(--sv-accent)/0.5)' }}
              >
                <Send size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                style={{ color: 'hsl(var(--sv-text-3))', background: 'hsl(var(--sv-surface-2))' }}
              >
                <Mic size={18} />
              </button>
            )}
          </form>

          {/* Emoji Picker Overlay */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute bottom-full mb-3 left-0 z-[100]"
              >
                <EmojiPicker onEmojiSelect={(emoji) => {
                  // handled within ChatInput state
                  const input = inputRef.current;
                  if (input) {
                    const start = input.selectionStart;
                    const end = input.selectionEnd;
                    const newVal = localMessage.slice(0, start) + emoji + localMessage.slice(end);
                    setLocalMessage(newVal);
                    setTimeout(() => {
                      input.focus();
                      input.setSelectionRange(start + emoji.length, start + emoji.length);
                    }, 0);
                  }
                }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
    </div>
  );
};

export default React.memo(ChatInput);
