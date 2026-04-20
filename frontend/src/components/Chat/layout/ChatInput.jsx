import React, { useState, useEffect, useRef } from "react";
import { Smile, Plus, Send, Mic, File, X, Reply } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const ChatInput = ({
  replyToMessage,
  setReplyToMessage,
  uploadPreview,
  setUploadPreview,
  showEmojiPicker,
  setShowEmojiPicker,
  handleSend, // This will now accept (content, type, replyTo, extraData)
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
    
    // Pass the message directly to handleSend
    handleSend(e, localMessage);
    setLocalMessage("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    handleStopTyping();
  };

  return (
    <div
      className="px-4 md:px-6 pb-4 md:pb-6 pt-2 flex-shrink-0"
      style={{ background: '#f8fafc', borderTop: '1px solid rgba(0,0,0,0.05)' }}
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        {/* Previews (Reply/Upload) */}
        <AnimatePresence>
          {replyToMessage && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-[hsl(var(--sv-surface))/0.85] border border-sv/70 backdrop-blur-md shadow-sm">
              <Reply size={14} className="text-sv-accent" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-sv-accent uppercase tracking-tighter">Replying to {replyToMessage.name || 'user'}</p>
                 <p className="text-xs truncate text-sv-text-2">{replyToMessage.content}</p>
               </div>
               <button onClick={() => setReplyToMessage(null)} className="p-1 hover:bg-[hsl(var(--sv-surface-3))] rounded-lg transition-colors">
                 <X size={14} />
               </button>
            </motion.div>
          )}
          {uploadPreview && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
               className="flex items-center gap-3 p-3 rounded-2xl bg-[hsl(var(--sv-surface))/0.85] border border-sv/70 backdrop-blur-md shadow-sm">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-sv/70">
                {uploadPreview.type.startsWith("image/")
                  ? <img src={uploadPreview.preview} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--sv-surface-2))]"><File size={16} /></div>
                }
              </div>
              <div className="flex-1 truncate">
                <p className="text-xs font-semibold truncate text-sv-text">{uploadPreview.name}</p>
                <p className="text-[10px] uppercase font-black text-sv-text-3">Ready to upload</p>
              </div>
              <button onClick={() => setUploadPreview(null)} className="p-1 hover:bg-[hsl(var(--sv-surface-3))] rounded-lg transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Container */}
        <div className="flex items-center bg-white border border-black/5 rounded-full px-2 py-2 pr-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative">
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 text-gray-400 hover:text-black">
            <Plus size={22} className="rotate-45" />
          </button>

          <form onSubmit={onSubmit} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={localMessage}
              onChange={onInputChange}
              placeholder="Write a Message"
              className="flex-1 bg-transparent border-none outline-none text-[15px] py-2 px-2 text-black placeholder:text-gray-400 font-outfit"
            />
            <div className="flex items-center gap-1">
              {isRecording ? (
                <div className="flex items-center gap-3 pr-2">
                  <span className="text-xs font-bold tabular-nums text-red-500 animate-pulse">{fmtDuration(recordingDuration)}</span>
                  <button type="button" onClick={() => stopRecording(true)} className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg">
                    <Send size={18} />
                  </button>
                </div>
              ) : (localMessage.trim() || uploadPreview) ? (
                  <button type="submit" className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white bg-black shadow-lg transition-transform hover:scale-[1.03]">
                    <Send size={18} />
                  </button>
                ) : (
                  <button type="button" onClick={startRecording} className="w-[42px] h-[42px] rounded-full bg-black flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                    <Mic size={18} />
                  </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
    </div>
  );
};

export default React.memo(ChatInput);
